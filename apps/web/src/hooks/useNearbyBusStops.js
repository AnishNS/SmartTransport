import { useState, useEffect, useRef, useCallback } from "react";
import {
  getNearbyBusStops,
  getNearestBusStop,
  mergeNearbyStops,
} from "../services/transport/stopService";
import { fetchNearbyBusStops } from "../services/location/busStopService";

// ---------------------------------------------------------------------------
// Nearby bus stops hook (robust).
//
// Rules enforced here:
//  1. The canonical local dataset is ALWAYS the source of truth for the map
//     and for distances. The nearby list is computed from it synchronously and
//     is NEVER blocked by a remote API.
//  2. GPS is validated (finite + geographic bounds) before any calculation.
//  3. All returned stops carry a Haversine distance in METERS and are sorted
//     ascending.
//  4. OpenStreetMap/Overpass is used ONLY as a best-effort enhancement that
//     adds extra stops. Its failure can never erase the local dataset, and a
//     stale (older coords) response can never overwrite a newer one.
//  5. The hook never refetches on every render and never stays stuck in
//     "Loading": if location never resolves, loading turns off after a bounded
//     wait so the UI can show a helpful empty state.
//
// Returns:
//   busStops   – nearby stops within the radius (local + merged extras), sorted
//   nearestStop- closest known stop over the WHOLE network (always present with
//                valid GPS), used for the dedicated "Nearest Bus Stop" section
//   loading    – true only while GPS/location is still resolving
//   enhancing  – true while the optional OSM enrichment is in flight
//   error      – only set when the local calculation itself failed
//   retry      – re-run the computation + enhancement
// ---------------------------------------------------------------------------

const LOCATION_WAIT_TIMEOUT_MS = 8000;
const DEFAULT_RADIUS = 1500;

function isValidCoordinatePoint(latitude, longitude) {
  if (latitude == null || longitude == null) return false;
  const lat = Number(latitude);
  const lng = Number(longitude);
  return (
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  );
}

export default function useNearbyBusStops(latitude, longitude, radius = DEFAULT_RADIUS) {
  const [busStops, setBusStops] = useState([]);
  const [nearestStop, setNearestStop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enhancing, setEnhancing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const runIdRef = useRef(0);

  const hasLocation = isValidCoordinatePoint(latitude, longitude);

  // Keep a bounded loading state while no valid GPS is available so the UI
  // never flashes an empty list during geolocation, and never stays stuck in
  // an endless "Loading..." state either.
  useEffect(() => {
    if (hasLocation) return undefined;
    const timer = setTimeout(() => {
      setLoading(false);
    }, LOCATION_WAIT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [hasLocation]);

  useEffect(() => {
    if (!hasLocation) return undefined;

    const runId = ++runIdRef.current;
    let active = true;

    // State writes are deferred to a microtask so the effect body never calls
    // setState synchronously, and React auto-batches them so the cleared list
    // never flashes before the computed result lands.
    Promise.resolve().then(() => {
      if (!active || runId !== runIdRef.current) return;

      setLoading(true);
      setError(null);
      setBusStops([]);
      setNearestStop(null);

      const lat = Number(latitude);
      const lng = Number(longitude);
      const radiusNum = Number(radius) || DEFAULT_RADIUS;

      // Nearest + nearby come from the canonical dataset first (never remote).
      let local;
      try {
        local = getNearbyBusStops(lat, lng, radiusNum);
        const nearest = getNearestBusStop(lat, lng);
        if (active) {
          setBusStops(local);
          setNearestStop(nearest);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load nearby bus stops.");
          setBusStops([]);
          setNearestStop(null);
          setLoading(false);
          setEnhancing(false);
        }
        return;
      }

      // Best-effort OpenStreetMap/Overpass enrichment. Merging only ADDS stops
      // and dedups against the known dataset. A timeout/error here is ignored —
      // the local list remains intact. The runId guard prevents an older
      // response from overwriting newer coordinates' results.
      setEnhancing(true);
      fetchNearbyBusStops(lat, lng, radiusNum)
        .then((osmStops) => {
          if (!active || runId !== runIdRef.current) return;
          const merged = mergeNearbyStops(lat, lng, local, osmStops);
          if (merged.length > 0) {
            setBusStops(merged);
            setNearestStop(merged[0]);
          }
        })
        .catch(() => {
          // Enhancement failure is non-fatal: keep the canonical local data.
        })
        .finally(() => {
          if (active && runId === runIdRef.current) setEnhancing(false);
        });
    });

    return () => {
      active = false;
    };
  }, [hasLocation, latitude, longitude, radius, retryKey]);

  const retry = useCallback(() => {
    if (!hasLocation) return;
    setRetryKey((k) => k + 1);
  }, [hasLocation]);

  return { busStops, nearestStop, loading, error, enhancing, retry };
}