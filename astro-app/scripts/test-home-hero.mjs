import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), ".hero-test");
fs.mkdirSync(outDir, { recursive: true });

async function sampleShader(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector(".hero-shader-canvas");
    if (!canvas) return { error: "no canvas" };
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return { error: "no webgl" };

    const w = canvas.width;
    const h = canvas.height;
    const pixels = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    function sampleColumn(xRatio) {
      const x = Math.min(w - 1, Math.max(0, Math.floor(w * xRatio)));
      let colorSpread = 0;
      let whiteHits = 0;
      let samples = 0;
      for (let y = Math.floor(h * 0.2); y < Math.floor(h * 0.8); y += 8) {
        const i = (y * w + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        colorSpread += Math.max(r, g, b) - Math.min(r, g, b);
        if (r > 238 && g > 232 && b > 232) whiteHits++;
        samples++;
      }
      return {
        colorSpread: samples ? Number((colorSpread / samples).toFixed(1)) : 0,
        whiteRatio: samples ? Number((whiteHits / samples).toFixed(3)) : 0,
      };
    }

    const after = getComputedStyle(document.querySelector(".motion-hero"), "::after");
    return {
      canvas: { w, h },
      left: sampleColumn(0.12),
      center: sampleColumn(0.5),
      right: sampleColumn(0.88),
      afterBgPos: after.backgroundPosition,
      afterBlend: after.mixBlendMode,
    };
  });
}

const baseUrl = process.argv[2] || "http://127.0.0.1:4321/en";
const label = baseUrl.includes("willowsoft") ? "live" : "local";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1200);

const frames = [];
for (let i = 0; i < 6; i++) {
  await page.waitForTimeout(900);
  await page.screenshot({
    path: path.join(outDir, `home-${label}-frame-${i}.png`),
    clip: { x: 0, y: 0, width: 1440, height: 520 },
  });
  frames.push({ frame: i, ...(await sampleShader(page)) });
}

const leftSpreads = frames.map((f) => f.left?.colorSpread || 0);
const leftWhites = frames.map((f) => f.left?.whiteRatio || 0);
const rightSpreads = frames.map((f) => f.right?.colorSpread || 0);

console.log("URL", baseUrl);
console.log("summary", {
  leftAvgColor: (leftSpreads.reduce((a, b) => a + b, 0) / leftSpreads.length).toFixed(1),
  rightAvgColor: (rightSpreads.reduce((a, b) => a + b, 0) / rightSpreads.length).toFixed(1),
  leftWhiteAvg: (leftWhites.reduce((a, b) => a + b, 0) / leftWhites.length).toFixed(3),
  leftGetsColor: leftSpreads.some((v) => v > 25),
  leftMovement: (Math.max(...leftSpreads) - Math.min(...leftSpreads)).toFixed(1),
  afterBlend: frames[0]?.afterBlend,
});
console.log("frames", JSON.stringify(frames, null, 2));

await browser.close();
