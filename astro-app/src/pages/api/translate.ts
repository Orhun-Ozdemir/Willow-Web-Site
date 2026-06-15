import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth";
import { loadContent } from "@/lib/content";

export const prerender = false;

const env = (key: string): string | undefined =>
  (import.meta.env as any)?.[key] ?? (typeof process !== "undefined" ? process.env?.[key] : undefined);

export const POST: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
  }

  let apiKey = env("GOOGLE_TRANSLATE_API_KEY");
  if (!apiKey) {
    const content = await loadContent();
    apiKey = content?.companyFacts?.googleTranslateApiKey;
  }

  if (!apiKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "GOOGLE_TRANSLATE_API_KEY yapılandırılmamış (Admin > Ayarlar > Çeviri API)" }),
      { status: 503 }
    );
  }

  let body: { text: string; targetLangs: string[]; format?: "text" | "html" };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Geçersiz istek gövdesi" }), { status: 400 });
  }

  const { text, targetLangs } = body;
  const format = body.format === "html" ? "html" : "text";
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
          body: JSON.stringify({ q: text, source: "en", target: lang, format }),
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
