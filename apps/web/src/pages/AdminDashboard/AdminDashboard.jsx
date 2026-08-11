import { useMemo } from "react";
import {
  Bus,
  Users,
  Route,
  UserCheck,
  ChevronRight,
  Bell,
  Shield,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  getKpis,
  getFleetOverview,
  getRoutePerformance,
  getDrivers,
  getAlerts,
  getWeeklyAnalytics,
  getWeeklyAverage,
} from "../../services/mock/adminService";

const kpiIcons = {
  totalVehicles: Bus,
  activeVehicles: Bus,
  totalDrivers: UserCheck,
  driversOnline: UserCheck,
  totalRoutes: Route,
  dailyPassengers: Users,
};

const kpiGradients = {
  totalVehicles: "from-blue-500 to-blue-600",
  activeVehicles: "from-emerald-500 to-emerald-600",
  totalDrivers: "from-blue-500 to-blue-600",
  driversOnline: "from-emerald-500 to-emerald-600",
  totalRoutes: "from-blue-500 to-blue-600",
  dailyPassengers: "from-emerald-500 to-emerald-600",
};

const statusColors = {
  "On Trip": "bg-blue-50 text-blue-700",
  Online: "bg-emerald-50 text-emerald-700",
  Offline: "bg-gray-50 text-gray-600",
};

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
            <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
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
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
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

function AdminDashboard() {
  const {
    kpiData,
    fleetData,
    alerts,
    routePerformance,
    drivers,
    analyticsData,
    weeklyAverage,
  } = useMemo(() => ({
    kpiData: getKpis(),
    fleetData: getFleetOverview(),
    alerts: getAlerts(),
    routePerformance: getRoutePerformance(),
    drivers: getDrivers(),
    analyticsData: getWeeklyAnalytics(),
    weeklyAverage: getWeeklyAverage(),
  }), []);

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

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KpiCard
            key={kpi.key}
            icon={kpiIcons[kpi.key] || Bus}
            label={kpi.label}
            value={typeof kpi.value === "number" ? kpi.value.toLocaleString("en-IN") : kpi.value}
            gradient={kpiGradients[kpi.key] || "from-blue-500 to-blue-600"}
            change={kpi.change}
          />
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Fleet Overview"
            action={
              <Button variant="ghost" size="sm" icon={ChevronRight}>
                View All
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Route</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Total</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Active</th>
                  <th className="pb-3 font-semibold text-gray-600">Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {fleetData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.route}</td>
                    <td className="py-3 pr-4 text-gray-700">{row.vehicles}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {row.active}
                      </span>
                    </td>
                    <td className="py-3">
                      {row.maintenance > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-amber-600">
                          <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {row.maintenance}
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Recent Alerts"
            action={
              <Button variant="ghost" size="sm" icon={ChevronRight}>
                View All
              </Button>
            }
          />
          <div className="space-y-4">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3">
                <NotifIcon type={alert.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{alert.description}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Route Performance"
            action={
              <Button variant="ghost" size="sm" icon={ChevronRight}>
                View All
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Route</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Today Trips</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-600">Occupancy</th>
                  <th className="pb-3 font-semibold text-gray-600">On-Time</th>
                </tr>
              </thead>
              <tbody>
                {routePerformance.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.route}</td>
                    <td className="py-3 pr-4 text-gray-700">{row.trips}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${row.occupancy}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{row.occupancy}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium ${row.onTime >= 90 ? "text-emerald-600" : row.onTime >= 80 ? "text-amber-600" : "text-red-600"}`}>
                        {row.onTime}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Analytics Preview"
            action={
              <Button variant="ghost" size="sm" icon={ChevronRight}>
                Details
              </Button>
            }
          />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
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
                <Bar dataKey="passengers" fill="#1a73e8" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
            <span className="text-sm font-medium text-blue-700">Weekly Average</span>
            <span className="text-lg font-bold text-blue-700">{weeklyAverage.toLocaleString("en-IN")}</span>
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <SectionHeader
          title="Driver Status"
          action={
            <Button variant="ghost" size="sm" icon={ChevronRight}>
              Manage Drivers
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-4 font-semibold text-gray-600">Driver</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Vehicle</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Route</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Status</th>
                <th className="pb-3 font-semibold text-gray-600">Trips Today</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white">
                        {driver.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{driver.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{driver.vehicle}</td>
                  <td className="py-3 pr-4 text-gray-700">{driver.route}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[driver.status] || statusColors.Offline}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-gray-900">{driver.trips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div>
        <SectionHeader title="Quick Actions" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="primary" size="lg" icon={Bus} className="w-full">
            Manage Vehicles
          </Button>
          <Button variant="secondary" size="lg" icon={Shield} className="w-full">
            Manage Drivers
          </Button>
          <Button variant="outline" size="lg" icon={Route} className="w-full">
            Manage Routes
          </Button>
          <Button variant="outline" size="lg" icon={FileText} className="w-full">
            Reports
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;