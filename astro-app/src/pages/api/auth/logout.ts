import type { APIRoute } from "astro";
import { deleteSession } from "@/lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  deleteSession(request.headers.get("cookie"));
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "willow_admin=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
    },
  });
};
