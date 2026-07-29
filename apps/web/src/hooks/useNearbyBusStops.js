import { useState, useEffect, useCallback } from "react";
import busStops from "../data/transport/busStops";
import { fetchNearbyBusStops } from "../services/location/busStopService";
import { calculateDistance } from "../utils/location/distance";

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

  const fetchStops = useCallback(async () => {
    if (latitude == null || longitude == null) {
      setNearbyStops([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const staticNearby = busStops
      .map((stop) => {
        const distance = calculateDistance(latitude, longitude, stop.latitude, stop.longitude);
        return { ...stop, distance: Math.round(distance) };
      })
      .filter((stop) => stop.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    try {
      const dynamicStops = await fetchNearbyBusStops(latitude, longitude, radius);
      const taggedDynamic = dynamicStops.map((s) => ({ ...s, _dynamic: true }));
      const merged = deduplicateStops(staticNearby, taggedDynamic);
      merged.sort((a, b) => a.distance - b.distance);
      setNearbyStops(merged);
    } catch (err) {
      setError(err.message);
      setNearbyStops(staticNearby);
    } finally {
      setLoading(false);
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
