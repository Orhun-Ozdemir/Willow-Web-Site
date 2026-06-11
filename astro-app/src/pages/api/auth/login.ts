import type { APIRoute } from "astro";
import { adminUser, adminPassword, createSession } from "@/lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    if ((body.username || "admin") !== adminUser || body.password !== adminPassword) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid admin credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { token } = createSession(adminUser);
    return new Response(JSON.stringify({ ok: true, user: { name: adminUser } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `willow_admin=${token}; Path=/; Max-Age=43200; HttpOnly; SameSite=Lax`,
      },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
