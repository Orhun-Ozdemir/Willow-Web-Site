import type { APIRoute } from "astro";
import { withAdminAuth, jsonResponse } from "@/lib/admin-auth";
import { validatePublication } from "@/lib/publishing";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => withAdminAuth(request, "publishing.write", async () => {
  try {
    const body = await request.json();
    const errors = validatePublication(body.content || {}, Array.isArray(body.targets) ? body.targets : []);
    return jsonResponse({ ok: true, valid: Object.values(errors).every((messages) => messages.length === 0), errors });
  } catch {
    return jsonResponse({ ok: false, error: "Geçersiz doğrulama isteği." }, 400);
  }
});
