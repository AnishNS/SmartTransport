// Report controllers — the single entry point for "Report Accident" /
// "Report Issue" from drivers and passengers (PART 11/12).
//
// requireAuth guarantees a valid session; the reporter's identity (name/role)
// is resolved server-side from public.users by reportService. The body carries
// only content: category, description, optional location and vehicle number.

const { submitReport } = require("../services/reportService");

async function submit(req, res) {
  const userId = req.authUser?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  try {
    const result = await submitReport({
      userId,
      category: req.body.category,
      description: req.body.description,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      vehicleNumber: req.body.vehicleNumber,
    });
    res.status(201).json({
      success: true,
      message: "Report submitted successfully.",
      ...result,
    });
  } catch (error) {
    console.error("[reports] could not submit:", error.message);
    res.status(400).json({
      success: false,
      message:
        error.message && error.message.includes("Please")
          ? error.message
          : "Unable to submit your report. Please try again.",
    });
  }
}

module.exports = { submit };