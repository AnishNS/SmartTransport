import { getAllRoutes } from "../transport/routeService";

const BUSY_STOP_NAMES = new Set([
  "Gandhipuram",
  "Railway Station",
  "Bus Stand",
  "Town Hall",
  "Ukkadam",
  "Hope College",
  "Lakshmi Mills",
]);

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

function generateVehicleNumber(index) {
  const a = String.fromCharCode(65 + Math.floor(index / 26) % 26);
  const b = String.fromCharCode(65 + index % 26);
  return `TN-01-${a}${b}-${1000 + index}`;
}

function generateVehicles() {
  const distribution = [
    { routeId: "RT-001", count: 2 },
    { routeId: "RT-002", count: 2 },
    { routeId: "RT-003", count: 2 },
    { routeId: "RT-004", count: 2 },
    { routeId: "RT-005", count: 2 },
  ];

  const vehicles = [];
  let index = 0;

  for (const { routeId, count } of distribution) {
    const allRoutes = getAllRoutes();
    const route = allRoutes.find((r) => r.id === routeId);
    if (!route) continue;

    for (let i = 0; i < count; i++) {
      const stopIndex = Math.floor(Math.random() * (route.stops.length - 1));
      const progress = Math.random();
      const currentStop = route.stops[stopIndex];
      const nextStop = route.stops[stopIndex + 1];

      const lat =
        currentStop.latitude +
        (nextStop.latitude - currentStop.latitude) * progress;
      const lng =
        currentStop.longitude +
        (nextStop.longitude - currentStop.longitude) * progress;
      const heading = calculateHeading(
        currentStop.latitude,
        currentStop.longitude,
        nextStop.latitude,
        nextStop.longitude
      );

      const capacity = [40, 50, 60][Math.floor(Math.random() * 3)];
      const routeName = `${route.routeNumber} - ${route.routeName}`;

      vehicles.push({
        id: `SIM-VH-${String(index + 1).padStart(3, "0")}`,
        vehicleNumber: generateVehicleNumber(index),
        routeId,
        routeName,
        latitude: lat,
        longitude: lng,
        speed: Math.round(20 + Math.random() * 30),
        heading: Math.round(heading),
        occupancy: Math.floor(Math.random() * 40) + 10,
        capacity,
        status: Math.random() > 0.15 ? "On Time" : "Delayed",
        nextStop: nextStop.name,
        lastUpdated: new Date().toISOString(),
        _stopIndex: stopIndex,
        _progress: progress,
        _route: route,
      });

      index++;
    }
  }

  return vehicles;
}

function moveVehicle(vehicle) {
  const route = vehicle._route;
  if (!route || route.stops.length < 2) return vehicle;

  let stopIndex = vehicle._stopIndex;
  let progress = vehicle._progress + 0.15 + Math.random() * 0.15;

  if (progress >= 1) {
    progress = 0;
    stopIndex = (stopIndex + 1) % (route.stops.length - 1);
  }

  const currentStop = route.stops[stopIndex];
  const nextStop = route.stops[stopIndex + 1] || route.stops[0];

  const lat =
    currentStop.latitude +
    (nextStop.latitude - currentStop.latitude) * progress;
  const lng =
    currentStop.longitude +
    (nextStop.longitude - currentStop.longitude) * progress;
  const heading = calculateHeading(
    currentStop.latitude,
    currentStop.longitude,
    nextStop.latitude,
    nextStop.longitude
  );

  let occupancy = vehicle.occupancy;
  const approachingBusy = BUSY_STOP_NAMES.has(nextStop.name) && progress > 0.7;
  const approachingDest = stopIndex >= route.stops.length - 2;

  if (approachingDest) {
    occupancy = Math.max(10, occupancy - Math.floor(Math.random() * 15) - 5);
  } else if (approachingBusy) {
    occupancy = Math.min(
      vehicle.capacity,
      occupancy + Math.floor(Math.random() * 10) + 5
    );
  } else {
    occupancy += Math.floor(Math.random() * 7) - 3;
    occupancy = Math.max(5, Math.min(vehicle.capacity, occupancy));
  }

  const speed = Math.round(20 + Math.random() * 30);

  return {
    ...vehicle,
    latitude: lat,
    longitude: lng,
    speed,
    heading: Math.round(heading),
    occupancy,
    status: Math.random() > 0.1 ? "On Time" : "Delayed",
    nextStop: nextStop.name,
    lastUpdated: new Date().toISOString(),
    _stopIndex: stopIndex,
    _progress: progress,
  };
}

const simState = {
  vehicles: [],
  intervalId: null,
  subscribers: new Set(),
  started: false,
};

function tick() {
  simState.vehicles = simState.vehicles.map(moveVehicle);
  const snapshot = simState.vehicles;
  for (const fn of simState.subscribers) {
    fn(snapshot);
  }
}

export function startSimulation() {
  if (!simState.started) {
    simState.vehicles = generateVehicles();
    simState.started = true;
    const interval = 3000 + Math.random() * 2000;
    simState.intervalId = setInterval(tick, Math.round(interval));
  }
  return simState.vehicles;
}

export function stopSimulation() {
  if (simState.intervalId) {
    clearInterval(simState.intervalId);
    simState.intervalId = null;
  }
  simState.started = false;
  simState.vehicles = [];
  simState.subscribers.clear();
}

export function subscribe(fn) {
  simState.subscribers.add(fn);
  return () => {
    simState.subscribers.delete(fn);
  };
}

export function getVehicles() {
  return simState.vehicles;
}
