import { defineMiddleware } from "astro:middleware";
import crypto from "node:crypto";
import { getServiceClient, hasSupabaseEnv } from "./lib/supabase";
import { locales, type Locale } from "./lib/cms";

const DEFAULT_LOCALE: Locale = "en";

// --- Legacy WordPress (willowsoft.co) -> new Astro URL map ---------------------
// The old site was a WordPress/WooCommerce install with flat, mostly-Turkish
// slugs and no locale prefix. Every indexed legacy URL is 301-redirected to its
// closest equivalent on the new site to preserve SEO authority and backlinks.
// The old public site was Turkish, so legacy *content* URLs intentionally map to /tr.
// The site root "/" is handled by detectLocale (cookie → Accept-Language → en), not this map.
// Keys are lowercase, WITHOUT a trailing slash. Update GSC after launch.
const LEGACY_REDIRECTS: Record<string, string> = {
  // Legacy sitemap endpoints -> canonical Astro sitemap
  "/sitemap_index.xml": "/sitemap.xml",
  "/wp-sitemap.xml": "/sitemap.xml",
  "/page-sitemap.xml": "/sitemap.xml",
  "/post-sitemap.xml": "/sitemap.xml",
  "/category-sitemap.xml": "/sitemap.xml",
  "/post_tag-sitemap.xml": "/sitemap.xml",
  "/author-sitemap.xml": "/sitemap.xml",
  // WooCommerce-specific sitemap endpoints
  "/product-sitemap.xml": "/sitemap.xml",
  "/product_cat-sitemap.xml": "/sitemap.xml",

  // Core sections (root "/" is NOT here — locale comes from Accept-Language / cookie / en default)
  "/urunler": "/tr/products",
  "/katalog-indirin": "/tr/products",
  "/haberler": "/tr/news",
  "/blog": "/tr/news",
  "/blog-2": "/tr/news",
  "/sirket-hakkinda": "/tr/company",
  "/clients": "/tr/company",
  "/contact-us": "/tr/contact",
  "/hata-bildirme": "/tr/contact",
  "/hardware-ddesign": "/tr/services",
  "/muhendislik": "/tr/services",
  "/uygulamalar": "/tr/solutions",
  "/home3": "/tr",

  // User-facing Turkish alias redirects (SEO plan)
  "/iletisim": "/tr/contact",
  "/destek": "/tr/contact",
  "/gomulu-sistem-danismanligi": "/tr/services",
  "/bipomun-avantajlari": "/tr/services",

  // Legacy 2021 service / method pages -> services
  "/yontemler": "/tr/services",
  "/on-arastirma": "/tr/services",
  "/urun-ozellikleri": "/tr/services",
  "/konsept-tasarim": "/tr/services",
  "/semalar": "/tr/services",
  "/simulasyon-ve-devre-ici-emulasyon": "/tr/services",
  "/pcb-duzeni": "/tr/services",
  "/pcb-prototip-montaji": "/tr/services",
  "/firmware-gelistirme": "/tr/services",
  "/muhafaza-tasarimi-prototipleme": "/tr/services",
  "/test-ve-hata-ayiklama-donanim-ve-yazilim": "/tr/services",
  "/pilot-model-uretimi": "/tr/services",
  "/oem-tasarim-gelistirme-ve-uretim": "/tr/services",
  "/takipli-gelistirme": "/tr/services",
  "/proje-tasarim-yetenekleri": "/tr/services",
  "/ultra-hizli-prototipleme": "/tr/services",
  "/ozel-gelistirme-endustriyel-destek-hizmetler": "/tr/services",
  "/endustri-ve-musteri-ornekleri": "/tr/services",
  "/willowun-avantajlari": "/tr/services",

  // FAQ
  "/genel-sss": "/tr",
  "/urune-ozel-sss": "/tr/products",

  // Legal pages (no dedicated page yet -> home)
  "/telif-hakki": "/tr",
  "/willow-gizlilik-politikasi": "/tr",
  "/mesafeli-satis-politikasi": "/tr",
  "/teslimat-ve-iade-sartlari": "/tr",

  // WooCommerce (no e-commerce on new site)
  "/shop": "/tr/products",
  "/cart": "/tr/products",
  "/checkout": "/tr/products",
  "/my-account": "/tr/products",

  // Products -> new product slugs
  "/willowbee": "/tr/products/willowbee",
  "/willowbee-module": "/tr/products/willowbee",
  "/willowbee-modul": "/tr/products/willowbee",
  "/willowsonic": "/tr/products/willowsonic",
  "/ultrasonic-sensor": "/tr/products/willowsonic",
  "/ultrasonic-level-sensor": "/tr/products/willowsonic",
  "/ultrasonic-distance-level-sensor": "/tr/products/willowsonic",
  "/lorawan-ultrasonik-mesafe-seviye-sensoru": "/tr/products/willowsonic",
  "/lorawan-ultrasonik-mesafe-seviye-sensoru-7": "/tr/products/willowsonic",
  "/lorawan-ultrasonik-mesafe-seviye-sensoru-7-2": "/tr/products/willowsonic",
  "/lorawan-ultrasonik-mesafe-seviye-sensoru-7-3": "/tr/products/willowsonic",
  "/willowpanic": "/tr/products/willowpanic",
  "/panic-button": "/tr/products/willowpanic",
  "/panic-button-sensor": "/tr/products/willowpanic",
  "/lorawan-panik-butonu": "/tr/products/willowpanic",
  "/lorawan-panik-butonu-2": "/tr/products/willowpanic",
  "/lorawan-panik-butonu-sensoru": "/tr/products/willowpanic",
  "/willowair": "/tr/products/willowair",
  "/co2-sensor": "/tr/products/willowair",
  "/co2-temperature-and-humidity-sensor": "/tr/products/willowair",
  "/c02-sensor": "/tr/products/willowair",
  "/lorawan-co2-sicaklik-ve-nem-sensoru": "/tr/products/willowair",
  "/lorawan-c02-sensoru": "/tr/products/willowair",
  "/willowtemp": "/tr/products/willowtemp",
  "/temperature-and-humidity-sensor": "/tr/products/willowtemp",
  "/sicaklik-ve-nem-sensoru": "/tr/products/willowtemp",
  "/lorawan-sicaklik-ve-nem-sensoru": "/tr/products/willowtemp",
  "/lorawan-sicalik-ve-nem-sensoru": "/tr/products/willowtemp",
  "/lorawan-sicalik-ve-nem-sensoru-2": "/tr/products/willowtemp",
  "/lorawan-sicalik-ve-nem-sensoru-3": "/tr/products/willowtemp",
  "/lorawan-outdoor-temparature": "/tr/products/willowtemp",
  "/willowtilt": "/tr/products/willowtilt",
  "/tilt-sensor": "/tr/products/willowtilt",
  "/lorawan-tilt-sensoru": "/tr/products/willowtilt",
  "/lorawan-indoor-tilt-sensor": "/tr/products/willowtilt",
  "/willowmod": "/tr/products/willowmod",
  "/modbus-bridge-sensor": "/tr/products/willowmod",
  "/lorawan-modbus-bridge-sensor": "/tr/products/willowmod",
  "/willowane": "/tr/products/willowane",
  "/anemometer": "/tr/products/willowane",
  "/lorawan-anemometer": "/tr/products/willowane",
  "/willowpre": "/tr/products/willowpre",
  "/pressure-sensor": "/tr/products/willowpre",
  "/barometric-pressure-sensor": "/tr/products/willowpre",
  "/lorawan-barometric-pressure-sensor": "/tr/products/willowpre",
  "/willowmos": "/tr/products/willowmos",
  "/soil-moisture-sensor": "/tr/products/willowmos",
  "/lorawan-soil-moisture": "/tr/products/willowmos",
  "/lorawan-soil-moisture-sensor": "/tr/products/willowmos",
  "/lorawan-toprak-nem-sensoru": "/tr/products/willowmos",
  "/toprak-nem-sensoru": "/tr/products/willowmos",
  "/willowsens": "/tr/products/willowsens",
  "/door-sensor": "/tr/products/willowsens",
  "/kapi-sensoru": "/tr/products/willowsens",
  "/lorawan-door-sensor": "/tr/products/willowsens",
  "/lorawan-kapi-sensoru": "/tr/products/willowsens",
  "/willowgps": "/tr/products/willowgps",
  "/gps-tracker": "/tr/products/willowgps",
  // No dedicated product on the new site -> products listing
  "/lorawan-batarya-sicaklik-seviye-izleme-sensoru": "/tr/products",

  // News posts
  "/willowsoft-launches-uk-operations-in-london": "/tr/news/uk-operations",
  "/willowsoft-is-exhibiting-at-embedded-world-2026": "/tr/news/embedded-world-2026",
  "/mustafa-varank-mugla-teknopark-ziyareti": "/tr/news/minister-varank-visit",
  "/willow-software-win-eurasia-2022": "/tr/news/win-eurasia",
  "/tubitak-willow-software-workshop": "/tr/news/tubitak-workshop",
  "/willow-software-bakim-istanbul-2022-sempozyumunda-2": "/tr/news/bakim-istanbul-2022",
  "/willow-software-bipom-turkey-endustri-4-0-fuarinda": "/tr/news/industry-4-0-fair-2022",
  "/amerikali-firmalarin-mugla-teknoparka-ilgisi-devam-ediyor": "/tr/news/american-firms-mugla-teknopark",
  "/mugla-teknoparktan-ilk-ihracat-amerikaya": "/tr/news/usa-export-mugla-teknopark",
  "/willow-software-faaliyetlerine-basliyor": "/tr/news/mugla-teknopark-launch",

  // Legacy category / tag / author archive URLs
  "/category/haberler": "/tr/news",
  "/author/admin": "/tr/news",
  "/tag/bakan": "/tr/news/minister-varank-visit",
  "/tag/bipom": "/tr/news/industry-4-0-fair-2022",
  "/tag/cloudgate": "/tr/news/industry-4-0-fair-2022",
  "/tag/embedded-world": "/tr/news/embedded-world-2026",
  "/tag/fair": "/tr/news/win-eurasia",
  "/tag/iot": "/tr/solutions",
  "/tag/lora": "/tr/products",
  "/tag/lorawan": "/tr/products",
  "/tag/mugla": "/tr/news",
  "/tag/mugla-teknopark": "/tr/news",
  "/tag/mustafa-varank": "/tr/news/minister-varank-visit",
  "/tag/news": "/tr/news",
  "/tag/option": "/tr/news/industry-4-0-fair-2022",
  "/tag/sanayi-ve-teknoloji": "/tr/news/minister-varank-visit",
  "/tag/sensors": "/tr/products",
  "/tag/teknopark": "/tr/news",
  "/tag/willow": "/tr/company",
  "/tag/willow-software": "/tr/company",
  "/tag/willowbee": "/tr/products/willowbee",
  "/tag/wineurasia": "/tr/news/win-eurasia",

  // WordPress date archive URLs (2022/08/02 = 2 articles: minister-varank-visit + win-eurasia)
  "/2022/08/02": "/tr/news",
  "/2022/05/22": "/tr/news/bakim-istanbul-2022",
  "/2021/10/06": "/tr/news/industry-4-0-fair-2022",
  "/2021/09/13": "/tr/news/american-firms-mugla-teknopark",
  "/2021/07/10": "/tr/news/tubitak-workshop",
  "/2021/06/08": "/tr/news/usa-export-mugla-teknopark",
  "/2021/04/22": "/tr/news/mugla-teknopark-launch",
};

// --- 410 Gone patterns for WordPress technical remnants ----------------------
// These URL patterns have zero user value and waste crawl budget.
// Returning 410 tells search engines the content is permanently gone.
const GONE_410_EXACT: Set<string> = new Set([
  "/feed",
  "/comments/feed",
  "/xmlrpc.php",
  "/wp-login.php",
  "/www.bluecooltruck.com",
]);

// Prefix-based 410 patterns (any path starting with these)
const GONE_410_PREFIXES: string[] = [
  "/wp-json/",
  "/wp-content/",
  "/wp-includes/",
  "/wp-admin/",
  "/web_faqs/",
];

function isGone410(path: string): boolean {
  if (GONE_410_EXACT.has(path)) return true;
  // Catch any path ending with /feed (e.g. /category/haberler/feed)
  if (path.endsWith("/feed")) return true;
  for (const prefix of GONE_410_PREFIXES) {
    if (path.startsWith(prefix)) return true;
  }
  return false;
}

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

// Pick the best matching locale: 1) cookie preference, 2) Accept-Language (by q), 3) en.
function detectLocale(request: Request): Locale {
  // 1. Check for saved preference cookie
  const cookies = request.headers.get("cookie") || "";
  const match = cookies.match(/(?:^|;\s*)preferred_locale=([a-z]{2})/);
  if (match && locales.includes(match[1] as Locale)) {
    return match[1] as Locale;
  }

  // 2. Fall back to Accept-Language header (highest q first)
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
  // Normalize: decode percent-encoded chars (e.g. Turkish ü, ö) and strip trailing slash.
  // This ensures /lorawan-ultrasonik-mesafe-seviye-sens%C3%B6r%C3%BC matches the redirect map.
  const legacyKey = pathname !== "/"
    ? decodeURIComponent(pathname).replace(/\/+$/, "").toLowerCase()
    : pathname;

  // 410 Gone — WordPress technical remnants (feeds, wp-json, xmlrpc, etc.).
  // Returns immediately; no further processing needed for these garbage URLs.
  if (isGone410(legacyKey)) {
    return new Response(null, { status: 410, statusText: "Gone" });
  }

  // Legacy WordPress URL -> new URL (301 permanent). Runs BEFORE locale logic so
  // old prefix-less slugs aren't 302'd into a non-existent /{locale}/{old-slug}.
  const legacyTarget = LEGACY_REDIRECTS[legacyKey];
  if (legacyTarget) {
    return context.redirect(`${base}${legacyTarget}${url.search}`, 301);
  }

  // Catch WordPress date archive pattern: /YYYY/MM/DD -> /tr/news
  // This handles any date archive URL not explicitly in the redirect map.
  if (/^\/\d{4}\/\d{2}\/\d{2}/.test(legacyKey)) {
    return context.redirect(`${base}/tr/news${url.search}`, 301);
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
