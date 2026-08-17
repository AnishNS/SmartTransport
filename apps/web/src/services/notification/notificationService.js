// Notification service — database-backed, role-scoped notifications.
//
// The backend attaches the caller's Supabase token and hard-scopes every query
// to the authenticated user id (requireAuth), so a user can only read / update
// their OWN notifications. Recipients of broadcast notifications are chosen by
// the backend, never by this client.

import { apiRequest } from "../api/client";

// Returns the authenticated user's notifications, newest first.
//   { id, title, message, type, is_read, created_at }
export async function listNotifications() {
  const { notifications } = await apiRequest("get", "/api/notifications");
  return notifications || [];
}

// Persists a notification scoped to the caller (the backend always targets the
// authenticated user id). Best-effort: the passenger dashboard uses this to
// record "bus nearby" alerts into the existing notification center.
export async function createNotification(payload) {
  return apiRequest("post", "/api/notifications", payload);
}

// Marks a single notification read.
export async function markNotificationRead(id) {
  return apiRequest("patch", `/api/notifications/${id}/read`);
}

// Marks every unread notification of the caller as read.
export async function markAllNotificationsRead() {
  return apiRequest("patch", "/api/notifications/read-all");
}

export default { listNotifications, createNotification, markNotificationRead, markAllNotificationsRead };