// Authentication service — the single interface every page talks to.
//
// REAL SUPABASE AUTH
// - Passenger signup  -> supabase.auth.signUp({ email, password })
// - Passenger login   -> supabase.auth.signInWithPassword()
// - Session handling  -> supabase.auth.getSession() + onAuthStateChange()
//                        (managed by the AuthContext)
// - Logout            -> supabase.auth.signOut()
//
// The passenger's profile lives in the `public.users` table and is keyed to the
// Supabase Auth user id. Authentication itself is always owned by Supabase Auth
// (GoTrue): the app NEVER writes plaintext passwords and NEVER uses
// `users.password_hash` for authentication. `password_hash` is NOT NULL in the
// current schema but is not part of this flow, so profile rows are created with
// an empty string purely to satisfy the column constraint.
//
// TEMPORARY DEMO AUTH
// The admin account now lives in Supabase Auth (created server-side via the
// seed script), so it authenticates through Supabase Auth exclusively. The
// seeded driver demo account below is the only remaining fallback; it runs
// only when Supabase rejects those credentials. This demo path will be removed
// once admin-created driver accounts land in Supabase.

import supabase from "../../config/supabaseClient";

// Landing page for each role. Login and route guards use the authenticated
// user's actual role (never the role picked on the Login UI) to pick a target.
export const roleHomePath = {
  passenger: "/dashboard",
  driver: "/driver",
  admin: "/admin",
};

const SESSION_STORAGE_KEY = "smarttransport:current-user";

const roleLabels = { passenger: "Passenger", driver: "Driver", admin: "Admin" };

// Development/demo credentials only. The driver demo account exists outside
// the self-service signup flow (drivers are admin-created), so it is never
// exposed through the signup page. The admin account is excluded here on
// purpose: it is a real Supabase Auth account and its password must never be
// hardcoded in frontend source.
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
];

// Cache of the current app user, mirrored by the AuthContext. Kept so the
// documented service contract (getCurrentUser / getSession) remains usable by
// any non-React consumer.
let currentUserCache = null;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Development-only diagnostics for the signup/login -> profile flow. Never
// logs passwords, tokens, or the raw signup response.
function devLog(...args) {
  if (import.meta.env.DEV) {
    console.info("[auth]", ...args);
  }
}

function roleMismatchError(selectedRole) {
  const label = roleLabels[selectedRole] || selectedRole || "user";
  const article = /^[aeiou]/i.test(label) ? "an" : "a";
  return `These credentials do not belong to ${article} ${label} account.`;
}

// Maps a Supabase Auth error from signInWithPassword() to a message that
// preserves the real failure reason instead of a generic "Invalid password".
// Unknown errors pass the Supabase message through unchanged so the actual
// cause (invalid credentials, email not confirmed, etc.) is never masked.
function loginErrorMessage(error) {
  if (!error) return "Invalid email or password.";
  const message = error.message || "";
  const code = error.code || "";

  if (code === "email_not_confirmed") {
    return "Please confirm your email address before logging in. Check your inbox for the confirmation link.";
  }
  if (code === "invalid_credentials") {
    return "Invalid email or password.";
  }
  if (/not confirmed/i.test(message)) {
    return "Please confirm your email address before logging in. Check your inbox for the confirmation link.";
  }
  return message || "Invalid email or password.";
}

function readStoredDemoSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredDemoSession(user) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

function clearStoredDemoSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// Builds the app-level user object that pages render. Identity fields come from
// the public.users profile (the source of truth for role); optional address /
// emergency contact come from the Supabase auth user metadata captured at
// signup (those columns do not exist on public.users yet).
export function buildAppUser(authUser, profile) {
  const metadata = authUser?.user_metadata || {};
  return {
    id: authUser?.id || profile?.id || "",
    name: profile?.name || metadata.name || "",
    email: profile?.email || authUser?.email || "",
    phone: profile?.phone || metadata.phone || "",
    role: profile?.role || "",
    address: metadata.address || profile?.address || "",
    emergencyContact: metadata.emergency_contact || profile?.emergencyContact || "",
  };
}

export function isSupabaseConfigured() {
  return Boolean(supabase);
}

// Fetches the authenticated user's profile from public.users.
// Returns the row or null when no profile exists yet (or RLS hides it).
export async function fetchProfile(userId) {
  if (!supabase || !userId) return null;
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data || null;
}

// Creates a passenger profile row in public.users keyed to the Supabase Auth
// user id. Idempotent: if the server-side trigger in
// database/auth_profile_trigger.sql already created the row (the normal path
// when email confirmation is enabled), the upsert is a no-op.
// `address` / `emergencyContact` are accepted for the caller contract but are
// not persisted yet (no columns exist on public.users for them); they are kept
// in the auth user metadata captured at signup instead.
export async function createPassengerProfile({
  id,
  name,
  email,
  phone,
}) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const row = {
    id,
    name: (name || "").trim(),
    email: normalizeEmail(email),
    phone: (phone || "").trim(),
    // NOT NULL column, never used for authentication (Supabase Auth owns
    // passwords). Empty string keeps the row insertable without storing
    // any credential material.
    password_hash: "",
    role: "passenger",
  };

  const { error } = await supabase
    .from("users")
    .upsert([row], { onConflict: "id", ignoreDuplicates: true });

  if (error) {
    // RLS blocked the insert. If the server-side trigger already created the
    // profile, that is the desired outcome - treat it as a no-op.
    if (error.code === "42501") {
      const existing = await fetchProfile(id);
      if (existing) return existing;
      throw new Error(
        "Profile could not be created because the RLS policy on public.users is missing or misconfigured. Run database/rls_auth_policies.sql in the Supabase SQL editor."
      );
    }
    throw new Error(error.message || "Could not create profile.");
  }

  return (await fetchProfile(id)) || row;
}

// Registers a new passenger through Supabase Auth and stores their profile.
// Returns { success, user, needsEmailConfirmation } or { success: false, error }.
export async function registerPassenger({
  name,
  email,
  phone,
  password,
  address,
  emergencyContact,
}) {
  if (!supabase) {
    return {
      success: false,
      error: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    };
  }

  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        name: (name || "").trim(),
        phone: (phone || "").trim(),
        address: (address || "").trim(),
        emergency_contact: (emergencyContact || "").trim(),
      },
    },
  });

  if (error || !data?.user) {
    let message = error?.message || "Signup failed.";
    if (/already registered/i.test(message)) {
      message = "An account with this email already exists.";
    } else if (/at least 6 characters/i.test(message)) {
      message = "Password must be at least 6 characters.";
    }
    return { success: false, error: message };
  }

  const authUser = data.user;
  const publicUser = {
    id: authUser.id,
    name: (name || "").trim(),
    email: normalizedEmail,
    phone: (phone || "").trim(),
    role: "passenger",
    address: (address || "").trim(),
    emergencyContact: (emergencyContact || "").trim(),
  };

  devLog("signup ok", {
    userId: authUser.id,
    email: normalizedEmail,
    hasSession: Boolean(data.session),
    // When email confirmation is enabled, no session is issued yet. The
    // database trigger (database/auth_profile_trigger.sql) creates the
    // profile server-side; the client cannot insert without a session.
    needsEmailConfirmation: Boolean(!data.session),
  });

  // Email confirmation is enabled in Supabase: no session is issued until the
  // user confirms. The profile row is created by the auth.users trigger; the
  // client lazy-create on first login covers any pre-existing accounts.
  if (!data.session) {
    return { success: true, needsEmailConfirmation: true, user: publicUser };
  }

  try {
    const profile = await createPassengerProfile({
      id: authUser.id,
      name,
      email: normalizedEmail,
      phone,
      address,
      emergencyContact,
    });
    devLog("profile present after signup", { userId: authUser.id, hasProfile: Boolean(profile) });
    // Sign out so the user logs in explicitly (matches the original UX).
    await supabase.auth.signOut().catch(() => {});
    return { success: true, needsEmailConfirmation: false, user: buildAppUser(authUser, profile) };
  } catch (err) {
    devLog("profile create failed at signup", { userId: authUser.id, error: err.message });
    await supabase.auth.signOut().catch(() => {});
    return { success: false, error: err.message };
  }
}

// Logs a user in. REAL SUPABASE AUTH is attempted first; the role stored in
// public.users is the source of truth and is validated against the role the
// user selected on the Login UI. If Supabase has no such account, TEMPORARY
// DEMO AUTH falls back to the seeded driver/admin accounts. Passengers
// authenticate through Supabase Auth exclusively.
// Returns { success, user, demo } or { success: false, error }.
export async function loginUser({ email, password, role }) {
  const normalizedEmail = normalizeEmail(email);

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (!error && data?.session && data?.user) {
      const authUser = data.user;
      devLog("login ok", { userId: authUser.id, email: normalizedEmail });
      let profile = await fetchProfile(authUser.id);

      if (!profile) {
        // Lazy-create a passenger profile for accounts signed up while email
        // confirmation was enabled (no session existed at signup). Only
        // passengers can self-register, so a profile-less Supabase account is
        // treated as a passenger using the metadata captured at signup.
        const metadata = authUser.user_metadata || {};
        if (metadata.name || metadata.phone) {
          try {
            profile = await createPassengerProfile({
              id: authUser.id,
              name: metadata.name || "Passenger",
              email: authUser.email,
              phone: metadata.phone || "",
              address: metadata.address || "",
              emergencyContact: metadata.emergency_contact || "",
            });
          } catch (createError) {
            devLog("lazy profile create failed", { userId: authUser.id, error: createError.message });
            await supabase.auth.signOut().catch(() => {});
            return { success: false, error: createError.message };
          }
        }
      }

      devLog("profile resolved at login", { userId: authUser.id, hasProfile: Boolean(profile) });

      if (!profile) {
        await supabase.auth.signOut().catch(() => {});
        return {
          success: false,
          error: "No profile was found for this account. Please contact support.",
        };
      }

      const appUser = buildAppUser(authUser, profile);

      // The Login UI role selection must NEVER override the stored role.
      if (appUser.role !== role) {
        await supabase.auth.signOut().catch(() => {});
        return { success: false, error: roleMismatchError(role) };
      }

      clearStoredDemoSession();
      return { success: true, user: appUser, demo: false };
    }

    if (error) {
      // Development-only diagnostics for the passenger login failure. Never
      // logs the actual password.
      devLog("supabase signInWithPassword rejected", {
        email: normalizedEmail,
        hasPassword: Boolean(password),
        passwordLength: password ? password.length : 0,
        message: error.message,
        status: error.status,
        code: error.code,
      });

      // A real passenger account always lives in Supabase, so a passenger
      // whose credentials are rejected by Supabase must see the ACTUAL
      // Supabase error (e.g. "Invalid login credentials", "Email not
      // confirmed"). Only the seeded driver demo account (which does not exist
      // in Supabase yet) falls through to the temporary demo path below.
      const isSeededDriverOrAdmin = seededAccounts.some(
        (candidate) =>
          candidate.role !== "passenger" &&
          candidate.email.toLowerCase() === normalizedEmail
      );

      if (!isSeededDriverOrAdmin) {
        return { success: false, error: loginErrorMessage(error) };
      }
    }
  }

  // TEMPORARY DEMO AUTH — only for the seeded driver demo account.
  const account = seededAccounts.find(
    (candidate) =>
      candidate.role !== "passenger" &&
      candidate.email.toLowerCase() === normalizedEmail &&
      candidate.password === password
  );

  if (account) {
    if (account.role !== role) {
      return { success: false, error: roleMismatchError(role) };
    }
    const appUser = buildAppUser({ id: account.id, email: account.email }, account);
    return { success: true, user: appUser, demo: true };
  }

  return { success: false, error: "Invalid email or password." };
}

// Ends the current session. Always calls supabase.auth.signOut() so the
// Supabase token is cleared; safe to call for demo sessions too.
export async function logoutUser() {
  if (supabase) {
    await supabase.auth.signOut().catch(() => {});
  }
  clearStoredDemoSession();
}

// Session helpers used by the AuthContext and any non-React consumers.
export function getCurrentUser() {
  return currentUserCache;
}

export function setCurrentUser(user) {
  currentUserCache = user;
}

export function getSession() {
  return currentUserCache ? { user: currentUserCache } : null;
}

export { readStoredDemoSession, writeStoredDemoSession, clearStoredDemoSession };
