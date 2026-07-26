import { useState } from "react";
import {
  Bus,
  Route,
  Clock,
  Bookmark,
  Search,
  Navigation,
  Star,
  History,
  Bell,
  MapPin,
  Map,
  AlertTriangle,
  Users,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Circle,
  Target,
  Eye,
  Calendar,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";

const statCards = [
  { icon: Bus, label: "Nearby Vehicles", value: "12", trend: "+2", trendUp: true, gradient: "from-blue-500 to-blue-600", bgLight: "bg-blue-50", pulseColor: "bg-blue-500" },
  { icon: Route, label: "Active Routes", value: "8", trend: "+1", trendUp: true, gradient: "from-emerald-500 to-emerald-600", bgLight: "bg-emerald-50", pulseColor: "bg-emerald-500" },
  { icon: Clock, label: "Average ETA", value: "4 min", trend: "-30s", trendUp: true, gradient: "from-violet-500 to-violet-600", bgLight: "bg-violet-50", pulseColor: "bg-violet-500" },
  { icon: Bookmark, label: "Saved Routes", value: "6", trend: "0", trendUp: true, gradient: "from-amber-500 to-amber-600", bgLight: "bg-amber-50", pulseColor: "bg-amber-500" },
];

const nearbyVehicles = [
  { id: "TN-01-AB-1234", route: "Route 42 - Central Market → Bus Stand", occupancy: 68, eta: "2 min", status: "On Time" },
  { id: "TN-01-CD-5678", route: "Route 15 - Railway Stn → College", occupancy: 85, eta: "5 min", status: "On Time" },
  { id: "TN-01-EF-9012", route: "Route 7 - Hospital → Bus Stand", occupancy: 45, eta: "8 min", status: "Delayed" },
  { id: "TN-01-GH-3456", route: "Route 21 - Market → Industrial Area", occupancy: 92, eta: "3 min", status: "On Time" },
  { id: "TN-01-IJ-7890", route: "Route 33 - Bus Stand → Park", occupancy: 30, eta: "12 min", status: "On Time" },
];

const favouriteRoutes = [
  { name: "Home → Office", from: "Gandhi Nagar", to: "Tech Park", frequency: "Daily" },
  { name: "Office → Home", from: "Tech Park", to: "Gandhi Nagar", frequency: "Daily" },
  { name: "Home → Market", from: "Gandhi Nagar", to: "City Market", frequency: "Weekends" },
];

const recentTrips = [
  { from: "Bus Stand", to: "Gandhi Nagar", date: "Today, 8:30 AM", route: "Route 42" },
  { from: "Tech Park", to: "Bus Stand", date: "Today, 6:15 PM", route: "Route 15" },
  { from: "City Market", to: "Gandhi Nagar", date: "Yesterday, 10:00 AM", route: "Route 7" },
  { from: "Railway Stn", to: "Tech Park", date: "Yesterday, 7:45 AM", route: "Route 21" },
];

const notifications = [
  { title: "Route 42 is on schedule", description: "Your bus will arrive at Gandhi Nagar stop in 2 minutes.", time: "Just now", type: "info" },
  { title: "Delay on Route 7", description: "Route 7 is delayed by approximately 8 minutes due to traffic.", time: "15 min ago", type: "warning" },
  { title: "Route 15 occupancy alert", description: "Bus on Route 15 is at 85% capacity. Consider the next bus.", time: "1 hour ago", type: "alert" },
];

const occBarColors = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const sectionHeader = (title, action) => (
  <div className="mb-5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="h-7 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
      <h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>
    </div>
    {action}
  </div>
);

function StatCard({ icon: Icon, label, value, trend, trendUp, gradient, bgLight }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br ${gradient}`} />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md`}>
            <Icon size={22} />
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-white">{value}</p>
        <p className="mt-1 text-sm font-medium text-gray-500 transition-colors duration-300 group-hover:text-white/80">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isOnTime = status === "On Time";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
      isOnTime
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-red-200 bg-red-50 text-red-700"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isOnTime ? "bg-emerald-500" : "bg-red-500"}`} />
      {status}
    </span>
  );
}

function OccupancyBar({ value }) {
  const colorClass = value > 80 ? occBarColors.high : value > 60 ? occBarColors.medium : occBarColors.low;
  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-500">Occupancy</span>
        <span className="font-semibold text-gray-700">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function NotifIcon({ type }) {
  const config = {
    info: { bg: "bg-blue-50", color: "text-blue-600", border: "border-l-blue-500" },
    warning: { bg: "bg-amber-50", color: "text-amber-600", border: "border-l-amber-500" },
    alert: { bg: "bg-red-50", color: "text-red-600", border: "border-l-red-500" },
  };
  const { bg, color } = config[type] || config.info;
  return (
    <div className={`rounded-xl ${bg} p-2.5`}>
      <Bell size={18} className={color} />
    </div>
  );
}

function PassengerDashboard() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const swapLocations = () => {
    setSource(destination);
    setDestination(source);
  };

  return (
    <DashboardLayout title="Passenger Dashboard" role="passenger">
      <PageHeader
        title="Passenger Dashboard"
        subtitle="Monitor nearby public transport and your daily commute."
        breadcrumbs={[
          { label: "Dashboard", href: "/passenger" },
          { label: "Passenger Dashboard" },
        ]}
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <div key={stat.label} className={`animate-fade-in-up delay-${(i + 1) * 100}`}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      <Card className="mb-8 border-gray-100 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Source</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Enter pickup location..."
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>
          <button
            onClick={swapLocations}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-400 transition-all duration-200 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm sm:mt-6"
            title="Swap locations"
          >
            <ArrowLeftRight size={16} />
          </button>
          <div className="relative flex-1">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Destination</label>
            <div className="relative">
              <Navigation size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination..."
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>
          <button className="mt-1 inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-md sm:mt-6">
            <Search size={18} />
            Search
          </button>
        </div>
      </Card>

      <div className="mb-8 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {sectionHeader("Nearby Vehicles", (
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50">
              View All
              <ChevronRight size={16} />
            </button>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            {nearbyVehicles.map((vehicle) => (
              <div key={vehicle.id} className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-lg sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${vehicle.status === "On Time" ? "bg-emerald-50" : "bg-red-50"}`}>
                      <Bus size={20} className={vehicle.status === "On Time" ? "text-emerald-600" : "text-red-600"} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">{vehicle.id}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{vehicle.route}</p>
                    </div>
                  </div>
                  <StatusBadge status={vehicle.status} />
                </div>
                <OccupancyBar value={vehicle.occupancy} />
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      <span className="font-semibold text-gray-800">{vehicle.eta}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users size={14} className="text-gray-400" />
                      <span>{vehicle.occupancy}%</span>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all duration-200 hover:bg-blue-100">
                    <Eye size={14} />
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {sectionHeader("Live ETA")}
          <div className="h-full rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <div className="relative">
                    <Navigation className="text-white" size={32} />
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                      <span className="relative inline-flex h-4 w-4 rounded-full bg-white" />
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-5xl font-bold tracking-tight text-white">4 min</p>
              <p className="mt-1.5 text-sm font-medium text-blue-100">Next bus arrival</p>
              <div className="mt-2 flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-xs font-medium text-blue-100">Route 42 · TN-01-AB-1234</p>
              </div>
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-200">Current: Central Market</span>
                  <span className="text-blue-200">Next: Gandhi Nagar</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-2/3 rounded-full bg-white transition-all duration-1000" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-200">2 stops away</span>
                  <span className="text-blue-200">1.2 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div>
          {sectionHeader("Favourite Routes", (
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50">
              View All
              <ChevronRight size={16} />
            </button>
          ))}
          <div className="space-y-3">
            {favouriteRoutes.map((route, i) => (
              <div key={i} className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm">
                    <Star size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900">{route.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{route.from} → {route.to}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        <Calendar size={12} className="mr-1" />
                        {route.frequency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {sectionHeader("Recent Trips", (
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50">
              View All
              <ChevronRight size={16} />
            </button>
          ))}
          <div className="space-y-0">
            {recentTrips.map((trip, i) => (
              <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                {i < recentTrips.length - 1 && (
                  <div className="absolute left-[17px] top-10 h-full w-0.5 bg-gray-200" />
                )}
                <div className="relative flex shrink-0 items-center justify-center">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    i === 0 ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-400"
                  }`}>
                    <Circle size={i === 0 ? 10 : 8} />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {trip.from} <span className="text-gray-400">→</span> {trip.to}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{trip.date}</p>
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    <Bus size={12} className="mr-1" />
                    {trip.route}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {sectionHeader("Notifications", (
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50">
              View All
              <ChevronRight size={16} />
            </button>
          ))}
          <div className="space-y-3">
            {notifications.map((notif, i) => {
              const borderColor = notif.type === "info" ? "border-l-blue-500" : notif.type === "warning" ? "border-l-amber-500" : "border-l-red-500";
              return (
                <div key={i} className={`rounded-2xl border border-gray-100 border-l-4 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${borderColor} sm:p-5`}>
                  <div className="flex items-start gap-3">
                    <NotifIcon type={notif.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900">{notif.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{notif.description}</p>
                      <p className="mt-1.5 text-xs font-medium text-gray-400">{notif.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-8">
        {sectionHeader("Quick Actions")}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
              <MapPin size={24} />
            </div>
            <span className="text-sm font-bold text-gray-900">Track Vehicle</span>
            <span className="text-xs text-gray-500">Track your bus in real time</span>
          </button>
          <button className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
              <Route size={24} />
            </div>
            <span className="text-sm font-bold text-gray-900">Plan Route</span>
            <span className="text-xs text-gray-500">Find the best route</span>
          </button>
          <button className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
              <Map size={24} />
            </div>
            <span className="text-sm font-bold text-gray-900">View Map</span>
            <span className="text-xs text-gray-500">Explore the transit map</span>
          </button>
          <button className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
              <AlertTriangle size={24} />
            </div>
            <span className="text-sm font-bold text-gray-900">Report Issue</span>
            <span className="text-xs text-gray-500">Report a problem</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PassengerDashboard;
