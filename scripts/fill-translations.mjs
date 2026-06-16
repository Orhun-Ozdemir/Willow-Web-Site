// One-off translation merge tool.
// Reads every JSON payload in scripts/i18n/*.json and deep-merges the
// translations into data/site-data.json (UI labels, pageContent fields and
// per-item localized collection fields), then bumps meta.updatedAt.
//
// Payload schema (any subset):
// {
//   "ui":          { "<locale>": { "<key>": "<value>" } },
//   "pageContent": { "<page>":   { "<field>": { "<locale>": "<value>" } } },
//   "faqs|solutions|news|products|clients": {
//     "<id>": { "<field>": { "<locale>": "<value>" } }
//   }
// }
//
// Usage:  node scripts/fill-translations.mjs
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataFile = path.join(root, "data", "site-data.json");
const i18nDir = path.join(root, "scripts", "i18n");

const COLLECTIONS = ["faqs", "solutions", "news", "products", "services", "clients", "glossary"];

const data = JSON.parse(await readFile(dataFile, "utf8"));
const stats = { ui: 0, pageContent: 0, collections: 0, warnings: [] };

function ensure(obj, key, def) {
  if (!obj[key]) obj[key] = def;
  return obj[key];
}

function applyPayload(payload, file) {
  // UI labels -> data.translations[locale][key]
  if (payload.ui) {
    data.translations = data.translations || {};
    for (const [locale, kv] of Object.entries(payload.ui)) {
      const target = ensure(data.translations, locale, {});
      for (const [k, v] of Object.entries(kv)) {
        target[k] = v;
        stats.ui++;
      }
    }
  }

  // pageContent -> data.pageContent[page][field][locale]
  if (payload.pageContent) {
    for (const [page, fields] of Object.entries(payload.pageContent)) {
      const pageObj = data.pageContent?.[page];
      if (!pageObj) {
        stats.warnings.push(`${file}: pageContent page not found: ${page}`);
        continue;
      }
      for (const [field, locs] of Object.entries(fields)) {
        if (!(field in pageObj)) {
          stats.warnings.push(`${file}: pageContent field not found: ${page}.${field}`);
          continue;
        }
        if (typeof pageObj[field] !== "object" || pageObj[field] === null) {
          pageObj[field] = { en: pageObj[field] };
        }
        for (const [loc, val] of Object.entries(locs)) {
          pageObj[field][loc] = val;
          stats.pageContent++;
        }
      }
    }
  }

  // Collections -> item.localized[locale][field]
  for (const coll of COLLECTIONS) {
    if (!payload[coll]) continue;
    const arr = data[coll] || [];
    for (const [id, fields] of Object.entries(payload[coll])) {
      const item = arr.find((x) => x.id === id);
      if (!item) {
        stats.warnings.push(`${file}: ${coll} id not found: ${id}`);
        continue;
      }
      item.localized = item.localized || {};
      for (const [field, locs] of Object.entries(fields)) {
        for (const [loc, val] of Object.entries(locs)) {
          item.localized[loc] = item.localized[loc] || {};
          item.localized[loc][field] = val;
          stats.collections++;
        }
      }
    }
  }
}

let files = [];
try {
  files = (await readdir(i18nDir)).filter((f) => f.endsWith(".json")).sort();
} catch {
  console.error(`No i18n payload directory at ${i18nDir}`);
  process.exit(1);
}

for (const file of files) {
  const payload = JSON.parse(await readFile(path.join(i18nDir, file), "utf8"));
  applyPayload(payload, file);
}

data.meta = { ...(data.meta || {}), updatedAt: new Date().toISOString() };
await writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");

console.log(`Merged ${files.length} payload file(s):`, JSON.stringify({ ui: stats.ui, pageContent: stats.pageContent, collections: stats.collections }));
if (stats.warnings.length) {
  console.log(`\nWarnings (${stats.warnings.length}):`);
  stats.warnings.forEach((w) => console.log("  - " + w));
} else {
  console.log("No warnings — all ids/fields matched.");
}
