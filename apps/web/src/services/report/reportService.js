// Report service — submits a driver/passenger accident/issue report.
//
// The backend resolves the reporter's identity from the verified session and
// creates a targeted notification for every admin account. `payload`:
//   { category, description, latitude?, longitude?, vehicleNumber? }

import { apiRequest } from "../api/client";

export async function submitReport(payload) {
  return apiRequest("post", "/api/reports", payload);
}

export default { submitReport };