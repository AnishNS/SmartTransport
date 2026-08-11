import { useMemo } from "react";
import {
  Bus,
  Calendar,
  Clock,
  Route,
  MapPin,
  Navigation,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import {
  getCurrentDriver,
  getDriverSchedule,
} from "../../services/mock/driverService";

const statusConfig = {
  completed: { label: "Completed", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  in_progress: { label: "In Progress", bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  upcoming: { label: "Upcoming", bg: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
};

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

function ScheduleTrip({ trip }) {
  const config = statusConfig[trip.status] || statusConfig.upcoming;
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div className="flex flex-col items-center">
        <span className={`flex h-2.5 w-2.5 rounded-full ${config.dot}`} />
      </div>
      <div className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:bg-gray-50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.bg}`}>
              {trip.status === "in_progress" && <PlayCircle size={12} className="mr-1" />}
              {trip.status === "completed" && <CheckCircle2 size={12} className="mr-1" />}
              {config.label}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {trip.startTime} <ArrowRight size={12} className="inline text-gray-400" /> {trip.endTime}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Bus size={13} className="text-gray-400" />
            {trip.vehicleNumber}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Route size={13} className="text-blue-500" />
            {trip.routeLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} className="text-emerald-500" />
            {trip.source} <ArrowRight size={11} className="text-gray-300" /> {trip.destination}
          </span>
          <span className="inline-flex items-center gap-1">
            <Navigation size={13} className="text-gray-400" />
            {trip.stopCount} stops
          </span>
        </div>
      </div>
    </div>
  );
}

function DriverSchedule() {
  const driver = getCurrentDriver();
  const { shift, route, vehicle, tripsToday } = useMemo(
    () => getDriverSchedule(driver?.id),
    [driver?.id]
  );

  const completed = tripsToday.filter((t) => t.status === "completed");
  const upcoming = tripsToday.filter((t) => t.status === "upcoming" || t.status === "in_progress");
  const nextTrip = upcoming[0] || null;

  const stats = [
    { icon: Calendar, label: "Today's Trips", value: String(tripsToday.length), gradient: "from-blue-500 to-blue-600" },
    { icon: PlayCircle, label: "Upcoming Trips", value: String(upcoming.length), gradient: "from-emerald-500 to-emerald-600" },
    { icon: CheckCircle2, label: "Completed Trips", value: String(completed.length), gradient: "from-blue-500 to-blue-600" },
    { icon: Clock, label: "Shift Duration", value: shift ? `${shift.start} - ${shift.end}` : "—", gradient: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <DashboardLayout title="Schedule" role="driver">
      <PageHeader
        title="Schedule"
        subtitle={`${driver?.name || "Driver"} · Daily trip schedule for ${shift?.label || "your shift"}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/driver" },
          { label: "Schedule" },
        ]}
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <SectionHeader
              title="Today's Schedule"
              action={nextTrip ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                  Next trip {nextTrip.startTime}
                </span>
              ) : null}
            />
            {tripsToday.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No trips scheduled"
                description="Your scheduled trips will appear here."
              />
            ) : (
              <div className="space-y-0">
                {tripsToday.map((trip) => (
                  <ScheduleTrip key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionHeader title="Shift Details" />
            <div className="space-y-4">
              <DetailRow icon={Clock} label="Shift" value={shift?.label || "—"} />
              <DetailRow icon={Calendar} label="Shift Hours" value={shift ? `${shift.start} - ${shift.end}` : "—"} />
              <DetailRow icon={Route} label="Assigned Route" value={route ? `${route.routeNumber} · ${route.routeName}` : "—"} />
              <DetailRow icon={MapPin} label="Route" value={route ? `${route.source} → ${route.destination}` : "—"} />
              <DetailRow icon={Navigation} label="Distance" value={route?.distance || "—"} />
              <DetailRow icon={Bus} label="Vehicle" value={vehicle?.vehicleNumber || "—"} />
            </div>
          </Card>

          <Card className={nextTrip ? "overflow-hidden border-transparent bg-gradient-to-br from-blue-600 to-blue-800" : ""}>
            {nextTrip ? (
              <div className="text-white">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1 rounded-full bg-gradient-to-b from-white/80 to-white/40" />
                    <h2 className="text-lg font-semibold tracking-tight text-white">Next Trip</h2>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                    {nextTrip.status === "in_progress" ? "In Progress" : "Starting soon"}
                  </span>
                </div>
                <p className="text-4xl font-bold tracking-tight">{nextTrip.startTime}</p>
                <p className="mt-1 text-sm text-blue-100">{nextTrip.routeLabel}</p>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm">
                  <span className="text-blue-100">{nextTrip.source}</span>
                  <ArrowRight size={14} className="text-blue-200" />
                  <span className="text-blue-100">{nextTrip.destination}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-blue-200">
                  <span>Vehicle {nextTrip.vehicleNumber}</span>
                  <span>{nextTrip.stopCount} stops</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock size={32} className="mb-3 text-gray-300" />
                <p className="text-sm font-semibold text-gray-900">Shift complete</p>
                <p className="mt-1 text-xs text-gray-500">All today's trips are done.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DriverSchedule;