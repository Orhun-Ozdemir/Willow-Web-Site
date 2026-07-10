import { locales, type Locale } from "./cms";

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie → Accept-Language (by q) → English. Shared by middleware and root fallback. */
export function detectLocaleFromRequest(request: Request): Locale {
  const cookies = request.headers.get("cookie") || "";
  const match = cookies.match(/(?:^|;\s*)preferred_locale=([a-z]{2})/);
  if (match && locales.includes(match[1] as Locale)) {
    return match[1] as Locale;
  }

  const header = request.headers.get("accept-language") || "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = (rawTag || "").trim().toLowerCase();
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number(qParam.split("=")[1]) : 1;
      return { tag, q: Number.isFinite(q) ? q : 0 };
    })
    .filter((item) => item.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (locales.includes(tag as Locale)) return tag as Locale;
    const base = tag.split("-")[0];
    if (locales.includes(base as Locale)) return base as Locale;
  }
  return DEFAULT_LOCALE;
}
