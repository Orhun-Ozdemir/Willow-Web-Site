# WillowSoft Corporate Web Site

Source for the official WillowSoft corporate website — an Industrial IoT / embedded hardware company. The site is a server-rendered **Astro** application with a **React** admin panel, a **Supabase**-backed CMS, and 8-language internationalization.

## Architecture Overview

- **Framework**: [Astro 5](https://astro.build/) in SSR mode (`output: "server"`). The whole app lives in [`astro-app/`](astro-app/); the repo root only delegates scripts to it.
- **UI**: Astro components for pages, **React 19** islands for the admin dashboard, **Tailwind CSS 4** (compiled at build time via `@tailwindcss/vite`; the source is [`astro-app/src/styles/globals.css`](astro-app/src/styles/globals.css)).
- **Content & CMS**: Content lives in **Supabase** (Postgres + Storage). When Supabase env vars are absent, the app falls back to the bundled [`data/site-data.json`](data/site-data.json). The admin panel at `/admin` (React) edits content, leads, translations, SEO and more.
- **i18n**: Manual routing for 8 locales (EN, TR, DE, FR, ES, IT, AR, JA). Locale detection and redirects happen in [`astro-app/src/middleware.ts`](astro-app/src/middleware.ts).
- **Email / notifications**: Lead submissions are stored in Supabase and trigger Nodemailer + Telegram notifications.
- **Deployment**: **Vercel only.** `astro.config.mjs` selects the Vercel adapter when the `VERCEL` env var is present, and the Node standalone adapter for local runs.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v20+**

### Installation & Dev

```bash
cd astro-app
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:4100
```

From the repo root, `npm run dev` / `npm run build` also work — they delegate into `astro-app/`.

### Build

```bash
cd astro-app
npm run build          # SSR build (server output)
```

---

## Environment Variables

Configure these in `astro-app/.env` (local) or the Vercel project settings (production). See [`astro-app/.env.example`](astro-app/.env.example).

| Variable | Description | Required |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL. | Yes (else local-JSON fallback) |
| `SUPABASE_ANON_KEY` | Public anon key (read / RLS-guarded inserts). | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only — **never expose to the browser**. Used for content saves and uploads. | Yes |
| `ADMIN_USER` | Admin panel username. | Prod |
| `ADMIN_PASSWORD` | Admin panel password. | **Prod** |
| `SESSION_SECRET` | Signs the stateless admin session cookie. | **Prod** |

> [!IMPORTANT]
> In production the baked-in dev admin credentials are **disabled**: if `ADMIN_PASSWORD` is not set, the env-var login fallback is refused. Always set `ADMIN_PASSWORD` **and** a strong random `SESSION_SECRET` in production — a default `SESSION_SECRET` would let anyone forge admin sessions.

Optional integrations (SMTP for `nodemailer`, Telegram bot token/chat IDs, `PUBLIC_TAWK_PROPERTY_ID` for live chat) are read from env when present.

---

## Project Structure

- `astro-app/src/pages/` — routes. Public pages live under `[locale]/`; `admin/` and `api/` are not localized.
- `astro-app/src/components/` — shared components (incl. `admin/*.tsx` React panels).
- `astro-app/src/layouts/BaseLayout.astro` — `<head>`, SEO/OG/JSON-LD, skip link, global scripts.
- `astro-app/src/lib/` — `content.ts` (Supabase + JSON fallback), `supabase.ts`, `auth.ts`, `seo.ts`, `cms.ts`, `mailer.ts`.
- `astro-app/src/styles/globals.css` — Tailwind source + design tokens.
- `astro-app/public/` — static assets served at the site root (`/assets/...`, `robots.txt`, sitemap is generated dynamically).
- `data/site-data.json` — local content fallback (also read/written by the CMS in local mode). Keep `pageContent` and `pageSeo` in sync when adding pages.

---

## Contribution & Development Guidelines

1. **Respect the design system.** Use the tokens and component patterns in `globals.css`; keep the brand aesthetic consistent.
2. **i18n by default.** New user-facing strings must be localized for all 8 locales (follow the `Record<locale, string>` pattern used in components).
3. **CMS integrity.** When adding a page, add its localizable strings to `pageContent` and meta tags to `pageSeo` (Supabase, mirrored in `data/site-data.json`).
4. **Never log secrets.** Don't `console.log` keys, tokens, or credentials in API routes.
