import { useState, useEffect } from "react";
import {
  startSimulation,
  stopSimulation,
  subscribe,
} from "../services/simulation/vehicleSimulation";

export default function useLiveVehicles() {
  const [vehicles, setVehicles] = useState(() => {
    const initial = startSimulation();
    return initial;
  });
  const loading = false;

  useEffect(() => {
    const unsubscribe = subscribe((updated) => {
      setVehicles([...updated]);
    });

    return () => {
      unsubscribe();
      stopSimulation();
    };
  }, []);

  return { vehicles, loading };
}
