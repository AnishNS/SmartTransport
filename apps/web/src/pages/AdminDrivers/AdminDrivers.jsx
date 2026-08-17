import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  Lock,
  BadgeCheck,
  RefreshCw,
  UserCheck,
  UserX,
  Car,
  Trash2,
  RotateCcw,
  Unlink,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import InputField from "../../components/forms/InputField";
import { adminService } from "../../services/admin";
import { getInitials } from "../../utils/format";

const availabilityStyles = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unavailable: "bg-gray-50 text-gray-600 border-gray-200",
};

const activeStyles = {
  true: "bg-emerald-50 text-emerald-700 border-emerald-200",
  false: "bg-red-50 text-red-700 border-red-200",
};

function StatusBadge({ status }) {
  const style = availabilityStyles[status] || availabilityStyles.unavailable;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status === "available" ? "Available" : "Unavailable"}
    </span>
  );
}

function ActiveBadge({ active }) {
  const style = activeStyles[String(active)];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {active ? "Active" : "Deactivated"}
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
          <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
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
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// Generic confirmation dialog used for deactivate / reactivate. Deliberately
// requires an explicit confirm click so a single accidental click can never
// deactivate a driver.
function ConfirmDialog({ title, message, confirmLabel, busy, error, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
          <Button variant="primary" size="md" loading={busy} onClick={onConfirm} className="bg-red-600 hover:bg-red-700 focus:ring-red-500/30">
            {busy ? "Updating driver..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Assign-vehicle modal. Shows the driver's current vehicle plus the pool of
// available (unassigned, active) vehicles. The backend enforces exclusive
// assignment, so a vehicle can never end up on two drivers.
function AssignVehicleModal({ driver, onClose, onAssigned }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(driver?.vehicle?.id || "");
  const [assigning, setAssigning] = useState(false);
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    adminService
      .listVehicles({ available: true })
      .then((list) => {
        if (active) setVehicles(list);
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
  }, []);

  const handleAssign = async () => {
    if (!selected) {
      setActionError("Please select a vehicle.");
      return;
    }
    if (selected === driver?.vehicle?.id) {
      setActionError("This vehicle is already assigned to the driver.");
      return;
    }
    setAssigning(true);
    setActionError("");
    setSuccess("");
    try {
      const result = await adminService.assignVehicle(driver.id, selected);
      setSuccess(result.message || "Vehicle assigned successfully.");
      if (onAssigned) onAssigned();
      setTimeout(onClose, 900);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!driver?.vehicle) return;
    setAssigning(true);
    setActionError("");
    setSuccess("");
    try {
      const result = await adminService.unassignVehicle(driver.id);
      setSuccess(result.message || "Vehicle unassigned.");
      if (onAssigned) onAssigned();
      setTimeout(onClose, 900);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">Assign Vehicle</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {driver?.name || "Driver"} · {driver?.email || ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Currently Assigned</p>
          {driver?.vehicle ? (
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <Car size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{driver.vehicle.vehicle_number}</p>
                  <p className="text-xs text-gray-500">
                    {driver.vehicle.vehicle_type || "Vehicle"} · {driver.vehicle.capacity ? `${driver.vehicle.capacity} seats` : ""}
                  </p>
                  {driver.vehicle.routes && (
                    <p className="mt-0.5 text-xs font-medium text-blue-600">
                      {(driver.vehicle.routes.route_code || "Route") + " · " + driver.vehicle.routes.route_name}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" icon={Unlink} loading={assigning} onClick={handleUnassign}>
                Unassign
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-sm font-medium text-gray-700">Not assigned</p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm font-medium text-gray-500">
            <Loader2 size={18} className="animate-spin" /> Loading available vehicles...
          </div>
        ) : loadError ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{loadError}</p>
          </div>
        ) : (
          <div className="group">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Available Vehicles
            </label>
            <select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setActionError("");
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value={driver?.vehicle?.id || ""}>
                {driver?.vehicle ? `${driver.vehicle.vehicle_number} (currently assigned)` : "Select a vehicle..."}
              </option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_number}{vehicle.vehicle_type ? ` · ${vehicle.vehicle_type}` : ""}{vehicle.route ? ` · ${vehicle.route.route_code || "Route"}: ${vehicle.route.route_name}` : " · No route"}
                </option>
              ))}
            </select>
            {vehicles.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">No available vehicles.</p>
            )}
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        )}
        {actionError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{actionError}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="md" onClick={onClose} disabled={assigning}>
            Cancel
          </Button>
          <Button variant="primary" size="md" icon={Car} loading={assigning} onClick={handleAssign} disabled={loading}>
            {assigning ? "Assigning vehicle..." : "Assign Vehicle"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  licenseNumber: "",
  availabilityStatus: "available",
  password: "",
};

function validateForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Invalid email format";
  }
  if (form.phone && !/^[+\d][\d\s-]{7,}$/.test(form.phone)) {
    errors.phone = "Please provide a valid phone number";
  }
  if (!form.licenseNumber.trim()) {
    errors.licenseNumber = "License number is required";
  }
  if (!form.password) {
    errors.password = "Temporary password is required";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  return errors;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [assignTarget, setAssignTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchDriversData = useCallback(async () => {
    const data = await adminService.listDrivers();
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    fetchDriversData()
      .then((data) => {
        if (active) setDrivers(data);
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
  }, [fetchDriversData]);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchDriversData();
      setDrivers(data);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchDriversData]);

  const stats = useMemo(() => {
    const active = drivers.filter((d) => d.is_active !== false).length;
    const available = drivers.filter((d) => d.is_active !== false && d.availability_status === "available").length;
    return {
      total: drivers.length,
      active,
      available,
      deactivated: drivers.length - active,
    };
  }, [drivers]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setFormError("");
    try {
      const result = await adminService.createDriver(form);
      setNotice(result.message || `Driver account for ${form.name.trim()} was created.`);
      setNoticeType("success");
      setShowForm(false);
      setForm(emptyForm);
      await loadDrivers();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Deactivate / reactivate a driver through a confirmation dialog.
  const confirmDeactivate = (driver) => {
    setActionError("");
    setConfirmAction({ type: "deactivate", driver });
  };

  const confirmReactivate = (driver) => {
    setActionError("");
    setConfirmAction({ type: "reactivate", driver });
  };

  const runConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, driver } = confirmAction;
    setActionBusy(true);
    setActionError("");
    try {
      const result =
        type === "deactivate"
          ? await adminService.deactivateDriver(driver.id)
          : await adminService.reactivateDriver(driver.id);
      setNotice(result.message || (type === "deactivate" ? "Driver deactivated." : "Driver reactivated."));
      setNoticeType("success");
      setConfirmAction(null);
      await loadDrivers();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setActionBusy(false);
    }
  };

  const statCards = [
    { icon: Users, label: "Total Drivers", value: String(stats.total), gradient: "from-blue-500 to-blue-600" },
    { icon: UserCheck, label: "Active", value: String(stats.active), gradient: "from-emerald-500 to-emerald-600" },
    { icon: UserX, label: "Deactivated", value: String(stats.deactivated), gradient: "from-red-500 to-red-600" },
  ];

  const confirmConfig = confirmAction
    ? confirmAction.type === "deactivate"
      ? {
          title: "Deactivate Driver",
          message: `Are you sure you want to deactivate ${confirmAction.driver.name || "this driver"}? They will no longer be able to sign in and their vehicle will be released. You can reactivate them later.`,
          confirmLabel: "Deactivate Driver",
        }
      : {
          title: "Reactivate Driver",
          message: `Are you sure you want to reactivate ${confirmAction.driver.name || "this driver"}? They will be able to sign in again.`,
          confirmLabel: "Reactivate Driver",
        }
    : null;

  return (
    <DashboardLayout title="Driver Management" role="admin">
      <PageHeader
        title="Driver Management"
        subtitle="Create, assign vehicles and manage driver accounts."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Drivers" },
        ]}
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-3">
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
            <p className="text-sm font-semibold text-red-800">Could not load drivers.</p>
            <p className="mt-0.5 text-xs text-red-700">{loadError}</p>
            <p className="mt-1 text-xs text-red-600">
              Make sure the backend is running, you are signed in as the real admin
              account, and the backend service-role key is configured.
            </p>
            <button
              type="button"
              onClick={loadDrivers}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        </div>
      )}

      <Card className="mb-8">
        <SectionHeader
          title="Create Driver"
          action={
            <Button
              variant="primary"
              size="md"
              icon={showForm ? X : UserPlus}
              onClick={() => {
                setShowForm((prev) => !prev);
                setFormError("");
              }}
            >
              {showForm ? "Cancel" : "Create Driver"}
            </Button>
          }
        />

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Full Name"
                placeholder="Driver name"
                value={form.name}
                error={formErrors.name}
                onChange={handleChange("name")}
              />
              <InputField
                label="Email Address"
                type="email"
                placeholder="driver@smarttransport.com"
                value={form.email}
                error={formErrors.email}
                icon={Mail}
                onChange={handleChange("email")}
              />
              <InputField
                label="Phone Number"
                type="tel"
                placeholder="+91 90000 00001"
                value={form.phone}
                error={formErrors.phone}
                icon={Phone}
                onChange={handleChange("phone")}
              />
              <InputField
                label="License Number"
                placeholder="TN09 20260000001"
                value={form.licenseNumber}
                error={formErrors.licenseNumber}
                icon={BadgeCheck}
                onChange={handleChange("licenseNumber")}
              />
              <div className="group">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Availability Status
                </label>
                <select
                  value={form.availabilityStatus}
                  onChange={handleChange("availabilityStatus")}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <InputField
                label="Temporary Password"
                type="password"
                placeholder="Set a temporary password"
                value={form.password}
                error={formErrors.password}
                icon={Lock}
                onChange={handleChange("password")}
              />
            </div>

            <p className="text-xs text-gray-500">
              The driver will use this email and temporary password to sign in. The
              password is handled by Supabase Auth and is never stored or shown again.
            </p>

            {formError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" icon={UserPlus} loading={submitting} type="submit">
                {submitting ? "Creating driver..." : "Create Driver"}
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card>
        <SectionHeader title="Driver Accounts" />
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-sm font-medium text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            Loading drivers...
          </div>
        ) : drivers.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No drivers yet.</p>
            <p className="mt-1 text-xs text-gray-400">
              Use "Create Driver" to add the first driver account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Driver</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Phone</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">License Number</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Vehicle</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Status</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Created</th>
                  <th className="pb-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => {
                  const isActive = driver.is_active !== false;
                  return (
                    <tr key={driver.id} className="border-b border-gray-50 last:border-0 align-top">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white">
                            {getInitials(driver.name) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">{driver.name || "—"}</p>
                            <p className="text-xs text-gray-400">{driver.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{driver.phone || "—"}</td>
                      <td className="py-3 pr-4 text-gray-700">{driver.license_number || "—"}</td>
                      <td className="py-3 pr-4">
                        {driver.vehicle ? (
                          <div className="flex flex-col items-start">
                            <span className="inline-flex items-center gap-1.5 font-medium text-gray-900">
                              <Car size={13} className="text-gray-400" />
                              {driver.vehicle.vehicle_number}
                            </span>
                            {driver.vehicle.routes && (
                              <span className="mt-0.5 text-xs font-medium text-blue-600">
                                {driver.vehicle.routes.route_code || "Route"} · {driver.vehicle.routes.route_name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col items-start gap-1">
                          <ActiveBadge active={isActive} />
                          {isActive && <StatusBadge status={driver.availability_status} />}
                        </div>
                      </td>
                      <td className="py-3 text-gray-500">{formatDate(driver.created_at)}</td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Car}
                            disabled={!isActive}
                            onClick={() => setAssignTarget(driver)}
                          >
                            Vehicle
                          </Button>
                          {isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Trash2}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                              onClick={() => confirmDeactivate(driver)}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={RotateCcw}
                              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                              onClick={() => confirmReactivate(driver)}
                            >
                              Reactivate
                            </Button>
                          )}
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

      {assignTarget && (
        <AssignVehicleModal
          driver={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={loadDrivers}
        />
      )}

      {confirmAction && confirmConfig && (
        <ConfirmDialog
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          busy={actionBusy}
          error={actionError}
          onCancel={() => setConfirmAction(null)}
          onConfirm={runConfirmAction}
        />
      )}
    </DashboardLayout>
  );
}

export default AdminDrivers;