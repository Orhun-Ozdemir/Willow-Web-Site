import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { loadEnv } from "vite";

const isVercel = Boolean(process.env.VERCEL);

// The Supabase project URL is public (it is in every storage image URL), but Astro only
// ships PUBLIC_* vars to the browser and production sets plain SUPABASE_URL. Expose it so
// admin islands can resolve bucket-relative upload paths ("products/x.webp") — without it
// resolveAsset() returned "" in the browser and uploaded images never showed a preview.
const fileEnv = loadEnv(process.env.NODE_ENV || "production", process.cwd(), "");
const publicSupabaseUrl =
  process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL ||
  fileEnv.PUBLIC_SUPABASE_URL || fileEnv.SUPABASE_URL || "";
const homeCssId = "\0virtual:home-global.css";
const homeStyleSources = [
  "src/pages/[locale]/index.astro",
  "src/layouts/HomePageLayout.astro",
  "src/layouts/BaseLayout.astro",
  "src/components/Header.astro",
  "src/components/NationalDayBadge.astro",
  "src/components/Footer.astro",
  "src/components/WhatsAppFloat.astro",
  "src/components/Analytics.astro",
  "src/components/ProductCard.astro",
  "src/components/NewsCard.astro",
  "src/components/FaqAccordion.astro",
  "src/components/AIAnswerBlock.astro",
];

function homeCssPlugin() {
  return {
    name: "willow-home-css",
    enforce: "pre",
    resolveId(id) {
      if (id === "virtual:home-global.css") return homeCssId;
    },
    load(id) {
      if (id !== homeCssId) return;
      const rootDir = process.cwd();
      const source = fs.readFileSync(path.join(rootDir, "src/styles/globals.css"), "utf8");
      const usedTokens = new Set();
      homeStyleSources.forEach((file) => {
        const content = fs.readFileSync(path.join(rootDir, file), "utf8");
        for (const match of content.matchAll(/[A-Za-z_][A-Za-z0-9_-]*/g)) usedTokens.add(match[0]);
      });
      const dynamicPrefixes = ["delay-", "reveal", "visible", "active", "open", "is-", "has-"];
      const root = postcss.parse(source);
      root.walkRules((rule) => {
        if (/body\[data-page=["'](?!home["'])/.test(rule.selector)) {
          rule.remove();
          return;
        }
        const classes = Array.from(rule.selector.matchAll(/\.([_a-zA-Z]+[\w-]*)/g), (match) => match[1]);
        if (!classes.length) return;
        const used = classes.some((name) => usedTokens.has(name) || dynamicPrefixes.some((prefix) => name.startsWith(prefix)));
        if (!used) rule.remove();
      });
      root.walkAtRules((rule) => {
        if ((rule.name === "media" || rule.name === "supports" || rule.name === "layer") && !rule.nodes?.length) rule.remove();
      });
      return root.toString();
    },
  };
}

export default defineConfig({
  // Production is Vercel-only; serve at the real origin with no base prefix so
  // local dev matches production (the old GitHub Pages base is no longer used).
  site: "https://www.willowsoft.co",
  // trailingSlash is left at the default ("ignore"): Astro's own "never" redirect
  // runs *before* middleware and would double-hop legacy WordPress URLs that end
  // in a slash (e.g. "/urunler/" -> "/urunler" -> "/tr/products"). Instead the
  // middleware normalizes trailing slashes to the canonical no-slash form in a
  // single hop, after legacy 301/410 rules have had a chance to match.
  // Astro 5 defaults checkOrigin to true, which blocks POST requests from Vercel
  // preview URLs (different origin than site). Admin routes are protected by their
  // own session-token auth, so CSRF check at Astro level is redundant here.
  security: { checkOrigin: false },
  publicDir: "./public",
  output: "server",
  adapter: isVercel ? vercel() : node({ mode: "standalone" }),
  integrations: [react()],
  vite: {
    plugins: [homeCssPlugin(), tailwindcss()],
    define: {
      "import.meta.env.PUBLIC_SUPABASE_URL": JSON.stringify(publicSupabaseUrl),
    },
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "tr", "de", "fr", "es", "it", "ar", "ja"],
    routing: "manual",
  },
});
