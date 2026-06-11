import fs from "node:fs";
import path from "node:path";

export function fetchContentSync(): any {
  try {
    const dataPath = path.join(process.cwd(), "../data/site-data.json");
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, "utf8"));
    }
  } catch (error) {
    console.error("fetchContentSync failed", error);
  }
  return {};
}
