import seedVehicles from "../../data/transport/vehicles";
import { getRouteById } from "./routeService";
import { calculateDistance } from "../../utils/location/distance";

// ---------------------------------------------------------------------------
// Vehicle Simulation Service
//
// Simulates buses moving along the existing route network (routes.js +
// busStops.js). The static dataset (data/transport/vehicles.js) only seeds
// fleet + route assignments; positions are always derived from route geometry,
// so coordinates are never duplicated.
//
// The public API (start / stop / subscribe / getVehicles) mirrors a live
// Socket.IO feed, so this layer can later be swapped for real driver GPS
// without touching any UI code.
// ---------------------------------------------------------------------------

const TICK_INTERVAL_MS = 2000;
const KMH_TO_MPS = 1000 / 3600;

const simState = {
  vehicles: [],
  intervalId: null,
  subscribers: new Set(),
  started: false,
};

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

function calculateHeading(lat1, lng1, lat2, lng2) {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  const heading = toDeg(Math.atan2(y, x));
  return (heading + 360) % 360;
}

function interpolatePosition(stopA, stopB, progress) {
  return {
    latitude: stopA.latitude + (stopB.latitude - stopA.latitude) * progress,
    longitude: stopA.longitude + (stopB.longitude - stopA.longitude) * progress,
  };
}

// Computes the minutes remaining before the vehicle reaches its next stop.
function estimateEta(vehicle, nextStop) {
  const metersAway = calculateDistance(
    vehicle.latitude,
    vehicle.longitude,
    nextStop.latitude,
    nextStop.longitude
  );
  const speedMps = Math.max(4, vehicle.speed) * KMH_TO_MPS;
  return Math.max(1, Math.round(metersAway / speedMps / 60));
}

// ---------------------------------------------------------------------------
// Dataset → in-memory fleet
// ---------------------------------------------------------------------------

function seedFleet() {
  return seedVehicles
    .map((seed) => {
      const route = getRouteById(seed.routeId);
      if (!route || route.stops.length < 2) return null;

      const stopIndex = Math.min(
        seed.currentStopIndex,
        route.stops.length - 2
      );
      const progress = Math.random();
      const currentStop = route.stops[stopIndex];
      const nextStop = route.stops[stopIndex + 1];
      const position = interpolatePosition(currentStop, nextStop, progress);
      const heading = calculateHeading(
        currentStop.latitude,
        currentStop.longitude,
        nextStop.latitude,
        nextStop.longitude
      );

      return {
        id: seed.id,
        vehicleNumber: seed.vehicleNumber,
        routeId: route.id,
        routeName: `${route.routeNumber} · ${route.routeName}`,
        latitude: position.latitude,
        longitude: position.longitude,
        status: seed.status,
        occupancy: seed.occupancy,
        speed: seed.speed,
        capacity: seed.capacity,
        driver: seed.driver,
        contact: seed.contact,
        heading: Math.round(heading),
        currentStop: currentStop.name,
        nextStop: nextStop.name,
        eta: `${Math.max(1, Math.round(calculateDistance(position.latitude, position.longitude, nextStop.latitude, nextStop.longitude) / (Math.max(4, seed.speed) * KMH_TO_MPS) / 60))} min`,
        lastUpdated: new Date().toISOString(),
        _stopIndex: stopIndex,
        _progress: progress,
        _route: route,
      };
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Movement
// ---------------------------------------------------------------------------

// Recomputes position, current stop and ETA for a single vehicle based on its
// route geometry and the distance travelled since the last tick.
export function updateVehiclePosition(vehicle) {
  const route = vehicle._route;
  if (!route || route.stops.length < 2) return vehicle;

  const segmentDistance = calculateDistance(
    route.stops[vehicle._stopIndex].latitude,
    route.stops[vehicle._stopIndex].longitude,
    route.stops[vehicle._stopIndex + 1].latitude,
    route.stops[vehicle._stopIndex + 1].longitude
  );

  // Distance covered in one tick at the vehicle's current speed.
  const travelMeters = Math.max(6, vehicle.speed) * KMH_TO_MPS * (TICK_INTERVAL_MS / 1000);
  const progressDelta = segmentDistance > 0 ? travelMeters / segmentDistance : 0.02;

  let stopIndex = vehicle._stopIndex;
  let progress = vehicle._progress + progressDelta;

  if (progress >= 1) {
    progress = 0;
    stopIndex = (stopIndex + 1) % (route.stops.length - 1);
  }

  const currentStop = route.stops[stopIndex];
  const nextStop = route.stops[stopIndex + 1];
  const position = interpolatePosition(currentStop, nextStop, progress);
  const heading = calculateHeading(
    currentStop.latitude,
    currentStop.longitude,
    nextStop.latitude,
    nextStop.longitude
  );

  // Small realistic variance in speed / occupancy.
  const speed = Math.max(15, Math.min(60, vehicle.speed + Math.round(Math.random() * 6 - 3)));
  const occupancy = Math.max(
    5,
    Math.min(vehicle.capacity, vehicle.occupancy + Math.round(Math.random() * 7 - 3))
  );

  return {
    ...vehicle,
    latitude: position.latitude,
    longitude: position.longitude,
    speed,
    heading: Math.round(heading),
    occupancy,
    status: Math.random() > 0.08 ? "On Time" : "Delayed",
    currentStop: currentStop.name,
    nextStop: nextStop.name,
    eta: `${estimateEta(
      { ...vehicle, latitude: position.latitude, longitude: position.longitude, speed },
      nextStop
    )} min`,
    lastUpdated: new Date().toISOString(),
    _stopIndex: stopIndex,
    _progress: progress,
  };
}

// Advances every vehicle in the fleet by one tick and notifies subscribers.
export function simulateMovement() {
  simState.vehicles = simState.vehicles.map(updateVehiclePosition);
  const snapshot = simState.vehicles;
  for (const fn of simState.subscribers) {
    fn(snapshot);
  }
}

// ---------------------------------------------------------------------------
// Public API (mimics a Socket.IO feed)
// ---------------------------------------------------------------------------

export function startVehicleSimulation() {
  if (!simState.started) {
    simState.vehicles = seedFleet();
    simState.started = true;
    simState.intervalId = setInterval(simulateMovement, TICK_INTERVAL_MS);
  }
  return getVehicles();
}

export function stopVehicleSimulation() {
  if (simState.intervalId) {
    clearInterval(simState.intervalId);
    simState.intervalId = null;
  }
  simState.started = false;
  simState.vehicles = [];
  simState.subscribers.clear();
}

export function subscribeToVehicles(fn) {
  simState.subscribers.add(fn);
  return () => {
    simState.subscribers.delete(fn);
  };
}

export function getVehicles() {
  return simState.vehicles;
}