// Driver trip service.
//
// Real trip lifecycle backed by the existing `trips` table. Every function is
// scoped to the *authenticated* driver, resolved server-side from the caller's
// Supabase user id — never from anything the client claims. A driver can only
// start/end a trip for their own assigned vehicle.
//
// Route assignment is not modelled in the database yet (the Driver UI still
// uses synthetic route data), so route_id is optional and only stored when it
// references an existing routes row.

const supabaseAdmin = require("../config/supabaseAdmin");
const { getDriverByUserId } = require("./driverService");

const ACTIVE_TRIP_STATUSES = ["in_progress", "paused"];

function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error(
      "Backend service-role client is not configured. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env."
    );
  }
  return supabaseAdmin;
}

// Resolves the caller's driver record + assigned vehicle. Returns
// { driver, vehicle } where vehicle may be null.
async function resolveDriverContext(userId) {
  if (!userId) throw new Error("Authentication required.");
  const driver = await getDriverByUserId(userId);
  if (!driver) throw new Error("Driver profile not found.");
  return { driver, vehicle: driver.vehicle || null };
}

function buildTripRow(row) {
  return {
    id: row.id,
    vehicle_id: row.vehicle_id,
    driver_id: row.driver_id,
    route_id: row.route_id || null,
    route_name: row.routes?.route_name || null,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
  };
}

async function routeExists(routeId) {
  if (!routeId) return true;
  const { data } = await supabaseAdmin
    .from("routes")
    .select("id, route_name")
    .eq("id", routeId)
    .maybeSingle();
  return Boolean(data);
}

// Returns the driver's currently active trip (if any) together with the
// resolved route_name. A driver can have at most one active trip conceptually;
// the query picks the newest one to stay safe.
async function findCurrentTrip(userId) {
  const admin = requireAdminClient();
  const { driver, vehicle } = await resolveDriverContext(userId);
  if (!vehicle) return { driver, vehicle, trip: null };

  const { data, error } = await admin
    .from("trips")
    .select("*, routes(route_name)")
    .eq("driver_id", driver.id)
    .eq("vehicle_id", vehicle.id)
    .in("status", ACTIVE_TRIP_STATUSES)
    .is("end_time", null)
    .order("start_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load the current trip: ${error.message}`);
  }

  return { driver, vehicle, trip: data ? buildTripRow(data) : null };
}

async function startTrip(userId, { routeId } = {}) {
  const admin = requireAdminClient();
  const { driver, vehicle, trip } = await findCurrentTrip(userId);

  if (!vehicle) {
    throw new Error("No vehicle is assigned to you yet.");
  }
  if (trip) {
    return trip; // Already running — return the current trip unchanged.
  }
  if (!(await routeExists(routeId))) {
    throw new Error("The selected route was not found.");
  }

  const { data, error } = await admin
    .from("trips")
    .insert({
      vehicle_id: vehicle.id,
      driver_id: driver.id,
      route_id: routeId || null,
      start_time: new Date().toISOString(),
      status: "in_progress",
    })
    .select("*, routes(route_name)")
    .single();

  if (error) {
    throw new Error(`Could not start the trip: ${error.message}`);
  }

  return buildTripRow(data);
}

async function endTrip(userId, tripId) {
  const admin = requireAdminClient();
  const current = await findCurrentTrip(userId);

  if (!current.trip) {
    throw new Error("You do not have an active trip.");
  }
  if (current.trip.id !== tripId) {
    throw new Error("This trip does not belong to your active trip.");
  }

  const { data, error } = await admin
    .from("trips")
    .update({ status: "completed", end_time: new Date().toISOString() })
    .eq("id", tripId)
    .eq("driver_id", current.driver.id)
    .select("*, routes(route_name)")
    .single();

  if (error) {
    throw new Error(`Could not end the trip: ${error.message}`);
  }
  if (data?.routes && typeof data.routes === "object") {
    // Normalize a joined null row propagated by PostgREST.
    data.routes = data.routes.route_name ? data.routes : null;
  }

  return {
    trip: buildTripRow(data),
    vehicle_id: current.vehicle.id,
  };
}

module.exports = { startTrip, endTrip, findCurrentTrip };