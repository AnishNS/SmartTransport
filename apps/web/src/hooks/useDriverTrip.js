import { useState, useEffect, useCallback } from "react";
import {
  getInitialTripState,
  TRIP_STORAGE_KEY,
} from "../services/mock/driverService";

// Manages the driver's live (single) trip lifecycle. State is initialised from
// localStorage and kept in sync on every change so a refresh restores the
// current trip exactly where the driver left off.

export default function useDriverTrip() {
  const [tripState, setTripState] = useState(() => {
    try {
      const stored = localStorage.getItem(TRIP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...getInitialTripState(), ...parsed };
      }
    } catch {
      // ignore corrupted storage and fall back to defaults
    }
    return getInitialTripState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(tripState));
    } catch {
      // ignore quota / availability errors
    }
  }, [tripState]);

  const startTrip = useCallback(() => {
    setTripState((prev) => ({
      ...prev,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      pausedAt: null,
      endedAt: null,
      totalPausedMs: 0,
    }));
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

  const endTrip = useCallback(() => {
    setTripState((prev) => {
      if (prev.status !== "in_progress" && prev.status !== "paused") return prev;
      return {
        ...prev,
        status: "completed",
        pausedAt: null,
        endedAt: new Date().toISOString(),
        tripsCompleted: prev.tripsCompleted + 1,
      };
    });
  }, []);

  return { tripState, startTrip, pauseTrip, resumeTrip, endTrip };
}