import { useMemo } from "react";
import { Bus, Truck, Users, Fuel } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import {
  getVehicleList,
  getFleetStats,
} from "../../services/mock/adminService";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-gray-50 text-gray-600 border-gray-200",
  Maintenance: "bg-amber-50 text-amber-700 border-amber-200",
};

const availabilityStyles = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Maintenance": "bg-amber-50 text-amber-700 border-amber-200",
  Unavailable: "bg-red-50 text-red-700 border-red-200",
  "Off Duty": "bg-gray-50 text-gray-600 border-gray-200",
};

function StatusBadge({ status, map }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] || map.Available || ""}`}>
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

function SectionHeader({ title }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
      <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
    </div>
  );
}

function FleetManagement() {
  const vehicles = useMemo(() => getVehicleList(), []);
  const stats = useMemo(() => getFleetStats(), []);

  const statCards = [
    { icon: Truck, label: "Total Vehicles", value: String(stats.totalVehicles), gradient: "from-blue-500 to-blue-600" },
    { icon: Bus, label: "Active Vehicles", value: String(stats.activeVehicles), gradient: "from-emerald-500 to-emerald-600" },
    { icon: Users, label: "Maintenance", value: String(stats.maintenanceVehicles), gradient: "from-amber-500 to-amber-600" },
    { icon: Fuel, label: "Available Now", value: String(stats.activeVehicles), gradient: "from-blue-500 to-blue-600" },
  ];

  return (
    <DashboardLayout title="Fleet Management" role="admin">
      <PageHeader
        title="Fleet Management"
        subtitle="Monitor and manage the entire vehicle fleet."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Fleet Management" },
        ]}
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card className="mb-8">
        <SectionHeader title="Fleet" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-4 font-semibold text-gray-600">Vehicle Number</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Model</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Route</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Driver</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Status</th>
                <th className="pb-3 font-semibold text-gray-600">Availability</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{vehicle.vehicleNumber}</span>
                      {vehicle.occupancy > 0 && (
                        <span className="hidden rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 lg:inline">
                          {Math.round(vehicle.occupancy / vehicle.capacity * 100)}% loaded
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{vehicle.model}</td>
                  <td className="py-3 pr-4 text-gray-700">{vehicle.route}</td>
                  <td className="py-3 pr-4 text-gray-700">{vehicle.driver}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={vehicle.status} map={statusStyles} />
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge status={vehicle.availability} map={availabilityStyles} />
                      {vehicle.fuelLevel > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Fuel size={11} />
                          {vehicle.fuelLevel}% fuel
                        </span>
                      )}
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

export default FleetManagement;