import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bus,
  Users,
  UserCheck,
  UserX,
  ChevronRight,
  Bell,
  Shield,
  Route,
  FileText,
  Truck,
  Loader2,
  CheckCheck,
  AlertTriangle,
  Info,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { adminService } from "../../services/admin";
import { notificationService } from "../../services/notification";

function KpiCard({ icon: Icon, label, value, gradient, change }) {
  const isPositive = !change || change.startsWith("+");
  return (
    <Card hover className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
            <Icon size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-xs font-medium text-gray-500">{label}</p>
          </div>
        </div>
        {change && (
          <span className={`text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {change}
          </span>
        )}
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

function vehicleAvailability(vehicle) {
  const status = String(vehicle.status || "").toLowerCase();
  if (status === "inactive") return { label: "Inactive", style: "bg-red-50 text-red-700 border-red-200" };
  if (status === "maintenance") return { label: "Maintenance", style: "bg-amber-50 text-amber-700 border-amber-200" };
  if (vehicle.driver_id) return { label: "Assigned", style: "bg-blue-50 text-blue-700 border-blue-200" };
  return { label: "Available", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

function Badge({ label, style }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function NotifIcon({ type }) {
  const config = {
    info: { bg: "bg-blue-50", color: "text-blue-500", icon: Info },
    warning: { bg: "bg-amber-50", color: "text-amber-500", icon: AlertTriangle },
    alert: { bg: "bg-red-50", color: "text-red-500", icon: AlertTriangle },
  };
  const { bg, color, icon: Icon } = config[type] || config.info;
  return (
    <div className={`rounded-xl ${bg} p-2`}>
      <Icon size={16} className={color} />
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatNotifTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      adminService.listVehicles().catch(() => []),
      adminService.listDrivers().catch(() => []),
      notificationService.listNotifications().catch(() => []),
    ])
      .then(([vehicleData, driverData, notifData]) => {
        if (!active) return;
        setVehicles(vehicleData);
        setDrivers(driverData);
        setNotifications(notifData);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const kpiData = useMemo(() => {
    const activeVehicles = vehicles.filter((v) => String(v.status).toLowerCase() === "active").length;
    const activeDrivers = drivers.filter((d) => d.is_active !== false).length;
    const availableDrivers = drivers.filter(
      (d) => d.is_active !== false && d.availability_status === "available"
    ).length;
    const unread = notifications.filter((n) => n.is_read !== true).length;
    return [
      { key: "totalVehicles", icon: Bus, label: "Total Vehicles", value: String(vehicles.length), gradient: "from-blue-500 to-blue-600", change: "" },
      { key: "activeVehicles", icon: Truck, label: "Active Vehicles", value: String(activeVehicles), gradient: "from-emerald-500 to-emerald-600", change: "" },
      { key: "totalDrivers", icon: UserCheck, label: "Total Drivers", value: String(drivers.length), gradient: "from-blue-500 to-blue-600", change: "" },
      { key: "driversOnline", icon: Users, label: "Drivers Available", value: String(availableDrivers), gradient: "from-emerald-500 to-emerald-600", change: `+${activeDrivers} active` },
      { key: "unread", icon: Bell, label: "Unread Notifications", value: String(unread), gradient: "from-amber-500 to-amber-600", change: "" },
    ];
  }, [vehicles, drivers, notifications]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await notificationService.markAllNotificationsRead().catch(() => {});
  };

  const handleMarkRead = (notification) => {
    if (notification.is_read === true) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
    );
    notificationService.markNotificationRead(notification.id).catch(() => {});
  };

  return (
    <DashboardLayout title="Admin Dashboard" role="admin">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor the complete transport network."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Admin Dashboard" },
        ]}
      />

      {loading ? (
        <Card className="flex items-center justify-center gap-3 py-20 text-sm font-medium text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          Loading dashboard...
        </Card>
      ) : (
        <>
          <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {kpiData.map((kpi) => (
              <KpiCard key={kpi.key} {...kpi} />
            ))}
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <SectionHeader
                title="Fleet Overview"
                action={
                  <Link to="/admin/fleet">
                    <Button variant="ghost" size="sm" icon={ChevronRight}>
                      Manage Fleet
                    </Button>
                  </Link>
                }
              />
              {vehicles.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">
                  No vehicles registered yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-3 pr-4 font-semibold text-gray-600">Vehicle</th>
                        <th className="pb-3 pr-4 font-semibold text-gray-600">Type</th>
                        <th className="pb-3 pr-4 font-semibold text-gray-600">Status</th>
                        <th className="pb-3 font-semibold text-gray-600">Driver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.slice(0, 8).map((vehicle) => {
                        const badge = vehicleAvailability(vehicle);
                        return (
                          <tr key={vehicle.id} className="border-b border-gray-50 last:border-0">
                            <td className="py-3 pr-4 font-medium text-gray-900">{vehicle.vehicle_number}</td>
                            <td className="py-3 pr-4 text-gray-700">{vehicle.vehicle_type || "—"}</td>
                            <td className="py-3 pr-4">
                              <Badge label={badge.label} style={badge.style} />
                            </td>
                            <td className="py-3 text-gray-700">{vehicle.driver_name || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card>
              <SectionHeader
                title="Recent Alerts"
                action={
                  notifications.some((n) => n.is_read !== true) ? (
                    <Button variant="ghost" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
                      Mark All Read
                    </Button>
                  ) : null
                }
              />
              {notifications.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">No alerts yet.</p>
              ) : (
                <div className="space-y-4">
                  {notifications.slice(0, 6).map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleMarkRead(notif)}
                      className={`flex w-full items-start gap-3 text-left ${
                        notif.is_read ? "opacity-70" : ""
                      }`}
                    >
                      <NotifIcon type={notif.type} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          {notif.is_read !== true && (
                            <span className="flex h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{notif.message}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{formatNotifTime(notif.created_at)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="mb-8">
            <SectionHeader
              title="Driver Status"
              action={
                <Link to="/admin/drivers">
                  <Button variant="ghost" size="sm" icon={ChevronRight}>
                    Manage Drivers
                  </Button>
                </Link>
              }
            />
            {drivers.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">
                No driver accounts yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 pr-4 font-semibold text-gray-600">Driver</th>
                      <th className="pb-3 pr-4 font-semibold text-gray-600">Vehicle</th>
                      <th className="pb-3 pr-4 font-semibold text-gray-600">License</th>
                      <th className="pb-3 pr-4 font-semibold text-gray-600">Status</th>
                      <th className="pb-3 font-semibold text-gray-600">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.slice(0, 8).map((driver) => {
                      const isActive = driver.is_active !== false;
                      return (
                        <tr key={driver.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-900">{driver.name || "—"}</p>
                            <p className="text-xs text-gray-400">{driver.email}</p>
                          </td>
                          <td className="py-3 pr-4 text-gray-700">
                            {driver.vehicle ? driver.vehicle.vehicle_number : "—"}
                          </td>
                          <td className="py-3 pr-4 text-gray-700">{driver.license_number || "—"}</td>
                          <td className="py-3 pr-4">
                            {isActive ? (
                              <Badge
                                label={driver.availability_status === "available" ? "Available" : "Unavailable"}
                                style={
                                  driver.availability_status === "available"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                }
                              />
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                                <UserX size={13} /> Deactivated
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-gray-500">{formatDate(driver.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div>
            <SectionHeader title="Quick Actions" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link to="/admin/fleet">
                <Button variant="primary" size="lg" icon={Truck} className="w-full">
                  Manage Vehicles
                </Button>
              </Link>
              <Link to="/admin/drivers">
                <Button variant="secondary" size="lg" icon={Shield} className="w-full">
                  Manage Drivers
                </Button>
              </Link>
              <Link to="/admin/routes">
                <Button variant="outline" size="lg" icon={Route} className="w-full">
                  Manage Routes
                </Button>
              </Link>
              <Link to="/admin/notifications">
                <Button variant="outline" size="lg" icon={FileText} className="w-full">
                  Notifications
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;