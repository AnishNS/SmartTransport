// Singleton Socket.IO client for the web app.
//
// Exactly ONE socket exists for the whole session. It is authenticated with the
// caller's live Supabase access token (re-read on every (re)connection attempt),
// so the backend can trust `driver:location:update` payloads just like it trusts
// the HTTP Bearer token.
//
// When Supabase is not configured there is no token, the server rejects the
// connection, and every consumer simply degrades (no real-time feed).

import { io } from "socket.io-client";
import supabase from "../../config/supabaseClient";
import { API_BASE_URL } from "../api/client";

let socket = null;

async function resolveToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

function createSocket() {
  // Same-origin by default (proxied through the Vite dev server). Overrides:
  // VITE_SOCKET_URL first, then VITE_API_URL, then the page origin.
  const url =
    import.meta.env.VITE_SOCKET_URL ||
    API_BASE_URL ||
    window.location.origin;
  return io(url, {
    autoConnect: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 15000,
    auth: (cb) => {
      resolveToken().then((token) => cb({ token }));
    },
  });
}

export function getSocket() {
  if (!socket) {
    socket = createSocket();
  }
  return socket;
}

export function isSocketConnected() {
  return Boolean(socket?.connected);
}

// Called on logout: closes the client so a new login re-authenticates cleanly.
export function resetSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export default getSocket;