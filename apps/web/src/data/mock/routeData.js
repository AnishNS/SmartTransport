// Mock route registry used by the Admin dashboards (route view, KPIs).
//
// The base network geometry stays in ../transport/routes.js (shared with the
// live vehicle simulation); this layer normalises the data for management
// views and attaches deterministic demo metrics (dailyTrips).

import routes from "../transport/routes";

const routeData = routes.map((route, index) => ({
  id: route.id,
  routeNumber: route.routeNumber,
  routeName: route.routeName,
  name: route.name,
  source: route.source,
  destination: route.destination,
  distance: route.distance,
  estimatedTime: route.estimatedTime,
  frequency: route.frequency,
  operatingHours: route.operatingHours,
  dailyTrips: 8 + ((index * 3) % 14),
}));

export default routeData;
