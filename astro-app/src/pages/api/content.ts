import type { APIRoute } from "astro";
import { loadContent, saveContent } from "@/lib/content";
import { getSession } from "@/lib/auth";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const data = loadContent();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Failed to read content" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    saveContent(body);
    return new Response(JSON.stringify({ ok: true, content: body }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error.message || "Invalid payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
