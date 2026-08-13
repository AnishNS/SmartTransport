// Driver management service.
//
// Admin-created drivers. There is NO public driver signup; the Admin creates
// the account through the backend, which calls the GoTrue Admin API with the
// service_role key:
//
//   Admin UI -> backend -> auth.admin.createUser() -> auth.users
//                                                     -> public.users (trigger)
//                                                     -> backend updates role -> public.users
//                                                     -> backend inserts row  -> public.drivers
//
// The driver profile (public.users + public.drivers) holds only non-sensitive
// information. Passwords are handled exclusively by Supabase Auth (GoTrue):
// they are sent once from the Admin form, used to create the auth user, and
// never stored in or returned from any public table.
//
// Deactivation (soft-delete): the admin flow sets drivers.is_active = false
// (see database/driver_deactivation.sql), unassigns the driver's vehicle and
// bans the Supabase Auth user. Hard-deleting is avoided because vehicles and
// trips reference drivers(id) with NO ACTION.

const supabaseAdmin = require("../config/supabaseAdmin");
const { createNotification } = require("./notificationService");

// The `is_active` column ships with database/driver_deactivation.sql. The
// backend tolerates it being absent (migration not yet run): it probes for the
// column once per process and then builds every select/insert accordingly, so
// driver management keeps working with or without the migration applied.
const DRIVER_FIELDS_CORE =
  "id, user_id, license_number, availability_status, created_at";
const DRIVER_FIELDS_WITH_ACTIVE = `${DRIVER_FIELDS_CORE}, is_active`;

let isActiveProbe = null;
async function hasIsActiveColumn() {
  if (isActiveProbe === null) {
    try {
      const { error } = await supabaseAdmin
        .from("drivers")
        .select("is_active")
        .limit(1);
      isActiveProbe = !(
        error &&
        (error.code === "42703" || /does not exist/i.test(error.message || ""))
      );
    } catch {
      isActiveProbe = false;
    }
  }
  return isActiveProbe;
}

async function driverSelect(includeUserVehicle = true) {
  const core = (await hasIsActiveColumn())
    ? DRIVER_FIELDS_WITH_ACTIVE
    : DRIVER_FIELDS_CORE;
  return includeUserVehicle
    ? `${core}, users(name, email, phone, role), vehicles(id, vehicle_number, vehicle_type, capacity, status)`
    : core;
}

// Normalize an email for comparison against the unique public.users.email.
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error(
      "Backend service-role client is not configured. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env."
    );
  }
  return supabaseAdmin;
}

// Builds the combined driver record (profile + driver row + first assigned
// vehicle, if any) returned to the UI.
function buildDriverRecord(row) {
  const user = row.users || {};
  const vehicles = Array.isArray(row.vehicles) ? row.vehicles : [];
  return {
    id: row.id,
    user_id: row.user_id,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "",
    license_number: row.license_number || "",
    availability_status: row.availability_status || "available",
    is_active: row.is_active !== false,
    vehicle: vehicles[0] || null,
    created_at: row.created_at,
  };
}

async function listDrivers() {
  const admin = requireAdminClient();

  const { data, error } = await admin
    .from("drivers")
    .select(await driverSelect())
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load drivers: ${error.message}`);
  }

  return (data || []).map(buildDriverRecord);
}

async function getDriverById(driverId) {
  const admin = requireAdminClient();

  const { data, error } = await admin
    .from("drivers")
    .select(await driverSelect())
    .eq("id", driverId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load driver: ${error.message}`);
  }

  return data ? buildDriverRecord(data) : null;
}

// Loads the driver record belonging to a specific user id. Used by the
// self-scoped /api/driver/profile endpoint: the caller's authenticated user id
// is resolved first, then only that user's own driver row is returned.
async function getDriverByUserId(userId) {
  const admin = requireAdminClient();
  if (!userId) return null;

  const { data, error } = await admin
    .from("drivers")
    .select(await driverSelect())
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load driver profile: ${error.message}`);
  }

  return data ? buildDriverRecord(data) : null;
}

// Creates a real Supabase Auth driver account and its driver profile.
//
// Steps:
//   1. Validate the email is not already in public.users.
//   2. Create the auth user (auth.users) via GoTrue Admin API with
//      email_confirm: true so the driver can sign in immediately without
//      clicking a verification link. The auth.users insert fires the
//      handle_new_user trigger, which pre-creates a public.users profile with
//      role = 'passenger' (the trigger is intentionally role-locked).
//   3. Promote that profile to role = 'driver' and write name/phone.
//   4. Insert the driver row (license number, availability status) linked to
//      the Auth user id.
async function createDriver({
  name,
  email,
  phone,
  licenseNumber,
  availabilityStatus,
  password,
}) {
  const admin = requireAdminClient();

  const normalizedEmail = normalizeEmail(email);
  const driverName = String(name || "").trim();
  const driverPhone = String(phone || "").trim();
  const driverLicense = String(licenseNumber || "").trim();
  const driverStatus = ["available", "unavailable"].includes(availabilityStatus)
    ? availabilityStatus
    : "available";

  if (!driverName) throw new Error("Driver name is required.");
  if (!normalizedEmail) throw new Error("Driver email is required.");
  if (!driverLicense) throw new Error("License number is required.");
  if (!password || String(password).length < 6) {
    throw new Error("Temporary password must be at least 6 characters.");
  }

  // Reject emails that already exist in the app (prevents a driver profile
  // from hijacking an existing passenger/admin email).
  const { data: existingProfile } = await admin
    .from("users")
    .select("id, role, email")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingProfile) {
    throw new Error("An account with this email already exists.");
  }

  // Step 2: create the Supabase Auth account.
  const { data: createResult, error: createError } =
    await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: driverName,
        phone: driverPhone,
        role: "driver",
      },
    });

  if (createError) {
    if (
      createError.code === "user_already_exists" ||
      /already registered/i.test(createError.message)
    ) {
      throw new Error("An account with this email already exists.");
    }
    throw new Error(`Could not create the auth account: ${createError.message}`);
  }

  const authUser = createResult?.user;

  if (!authUser?.id) {
    throw new Error("Supabase did not return a user id for the new driver.");
  }

  // Step 3: promote the trigger-created profile to role = 'driver'.
  const { error: profileError } = await admin
    .from("users")
    .update({
      name: driverName,
      email: normalizedEmail,
      phone: driverPhone,
      role: "driver",
    })
    .eq("id", authUser.id);

  if (profileError) {
    throw new Error(`Could not update the driver profile: ${profileError.message}`);
  }

  // Step 4: create the driver row linked to the Auth user id.
  const driverInsert = {
    user_id: authUser.id,
    license_number: driverLicense,
    availability_status: driverStatus,
  };
  if (await hasIsActiveColumn()) {
    driverInsert.is_active = true;
  }

  const { data: driverRow, error: driverError } = await admin
    .from("drivers")
    .insert(driverInsert)
    .select(await driverSelect(false))
    .single();

  if (driverError) {
    if (driverError.code === "23505") {
      throw new Error(
        "This license number is already assigned to another driver."
      );
    }
    throw new Error(`Could not create the driver profile: ${driverError.message}`);
  }

  return buildDriverRecord({
    ...driverRow,
    users: {
      name: driverName,
      email: normalizedEmail,
      phone: driverPhone,
      role: "driver",
    },
    vehicles: [],
  });
}

// Soft-deletes a driver: marks the row inactive, unassigns their vehicle and
// bans the Supabase Auth account so the driver can no longer sign in.
//
// Auth banning is best-effort: profile deactivation and vehicle release always
// happen even if the GoTrue ban call fails (the UI treats is_active = false as
// deactivated regardless).
async function deactivateDriver(driverId) {
  const admin = requireAdminClient();
  const driver = await getDriverById(driverId);

  if (!driver) throw new Error("Driver not found.");
  if (driver.is_active === false) {
    throw new Error("This driver is already deactivated.");
  }

  if (!(await hasIsActiveColumn())) {
    throw new Error(
      "Driver deactivation is not available yet. Apply database/driver_deactivation.sql in the Supabase SQL editor first."
    );
  }

  const { data: updated, error: updateError } = await admin
    .from("drivers")
    .update({ is_active: false, availability_status: "unavailable" })
    .eq("id", driverId)
    .select(await driverSelect(false))
    .single();

  if (updateError) {
    throw new Error(`Could not deactivate the driver: ${updateError.message}`);
  }

  // Release any vehicle assigned to this driver.
  const { error: vehicleError } = await admin
    .from("vehicles")
    .update({ driver_id: null })
    .eq("driver_id", driverId);

  if (vehicleError) {
    throw new Error(`Could not release the driver's vehicle: ${vehicleError.message}`);
  }

  // Best-effort: prevent the deactivated driver from authenticating again.
  if (driver.user_id) {
    try {
      await admin.auth.admin.banUser(driver.user_id);
    } catch (banError) {
      console.warn("[driverService] could not ban auth user:", banError.message);
    }
  }

  return buildDriverRecord({
    ...updated,
    users: { name: driver.name, email: driver.email, phone: driver.phone, role: "driver" },
    vehicles: [],
  });
}

// Re-activates a soft-deleted driver and un-bans the Supabase Auth account.
async function reactivateDriver(driverId) {
  const admin = requireAdminClient();
  const driver = await getDriverById(driverId);

  if (!driver) throw new Error("Driver not found.");
  if (driver.is_active !== false) {
    throw new Error("This driver is already active.");
  }

  if (!(await hasIsActiveColumn())) {
    throw new Error(
      "Driver reactivation is not available yet. Apply database/driver_deactivation.sql in the Supabase SQL editor first."
    );
  }

  const { data: updated, error: updateError } = await admin
    .from("drivers")
    .update({ is_active: true, availability_status: "available" })
    .eq("id", driverId)
    .select(await driverSelect(false))
    .single();

  if (updateError) {
    throw new Error(`Could not reactivate the driver: ${updateError.message}`);
  }

  if (driver.user_id) {
    try {
      await admin.auth.admin.unbanUser(driver.user_id);
    } catch (unbanError) {
      console.warn("[driverService] could not unban auth user:", unbanError.message);
    }
  }

  return buildDriverRecord({
    ...updated,
    users: { name: driver.name, email: driver.email, phone: driver.phone, role: "driver" },
    vehicles: driver.vehicle ? [driver.vehicle] : [],
  });
}

// Lists fleet vehicles. When `available` is true only active, unassigned
// vehicles are returned (the pool the Admin can assign to a driver).
async function listVehicles({ available = false } = {}) {
  const admin = requireAdminClient();

  let query = admin
    .from("vehicles")
    .select("id, vehicle_number, vehicle_type, capacity, status, driver_id, drivers(id, users(name, email))");

  if (available) {
    query = query.is("driver_id", null).eq("status", "active");
  }

  query = query.order("vehicle_number", { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Could not load vehicles: ${error.message}`);
  }

  return (data || []).map((row) => ({
    id: row.id,
    vehicle_number: row.vehicle_number,
    vehicle_type: row.vehicle_type,
    capacity: row.capacity,
    status: row.status,
    driver_id: row.driver_id,
    driver_name: row.drivers?.users?.name || null,
  }));
}

// Normalizes the vehicle `status` to the values the fleet already uses:
// 'active' (assignable), 'maintenance', 'inactive' (removed from service).
function normalizeVehicleStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  return ["active", "maintenance", "inactive"].includes(value) ? value : "active";
}

// Creates a vehicle in the fleet. The unique vehicle_number is enforced by the
// database (vehicles.vehicle_number unique); a duplicate surfaces as a friendly
// error. New vehicles default to status 'active' unless the caller passes one.
async function createVehicle({
  vehicleNumber,
  vehicleType,
  capacity,
  status,
}) {
  const admin = requireAdminClient();

  const number = String(vehicleNumber || "").trim().toUpperCase();
  const type = String(vehicleType || "").trim();
  const parsedCapacity =
    capacity === "" || capacity == null ? null : Number(capacity);

  if (!number) {
    throw new Error("Vehicle number is required.");
  }
  if (parsedCapacity != null && (!Number.isFinite(parsedCapacity) || parsedCapacity < 1)) {
    throw new Error("Capacity must be a positive number.");
  }

  const insert = {
    vehicle_number: number,
    vehicle_type: type || null,
    capacity: parsedCapacity,
    status: normalizeVehicleStatus(status),
  };

  const { data, error } = await admin
    .from("vehicles")
    .insert(insert)
    .select("id, vehicle_number, vehicle_type, capacity, status, driver_id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`A vehicle with number ${number} already exists.`);
    }
    throw new Error(`Could not create the vehicle: ${error.message}`);
  }

  return { ...data, driver_name: null };
}

// Updates editable fleet fields (type, capacity, status). The vehicle number is
// the natural key for staff identification and is left immovable here.
async function updateVehicle(vehicleId, { vehicleType, capacity, status }) {
  const admin = requireAdminClient();

  const parsedCapacity =
    capacity === "" || capacity == null ? null : Number(capacity);

  if (parsedCapacity != null && (!Number.isFinite(parsedCapacity) || parsedCapacity < 1)) {
    throw new Error("Capacity must be a positive number.");
  }

  const update = {};
  if (vehicleType !== undefined) {
    update.vehicle_type = String(vehicleType || "").trim() || null;
  }
  if (capacity !== undefined) {
    update.capacity = parsedCapacity;
  }
  if (status !== undefined) {
    update.status = normalizeVehicleStatus(status);
  }

  const { data, error } = await admin
    .from("vehicles")
    .update(update)
    .eq("id", vehicleId)
    .select("id, vehicle_number, vehicle_type, capacity, status, driver_id, drivers(id, users(name))")
    .single();

  if (error) {
    throw new Error(`Could not update the vehicle: ${error.message}`);
  }

  return {
    id: data.id,
    vehicle_number: data.vehicle_number,
    vehicle_type: data.vehicle_type,
    capacity: data.capacity,
    status: data.status,
    driver_id: data.driver_id,
    driver_name: data.drivers?.users?.name || null,
  };
}

// Soft-deactivates a vehicle: status becomes 'inactive' and any current driver
// assignment is released so the vehicle no longer appears in the selectable
// pool for assignment. Historical trips/locations stay intact.
async function deactivateVehicle(vehicleId) {
  const admin = requireAdminClient();

  const { data: current } = await admin
    .from("vehicles")
    .select("id, vehicle_number, status")
    .eq("id", vehicleId)
    .maybeSingle();

  if (!current) {
    throw new Error("Vehicle not found.");
  }
  if (current.status === "inactive") {
    throw new Error(`Vehicle ${current.vehicle_number} is already inactive.`);
  }

  const { data, error } = await admin
    .from("vehicles")
    .update({ status: "inactive", driver_id: null })
    .eq("id", vehicleId)
    .select("id, vehicle_number, vehicle_type, capacity, status, driver_id")
    .single();

  if (error) {
    throw new Error(`Could not deactivate the vehicle: ${error.message}`);
  }

  return { ...data, driver_name: null };
}

// Brings a deactivated vehicle back to 'active' so it can be assigned again.
async function reactivateVehicle(vehicleId) {
  const admin = requireAdminClient();

  const { data: current } = await admin
    .from("vehicles")
    .select("id, vehicle_number, status")
    .eq("id", vehicleId)
    .maybeSingle();

  if (!current) {
    throw new Error("Vehicle not found.");
  }
  if (current.status !== "inactive") {
    throw new Error(`Vehicle ${current.vehicle_number} is already active.`);
  }

  const { data, error } = await admin
    .from("vehicles")
    .update({ status: "active" })
    .eq("id", vehicleId)
    .select("id, vehicle_number, vehicle_type, capacity, status, driver_id")
    .single();

  if (error) {
    throw new Error(`Could not reactivate the vehicle: ${error.message}`);
  }

  return { ...data, driver_name: null };
}

// Hard-deletes a vehicle ONLY when nothing references it (no trips, no location
// history). Deleting a vehicle that has historical records would violate the
// FK constraints (vehicles.id is referenced by trips.vehicle_id and
// vehicle_locations.vehicle_id), so the admin is steered to deactivation instead.
async function deleteVehicle(vehicleId) {
  const admin = requireAdminClient();

  const { data: current } = await admin
    .from("vehicles")
    .select("id, vehicle_number, status")
    .eq("id", vehicleId)
    .maybeSingle();

  if (!current) {
    throw new Error("Vehicle not found.");
  }

  const { count: tripCount } = await admin
    .from("trips")
    .select("id", { count: "exact", head: true })
    .eq("vehicle_id", vehicleId);
  const { count: locationCount } = await admin
    .from("vehicle_locations")
    .select("id", { count: "exact", head: true })
    .eq("vehicle_id", vehicleId);

  if (tripCount > 0 || locationCount > 0) {
    throw new Error(
      `Vehicle ${current.vehicle_number} has trip or location history and cannot be deleted. Deactivate it instead to keep historical records intact.`
    );
  }

  const { error } = await admin.from("vehicles").delete().eq("id", vehicleId);
  if (error) {
    throw new Error(`Could not delete the vehicle: ${error.message}`);
  }

  return { id: vehicleId, vehicle_number: current.vehicle_number };
}

// Assigns a vehicle to a driver (exclusive one-to-one in this flow).
//
// The vehicle's driver_id FK already guarantees a vehicle can only belong to
// one driver. If the driver already owned another vehicle it is released first
// so each driver keeps a single assigned vehicle.
async function assignVehicle(driverId, vehicleId) {
  const admin = requireAdminClient();
  const driver = await getDriverById(driverId);

  if (!driver) throw new Error("Driver not found.");
  if (driver.is_active === false) {
    throw new Error("You cannot assign a vehicle to a deactivated driver.");
  }

  if (!vehicleId) throw new Error("Please select a vehicle.");

  const { data: vehicle, error: vehicleError } = await admin
    .from("vehicles")
    .select("id, vehicle_number, status, driver_id")
    .eq("id", vehicleId)
    .maybeSingle();

  if (vehicleError || !vehicle) {
    throw new Error("Vehicle not found.");
  }

  if (vehicle.status === "inactive") {
    throw new Error("This vehicle is inactive and cannot be assigned.");
  }

  if (vehicle.driver_id && vehicle.driver_id !== driverId) {
    throw new Error(
      `${vehicle.vehicle_number} is already assigned to another driver.`
    );
  }

  // Release any other vehicle the driver currently owns.
  const { error: releaseError } = await admin
    .from("vehicles")
    .update({ driver_id: null })
    .eq("driver_id", driverId)
    .neq("id", vehicleId);

  if (releaseError) {
    throw new Error(`Could not update vehicle assignment: ${releaseError.message}`);
  }

  const { data: assigned, error: assignError } = await admin
    .from("vehicles")
    .update({ driver_id: driverId })
    .eq("id", vehicleId)
    .select("id, vehicle_number, vehicle_type, capacity, status")
    .single();

  if (assignError) {
    throw new Error(`Could not assign the vehicle: ${assignError.message}`);
  }

  // Targeted notification for the driver (PART 14/15). Recipient is the
  // resolved driver's user_id — ONLY that driver gets notified. Failure to
  // persist the notification never rolls back a successful assignment.
  if (driver.user_id) {
    try {
      await createNotification(driver.user_id, {
        title: "Vehicle Assigned",
        message: `Vehicle ${assigned.vehicle_number} has been assigned to you.`,
        type: "info",
      });
    } catch (notifError) {
      console.warn(
        "[driverService] could not notify driver of assignment:",
        notifError.message
      );
    }
  }

  return {
    id: assigned.id,
    vehicle_number: assigned.vehicle_number,
    vehicle_type: assigned.vehicle_type,
    capacity: assigned.capacity,
    status: assigned.status,
  };
}

// Releases whatever vehicle(s) the driver currently owns.
async function unassignVehicle(driverId) {
  const admin = requireAdminClient();
  const driver = await getDriverById(driverId);

  if (!driver) throw new Error("Driver not found.");

  const { error } = await admin
    .from("vehicles")
    .update({ driver_id: null })
    .eq("driver_id", driverId);

  if (error) {
    throw new Error(`Could not unassign the vehicle: ${error.message}`);
  }

  return getDriverById(driverId);
}

module.exports = {
  listDrivers,
  getDriverById,
  getDriverByUserId,
  createDriver,
  deactivateDriver,
  reactivateDriver,
  listVehicles,
  createVehicle,
  updateVehicle,
  deactivateVehicle,
  reactivateVehicle,
  deleteVehicle,
  assignVehicle,
  unassignVehicle,
};