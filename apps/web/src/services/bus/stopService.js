import busStops from "../../data/transport/busStops";
import { calculateDistance } from "../../utils/location/distance";

export function getAllStops() {
  return busStops;
}

export function getStopById(stopId) {
  return busStops.find((s) => s.id === stopId) || null;
}

export function getStopsByZone(zone) {
  return busStops.filter((s) => s.zone === zone);
}

export function getRoutesThroughStop(stopId) {
  const stop = getStopById(stopId);
  return stop ? stop.routes : [];
}

export function findStopsNearby(latitude, longitude, radius = 1000) {
  return busStops
    .map((stop) => {
      const distance = calculateDistance(latitude, longitude, stop.latitude, stop.longitude);
      return { ...stop, distance: Math.round(distance) };
    })
    .filter((stop) => stop.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}
