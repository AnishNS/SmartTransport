import { useState, useEffect, useRef, useMemo } from "react";
import {
  MapPin,
  Navigation,
  ArrowLeftRight,
  Search,
  Bus,
  Route,
  Clock,
  Award,
  Map,
  AlertTriangle,
  ChevronRight,
  Shuffle,
  RefreshCw,
  Crosshair,
  Compass,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import usePassengerLocation from "../../hooks/usePassengerLocation";
import { recommendBestRoute, findNearestStop, findDestinationStops } from "../../services/transport/routeRecommendationService";
import { calculateDistance } from "../../utils/location/distance";
import { getAllBusStops } from "../../services/transport/stopService";

const quickActions = [
  { label: "Track Live Vehicles", icon: Bus, gradient: "from-blue-500 to-blue-600", hoverBorder: "hover:border-blue-200" },
  { label: "View Fare Chart", icon: Route, gradient: "from-emerald-500 to-emerald-600", hoverBorder: "hover:border-emerald-200" },
  { label: "Download Route Map", icon: Map, gradient: "from-violet-500 to-violet-600", hoverBorder: "hover:border-violet-200" },
  { label: "Report an Issue", icon: AlertTriangle, gradient: "from-red-500 to-red-600", hoverBorder: "hover:border-red-200" },
];

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

function RoutePlanner() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const { latitude, longitude, loading: locationLoading } = usePassengerLocation();
  const userLocation = useMemo(
    () => (latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null),
    [latitude, longitude]
  );
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  const sourceAutoFilled = useRef(false);

  useEffect(() => {
    if (locationLoading || sourceAutoFilled.current || !userLocation) return;
    Promise.resolve().then(() => {
      if (sourceAutoFilled.current) return;
      const stop = findNearestStop(userLocation.lat, userLocation.lng);
      if (stop) {
        setSource(stop.name);
        sourceAutoFilled.current = true;
      }
    });
  }, [locationLoading, userLocation]);

  useEffect(() => {
    const handleClick = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDestinationChange = (value) => {
    setDestination(value);
    setResult(null);
    setError(null);
    if (value.trim().length >= 2) {
      const matches = findDestinationStops(value);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (stop) => {
    setDestination(stop.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const swapLocations = () => {
    setSource(destination);
    setDestination(source);
  };

  const handleSearch = () => {
    setError(null);
    setResult(null);

    if (!userLocation) {
      setError("LOCATION_UNAVAILABLE");
      return;
    }
    if (!destination.trim()) {
      setError("DESTINATION_NOT_FOUND");
      return;
    }

    setSearching(true);
    const recResult = recommendBestRoute(
      { latitude: userLocation.lat, longitude: userLocation.lng },
      destination
    );

    if (recResult.error) {
      setError(recResult.error);
    } else {
      setResult(recResult);
    }
    setSearching(false);
  };

  const errorConfig = {
    LOCATION_UNAVAILABLE: {
      title: "Location Unavailable",
      description: "Could not determine your location. Please enable location services and try again.",
      icon: Compass,
    },
    DESTINATION_NOT_FOUND: {
      title: "Destination Not Found",
      description: "No bus stop found matching your destination. Try searching for a nearby area or landmark.",
      icon: MapPin,
    },
    NO_ROUTE_AVAILABLE: {
      title: "No Route Available",
      description: "No direct bus route connects these locations. Try a different destination or check nearby stops.",
      icon: Bus,
    },
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
                    {locationLoading ? (
                      <div className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-400">
                        <LoadingSpinner size="sm" />
                        Detecting location...
                      </div>
                    ) : (
                      <>
                        <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input
                          type="text"
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                          placeholder="Enter current location..."
                          className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 py-3 pl-11 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                        />
                        {userLocation && (
                          <Crosshair
                            size={14}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 cursor-pointer hover:text-blue-600"
                            onClick={() => {
                              const stop = findNearestStop(userLocation.lat, userLocation.lng);
                              if (stop) {
                                setSource(stop.name);
                              }
                            }}
                            title="Reset to current location"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={swapLocations}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-400 transition-all duration-200 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
                  title="Swap locations"
                >
                  <ArrowLeftRight size={16} />
                </button>
                <div className="flex-1 relative">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Destination</label>
                  <div className="relative">
                    <Navigation size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                      placeholder="Search for a bus stop..."
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                  {showSuggestions && (
                    <div
                      ref={suggestionRef}
                      className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
                    >
                      {suggestions.map((stop) => (
                        <button
                          key={stop.id}
                          onClick={() => selectSuggestion(stop)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-emerald-50 border-b border-gray-50 last:border-0"
                        >
                          <MapPin size={14} className="shrink-0 text-emerald-500" />
                          <div>
                            <p className="font-medium text-gray-900">{stop.name}</p>
                            <p className="text-xs text-gray-400">{stop.id}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  icon={Search}
                  className="shrink-0 sm:mb-0.5"
                  onClick={handleSearch}
                  loading={searching}
                >
                  Search Route
                </Button>
              </div>
            </Card>
          </div>

          <div className="animate-fade-in-up delay-200">
            <Card>
              <SectionHeader title={result ? "Route Result" : "Route Planner"} />
              {searching ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <EmptyState
                  icon={errorConfig[error]?.icon || AlertTriangle}
                  title={errorConfig[error]?.title || "Error"}
                  description={errorConfig[error]?.description || "An unexpected error occurred."}
                />
              ) : result ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
                      <Bus size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{result.route.routeNumber}</p>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <Award size={12} className="mr-1" />
                          Direct Route
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">{result.route.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                      <MapPin size={13} className="text-blue-500" />
                      Board: {result.boardingStop?.name}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                      <Navigation size={13} className="text-emerald-500" />
                      Dest: {result.destinationStop?.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                      <Route size={13} className="text-gray-400" />
                      {result.numberOfStops} stops
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                      <Clock size={13} className="text-gray-400" />
                      {result.estimatedTime}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                      <MapPin size={13} className="text-gray-400" />
                      {result.distance}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                      <Shuffle size={13} className="text-gray-400" />
                      Direct
                    </span>
                  </div>
                  {result.intermediateStops.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Route stops:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 border border-blue-100">
                          {result.boardingStop?.name}
                        </span>
                        {result.intermediateStops.map((s) => (
                          <span key={s.id} className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500 border border-gray-100">
                            {s.name}
                          </span>
                        ))}
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                          {result.destinationStop?.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Navigation}
                  title="Plan Your Journey"
                  description="Enter your destination to find the best bus route from your current location."
                />
              )}
            </Card>
          </div>

          {result && (
            <div className="animate-fade-in-up delay-300">
              <Card>
                <SectionHeader title="Journey Summary" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatCard icon={Clock} label="Travel Time" value={result.estimatedTime} gradient="from-blue-500 to-blue-600" />
                  <StatCard icon={Route} label="Stops" value={`${result.numberOfStops} stops`} gradient="from-emerald-500 to-emerald-600" />
                  <StatCard icon={MapPin} label="Distance" value={result.distance} gradient="from-violet-500 to-violet-600" />
                  <StatCard icon={Bus} label="Route" value={result.route.routeNumber} gradient="from-amber-500 to-amber-600" />
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="animate-fade-in-up delay-200">
            <Card>
              <SectionHeader
                title="Nearby Bus Stops"
                action={locationLoading ? null : (
                  <button
                    onClick={() => {
                      if (userLocation) {
                        const stop = findNearestStop(userLocation.lat, userLocation.lng);
                        if (stop) {
                          setSource(stop.name);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50"
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                )}
              />
              {locationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <div className="space-y-4">
                  {getAllBusStops().slice(0, 6).map((stop) => {
                    const dist = userLocation
                      ? Math.round(calculateDistance(userLocation.lat, userLocation.lng, stop.latitude, stop.longitude))
                      : null;
                    return (
                      <div
                        key={stop.id}
                        className="group rounded-xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-sm cursor-pointer"
                        onClick={() => {
                          setDestination(stop.name);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100">
                            <Bus size={16} className="text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900">{stop.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                              {dist !== null && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin size={11} className="text-gray-400" />
                                  {dist < 1000 ? `${dist} m` : `${(dist / 1000).toFixed(1)} km`}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {stop.routes.length > 0 ? (
                                stop.routes.map((r) => (
                                  <span
                                    key={r}
                                    className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600"
                                  >
                                    {r}
                                  </span>
                                ))
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                                  No routes
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight size={14} className="mt-2 shrink-0 text-gray-300 transition-colors group-hover:text-blue-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
