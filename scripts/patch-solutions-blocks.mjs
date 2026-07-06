/**
 * Merges localized blocks into pageContent.solutions nested arrays
 * (selectorCards, howItWorksSteps, whyCards) by item id.
 *
 * Usage: node scripts/patch-solutions-blocks.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataFile = path.join(root, "data", "site-data.json");
const blocksFile = path.join(root, "scripts", "i18n", "13-solutions-blocks.json");

const data = JSON.parse(await readFile(dataFile, "utf8"));
const blocks = JSON.parse(await readFile(blocksFile, "utf8"));
const page = data.pageContent?.solutions;
if (!page) throw new Error("pageContent.solutions not found");

function patchArray(arr, blockMap) {
  if (!Array.isArray(arr) || !blockMap) return 0;
  let count = 0;
  for (const item of arr) {
    const locs = blockMap[item.id];
    if (!locs) continue;
    item.localized = item.localized || {};
    for (const [locale, fields] of Object.entries(locs)) {
      item.localized[locale] = { ...(item.localized[locale] || {}), ...fields };
      count++;
    }
  }
  return count;
}

let patched = 0;
patched += patchArray(page.selectorCards, blocks.selectorCards);
patched += patchArray(page.howItWorksSteps, blocks.howItWorksSteps);
patched += patchArray(page.whyCards, blocks.whyCards);

data.meta = { ...(data.meta || {}), updatedAt: new Date().toISOString() };
await writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Patched ${patched} localized block(s) in pageContent.solutions`);
