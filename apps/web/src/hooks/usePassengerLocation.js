import { useSyncExternalStore } from "react";
import { getCurrentPosition } from "../services/location/locationService";
import { reverseGeocode } from "../services/location/geocodeService";
import { DEFAULT_CENTER } from "../services/maps";

// ---------------------------------------------------------------------------
// Shared passenger location hook.
//
// The browser geolocation request runs ONCE per session and is shared across
// every page (PassengerDashboard, LiveTracking, RoutePlanner). Each page used
// to fire its own navigator.geolocation.getCurrentPosition() call, which made
// latitude/longitude resolve at different times on different pages and caused
// the "sometimes shows nearby stops, sometimes none" inconsistency.
//
// On failure the location falls back to DEFAULT_CENTER so downstream hooks
// (useNearbyBusStops) always receive valid coordinates and never render a
// permanently empty UI.
// ---------------------------------------------------------------------------

let sharedLocation = {
  latitude: null,
  longitude: null,
  accuracy: null,
  address: null,
  city: null,
  loading: true,
  error: null,
};

const listeners = new Set();
let fetchStarted = false;
let lastCoordKey = "";

function subscribe(listener) {
  listeners.add(listener);
  resolveLocation();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return sharedLocation;
}

function notify() {
  for (const fn of listeners) fn();
}

function updateLocation(patch) {
  sharedLocation = { ...sharedLocation, ...patch };
  notify();
}

async function resolveLocation() {
  if (fetchStarted) return;
  fetchStarted = true;

  updateLocation({ loading: true, error: null });

  let coords;
  let locError = null;

  try {
    coords = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  } catch (err) {
    locError = err.message;
    coords = {
      latitude: DEFAULT_CENTER.lat,
      longitude: DEFAULT_CENTER.lng,
      accuracy: null,
    };
  }

  updateLocation({
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? null,
    loading: false,
    error: locError,
  });

  const coordKey = `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`;
  if (coordKey !== lastCoordKey) {
    lastCoordKey = coordKey;

    try {
      const result = await reverseGeocode(coords.latitude, coords.longitude);
      updateLocation({
        address: result.address,
        city: result.city || result.state || result.country,
      });
    } catch (geoErr) {
      if (!locError) updateLocation({ error: geoErr.message });
    }
  }
}

export default function usePassengerLocation() {
  return useSyncExternalStore(subscribe, getSnapshot);
}