import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { driverService } from "../services/driver";

// Loads the authenticated driver's real profile from Supabase.
//
// Returns:
//   { loading, error, driver, vehicle, user, reload }
//   - driver : drivers row { id, user_id, license_number, availability_status,
//             is_active, created_at } or null
//   - vehicle: assigned vehicle ({ vehicle_number, ... }) or null
//   - user   : the authenticated app user (name, email, phone, role)
//
// Identity rendering never falls back to a fake driver name: callers should
// show a "Driver profile unavailable" state when `error` is set or when
// `vehicle`/`driver` are missing.

export default function useDriverProfile({ enabled = true } = {}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(user?.id && enabled));
  const [error, setError] = useState("");
  const disposed = useRef(false);
  const userId = user?.id;

  const load = useCallback(async () => {
    if (!enabled) return;
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await driverService.getDriverProfile();
      if (!disposed.current) setProfile(data);
    } catch (err) {
      if (!disposed.current) setError(err.message || "Driver profile unavailable");
    } finally {
      if (!disposed.current) setLoading(false);
    }
  }, [userId, enabled]);

  useEffect(() => {
    disposed.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => {
      disposed.current = true;
    };
  }, [load]);

  return {
    loading,
    error,
    driver: profile || null,
    vehicle: profile?.vehicle || null,
    user,
    reload: load,
  };
}