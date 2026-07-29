import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

function createIcon(type) {
  const isStand = type === "Bus Stand";
  const bgColor = isStand ? "#7c3aed" : "#3b82f6";
  const borderColor = isStand ? "#6d28d9" : "#2563eb";
  const emoji = isStand ? "🏛" : "🚏";
  const size = isStand ? 32 : 28;
  return new L.DivIcon({
    className: "bus-stop-marker",
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${bgColor};
      border: 3px solid ${borderColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px ${isStand ? "rgba(124,58,237,0.4)" : "rgba(59,130,246,0.3)"};
      font-size: ${isStand ? 13 : 14}px;
      color: white;
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

function BusStopMarker({ stop, userLat, userLng, showDistance = true }) {
  const walkingTimeMin = stop.distance != null ? Math.ceil(stop.distance / 83.33) : null;
  const hours = walkingTimeMin != null ? Math.floor(walkingTimeMin / 60) : null;
  const minutes = walkingTimeMin != null ? walkingTimeMin % 60 : null;
  const walkingTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

  return (
    <Marker position={[stop.latitude, stop.longitude]} icon={createIcon(stop.type)}>
      <Popup>
        <div style={{ minWidth: "180px", fontFamily: "system-ui, sans-serif" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#111" }}>
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
          {showDistance && stop.distance != null && (
            <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#666" }}>
              <strong>Distance:</strong> {stop.distance}m ({walkingTime} walk)
            </p>
          )}
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#999" }}>
            {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export default BusStopMarker;
