import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth";
import { resolveAdminProfile } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/permissions";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return new Response(
      JSON.stringify({ ok: true, authenticated: false, user: null }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const profile = await resolveAdminProfile(session.user);
  return new Response(
    JSON.stringify({
      ok: true,
      authenticated: true,
      user: {
        name: session.user,
        role: profile.role,
        canAudit: hasPermission(profile.role, "audit.read"),
        canManageUsers: hasPermission(profile.role, "users.manage"),
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
