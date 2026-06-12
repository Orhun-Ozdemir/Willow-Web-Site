import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { AstroCookies } from "astro";

// Works for both build-time (import.meta.env) and SSR runtime (process.env on Vercel/Node).
const env = (key: string): string | undefined =>
  (import.meta.env as any)?.[key] ?? (typeof process !== "undefined" ? process.env?.[key] : undefined);

export const SUPABASE_URL = env("SUPABASE_URL") || env("PUBLIC_SUPABASE_URL") || "";
export const SUPABASE_ANON_KEY = env("SUPABASE_ANON_KEY") || env("PUBLIC_SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = env("SUPABASE_SERVICE_ROLE_KEY") || "";

/** True when the public read credentials are present. When false, callers fall back to local JSON. */
export const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let _publicClient: SupabaseClient | null = null;
let _serviceClient: SupabaseClient | null = null;

/** Anon client — public reads and public form inserts (subject to RLS). */
export function getPublicClient(): SupabaseClient {
  if (!_publicClient) {
    _publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _publicClient;
}

/**
 * Service-role client — server-side only. Bypasses RLS.
 * Use for content saves, bot logging, and admin reads. NEVER import into client code.
 */
export function getServiceClient(): SupabaseClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — required for privileged server writes.");
  }
  if (!_serviceClient) {
    _serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _serviceClient;
}

/**
 * Cookie-aware auth client for the admin session (Supabase Auth via @supabase/ssr).
 * Reads auth cookies from the incoming request headers and writes refreshed
 * cookies back through Astro's cookie API. Use in API routes and middleware.
 */
export function createSupabaseServerClient(request: Request, cookies: AstroCookies): SupabaseClient {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "").map(({ name, value }) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, { ...options, path: "/" });
        });
      },
    },
  });
}
