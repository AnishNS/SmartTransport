import { useState, useEffect } from "react";
import {
  startVehicleSimulation,
  stopVehicleSimulation,
  subscribeToVehicles,
} from "../services/transport/vehicleSimulationService";

export default function useLiveVehicles() {
  const [vehicles, setVehicles] = useState(() => startVehicleSimulation());

  useEffect(() => {
    // Restart the simulation if a previous unmount (e.g. StrictMode cleanup)
    // stopped it, then keep the component in sync with each movement tick.
    startVehicleSimulation();

    const unsubscribe = subscribeToVehicles((updated) => {
      setVehicles([...updated]);
    });

    return () => {
      unsubscribe();
      stopVehicleSimulation();
    };
  }, []);

  return { vehicles, loading: false };
}
