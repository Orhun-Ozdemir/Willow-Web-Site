import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(__dirname);
const siteDataFile = path.join(root, "data", "site-data.json");
const sourceScriptFile = path.join(root, "scripts", "seed-new-products.mjs");

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function run() {
  // 1. Read seed-new-products.mjs to get new products array
  const sourceCode = await readFile(sourceScriptFile, "utf8");
  const startIndex = sourceCode.indexOf("const newProducts = [");
  if (startIndex === -1) {
    throw new Error("Could not find newProducts array in source script");
  }
  
  // Find the matching closing bracket of the array
  let bracketsCount = 0;
  let endIndex = -1;
  for (let i = startIndex + "const newProducts = ".length; i < sourceCode.length; i++) {
    if (sourceCode[i] === "[") bracketsCount++;
    if (sourceCode[i] === "]") {
      bracketsCount--;
      if (bracketsCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  
  if (endIndex === -1) {
    throw new Error("Could not find matching end of newProducts array");
  }
  
  const arrayString = sourceCode.substring(startIndex + "const newProducts = ".length, endIndex);
  
  // Safe evaluation of the array string
  const newProducts = new Function(`return ${arrayString}`)();
  console.log(`Successfully parsed ${newProducts.length} new products from seed script.`);
  
  // 2. Read site-data.json
  const siteData = JSON.parse(await readFile(siteDataFile, "utf8"));
  
  // 3. Map new products to site-data schema
  const mappedProducts = newProducts.map((p, idx) => {
    const slug = generateSlug(p.name);
    
    // Determine category based on product info
    let category = "environment";
    const nameLower = p.name.toLowerCase();
    const typeLower = p.type.toLowerCase();
    
    if (p.category === "Module") {
      category = "modules";
    } else if (p.category?.includes("Industrial") || nameLower.includes("modbus") || nameLower.includes("meter") || nameLower.includes("pulse") || nameLower.includes("i/o")) {
      category = "industrial";
    } else if (p.category?.includes("Safety") || p.category?.includes("Magnetic") || p.category?.includes("Motion") || nameLower.includes("gps") || nameLower.includes("encoder") || nameLower.includes("tilt")) {
      category = "tracking";
    }
    
    // Auto-create chips from specifications or default values
    let chips = [];
    if (p.specifications?.protocol) {
      chips.push(p.specifications.protocol.replace(" MHz", ""));
    }
    if (p.communication_range) {
      chips.push(p.communication_range.replace("up to ", ""));
    }
    if (p.battery_life) {
      chips.push(p.battery_life.replace("up to ", "").replace(" battery", ""));
    }
    if (chips.length === 0 && p.specifications?.features) {
      chips = p.specifications.features.slice(0, 3);
    }
    
    return {
      id: slug,
      title: p.name,
      slug: slug,
      category: category,
      image: "", // To be filled later
      shortDescription: p.description,
      chips: chips.slice(0, 3),
      featured: p.name === "WillowBee" || p.name === "WillowSonic" || p.name === "WillowMos",
      detailUrl: `/en/products/${slug}`,
      type: p.type,
      batteryLife: p.battery_life,
      communicationRange: p.communication_range,
      applications: p.applications || [],
      specifications: p.specifications || {},
      visible: true,
      localized: {}
    };
  });
  
  // 4. Update site-data.json
  siteData.products = mappedProducts;
  siteData.meta = { ...siteData.meta, updatedAt: new Date().toISOString() };
  
  await writeFile(siteDataFile, JSON.stringify(siteData, null, 2) + "\n", "utf8");
  console.log("Successfully seeded and overwrote products in site-data.json");
}

run().catch(console.error);
