import trips from "../../data/transport/trips";
import vehicles from "../../data/transport/vehicles";
import { getRouteById } from "./routeService";

export function getAllTrips() {
  return trips.map(enrichTrip);
}

export function getTripById(id) {
  const trip = trips.find((t) => t.id === id);
  return trip ? enrichTrip(trip) : null;
}

export function getTripsByRoute(routeId) {
  return trips.filter((t) => t.routeId === routeId).map(enrichTrip);
}

export function getTripsByVehicle(vehicleId) {
  return trips.filter((t) => t.vehicleId === vehicleId).map(enrichTrip);
}

function enrichTrip(trip) {
  const route = getRouteById(trip.routeId);
  const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
  return { ...trip, route: route || null, vehicle: vehicle || null };
}
