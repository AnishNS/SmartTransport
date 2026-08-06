import busStops from "../../data/transport/busStops";
import { calculateDistance } from "../../utils/location/distance";

export function getAllBusStops() {
  return busStops;
}

export function getStopById(stopId) {
  return busStops.find((s) => s.id === stopId) || null;
}

export function getNearbyBusStops(latitude, longitude, radius = 1500) {
  if (latitude == null || longitude == null) return [];

  return busStops
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
  if (latitude == null || longitude == null) return null;

  const sorted = getNearbyBusStops(latitude, longitude, Number.MAX_VALUE);
  return sorted.length > 0 ? sorted[0] : null;
}