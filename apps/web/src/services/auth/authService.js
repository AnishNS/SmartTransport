// Authentication service — the single interface every page talks to.
//
// Currently backed by a mock, frontend-only implementation. Passenger
// registrations are persisted in localStorage; driver and admin accounts are
// seeded here (created by the admin / system) and can only be used to log in.
//
// Supabase Auth (email + password) will replace the internals of this module
// later. The contract the rest of the app relies on — registerPassenger,
// loginUser, logoutUser, getCurrentUser, getSession, roleHomePath — is already
// in place so pages do not need to change when the mock is swapped out. Note
// that a full Supabase swap also requires a public profile table keyed to
// auth.users (the current `users` table stores its own password_hash) plus the
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY environment variables; until those
// exist this mock remains the active implementation.

const USERS_STORAGE_KEY = "smarttransport:users";
const SESSION_STORAGE_KEY = "smarttransport:current-user";

// Landing page for each role. Login and route guards use the authenticated
// user's actual role (never the role picked on the Login UI) to pick a target.
export const roleHomePath = {
  passenger: "/dashboard",
  driver: "/driver",
  admin: "/admin",
};

// Development/demo credentials only. These are seeded accounts that exist
// outside the self-service signup flow — drivers are admin-created and the
// admin account uses system credentials, so neither is ever exposed through
// the signup page or the dashboard UI.
const seededAccounts = [
  {
    id: "PS-001",
    name: "Ananya Iyer",
    email: "ananya@example.com",
    phone: "+91 98765 00000",
    password: "passenger123",
    role: "passenger",
    address: "",
    emergencyContact: "",
  },
  {
    id: "DRV-001",
    name: "Rajesh Kumar",
    email: "driver@smarttransport.com",
    phone: "+91 98765 43210",
    password: "Driver@123",
    role: "driver",
    address: "",
    emergencyContact: "",
  },
  {
    id: "AD-001",
    name: "Vijay Raghavan",
    email: "admin@smarttransport.com",
    phone: "+91 98765 00001",
    password: "Admin@123",
    role: "admin",
    address: "",
    emergencyContact: "",
  },
];

function readStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStoredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function allAccounts() {
  return [...seededAccounts, ...readStoredUsers()];
}

function toPublicUser(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: account.role,
    address: account.address || "",
    emergencyContact: account.emergencyContact || "",
  };
}

// Registers a new passenger and persists the account in localStorage.
// Returns { success, user } or { success: false, error }.
export function registerPassenger({
  name,
  email,
  phone,
  password,
  address,
  emergencyContact,
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const exists = allAccounts().some(
    (account) => account.email.toLowerCase() === normalizedEmail
  );

  if (exists) {
    return { success: false, error: "An account with this email already exists." };
  }

  const user = {
    id: `PS-${Date.now().toString().slice(-6)}`,
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    password,
    role: "passenger",
    address: (address || "").trim(),
    emergencyContact: (emergencyContact || "").trim(),
  };

  writeStoredUsers([...readStoredUsers(), user]);
  return { success: true, user: toPublicUser(user) };
}

// Validates credentials AND the role selected on the Login UI against seeded
// and locally registered accounts. A valid account only succeeds when its
// actual role matches the role the user selected at login.
// Returns { success, user } or { success: false, error }.
export function loginUser({ email, password, role }) {
  const account = allAccounts().find(
    (candidate) =>
      candidate.email.toLowerCase() === email.trim().toLowerCase() &&
      candidate.password === password
  );

  if (!account) {
    return { success: false, error: "Invalid email or password." };
  }

  if (account.role !== role) {
    const roleLabels = { passenger: "Passenger", driver: "Driver", admin: "Admin" };
    const label = roleLabels[role] || role || "user";
    const article = /^[aeiou]/i.test(label) ? "an" : "a";
    return {
      success: false,
      error: `These credentials do not belong to ${article} ${label} account.`,
    };
  }

  const user = toPublicUser(account);
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  return { success: true, user };
}

// Clears the current session from localStorage.
export function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// Returns the current session user, or null when signed out.
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Returns the current session in a Supabase-compatible shape: { user } or null.
// Mirrors supabase.auth.getSession() so pages can switch to Supabase without
// changing how they read the session.
export function getSession() {
  const user = getCurrentUser();
  return user ? { user } : null;
}
