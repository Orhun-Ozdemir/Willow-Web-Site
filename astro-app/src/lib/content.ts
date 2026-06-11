import fs from "node:fs";
import path from "node:path";

const dataFile = path.join(process.cwd(), "../data/site-data.json");

let cached: any = null;
let cachedMtime = 0;

export function loadContent(): any {
  try {
    const stat = fs.statSync(dataFile);
    if (cached && stat.mtimeMs === cachedMtime) return cached;
    cached = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    cachedMtime = stat.mtimeMs;
    return cached;
  } catch (error) {
    console.error("loadContent failed", error);
    return {};
  }
}

export function saveContent(data: any): void {
  data.meta = { ...(data.meta || {}), updatedAt: new Date().toISOString() };
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + "\n", "utf8");
  cached = data;
  cachedMtime = Date.now();
}
