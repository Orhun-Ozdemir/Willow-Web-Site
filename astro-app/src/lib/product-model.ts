import type { Locale } from "./cms";

export const PRODUCT_ICON_KEYS = [
  "radio",
  "location",
  "battery",
  "thermo",
  "shield",
  "factory",
  "barn",
  "map",
  "droplet",
  "cloud",
  "sprout",
  "leaf",
  "greenhouse",
  "mount",
  "check",
  "gear",
  "chart",
  "stack",
  "signal",
  "activity",
] as const;

export const PRODUCT_ICON_SVG: Record<string, string> = {
  radio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>`,
  location: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M21 10c0 5-6.5 11-9 11S3 15 3 10a9 9 0 0 1 18 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  battery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="11" x2="23" y2="13"></line></svg>`,
  thermo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M12 3l7 4v5c0 5-3.3 8.6-7 9-3.7-.4-7-4-7-9V7l7-4z"></path><path d="M9 12l2 2 4-5"></path></svg>`,
  factory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M17 18.5V21H3V3l4 3 4-3 4 3h2a2 2 0 0 1 2 2v3"></path><path d="M17 11.5a2.5 2.5 0 0 1 5 0V18a2 2 0 0 1-2 2h-3"></path><path d="M20 6h2"></path></svg>`,
  barn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M3 21h18"></path><path d="M4 21V10l8-6 8 6v11"></path><path d="M9 21v-6a3 3 0 0 1 6 0v6"></path><path d="M4 10h16"></path></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path></svg>`,
  droplet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
  cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
  sprout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M2 22c1.25-3.87 3.75-7 7-7h5c3.25 0 5.75 3.13 7 7"></path><path d="M12 15V9"></path><path d="M12 9c0-2.21-1.79-4-4-4S4 6.79 4 9s1.79 4 4 4h4"></path><path d="M12 9c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4h-4"></path></svg>`,
  leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-10 12.5z"></path><path d="M19 2c-2.26 4.33-5.27 7.14-8 10"></path></svg>`,
  greenhouse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M3 21h18"></path><path d="M3 21v-8a9 9 0 0 1 18 0v8"></path><path d="M9 21v-4a3 3 0 0 1 6 0v4"></path><line x1="3" y1="13" x2="21" y2="13"></line><line x1="12" y1="4" x2="12" y2="13"></line></svg>`,
  mount: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.65 1.65 0 0 0-1-1.5 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 3.29 17l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.5-1H2a2 2 0 0 1 0-4h.1a1.65 1.65 0 0 0 1.5-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 5.1 3.29l.06.06A1.65 1.65 0 0 0 7 3.6a1.65 1.65 0 0 0 1-1.5V2a2 2 0 0 1 4 0v.1a1.65 1.65 0 0 0 1 1.5 1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 0 1 20.71 7l-.06.06A1.65 1.65 0 0 0 20.4 9a1.65 1.65 0 0 0 1.5 1H22a2 2 0 0 1 0 4h-.1a1.65 1.65 0 0 0-1.5 1z"></path></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M4 19V5"></path><path d="M8 19v-8"></path><path d="M12 19v-4"></path><path d="M16 19V7"></path><path d="M20 19v-10"></path></svg>`,
  stack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M12 3l9 5-9 5-9-5 9-5z"></path><path d="M3 13l9 5 9-5"></path><path d="M3 18l9 5 9-5"></path></svg>`,
  signal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M4 20v-2"></path><path d="M8 20v-6"></path><path d="M12 20V8"></path><path d="M16 20v-4"></path><path d="M20 20v-10"></path></svg>`,
  activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M3 12h4l3-8 4 16 2-8h5"></path></svg>`,
};

export interface ProductDetailBlock {
  id: string;
  type: "note" | "list" | "cards" | "rich";
  title?: string;
  icon?: string;
  body?: string;
  items?: string[];
  kicker?: string;
  visible?: boolean;
}

export function normalizeAssetPath(path: any): string {
  if (!path) return "";
  const value = String(path).trim();
  if (!value) return "";
  return value.replace(/^\/+/, "");
}

export function normalizeStringList(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]+/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeLocalizedMap(value: any): any {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function normalizeProductCategory(category: any): string {
  const raw = String(category || "").trim().toLowerCase();
  if (!raw) return "environment";
  if (["modules", "module", "modul", "module-type"].includes(raw)) return "modules";
  if (["tracking", "motion sensor", "motion", "tilt", "asset tracking", "event"].includes(raw)) return "tracking";
  if (["industrial", "industry", "modbus", "bridge"].includes(raw)) return "industrial";
  if (["environment", "sensor", "sensors", "weather", "air quality", "water"].includes(raw)) return "environment";
  return raw;
}

function parseMaybeJson(value: any) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function toId(seed: any): string {
  const value = String(seed || "").trim();
  if (!value) return `product-${Date.now()}`;
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `product-${Date.now()}`;
}

export function normalizeProductDetailBlocks(value: any): ProductDetailBlock[] {
  const blocks = parseMaybeJson(value);
  if (!Array.isArray(blocks)) return [];
  return blocks
    .map((block: any, index: number) => ({
      id: toId(block?.id || `block-${index + 1}`),
      type: ["note", "list", "cards", "rich"].includes(block?.type) ? block.type : "note",
      title: String(block?.title || "").trim(),
      icon: String(block?.icon || "stack").trim() || "stack",
      body: String(block?.body || "").trim(),
      items: normalizeStringList(block?.items),
      kicker: String(block?.kicker || "").trim(),
      visible: block?.visible !== false,
    }))
    .filter((block) => block.visible !== false);
}

export function normalizeProductSpecifications(value: any): any {
  const parsed = parseMaybeJson(value);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "string") return parsed;
  return {};
}

export function canonicalizeProduct(raw: any) {
  const name = String(raw?.title || raw?.name || raw?.slug || raw?.id || "Product").trim();
  const category = normalizeProductCategory(raw?.category);
  const image = normalizeAssetPath(raw?.image);
  const images = normalizeStringList(raw?.images);
  const normalizedImages = images.length ? images.map(normalizeAssetPath).filter(Boolean) : image ? [image] : [];
  const detailBlocks = normalizeProductDetailBlocks(raw?.detailBlocks || raw?.blocks);
  const specifications = normalizeProductSpecifications(raw?.specifications);
  const chips = normalizeStringList(raw?.chips);
  const applications = normalizeStringList(raw?.applications);

  return {
    ...raw,
    id: String(raw?.id ?? toId(raw?.slug || name)),
    title: name,
    name,
    slug: String(raw?.slug || toId(name)),
    category,
    image,
    images: normalizedImages,
    shortDescription: String(raw?.shortDescription || raw?.description || "").trim(),
    description: String(raw?.description || raw?.shortDescription || "").trim(),
    chips,
    featured: Boolean(raw?.featured),
    detailUrl: String(raw?.detailUrl || "").trim(),
    type: String(raw?.type || "").trim(),
    batteryLife: raw?.batteryLife ?? raw?.battery_life ?? null,
    battery_life: raw?.battery_life ?? raw?.batteryLife ?? null,
    communicationRange: raw?.communicationRange ?? raw?.communication_range ?? null,
    communication_range: raw?.communication_range ?? raw?.communicationRange ?? null,
    applications,
    specifications,
    detailBlocks,
    datasheet: String(raw?.datasheet || raw?.datasheet_url || raw?.datasheetUrl || "").trim(),
    datasheet_url: String(raw?.datasheet_url || raw?.datasheet || raw?.datasheetUrl || "").trim(),
    visible: raw?.visible !== false,
    sortOrder: raw?.sortOrder ?? raw?.sort_order ?? 0,
    sort_order: raw?.sort_order ?? raw?.sortOrder ?? 0,
    localized: normalizeLocalizedMap(raw?.localized),
  };
}

export function specLabelFromKey(key: string): string {
  return String(key || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildSpecificationGroups(specifications: any) {
  const spec = normalizeProductSpecifications(specifications);
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) return [];

  const rootRows: { label: string; value: string }[] = [];
  const rootLists: { title: string; items: string[] }[] = [];
  const groups: { title: string; rows: { label: string; value: string }[]; lists: { title: string; items: string[] }[] }[] = [];

  Object.entries(spec).forEach(([key, value]) => {
    if (value == null || value === "") return;
    if (Array.isArray(value)) {
      const items = normalizeStringList(value);
      if (items.length) rootLists.push({ title: specLabelFromKey(key), items });
      return;
    }
    if (typeof value === "object") {
      const rows: { label: string; value: string }[] = [];
      const lists: { title: string; items: string[] }[] = [];
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue == null || nestedValue === "") return;
        if (Array.isArray(nestedValue)) {
          const items = normalizeStringList(nestedValue);
          if (items.length) lists.push({ title: specLabelFromKey(nestedKey), items });
          return;
        }
        rows.push({ label: specLabelFromKey(nestedKey), value: String(nestedValue) });
      });
      if (rows.length || lists.length) groups.push({ title: specLabelFromKey(key), rows, lists });
      return;
    }
    rootRows.push({ label: specLabelFromKey(key), value: String(value) });
  });

  return [
    ...(rootRows.length || rootLists.length ? [{ title: "Specifications", rows: rootRows, lists: rootLists }] : []),
    ...groups,
  ];
}

function containsAny(value: string, patterns: string[]) {
  const haystack = value.toLowerCase();
  return patterns.some((pattern) => haystack.includes(pattern));
}

export function iconKeyForText(value: string): string {
  const text = String(value || "");
  if (!text) return "check";
  if (containsAny(text, ["battery", "power", "charge"])) return "battery";
  if (containsAny(text, ["temperature", "therm", "heat"])) return "thermo";
  if (containsAny(text, ["motion", "movement", "vibration", "acceleration", "tilt"])) return "activity";
  if (containsAny(text, ["distance", "level", "fill", "position"])) return "location";
  if (containsAny(text, ["door", "open", "close", "access", "security"])) return "shield";
  if (containsAny(text, ["industrial", "machine", "plc", "modbus"])) return "factory";
  if (containsAny(text, ["building", "site", "infrastructure"])) return "map";
  if (containsAny(text, ["air", "co2", "environment", "weather", "humidity"])) return "cloud";
  if (containsAny(text, ["soil", "farm", "agriculture", "greenhouse"])) return "sprout";
  if (containsAny(text, ["wind"])) return "signal";
  return "check";
}

export function applicationIconForText(value: string): string {
  const text = String(value || "");
  if (!text) return "check";
  if (containsAny(text, ["security", "safety", "panic"])) return "shield";
  if (containsAny(text, ["building", "infrastructure", "facility"])) return "factory";
  if (containsAny(text, ["railway", "tunnel", "road", "highway", "roadway"])) return "map";
  if (containsAny(text, ["mine", "geotechnical"])) return "mount";
  if (containsAny(text, ["handheld", "gaming", "pointing"])) return "radio";
  if (containsAny(text, ["agriculture", "farm", "field", "crop", "greenhouse"])) return "sprout";
  if (containsAny(text, ["industrial", "machinery", "machine"])) return "factory";
  return "check";
}

export function blockIconOptions() {
  return PRODUCT_ICON_KEYS.map((value) => ({ value, label: value.replace(/\b\w/g, (char) => char.toUpperCase()) }));
}
