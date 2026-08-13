// Notification service — role-scoped, database-backed notifications.
//
// The `notifications` table is the single source of truth:
//   id, user_id, title, message, type, is_read, created_at
//
// Data flow (PART 16):
//   privileged backend action -> createNotification(userId, draft) -> row
//   target user               -> GET /api/notifications (requireAuth,
//                                  scoped server-side to auth.uid())
//
// Recipients are ALWAYS resolved on the backend from trusted records (e.g. the
// driver's user_id or the users whose role is 'admin'). The frontend can never
// pick which user receives a notification (PART 17): list/read endpoints are
// hard-scoped to the caller's authenticated user id.

const supabaseAdmin = require("../config/supabaseAdmin");

function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error(
      "Backend service-role client is not configured. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env."
    );
  }
  return supabaseAdmin;
}

// Persists a single notification row for `userId`. Returns the created row or
// null. Callers treat a failed notification as non-fatal (the underlying
// action has already succeeded); the failure is logged, never rethrown.
async function createNotification(userId, { title, message, type = "info" }) {
  if (!userId || !title) return null;
  const admin = requireAdminClient();

  const { data, error } = await admin
    .from("notifications")
    .insert({
      user_id: userId,
      title: String(title).slice(0, 150),
      message: String(message || "").slice(0, 2000),
      type: String(type || "info").slice(0, 30),
      is_read: false,
    })
    .select("id, title, message, type, is_read, created_at")
    .single();

  if (error) {
    console.warn("[notifications] could not persist notification:", error.message);
    return null;
  }
  return data;
}

// Resolves every user whose profile role is 'admin'. Used to deliver
// admin-scoped reports (accident / issue) so only the operations team sees
// them — never other passengers or drivers.
async function listAdminUserIds() {
  const admin = requireAdminClient();
  const { data, error } = await admin.from("users").select("id").eq("role", "admin");
  if (error) {
    console.warn("[notifications] could not resolve admin recipients:", error.message);
    return [];
  }
  return (data || []).map((row) => row.id);
}

// FAN OUT to every admin. Returns the list of created notifications (may be
// empty when no admin accounts exist yet). Non-destructive: never broadcasts
// sensitive reports to non-admin users.
async function notifyAdmins({ title, message, type = "alert" }) {
  const recipients = await listAdminUserIds();
  const created = [];
  for (const userId of recipients) {
    const notif = await createNotification(userId, { title, message, type });
    if (notif) created.push(notif);
  }
  return created;
}

// List the caller's own notifications, newest first. Reads via the service-role
// client but is ALWAYS filtered by the authenticated user id — a user can only
// ever read their own rows.
async function listNotifications(userId) {
  if (!userId) return [];
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .select("id, title, message, type, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(`Could not load notifications: ${error.message}`);
  }
  return data || [];
}

// Marks a single notification read, but only when it belongs to the caller.
async function markNotificationRead(notificationId, userId) {
  if (!notificationId || !userId) return null;
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("id, title, message, type, is_read, created_at")
    .single();
  if (error) {
    throw new Error(`Could not update the notification: ${error.message}`);
  }
  return data;
}

// Marks every unread notification of the caller as read.
async function markAllNotificationsRead(userId) {
  if (!userId) return [];
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)
    .select("id, title, message, type, is_read, created_at");
  if (error) {
    throw new Error(`Could not update notifications: ${error.message}`);
  }
  return data || [];
}

module.exports = {
  createNotification,
  notifyAdmins,
  listAdminUserIds,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};