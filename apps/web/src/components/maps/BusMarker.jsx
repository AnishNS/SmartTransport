import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const OCCUPANCY_COLORS = {
  low: { bg: "#059669", shadow: "rgba(5,150,105,0.5)" },
  medium: { bg: "#d97706", shadow: "rgba(217,119,6,0.5)" },
  high: { bg: "#dc2626", shadow: "rgba(220,38,38,0.5)" },
};

function getOccupancyColors(occupancy) {
  if (occupancy > 70) return OCCUPANCY_COLORS.high;
  if (occupancy > 40) return OCCUPANCY_COLORS.medium;
  return OCCUPANCY_COLORS.low;
}

const ANIM_STYLE_ID = "bus-marker-anim";

function injectAnimation() {
  if (document.getElementById(ANIM_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = ANIM_STYLE_ID;
  style.textContent = `
    @keyframes bus-pulse {
      0%, 100% { box-shadow: 0 0 0 0 var(--bus-shadow, rgba(37,99,235,0.6)); }
      50% { box-shadow: 0 0 0 10px var(--bus-shadow, rgba(37,99,235,0)); }
    }
  `;
  document.head.appendChild(style);
}

function BusMarker({ vehicle }) {
  const colors = getOccupancyColors(vehicle.occupancy);

  const icon = new L.DivIcon({
    className: "bus-marker-icon",
    html: `<div style="
      width: 34px; height: 34px;
      background: ${colors.bg};
      border: 2px solid #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px ${colors.shadow};
      font-size: 16px;
      cursor: pointer;
      animation: bus-pulse 2s ease-in-out infinite;
      --bus-shadow: ${colors.shadow};
    ">🚌</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });

  injectAnimation();

  return (
    <Marker position={[vehicle.latitude, vehicle.longitude]} icon={icon}>
      <Popup maxWidth={240}>
        <div style={{ minWidth: "180px", fontFamily: "system-ui, sans-serif" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#111" }}>
            🚌 {vehicle.vehicleNumber}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#555" }}>
            <strong>Route:</strong> {vehicle.routeName}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#555" }}>
            <strong>Speed:</strong> {vehicle.speed} km/h
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#555" }}>
            <strong>Occupancy:</strong> {vehicle.occupancy}/{vehicle.capacity} ({Math.round(vehicle.occupancy / vehicle.capacity * 100)}%)
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#555" }}>
            <strong>Next Stop:</strong> {vehicle.nextStop}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#555" }}>
            <strong>Status:</strong>{" "}
            <span style={{ color: vehicle.status === "On Time" ? "#059669" : "#dc2626", fontWeight: 600 }}>
              {vehicle.status}
            </span>
          </p>
          <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#999" }}>
            Updated: {new Date(vehicle.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export default BusMarker;
