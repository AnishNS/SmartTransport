/*
 * Bus Recommendation Service (Placeholder)
 *
 * Future Pipeline:
 *   Current Location
 *       ↓
 *   Nearby Stops
 *       ↓
 *   Available Buses
 *       ↓
 *   Recommended Route
 *
 * This module will be implemented when the bus recommendation
 * feature is developed. It will consume location data from
 * geocodeService.js and bus/stop data from the backend API.
 */

export async function getNearbyStops(latitude, longitude) {
  throw new Error("Not implemented: Will return nearby bus stops");
}

export async function getAvailableBuses(stopId) {
  throw new Error("Not implemented: Will return buses arriving at a stop");
}

export async function getRecommendedRoute(originLat, originLng, destLat, destLng) {
  throw new Error("Not implemented: Will return best route recommendation");
}
