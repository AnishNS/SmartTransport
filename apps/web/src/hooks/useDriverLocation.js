import { useEffect, useRef, useState } from "react";
import { getSocket, isSocketConnected } from "../services/realtime/socketClient";
import { translateGeolocationError } from "../services/location/locationService";

// Driver GPS reporter (Phase 1 of real-time tracking).
//
// - Starts navigator.geolocation.watchPosition() as soon as a trip becomes
//   active AND the driver has an assigned vehicle (browser permission is
//   requested at Start Trip).
// - Continuously captures latitude / longitude / accuracy / timestamp.
// - Throttled (~2s) Socket.IO updates to the backend, only WHILE a trip is
//   active and the socket is connected. Nothing is sent before a trip starts.
// - Stops the watch on: trip ended, driver logged out (tripActive false),
//   component unmount.
//
// Status surface for the Driver Dashboard:
//   gpsStatus: idle | requesting | connected | permission_denied |
//              unavailable | timeout | unsupported | error
//   socketStatus: connecting | connected | disconnected

const SEND_INTERVAL_MS = 2000;
const SEND_MIN_DISTANCE_DEG = 0.00005; // ~5.5 m
const HEARTBEAT_MS = 15000;

export default function useDriverLocation({
  enabled,
  driver,
  vehicle,
  tripId,
  tripActive,
}) {
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [socketStatus, setSocketStatus] = useState(
    isSocketConnected() ? "connected" : "disconnected"
  );
  const [position, setPosition] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const watchIdRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const lastSentPosRef = useRef(null);
  const socketRef = useRef(null);

  // Track socket connectivity so the UI can show a "socket disconnected"
  // state and so sends are skipped while offline.
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => setSocketStatus("connected");
    const onDisconnect = () => setSocketStatus("disconnected");
    const onConnectError = () => setSocketStatus("disconnected");

    setSocketStatus(socket.connected ? "connected" : "connecting");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);

  const clearWatch = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Start / stop the geolocation watch based on trip + assignment state.
  useEffect(() => {
    const canTrack =
      enabled &&
      tripActive &&
      driver?.id &&
      vehicle?.id &&
      typeof navigator !== "undefined" &&
      Boolean(navigator.geolocation);

    if (!canTrack) {
      clearWatch();
      setPosition(null);
      setGpsStatus("idle");
      return undefined;
    }

    if (!navigator.geolocation) {
      setGpsStatus("unsupported");
      return undefined;
    }

    setGpsStatus("requesting");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const timestamp = new Date(pos.timestamp).toISOString();
        setPosition({ latitude, longitude, accuracy, timestamp });
        setLastUpdate(timestamp);
        setGpsStatus("connected");
        if (import.meta.env.DEV) {
          console.info("[driver gps] GPS position received", { latitude, longitude, accuracy });
        }
      },
      (err) => {
        const message = translateGeolocationError(err).message;
        let status = "error";
        if (err.code === err.PERMISSION_DENIED) status = "permission_denied";
        else if (err.code === err.POSITION_UNAVAILABLE) status = "unavailable";
        else if (err.code === err.TIMEOUT) status = "timeout";
        setGpsStatus(status);
        if (err.code === err.PERMISSION_DENIED) clearWatch();
        if (import.meta.env.DEV) {
          console.warn("[driver gps]", message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    if (import.meta.env.DEV) {
      console.info("[driver gps] GPS tracking started");
    }

    return clearWatch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tripActive, driver?.id, vehicle?.id]);

  // Send throttled location updates while a trip is active + socket connected.
  useEffect(() => {
    if (
      !tripActive ||
      !tripId ||
      !driver?.id ||
      !vehicle?.id ||
      socketStatus !== "connected" ||
      !position
    ) {
      return undefined;
    }

    const socket = socketRef.current || getSocket();
    const payload = {
      driverId: driver.id,
      vehicleId: vehicle.id,
      tripId,
      latitude: position.latitude,
      longitude: position.longitude,
      accuracy: position.accuracy ?? null,
      timestamp: position.timestamp,
    };

    const now = Date.now();
    const lastPos = lastSentPosRef.current;
    const moved =
      !lastPos ||
      Math.abs(position.latitude - lastPos.latitude) >= SEND_MIN_DISTANCE_DEG ||
      Math.abs(position.longitude - lastPos.longitude) >= SEND_MIN_DISTANCE_DEG;
    const heartbeat = now - lastSentAtRef.current > HEARTBEAT_MS;
    const due = now - lastSentAtRef.current >= SEND_INTERVAL_MS;

    if (!(due && (moved || heartbeat))) return undefined;

    socket.emit("driver:location:update", payload, (ack) => {
      if (import.meta.env.DEV && ack && ack.success !== true) {
        console.info("[driver gps] server:", ack.error || "ignored");
      }
    });
    if (import.meta.env.DEV) {
      console.info("[driver gps] driver:location:update emitted", payload);
    }
    lastSentAtRef.current = Date.now();
    lastSentPosRef.current = {
      latitude: position.latitude,
      longitude: position.longitude,
    };
  }, [position, tripActive, tripId, driver?.id, vehicle?.id, socketStatus]);

  return {
    gpsStatus,
    socketStatus,
    latitude: position?.latitude ?? null,
    longitude: position?.longitude ?? null,
    accuracy: position?.accuracy ?? null,
    lastUpdate,
  };
}