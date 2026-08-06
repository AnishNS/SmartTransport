import { useState, useEffect, useCallback } from "react";
import {
  getNearbyBusStops,
  getNearestBusStop,
} from "../services/transport/stopService";

// ---------------------------------------------------------------------------
// Nearby bus stops hook.
//
// - Starts in the loading state.
// - If latitude/longitude are not valid yet it WAITS instead of returning a
//   permanently empty list, so the UI never flashes "No stops nearby" while
//   geolocation is still resolving.
// - Once valid coordinates arrive the nearby stops are calculated.
// - Always returns a `nearestStop` (computed over the full network) so pages
//   can show a stable fallback even when nothing exists inside the radius.
// ---------------------------------------------------------------------------

export default function useNearbyBusStops(latitude, longitude, radius = 1500) {
  const [busStops, setBusStops] = useState([]);
  const [nearestStop, setNearestStop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasLocation =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined;

  useEffect(() => {
    let active = true;

    if (!hasLocation) {
      return () => {
        active = false;
      };
    }

    Promise.resolve().then(() => {
      if (!active) return;

      setLoading(true);
      setError(null);

      try {
        const stops = getNearbyBusStops(latitude, longitude, radius);
        const nearest = getNearestBusStop(latitude, longitude);
        setBusStops(stops);
        setNearestStop(nearest);
      } catch (err) {
        setError(err.message || "Unable to load nearby bus stops.");
        setBusStops([]);
        setNearestStop(null);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [latitude, longitude, radius, hasLocation]);

  const retry = useCallback(() => {
    if (!hasLocation) return;
    setLoading(true);
    setError(null);

    try {
      const stops = getNearbyBusStops(latitude, longitude, radius);
      const nearest = getNearestBusStop(latitude, longitude);
      setBusStops(stops);
      setNearestStop(nearest);
    } catch (err) {
      setError(err.message || "Unable to load nearby bus stops.");
      setBusStops([]);
      setNearestStop(null);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radius, hasLocation]);

  return { busStops, nearestStop, loading, error, retry };
}
