import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const projectRoot = "/Users/orhunozdemir/Documents/Willow Web Site";
const artifactsDir = "/Users/orhunozdemir/.gemini/antigravity/brain/ddf0c300-4d4f-4ee7-b114-667bf06f9e24/artifacts";

async function main() {
  let browser;
  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    
    const page = await browser.newPage();
    
    // Capture Desktop (1440px)
    console.log("Navigating to page for desktop capture...");
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4173/index.html", { waitUntil: "networkidle0" });
    
    // Wait extra 3.5 seconds for CSS animation & WebGL loading
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    const tmpScreensDir = path.join(projectRoot, "tmp-screens");
    if (!fs.existsSync(tmpScreensDir)) {
      fs.mkdirSync(tmpScreensDir, { recursive: true });
    }
    
    const desktopPath = path.join(tmpScreensDir, "homepage-desktop-capture.png");
    console.log(`Saving desktop screenshot to ${desktopPath}...`);
    await page.screenshot({ path: desktopPath, fullPage: true });
    
    // Also copy to artifacts directory
    fs.copyFileSync(desktopPath, path.join(artifactsDir, "homepage-desktop-capture.png"));
    
    // Capture Mobile (390px)
    console.log("Navigating to page for mobile capture...");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4173/index.html", { waitUntil: "networkidle0" });
    
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    const mobilePath = path.join(tmpScreensDir, "homepage-mobile-capture.png");
    console.log(`Saving mobile screenshot to ${mobilePath}...`);
    await page.screenshot({ path: mobilePath, fullPage: true });
    
    // Also copy to artifacts directory
    fs.copyFileSync(mobilePath, path.join(artifactsDir, "homepage-mobile-capture.png"));

    console.log("Visual validation screenshots captured successfully!");
  } catch (err) {
    console.error("Error capturing screenshots:", err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
