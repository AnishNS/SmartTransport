import { useMemo } from "react";
import {
  Bus,
  Route,
  Navigation,
  MapPin,
  Clock,
  Calendar,
  Circle,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import useLiveVehicles from "../../hooks/useLiveVehicles";
import {
  getCurrentDriver,
  getAssignedRoute,
  getAssignedVehicle,
  getRouteStops,
  getCurrentShift,
  getDriverTripStats,
} from "../../services/mock/driverService";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "On Trip": "bg-blue-50 text-blue-700 border-blue-200",
  Inactive: "bg-gray-50 text-gray-600 border-gray-200",
  Maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  Delayed: "bg-red-50 text-red-700 border-red-200",
  "On Time": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.Active}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
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

function DriverRoutes() {
  const driver = getCurrentDriver();
  const route = getAssignedRoute(driver?.id);
  const vehicle = getAssignedVehicle(driver?.id);
  const shift = getCurrentShift(driver?.id);
  const routeStops = getRouteStops(route?.id);
  const tripStats = getDriverTripStats(driver?.id);
  const { vehicles: liveVehicles } = useLiveVehicles();

  const liveVehicle = vehicle ? (liveVehicles.find((v) => v.id === vehicle.id) || null) : null;
  const status = liveVehicle?.status || vehicle?.status || "Active";
  const rideable = useMemo(
    () => route && vehicle ? { route, vehicle, stops: routeStops } : null,
    [route, vehicle, routeStops]
  );

  const stats = [
    { icon: Route, label: "Assigned Routes", value: String(rideable ? 1 : 0), gradient: "from-blue-500 to-blue-600" },
    { icon: MapPin, label: "Route Stops", value: String(routeStops.length), gradient: "from-emerald-500 to-emerald-600" },
    { icon: Navigation, label: "Route Distance", value: route?.distance || "—", gradient: "from-blue-500 to-blue-600" },
    { icon: Calendar, label: "Today's Trips", value: String(tripStats.tripsToday), gradient: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <DashboardLayout title="My Routes" role="driver">
      <PageHeader
        title="My Routes"
        subtitle={`${driver?.name || "Driver"} · ${route ? `Route ${route.routeNumber} · ${route.source} → ${route.destination}` : "No route assigned"}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/driver" },
          { label: "My Routes" },
        ]}
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden p-0">
          <div className="p-5 sm:p-6">
            <SectionHeader
              title="Assigned Routes"
              action={<StatusBadge status={status} />}
            />
            <div className="space-y-4">
              {rideable ? (
                routeStops.map((stop, i) => {
                  const isLast = i === routeStops.length - 1;
                  return (
                    <div key={stop.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {!isLast && (
                        <div className="absolute left-[19px] top-10 h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex shrink-0 items-center justify-center">
                        {i === 0 ? (
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm">
                            <MapPin size={16} />
                          </div>
                        ) : isLast ? (
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm">
                            <Navigation size={16} />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
                            <Circle size={8} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <p className="text-sm font-semibold text-gray-900">
                          {i === 0 ? "Start · " : i === routeStops.length - 1 ? "Drop · " : "Stop · "}
                          {stop.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Stop #{i + 1} · Map {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                  No route assigned yet.
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionHeader title="Route Details" />
            <div className="space-y-4">
              <DetailRow icon={Route} label="Route" value={route ? `${route.routeNumber} · ${route.routeName}` : "—"} />
              <DetailRow icon={MapPin} label="Source" value={route?.source || "—"} />
              <DetailRow icon={Navigation} label="Destination" value={route?.destination || "—"} />
              <DetailRow icon={Clock} label="Estimated Time" value={route?.estimatedTime || "—"} />
              <DetailRow icon={MapPin} label="Distance" value={route?.distance || "—"} />
              <DetailRow icon={Calendar} label="Frequency" value={route ? `Every ${route.frequency} min` : "—"} />
              <DetailRow icon={Clock} label="Operating Hours" value={route ? `${route.operatingHours.start} - ${route.operatingHours.end}` : "—"} />
            </div>
          </Card>

          <Card>
            <SectionHeader title="Assigned Vehicle" />
            <div className="space-y-4">
              <DetailRow icon={Bus} label="Vehicle Number" value={vehicle?.vehicleNumber || "—"} />
              <DetailRow icon={Navigation} label="Model" value={vehicle?.model || "—"} />
              <DetailRow icon={Clock} label="Shift" value={shift ? `${shift.label} (${shift.start} - ${shift.end})` : "—"} />
              <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                <span className="text-sm font-medium text-blue-700">Live Status</span>
                <StatusBadge status={status} />
              </div>
              {liveVehicle && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                  <span className="text-sm font-medium text-emerald-700">Next Stop</span>
                  <span className="text-sm font-bold text-emerald-700">{liveVehicle.nextStop}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DriverRoutes;