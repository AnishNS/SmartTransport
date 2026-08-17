import { useState, useEffect, useRef } from "react";
import { matchRoutesToStops } from "../services/transport/routeMatchingService";

export default function useNearbyRoutes(latitude, longitude, nearbyBusStops) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastKey = useRef("");

  useEffect(() => {
    const hasStops =
      latitude != null &&
      longitude != null &&
      Array.isArray(nearbyBusStops) &&
      nearbyBusStops.length > 0;

    const key = hasStops
      ? `${Number(latitude).toFixed(4)},${Number(longitude).toFixed(4)}-${nearbyBusStops.length}`
      : "";
    if (key === lastKey.current) return;
    lastKey.current = key;

    // Defer state writes to a microtask so the effect body never calls setState
    // synchronously; React auto-batches them so the UI never flashes an empty
    // routes list between "no stops" and "routes available".
    Promise.resolve().then(() => {
      if (key !== lastKey.current) return;

      if (!hasStops) {
        setRoutes([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const matched = matchRoutesToStops(
          Number(latitude),
          Number(longitude),
          nearbyBusStops
        );
        setRoutes(matched);
      } catch (err) {
        setError(err.message || "Unable to load nearby routes.");
      } finally {
        setLoading(false);
      }
    });
  }, [latitude, longitude, nearbyBusStops]);

  return { routes, loading, error };
}