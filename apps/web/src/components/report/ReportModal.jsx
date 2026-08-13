import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import Button from "../ui/Button";
import { reportService } from "../../services/report";
import { getCurrentPosition } from "../../services/location/locationService";

const ACCIDENT_CATEGORY = "Accident";

const CATEGORIES = [
  ACCIDENT_CATEGORY,
  "Road Obstruction",
  "Overcrowding",
  "Driver Conduct",
  "Vehicle Issue",
  "Other",
];

// Shared modal for "Report Accident" (driver/passenger) and "Report Issue"
// (passenger). Collects a category + description, optionally attaches the
// user's browser geolocation, then submits to the backend which creates a
// targeted notification for every admin account (PART 11/12).
function ReportModal({
  title = "Report Issue",
  defaultCategory,
  vehicleNumber,
  onClose,
}) {
  const [category, setCategory] = useState(defaultCategory || "");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState(null);
  const [locStatus, setLocStatus] = useState("loading"); // loading | done | idle
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 30000,
    })
      .then((position) => {
        if (cancelled) return;
        setCoords({ latitude: position.latitude, longitude: position.longitude });
        setLocStatus("done");
      })
      .catch(() => {
        if (cancelled) return;
        setLocStatus("idle");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      setError("Please choose a report category.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe the issue before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await reportService.submitReport({
        category,
        description: description.trim(),
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        vehicleNumber: vehicleNumber || undefined,
      });
      setSuccess("Report submitted successfully.");
      setTimeout(onClose, 1100);
    } catch (submitError) {
      setError(submitError.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">
              {category === ACCIDENT_CATEGORY || defaultCategory === ACCIDENT_CATEGORY ? (
                <ShieldAlert size={20} className="text-red-600" />
              ) : (
                <AlertTriangle size={20} className="text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your report is sent directly to the transport control room.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Report Type
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              rows={4}
              maxLength={1000}
              placeholder={`Describe what happened in detail${
                category === ACCIDENT_CATEGORY ? " (location, vehicles involved, injuries, etc.)" : ""
              }...`}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {description.length}/1000
            </p>
          </div>

          {vehicleNumber && (
            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span className="text-sm font-medium text-gray-500">Vehicle:</span>
              <span className="text-sm font-bold text-gray-900">{vehicleNumber}</span>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            {locStatus === "loading" ? (
              <p className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 size={14} className="animate-spin" />
                Detecting your location...
              </p>
            ) : coords ? (
              <p className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin size={14} className="text-emerald-600" />
                Location attached: {coords.latitude.toFixed(5)},{" "}
                {coords.longitude.toFixed(5)}
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Location could not be detected and will not be attached.
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={submitting}
              type="submit"
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500/30"
            >
              {submitting ? "Submitting report..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;