import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  // Production is Vercel-only; serve at the real origin with no base prefix so
  // local dev matches production (the old GitHub Pages base is no longer used).
  site: "https://willowsoft.co",
  // Astro 5 defaults checkOrigin to true, which blocks POST requests from Vercel
  // preview URLs (different origin than site). Admin routes are protected by their
  // own session-token auth, so CSRF check at Astro level is redundant here.
  security: { checkOrigin: false },
  publicDir: "./public",
  output: "server",
  adapter: isVercel ? vercel() : node({ mode: "standalone" }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "tr", "de", "fr", "es", "it", "ar", "ja"],
    routing: "manual",
  },
});
