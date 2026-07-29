import { useState } from "react";
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
import useGeolocation from "../../hooks/useGeolocation";
import useNearbyBusStops from "../../hooks/useNearbyBusStops";

const vehiclesData = [
  {
    id: "TN-01-AB-1234",
    route: "Route 42",
    routeName: "Central Market → Bus Stand",
    driver: "Rajesh Kumar",
    contact: "+91 98765 43210",
    speed: 32,
    eta: "2 min",
    occupancy: 68,
    status: "On Time",
    currentStop: "Gandhi Nagar",
    nextStop: "City Centre",
    progress: 65,
    mapX: 44,
    mapY: 48,
    latitude: 11.0208,
    longitude: 76.9438,
    stops: [
      { name: "Central Market", time: "8:30 AM", status: "completed" },
      { name: "Railway Station", time: "8:38 AM", status: "completed" },
      { name: "Gandhi Nagar", time: "8:45 AM", status: "current" },
      { name: "City Centre", time: "8:52 AM", status: "upcoming" },
      { name: "Tech Park", time: "9:00 AM", status: "upcoming" },
      { name: "Bus Stand", time: "9:10 AM", status: "upcoming" },
    ],
  },
  {
    id: "TN-01-CD-5678",
    route: "Route 15",
    routeName: "Railway Stn → College",
    driver: "Priya Sharma",
    contact: "+91 98765 43211",
    speed: 28,
    eta: "5 min",
    occupancy: 85,
    status: "On Time",
    currentStop: "MG Road",
    nextStop: "University Gate",
    progress: 40,
    mapX: 26,
    mapY: 60,
    latitude: 10.9968,
    longitude: 76.9078,
    stops: [
      { name: "Railway Station", time: "8:15 AM", status: "completed" },
      { name: "MG Road", time: "8:25 AM", status: "current" },
      { name: "University Gate", time: "8:35 AM", status: "upcoming" },
      { name: "College Campus", time: "8:45 AM", status: "upcoming" },
    ],
  },
  {
    id: "TN-01-EF-9012",
    route: "Route 7",
    routeName: "Hospital → Bus Stand",
    driver: "Suresh Patel",
    contact: "+91 98765 43212",
    speed: 12,
    eta: "8 min",
    occupancy: 45,
    status: "Delayed",
    currentStop: "Lake View",
    nextStop: "Old Town",
    progress: 55,
    mapX: 64,
    mapY: 55,
    latitude: 11.0068,
    longitude: 76.9838,
    stops: [
      { name: "City Hospital", time: "8:00 AM", status: "completed" },
      { name: "Lake View", time: "8:12 AM", status: "current" },
      { name: "Old Town", time: "8:25 AM", status: "upcoming" },
      { name: "Market Square", time: "8:35 AM", status: "upcoming" },
      { name: "Bus Stand", time: "8:50 AM", status: "upcoming" },
    ],
  },
  {
    id: "TN-01-GH-3456",
    route: "Route 21",
    routeName: "Market → Industrial Area",
    driver: "Anita Verma",
    contact: "+91 98765 43213",
    speed: 35,
    eta: "3 min",
    occupancy: 92,
    status: "On Time",
    currentStop: "Water Tank",
    nextStop: "Factory Gate",
    progress: 78,
    mapX: 72,
    mapY: 32,
    latitude: 11.0528,
    longitude: 76.9998,
    stops: [
      { name: "City Market", time: "7:45 AM", status: "completed" },
      { name: "Water Tank", time: "7:55 AM", status: "current" },
      { name: "Factory Gate", time: "8:05 AM", status: "upcoming" },
      { name: "Industrial Area", time: "8:15 AM", status: "upcoming" },
    ],
  },
  {
    id: "TN-01-IJ-7890",
    route: "Route 33",
    routeName: "Bus Stand → Park",
    driver: "Vikram Singh",
    contact: "+91 98765 43214",
    speed: 30,
    eta: "6 min",
    occupancy: 30,
    status: "On Time",
    currentStop: "Museum",
    nextStop: "Garden Road",
    progress: 35,
    mapX: 38,
    mapY: 28,
    latitude: 11.0608,
    longitude: 76.9318,
    stops: [
      { name: "Bus Stand", time: "8:20 AM", status: "completed" },
      { name: "Museum", time: "8:30 AM", status: "current" },
      { name: "Garden Road", time: "8:40 AM", status: "upcoming" },
      { name: "Central Park", time: "8:50 AM", status: "upcoming" },
    ],
  },
];

const routeOptions = [...new Set(vehiclesData.map((v) => v.route))];
const statusOptions = [...new Set(vehiclesData.map((v) => v.status))];
const vehicleOptions = vehiclesData.map((v) => v.id);

const sectionHeader = (title, action) => (
  <div className="mb-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
      <h2 className="text-lg font-bold tracking-tight text-gray-900">{title}</h2>
    </div>
    {action}
  </div>
);

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
  const { busStops, loading: stopsLoading, error: stopsError, retry: retryStops } = useNearbyBusStops(userLatitude, userLongitude);

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
              <div className="min-w-[160px] space-y-1">
                <p className="font-semibold text-gray-900">{vehicle.id}</p>
                <p className="text-sm text-gray-600">{vehicle.routeName}</p>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  vehicle.status === "On Time"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${vehicle.status === "On Time" ? "bg-emerald-500" : "bg-red-500"}`} />
                  {vehicle.status}
                </span>
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
          <span className="text-xs font-medium text-red-600">Unable to fetch nearby stops. Showing available transport network.</span>
          <button
            onClick={retryStops}
            className="ml-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
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
            <span>{selectedVehicle.route}</span>
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
          <Navigation className="text-white" size={26} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-blue-200">Estimated Arrival</p>
          <p className="mt-0.5 text-3xl font-bold tracking-tight text-white">{vehicle.eta}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-blue-200">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {vehicle.route}
            </span>
            <span className="text-blue-300">·</span>
            <span>{vehicle.id}</span>
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
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
          <Bus size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">{vehicle.id}</p>
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
            <p className="text-sm font-bold text-gray-800">{vehicle.occupancy}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
            <User size={15} className="text-violet-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400">Driver</p>
            <p className="text-sm font-bold text-gray-800">{vehicle.driver}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
            <Phone size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400">Contact</p>
            <p className="text-sm font-bold text-gray-800">{vehicle.contact}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function JourneyProgress({ vehicle }) {
  return (
    <Card>
      {sectionHeader("Journey Progress")}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">{vehicle.currentStop}</span>
          <span className="text-xs text-gray-400">{vehicle.progress}% complete</span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${vehicle.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{vehicle.stops[0].name}</span>
          <span>{vehicle.stops[vehicle.stops.length - 1].name}</span>
        </div>
      </div>
    </Card>
  );
}

function RouteTimeline({ vehicle }) {
  return (
    <Card>
      {sectionHeader("Route Timeline")}
      <div className="space-y-0">
        {vehicle.stops.map((stop, i) => {
          const isLast = i === vehicle.stops.length - 1;
          return (
            <div key={stop.name} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <div
                  className={`absolute left-[19px] top-10 h-full w-0.5 ${
                    stop.status === "completed" ? "bg-emerald-200" : "bg-gray-200"
                  }`}
                />
              )}
              <div className="relative flex shrink-0 items-center justify-center">
                {stop.status === "completed" ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                    <Check size={14} className="text-emerald-600" />
                  </div>
                ) : stop.status === "current" ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow-md shadow-blue-200">
                    <Bus size={16} className="text-white" />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
                    <Circle size={8} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className={`min-w-0 flex-1 pt-1.5 ${stop.status === "current" ? "bg-blue-50/60 -mx-2 rounded-xl px-3 py-1.5" : ""}`}>
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-semibold ${
                      stop.status === "current" ? "text-blue-700" : stop.status === "completed" ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {stop.name}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      stop.status === "completed" ? "text-gray-400" : stop.status === "current" ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {stop.time}
                  </span>
                </div>
                {stop.status === "current" && (
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

function FilterPanel({ filters, setFilters, onReset }) {
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
                  <option key={v} value={v}>{v}</option>
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
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehiclesData[0].id);
  const [filters, setFilters] = useState({ route: "all", vehicle: "all", status: "all" });
  const { latitude: userLat, longitude: userLng } = useGeolocation();

  const filteredVehicles = vehiclesData.filter((v) => {
    if (filters.route !== "all" && v.route !== filters.route) return false;
    if (filters.vehicle !== "all" && v.id !== filters.vehicle) return false;
    if (filters.status !== "all" && v.status !== filters.status) return false;
    return true;
  });

  const selectedVehicle = vehiclesData.find((v) => v.id === selectedVehicleId) || vehiclesData[0];

  const resetFilters = () => {
    setFilters({ route: "all", vehicle: "all", status: "all" });
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
          <Button variant="outline" size="sm" icon={RefreshCw}>
            Refresh
          </Button>
        }
      />

      <FilterPanel filters={filters} setFilters={setFilters} onReset={resetFilters} />

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
          <div className="animate-fade-in-up delay-200">
            <EtaCard vehicle={selectedVehicle} />
          </div>
          <div className="animate-fade-in-up delay-300">
            <VehicleInfoPanel vehicle={selectedVehicle} />
          </div>
          <div className="animate-fade-in-up delay-400">
            <JourneyProgress vehicle={selectedVehicle} />
          </div>
          <div className="animate-fade-in-up delay-500">
            <RouteTimeline vehicle={selectedVehicle} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default LiveTracking;
