import type { APIRoute } from "astro";
import { getSession } from "./auth";
import { getServiceClient } from "./supabase";
import { hasPermission, type AdminPermission, type AdminRole } from "./permissions";

export interface AdminProfile {
  id: string | null;
  username: string;
  role: AdminRole;
}

const VALID_ROLES = new Set<AdminRole>(["super_admin", "content_editor", "sales", "viewer"]);

function normalizeRole(role: unknown): AdminRole {
  if (typeof role === "string" && VALID_ROLES.has(role as AdminRole)) {
    return role as AdminRole;
  }
  return "super_admin";
}

/**
 * Resolve role from DB. If table/column missing or user not found (env-var login),
 * default to super_admin so live behaviour is unchanged until roles are assigned.
 */
export async function resolveAdminProfile(username: string): Promise<AdminProfile> {
  try {
    const { data, error } = await getServiceClient()
      .from("admin_users")
      .select("id, username, role, active")
      .eq("username", username)
      .maybeSingle();

    if (!error && data && data.active !== false) {
      return {
        id: data.id ?? null,
        username: data.username,
        role: normalizeRole(data.role),
      };
    }
  } catch {
    // Table may not exist yet — safe fallback
  }

  return { id: null, username, role: "super_admin" };
}

export function getRequestMeta(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip_hint = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
  const user_agent = request.headers.get("user-agent") || null;
  return { ip_hint, user_agent };
}

type AdminAuthResult =
  | { ok: true; session: { user: string; expiresAt: number }; profile: AdminProfile }
  | { ok: false; status: number; error: string };

export async function requireAdmin(
  request: Request,
  permission?: AdminPermission,
): Promise<AdminAuthResult> {
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const profile = await resolveAdminProfile(session.user);

  if (permission && !hasPermission(profile.role, permission)) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, session, profile };
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Convenience wrapper for API routes that need session + optional permission. */
export async function withAdminAuth(
  request: Request,
  permission: AdminPermission | undefined,
  handler: (ctx: { session: { user: string; expiresAt: number }; profile: AdminProfile }) => Promise<Response>,
): Promise<Response> {
  const auth = await requireAdmin(request, permission);
  if (!auth.ok) {
    return jsonResponse({ ok: false, error: auth.error }, auth.status);
  }
  return handler({ session: auth.session, profile: auth.profile });
}
