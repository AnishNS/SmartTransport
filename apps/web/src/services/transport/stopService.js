import busStops from "../../data/transport/busStops";
import { calculateDistance } from "../../utils/location/distance";

// Canonical bus-stop validation.
//
// The dataset lives in ONE file (data/transport/busStops.js). This service is
// the only reader for distance computations. A stop is valid only when it has
// the required fields and usable coordinates; invalid stops are excluded from
// both the map collection and distance calculations so they can never crash a
// render or silently produce NaN.
export function isValidBusStop(stop) {
  if (!stop || typeof stop !== "object") return false;
  if (!stop.id || !stop.name) return false;
  const lat = Number(stop.latitude);
  const lng = Number(stop.longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return false;
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return false;
  if (!Array.isArray(stop.routes)) return false;
  return true;
}

function isValidPoint(latitude, longitude) {
  if (latitude == null || longitude == null) return false;
  const lat = Number(latitude);
  const lng = Number(longitude);
  return (
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  );
}

// Returns every valid stop. Invalid entries are dropped (and flagged in dev) so
// the map ALWAYS renders a sane, complete collection. The filtered result is
// memoized so the dataset is never re-validated on every render.
let cachedAllStops = null;
export function getAllBusStops() {
  if (cachedAllStops) return cachedAllStops;
  const valid = busStops.filter(isValidBusStop);
  if (import.meta.env.DEV && valid.length !== busStops.length) {
    console.warn(
      `[stopService] dropped ${busStops.length - valid.length} invalid bus stop(s) from the dataset.`
    );
  }
  cachedAllStops = valid;
  return cachedAllStops;
}

export function getStopById(stopId) {
  return getAllBusStops().find((s) => s.id === stopId) || null;
}

export function getNearbyBusStops(latitude, longitude, radius = 1500) {
  if (!isValidPoint(latitude, longitude)) return [];

  return getAllBusStops()
    .map((stop) => ({
      ...stop,
      distance: Math.round(
        calculateDistance(latitude, longitude, stop.latitude, stop.longitude)
      ),
    }))
    .filter((stop) => stop.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

export function getNearestBusStop(latitude, longitude) {
  if (!isValidPoint(latitude, longitude)) return null;

  const sorted = getNearbyBusStops(latitude, longitude, Number.MAX_VALUE);
  return sorted.length > 0 ? sorted[0] : null;
}

// Accepts a loose stop-shaped object coming from an external source (e.g. an
// OpenStreetMap/Overpass response). Only finite, in-range coordinates pass.
function isValidImportedStop(stop) {
  if (!stop || typeof stop !== "object") return false;
  const lat = Number(stop.latitude);
  const lng = Number(stop.longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return false;
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return false;
  return true;
}

// Merges an auxiliary stop collection (Overpass/OSM) into the canonical nearby
// list. This is an ENHANCEMENT only: it never removes or replaces known stops,
// drops any extra stop that coincides with an already-known one, assigns OSM
// stops stable prefixed ids and a fresh Haversine distance, and always returns
// the merged list sorted by distance ascending.
export function mergeNearbyStops(
  latitude,
  longitude,
  baseStops = [],
  extraStops = [],
  dedupeRadiusM = 60
) {
  const merged = (baseStops || [])
    .filter(isValidImportedStop)
    .map((stop) => ({
      ...stop,
      source: stop.source || "dataset",
      distance: Math.round(
        calculateDistance(latitude, longitude, stop.latitude, stop.longitude)
      ),
    }));

  for (const extra of extraStops || []) {
    if (!isValidImportedStop(extra)) continue;
    const lat = Number(extra.latitude);
    const lng = Number(extra.longitude);

    const isDuplicate = merged.some(
      (existing) =>
        calculateDistance(lat, lng, existing.latitude, existing.longitude) <=
        dedupeRadiusM
    );
    if (isDuplicate) continue;

    const distance = Math.round(calculateDistance(latitude, longitude, lat, lng));
    if (distance <= 0) continue;

    merged.push({
      id: `osm-${extra.id ?? `${lat.toFixed(4)}_${lng.toFixed(4)}`}`,
      name: extra.name || "Bus Stop",
      type: extra.type || "Bus Stop",
      latitude: lat,
      longitude: lng,
      distance,
      routes: Array.isArray(extra.routes) ? extra.routes : [],
      tags: extra.tags || {},
      source: "osm",
    });
  }

  return merged.sort((a, b) => a.distance - b.distance);
}
