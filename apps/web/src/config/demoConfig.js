// Central demo configuration for SmartTransport.
//
// The entire frontend runs against mock data in demo mode, so the app is fully
// functional without a backend. Flip `demoMode` to false (and swap the mock
// services for real API clients) when a backend becomes available.

export const demoConfig = {
  appName: "SmartTransport",
  demoMode: true,

  // Region / city used for demo data realism.
  city: "Coimbatore",
  region: "Tamil Nadu",
  operatingWindow: { start: "06:00", end: "22:00" },

  // The driver identity used for the Driver Dashboard demo session.
  currentDriverId: "DRV-001",

  // localStorage key used to persist driver trip lifecycle state.
  tripStorageKey: "smarttransport:driver-trip-state",

  // Vehicle simulation refresh interval (ms).
  refreshIntervalMs: 2000,
};

export default demoConfig;
