import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  ...(isVercel
    ? {}
    : {
        site: "https://orhun-ozdemir.github.io",
        base: "/Willow-Web-Site/",
      }),
  publicDir: "../next-app/public",
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
