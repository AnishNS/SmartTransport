import { useState, useEffect, useRef } from "react";
import { getCurrentPosition } from "../services/location/locationService";
import { reverseGeocode } from "../services/location/geocodeService";

function useGeolocation(options = {}) {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [address, setAddress] = useState(null);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastCoords = useRef("");

  useEffect(() => {
    let cancelled = false;

    async function fetchLocation() {
      try {
        setLoading(true);
        setError(null);

        const coords = await getCurrentPosition({
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 0,
        });

        if (cancelled) return;

        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        setAccuracy(coords.accuracy);
        setLoading(false);

        const coordKey = `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`;

        if (coordKey !== lastCoords.current) {
          lastCoords.current = coordKey;

          try {
            const result = await reverseGeocode(coords.latitude, coords.longitude);
            if (!cancelled) {
              setAddress(result.address);
              setCity(result.city || result.state || result.country);
            }
          } catch (geoErr) {
            if (!cancelled) {
              setError(geoErr.message);
            }
          }
        }
      } catch (locErr) {
        if (!cancelled) {
          setError(locErr.message);
          setLoading(false);
        }
      }
    }

    fetchLocation();

    return () => {
      cancelled = true;
    };
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  return { latitude, longitude, accuracy, address, city, loading, error };
}

export default useGeolocation;
