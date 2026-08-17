// Notification controllers — self-scoped for the authenticated user.
//
// Every handler identifies the caller from the verified Supabase JWT
// (req.authUser.id set by requireAuth) and scopes all data access to it:
// a user can only read or update their OWN notifications. The recipient is
// never taken from the request, so nobody can read/mark another user's rows.

const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
} = require("../services/notificationService");

async function list(req, res) {
  const userId = req.authUser?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  try {
    const notifications = await listNotifications(userId);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("[notifications] could not list:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load notifications. Please try again.",
    });
  }
}

// Self-scoped create: the recipient is ALWAYS the authenticated caller (never
// taken from the request). Used by the passenger dashboard to persist "bus
// nearby" alerts into the existing notification center. Non-fatal — a failed
// insert never blocks the live UI.
async function create(req, res) {
  const userId = req.authUser?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const { title, message, type } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ success: false, message: "Notification title is required." });
  }

  try {
    const notification = await createNotification(userId, {
      title: String(title).slice(0, 150),
      message: String(message || "").slice(0, 2000),
      type: ["info", "warning", "alert"].includes(type) ? type : "info",
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error("[notifications] could not create:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to save the notification. Please try again.",
    });
  }
}

async function markRead(req, res) {
  const userId = req.authUser?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  try {
    const notification = await markNotificationRead(req.params.id, userId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("[notifications] could not mark read:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to update the notification. Please try again.",
    });
  }
}

async function markAllRead(req, res) {
  const userId = req.authUser?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  try {
    const updated = await markAllNotificationsRead(userId);
    res.status(200).json({ success: true, updated: updated.length });
  } catch (error) {
    console.error("[notifications] could not mark all read:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to update notifications. Please try again.",
    });
  }
}

module.exports = { list, create, markRead, markAllRead };