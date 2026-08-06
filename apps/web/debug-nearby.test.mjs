import { createRoot } from "react-dom/client";
import React from "react";
import { StrictMode } from "react";
import { JSDOM } from "jsdom";
import axios from "axios";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/",
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.localStorage = dom.window.localStorage;

const WRAP = process.env.WRAP === "strict";
const GEO = process.env.GEO || "success";

global.navigator.geolocation = {
  getCurrentPosition(success, error) {
    setTimeout(() => {
      if (GEO === "success") {
        success({
          coords: {
            latitude: 11.0168,
            longitude: 76.9558,
            accuracy: 20,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
        });
      } else if (GEO === "denied") {
        const e = new Error("denied");
        e.code = 1;
        e.PERMISSION_DENIED = 1;
        e.POSITION_UNAVAILABLE = 2;
        e.TIMEOUT = 3;
        error(e);
      } else if (GEO === "never") {
        // never resolve
      }
    }, 10);
  },
};

axios.get = async () => ({
  data: { display_name: "Test City, Coimbatore", address: { city: "Coimbatore" } },
});

import usePassengerLocation from "./src/hooks/usePassengerLocation.js";
import useNearbyBusStops from "./src/hooks/useNearbyBusStops.js";
import useLiveVehicles from "./src/hooks/useLiveVehicles.js";

function TestComponent() {
  const { vehicles, loading: vehiclesLoading } = useLiveVehicles();
  const {
    latitude,
    longitude,
    loading: geoLoading,
    error: geoError,
  } = usePassengerLocation();
  const {
    busStops,
    nearestStop,
    loading: stopsLoading,
    error: stopsError,
  } = useNearbyBusStops(latitude, longitude);
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    console.log(
      "LOG",
      "frame=" + frame,
      "vehicles=" + vehicles.length,
      "lat=" + latitude,
      "lng=" + longitude,
      "geoLoading=" + geoLoading,
      "stopsLoading=" + stopsLoading,
      "stops=[" + busStops.map((s) => s.name + ":" + s.distance).join(",") + "]",
      "nearest=" + (nearestStop ? nearestStop.name + ":" + nearestStop.distance : "null")
    );
  });

  React.useEffect(() => {
    const t = setTimeout(() => setFrame((f) => f + 1), 120);
    return () => clearTimeout(t);
  }, [frame]);

  return React.createElement("div", null, String(busStops.length));
}

const root = createRoot(document.getElementById("root"));
root.render(
  WRAP
    ? React.createElement(StrictMode, null, React.createElement(TestComponent))
    : React.createElement(TestComponent)
);

setTimeout(() => {
  process.exit(0);
}, 2500);
