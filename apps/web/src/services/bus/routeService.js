import { mockRoutes, mockStops, mockTrips } from "./busData";

export function getAllRoutes() {
  return mockRoutes.map((route) => ({
    ...route,
    stopDetails: route.stops
      .map((id) => mockStops.find((s) => s.id === id))
      .filter(Boolean),
  }));
}

export function getRouteById(routeId) {
  const route = mockRoutes.find((r) => r.id === routeId);
  if (!route) return null;
  return {
    ...route,
    stopDetails: route.stops
      .map((id) => mockStops.find((s) => s.id === id))
      .filter(Boolean),
  };
}

export function getRoutesByZone(zone) {
  const zoneStopIds = mockStops
    .filter((s) => s.zone === zone)
    .map((s) => s.id);

  return mockRoutes
    .filter((route) => route.stops.some((id) => zoneStopIds.includes(id)))
    .map((route) => ({
      ...route,
      stopDetails: route.stops
        .map((id) => mockStops.find((s) => s.id === id))
        .filter(Boolean),
    }));
}

export function getActiveTripsForRoute(routeId) {
  return mockTrips.filter((t) => t.routeId === routeId && t.status === "in_progress");
}
