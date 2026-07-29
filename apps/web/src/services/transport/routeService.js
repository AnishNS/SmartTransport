import routes from "../../data/transport/routes";
import busStops, { getStopById } from "../../data/transport/busStops";

function resolveStops(stopIds) {
  return stopIds
    .map((id, index) => {
      const stop = getStopById(id);
      if (!stop) return null;
      return { ...stop, sequence: index + 1 };
    })
    .filter(Boolean);
}

export function getAllRoutes() {
  return routes.map((route) => ({
    ...route,
    stops: resolveStops(route.stopIds),
  }));
}

export function getRouteById(id) {
  const route = routes.find((r) => r.id === id);
  if (!route) return null;
  return { ...route, stops: resolveStops(route.stopIds) };
}

export function getRoutesByStop(stopId) {
  return routes.filter((r) => r.stopIds.includes(stopId)).map((route) => ({
    ...route,
    stops: resolveStops(route.stopIds),
  }));
}

export { busStops };

export function getAllStops() {
  return busStops;
}
