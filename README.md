# WillowSoft Corporate Web Site

This repository contains the source code for the official WillowSoft corporate website, built using a modern, lightweight, high-performance static HTML + vanilla JS/CSS architecture powered by a Node.js backend and a JSON-based CMS.

## Architecture Overview

- **Frontend**: Vanilla HTML5, CSS3, and ES6 JavaScript. No client-side frameworks or build steps.
- **Dynamic Content & Internationalization (i18n)**: Content is dynamically served and localized into 8 languages (EN, TR, DE, FR, ES, IT, AR, JA) using the JSON database at `data/site-data.json`.
- **Backend**: A lightweight Node.js server (`server.mjs`) handling static asset delivery, dynamic SSR routing/SEO injection, and REST API endpoints for analytics and leads processing.
- **Admin Panel**: A custom web-based administration dashboard at `/admin` for editing content, review of analytics, managing leads, and updating SEO settings with real-time preview.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)

### Installation

1. Clone this repository.
2. Create your environment configuration file from the template:
   ```bash
   cp .env.example .env
   ```
3. Set your custom `ADMIN_PASSWORD` and other variables in the `.env` file.

### Running the Server

Start the development server:
```bash
# Start with standard Node
node server.mjs

# Or if you have scripts defined in package.json
npm run dev
```

The application will be running at `http://localhost:4173` (or the `PORT` specified in your `.env` file).

---

## Configuration & Environment Variables

The server loads configuration from environment variables. Refer to the `.env.example` file for defaults.

| Variable | Description | Default |
|---|---|---|
| `PORT` | The port for the web server to listen on. | `4173` |
| `SITE_URL` | The canonical domain of the website. | `https://willowsoft.co` |
| `ADMIN_USER` | Username used to log in to the admin panel. | `admin` |
| `ADMIN_PASSWORD` | Password used to log in to the admin panel. | `willow-admin-2026` |
| `NODE_ENV` | Mode of operation. Set to `production` for production deployments. | `development` |
| `MAX_STORED_EVENTS` | Maximum number of analytics/logs to retain in `events.json`. | `5000` |

> [!IMPORTANT]
> When `NODE_ENV` is set to `production`, the server will enforce security hardening and throw an error at startup if the default `ADMIN_PASSWORD` (`willow-admin-2026`) is used or if it is empty.

---

## Project Structure

- `assets/` - Static frontend assets (styles, javascript files like `cms.js` and `admin.js`, images).
- `data/` - JSON databases for page contents (`site-data.json`), inquiries/leads (`leads.json`), and analytics events (`events.json`).
- `pdf-assets/` - Hardware sheets and product graphics.
- `server.mjs` - Node.js HTTP server and router.
- `*.html` - Page templates served dynamically with SSR-enriched head meta/schema tags.

---

## Contribution & Development Guidelines

1. **Aesthetics & Performance**: Always write semantic, high-performance vanilla HTML, CSS and JS. Follow mobile-first and responsive design practices.
2. **No Build Step**: Do not introduce bundlers (Webpack, Vite, Rollup) or JS frameworks (React, Vue) unless explicitly requested. The site must run out-of-the-box using standard Node.js.
3. **Database Integrity**: Keep the CMS schema in `data/site-data.json` synchronized. When adding a new page, add its localizable strings to `pageContent` and meta-tags to `pageSeo`.
