import { useMemo } from "react";
import { Route, MapPin, Navigation, Bus, Clock } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import { getRouteManagementList } from "../../services/mock/adminService";

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

function AdminRoutes() {
  const routes = useMemo(() => getRouteManagementList(), []);

  const totalStops = useMemo(
    () => routes.reduce((acc, route) => acc + (route.stops?.length || 0), 0),
    [routes]
  );
  const totalAssigned = useMemo(
    () => routes.reduce((acc, route) => acc + route.assignedVehicles, 0),
    [routes]
  );

  const statCards = [
    { icon: Route, label: "Total Routes", value: String(routes.length), gradient: "from-blue-500 to-blue-600" },
    { icon: MapPin, label: "Total Stops", value: String(totalStops), gradient: "from-emerald-500 to-emerald-600" },
    { icon: Bus, label: "Assigned Vehicles", value: String(totalAssigned), gradient: "from-blue-500 to-blue-600" },
    { icon: Clock, label: "Avg Stops / Route", value: routes.length ? String(Math.round(totalStops / routes.length)) : "0", gradient: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <DashboardLayout title="Route Management" role="admin">
      <PageHeader
        title="Route Management"
        subtitle="Configure and optimize route networks."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Route Management" },
        ]}
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card className="mb-8">
        <SectionHeader title="Route Network" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-4 font-semibold text-gray-600">Route</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Source</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Destination</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Stops</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Assigned Vehicles</th>
                <th className="pb-3 pr-4 font-semibold text-gray-600">Active</th>
                <th className="pb-3 font-semibold text-gray-600">Distance / Time</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-b border-gray-50 last:border-0 align-top">
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-md bg-gradient-to-r from-violet-500 to-violet-600 px-2 py-0.5 text-xs font-bold text-white">
                      {route.routeName.split(" · ")[0]}
                    </span>
                    <p className="mt-1 max-w-[180px] truncate text-xs text-gray-500">{route.routeName.split(" · ")[1]}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                      <MapPin size={14} className="text-emerald-500" />
                      {route.source}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                      <Navigation size={14} className="text-blue-500" />
                      {route.destination}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="max-w-[220px]">
                      <span className="text-gray-900 font-medium">{route.stops?.length || 0} stops</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {route.stops?.slice(0, 3).map((stop) => (
                          <span
                            key={stop.id}
                            className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500 ring-1 ring-gray-100"
                          >
                            {stop.name}
                          </span>
                        ))}
                        {(route.stops?.length || 0) > 3 && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                            +{(route.stops?.length || 0) - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-900">{route.assignedVehicles}</td>
                  <td className="py-3 pr-4">
                    {route.activeVehicles > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {route.activeVehicles}
                      </span>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                  <td className="py-3">
                    <p className="text-gray-700">{route.distance}</p>
                    <p className="text-xs text-gray-400">{route.estimatedTime} · every {route.frequency} min</p>
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

export default AdminRoutes;