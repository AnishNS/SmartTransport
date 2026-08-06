import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import BusStopMarker from "./BusStopMarker";
import { getAllBusStops } from "../../services/transport/stopService";
import { useEffect } from "react";

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

function FitBounds({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    const points = [[latitude, longitude]];
    getAllBusStops().forEach((s) => points.push([s.latitude, s.longitude]));

    if (points.length > 1) {
      map.fitBounds(points, { padding: [50, 50], maxZoom: 16 });
    } else {
      map.setView([latitude, longitude], 15, { animate: true });
    }
  }, [latitude, longitude, map]);

  return null;
}

function TransportLayer({ latitude, longitude }) {
  return (
    <>
      <FitBounds latitude={latitude} longitude={longitude} />
      {latitude != null && longitude != null && (
        <Marker position={[latitude, longitude]} icon={passengerIcon} />
      )}
      {getAllBusStops().map((stop) => (
        <BusStopMarker
          key={stop.id}
          stop={stop}
          userLat={latitude}
          userLng={longitude}
        />
      ))}
    </>
  );
}

export default TransportLayer;
