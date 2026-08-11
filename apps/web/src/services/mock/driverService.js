// Mock driver service.
//
// Supplies the Driver Dashboard with the current demo driver, their assigned
// vehicle / route / shift, derived trip statistics and notifications. Also
// owns the driver trip lifecycle state helpers (persisted via localStorage by
// the useDriverTrip hook).

import demoConfig from "../../config/demoConfig";
import drivers from "../../data/mock/driverData";
import vehicles from "../../data/mock/vehicleData";
import routeData from "../../data/mock/routeData";
import { getRouteById } from "../transport/routeService";

export const TRIP_STORAGE_KEY = demoConfig.tripStorageKey;

export function getCurrentDriver() {
  return drivers.find((d) => d.id === demoConfig.currentDriverId) || drivers[0] || null;
}

export function getDriverById(id) {
  return drivers.find((d) => d.id === id) || null;
}

export function getAssignedVehicle(driverId) {
  const driver = getDriverById(driverId);
  if (!driver) return null;
  return vehicles.find((v) => v.id === driver.assignedVehicleId) || null;
}

export function getAssignedRoute(driverId) {
  const driver = getDriverById(driverId);
  if (!driver) return null;
  return routeData.find((r) => r.id === driver.assignedRouteId) || null;
}

export function getCurrentShift(driverId) {
  const driver = getDriverById(driverId);
  return driver ? driver.shift : null;
}

export function getRouteStops(routeId) {
  const route = getRouteById(routeId);
  return route ? route.stops : [];
}

export function getDriverTripStats(driverId) {
  const driver = getDriverById(driverId);
  if (!driver) {
    return { tripsToday: 0, passengersToday: 0, onTimePerformance: 0 };
  }
  return {
    tripsToday: driver.tripsToday,
    passengersToday: driver.passengersToday,
    onTimePerformance: driver.onTimePerformance,
  };
}

export function getDriverNotifications(driverId) {
  const route = getAssignedRoute(driverId);
  const vehicle = getAssignedVehicle(driverId);
  const routeLabel = route ? `Route ${route.routeNumber}` : "Route —";
  const vehicleNumber = vehicle ? vehicle.vehicleNumber : "Vehicle —";

  return [
    {
      title: `New route assigned`,
      description: `${routeLabel} has been assigned for your next trip.`,
      time: "10 min ago",
      type: "info",
    },
    {
      title: `Traffic ahead on ${routeLabel}`,
      description: "Expect delays of 5-8 minutes near City Market.",
      time: "25 min ago",
      type: "warning",
    },
    {
      title: "Maintenance reminder",
      description: `${vehicleNumber} is due for service in 500 km.`,
      time: "2 hours ago",
      type: "alert",
    },
  ];
}

// ---------------------------------------------------------------------------
// Daily schedule
//
// Generates a deterministic daily trip schedule from the driver's shift window
// (06:00-14:00 / 14:00-22:00) using 90-minute trip slots on the assigned
// route. Trips are compared against the current time to classify each as
// upcoming / in-progress / completed, so the schedule UI stays stable within a
// given day.
// ---------------------------------------------------------------------------

export function getDriverSchedule(driverId) {
  const driver = getDriverById(driverId);
  if (!driver) return { shift: null, route: null, vehicle: null, tripsToday: [] };

  const route = getAssignedRoute(driverId);
  const vehicle = getAssignedVehicle(driverId);
  const shift = driver.shift || { label: "Daily Shift", start: "06:00", end: "14:00" };

  const [startH, startM] = shift.start.split(":").map(Number);
  const [endH, endM] = shift.end.split(":").map(Number);

  const now = Date.now();
  const today = new Date(now);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startH, startM);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endH, endM);

  const slotMinutes = 90;
  const slotMs = slotMinutes * 60000;
  const trips = [];

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  for (let t = start.getTime(), seq = 1; t + slotMs <= end.getTime(); t += slotMs, seq += 1) {
    const tripStart = t;
    const tripEnd = t + slotMs;
    const status = tripEnd <= now ? "completed" : tripStart <= now ? "in_progress" : "upcoming";

    trips.push({
      id: `${driver.id}-SCH-${seq}`,
      startTime: formatTime(tripStart),
      endTime: formatTime(tripEnd),
      routeLabel: route ? `${route.routeNumber} · ${route.routeName}` : "—",
      source: route ? route.source : "—",
      destination: route ? route.destination : "—",
      vehicleNumber: vehicle ? vehicle.vehicleNumber : "—",
      stopCount: route ? getRouteStops(route.id).length : 0,
      status,
    });
  }

  return { shift, route, vehicle, tripsToday: trips };
}

// ---------------------------------------------------------------------------
// Trip lifecycle (state is stored in localStorage by useDriverTrip)
// ---------------------------------------------------------------------------

export function getInitialTripState() {
  return {
    status: "idle", // idle | in_progress | paused | completed
    startedAt: null,
    pausedAt: null,
    endedAt: null,
    totalPausedMs: 0,
    tripsCompleted: 0,
  };
}

export function getTripStatusLabel(status) {
  const labels = {
    idle: "Not Started",
    in_progress: "In Progress",
    paused: "Paused",
    completed: "Completed",
  };
  return labels[status] || status || "Not Started";
}
