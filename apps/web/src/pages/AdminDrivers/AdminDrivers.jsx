import { useMemo } from "react";
import { Users, Star, UserCheck, PlayCircle } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import { getDrivers } from "../../services/mock/adminService";

const statusStyles = {
  "On Trip": "bg-blue-50 text-blue-700 border-blue-200",
  Online: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Offline: "bg-gray-50 text-gray-600 border-gray-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.Offline}`}>
      {status}
    </span>
  );
}

function RatingBadge({ value }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
      <Star size={11} fill="currentColor" />
      {value.toFixed(1)}
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

function SectionHeader({ title }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
      <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
    </div>
  );
}

function AdminDrivers() {
  const drivers = useMemo(() => getDrivers(), []);

  const online = drivers.filter((d) => d.status !== "Offline").length;
  const onTrip = drivers.filter((d) => d.status === "On Trip").length;
  const avgRating = drivers.length
    ? drivers.reduce((acc, d) => acc + d.rating, 0) / drivers.length
    : 0;

  const statCards = [
    { icon: Users, label: "Total Drivers", value: String(drivers.length), gradient: "from-blue-500 to-blue-600" },
    { icon: UserCheck, label: "Online Now", value: String(online), gradient: "from-emerald-500 to-emerald-600" },
    { icon: PlayCircle, label: "On Trip", value: String(onTrip), gradient: "from-blue-500 to-blue-600" },
    { icon: Star, label: "Average Rating", value: avgRating.toFixed(1), gradient: "from-amber-500 to-amber-600" },
  ];

  return (
    <DashboardLayout title="Drivers" role="admin">
      <PageHeader
        title="Drivers"
        subtitle="Manage driver accounts and assignments."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Drivers" },
        ]}
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card className="mb-8">
        <SectionHeader title="Driver Management" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-4 font-semibold text-gray-600">Driver</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Assigned Vehicle</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Route</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Status</th>
                <th className="pb-3 font-semibold text-gray-600">Performance Summary</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} className="border-b border-gray-50 last:border-0 align-top">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white">
                        {driver.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-xs text-gray-400">{driver.employeeCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{driver.vehicle}</td>
                  <td className="py-3 pr-4 text-gray-700">{driver.route}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={driver.status} />
                  </td>
                  <td className="py-3">
                    <div className="max-w-[260px] space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between text-[11px]">
                            <span className="font-medium text-gray-500">On-time</span>
                            <span className={`font-semibold ${driver.onTime >= 90 ? "text-emerald-600" : driver.onTime >= 80 ? "text-amber-600" : "text-red-600"}`}>
                              {driver.onTime}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${driver.onTime >= 90 ? "bg-emerald-500" : driver.onTime >= 80 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${driver.onTime}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span>{driver.trips} trips today</span>
                        <span>{driver.passengers} passengers</span>
                        <RatingBadge value={driver.rating} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export default AdminDrivers;