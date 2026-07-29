import { calculateDistance } from "../../utils/location/distance";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const TIMEOUT_MS = 15000;
const CACHE_PREFIX = "nearby_bus_stops";
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCacheKey(latitude, longitude, radius) {
  const lat = latitude.toFixed(4);
  const lng = longitude.toFixed(4);
  return `${CACHE_PREFIX}_${lat}_${lng}_${radius}`;
}

function getCachedData(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCachedData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
  }
}

export async function fetchNearbyBusStops(latitude, longitude, radius = 1000) {
  const cacheKey = getCacheKey(latitude, longitude, radius);
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  const query = `
    [out:json][timeout:25];
    (
      node["highway"="bus_stop"](around:${radius},${latitude},${longitude});
      node["public_transport"="platform"](around:${radius},${latitude},${longitude});
    );
    out center;
  `;

  let lastError;

  for (const url of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const elements = data?.elements || [];

      if (elements.length === 0) {
        setCachedData(cacheKey, []);
        return [];
      }

      const stops = elements
        .filter((el) => el.lat != null && el.lon != null)
        .map((el) => {
          const stopLat = el.lat;
          const stopLng = el.lon;
          const name = el.tags?.name || el.tags?.ref || "Bus Stop";
          const distance = calculateDistance(latitude, longitude, stopLat, stopLng);

          return {
            id: String(el.id),
            name,
            latitude: stopLat,
            longitude: stopLng,
            distance: Math.round(distance),
            tags: el.tags || {},
          };
        })
        .filter((stop) => stop.distance <= radius);

      setCachedData(cacheKey, stops);
      return stops;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      if (err.name === "AbortError") {
        continue;
      }
    }
  }

  const fallback = getCachedData(cacheKey);
  if (fallback) {
    return fallback;
  }

  if (lastError?.name === "AbortError") {
    throw new Error("Request timed out. Please try again.");
  }

  if (!lastError) {
    return [];
  }

  throw new Error("Server unavailable. Please check your connection and try again.");
}
