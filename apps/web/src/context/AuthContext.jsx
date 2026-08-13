// Auth context — the single React source of truth for the authentication
// session.
//
// - On mount it restores any valid Supabase session via auth.getSession() and
//   subscribes to onAuthStateChange() so the app stays logged in after refresh
//   and reacts to sign in / sign out / token refresh.
// - The authenticated user object (name, email, phone, role) is built from the
//   public.users profile, so a different passenger logging in automatically
//   changes the identity shown across the app.
// - Temporary demo sessions (driver/admin) are persisted in localStorage and
//   restored here when no Supabase session exists.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import supabase from "../config/supabaseClient";
import { authService } from "../services/auth";

const AuthContext = createContext(null);

async function resolveSupabaseUser(authUser) {
  if (!authUser) return null;
  const profile = await authService.fetchProfile(authUser.id);
  return authService.buildAppUser(authUser, profile);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const disposed = useRef(false);

  const syncUser = useCallback((nextUser) => {
    if (disposed.current) return;
    setUser(nextUser);
    authService.setCurrentUser(nextUser);
  }, []);

  useEffect(() => {
    let subscription = null;
    let active = true;
    disposed.current = false;

    async function initialize() {
      try {
        if (!supabase) {
          // Supabase not configured: only the temporary demo session applies.
          syncUser(authService.readStoredDemoSession());
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (!active) return;

        if (data?.session?.user) {
          setSession(data.session);
          const nextUser = await resolveSupabaseUser(data.session.user);
          if (active) {
            syncUser(nextUser);
            setDemo(false);
          }
        } else {
          syncUser(authService.readStoredDemoSession());
        }

        const { data: authData } = supabase.auth.onAuthStateChange(
          async (_event, nextSession) => {
            if (!active) return;
            if (nextSession?.user) {
              setSession(nextSession);
              setDemo(false);
              authService.clearStoredDemoSession();
              const nextUser = await resolveSupabaseUser(nextSession.user);
              if (active) syncUser(nextUser);
            } else {
              setSession(null);
              setDemo(false);
              syncUser(authService.readStoredDemoSession());
            }
          }
        );
        subscription = authData.subscription;
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
      disposed.current = true;
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async ({ email, password, role }) => {
    const result = await authService.loginUser({ email, password, role });
    if (!result.success) return result;
    if (result.demo) {
      syncUser(result.user);
      setSession(null);
      setDemo(true);
      authService.writeStoredDemoSession(result.user);
    } else {
      // The Supabase session is already live; onAuthStateChange also fires and
      // resolves the same profile, so this is just an immediate sync.
      syncUser(result.user);
      setDemo(false);
    }
    return result;
  }, [syncUser]);

  const logout = useCallback(async () => {
    await authService.logoutUser();
    syncUser(null);
    setSession(null);
    setDemo(false);
  }, [syncUser]);

  const value = useMemo(
    () => ({ user, session, loading, demo, login, logout }),
    [user, session, loading, demo, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
