#!/usr/bin/env node
// One-off import of the LumioSafe product (from "LumioSafe Product Page.html") into Supabase.
//
//   node scripts/import-lumiosafe/import.mjs             uploads the images, adds the product as a DRAFT
//   node scripts/import-lumiosafe/import.mjs --publish   same, but visible on the site (or publishes an
//                                                        already imported draft)
//   node scripts/import-lumiosafe/import.mjs --merge     a product made by hand in the admin already claims
//                                                        /products/lumiosafe: fill THAT record with this
//                                                        content instead of adding a duplicate (backup first)
//   node scripts/import-lumiosafe/import.mjs --dry-run   only checks and prints what it would do
//
// Safe to re-run: it never overwrites an existing image, and only changes an existing product with
// --merge (after saving a full backup next to this script). Reads the Supabase URL and service-role
// key from astro-app/.env (override with --env <file>); the key is never printed.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const publish = args.includes("--publish");
const merge = args.includes("--merge");
const envIndex = args.indexOf("--env");
const envFile = envIndex >= 0 ? path.resolve(args[envIndex + 1] || "") : path.resolve(here, "../../astro-app/.env");

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

function loadEnv(file) {
  if (!fs.existsSync(file)) fail(`.env dosyası bulunamadı: ${file}`);
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "");
    }
    env[match[1]] = value;
  }
  return env;
}

// Same rule as normalizeProductSlug in astro-app/src/lib/product-model.ts.
const normalizeSlug = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const env = loadEnv(envFile);
const base = (env.SUPABASE_URL || env.PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!base || !key) fail(`SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY ${envFile} içinde yok.`);

const product = JSON.parse(fs.readFileSync(path.join(here, "product.json"), "utf8"));
const auth = { apikey: key, Authorization: `Bearer ${key}` };
// Gallery entries uploaded through the admin are stored as full URLs, uploads by this script as bucket paths.
const publicUrl = (storagePath) => (/^https?:\/\//i.test(storagePath) ? storagePath : `${base}/storage/v1/object/public/assets/${storagePath}`);
const ownImages = [...new Set([product.image, ...product.images])];

async function rest(pathAndQuery, init = {}) {
  const res = await fetch(`${base}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: { ...auth, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) fail(`Supabase isteği başarısız (${init.method || "GET"} ${pathAndQuery.split("?")[0]}, HTTP ${res.status}): ${typeof body === "string" ? body : JSON.stringify(body)}`);
  return body;
}

async function exists(storagePath) {
  const res = await fetch(publicUrl(storagePath), { method: "HEAD" });
  return res.ok;
}

async function uploadImages() {
  for (const storagePath of ownImages) {
    const file = path.join(here, "images", path.basename(storagePath));
    if (!fs.existsSync(file)) fail(`Görsel dosyası yok: ${file}`);
    if (await exists(storagePath)) {
      console.log(`• ${storagePath} zaten var, atlandı`);
      continue;
    }
    if (dryRun) {
      console.log(`• ${storagePath} yüklenecek (${Math.round(fs.statSync(file).size / 1024)} KB)`);
      continue;
    }
    const upload = await fetch(`${base}/storage/v1/object/assets/${storagePath}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "image/webp", "Cache-Control": "max-age=31536000", "x-upsert": "false" },
      body: fs.readFileSync(file),
    });
    if (!upload.ok) fail(`${storagePath} yüklenemedi (HTTP ${upload.status}): ${await upload.text()}`);
    console.log(`✓ ${storagePath} yüklendi`);
  }
}

console.log(`LumioSafe içe aktarma${dryRun ? " — DENEME, hiçbir şey yazılmayacak" : ""}`);
console.log(`Hedef: ${new URL(base).host}\n`);

const allRows = await rest("products?select=id,slug,sort_order,data,localized");
const existingRow = allRows.find((row) => row.id === product.id);
// Product URLs are also matched by title/id, so a hand-made "Lumiosafe" record shadows /products/lumiosafe.
const target = normalizeSlug(product.slug);
const conflicts = allRows.filter((row) => row.id !== product.id
  && [row.slug, row.id, row.data?.slug, row.data?.title, row.data?.name].some((value) => normalizeSlug(value) === target));
let finalId = product.id;

if (existingRow) {
  // Already imported: the only thing this script may still do is publish that draft.
  if (!publish) fail(`"${product.id}" ürünü zaten var; hiçbir şey değiştirilmedi. Yayına almak için --publish ile çalıştırın.`);
  if (existingRow.data?.visible !== false) {
    console.log(`✓ "${product.id}" zaten yayında; değiştirilecek bir şey yok.`);
    process.exit(0);
  }
  if (dryRun) {
    console.log(`• "${product.id}" taslaktan yayına alınacak — deneme bitti, hiçbir şey yazılmadı.`);
    process.exit(0);
  }
  await rest(`products?id=eq.${encodeURIComponent(product.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ data: { ...existingRow.data, visible: true }, updated_at: new Date().toISOString() }),
  });
  console.log(`✓ "${product.id}" yayına alındı.`);
} else if (conflicts.length && !merge) {
  const list = conflicts.map((row) => `   - "${row.data?.title || row.id}" (kimlik ${row.id}, ${row.data?.visible === false ? "taslak" : "yayında"}, ${(row.data?.images || []).length} görsel)`).join("\n");
  fail(`Admin'de elle eklenmiş ve /products/${product.slug} adresini kullanan bir ürün var:\n${list}\n  Yeni bir kopya eklersem site o kaydı göstermeye devam eder. Hiçbir şey değiştirilmedi.\n  Bu içeriği o kaydın içine birleştirmek için --merge ile çalıştırın (önce yedeği alınır).`);
} else if (merge) {
  if (conflicts.length !== 1) fail(`--merge için /products/${product.slug} adresini kullanan tam olarak bir kayıt bekleniyordu, ${conflicts.length} bulundu. Hiçbir şey değiştirilmedi.`);
  const row = conflicts[0];
  finalId = row.id;
  const keptImages = [...new Set([row.data?.image, ...(row.data?.images || [])])].filter((p) => p && !ownImages.includes(p));
  console.log(`✓ Birleştirilecek kayıt: "${row.data?.title || row.id}" (kimlik ${row.id})`);
  console.log(`✓ Mevcut ${keptImages.length} görsel galerinin sonunda korunacak`);

  await uploadImages();

  const backupFile = path.join(here, `backup-${row.id}.json`);
  if (dryRun) {
    console.log(`\n• Yedek yazılacak: ${backupFile}`);
    console.log(`• "${row.id}" bu içerikle güncellenecek, adresi /products/${product.slug} olacak — deneme bitti, hiçbir şey yazılmadı.`);
    process.exit(0);
  }
  fs.writeFileSync(backupFile, JSON.stringify(row, null, 2));
  console.log(`✓ Eski kaydın yedeği: ${backupFile}`);

  const { localized, ...data } = product;
  await rest(`products?id=eq.${encodeURIComponent(row.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      slug: product.slug,
      category: product.category,
      featured: Boolean(row.data?.featured),
      data: {
        ...data,
        id: row.id,
        images: [...ownImages, ...keptImages],
        featured: Boolean(row.data?.featured),
        visible: publish || row.data?.visible !== false,
        sortOrder: row.sort_order,
        sort_order: row.sort_order,
      },
      localized: { ...(row.localized || {}), ...(localized || {}) },
      updated_at: new Date().toISOString(),
    }),
  });
  console.log(`✓ "${row.id}" kaydı LumioSafe içeriğiyle güncellendi`);
} else {
  console.log(`✓ "${product.id}" henüz yok, eklenecek`);

  // Place it after the current last product in the catalogue.
  const sortOrder = Math.max(0, ...allRows.map((row) => Number(row.sort_order) || 0)) + 10;
  product.sortOrder = sortOrder;
  product.sort_order = sortOrder;
  product.visible = publish;
  console.log(`✓ Katalog sırası: ${sortOrder} (en sonda)`);

  await uploadImages();

  if (dryRun) {
    console.log(`\n• Ürün ${publish ? "YAYINDA" : "TASLAK"} olarak eklenecek: ${product.title} (${product.category}) — deneme bitti, hiçbir şey yazılmadı.`);
    process.exit(0);
  }

  // Same row shape the admin writes (astro-app/src/lib/content.ts collectionRow).
  const { localized, ...data } = product;
  await rest("products", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      id: product.id,
      slug: product.slug,
      category: product.category,
      featured: Boolean(product.featured),
      sort_order: sortOrder,
      data,
      localized: localized || {},
    }),
  });
  console.log(`✓ Ürün ${publish ? "YAYINDA" : "TASLAK"} olarak eklendi: ${product.title}`);
}

// Verify what is now in the database and storage.
const [saved] = await rest(`products?id=eq.${encodeURIComponent(finalId)}&select=id,slug,category,sort_order,data,localized`);
if (!saved) fail("Ürün kaydı doğrulanamadı.");
const live = saved.data?.visible !== false;
console.log(`\nKontrol: ${saved.id} · adres /products/${saved.slug} · kategori ${saved.category} · sıra ${saved.sort_order} · ${live ? "yayında" : "taslak"} · ${saved.data?.images?.length || 0} görsel · TR çeviri ${saved.localized?.tr ? "var" : "yok"}`);
for (const storagePath of saved.data?.images || []) {
  console.log(`${(await exists(storagePath)) ? "✓" : "✗ ERİŞİLEMİYOR"} ${publicUrl(storagePath)}`);
}

console.log(`
Sonraki adımlar:
  • Açık admin sekmelerini yenileyin. Eski bir sekmeden "Ürünler" kaydedilirse bu değişiklik geri alınır.
  • Admin → Ürünler → LumioSafe: sayfada boş bırakılmış bilgileri (boyut/ağırlık, çalışma sıcaklığı,
    IP sınıfı/sertifikalar, anten) öğrenince "Teknik Özellikler JSON" alanına ekleyin.
  • ${live
    ? `Sayfa (önbellek nedeniyle 1 dakikaya kadar sürebilir): https://www.willowsoft.co/tr/products/${saved.slug}`
    : "Yayına almak için: node scripts/import-lumiosafe/import.mjs --publish  (veya admin'de \"Sitede Göster\" → Evet → Kaydet)"}
`);
