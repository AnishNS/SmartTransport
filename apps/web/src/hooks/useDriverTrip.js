import { useState, useEffect, useCallback } from "react";
import {
  getInitialTripState,
  TRIP_STORAGE_KEY,
} from "../services/mock/driverService";
import {
  startDriverTrip,
  endDriverTrip,
  getCurrentTrip,
} from "../services/driver/tripService";

// Manages the driver's live (single) trip lifecycle. State is initialised from
// localStorage and kept in sync on every change so a refresh restores the
// current trip exactly where the driver left off.
//
// When the Node backend is reachable the trip is ALSO persisted in Supabase
// (start/end), which is what lets Socket.IO validate that a GPS update belongs
// to an active trip. If the backend is unavailable the hook degrades to the
// original local-only behaviour and the returned tripId stays null.

export default function useDriverTrip() {
  const [tripState, setTripState] = useState(() => {
    try {
      const stored = localStorage.getItem(TRIP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...getInitialTripState(), tripId: null, ...parsed };
      }
    } catch {
      // ignore corrupted storage and fall back to defaults
    }
    return { ...getInitialTripState(), tripId: null };
  });

  useEffect(() => {
    try {
      localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(tripState));
    } catch {
      // ignore quota / availability errors
    }
  }, [tripState]);

  // Restore an in-progress backend trip on mount (e.g. after a page refresh)
  // so GPS reporting resumes instead of silently stopping.
  useEffect(() => {
    let active = true;
    getCurrentTrip().then((trip) => {
      if (!active || !trip?.id) return;
      setTripState((prev) => {
        if (prev.status !== "idle") return prev;
        return {
          ...prev,
          status: "in_progress",
          startedAt: trip.start_time || prev.startedAt,
          tripId: trip.id,
        };
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const startTrip = useCallback(async (routeId) => {
    setTripState((prev) => ({
      ...prev,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      pausedAt: null,
      endedAt: null,
      totalPausedMs: 0,
    }));

    // Persist the trip server-side (best-effort). The local status is already
    // set, so a backend failure never blocks the driver. The driver's assigned
    // vehicle's route is passed through so the trip is linked to a real route.
    const trip = await startDriverTrip({ routeId: routeId || null });
    if (trip?.id) {
      setTripState((prev) => ({ ...prev, tripId: trip.id }));
    }
  }, []);

  const pauseTrip = useCallback(() => {
    setTripState((prev) =>
      prev.status === "in_progress"
        ? { ...prev, status: "paused", pausedAt: new Date().toISOString() }
        : prev
    );
  }, []);

  const resumeTrip = useCallback(() => {
    setTripState((prev) => {
      if (prev.status !== "paused" || !prev.pausedAt) return prev;
      const pausedDuration = Date.now() - new Date(prev.pausedAt).getTime();
      return {
        ...prev,
        status: "in_progress",
        pausedAt: null,
        totalPausedMs: prev.totalPausedMs + pausedDuration,
      };
    });
  }, []);

  const endTrip = useCallback(async () => {
    const current = tripState;
    let nextId = null;
    if (current.tripId) {
      const ended = await endDriverTrip(current.tripId);
      nextId = ended ? null : current.tripId;
    }
    setTripState((prev) => {
      if (prev.status !== "in_progress" && prev.status !== "paused") return prev;
      return {
        ...prev,
        status: "completed",
        pausedAt: null,
        endedAt: new Date().toISOString(),
        tripsCompleted: prev.tripsCompleted + 1,
        tripId: nextId,
      };
    });
  }, [tripState]);

  return { tripState, startTrip, pauseTrip, resumeTrip, endTrip };
}