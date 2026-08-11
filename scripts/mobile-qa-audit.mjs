#!/usr/bin/env node
/**
 * Mobile layout QA: visit public pages at iPhone-like viewport and report
 * horizontal overflow, broken images, and console errors.
 *
 * Usage: node scripts/mobile-qa-audit.mjs
 * Optional: BASE_URL=https://www.willowsoft.co
 */
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const baseUrl = (process.env.BASE_URL || "https://www.willowsoft.co").replace(/\/+$/, "");
const chrome =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const PATHS = [
  "/en",
  "/tr",
  "/ar",
  "/en/products",
  "/en/products/willowbee",
  "/en/products/willowair",
  "/en/products/willowmod",
  "/en/services",
  "/en/solutions",
  "/en/company",
  "/en/news",
  "/en/news/embedded-world-2026",
  "/en/news/minister-varank-visit",
  "/en/contact",
  "/en/start-project",
  "/en/faq",
  "/en/glossary",
  "/en/privacy",
  "/tr/products",
  "/tr/company",
  "/tr/contact",
  "/tr/faq",
];

async function ensurePuppeteer() {
  const require = createRequire(path.join(root, "package.json"));
  try {
    return require("puppeteer-core");
  } catch {
    console.log("Installing puppeteer-core (temporary, project-local)...");
    const r = spawnSync("npm", ["install", "--no-save", "puppeteer-core@24.15.0"], {
      cwd: root,
      stdio: "inherit",
      shell: false,
    });
    if (r.status !== 0) throw new Error("puppeteer-core install failed");
    return createRequire(path.join(root, "package.json"))("puppeteer-core");
  }
}

async function auditPage(page, urlPath) {
  const url = `${baseUrl}${urlPath}`;
  const issues = [];
  const consoleErrors = [];
  const failedAssets = [];

  const onConsole = (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 220));
  };
  const onPageError = (err) => consoleErrors.push(String(err.message || err).slice(0, 220));
  const onResponse = (res) => {
    try {
      const req = res.request();
      const type = req.resourceType();
      const code = res.status();
      if ((type === "image" || type === "media") && code >= 400) {
        failedAssets.push(`${code} ${res.url().slice(0, 140)}`);
      }
    } catch {}
  };
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  let status = 0;
  try {
    const res = await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
    status = res?.status() || 0;
  } catch (e) {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("response", onResponse);
    return { path: urlPath, status: 0, issues: [`navigation failed: ${e.message}`], consoleErrors: [], warnings: [] };
  }

  if (status >= 400) issues.push(`HTTP ${status}`);

  // Dismiss consent if present so it doesn't skew layout checks
  try {
    await page.evaluate(() => {
      const banner = document.getElementById("willow-consent");
      if (banner) banner.classList.add("is-hidden");
    });
  } catch {}

  await new Promise((r) => setTimeout(r, 300));

  // Scroll through the page so lazy-loaded images enter the viewport and decode.
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.85));
    const maxY = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    for (let y = 0; y < maxY; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });

  // Wait for in-flight image decodes
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
                setTimeout(resolve, 2500);
              }),
      ),
    );
  });

  const layout = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const vw = window.innerWidth;
    const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
    const overflowX = scrollW - vw;

    const offenders = [];
    const all = Array.from(document.querySelectorAll("body *"));
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (style.position === "fixed" || style.position === "sticky") {
        // fixed widgets can intentionally sit near edges; still flag if wider than viewport
      }
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      // Ignore decorative canvases / overflowing intentionally clipped parents with overflow hidden
      let clip = el;
      let clipped = false;
      while (clip && clip !== document.body) {
        const cs = window.getComputedStyle(clip);
        if (cs.overflowX === "hidden" || cs.overflow === "hidden") {
          clipped = true;
          break;
        }
        clip = clip.parentElement;
      }
      if (clipped) continue;
      if (rect.right > vw + 2 || rect.left < -2) {
        const tag = el.tagName.toLowerCase();
        const cls = (el.className && typeof el.className === "string" ? el.className : "").slice(0, 80);
        const id = el.id ? `#${el.id}` : "";
        offenders.push({
          sel: `${tag}${id}${cls ? "." + cls.trim().split(/\s+/).slice(0, 2).join(".") : ""}`,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      }
      if (offenders.length >= 8) break;
    }

    const brokenImgs = Array.from(document.images)
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => (img.currentSrc || img.src || "").slice(0, 120))
      .slice(0, 6);

    const tinyTap = Array.from(document.querySelectorAll("a, button"))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
        return r.width > 0 && r.height > 0 && (r.width < 36 || r.height < 36);
      })
      .slice(0, 5)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const text = (el.textContent || "").trim().slice(0, 40);
        return `${el.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)} "${text}"`;
      });

    return {
      vw,
      scrollW,
      overflowX,
      offenders,
      brokenImgs,
      tinyTap,
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim().slice(0, 80) || "",
    };
  });

  if (layout.overflowX > 8) {
    issues.push(`yatay taşma: +${layout.overflowX}px (scrollWidth ${layout.scrollW} > ${layout.vw})`);
    for (const o of layout.offenders.slice(0, 5)) {
      issues.push(`  taşan öğe: ${o.sel} (left=${o.left}, right=${o.right}, w=${o.width})`);
    }
  }
  // Prefer network-level image failures (avoids lazy-load false positives).
  const uniqueFailed = [...new Set(failedAssets)].slice(0, 8);
  if (uniqueFailed.length) {
    issues.push(`HTTP görsel hatası (${uniqueFailed.length}): ${uniqueFailed[0]}`);
    for (const f of uniqueFailed.slice(1, 4)) issues.push(`  + ${f}`);
  }
  // Tiny tap targets are warnings, not hard errors — report separately
  const warnings = [];
  if (layout.tinyTap.length >= 3) {
    warnings.push(`küçük tıklama alanları (≥3): ör. ${layout.tinyTap[0]}`);
  }
  if (!layout.h1) warnings.push("H1 yok");

  const consoleIssues = consoleErrors
    .filter((t) => !/favicon|chrome-extension|ResizeObserver loop|net::ERR_BLOCKED/i.test(t))
    .slice(0, 4);
  if (consoleIssues.length) {
    issues.push(`konsol hatası: ${consoleIssues[0]}`);
  }

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("response", onResponse);

  return {
    path: urlPath,
    status,
    title: layout.title,
    issues,
    warnings,
    overflowX: layout.overflowX,
  };
}

async function main() {
  if (!fs.existsSync(chrome)) {
    console.error("Chrome not found at", chrome);
    process.exit(1);
  }
  const puppeteer = await ensurePuppeteer();
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  );

  const results = [];
  for (const p of PATHS) {
    process.stdout.write(`Auditing ${p}...\n`);
    try {
      results.push(await auditPage(page, p));
    } catch (e) {
      results.push({ path: p, status: 0, issues: [String(e.message || e)], warnings: [] });
    }
  }

  await browser.close();

  const withIssues = results.filter((r) => r.issues.length);
  const withWarnings = results.filter((r) => r.warnings?.length && !r.issues.length);
  const clean = results.filter((r) => !r.issues.length && !r.warnings?.length);

  console.log("\n========== MOBİL QA RAPORU (390×844) ==========\n");
  console.log(`Taranan: ${results.length} sayfa`);
  console.log(`Hatalı: ${withIssues.length}`);
  console.log(`Uyarılı: ${withWarnings.length}`);
  console.log(`Temiz: ${clean.length}\n`);

  if (withIssues.length) {
    console.log("--- HATALAR ---");
    for (const r of withIssues) {
      console.log(`\n${r.path}  (HTTP ${r.status})`);
      for (const i of r.issues) console.log(`  • ${i}`);
      for (const w of r.warnings || []) console.log(`  ⚠ ${w}`);
    }
  }

  if (withWarnings.length) {
    console.log("\n--- YALNIZCA UYARILAR ---");
    for (const r of withWarnings) {
      console.log(`\n${r.path}`);
      for (const w of r.warnings) console.log(`  ⚠ ${w}`);
    }
  }

  if (clean.length) {
    console.log("\n--- TEMİZ ---");
    console.log(clean.map((r) => r.path).join(", "));
  }

  const out = path.join("/tmp", "willow-mobile-qa-report.json");
  fs.writeFileSync(out, JSON.stringify({ baseUrl, viewport: "390x844", results }, null, 2));
  console.log(`\nJSON: ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
