import { useState } from "react";
import {
  MapPin,
  Navigation,
  ArrowLeftRight,
  Search,
  Bus,
  Route,
  Clock,
  Footprints,
  Award,
  Star,
  History,
  Map,
  Plus,
  Minus,
  Maximize2,
  Layers,
  AlertTriangle,
  ChevronRight,
  Shuffle,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const nearbyStops = [
  { name: "Gandhi Nagar Stop", distance: "200 m", walkingTime: "3 min", buses: ["Route 42", "Route 15"] },
  { name: "City Centre Stop", distance: "450 m", walkingTime: "6 min", buses: ["Route 42", "Route 21", "Route 7"] },
  { name: "Railway Station Stop", distance: "700 m", walkingTime: "9 min", buses: ["Route 15", "Route 33"] },
  { name: "Market Square Stop", distance: "1.1 km", walkingTime: "14 min", buses: ["Route 21", "Route 7", "Route 42"] },
  { name: "Central Market Stop", distance: "1.5 km", walkingTime: "18 min", buses: ["Route 15", "Route 33", "Route 42"] },
];

const recommendedRoutes = [
  {
    id: 1,
    number: "Route 42",
    name: "Central Market → Bus Stand",
    type: "Express",
    travelTime: "18 min",
    walkingDistance: "300 m",
    stops: 4,
    interchanges: 0,
    eta: "9:48 AM",
    occupancy: 68,
    badge: "Fastest",
    badgeColor: "emerald",
    description: "Direct express service with minimal stops",
  },
  {
    id: 2,
    number: "Route 15",
    name: "Railway Stn → College",
    type: "Regular",
    travelTime: "25 min",
    walkingDistance: "150 m",
    stops: 6,
    interchanges: 1,
    eta: "9:55 AM",
    occupancy: 35,
    badge: "Least Crowded",
    badgeColor: "blue",
    description: "Less crowded with convenient stops",
  },
  {
    id: 3,
    number: "Route 7",
    name: "Hospital → Bus Stand",
    type: "Regular",
    travelTime: "22 min",
    walkingDistance: "500 m",
    stops: 5,
    interchanges: 0,
    eta: "9:52 AM",
    occupancy: 82,
    badge: "Eco-Friendly",
    badgeColor: "emerald",
    description: "Electric bus with low carbon footprint",
  },
  {
    id: 4,
    number: "Route 21",
    name: "Market → Industrial Area",
    type: "Local",
    travelTime: "35 min",
    walkingDistance: "100 m",
    stops: 8,
    interchanges: 2,
    eta: "10:05 AM",
    occupancy: 28,
    badge: "Shortest Walk",
    badgeColor: "emerald",
    description: "Minimal walking distance from your location",
  },
];

const journeySummary = {
  totalTime: "22 min",
  walkingTime: "5 min",
  busTime: "17 min",
  estimatedArrival: "9:52 AM",
};

const recentSearches = [
  { from: "Gandhi Nagar", to: "Tech Park", time: "Today, 8:30 AM" },
  { from: "Bus Stand", to: "City Centre", time: "Yesterday, 6:15 PM" },
  { from: "Railway Station", to: "Market", time: "Yesterday, 10:00 AM" },
  { from: "Home", to: "Office", time: "Jul 25, 9:00 AM" },
];

const savedRoutes = [
  { name: "Home → Office", from: "Gandhi Nagar", to: "Tech Park", frequency: "Daily" },
  { name: "Office → Home", from: "Tech Park", to: "Gandhi Nagar", frequency: "Daily" },
  { name: "Home → Market", from: "Gandhi Nagar", to: "City Market", frequency: "Weekends" },
];

const quickActions = [
  { label: "Track Live Vehicles", icon: Bus, gradient: "from-blue-500 to-blue-600", hoverBorder: "hover:border-blue-200" },
  { label: "View Fare Chart", icon: Route, gradient: "from-emerald-500 to-emerald-600", hoverBorder: "hover:border-emerald-200" },
  { label: "Download Route Map", icon: Map, gradient: "from-violet-500 to-violet-600", hoverBorder: "hover:border-violet-200" },
  { label: "Report an Issue", icon: AlertTriangle, gradient: "from-red-500 to-red-600", hoverBorder: "hover:border-red-200" },
];

const occBarColors = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const stopCoords = {
  "Gandhi Nagar Stop": { x: 25, y: 45 },
  "City Centre Stop": { x: 38, y: 35 },
  "Gandhi Nagar": { x: 25, y: 45 },
  "City Centre": { x: 38, y: 35 },
  "Railway Station": { x: 55, y: 65 },
  "Market Square": { x: 70, y: 30 },
  "Tech Park": { x: 82, y: 20 },
  "Central Market": { x: 15, y: 78 },
  "Bus Stand": { x: 88, y: 12 },
};

function SectionHeader({ title, action }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
        <h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function RecommendationBadge({ label, color }) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${colorClasses[color] || colorClasses.emerald}`}>
      <Award size={12} />
      {label}
    </span>
  );
}

function OccupancyView({ value }) {
  const colorClass = value > 80 ? occBarColors.high : value > 60 ? occBarColors.medium : occBarColors.low;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-500">Occupancy</span>
        <span className="font-semibold text-gray-700">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
          <Icon size={18} />
        </div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  );
}

function MapPlaceholder() {
  return (
    <div className="relative h-[350px] min-h-[350px] overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-slate-100 via-white to-emerald-50/60 shadow-sm lg:h-[400px]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute left-[8%] top-[15%] h-[30%] w-[20%] rounded-[40%] bg-emerald-100/50" />
      <div className="absolute bottom-[10%] right-[12%] h-[25%] w-[18%] rounded-[50%] bg-emerald-100/40" />
      <div className="absolute left-[50%] top-[55%] h-[20%] w-[15%] rounded-[30%] bg-emerald-100/30" />
      <div className="absolute left-0 right-0 top-[55%] h-[4px] -translate-y-1/2">
        <div className="h-full border-t border-dashed border-amber-300/60" />
      </div>

      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeGlow" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#1a73e8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1a73e8" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="routeLine" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a73e8" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="shadow1">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#1a73e8" floodOpacity="0.3" />
          </filter>
        </defs>

        <polyline points="25,45 30,50 38,48 45,55 55,50 62,40 72,32 82,20" stroke="#94a3b8" strokeWidth="0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        <polyline points="25,45 30,50 38,48 45,55 55,50 62,40 72,32 82,20" stroke="url(#routeLine)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#shadow1)" />
        <polyline points="25,45 30,50 38,48 45,55 55,50 62,40 72,32 82,20" stroke="url(#routeGlow)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {Object.entries(stopCoords).map(([name, pos]) => {
          const isOrigin = name === "Gandhi Nagar";
          const isDest = name === "Tech Park";
          return (
            <g key={name}>
              {isOrigin && (
                <>
                  <circle cx={pos.x} cy={pos.y} r="3.5" fill="#1a73e8" stroke="white" strokeWidth="1.5" filter="url(#shadow1)" />
                  <circle cx={pos.x} cy={pos.y + 3.5} r="1.2" fill="white" opacity="0.6" />
                </>
              )}
              {isDest && (
                <>
                  <circle cx={pos.x} cy={pos.y} r="3.5" fill="#059669" stroke="white" strokeWidth="1.5" filter="url(#shadow1)" />
                  <rect x={pos.x - 1.5} y={pos.y + 2} width="3" height="5" fill="#059669" rx="0.5" />
                </>
              )}
              {!isOrigin && !isDest && (
                <circle cx={pos.x} cy={pos.y} r="1.8" fill="white" stroke="#1a73e8" strokeWidth="1.2" opacity="0.7" />
              )}
            </g>
          );
        })}

        <text x={stopCoords["Gandhi Nagar"].x} y={stopCoords["Gandhi Nagar"].y - 5} textAnchor="middle" fontSize="2.8" fill="#1a73e8" fontWeight="bold">
          Gandhi Nagar
        </text>
        <text x={stopCoords["Tech Park"].x} y={stopCoords["Tech Park"].y - 5} textAnchor="middle" fontSize="2.8" fill="#059669" fontWeight="bold">
          Tech Park
        </text>
      </svg>

      <div className="absolute left-3 top-3 flex flex-col gap-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 cursor-pointer">
          <Plus size={16} className="text-gray-600" />
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 cursor-pointer">
          <Minus size={16} className="text-gray-600" />
        </div>
      </div>

      <div className="absolute right-3 top-3 flex flex-col gap-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 cursor-pointer" title="Toggle map layer">
          <Layers size={16} className="text-gray-600" />
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 cursor-pointer" title="Full screen">
          <Maximize2 size={16} className="text-gray-600" />
        </div>
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-gray-100 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <span className="flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-sm">
            <Bus size={5} className="text-white" />
          </span>
          <span>Gandhi Nagar</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <div className="h-0.5 w-4 bg-gradient-to-r from-blue-500 to-emerald-500" />
          <span>Route 42</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <span className="flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm">
            <MapPin size={5} className="text-white" />
          </span>
          <span>Tech Park</span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 rounded-lg bg-white/80 px-2.5 py-1 text-[10px] font-medium text-gray-400 shadow-sm backdrop-blur-sm">
        Map data &copy; SmartTransport 2024 &middot; Terms &middot; Report an issue
      </div>
    </div>
  );
}

function RoutePlanner() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const swapLocations = () => {
    setSource(destination);
    setDestination(source);
  };

  return (
    <DashboardLayout title="Route Planner" role="passenger">
      <PageHeader
        title="Route Planner"
        subtitle="Plan your journey efficiently."
        breadcrumbs={[
          { label: "Dashboard", href: "/passenger" },
          { label: "Route Planner" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="animate-fade-in-up delay-100">
            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Current Location</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="Enter current location..."
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
                <button
                  onClick={swapLocations}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-400 transition-all duration-200 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
                  title="Swap locations"
                >
                  <ArrowLeftRight size={16} />
                </button>
                <div className="flex-1">
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
                <Button variant="primary" size="lg" icon={Search} className="shrink-0 sm:mb-0.5">
                  Search Route
                </Button>
              </div>
            </Card>
          </div>

          <div className="animate-fade-in-up delay-200">
            <MapPlaceholder />
          </div>

          <div className="animate-fade-in-up delay-300">
            <Card>
              <SectionHeader title="Journey Summary" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard icon={Clock} label="Total Time" value={journeySummary.totalTime} gradient="from-blue-500 to-blue-600" />
                <StatCard icon={Footprints} label="Walking Time" value={journeySummary.walkingTime} gradient="from-emerald-500 to-emerald-600" />
                <StatCard icon={Bus} label="Bus Time" value={journeySummary.busTime} gradient="from-violet-500 to-violet-600" />
                <StatCard icon={Navigation} label="Est. Arrival" value={journeySummary.estimatedArrival} gradient="from-amber-500 to-amber-600" />
              </div>
            </Card>
          </div>

          <div className="animate-fade-in-up delay-400">
            <SectionHeader
              title="Recommended Routes"
              action={<Button variant="outline" size="sm" icon={RefreshCw}>Refresh</Button>}
            />
            <div className="space-y-4">
              {recommendedRoutes.map((route, i) => (
                <div key={route.id} className="animate-fade-in-up" style={{ animationDelay: `${(i + 5) * 100}ms` }}>
                  <Card hover>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
                            <Bus size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900">{route.number}</p>
                              {route.type !== "Regular" && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                                  {route.type}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-gray-500">{route.name}</p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-400">{route.description}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                            <Clock size={13} className="text-gray-400" />
                            {route.travelTime}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                            <Footprints size={13} className="text-gray-400" />
                            {route.walkingDistance}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                            <Route size={13} className="text-gray-400" />
                            {route.stops} stops
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                            <Shuffle size={13} className="text-gray-400" />
                            {route.interchanges === 0 ? "Direct" : `${route.interchanges} interchange${route.interchanges > 1 ? "s" : ""}`}
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-blue-600">
                            <Navigation size={13} />
                            ETA {route.eta}
                          </span>
                        </div>
                        <div className="mt-3">
                          <OccupancyView value={route.occupancy} />
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                        <RecommendationBadge label={route.badge} color={route.badgeColor} />
                        <Button variant="outline" size="sm">Select</Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="animate-fade-in-up delay-200">
            <Card>
              <SectionHeader title="Nearby Bus Stops" />
              <div className="space-y-4">
                {nearbyStops.map((stop) => (
                  <div key={stop.name} className="group rounded-xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100">
                        <Bus size={16} className="text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900">{stop.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={11} className="text-gray-400" />
                            {stop.distance}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={11} className="text-gray-400" />
                            {stop.walkingTime} walk
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {stop.buses.map((bus) => (
                            <span key={bus} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                              {bus}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight size={14} className="mt-2 shrink-0 text-gray-300 transition-colors group-hover:text-blue-500" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="animate-fade-in-up delay-300">
            <Card>
              <SectionHeader title="Recent Searches" />
              <div className="space-y-0">
                {recentSearches.map((search, i) => (
                  <div key={i} className="group flex cursor-pointer items-center gap-3 border-b border-gray-50 py-3 last:border-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 transition-colors group-hover:bg-blue-50">
                      <History size={14} className="text-gray-400 transition-colors group-hover:text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {search.from} <span className="text-gray-400">&rarr;</span> {search.to}
                      </p>
                      <p className="text-xs text-gray-400">{search.time}</p>
                    </div>
                    <ChevronRight size={14} className="shrink-0 text-gray-300 opacity-0 transition-all group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="animate-fade-in-up delay-400">
            <Card>
              <SectionHeader
                title="Saved Routes"
                action={
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50">
                    View All
                    <ChevronRight size={16} />
                  </button>
                }
              />
              <div className="space-y-3">
                {savedRoutes.map((route, i) => (
                  <div key={i} className="group flex items-start gap-3 rounded-xl border border-gray-50 bg-white p-3 transition-all duration-200 hover:border-amber-200 hover:shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm">
                      <Star size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900">{route.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{route.from} &rarr; {route.to}</p>
                      <span className="mt-1.5 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        {route.frequency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="animate-fade-in-up delay-500">
            <Card>
              <SectionHeader title="Quick Actions" />
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    className={`group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${action.hoverBorder}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-sm transition-transform duration-200 group-hover:scale-110`}>
                      <action.icon size={18} />
                    </div>
                    <span className="text-center text-xs font-bold text-gray-900">{action.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RoutePlanner;
