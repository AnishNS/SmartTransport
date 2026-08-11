// Mock admin service.
//
// Aggregates the shared mock data layer into everything the Admin Dashboard
// and the management pages need: fleet / driver / route / passenger KPIs,
// overview tables and alerts. No page component contains fixed numbers.

import drivers from "../../data/mock/driverData";
import vehicles from "../../data/mock/vehicleData";
import routeData from "../../data/mock/routeData";
import { getRouteById } from "../transport/routeService";
import {
  dailyPassengerCount,
  weeklyPassengerData,
} from "../../data/mock/passengerData";

export function getAdminProfile() {
  return {
    id: "AD-001",
    name: "Vijay Raghavan",
    email: "vijay@smarttransport.in",
    role: "Admin",
    department: "Operations & Control",
    phone: "+91 98765 00001",
    region: "Coimbatore, Tamil Nadu",
  };
}

export function getFleetStats() {
  return {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter((v) => v.status === "Active").length,
    maintenanceVehicles: vehicles.filter((v) => v.status === "Maintenance").length,
  };
}

export function getDriverStats() {
  return {
    totalDrivers: drivers.length,
    driversOnline: drivers.filter((d) => d.online).length,
  };
}

export function getRouteStats() {
  return {
    totalRoutes: routeData.length,
  };
}

export function getPassengerStats() {
  return { dailyPassengerCount };
}

export function getWeeklyAnalytics() {
  return weeklyPassengerData;
}

export function getWeeklyAverage() {
  if (weeklyPassengerData.length === 0) return 0;
  const sum = weeklyPassengerData.reduce((acc, d) => acc + d.passengers, 0);
  return Math.round(sum / weeklyPassengerData.length);
}

function getDailyPassengerChange() {
  const weeklyAverage = getWeeklyAverage();
  if (weeklyAverage === 0) return 0;
  return Math.round(((dailyPassengerCount - weeklyAverage) / weeklyAverage) * 100);
}

export function getKpis() {
  const fleet = getFleetStats();
  const driverStats = getDriverStats();
  const routeStats = getRouteStats();
  const onlineDelta = Math.max(0, driverStats.driversOnline - drivers.filter((d) => d.status === "On Trip").length);
  const activeDelta = Math.max(0, fleet.activeVehicles - fleet.maintenanceVehicles);

  return [
    { key: "totalVehicles", label: "Total Vehicles", value: fleet.totalVehicles, change: "+0" },
    { key: "activeVehicles", label: "Active Vehicles", value: fleet.activeVehicles, change: `+${activeDelta}` },
    { key: "totalDrivers", label: "Total Drivers", value: driverStats.totalDrivers, change: "+0" },
    { key: "driversOnline", label: "Drivers Online", value: driverStats.driversOnline, change: `+${onlineDelta}` },
    { key: "totalRoutes", label: "Total Routes", value: routeStats.totalRoutes, change: "+0" },
    { key: "dailyPassengers", label: "Daily Passengers", value: dailyPassengerCount, change: `+${getDailyPassengerChange()}%` },
  ];
}

export function getFleetOverview() {
  return routeData
    .map((route) => {
      const routeVehicles = vehicles.filter((v) => v.routeId === route.id);
      return {
        route: `Route ${route.routeNumber}`,
        vehicles: routeVehicles.length,
        active: routeVehicles.filter((v) => v.status === "Active").length,
        maintenance: routeVehicles.filter((v) => v.status === "Maintenance").length,
      };
    })
    .filter((row) => row.vehicles > 0);
}

export function getRoutePerformance() {
  const rows = [];
  for (const route of routeData) {
    const routeVehicles = vehicles.filter((v) => v.routeId === route.id);
    if (routeVehicles.length === 0) continue;

    const occupancyValues = routeVehicles.map((v) => v.occupancy).filter((o) => o > 0);
    const occupancy = occupancyValues.length
      ? Math.round(occupancyValues.reduce((acc, o) => acc + o, 0) / occupancyValues.length)
      : 0;

    const assignedDrivers = drivers.filter((d) => d.assignedRouteId === route.id);
    const onTime = assignedDrivers.length
      ? Math.round(assignedDrivers.reduce((acc, d) => acc + d.onTimePerformance, 0) / assignedDrivers.length)
      : 0;

    rows.push({
      route: `Route ${route.routeNumber}`,
      trips: route.dailyTrips,
      occupancy,
      onTime,
    });
  }
  return rows;
}

export function getDrivers() {
  return drivers.map((driver) => {
    const vehicle = vehicles.find((v) => v.id === driver.assignedVehicleId);
    const route = routeData.find((r) => r.id === driver.assignedRouteId);
    return {
      id: driver.id,
      name: driver.name,
      employeeCode: driver.employeeCode,
      vehicle: vehicle ? vehicle.vehicleNumber : "—",
      route: route ? `Route ${route.routeNumber}` : "—",
      status: driver.status,
      trips: driver.tripsToday,
      onTime: driver.onTimePerformance,
      rating: driver.rating,
      passengers: driver.passengersToday,
    };
  });
}

export function getVehicleList() {
  return vehicles.map((vehicle) => {
    const route = routeData.find((r) => r.id === vehicle.routeId);
    const driver = drivers.find((d) => d.id === vehicle.driverId);
    const availability =
      vehicle.status === "Active"
        ? "Available"
        : vehicle.status === "Maintenance"
          ? "In Maintenance"
          : vehicle.status === "Inactive"
            ? "Unavailable"
            : "Off Duty";
    return {
      id: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      model: vehicle.model,
      route: route ? `Route ${route.routeNumber}` : "Unassigned",
      driver: driver ? driver.name : "—",
      status: vehicle.status,
      availability,
      capacity: vehicle.capacity,
      occupancy: vehicle.occupancy,
      fuelLevel: vehicle.fuelLevel,
    };
  });
}

export function getRouteManagementList() {
  return routeData.map((route) => {
    const full = getRouteById(route.id);
    return {
      id: route.id,
      routeNumber: route.routeNumber,
      routeName: `${route.routeNumber} · ${route.routeName}`,
      source: route.source,
      destination: route.destination,
      distance: route.distance,
      estimatedTime: route.estimatedTime,
      frequency: route.frequency,
      stops: full ? full.stops : [],
      assignedVehicles: vehicles.filter((v) => v.routeId === route.id).length,
      activeVehicles: vehicles.filter((v) => v.routeId === route.id && v.status === "Active").length,
    };
  });
}

function routeLabel(routeId) {
  const route = routeData.find((r) => r.id === routeId);
  return route ? `${route.routeNumber} · ${route.routeName}` : "Route —";
}

export function getAlerts() {
  const alerts = [];

  vehicles
    .filter((v) => v.status === "Maintenance")
    .slice(0, 1)
    .forEach((v, i) => {
      alerts.push({
        title: `Vehicle ${v.vehicleNumber} in maintenance`,
        description: `${v.model} reported for service on ${routeLabel(v.routeId)}. Estimated downtime: 4 hours.`,
        time: i === 0 ? "30 min ago" : "2 hours ago",
        type: "warning",
      });
    });

  const lateDrivers = drivers.filter((d) => d.status === "On Trip" && d.onTimePerformance < 90);
  if (lateDrivers.length > 0) {
    const driver = lateDrivers[0];
    alerts.push({
      title: `Driver ${driver.name} running late`,
      description: `${driver.name} is running late on ${routeLabel(driver.assignedRouteId)} due to traffic.`,
      time: "1 hour ago",
      type: "alert",
    });
  }

  alerts.push({
    title: "New route optimization available",
    description: "AI analysis suggests 12% time savings on high-frequency routes with rerouting.",
    time: "2 hours ago",
    type: "info",
  });

  return alerts;
}
