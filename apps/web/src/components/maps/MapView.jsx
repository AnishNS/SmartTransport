import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import { DEFAULT_CENTER, DEFAULT_ZOOM, TILE_URL, TILE_ATTRIBUTION } from "../../services/maps";
import TransportNetworkLayer from "./TransportNetworkLayer";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "300px",
  borderRadius: "1rem",
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapView({ latitude, longitude, vehicles = [], zoom = DEFAULT_ZOOM, className = "" }) {
  const center = latitude != null && longitude != null
    ? [latitude, longitude]
    : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];

  return (
    <div className={`h-full min-h-[300px] w-full overflow-hidden rounded-2xl ${className}`} style={containerStyle}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", minHeight: "300px" }}
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
        />
        <TransportNetworkLayer
          latitude={latitude}
          longitude={longitude}
          vehicles={vehicles}
        />
      </MapContainer>
    </div>
  );
}

export default MapView;
