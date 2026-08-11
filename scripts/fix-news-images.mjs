#!/usr/bin/env node

/**
 * Haber kapaklarını kalıcı Supabase Storage dosyalarına taşır ve kırık galeri
 * URL'lerini temizler. Tam CMS sync yapmaz; yalnızca mevcut `news` satırlarının
 * Kart ve detay kapaklarını ayırır; `data.image`, `data.images` ve
 * `data.imageMeta` alanlarını günceller.
 *
 * Kullanım:
 *   node --env-file=.env scripts/fix-news-images.mjs --force
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

if (!process.argv.includes("--force")) {
  console.error("Canlı haber verisini değiştirmek için --force gerekli.");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}

const root = process.cwd();
const localDataPath = path.join(root, "data/site-data.json");
const localNewsDir = path.join(root, "astro-app/public/assets/news");
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: rows, error: readError } = await supabase
  .from("news")
  .select("id, data, localized");
if (readError) throw new Error(`Haberler okunamadı: ${readError.message}`);

const localData = JSON.parse(fs.readFileSync(localDataPath, "utf8"));
const localById = new Map((localData.news || []).map((item) => [item.id, item]));

const isRemoteAvailable = async (url) => {
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    return response.ok && String(response.headers.get("content-type") || "").startsWith("image/");
  } catch {
    return false;
  }
};

const updatedRows = [];
for (const row of rows || []) {
  const coverFile = path.join(localNewsDir, row.id, "cover.webp");
  const cardCoverFile = path.join(localNewsDir, row.id, "cover-card.webp");
  const detailCoverFile = path.join(localNewsDir, row.id, "cover-detail.webp");
  if (!fs.existsSync(coverFile)) {
    throw new Error(`Yerel haber kapağı bulunamadı: ${coverFile}`);
  }
  if (!fs.existsSync(cardCoverFile)) {
    throw new Error(`16:10 haber kartı kapağı bulunamadı: ${cardCoverFile}`);
  }
  if (!fs.existsSync(detailCoverFile)) {
    throw new Error(`Kırpılmamış haber detay kapağı bulunamadı: ${detailCoverFile}`);
  }

  const originalStorageKey = `news/${row.id}/cover.webp`;
  const cardStorageKey = `news/${row.id}/cover-card.webp`;
  const detailStorageKey = `news/${row.id}/cover-detail.webp`;
  const { error: originalUploadError } = await supabase.storage
    .from("assets")
    .upload(originalStorageKey, fs.readFileSync(coverFile), {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    });
  if (originalUploadError) throw new Error(`${row.id} orijinal kapağı yüklenemedi: ${originalUploadError.message}`);

  const { error: cardUploadError } = await supabase.storage
    .from("assets")
    .upload(cardStorageKey, fs.readFileSync(cardCoverFile), {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    });
  if (cardUploadError) throw new Error(`${row.id} kart kapağı yüklenemedi: ${cardUploadError.message}`);

  const { error: detailUploadError } = await supabase.storage
    .from("assets")
    .upload(detailStorageKey, fs.readFileSync(detailCoverFile), {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    });
  if (detailUploadError) throw new Error(`${row.id} detay kapağı yüklenemedi: ${detailUploadError.message}`);

  const previousImages = Array.isArray(row.data?.images) ? row.data.images : [];
  const galleryCandidates = previousImages.filter((value) => {
    if (typeof value !== "string" || !value.trim()) return false;
    const clean = value.split("?")[0];
    return !/\/cover(?:[-_.]|$)/i.test(clean);
  });

  const validGallery = [];
  for (const candidate of galleryCandidates) {
    if (await isRemoteAvailable(candidate)) validGallery.push(candidate);
  }

  const localItem = localById.get(row.id) || {};
  const imageMeta = { width: 1600, height: 1000 };
  const nextData = {
    ...(row.data || {}),
    image: cardStorageKey,
    images: [
      detailStorageKey,
      originalStorageKey,
      ...validGallery.filter((value, index, list) => list.indexOf(value) === index),
    ],
    imageMeta,
  };

  updatedRows.push({ id: row.id, data: nextData, localized: row.localized || {} });
  localById.set(row.id, { ...localItem, ...nextData, localized: row.localized || localItem.localized || {} });
}

const { error: updateError } = await supabase
  .from("news")
  .upsert(updatedRows, { onConflict: "id" });
if (updateError) throw new Error(`Haber görselleri güncellenemedi: ${updateError.message}`);

localData.news = (localData.news || []).map((item) => localById.get(item.id) || item);
localData.meta = { ...(localData.meta || {}), updatedAt: new Date().toISOString() };
fs.writeFileSync(localDataPath, `${JSON.stringify(localData, null, 2)}\n`, "utf8");

const { data: verified, error: verifyError } = await supabase
  .from("news")
  .select("id, data")
  .order("sort_order");
if (verifyError) throw new Error(`Doğrulama yapılamadı: ${verifyError.message}`);

const invalid = (verified || []).filter((row) =>
  row.data?.image !== `news/${row.id}/cover-card.webp` ||
  row.data?.images?.[0] !== `news/${row.id}/cover-detail.webp`
);
if (invalid.length) throw new Error(`${invalid.length} haber görseli doğrulanamadı.`);

console.log(`${updatedRows.length} haber kapağı ve galerisi düzeltildi.`);
