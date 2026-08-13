import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bus,
  Truck,
  UserCheck,
  UserX,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Power,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { adminService } from "../../services/admin";

const availabilityBadge = (vehicle) => {
  const status = String(vehicle.status || "").toLowerCase();
  if (status === "inactive") {
    return { label: "Inactive", style: "bg-red-50 text-red-700 border-red-200" };
  }
  if (status === "maintenance") {
    return { label: "Maintenance", style: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (vehicle.driver_id) {
    return { label: "Assigned", style: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  return { label: "Available", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
};

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-red-50 text-red-700 border-red-200",
};

function StatusBadge({ vehicle }) {
  const badge = availabilityBadge(vehicle);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.style}`}>
      {badge.label}
    </span>
  );
}

function RawStatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.active;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{value}</p>
          <p className="text-xs font-medium text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      {action}
    </div>
  );
}

const emptyForm = {
  vehicleNumber: "",
  vehicleType: "",
  capacity: "",
  status: "active",
};

function validateForm(form, isEdit) {
  const errors = {};
  if (!isEdit && !form.vehicleNumber.trim()) {
    errors.vehicleNumber = "Vehicle number is required";
  }
  if (form.capacity !== "" && (Number(form.capacity) < 1 || !Number.isFinite(Number(form.capacity)))) {
    errors.capacity = "Capacity must be a positive number";
  }
  return errors;
}

// Add / edit vehicle modal.
function VehicleModal({ vehicle, isEdit, onClose, onSaved }) {
  const [form, setForm] = useState(
    isEdit && vehicle
      ? {
          vehicleNumber: vehicle.vehicle_number,
          vehicleType: vehicle.vehicle_type || "",
          capacity: vehicle.capacity == null ? "" : String(vehicle.capacity),
          status: vehicle.status || "active",
        }
      : emptyForm
  );
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateForm(form, isEdit);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const payload = {
      vehicleType: form.vehicleType,
      capacity: form.capacity === "" ? null : Number(form.capacity),
    };
    if (!isEdit) payload.vehicleNumber = form.vehicleNumber;
    if (isEdit) payload.status = form.status;

    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = isEdit
        ? await adminService.updateVehicle(vehicle.id, payload)
        : await adminService.createVehicle({ ...payload, status: form.status });
      setSuccess(result.message || (isEdit ? "Vehicle updated." : "Vehicle added to the fleet."));
      if (onSaved) onSaved();
      setTimeout(onClose, 900);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Truck size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {isEdit ? "Edit Vehicle" : "Add Vehicle"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isEdit ? "Update fleet details for this vehicle." : "Register a new vehicle in the fleet."}
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
              Vehicle Number {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <input
              value={form.vehicleNumber}
              onChange={handleChange("vehicleNumber")}
              disabled={isEdit}
              placeholder="e.g. TN-38-BU-1234"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 uppercase outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:text-gray-400"
            />
            {errors.vehicleNumber && <p className="mt-1 text-xs text-red-500">{errors.vehicleNumber}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="group">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle Type
              </label>
              <input
                value={form.vehicleType}
                onChange={handleChange("vehicleType")}
                placeholder="e.g. Bus / Van / Mini-bus"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="group">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Capacity (seats)
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={handleChange("capacity")}
                placeholder="e.g. 40"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>}
            </div>
          </div>

          <div className="group">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={form.status}
              onChange={handleChange("status")}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
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
            <Button variant="outline" size="md" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" size="md" icon={busy ? null : isEdit ? Pencil : Plus} loading={busy} type="submit">
              {busy ? (isEdit ? "Updating vehicle..." : "Creating vehicle...") : isEdit ? "Save Changes" : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reused confirmation dialog for deactivate / reactivate / delete vehicle.
function ConfirmDialog({ title, message, confirmLabel, busy, error, onCancel, onConfirm, danger }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" size="md" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={busy}
            onClick={onConfirm}
            className={danger ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/30" : ""}
          >
            {busy ? "Updating fleet..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FleetManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");

  const fetchFleet = useCallback(async () => {
    const data = await adminService.listVehicles();
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    fetchFleet()
      .then((data) => {
        if (active) setVehicles(data);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchFleet]);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchFleet();
      setVehicles(data);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFleet]);

  const stats = useMemo(() => {
    const active = vehicles.filter((v) => String(v.status).toLowerCase() === "active").length;
    const inactive = vehicles.filter((v) => String(v.status).toLowerCase() === "inactive").length;
    const maintenance = vehicles.filter((v) => String(v.status).toLowerCase() === "maintenance").length;
    const assigned = vehicles.filter((v) => v.driver_id).length;
    return { total: vehicles.length, active, inactive, maintenance, assigned };
  }, [vehicles]);

  const showNotice = (message, type = "success") => {
    setNotice(message);
    setNoticeType(type);
  };

  const runConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, vehicle } = confirmAction;
    setActionBusy(true);
    setActionError("");
    try {
      let result;
      if (type === "deactivate") {
        result = await adminService.deactivateVehicle(vehicle.id);
      } else if (type === "reactivate") {
        result = await adminService.reactivateVehicle(vehicle.id);
      } else {
        result = await adminService.deleteVehicle(vehicle.id);
      }
      showNotice(result.message || "Fleet updated.");
      setConfirmAction(null);
      await loadVehicles();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setActionBusy(false);
    }
  };

  const statCards = [
    { icon: Truck, label: "Total Vehicles", value: String(stats.total), gradient: "from-blue-500 to-blue-600" },
    { icon: Bus, label: "Active", value: String(stats.active), gradient: "from-emerald-500 to-emerald-600" },
    { icon: UserCheck, label: "Assigned", value: String(stats.assigned), gradient: "from-blue-500 to-blue-600" },
    { icon: UserX, label: "Inactive", value: String(stats.inactive), gradient: "from-red-500 to-red-600" },
  ];

  const confirmConfig = confirmAction
    ? confirmAction.type === "deactivate"
      ? {
          title: "Deactivate Vehicle",
          message: `Are you sure you want to deactivate vehicle ${confirmAction.vehicle.vehicle_number}? It will be removed from service and any current driver assignment will be released. Historical records stay intact.`,
          confirmLabel: "Deactivate Vehicle",
          danger: true,
        }
      : confirmAction.type === "reactivate"
        ? {
            title: "Reactivate Vehicle",
            message: `Are you sure you want to reactivate vehicle ${confirmAction.vehicle.vehicle_number}? It will become available for assignment again.`,
            confirmLabel: "Reactivate Vehicle",
            danger: false,
          }
        : {
            title: "Delete Vehicle",
            message: `Are you sure you want to permanently delete vehicle ${confirmAction.vehicle.vehicle_number}? This is only allowed if it has no trip or location history.`,
            confirmLabel: "Delete Vehicle",
            danger: true,
          }
    : null;

  return (
    <DashboardLayout title="Fleet Management" role="admin">
      <PageHeader
        title="Fleet Management"
        subtitle="Register vehicles, manage statuses and track assignments."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Fleet Management" },
        ]}
        action={
          <Button variant="primary" size="md" icon={Plus} onClick={() => { setShowForm(true); setEditTarget(null); }}>
            Add Vehicle
          </Button>
        }
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {notice && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border p-4 border-emerald-200 bg-emerald-50">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">
              {noticeType === "success" ? "Success." : "Notice."}
            </p>
            <p className="mt-0.5 text-xs text-emerald-700">{notice}</p>
          </div>
          <button
            onClick={() => setNotice("")}
            className="rounded-lg p-1 text-emerald-500 transition-colors hover:bg-emerald-100"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {loadError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Could not load vehicles.</p>
            <p className="mt-0.5 text-xs text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={loadVehicles}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <RotateCcw size={13} /> Retry
            </button>
          </div>
        </div>
      )}

      <Card>
        <SectionHeader title="Vehicles" />
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-sm font-medium text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            Loading vehicles...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-12 text-center">
            <Truck size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No vehicles in the fleet yet.</p>
            <p className="mt-1 text-xs text-gray-400">Use "Add Vehicle" to register the first vehicle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Vehicle Number</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Type</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Capacity</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Status</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Availability</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Assigned Driver</th>
                  <th className="pb-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const isInactive = String(vehicle.status).toLowerCase() === "inactive";
                  return (
                    <tr key={vehicle.id} className="border-b border-gray-50 last:border-0 align-top">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <Bus size={16} className="text-blue-600" />
                          </div>
                          <span className="font-semibold text-gray-900">{vehicle.vehicle_number}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{vehicle.vehicle_type || "—"}</td>
                      <td className="py-3 pr-4 text-gray-700">{vehicle.capacity != null ? `${vehicle.capacity} seats` : "—"}</td>
                      <td className="py-3 pr-4">
                        <RawStatusBadge status={vehicle.status} />
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge vehicle={vehicle} />
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{vehicle.driver_name || "—"}</td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Pencil}
                            onClick={() => { setEditTarget(vehicle); setShowForm(true); }}
                          >
                            Edit
                          </Button>
                          {isInactive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={RotateCcw}
                              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                              onClick={() => setConfirmAction({ type: "reactivate", vehicle })}
                            >
                              Reactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Power}
                              className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
                              onClick={() => setConfirmAction({ type: "deactivate", vehicle })}
                            >
                              Deactivate
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Trash2}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => setConfirmAction({ type: "delete", vehicle })}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showForm && (
        <VehicleModal
          vehicle={editTarget}
          isEdit={Boolean(editTarget)}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={loadVehicles}
        />
      )}

      {confirmAction && confirmConfig && (
        <ConfirmDialog
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          danger={confirmConfig.danger}
          busy={actionBusy}
          error={actionError}
          onCancel={() => setConfirmAction(null)}
          onConfirm={runConfirmAction}
        />
      )}
    </DashboardLayout>
  );
}

export default FleetManagement;