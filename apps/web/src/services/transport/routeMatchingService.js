import { getAllRoutes } from "./routeService";
import { calculateDistance } from "../../utils/location/distance";

function normalizeName(name) {
  return name.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

export function matchRoutesToStops(passengerLat, passengerLng, nearbyStops) {
  if (!nearbyStops || nearbyStops.length === 0) return [];
  if (passengerLat == null || passengerLng == null) return [];

  const routes = getAllRoutes();
  const results = [];
  const seen = new Set();

  for (const stop of nearbyStops) {
    const stopKey = normalizeName(stop.name);

    for (const route of routes) {
      const matchingStop = route.stops.find((rs) => {
        const routeStopKey = normalizeName(rs.name);
        return routeStopKey === stopKey || routeStopKey.includes(stopKey) || stopKey.includes(routeStopKey);
      });

      if (!matchingStop) continue;

      const compositeKey = `${route.id}-${matchingStop.id}`;
      if (seen.has(compositeKey)) continue;
      seen.add(compositeKey);

      const distFromPassenger = calculateDistance(
        passengerLat,
        passengerLng,
        matchingStop.latitude,
        matchingStop.longitude
      );

      results.push({
        routeNumber: route.routeNumber,
        routeName: route.routeName,
        source: route.source,
        destination: route.destination,
        matchingStop: matchingStop.name,
        distance: Math.round(distFromPassenger),
        routeId: route.id,
        stopId: matchingStop.id,
      });
    }
  }

  results.sort((a, b) => a.distance - b.distance);

  return results;
}
