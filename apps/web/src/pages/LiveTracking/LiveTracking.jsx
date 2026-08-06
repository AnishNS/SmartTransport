import { useState, useMemo } from "react";
import {
  Bus,
  Navigation,
  Route,
  RefreshCw,
  Circle,
  Check,
  Users,
  Gauge,
  Phone,
  User,
  ChevronDown,
  Search,
  FilterX,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { DEFAULT_CENTER, DEFAULT_ZOOM, TILE_URL, TILE_ATTRIBUTION } from "../../services/maps";
import usePassengerLocation from "../../hooks/usePassengerLocation";
import useNearbyBusStops from "../../hooks/useNearbyBusStops";
import useLiveVehicles from "../../hooks/useLiveVehicles";
import { getRouteById } from "../../services/transport/routeService";

const sectionHeader = (title, action) => (
  <div className="mb-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
      <h2 className="text-lg font-bold tracking-tight text-gray-900">{title}</h2>
    </div>
    {action}
  </div>
);

const formatDistance = (meters) => {
  if (meters == null) return "—";
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
};

const busStopIcon = L.divIcon({
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
  html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#059669,#10b981);border:3px solid white;box-shadow:0 2px 8px rgba(5,150,105,0.4);color:white;font-weight:700;font-size:14px;font-family:system-ui,sans-serif;">B</div>`,
});

const vehicleIcon = L.divIcon({
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
  html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#1d4ed8);border:3px solid white;box-shadow:0 2px 8px rgba(37,99,235,0.4);color:white;font-weight:700;font-size:16px;font-family:system-ui,sans-serif;">V</div>`,
});

const selectedVehicleIcon = L.divIcon({
  className: "",
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -24],
  html: `<div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#1d4ed8,#1e40af);border:3px solid #93c5fd;box-shadow:0 4px 16px rgba(37,99,235,0.5);color:white;font-weight:700;font-size:18px;font-family:system-ui,sans-serif;">V</div>`,
});

const userLocationIcon = L.divIcon({
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3),0 2px 6px rgba(0,0,0,0.3);"></div>`,
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
}

function MapPlaceholder({ vehicles, selectedId, onSelectVehicle, userLatitude, userLongitude }) {
  const { busStops, nearestStop, loading: stopsLoading, error: stopsError, retry: retryStops } = useNearbyBusStops(userLatitude, userLongitude);

  const center = userLatitude != null && userLongitude != null
    ? [userLatitude, userLongitude]
    : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];

  const selectedVehicle = vehicles.find((v) => v.id === selectedId);

  return (
    <div className="relative h-[400px] min-h-[400px] overflow-hidden rounded-2xl border border-gray-100 shadow-sm lg:h-[calc(100vh-300px)]">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <ChangeView center={center} zoom={DEFAULT_ZOOM} />
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

        {userLatitude != null && (
          <Marker position={[userLatitude, userLongitude]} icon={userLocationIcon}>
            <Popup>
              <div className="min-w-[120px]">
                <p className="font-semibold text-gray-900">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {busStops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={busStopIcon}
          >
            <Popup>
              <div className="min-w-[140px] space-y-1">
                <p className="font-semibold text-gray-900">{stop.name}</p>
                <p className="text-sm text-gray-600">{stop.distance}m away</p>
                <p className="text-xs text-gray-400">
                  {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.latitude, vehicle.longitude]}
            icon={vehicle.id === selectedId ? selectedVehicleIcon : vehicleIcon}
            eventHandlers={{ click: () => onSelectVehicle(vehicle.id) }}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-gray-900">{vehicle.vehicleNumber}</p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      vehicle.status === "On Time"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${vehicle.status === "On Time" ? "bg-emerald-500" : "bg-red-500"}`} />
                    {vehicle.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{vehicle.routeName}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Current Stop</p>
                    <p className="font-semibold text-gray-800">{vehicle.currentStop}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Next Stop</p>
                    <p className="font-semibold text-gray-800">{vehicle.nextStop}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    <Users size={12} className="text-gray-400" />
                    {Math.round(vehicle.occupancy / vehicle.capacity * 100)}% occupancy
                  </span>
                  <span className="font-semibold text-blue-600">ETA {vehicle.eta}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {stopsLoading && (
        <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
          <Loader2 size={14} className="animate-spin text-blue-500" />
          <span className="text-xs font-medium text-gray-600">Searching nearby bus stops...</span>
        </div>
      )}

      {stopsError && (
        <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-lg bg-red-50/90 px-3 py-2 shadow-sm backdrop-blur-sm">
          <AlertCircle size={14} className="text-red-500" />
          <span className="text-xs font-medium text-red-600">Unable to load nearby stops. Using available transport data.</span>
          <button
            onClick={retryStops}
            className="ml-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!stopsLoading && !stopsError && busStops.length === 0 && (
        <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-lg bg-amber-50/90 px-3 py-2 shadow-sm backdrop-blur-sm">
          <AlertCircle size={14} className="text-amber-500" />
          {nearestStop ? (
            <span className="text-xs font-medium text-amber-700">
              No stops within radius. Nearest stop: {nearestStop.name} · {formatDistance(nearestStop.distance)}
            </span>
          ) : (
            <span className="text-xs font-medium text-amber-700">No bus stops found within the selected radius</span>
          )}
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-3 rounded-lg border border-gray-100 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <span className="flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-sm">
            <Bus size={6} className="text-white" />
          </span>
          <span>{vehicles.length} Active</span>
        </div>
        {selectedVehicle && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <div className="h-0.5 w-4 bg-blue-400" />
            <span>{selectedVehicle.routeName}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <span className="flex h-3 w-3 items-center justify-center rounded-sm bg-emerald-500 text-white text-[7px] font-bold">B</span>
          <span>{busStops.length} Stops</span>
        </div>
      </div>
    </div>
  );
}

function EtaCard({ vehicle }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
          <Navigation size={26} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-blue-200">Estimated Arrival</p>
          <p className="mt-0.5 text-3xl font-bold tracking-tight text-white">{vehicle.eta}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-blue-200">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {vehicle.routeName}
            </span>
            <span className="text-blue-300">·</span>
            <span>{vehicle.vehicleNumber}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
        <div className="text-center">
          <p className="text-[11px] font-medium text-blue-200">Current</p>
          <p className="text-sm font-bold text-white">{vehicle.currentStop}</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-medium text-blue-200">Next</p>
          <p className="text-sm font-bold text-white">{vehicle.nextStop}</p>
        </div>
      </div>
    </div>
  );
}

function VehicleInfoPanel({ vehicle }) {
  const occupancyPct = Math.round(vehicle.occupancy / vehicle.capacity * 100);
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
          <Bus size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">{vehicle.vehicleNumber}</p>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                vehicle.status === "On Time"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${vehicle.status === "On Time" ? "bg-emerald-500" : "bg-red-500"}`}
              />
              {vehicle.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{vehicle.routeName}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Gauge size={15} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400">Speed</p>
            <p className="text-sm font-bold text-gray-800">{vehicle.speed} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <Users size={15} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400">Occupancy</p>
            <p className="text-sm font-bold text-gray-800">{occupancyPct}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
            <User size={15} className="text-violet-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400">Driver</p>
            <p className="text-sm font-bold text-gray-800">{vehicle.driver || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
            <Phone size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400">Contact</p>
            <p className="text-sm font-bold text-gray-800">{vehicle.contact || "—"}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function JourneyProgress({ vehicle, stops }) {
  const totalStops = stops.length;
  const currentIndex = vehicle._stopIndex;
  const progress = totalStops > 1 ? Math.round((currentIndex / (totalStops - 1)) * 100) : 0;
  return (
    <Card>
      {sectionHeader("Journey Progress")}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">{vehicle.currentStop}</span>
          <span className="text-xs text-gray-400">{progress}% complete</span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{stops[0]?.name}</span>
          <span>{stops[stops.length - 1]?.name}</span>
        </div>
      </div>
    </Card>
  );
}

function RouteTimeline({ vehicle, stops }) {
  const currentIndex = vehicle._stopIndex;
  return (
    <Card>
      {sectionHeader("Route Timeline")}
      <div className="space-y-0">
        {stops.map((stop, i) => {
          const isLast = i === stops.length - 1;
          const status = i < currentIndex ? "completed" : i === currentIndex ? "current" : "upcoming";
          return (
            <div key={stop.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <div
                  className={`absolute left-[19px] top-10 h-full w-0.5 ${
                    status === "completed" ? "bg-emerald-200" : "bg-gray-200"
                  }`}
                />
              )}
              <div className="relative flex shrink-0 items-center justify-center">
                {status === "completed" ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                    <Check size={14} className="text-emerald-600" />
                  </div>
                ) : status === "current" ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow-md shadow-blue-200">
                    <Bus size={16} className="text-white" />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
                    <Circle size={8} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className={`min-w-0 flex-1 pt-1.5 ${status === "current" ? "bg-blue-50/60 -mx-2 rounded-xl px-3 py-1.5" : ""}`}>
                <p
                  className={`text-sm font-semibold ${
                    status === "current" ? "text-blue-700" : status === "completed" ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {stop.name}
                </p>
                {status === "current" && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-blue-500" />
                      <span className="h-1.5 w-1.5 -ml-2 rounded-full bg-blue-500" />
                      Current Stop
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function FilterPanel({ routes, vehicles, filters, setFilters, onReset }) {
  const routeOptions = routes.slice(0, 50);
  const statusOptions = ["On Time", "Delayed"];
  const vehicleOptions = vehicles;

  return (
    <Card className="mb-6" padding={false}>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Search size={16} className="text-blue-500" />
          <span>Filters</span>
        </div>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:sr-only">
              Route
            </label>
            <div className="relative">
              <Route size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filters.route}
                onChange={(e) => setFilters((prev) => ({ ...prev, route: e.target.value }))}
                className="w-full appearance-none rounded-xl border-2 border-gray-100 bg-gray-50/50 py-2.5 pl-9 pr-9 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="all">All Routes</option>
                {routeOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="relative flex-1">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:sr-only">
              Vehicle
            </label>
            <div className="relative">
              <Bus size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filters.vehicle}
                onChange={(e) => setFilters((prev) => ({ ...prev, vehicle: e.target.value }))}
                className="w-full appearance-none rounded-xl border-2 border-gray-100 bg-gray-50/50 py-2.5 pl-9 pr-9 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="all">All Vehicles</option>
                {vehicleOptions.map((v) => (
                  <option key={v.id} value={v.id}>{v.vehicleNumber}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="relative flex-1">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:sr-only">
              Status
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <span className="flex h-2 w-2 rounded-full bg-gray-400" />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full appearance-none rounded-xl border-2 border-gray-100 bg-gray-50/50 py-2.5 pl-9 pr-9 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="all">All Status</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <Button variant="ghost" size="sm" icon={FilterX} onClick={onReset} className="self-end sm:self-center">
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}

function LiveTracking() {
  const { vehicles, loading } = useLiveVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState(() => vehicles[0]?.id ?? null);
  const [filters, setFilters] = useState({ route: "all", vehicle: "all", status: "all" });
  const { latitude: userLat, longitude: userLng } = usePassengerLocation();

  const routeIds = useMemo(
    () => [...new Set(vehicles.map((v) => v.routeId))],
    [vehicles]
  );

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.route !== "all" && v.routeId !== filters.route) return false;
      if (filters.vehicle !== "all" && v.id !== filters.vehicle) return false;
      if (filters.status !== "all" && v.status !== filters.status) return false;
      return true;
    });
  }, [vehicles, filters]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;

  const selectedRoute = selectedVehicle ? getRouteById(selectedVehicle.routeId) : null;

  const resetFilters = () => {
    setFilters({ route: "all", vehicle: "all", status: "all" });
  };

  const refresh = () => {
    setSelectedVehicleId(selectedVehicleId);
  };

  return (
    <DashboardLayout title="Live Tracking" role="passenger">
      <PageHeader
        title="Live Tracking"
        subtitle="Real-time vehicle tracking and route information"
        breadcrumbs={[
          { label: "Dashboard", href: "/passenger" },
          { label: "Live Tracking" },
        ]}
        action={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <FilterPanel
        routes={routeIds}
        vehicles={vehicles}
        filters={filters}
        setFilters={setFilters}
        onReset={resetFilters}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="animate-fade-in-up delay-100">
          <MapPlaceholder
            vehicles={filteredVehicles}
            selectedId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
            userLatitude={userLat}
            userLongitude={userLng}
          />
        </div>

        <div className="space-y-5">
          {loading ? (
            <Card>
              <Loader2 size={20} className="animate-spin text-blue-500" />
            </Card>
          ) : selectedVehicle ? (
            <>
              <div className="animate-fade-in-up delay-200">
                <EtaCard vehicle={selectedVehicle} />
              </div>
              <div className="animate-fade-in-up delay-300">
                <VehicleInfoPanel vehicle={selectedVehicle} />
              </div>
              <div className="animate-fade-in-up delay-400">
                <JourneyProgress vehicle={selectedVehicle} stops={selectedRoute?.stops || []} />
              </div>
              <div className="animate-fade-in-up delay-500">
                <RouteTimeline vehicle={selectedVehicle} stops={selectedRoute?.stops || []} />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">
                No active vehicles available.
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default LiveTracking;