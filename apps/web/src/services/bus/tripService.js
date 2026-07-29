import { mockTrips, mockRoutes, mockVehicles, mockStops } from "./busData";

export function getAllTrips() {
  return mockTrips.map(enrichTrip);
}

export function getTripById(tripId) {
  const trip = mockTrips.find((t) => t.id === tripId);
  return trip ? enrichTrip(trip) : null;
}

export function getTripsByRoute(routeId) {
  return mockTrips.filter((t) => t.routeId === routeId).map(enrichTrip);
}

export function getTripsByVehicle(vehicleId) {
  return mockTrips.filter((t) => t.vehicleId === vehicleId).map(enrichTrip);
}

export function getTripsByDate(date) {
  return mockTrips.filter((t) => t.date === date).map(enrichTrip);
}

function enrichTrip(trip) {
  const route = mockRoutes.find((r) => r.id === trip.routeId);
  const vehicle = mockVehicles.find((v) => v.id === trip.vehicleId);
  const routeStops = (route?.stops || [])
    .map((id) => mockStops.find((s) => s.id === id))
    .filter(Boolean);
  return { ...trip, route: route || null, vehicle: vehicle || null, stops: routeStops };
}
