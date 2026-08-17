// Driver trip backend service.
//
// Persists the trip lifecycle (start / end / current) in Supabase through the
// Node backend so Socket.IO can validate that a location update belongs to an
// ACTIVE trip. Every call is best-effort: when the backend is unreachable (or
// the display copy / driver uses the temporary demo account) the functions
// return null and the Driver Dashboard keeps its existing local-only behaviour.

import { apiRequest } from "../api/client";

export async function getCurrentTrip() {
  try {
    const data = await apiRequest("get", "/api/driver/trips/current");
    return data?.trip || null;
  } catch {
    return null;
  }
}

// Returns the backend trip row ({ id, vehicle_id, driver_id, status, ... }) or
// null when the backend rejected the request.
export async function startDriverTrip({ routeId } = {}) {
  try {
    const data = await apiRequest("post", "/api/driver/trips", {
      routeId: routeId || null,
    });
    return data?.trip || null;
  } catch {
    return null;
  }
}

export async function endDriverTrip(tripId) {
  if (!tripId) return false;
  try {
    await apiRequest("patch", `/api/driver/trips/${tripId}/end`);
    return true;
  } catch {
    return false;
  }
}

export default { getCurrentTrip, startDriverTrip, endDriverTrip };