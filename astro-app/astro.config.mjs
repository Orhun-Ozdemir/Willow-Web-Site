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
