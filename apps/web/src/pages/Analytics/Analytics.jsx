import { useMemo } from "react";
import {
  Users,
  Route,
  Bus,
  TrendingUp,
  Activity,
  Gauge,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import {
  getWeeklyAnalytics,
  getWeeklyAverage,
  getRoutePerformance,
  getFleetOverview,
  getFleetStats,
  getRouteStats,
  getPassengerStats,
} from "../../services/mock/adminService";

function StatCard({ icon: Icon, label, value, gradient, sub }) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
          <p className="mt-0.5 text-xs font-medium text-gray-500">{label}</p>
          {sub && <p className="mt-1 text-[11px] font-medium text-gray-400">{sub}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
          <Icon size={22} />
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
        <h2 className="text-lg font-bold tracking-tight text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function OnTimeBadge({ value }) {
  const tone =
    value >= 90
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : value >= 80
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      <CheckCircle2 size={12} />
      {value}%
    </span>
  );
}

function Analytics() {
  const {
    weeklyData,
    weeklyAverage,
    routePerformance,
    fleetOverview,
    fleetStats,
    routeStats,
    passengerStats,
  } = useMemo(
    () => ({
      weeklyData: getWeeklyAnalytics(),
      weeklyAverage: getWeeklyAverage(),
      routePerformance: getRoutePerformance(),
      fleetOverview: getFleetOverview(),
      fleetStats: getFleetStats(),
      routeStats: getRouteStats(),
      passengerStats: getPassengerStats(),
    }),
    []
  );

  const maxWeekly = useMemo(
    () => Math.max(...weeklyData.map((d) => d.passengers), 1),
    [weeklyData]
  );

  const utilizations = useMemo(
    () =>
      fleetOverview.map((row) => {
        const utilization = row.vehicles > 0 ? Math.round((row.active / row.vehicles) * 100) : 0;
        return { ...row, utilization };
      }),
    [fleetOverview]
  );

  const overallUtilization =
    fleetStats.totalVehicles > 0
      ? Math.round((fleetStats.activeVehicles / fleetStats.totalVehicles) * 100)
      : 0;

  const statCards = [
    { icon: Users, label: "Daily Passengers", value: passengerStats.dailyPassengerCount.toLocaleString("en-IN"), sub: "Network-wide today", gradient: "from-blue-500 to-blue-600" },
    { icon: TrendingUp, label: "Weekly Average", value: weeklyAverage.toLocaleString("en-IN"), sub: "Passengers / day", gradient: "from-emerald-500 to-emerald-600" },
    { icon: Route, label: "Total Routes", value: String(routeStats.totalRoutes), sub: "Active corridors", gradient: "from-blue-500 to-blue-600" },
    { icon: Bus, label: "Active Vehicles", value: String(fleetStats.activeVehicles), sub: `of ${fleetStats.totalVehicles} fleet`, gradient: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <DashboardLayout title="Analytics" role="admin">
      <PageHeader
        title="Analytics"
        subtitle="Transport statistics, passenger trends and fleet utilization."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Analytics" },
        ]}
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Passenger Count"
            action={
              <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                <TrendingUp size={12} />
                Weekly trend
              </span>
            }
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    fontSize: "13px",
                  }}
                  formatter={(value) => [value.toLocaleString("en-IN"), "Passengers"]}
                />
                <Bar dataKey="passengers" fill="#1a73e8" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Weekly Trend" />
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    fontSize: "13px",
                  }}
                />
                <Line type="monotone" dataKey="passengers" stroke="#059669" strokeWidth={2.5} dot={{ r: 3, fill: "#059669" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
            <span className="text-sm font-medium text-emerald-700">Peak day</span>
            <span className="text-lg font-bold text-emerald-700">
              {weeklyData.reduce((a, b) => (b.passengers > a.passengers ? b : a)).day} ·{" "}
              {maxWeekly.toLocaleString("en-IN")}
            </span>
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <SectionHeader
          title="Route Performance"
          action={
            <span className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600">
              <Activity size={12} />
              {routePerformance.length} routes
            </span>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {routePerformance.map((row) => (
            <Card key={row.route} hover>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">{row.route}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Gauge size={13} className="text-gray-400" />
                      {row.trips} trips
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} className="text-gray-400" />
                      today
                    </span>
                  </div>
                </div>
                <OnTimeBadge value={row.onTime} />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-500">Occupancy</span>
                  <span className="font-semibold text-gray-700">{row.occupancy}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      row.occupancy >= 80 ? "bg-red-500" : row.occupancy >= 60 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${row.occupancy}%` }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="Vehicle Utilization" />
          <div className="space-y-4">
            {utilizations.map((row) => (
              <div key={row.route}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">{row.route}</span>
                  <span className="text-xs text-gray-500">
                    {row.active} active / {row.vehicles} total
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                      style={{ width: `${row.utilization}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-bold text-gray-700">{row.utilization}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <SectionHeader title="Overall Utilization" />
          <div className="flex flex-col items-center py-4 text-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#1a73e8"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(overallUtilization / 100) * 326.7} 326.7`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold tracking-tight text-gray-900">{overallUtilization}%</span>
                <span className="text-xs font-medium text-gray-500">fleet active</span>
              </div>
            </div>
            <div className="mt-5 w-full space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-2.5 text-sm">
                <span className="font-medium text-emerald-700">Available</span>
                <span className="font-bold text-emerald-700">{fleetStats.activeVehicles}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-2.5 text-sm">
                <span className="font-medium text-amber-700">Maintenance</span>
                <span className="font-bold text-amber-700">{fleetStats.maintenanceVehicles}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Analytics;