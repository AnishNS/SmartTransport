const busStops = [
  // Route network stops (from routes.js)
  { id: "ST-001", name: "Ukkadam", latitude: 10.9934, longitude: 76.9611, type: "Bus Stop", routes: ["RT-001", "RT-004", "RT-006", "RT-009", "RT-012", "RT-015", "RT-017", "RT-020"] },
  { id: "ST-002", name: "Town Hall", latitude: 11.0048, longitude: 76.9658, type: "Bus Stop", routes: ["RT-001", "RT-004", "RT-006", "RT-012", "RT-015", "RT-017"] },
  { id: "ST-003", name: "Lakshmi Mills", latitude: 11.0075, longitude: 76.9680, type: "Bus Stop", routes: ["RT-001", "RT-005", "RT-012", "RT-016"] },
  { id: "ST-004", name: "Railway Station", latitude: 11.0120, longitude: 76.9630, type: "Bus Stop", routes: ["RT-001", "RT-002", "RT-011", "RT-012", "RT-013", "RT-022"] },
  { id: "ST-005", name: "Hope College", latitude: 11.0244, longitude: 76.9604, type: "Bus Stop", routes: ["RT-001", "RT-005", "RT-012", "RT-016"] },
  { id: "ST-006", name: "Gandhipuram", latitude: 11.0198, longitude: 76.9638, type: "Bus Stand", routes: ["RT-001", "RT-002", "RT-003", "RT-004", "RT-005", "RT-007", "RT-008", "RT-010", "RT-011", "RT-012", "RT-013", "RT-014", "RT-015", "RT-016", "RT-018", "RT-019", "RT-021", "RT-022"] },
  { id: "ST-007", name: "Bus Stand", latitude: 11.0100, longitude: 76.9750, type: "Bus Stand", routes: ["RT-002", "RT-004", "RT-011", "RT-013", "RT-015", "RT-022"] },
  { id: "ST-008", name: "Singanallur", latitude: 11.0035, longitude: 77.0360, type: "Bus Stop", routes: ["RT-002", "RT-013"] },
  { id: "ST-009", name: "R.S. Puram", latitude: 11.0140, longitude: 76.9540, type: "Bus Stop", routes: ["RT-003", "RT-014"] },
  { id: "ST-010", name: "Saibaba Colony", latitude: 11.0255, longitude: 76.9425, type: "Bus Stop", routes: ["RT-003", "RT-014"] },
  { id: "ST-011", name: "Thudiyalur", latitude: 11.0802, longitude: 76.9540, type: "Bus Stop", routes: ["RT-003", "RT-014"] },
  { id: "ST-012", name: "Saravanampatti", latitude: 11.0732, longitude: 76.9957, type: "Bus Stop", routes: ["RT-004", "RT-015"] },
  { id: "ST-013", name: "Airport", latitude: 11.0298, longitude: 77.0414, type: "Bus Stop", routes: ["RT-005", "RT-016"] },
  { id: "ST-014", name: "Peelamedu", latitude: 11.0300, longitude: 77.0438, type: "Bus Stop", routes: ["RT-005", "RT-016"] },

  // Additional area stops (from busData mock stops)
  { id: "ST-015", name: "Central Market", latitude: 11.0180, longitude: 76.9740, type: "Bus Stop", routes: ["RT-006", "RT-007", "RT-017", "RT-018"] },
  { id: "ST-016", name: "Gandhi Nagar", latitude: 11.0208, longitude: 76.9438, type: "Bus Stop", routes: ["RT-007", "RT-018"] },
  { id: "ST-017", name: "City Centre", latitude: 11.0250, longitude: 76.9550, type: "Bus Stop", routes: ["RT-006", "RT-017"] },
  { id: "ST-018", name: "Tech Park", latitude: 11.0350, longitude: 76.9650, type: "Bus Stop", routes: ["RT-008", "RT-019"] },
  { id: "ST-019", name: "MG Road", latitude: 10.9968, longitude: 76.9078, type: "Bus Stop", routes: ["RT-009", "RT-020"] },
  { id: "ST-020", name: "University Gate", latitude: 10.9850, longitude: 76.9200, type: "Bus Stop", routes: ["RT-009", "RT-020"] },
  { id: "ST-021", name: "College Campus", latitude: 10.9750, longitude: 76.9300, type: "Bus Stop", routes: ["RT-009", "RT-020"] },
  { id: "ST-022", name: "City Hospital", latitude: 11.0300, longitude: 76.9500, type: "Bus Stop", routes: ["RT-008", "RT-019"] },
  { id: "ST-023", name: "Lake View", latitude: 11.0068, longitude: 76.9838, type: "Bus Stop", routes: ["RT-007", "RT-018"] },
  { id: "ST-024", name: "Old Town", latitude: 11.0000, longitude: 76.9900, type: "Bus Stop", routes: ["RT-011", "RT-022"] },
  { id: "ST-025", name: "Market Square", latitude: 11.0050, longitude: 76.9780, type: "Bus Stop", routes: ["RT-006", "RT-007", "RT-017", "RT-018"] },
  { id: "ST-026", name: "City Market", latitude: 11.0450, longitude: 76.9850, type: "Bus Stop", routes: ["RT-010", "RT-021"] },
  { id: "ST-027", name: "Water Tank", latitude: 11.0528, longitude: 76.9998, type: "Bus Stop", routes: ["RT-010", "RT-021"] },
  { id: "ST-028", name: "Factory Gate", latitude: 11.0600, longitude: 77.0050, type: "Bus Stop", routes: ["RT-010", "RT-021"] },
  { id: "ST-029", name: "Industrial Area", latitude: 11.0700, longitude: 77.0100, type: "Bus Stop", routes: ["RT-010", "RT-021"] },
  { id: "ST-030", name: "Museum", latitude: 11.0608, longitude: 76.9318, type: "Bus Stop", routes: ["RT-008", "RT-019"] },
  { id: "ST-031", name: "Garden Road", latitude: 11.0550, longitude: 76.9400, type: "Bus Stop", routes: ["RT-008", "RT-019"] },
  { id: "ST-032", name: "Central Park", latitude: 11.0500, longitude: 76.9500, type: "Bus Stop", routes: ["RT-008", "RT-019"] },
];

export function getStopById(id) {
  return busStops.find((s) => s.id === id) || null;
}

export function getStopsByRoute(routeId) {
  return busStops.filter((s) => s.routes.includes(routeId));
}

export function getUniqueStopName(stop) {
  return stop.name;
}

export default busStops;
