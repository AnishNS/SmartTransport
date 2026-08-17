// Real-time live bus service.
//
// Owns the single source of truth for the *current* position of every active
// trip, in memory. Passenger clients receive positions ONLY through Socket.IO
// broadcasts (`vehicle:location:update` / `location:snapshot`); they never read
// the database. Driver positions are also persisted to public.vehicle_locations
// (throttled) via the service-role client for history.
//
// The Socket.IO instance is registered lazily (setIO) so this module stays
// usable from the HTTP trip endpoints too (e.g. removing a bus when its trip
// ends) without circular imports.

const supabaseAdmin = require("../config/supabaseAdmin");

let io = null;

// vehicleId -> latest location record for an ACTIVE trip only.
const latestLocations = new Map();

// vehicleId -> last time we persisted to the database.
const lastPersistAt = new Map();

const PERSIST_INTERVAL_MS = 8000;

function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error(
      "Backend service-role client is not configured. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env."
    );
  }
  return supabaseAdmin;
}

function setIO(instance) {
  io = instance;
}

function publish(event, payload) {
  if (io) {
    io.emit(event, payload);
  }
}

function getLatestLocations() {
  return Array.from(latestLocations.values());
}

// Replaces the live position for a vehicle (only called after the active-trip
// validation passed) and broadcasts it to every connected client.
function updateVehicleLocation(record) {
  latestLocations.set(record.vehicleId, {
    ...record,
    recordedAt: new Date().toISOString(),
  });
  publish("vehicle:location:update", latestLocations.get(record.vehicleId));
  persistVehicleLocation(record);
}

// Removes a bus from the live map (trip ended / deactivated).
function removeVehicleLocation(vehicleId) {
  if (!latestLocations.delete(vehicleId)) return;
  lastPersistAt.delete(vehicleId);
  publish("vehicle:trip:ended", { vehicleId });
}

// ----- persistence ---------------------------------------------------------

let hasLocationColumns = null;

async function locationColumnsAvailable() {
  if (hasLocationColumns !== null) return hasLocationColumns;
  try {
    const { error } = await supabaseAdmin
      .from("vehicle_locations")
      .select("driver_id")
      .limit(1);
    hasLocationColumns = !(
      error &&
      (error.code === "42703" || /does not exist/i.test(error.message || ""))
    );
  } catch {
    hasLocationColumns = false;
  }
  return hasLocationColumns;
}

// Best-effort, throttled insert into public.vehicle_locations. Requires the
// database/vehicle_locations_trip.sql migration (driver_id / trip_id /
// accuracy columns). A persistence failure never blocks the real-time feed.
async function persistVehicleLocation(record) {
  const now = Date.now();
  const last = lastPersistAt.get(record.vehicleId) || 0;
  if (now - last < PERSIST_INTERVAL_MS) return;

  try {
    if (!(await locationColumnsAvailable())) return;
    const { error } = await supabaseAdmin.from("vehicle_locations").insert({
      vehicle_id: record.vehicleId,
      driver_id: record.driverId,
      trip_id: record.tripId,
      latitude: record.latitude,
      longitude: record.longitude,
      accuracy: record.accuracy ?? null,
      recorded_at: new Date(record.timestamp || Date.now()).toISOString(),
    });
    if (error) return;
    lastPersistAt.set(record.vehicleId, now);
  } catch (err) {
    console.warn("[liveBus] could not persist location:", err.message);
  }
}

module.exports = {
  setIO,
  publish,
  getLatestLocations,
  updateVehicleLocation,
  removeVehicleLocation,
};