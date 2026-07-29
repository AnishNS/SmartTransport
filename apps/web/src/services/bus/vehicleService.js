import { mockVehicles, mockRoutes, mockTrips } from "./busData";

export function getAllVehicles() {
  return mockVehicles.map((v) => {
    const route = mockRoutes.find((r) => r.id === v.routeId);
    const activeTrip = mockTrips.find((t) => t.vehicleId === v.id && t.status === "in_progress");
    return { ...v, route: route || null, currentTrip: activeTrip || null };
  });
}

export function getVehicleById(vehicleId) {
  const vehicle = mockVehicles.find((v) => v.id === vehicleId);
  if (!vehicle) return null;
  const route = mockRoutes.find((r) => r.id === vehicle.routeId);
  const activeTrip = mockTrips.find((t) => t.vehicleId === vehicle.id && t.status === "in_progress");
  return { ...vehicle, route: route || null, currentTrip: activeTrip || null };
}

export function getVehiclesByRoute(routeId) {
  return mockVehicles
    .filter((v) => v.routeId === routeId)
    .map((v) => {
      const route = mockRoutes.find((r) => r.id === v.routeId);
      const activeTrip = mockTrips.find((t) => t.vehicleId === v.id && t.status === "in_progress");
      return { ...v, route: route || null, currentTrip: activeTrip || null };
    });
}
