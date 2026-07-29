import busStops, { getStopById } from "../data/transport/busStops";
import routes from "../data/transport/routes";
import { calculateDistance } from "../utils/location/distance";

export function findNearestBoardingStop(lat, lng) {
  if (lat == null || lng == null) return null;
  let nearest = null;
  let minDist = Infinity;
  for (const stop of busStops) {
    const dist = calculateDistance(lat, lng, stop.latitude, stop.longitude);
    if (dist < minDist) {
      minDist = dist;
      nearest = { ...stop, distance: Math.round(dist) };
    }
  }
  return nearest;
}

export function findDestinationStop(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return busStops.filter(
    (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
  );
}

function findRoutesWithStops(boardingStopId, destinationStopId) {
  const results = [];

  for (const route of routes) {
    const stopIds = route.stopIds || route.stops;
    const boardIdx = stopIds.indexOf(boardingStopId);
    const destIdx = stopIds.indexOf(destinationStopId);

    if (boardIdx !== -1 && destIdx !== -1 && boardIdx < destIdx) {
      const intermediateIds = stopIds.slice(boardIdx + 1, destIdx);
      const intermediateStops = intermediateIds
        .map((id) => getStopById(id))
        .filter(Boolean);

      const boardingStop = getStopById(boardingStopId);
      const destinationStop = getStopById(destinationStopId);

      results.push({
        recommendedRoute: route,
        boardingStop,
        destinationStop,
        intermediateStops,
        stopsBetween: destIdx - boardIdx,
        distance: route.distance,
        estimatedTime: route.estimatedTime,
      });
    }
  }

  return results;
}

export function recommendRoute(lat, lng, destinationQuery) {
  if (lat == null || lng == null) {
    return { error: "LOCATION_UNAVAILABLE" };
  }

  const nearest = findNearestBoardingStop(lat, lng);
  if (!nearest) {
    return { error: "LOCATION_UNAVAILABLE" };
  }

  if (!destinationQuery || !destinationQuery.trim()) {
    return { error: "DESTINATION_NOT_FOUND", nearest };
  }

  const destStops = findDestinationStop(destinationQuery);
  if (destStops.length === 0) {
    return { error: "DESTINATION_NOT_FOUND", nearest };
  }

  const allResults = [];

  for (const destStop of destStops) {
    const routes = findRoutesWithStops(nearest.id, destStop.id);
    allResults.push(...routes);
  }

  if (allResults.length === 0) {
    return { error: "NO_ROUTE_AVAILABLE", nearest };
  }

  allResults.sort((a, b) => {
    if (a.stopsBetween !== b.stopsBetween) return a.stopsBetween - b.stopsBetween;
    const distA = parseFloat(a.distance) || 0;
    const distB = parseFloat(b.distance) || 0;
    return distA - distB;
  });

  const best = allResults[0];

  return {
    boardingStop: best.boardingStop,
    destinationStop: best.destinationStop,
    recommendedRoute: best.recommendedRoute,
    estimatedTime: best.estimatedTime,
    distance: best.distance,
    intermediateStops: best.intermediateStops,
    stopsBetween: best.stopsBetween,
  };
}
