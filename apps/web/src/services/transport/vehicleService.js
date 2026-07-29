import vehicles from "../../data/transport/vehicles";
import { getRouteById } from "./routeService";

export function getAllVehicles() {
  return vehicles.map((v) => {
    const route = getRouteById(v.routeId);
    return { ...v, route: route || null };
  });
}

export function getVehicleById(id) {
  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) return null;
  const route = getRouteById(vehicle.routeId);
  return { ...vehicle, route: route || null };
}

export function getVehiclesByRoute(routeId) {
  return vehicles
    .filter((v) => v.routeId === routeId)
    .map((v) => {
      const route = getRouteById(v.routeId);
      return { ...v, route: route || null };
    });
}
