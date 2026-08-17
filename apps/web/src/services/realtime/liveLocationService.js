// Passenger-facing real-time vehicle feed.
//
// Subscribes to the backend's Socket.IO bus and keeps the latest position of
// every bus on an ACTIVE trip (server-validated — no arbitrary users can push
// locations). Records are converted into the same vehicle shape the existing
// simulation feed produces, so the map/list UI needs no structural changes.
//
// This module is a thin pub/sub wrapper: it holds one set of listeners and the
// latest snapshot, and re-syncs (`passenger:get-snapshot`) whenever the socket
// (re)connects so a late subscriber always gets the current active buses.

import { getSocket, isSocketConnected } from "./socketClient";

const listeners = new Set();

// vehicleId -> vehicle-shaped live bus
const liveVehicles = new Map();

let started = false;
let lastSubscriptionId = 0;

function toVehicleShape(record) {
  return {
    id: record.vehicleId,
    vehicleId: record.vehicleId,
    tripId: record.tripId,
    vehicleNumber: record.vehicleNumber,
    routeId: record.routeId || null,
    routeName: record.routeName || "Live Trip",
    latitude: record.latitude,
    longitude: record.longitude,
    accuracy: record.accuracy ?? null,
    status: "Active",
    speed: 0,
    occupancy: 0,
    capacity: 1,
    driver: "—",
    contact: "—",
    currentStop: "En route",
    nextStop: "—",
    eta: "Live",
    lastUpdated: record.timestamp || new Date().toISOString(),
    _realtime: true,
    _stopIndex: 0,
  };
}

function applySnapshot(records) {
  const list = Array.isArray(records) ? records : [];
  for (const record of list) {
    if (record && record.vehicleId) {
      liveVehicles.set(record.vehicleId, toVehicleShape(record));
    }
  }
  notify();
}

function handleLocationUpdate(record) {
  if (!record || !record.vehicleId) return;
  liveVehicles.set(record.vehicleId, toVehicleShape(record));
  notify();
}

function handleTripEnded({ vehicleId }) {
  if (!vehicleId) return;
  liveVehicles.delete(vehicleId);
  notify();
}

function ensureSync() {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit("passenger:get-snapshot");
  }
}

function start() {
  if (started) return;
  started = true;

  const socket = getSocket();
  socket.on("location:snapshot", applySnapshot);
  socket.on("vehicle:location:update", handleLocationUpdate);
  socket.on("vehicle:trip:ended", handleTripEnded);
  socket.on("connect", ensureSync);

  if (socket.connected) {
    ensureSync();
  }
}

function notify() {
  for (const fn of listeners) fn(getLiveVehicles());
}

export function getLiveVehicles() {
  return Array.from(liveVehicles.values());
}

export function subscribeLiveVehicles(fn) {
  start();
  const id = ++lastSubscriptionId;
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export default {
  getLiveVehicles,
  subscribeLiveVehicles,
  isSocketConnected,
};