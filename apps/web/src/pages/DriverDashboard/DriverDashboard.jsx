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
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import useDriverTrip from "../../hooks/useDriverTrip";
import useLiveVehicles from "../../hooks/useLiveVehicles";
import {
  getCurrentDriver,
  getAssignedVehicle,
  getAssignedRoute,
  getCurrentShift,
  getDriverTripStats,
  getDriverNotifications,
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
};

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

function DriverDashboard() {
  const driver = getCurrentDriver();
  const vehicle = getAssignedVehicle(driver?.id);
  const route = getAssignedRoute(driver?.id);
  const shift = getCurrentShift(driver?.id);
  const tripStats = getDriverTripStats(driver?.id);
  const notifications = getDriverNotifications(driver?.id);
  const routeStops = getRouteStops(route?.id);
  const { vehicles: liveVehicles } = useLiveVehicles();
  const { tripState, startTrip, pauseTrip, resumeTrip, endTrip } = useDriverTrip();

  const liveVehicle = vehicle ? liveVehicles.find((v) => v.id === vehicle.id) : null;
  const isTripActive = tripState.status === "in_progress" || tripState.status === "paused";

  const nextStop = liveVehicle?.nextStop || routeStops[1]?.name || routeStops[0]?.name || "—";
  const remainingStops = Math.max(0, routeStops.length - 1);
  const currentSpeed = liveVehicle?.speed || vehicle?.speed || 0;
  const delayStatus = liveVehicle?.status === "Delayed" ? "Delayed" : "On Time";
  const lastUpdated = liveVehicle ? "just now" : "2 min ago";

  const displayVehicleStatus = isTripActive
    ? tripState.status === "paused"
      ? "Paused"
      : "On Trip"
    : vehicle?.status || "Active";

  const driverStats = [
    { icon: Bus, label: "Today's Trips", value: String(tripStats.tripsToday + tripState.tripsCompleted), gradient: "from-blue-500 to-blue-600" },
    { icon: PlayCircle, label: "Active Trip", value: String(isTripActive ? 1 : 0), gradient: "from-emerald-500 to-emerald-600" },
    { icon: Users, label: "Passengers Today", value: String(tripStats.passengersToday), gradient: "from-blue-500 to-blue-600" },
    { icon: Clock, label: "On-Time Performance", value: `${tripStats.onTimePerformance}%`, gradient: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <DashboardLayout title="Driver Dashboard" role="driver">
      <PageHeader
        title="Driver Dashboard"
        subtitle={`${driver?.name || "Driver"} · ${shift?.label || ""}${shift ? ` (${shift.start} - ${shift.end})` : ""}`}
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
            <DetailRow icon={Users} label="Driver" value={driver?.name || "—"} />
            <DetailRow icon={Clock} label="Current Shift" value={shift ? `${shift.label} (${shift.start} - ${shift.end})` : "—"} />
            <DetailRow icon={Bus} label="Vehicle Number" value={vehicle?.vehicleNumber || "—"} />
            <DetailRow icon={Route} label="Route" value={`${route?.routeNumber || "—"} · ${route?.routeName || ""} - ${route?.source || ""} \u2192 ${route?.destination || ""}`} />
            <DetailRow icon={Navigation} label="Registration Number" value={vehicle?.vehicleNumber || "—"} />
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
              <span className="text-sm font-medium text-emerald-700">Current Status</span>
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
              <Button variant="ghost" size="sm" icon={ChevronRight}>
                View All
              </Button>
            }
          />
          <div className="space-y-4">
            {notifications.map((notif, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:bg-gray-50">
                <NotifIcon type={notif.type} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{notif.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{notif.description}</p>
                  <p className="mt-1 text-xs text-gray-400">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border-red-100 bg-gradient-to-r from-red-50 to-red-50/50">
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
            <Button variant="primary" size="lg" icon={AlertTriangle} className="bg-red-600 hover:bg-red-700 focus:ring-red-500/30">
              Report Incident
            </Button>
            <Button variant="outline" size="lg" className="border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300">
              Contact Control
            </Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export default DriverDashboard;