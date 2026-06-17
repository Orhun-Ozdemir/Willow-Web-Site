import type { APIRoute } from "astro";
import { loadContent, saveContent, saveContentSection } from "@/lib/content";
import { getSession } from "@/lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  // This endpoint returns the full CMS payload, including admin-only settings such as
  // companyFacts.googleTranslateApiKey. It is consumed only by the admin UI, so require
  // an authenticated session — otherwise the secrets would be world-readable.
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Admin reads must never receive the bundled placeholder fallback — otherwise a
    // transient Supabase hiccup could be saved back over real data. On failure this
    // throws and the admin shows a load error instead.
    const data = await loadContent({ allowFallback: false });
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
    const url = new URL(request.url);
    const section = url.searchParams.get("section");
    const body = await request.json();

    if (section) {
      await saveContentSection(section, body);
    } else {
      await saveContent(body);
    }

    return new Response(JSON.stringify({ ok: true, content: body }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error.message || "Save failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
