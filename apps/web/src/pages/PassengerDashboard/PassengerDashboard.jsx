import { useState, useMemo } from "react";
import {
  Bus,
  Route,
  Clock,
  Bookmark,
  Search,
  Navigation,
  Star,
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
  Eye,
  Calendar,
  Loader2,
  AlertCircle,
  Navigation2,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import usePassengerLocation from "../../hooks/usePassengerLocation";
import useNearbyBusStops from "../../hooks/useNearbyBusStops";
import useNearbyRoutes from "../../hooks/useNearbyRoutes";
import useLiveVehicles from "../../hooks/useLiveVehicles";
import { getAllBusStops } from "../../services/transport/stopService";
import { calculateDistance } from "../../utils/location/distance";
import MapView from "../../components/maps/MapView";
import {
  getFavouriteRoutes,
  getRecentTrips,
  getPassengerNotifications,
} from "../../services/mock/passengerService";

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

const formatDistance = (meters) => {
  if (meters == null) return "—";
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
};

function StatCard({ icon: Icon, label, value, trend, trendUp, gradient }) {
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

function LocationPreview({ latitude, longitude, accuracy, address, city, loading, error }) {

  if (loading && !latitude) {
    return (
      <Card className="mb-8 border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Getting your location...</p>
            <p className="mt-0.5 text-xs text-gray-500">Please allow location access</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error && !latitude) {
    return (
      <Card className="mb-8 border border-red-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Location unavailable</p>
            <p className="mt-0.5 text-xs text-red-500">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-8 overflow-hidden border-gray-100 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm">
          <MapPin size={26} />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Current Location
            </p>
            <p className="mt-0.5 text-base font-semibold text-gray-900">
              {address || "Resolving address..."}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">City</p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">{city || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Accuracy</p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {accuracy != null ? `${Math.round(accuracy)}m` : "—"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Latitude</p>
              <p className="mt-0.5 text-sm font-mono text-gray-600">
                {latitude?.toFixed(6) ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Longitude</p>
              <p className="mt-0.5 text-sm font-mono text-gray-600">
                {longitude?.toFixed(6) ?? "—"}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function NearbyBusStops({ stops, loading, error, nearestStop }) {
  if (loading) {
    return (
      <div className="mb-8">
        {sectionHeader("Nearby Bus Stops")}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-50" />
                </div>
              </div>
              <div className="mt-4 flex gap-4 border-t border-gray-50 pt-4">
                <div className="h-3 w-16 rounded bg-gray-50" />
                <div className="h-3 w-20 rounded bg-gray-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && stops.length === 0) {
    return (
      <div className="mb-8">
        {sectionHeader("Nearby Bus Stops")}
        <EmptyState
          icon={AlertCircle}
          title="Unable to load nearby stops"
          description="Unable to load nearby stops. Using available transport data."
        />
      </div>
    );
  }

  if (!error && stops.length === 0) {
    return (
      <div className="mb-8">
        {sectionHeader("Nearby Bus Stops")}
        <Card className="border-gray-100 bg-white shadow-sm">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-gray-900">No stops within radius.</p>
            {nearestStop ? (
              <>
                <p className="text-sm text-gray-500">
                  Nearest Stop:{" "}
                  <span className="font-semibold text-gray-800">{nearestStop.name}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Distance:{" "}
                  <span className="font-semibold text-gray-800">{formatDistance(nearestStop.distance)}</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No bus stops found nearby.</p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {sectionHeader("Nearby Bus Stops", (
        <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
          <MapPin size={12} />
          {stops.length} stop{stops.length !== 1 ? "s" : ""}
        </span>
      ))}

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <AlertCircle size={16} className="shrink-0 text-amber-500" />
          <span>Unable to load nearby stops. Using available transport data.</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stops.slice(0, 9).map((stop) => {
          const walkingTimeMin = Math.ceil(stop.distance / 83.33);
          const hours = Math.floor(walkingTimeMin / 60);
          const minutes = walkingTimeMin % 60;
          const walkingTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

          return (
            <div key={stop.id} className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <MapPin size={20} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">{stop.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{stop.type}</p>
                    {stop.routes && stop.routes.length > 0 && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        Routes: {stop.routes.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Navigation size={14} className="text-gray-400" />
                  <span className="font-semibold text-gray-800">{stop.distance}m</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Clock size={14} className="text-gray-400" />
                  <span>{walkingTime} walk</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AvailableBusRoutes({ routes, loading, error }) {
  if (loading) {
    return (
      <div className="mb-8">
        {sectionHeader("Available Routes Near You")}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 rounded bg-gray-100" />
                  <div className="h-3 w-3/4 rounded bg-gray-50" />
                  <div className="h-3 w-1/2 rounded bg-gray-50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        {sectionHeader("Available Routes Near You")}
        <EmptyState
          icon={AlertCircle}
          title="Unable to load routes"
          description={error}
        />
      </div>
    );
  }

  if (routes.length === 0) return null;

  return (
    <div className="mb-8">
      {sectionHeader("Available Routes Near You", (
        <span className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600">
          <Route size={12} />
          {routes.length} route{routes.length !== 1 ? "s" : ""}
        </span>
      ))}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {routes.slice(0, 9).map((route) => (
          <div key={`${route.routeId}-${route.stopId}`} className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                  <Route size={20} className="text-violet-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-gradient-to-r from-violet-500 to-violet-600 px-2 py-0.5 text-xs font-bold text-white">
                      {route.routeNumber}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-gray-900">{route.routeName}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {route.source} <span className="text-gray-300">→</span> {route.destination}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin size={14} className="text-gray-400" />
                <span className="font-semibold text-gray-800">{route.matchingStop}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Navigation size={14} className="text-gray-400" />
                <span>{route.distance}m</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NearbyTransportMap({ vehicles = [], latitude, longitude, nearbyStops, nearestStop = null }) {
  const nearestStopFallback = nearestStop
    || (nearbyStops.length > 0
      ? nearbyStops.reduce((a, b) => (a.distance < b.distance ? a : b))
      : null);

  const totalBusStops = getAllBusStops().length;

  return (
    <div className="mb-8">
      {sectionHeader("Transport Network")}
      <Card className="overflow-hidden border-gray-100 p-0 shadow-sm">
        <div className="h-[400px] w-full sm:h-[500px]">
          <MapView
            latitude={latitude}
            longitude={longitude}
            vehicles={vehicles}
            zoom={15}
          />
        </div>
        <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            <span className="font-medium text-gray-700">
              Active Buses: <span className="font-bold text-gray-900">{vehicles.length}</span>
            </span>
            <span className="font-medium text-gray-700">
              Network Stops: <span className="font-bold text-gray-900">{totalBusStops}</span>
            </span>
            {nearestStopFallback && (
              <>
                <span className="font-medium text-gray-700">
                  Nearest Stop: <span className="font-bold text-gray-900">{nearestStopFallback.name}</span>
                </span>
                <span className="font-medium text-gray-700">
                  Distance: <span className="font-bold text-gray-900">{formatDistance(nearestStopFallback.distance)}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function LiveEtaCard({ nearestVehicle }) {
  return (
    <div className="h-full rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 p-6 shadow-sm sm:p-8">
      {nearestVehicle ? (
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
          <p className="text-5xl font-bold tracking-tight text-white">
            {Math.max(1, Math.round(nearestVehicle._dist / (nearestVehicle.speed * 1000 / 60)))} min
          </p>
          <p className="mt-1.5 text-sm font-medium text-blue-100">Next bus arrival</p>
          <div className="mt-2 flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <span className={`h-2 w-2 rounded-full ${nearestVehicle.status === "On Time" ? "bg-emerald-400" : "bg-red-400"}`} />
            <p className="text-xs font-medium text-blue-100">{nearestVehicle.routeName} · {nearestVehicle.vehicleNumber}</p>
          </div>
          <div className="mt-6 w-full space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">{nearestVehicle.nextStop}</span>
              <span className="text-blue-200">{nearestVehicle.speed} km/h</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-2/3 rounded-full bg-white transition-all duration-1000" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-200">{Math.round(nearestVehicle.occupancy / nearestVehicle.capacity * 100)}% occupancy</span>
              <span className="text-blue-200">{Math.round(nearestVehicle._dist)}m away</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-2xl font-bold tracking-tight text-white">—</p>
          <p className="mt-2 text-sm font-medium text-blue-100">No vehicles nearby</p>
        </div>
      )}
    </div>
  );
}

function PassengerDashboard() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const { vehicles, loading: vehiclesLoading } = useLiveVehicles();
  const { latitude, longitude, accuracy, address, city, loading: geoLoading, error: geoError } = usePassengerLocation();
  const { busStops: nearbyStops, nearestStop, loading: stopsLoading, error: stopsError } = useNearbyBusStops(latitude, longitude);
  const { routes: nearbyRoutes, loading: routesLoading, error: routesError } = useNearbyRoutes(latitude, longitude, nearbyStops);

  const swapLocations = () => {
    setSource(destination);
    setDestination(source);
  };

  const mockData = useMemo(
    () => ({
      favouriteRoutes: getFavouriteRoutes(),
      recentTrips: getRecentTrips(),
      notifications: getPassengerNotifications(),
    }),
    []
  );

  const savedRoutesCount = mockData.favouriteRoutes.length;

  const activeRoutesCount = useMemo(() => {
    const unique = new Set(vehicles.map((v) => v.routeId));
    return unique.size;
  }, [vehicles]);

  const nearbyVehiclesLive = useMemo(() => {
    if (!vehicles.length) return [];
    if (latitude == null || longitude == null) return vehicles.slice(0, 9);

    const withDist = vehicles.map((v) => ({
      ...v,
      _dist: calculateDistance(latitude, longitude, v.latitude, v.longitude),
    }));

    const nearby = withDist
      .filter((v) => v._dist <= 3000)
      .sort((a, b) => a._dist - b._dist)
      .slice(0, 9);

    if (nearby.length === 0) return vehicles.slice(0, 6);
    return nearby;
  }, [vehicles, latitude, longitude]);

  const nearestVehicle = useMemo(() => {
    if (!nearbyVehiclesLive.length) return null;
    return nearbyVehiclesLive.reduce((a, b) => (a._dist < b._dist ? a : b));
  }, [nearbyVehiclesLive]);

  const statCardsLive = useMemo(() => [
    { icon: Bus, label: "Nearby Vehicles", value: String(vehicles.length), trend: "Live", trendUp: true, gradient: "from-blue-500 to-blue-600" },
    { icon: Route, label: "Active Routes", value: String(activeRoutesCount), trend: "Live", trendUp: true, gradient: "from-emerald-500 to-emerald-600" },
    { icon: Clock, label: "Average ETA", value: nearestVehicle ? `${Math.max(1, Math.round(nearestVehicle._dist / (nearestVehicle.speed * 1000 / 60)))} min` : "—", trend: "Live", trendUp: true, gradient: "from-violet-500 to-violet-600" },
    { icon: Bookmark, label: "Saved Routes", value: String(savedRoutesCount), trend: "0", trendUp: true, gradient: "from-amber-500 to-amber-600" },
  ], [vehicles.length, activeRoutesCount, nearestVehicle, savedRoutesCount]);

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
        {statCardsLive.map((stat, i) => (
          <div key={stat.label} className={`animate-fade-in-up delay-${(i + 1) * 100}`}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      <LocationPreview
        latitude={latitude}
        longitude={longitude}
        accuracy={accuracy}
        address={address}
        city={city}
        loading={geoLoading}
        error={geoError}
      />

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
            <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
              <Bus size={12} />
              {nearbyVehiclesLive.length} near you
            </span>
          ))}
          {vehiclesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-gray-100" />
                      <div className="h-3 w-1/2 rounded bg-gray-50" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-2 w-full rounded bg-gray-50" />
                    <div className="flex justify-between">
                      <div className="h-3 w-16 rounded bg-gray-50" />
                      <div className="h-3 w-12 rounded bg-gray-50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : nearbyVehiclesLive.length === 0 ? (
            <EmptyState
              icon={Bus}
              title="No vehicles nearby"
              description="No active vehicles found near your location."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {nearbyVehiclesLive.map((vehicle) => {
                const etaMin = Math.max(1, Math.round(vehicle._dist / (vehicle.speed * 1000 / 60)));
                return (
                  <div key={vehicle.id} className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-lg sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${vehicle.status === "On Time" ? "bg-emerald-50" : "bg-red-50"}`}>
                          <Bus size={20} className={vehicle.status === "On Time" ? "text-emerald-600" : "text-red-600"} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900">{vehicle.vehicleNumber}</p>
                          <p className="mt-0.5 truncate text-xs text-gray-500">{vehicle.routeName}</p>
                        </div>
                      </div>
                      <StatusBadge status={vehicle.status} />
                    </div>
                    <OccupancyBar value={Math.round(vehicle.occupancy / vehicle.capacity * 100)} />
                    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          <span className="font-semibold text-gray-800">{etaMin} min</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Users size={14} className="text-gray-400" />
                          <span>{Math.round(vehicle.occupancy / vehicle.capacity * 100)}%</span>
                        </div>
                      </div>
                      <button className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all duration-200 hover:bg-blue-100">
                        <Eye size={14} />
                        Track
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          {sectionHeader("Live ETA")}
          <LiveEtaCard nearestVehicle={nearestVehicle} />
        </div>
      </div>

      {import.meta.env.DEV && (
        <div className="mb-8 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-800">Debug Info</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono text-amber-900">
            <div>Passenger Latitude: <span className="font-semibold">{latitude?.toFixed(6) ?? '—'}</span></div>
            <div>Passenger Longitude: <span className="font-semibold">{longitude?.toFixed(6) ?? '—'}</span></div>
            <div>Nearest Stop: <span className="font-semibold">{nearestStop?.name ?? '—'}</span></div>
            <div>Nearest Stop Distance: <span className="font-semibold">{nearestStop?.distance != null ? `${nearestStop.distance}m` : '—'}</span></div>
            <div>Total Stops Loaded: <span className="font-semibold">{getAllBusStops().length}</span></div>
            <div>Nearby Stops Count: <span className="font-semibold">{nearbyStops.length}</span></div>
          </div>
        </div>
      )}

      <NearbyTransportMap
        vehicles={vehicles}
        latitude={latitude}
        longitude={longitude}
        nearbyStops={nearbyStops}
        nearestStop={nearestStop}
      />

      <NearbyBusStops
        stops={nearbyStops}
        loading={stopsLoading}
        error={stopsError}
        nearestStop={nearestStop}
      />

      <AvailableBusRoutes
        routes={nearbyRoutes}
        loading={stopsLoading || routesLoading}
        error={routesError}
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div>
          {sectionHeader("Favourite Routes", (
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50">
              View All
              <ChevronRight size={16} />
            </button>
          ))}
          {mockData.favouriteRoutes.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No favourite routes"
              description="Save your frequently used routes for quick access."
            />
          ) : (
            <div className="space-y-3">
              {mockData.favouriteRoutes.map((route, i) => (
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
          )}
        </div>

        <div>
          {sectionHeader("Recent Trips", (
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50">
              View All
              <ChevronRight size={16} />
            </button>
          ))}
          {mockData.recentTrips.length === 0 ? (
            <EmptyState
              icon={Navigation2}
              title="No recent trips"
              description="Your recent journeys will appear here."
            />
          ) : (
            <div className="space-y-0">
              {mockData.recentTrips.map((trip, i) => (
                <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < mockData.recentTrips.length - 1 && (
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
          )}
        </div>

        <div>
          {sectionHeader("Notifications", (
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50">
              View All
              <ChevronRight size={16} />
            </button>
          ))}
          {mockData.notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're all caught up!"
            />
          ) : (
            <div className="space-y-3">
              {mockData.notifications.map((notif, i) => {
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
          )}
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
