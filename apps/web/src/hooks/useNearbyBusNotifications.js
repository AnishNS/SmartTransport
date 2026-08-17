import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { calculateDistance } from "../utils/location/distance";
import { createNotification } from "../services/notification/notificationService";

// Nearby-bus notification hook.
//
// Watches the passenger's GPS location against the live (real) vehicle feed.
// When a NEW active bus enters the nearby radius the hook emits a "Bus <number>
// is nearby" alert. Alerts are DERIVED from the current nearby set, so they
// disappear automatically the moment the bus leaves the radius, its trip ends,
// or the vehicle becomes inactive (no ETA is computed or claimed).
//
// It also best-effort persists one copy per trip into the existing notification
// center (notifications table via the backend), so the alert survives a page
// refresh. Only real-time buses (_realtime) are considered; the demo simulation
// fallback never triggers an alert.

function busKey(bus) {
  return `${bus.tripId || bus.vehicleId}:${bus.vehicleId}`;
}

function formatDistance(meters) {
  if (meters == null) return "";
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

export default function useNearbyBusNotifications(latitude, longitude, vehicles, radius = 2000) {
  const hasLocation =
    latitude != null &&
    longitude != null &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  // Real buses currently inside the radius, closest first.
  const nearby = useMemo(() => {
    if (!hasLocation) return [];
    return (vehicles || [])
      .filter(
        (v) =>
          v &&
          v._realtime &&
          v.vehicleId &&
          v.latitude != null &&
          v.longitude != null
      )
      .map((v) => ({
        ...v,
        _dist: Math.round(
          calculateDistance(latitude, longitude, v.latitude, v.longitude)
        ),
      }))
      .filter((v) => v._dist <= radius)
      .sort((a, b) => a._dist - b._dist);
  }, [hasLocation, latitude, longitude, vehicles, radius]);

  // Trips we already announced (no re-notify loop).
  const announced = useRef(new Set());
  // Alert keys the user manually dismissed (state so it can power rendering).
  const [dismissed, setDismissed] = useState(() => new Set());

  // Announce newly nearby buses (one per trip). Side effects only: ref writes
  // plus a best-effort insert into the notification center.
  const previous = useRef([]);
  useEffect(() => {
    for (const bus of nearby) {
      const key = busKey(bus);
      if (announced.current.has(key)) continue;
      announced.current.add(key);
      createNotification({
        title: `Bus ${bus.vehicleNumber} is nearby`,
        message: `${bus.routeName || "Live trip"} · ${formatDistance(bus._dist)} away`,
        type: "info",
      }).catch(() => {});
    }
    previous.current = nearby;
  }, [nearby]);

  // Visible alerts derived from the CURRENT nearby set. Dismissed buses stay
  // hidden; buses that moved away / ended their trip drop out on their own.
  const alerts = useMemo(
    () =>
      nearby
        .filter((bus) => !dismissed.has(busKey(bus)))
        .map((bus) => ({
          id: busKey(bus),
          vehicleNumber: bus.vehicleNumber,
          routeName: bus.routeName,
          routeId: bus.routeId,
          distance: bus._dist,
          distanceLabel: formatDistance(bus._dist),
          status: bus.status || "Active",
        })),
    [nearby, dismissed]
  );

  const dismiss = useCallback((id) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  return { nearby, alerts, dismiss };
}