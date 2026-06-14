import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
  }

  const apiKey = import.meta.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "GOOGLE_TRANSLATE_API_KEY yapılandırılmamış" }),
      { status: 503 }
    );
  }

  let body: { text: string; targetLangs: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Geçersiz istek gövdesi" }), { status: 400 });
  }

  const { text, targetLangs } = body;
  if (!text?.trim() || !Array.isArray(targetLangs) || targetLangs.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: "text ve targetLangs zorunlu" }), { status: 400 });
  }

  const translations: Record<string, string> = {};
  const errors: string[] = [];

  await Promise.all(
    targetLangs.map(async (lang) => {
      try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: text, source: "en", target: lang, format: "text" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Çeviri başarısız");
        translations[lang] = data.data?.translations?.[0]?.translatedText ?? "";
      } catch (e: any) {
        errors.push(`${lang}: ${e.message}`);
      }
    })
  );

  return new Response(
    JSON.stringify({ ok: true, translations, errors: errors.length ? errors : undefined }),
    { headers: { "Content-Type": "application/json" } }
  );
};
