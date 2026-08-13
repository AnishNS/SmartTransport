import { useEffect, useState } from "react";
import {
  Bus,
  PlayCircle,
  Users,
  Clock,
  MapPin,
  Navigation,
  Route,
  PauseCircle,
  RotateCcw,
  StopCircle,
  Wifi,
  Gauge,
  CheckCircle,
  AlertTriangle,
  Bell,
  ChevronRight,
  ShieldAlert,
  Loader2,
  UserX,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ReportModal from "../../components/report/ReportModal";
import useDriverTrip from "../../hooks/useDriverTrip";
import useLiveVehicles from "../../hooks/useLiveVehicles";
import useDriverProfile from "../../hooks/useDriverProfile";
import { notificationService } from "../../services/notification";
import {
  getCurrentDriver,
  getAssignedRoute,
  getCurrentShift,
  getDriverTripStats,
  getRouteStops,
  getTripStatusLabel,
} from "../../services/mock/driverService";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "On Trip": "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-gray-50 text-gray-600 border-gray-200",
  Maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  Paused: "bg-amber-50 text-amber-700 border-amber-200",
  Completed: "bg-gray-50 text-gray-600 border-gray-200",
  "Not Started": "bg-gray-50 text-gray-600 border-gray-200",
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Unavailable: "bg-gray-50 text-gray-600 border-gray-200",
};

// The vehicles.status column is a lowercase management status ('active',
// 'maintenance', 'inactive'). Map it to a display label for the badge.
function vehicleStatusLabel(status) {
  const value = String(status || "").toLowerCase();
  if (value === "active") return "Active";
  if (value === "maintenance") return "Maintenance";
  if (value === "inactive") return "Inactive";
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Active";
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.Active}`}>
      {status}
    </span>
  );
}

function NotifIcon({ type }) {
  const config = {
    info: { bg: "bg-blue-50", color: "text-blue-500" },
    warning: { bg: "bg-amber-50", color: "text-amber-500" },
    alert: { bg: "bg-red-50", color: "text-red-500" },
  };
  const { bg, color } = config[type] || config.info;
  return (
    <div className={`rounded-xl ${bg} p-2`}>
      <Bell size={16} className={color} />
    </div>
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

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Icon size={15} className="text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function formatElapsed(state) {
  const start = state.startedAt ? new Date(state.startedAt).getTime() : null;
  if (start == null) return "0s";
  const end =
    state.status === "completed" && state.endedAt
      ? new Date(state.endedAt).getTime()
      : state.status === "paused"
        ? new Date(state.pausedAt).getTime()
        : Date.now();
  const totalMs = Math.max(0, end - start - state.totalPausedMs);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
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

function DriverDashboard() {
  // REAL driver identity + assigned vehicle from Supabase. The mock driver is
  // kept ONLY for demo route/shift/notification texture (route assignment is
  // not modelled in the database yet); its name is never rendered.
  const { loading: profileLoading, error: profileError, driver, vehicle, user, reload } = useDriverProfile();
  const demoDriver = getCurrentDriver();
  const route = getAssignedRoute(demoDriver?.id);
  const shift = getCurrentShift(demoDriver?.id);
  const tripStats = getDriverTripStats(demoDriver?.id);
  const routeStops = getRouteStops(route?.id);
  const { vehicles: liveVehicles } = useLiveVehicles();
  const { tripState, startTrip, pauseTrip, resumeTrip, endTrip } = useDriverTrip();

  // REAL notifications scoped to this driver.
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    let active = true;
    notificationService
      .listNotifications()
      .then((data) => {
        if (!active) return;
        setNotifications(data);
      })
      .catch(() => {
        if (active) setNotifications([]);
      })
      .finally(() => {
        if (active) setNotificationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const liveVehicle = vehicle ? liveVehicles.find((v) => v.id === vehicle.id) : null;
  const isTripActive = tripState.status === "in_progress" || tripState.status === "paused";

  const nextStop = liveVehicle?.nextStop || routeStops[1]?.name || routeStops[0]?.name || "—";
  const remainingStops = Math.max(0, routeStops.length - 1);
  const currentSpeed = liveVehicle?.speed || 0;
  const delayStatus = liveVehicle?.status === "Delayed" ? "Delayed" : "On Time";
  const lastUpdated = liveVehicle ? "just now" : "2 min ago";

  const displayVehicleStatus = isTripActive
    ? tripState.status === "paused"
      ? "Paused"
      : "On Trip"
    : vehicleStatusLabel(vehicle?.status);

  const displayAvailability = driver?.availability_status === "available" ? "Available" : "Unavailable";

  const driverStats = [
    { icon: Bus, label: "Today's Trips", value: String(tripStats.tripsToday + tripState.tripsCompleted), gradient: "from-blue-500 to-blue-600" },
    { icon: PlayCircle, label: "Active Trip", value: String(isTripActive ? 1 : 0), gradient: "from-emerald-500 to-emerald-600" },
    { icon: Users, label: "Passengers Today", value: String(tripStats.passengersToday), gradient: "from-blue-500 to-blue-600" },
    { icon: Clock, label: "On-Time Performance", value: `${tripStats.onTimePerformance}%`, gradient: "from-emerald-500 to-emerald-600" },
  ];

  if (profileLoading) {
    return (
      <DashboardLayout title="Driver Dashboard" role="driver">
        <PageHeader
          title="Driver Dashboard"
          subtitle="Loading your driver profile..."
          breadcrumbs={[
            { label: "Dashboard", href: "/driver" },
            { label: "Driver Dashboard" },
          ]}
        />
        <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <p className="text-sm font-medium text-gray-600">Loading driver information...</p>
        </Card>
      </DashboardLayout>
    );
  }

  if (profileError || (!driver && user)) {
    return (
      <DashboardLayout title="Driver Dashboard" role="driver">
        <PageHeader
          title="Driver Dashboard"
          subtitle="Could not load your driver profile."
          breadcrumbs={[
            { label: "Dashboard", href: "/driver" },
            { label: "Driver Dashboard" },
          ]}
        />
        <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <UserX size={28} className="text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-900">Driver profile not found</p>
          <p className="max-w-md text-sm text-gray-500">
            We could not retrieve your driver record. Contact your administrator
            or try again.
          </p>
          <Button variant="outline" size="md" onClick={reload}>Retry</Button>
        </Card>
      </DashboardLayout>
    );
  }

  if (driver && driver.is_active === false) {
    return (
      <DashboardLayout title="Driver Dashboard" role="driver">
        <PageHeader
          title="Driver Dashboard"
          subtitle="Account deactivated."
          breadcrumbs={[
            { label: "Dashboard", href: "/driver" },
            { label: "Driver Dashboard" },
          ]}
        />
        <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <UserX size={28} className="text-red-500" />
          </div>
          <p className="text-base font-semibold text-gray-900">Account deactivated</p>
          <p className="max-w-md text-sm text-gray-500">
            This driver account has been deactivated by an administrator. Please
            contact your administrator for more information.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Driver Dashboard" role="driver">
      <PageHeader
        title="Driver Dashboard"
        subtitle={`${user?.name || "Driver"} · ${shift?.label || ""}${shift ? ` (${shift.start} - ${shift.end})` : ""}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/driver" },
          { label: "Driver Dashboard" },
        ]}
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {driverStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Assigned Vehicle" />
          <div className="space-y-4">
            <DetailRow icon={Users} label="Driver" value={user?.name || "Driver profile unavailable"} />
            <DetailRow icon={ShieldAlert} label="License Number" value={driver?.license_number || "—"} />
            <DetailRow icon={Clock} label="Current Shift" value={shift ? `${shift.label} (${shift.start} - ${shift.end})` : "—"} />
            <DetailRow icon={Bus} label="Vehicle Number" value={vehicle?.vehicle_number || "No vehicle assigned"} />
            <DetailRow icon={Route} label="Vehicle Type" value={vehicle?.vehicle_type || "—"} />
            <DetailRow icon={Users} label="Capacity" value={vehicle?.capacity ? `${vehicle.capacity} seats` : "—"} />
            <DetailRow icon={Navigation} label="Route" value={`${route?.routeNumber || "—"} · ${route?.routeName || ""} - ${route?.source || ""} \u2192 ${route?.destination || ""}`} />
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
              <span className="text-sm font-medium text-emerald-700">Driver Status</span>
              <StatusBadge status={displayAvailability} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
              <span className="text-sm font-medium text-blue-700">Vehicle Status</span>
              <StatusBadge status={displayVehicleStatus} />
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Current Trip" />
          <div className="space-y-4">
            <DetailRow icon={MapPin} label="Source" value={route?.source || "—"} />
            <DetailRow icon={Navigation} label="Destination" value={route?.destination || "—"} />
            <DetailRow icon={MapPin} label="Next Stop" value={nextStop} />
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
              <span className="text-sm font-medium text-emerald-700">Trip Status</span>
              <StatusBadge status={getTripStatusLabel(tripState.status)} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
              <span className="text-sm font-medium text-blue-700">Remaining Stops</span>
              <span className="text-lg font-bold text-blue-700">{remainingStops}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <SectionHeader title="Trip Controls" />
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
          <span className="text-sm font-medium text-gray-700">Trip Status</span>
          <StatusBadge status={getTripStatusLabel(tripState.status)} />
          {tripState.startedAt && (
            <span className="ml-auto text-xs font-medium text-gray-500">
              Started {new Date(tripState.startedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {formatElapsed(tripState)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="lg" icon={PlayCircle} disabled={isTripActive} onClick={startTrip}>
            Start Trip
          </Button>
          <Button variant="outline" size="lg" icon={PauseCircle} disabled={tripState.status !== "in_progress"} onClick={pauseTrip}>
            Pause Trip
          </Button>
          <Button variant="secondary" size="lg" icon={RotateCcw} disabled={tripState.status !== "paused"} onClick={resumeTrip}>
            Resume Trip
          </Button>
          <Button variant="outline" size="lg" icon={StopCircle} disabled={!isTripActive} onClick={endTrip}>
            End Trip
          </Button>
        </div>
      </Card>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionHeader title="Live Status" />
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <Wifi size={15} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">GPS Status</span>
              </div>
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                Connected
              </span>
            </div>
            <DetailRow icon={Gauge} label="Current Speed" value={`${currentSpeed} km/h`} />
            <DetailRow icon={Clock} label="Delay Status" value={delayStatus} />
            <DetailRow icon={CheckCircle} label="Last Updated" value={lastUpdated} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionHeader
            title="Notifications"
            action={
              <Button variant="ghost" size="sm" icon={ChevronRight} onClick={() => (window.location.href = "/driver/notifications")}>
                View All
              </Button>
            }
          />
          <div className="space-y-4">
            {notificationsLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm font-medium text-gray-500">
                <Loader2 size={18} className="animate-spin" /> Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-8 text-center text-sm font-medium text-gray-500">No notifications yet.</p>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:bg-gray-50 ${
                    notif.is_read ? "opacity-75" : "ring-1 ring-blue-100"
                  }`}
                >
                  <NotifIcon type={notif.type} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{notif.title}</p>
                      {notif.is_read !== true && <span className="flex h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{notif.message}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatNotifTime(notif.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="border-red-100 bg-gradient-to-r from-red-50 to-red-50/50 dark:border-red-900/60 dark:from-[#3a1a22] dark:to-[#3a1a22]/50">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <ShieldAlert size={28} className="text-red-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-red-900">Emergency</p>
              <p className="text-sm text-red-600">Contact control room or report an incident immediately.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" size="lg" icon={AlertTriangle} onClick={() => setReportOpen(true)} className="bg-red-600 hover:bg-red-700 focus:ring-red-500/30">
              Report Incident
            </Button>
            <Button variant="outline" size="lg" className="border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300">
              Contact Control
            </Button>
          </div>
        </div>
      </Card>

      {reportOpen && (
        <ReportModal
          title="Report Accident"
          defaultCategory="Accident"
          vehicleNumber={vehicle?.vehicle_number}
          onClose={() => setReportOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}

export default DriverDashboard;