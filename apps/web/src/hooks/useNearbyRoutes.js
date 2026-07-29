import { useState, useEffect, useRef } from "react";
import { matchRoutesToStops } from "../services/transport/routeMatchingService";

export default function useNearbyRoutes(latitude, longitude, nearbyBusStops) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastKey = useRef("");

  useEffect(() => {
    if (latitude == null || longitude == null || !nearbyBusStops || nearbyBusStops.length === 0) {
      setRoutes([]);
      setLoading(false);
      return;
    }

    const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}-${nearbyBusStops.length}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    setLoading(true);
    setError(null);

    try {
      const matched = matchRoutesToStops(latitude, longitude, nearbyBusStops);
      setRoutes(matched);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, nearbyBusStops]);

  return { routes, loading, error };
}
