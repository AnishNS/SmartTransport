// Report service — turns a passenger/driver "Report Accident" / "Report Issue"
// submission into a targeted notification for every admin account.
//
// Flow (PART 11):
//   driver/passenger -> backend POST /api/reports (requireAuth)
//     -> reporter identity resolved server-side from public.users
//     -> notifyAdmins() creates a notification row per admin user
//
// The reporter's name/role come from the trusted profile row, never from the
// request body, so a user cannot impersonate another role. The only
// client-supplied fields are content (category, description, optional
// location/vehicle), which carry no privilege.

const supabaseAdmin = require("../config/supabaseAdmin");
const { notifyAdmins } = require("./notificationService");

function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error(
      "Backend service-role client is not configured. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env."
    );
  }
  return supabaseAdmin;
}

async function submitReport({
  userId,
  category,
  description,
  latitude,
  longitude,
  vehicleNumber,
}) {
  const categoryText = String(category || "").trim();
  const descriptionText = String(description || "").trim();

  if (!categoryText) {
    throw new Error("Please choose a report category.");
  }
  if (!descriptionText) {
    throw new Error("Please describe the issue before submitting.");
  }
  if (descriptionText.length > 1000) {
    throw new Error("Please keep the description under 1000 characters.");
  }

  // Resolve the reporter identity from the trusted profile row.
  const admin = requireAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("name, role")
    .eq("id", userId)
    .maybeSingle();

  const isAccident = /(^|\s)accident(\s|$)/i.test(categoryText);
  const title = isAccident ? "Accident Report" : "Issue Report";

  const roleLabel =
    profile?.role === "driver"
      ? "driver"
      : profile?.role === "passenger"
        ? "passenger"
        : "user";

  const details = [
    `A ${roleLabel} has reported ${isAccident ? "an accident" : "an issue"}.`,
    profile?.name ? `Reported by: ${profile.name}` : "",
    `Category: ${categoryText}`,
    vehicleNumber ? `Vehicle: ${vehicleNumber}` : "",
    latitude != null && longitude != null
      ? `Location: ${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`
      : "",
    `Description: ${descriptionText}`,
  ].filter(Boolean);

  const created = await notifyAdmins({
    title,
    message: details.join("\n"),
    type: isAccident ? "alert" : "warning",
  });

  if (!created.length) {
    throw new Error(
      "Your report could not be delivered at the moment. Please try again."
    );
  }

  return {
    deliveredTo: created.length,
    category: categoryText,
    isAccident,
  };
}

module.exports = { submitReport };