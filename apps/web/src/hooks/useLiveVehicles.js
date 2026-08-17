import { useState, useEffect } from "react";
import {
  startVehicleSimulation,
  stopVehicleSimulation,
  subscribeToVehicles,
  getVehicles,
} from "../services/transport/vehicleSimulationService";
import {
  subscribeLiveVehicles,
  getLiveVehicles,
} from "../services/realtime/liveLocationService";

// Combines the demo simulation feed with the REAL Socket.IO bus feed.
//
// Simulated vehicles are purely a fallback so the existing map/UI keeps
// working with no live trips on the network. As soon as ANY real bus is active
// (published by the backend for ACTIVE trips only) the simulated fleet is
// dropped entirely — passengers must see the driver's actual GPS position, not
// demo coordinates.

function mergeVehicles(simulated, real) {
  if (real.length > 0) return real;
  return simulated;
}

export default function useLiveVehicles() {
  const [vehicles, setVehicles] = useState(() =>
    mergeVehicles(startVehicleSimulation(), getLiveVehicles())
  );

  useEffect(() => {
    // Restart the simulation if a previous unmount (e.g. StrictMode cleanup)
    // stopped it, then keep the component in sync with each movement tick.
    startVehicleSimulation();

    const unsubscribeSim = subscribeToVehicles((updated) => {
      setVehicles(mergeVehicles(updated, getLiveVehicles()));
    });

    const unsubscribeReal = subscribeLiveVehicles(() => {
      setVehicles(mergeVehicles(getVehicles(), getLiveVehicles()));
    });

    return () => {
      unsubscribeSim();
      unsubscribeReal();
      stopVehicleSimulation();
    };
  }, []);

  return { vehicles, loading: false };
}