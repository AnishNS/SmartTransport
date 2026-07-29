import { useState, useEffect, useCallback, useRef } from "react";
import { fetchNearbyBusStops } from "../services/location/busStopService";
import { findStopsNearby } from "../services/bus/stopService";

const LOCAL_TIMEOUT_MS = 25000;

function deduplicateStops(staticStops, dynamicStops) {
  const seen = new Set(
    staticStops.map((s) => `${s.latitude.toFixed(4)},${s.longitude.toFixed(4)}`)
  );
  return [
    ...staticStops,
    ...dynamicStops.filter(
      (s) => !seen.has(`${s.latitude.toFixed(4)},${s.longitude.toFixed(4)}`)
    ),
  ];
}

export default function useNearbyBusStops(latitude, longitude, radius = 1500) {
  const [nearbyStops, setNearbyStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchIdRef = useRef(0);

  const fetchStops = useCallback(async () => {
    if (latitude == null || longitude == null) {
      setNearbyStops([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    const staticNearby = findStopsNearby(latitude, longitude, radius);

    let localTimeoutId;
    try {
      const dynamicPromise = fetchNearbyBusStops(latitude, longitude, radius);
      const timeoutPromise = new Promise((_, reject) => {
        localTimeoutId = setTimeout(
          () => reject(new Error("Request timed out")),
          LOCAL_TIMEOUT_MS
        );
      });

      const dynamicStops = await Promise.race([dynamicPromise, timeoutPromise]);
      clearTimeout(localTimeoutId);

      if (fetchId !== fetchIdRef.current) return;

      const taggedDynamic = dynamicStops.map((s) => ({ ...s, _dynamic: true }));
      const merged = deduplicateStops(staticNearby, taggedDynamic);
      merged.sort((a, b) => a.distance - b.distance);
      setNearbyStops(merged);
    } catch (err) {
      clearTimeout(localTimeoutId);
      if (fetchId !== fetchIdRef.current) return;
      setError(err.message || "Failed to fetch nearby stops");
      setNearbyStops(staticNearby);
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [latitude, longitude, radius]);

  useEffect(() => {
    fetchStops();
  }, [fetchStops]);

  const retry = useCallback(() => {
    fetchStops();
  }, [fetchStops]);

  return { busStops: nearbyStops, loading, error, retry };
}
