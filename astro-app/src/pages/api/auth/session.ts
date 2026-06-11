import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  return new Response(
    JSON.stringify({
      ok: true,
      authenticated: !!session,
      user: session ? { name: session.user } : null,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
