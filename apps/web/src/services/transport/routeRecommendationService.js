import routes from "../../data/transport/routes";
import { getAllBusStops, getStopById, getNearestBusStop } from "./stopService";
import { calculateDistance } from "../../utils/location/distance";

const AVG_SPEED_KMH = 20;
const STOP_DWELL_MIN = 1;

function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

function formatTime(minutes) {
  return `${Math.max(1, Math.round(minutes))} min`;
}

function extractCoordinates(sourceCoordinates) {
  if (!sourceCoordinates) return null;
  const lat = sourceCoordinates.latitude ?? sourceCoordinates.lat;
  const lng = sourceCoordinates.longitude ?? sourceCoordinates.lng;
  if (lat == null || lng == null) return null;
  return { lat, lng };
}

/**
 * Finds the nearest bus stop to a given coordinate using the existing
 * stopService (Haversine distance).
 */
export function findNearestStop(latitude, longitude) {
  return getNearestBusStop(latitude, longitude);
}

/**
 * Returns every route that can take a passenger directly from the source
 * stop to the destination stop (source appears before destination in the
 * route's stop sequence).
 */
export function findRoutes(sourceStopId, destinationStopId) {
  if (!sourceStopId || !destinationStopId || sourceStopId === destinationStopId) {
    return [];
  }

  const candidates = [];

  for (const route of routes) {
    const sequence = route.stops || route.stopIds;
    const boardingIdx = sequence.indexOf(sourceStopId);
    const destinationIdx = sequence.indexOf(destinationStopId);

    if (boardingIdx === -1 || destinationIdx === -1 || boardingIdx >= destinationIdx) {
      continue;
    }

    const intermediateIds = sequence.slice(boardingIdx + 1, destinationIdx);

    let distanceMeters = 0;
    for (let i = boardingIdx; i < destinationIdx; i += 1) {
      const from = getStopById(sequence[i]);
      const to = getStopById(sequence[i + 1]);
      if (from && to) {
        distanceMeters += calculateDistance(
          from.latitude,
          from.longitude,
          to.latitude,
          to.longitude
        );
      }
    }

    const numberOfStops = destinationIdx - boardingIdx;
    const estimatedMinutes =
      (distanceMeters / 1000 / AVG_SPEED_KMH) * 60 + numberOfStops * STOP_DWELL_MIN;

    candidates.push({
      route,
      boardingStop: getStopById(sourceStopId),
      destinationStop: getStopById(destinationStopId),
      intermediateStops: intermediateIds.map(getStopById).filter(Boolean),
      numberOfStops,
      distanceMeters,
      estimatedMinutes,
    });
  }

  candidates.sort((a, b) => {
    if (a.numberOfStops !== b.numberOfStops) {
      return a.numberOfStops - b.numberOfStops;
    }
    return a.distanceMeters - b.distanceMeters;
  });

  return candidates;
}

/**
 * Searches available bus stops whose name or id matches the query. Used to
 * power the searchable destination dropdown.
 */
export function findDestinationStops(query) {
  const q = (query || "").toString().trim().toLowerCase();
  if (!q) return [];
  return getAllBusStops().filter(
    (stop) =>
      stop.name.toLowerCase().includes(q) || stop.id.toLowerCase().includes(q)
  );
}

function resolveDestinationStops(destination) {
  if (!destination) return [];

  if (typeof destination === "string") {
    return findDestinationStops(destination);
  }

  if (destination.id) {
    const stop = getStopById(destination.id);
    return stop ? [stop] : [];
  }

  if (destination.latitude != null && destination.longitude != null) {
    const stop = getNearestBusStop(destination.latitude, destination.longitude);
    return stop ? [stop] : [];
  }

  return [];
}

/**
 * Recommends the best bus route between the passenger's current location and
 * a chosen destination.
 *
 * Ranking priority:
 *   1. Direct route (single route serving both stops)
 *   2. Minimum number of stops
 *   3. Shortest distance
 */
export function recommendBestRoute(sourceCoordinates, destination) {
  const coords = extractCoordinates(sourceCoordinates);

  if (!coords) {
    return { error: "LOCATION_UNAVAILABLE" };
  }

  const nearest = findNearestStop(coords.lat, coords.lng);
  if (!nearest) {
    return { error: "LOCATION_UNAVAILABLE" };
  }

  const destinationStops = resolveDestinationStops(destination);
  if (destinationStops.length === 0) {
    return { error: "DESTINATION_NOT_FOUND", nearest };
  }

  let fullCandidates = [];
  for (const destStop of destinationStops) {
    fullCandidates = fullCandidates.concat(findRoutes(nearest.id, destStop.id));
  }

  if (fullCandidates.length === 0) {
    return { error: "NO_ROUTE_AVAILABLE", nearest };
  }

  fullCandidates.sort((a, b) => {
    if (a.numberOfStops !== b.numberOfStops) {
      return a.numberOfStops - b.numberOfStops;
    }
    return a.distanceMeters - b.distanceMeters;
  });

  const best = fullCandidates[0];

  return {
    boardingStop: best.boardingStop,
    destinationStop: best.destinationStop,
    route: best.route,
    intermediateStops: best.intermediateStops,
    numberOfStops: best.numberOfStops,
    distance: formatDistance(best.distanceMeters),
    estimatedTime: formatTime(best.estimatedMinutes),
  };
}