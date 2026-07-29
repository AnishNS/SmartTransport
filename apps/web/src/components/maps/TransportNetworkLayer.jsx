import { Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { getAllRoutes, getAllStops } from "../../services/transport/routeService";
import { fetchNearbyBusStops } from "../../services/location/busStopService";
import BusMarker from "./BusMarker";
import busStops from "../../data/transport/busStops";

const passengerIcon = new L.DivIcon({
  className: "passenger-location-marker",
  html: `<div style="
    width: 24px; height: 24px;
    background: #3b82f6;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(59,130,246,0.5);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

function createStopIcon(type) {
  const isStand = type === "Bus Stand";
  const bgColor = isStand ? "#7c3aed" : "#059669";
  const borderColor = isStand ? "#6d28d9" : "#047857";
  const emoji = isStand ? "🏛" : "🚏";
  const size = isStand ? 32 : 28;
  return new L.DivIcon({
    className: "bus-stop-all-marker",
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${bgColor};
      border: 2.5px solid ${borderColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      font-size: ${isStand ? 12 : 13}px;
      color: white;
      opacity: 0.9;
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

const ROUTE_COLORS = [
  { color: "#059669", weight: 3, opacity: 0.6 },
  { color: "#2563eb", weight: 3, opacity: 0.6 },
  { color: "#d97706", weight: 3, opacity: 0.6 },
  { color: "#7c3aed", weight: 3, opacity: 0.6 },
  { color: "#dc2626", weight: 3, opacity: 0.6 },
];

function createDynamicStopIcon() {
  return new L.DivIcon({
    className: "bus-stop-dynamic-marker",
    html: `<div style="
      width: 26px; height: 26px;
      background: #0ea5e9;
      border: 2.5px solid #0284c7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(14,165,233,0.4);
      font-size: 11px;
      color: white;
      opacity: 0.9;
    ">📍</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -17],
  });
}

function FitNetworkBounds({ latitude, longitude, vehicles }) {
  const map = useMap();

  useEffect(() => {
    const points = [];

    if (latitude != null && longitude != null) {
      points.push([latitude, longitude]);
    }

    for (const stop of busStops) {
      points.push([stop.latitude, stop.longitude]);
    }

    for (const v of vehicles) {
      points.push([v.latitude, v.longitude]);
    }

    if (points.length > 1) {
      map.fitBounds(points, { padding: [60, 60], maxZoom: 14 });
    } else if (latitude != null) {
      map.setView([latitude, longitude], 14, { animate: true });
    }
  }, [latitude, longitude, vehicles, map]);

  return null;
}

function TransportNetworkLayer({ latitude, longitude, vehicles }) {
  const [dynamicStops, setDynamicStops] = useState([]);
  const routes = useMemo(() => getAllRoutes(), []);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    let cancelled = false;
    fetchNearbyBusStops(latitude, longitude, 1500)
      .then((stops) => {
        if (!cancelled) {
          const staticCoords = new Set(
            busStops.map((s) => `${s.latitude.toFixed(4)},${s.longitude.toFixed(4)}`)
          );
          setDynamicStops(
            stops.filter(
              (s) => !staticCoords.has(`${s.latitude.toFixed(4)},${s.longitude.toFixed(4)}`)
            )
          );
        }
      })
      .catch(() => {
        if (!cancelled) setDynamicStops([]);
      });
    return () => { cancelled = true; };
  }, [latitude, longitude]);

  const polylines = useMemo(() => {
    return routes.map((route, i) => {
      const positions = route.stops.map((s) => [s.latitude, s.longitude]);
      const style = ROUTE_COLORS[i % ROUTE_COLORS.length];
      return (
        <Polyline
          key={route.id}
          positions={positions}
          pathOptions={{
            color: style.color,
            weight: style.weight,
            opacity: style.opacity,
            dashArray: "8 6",
          }}
        />
      );
    });
  }, [routes]);

  return (
    <>
      <FitNetworkBounds
        latitude={latitude}
        longitude={longitude}
        vehicles={vehicles}
      />

      {polylines}

      {latitude != null && longitude != null && (
        <Marker position={[latitude, longitude]} icon={passengerIcon}>
          <Popup>
            <div style={{ minWidth: "150px", fontFamily: "system-ui, sans-serif" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "#111" }}>
                Your Location
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#666" }}>
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {busStops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.latitude, stop.longitude]}
          icon={createStopIcon(stop.type)}
        >
          <Popup>
            <div style={{ minWidth: "160px", fontFamily: "system-ui, sans-serif" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "#111" }}>
                {stop.name}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>
                {stop.type}
              </p>
              {stop.routes && stop.routes.length > 0 && (
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#666" }}>
                  Routes: {stop.routes.join(", ")}
                </p>
              )}
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#666" }}>
                {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {dynamicStops.map((stop) => (
        <Marker
          key={`osm-${stop.id}`}
          position={[stop.latitude, stop.longitude]}
          icon={createDynamicStopIcon()}
        >
          <Popup>
            <div style={{ minWidth: "160px", fontFamily: "system-ui, sans-serif" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "#111" }}>
                {stop.name}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#0ea5e9" }}>
                Nearby Stop
              </p>
              {stop.distance != null && (
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#666" }}>
                  Distance: {stop.distance}m
                </p>
              )}
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#666" }}>
                {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {vehicles.map((v) => (
        <BusMarker key={v.id} vehicle={v} />
      ))}
    </>
  );
}

export default TransportNetworkLayer;
