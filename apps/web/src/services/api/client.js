// API client for the Node/Express backend.
//
// Talks to the backend (default http://localhost:5000). Admin-only operations
// (driver management) require the caller's Supabase access token, which is
// attached as an Authorization: Bearer header on every request. The token is
// fetched from the live Supabase session — the service_role key never touches
// the browser.

import axios from "axios";
import supabase from "../../config/supabaseClient";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

// Thin wrapper: injects the Bearer token and normalizes errors.
export async function apiRequest(method, path, body) {
  const token = await getAccessToken();

  const config = {
    method,
    url: path,
  };

  if (body !== undefined) config.data = body;
  if (token) {
    config.headers = { Authorization: `Bearer ${token}` };
  }

  try {
    const { data } = await client.request(config);
    return data;
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    if (status === 401) {
      throw new Error(
        "Your session is invalid or has expired. Please sign in again.",
        { cause: error }
      );
    }
    if (status === 403) {
      throw new Error(
        "You do not have permission to perform this action.",
        { cause: error }
      );
    }
    throw new Error(message, { cause: error });
  }
}

export default client;
