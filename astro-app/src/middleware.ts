import { defineMiddleware } from "astro:middleware";
import crypto from "node:crypto";
import { getServiceClient, hasSupabaseEnv } from "./lib/supabase";
import { locales, type Locale } from "./lib/cms";

const DEFAULT_LOCALE: Locale = "en";

// Paths that must NOT be locale-prefixed: the admin panel and any
// static asset / non-page endpoint (files with an extension, build assets, storage).
function isExemptFromLocale(pathname: string): boolean {
  const first = pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  if (first === "admin") return true;
  if (first === "api") return true;
  if (pathname.startsWith("/_")) return true;
  if (pathname.startsWith("/assets")) return true;
  if (pathname.startsWith("/storage")) return true;
  if (pathname.startsWith("/pdf-assets")) return true;
  // Endpoints / files: sitemap.xml, llms-full.txt, ai-index.json, favicon, robots, images...
  if (/\.[a-z0-9]+$/i.test(pathname)) return true;
  return false;
}

// Pick the best matching locale from the visitor's Accept-Language header,
// falling back to the default locale when none is supported.
function detectLocale(request: Request): Locale {
  const header = request.headers.get("accept-language") || "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().toLowerCase();
    if (!code) continue;
    if (locales.includes(code as Locale)) return code as Locale;
    const base = code.split("-")[0];
    if (locales.includes(base as Locale)) return base as Locale;
  }
  return DEFAULT_LOCALE;
}

const aiBots = [
  { name: "GPTBot (OpenAI Training)", pattern: /GPTBot/i },
  { name: "OAI-SearchBot (OpenAI Search)", pattern: /OAI-SearchBot/i },
  { name: "ChatGPT-User (OpenAI User)", pattern: /ChatGPT-User/i },
  { name: "ClaudeBot (Anthropic Training)", pattern: /ClaudeBot/i },
  { name: "Claude-Web (Anthropic User)", pattern: /Claude-Web|Claude-SearchBot/i },
  { name: "Google-Extended (Google Gemini)", pattern: /Google-Extended/i },
  { name: "Applebot-Extended (Apple Intelligence)", pattern: /Applebot-Extended/i },
  { name: "PerplexityBot (Perplexity)", pattern: /PerplexityBot/i },
  { name: "Meta-ExternalAgent (Meta Llama)", pattern: /Meta-ExternalAgent/i },
  { name: "Bytespider (ByteDance)", pattern: /Bytespider/i },
  { name: "CCBot (Common Crawl)", pattern: /CCBot/i },
  { name: "cohere-ai (Cohere)", pattern: /cohere-ai/i },
  { name: "Amazonbot (Amazon)", pattern: /Amazonbot/i }
];

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "";
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Locale routing (manual i18n): prefix-less content URLs are redirected to the
  // visitor's best-matching locale; /admin and static assets are served as-is.
  const url = new URL(context.request.url);
  // Strip the configured base path (e.g. "/Willow-Web-Site" on GitHub Pages dev,
  // "" on Vercel) so locale logic works regardless of deployment target.
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  let pathname = url.pathname;
  if (base && pathname.startsWith(base)) {
    pathname = pathname.slice(base.length) || "/";
  }
  const first = pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  const hasLocalePrefix = locales.includes(first as Locale);

  if (!hasLocalePrefix && !isExemptFromLocale(pathname)) {
    const locale = detectLocale(context.request);
    const rest = pathname === "/" ? "" : pathname;
    return context.redirect(`${base}/${locale}${rest}${url.search}`, 302);
  }

  if (hasSupabaseEnv) {
    const userAgent = context.request.headers.get("user-agent") || "";
    if (userAgent) {
      const matchedBot = aiBots.find(bot => bot.pattern.test(userAgent));
      if (matchedBot) {
        try {
          const supabase = getServiceClient();
          
          let ipHint = getClientIp(context.request);
          try {
            ipHint = ipHint || context.clientAddress || "";
          } catch {
            // clientAddress is not available on all adapters
          }
          
          const newEvent = {
            id: crypto.randomUUID(),
            bot_name: matchedBot.name,
            path: new URL(context.request.url).pathname,
            user_agent: userAgent.slice(0, 250),
            ip_hint: ipHint.replace(/(\d+\.\d+\.\d+)\.\d+$/, "$1.x"),
            created_at: new Date().toISOString()
          };
          
          // Fire and forget
          supabase.from("bot_events").insert(newEvent).then(({ error }) => {
            if (error) console.error("Failed to log bot access to Supabase:", error.message);
          });
        } catch (err) {
          console.error("Failed to setup bot access logging", err);
        }
      }
    }
  }

  return next();
});
