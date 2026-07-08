import { getPublicClient, getServiceClient, hasSupabaseEnv } from "./supabase";
import { canonicalizeProduct } from "./product-model";
import fs from "node:fs";
import path from "node:path";
import localSiteData from "../../../data/site-data.json";

const dataFile = path.join(process.cwd(), "../data/site-data.json");

let cachedContent: any = null;
let lastFetchTime = 0;
const TTL_MS = 60000; // 60 seconds cache

/** Yedek geri yükleme sonrası önbelleği temizler. */
export function bustContentCache(): void {
  cachedContent = null;
  lastFetchTime = 0;
}

/** Tags a payload as bundled fallback (not real DB data) so consumers/loggers can tell. */
function markFallback(content: any) {
  if (content && typeof content === "object") {
    Object.defineProperty(content, "_fallback", { value: true, enumerable: false });
  }
  return content;
}

function normalizeContentShape(content: any) {
  if (!content) return content;
  return {
    ...content,
    products: Array.isArray(content.products)
      ? content.products.map((product: any) => canonicalizeProduct(product))
      : [],
  };
}

/**
 * Loads content from Supabase. Falls back to the bundled local JSON when Supabase
 * is unavailable — but ONLY when `allowFallback` is true (the default, used by the
 * public site for resilience).
 *
 * The admin MUST call this with `{ allowFallback: false }`. The bundled JSON contains
 * placeholder/seed data; if the admin ever loaded it and saved, it would overwrite the
 * real database with placeholders (this is exactly how the team members were lost).
 * With fallback disabled, a Supabase hiccup surfaces as a thrown error the admin can
 * show ("yüklenemedi"), instead of silently serving editable placeholder data.
 */
export async function loadContent(opts: { allowFallback?: boolean } = {}): Promise<any> {
  const allowFallback = opts.allowFallback !== false;

  const bundledFallback = () => {
    try {
      return markFallback(normalizeContentShape(JSON.parse(fs.readFileSync(dataFile, "utf8"))));
    } catch (err: any) {
      console.warn("Failed to read local dataFile, using bundled fallback:", err.message);
      return markFallback(normalizeContentShape(localSiteData || {}));
    }
  };

  if (!hasSupabaseEnv) {
    if (!allowFallback) {
      throw new Error("Supabase env not configured — refusing to serve local fallback to the admin.");
    }
    return bundledFallback();
  }

  const now = Date.now();
  if (cachedContent && now - lastFetchTime < TTL_MS) {
    return cachedContent;
  }

  const supabase = getPublicClient();

  let results;
  try {
    results = await Promise.all([
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("news").select("*").order("sort_order"),
      supabase.from("services").select("*").order("sort_order"),
      supabase.from("solutions").select("*").order("sort_order"),
      supabase.from("clients").select("*").order("sort_order"),
      supabase.from("faqs").select("*").order("sort_order"),
      supabase.from("glossary").select("*").order("sort_order"),
      supabase.from("page_content").select("*"),
      supabase.from("page_seo").select("*"),
      supabase.from("translations").select("*"),
      supabase.from("company_facts").select("data").eq("id", 1).single(),
      supabase.from("site_meta").select("data").eq("id", 1).single()
    ]);
  } catch (err: any) {
    // Network/transport failure (Promise rejected). Never let this become editable
    // placeholder data for the admin.
    if (!allowFallback) throw err;
    console.warn("Supabase query failed, falling back to bundled site-data:", err?.message || err);
    return bundledFallback();
  }

  const [
    { data: prods, error: prodsErr }, { data: nws }, { data: serv }, { data: sol }, { data: cli }, { data: fq }, { data: glos },
    { data: pContent }, { data: pSeo }, { data: trns },
    { data: compFacts, error: compErr }, { data: sMeta, error: metaErr }
  ] = results;

  // Distinguish a genuine query ERROR from a genuinely EMPTY (but successful) result.
  // A transient error must NOT be mistaken for "the DB legitimately has this (placeholder) data".
  const hadError = Boolean(prodsErr || compErr || metaErr);
  const productsEmpty = !prods || prods.length === 0;

  if (hadError || productsEmpty) {
    if (!allowFallback) {
      throw new Error(
        `Supabase read failed or returned empty (${hadError ? "query error" : "no products"}). ` +
        "Refusing to serve bundled fallback to the admin to avoid overwriting real data."
      );
    }
    console.warn("Supabase returned an error or no products. Falling back to local site-data.");
    return bundledFallback();
  }

  const mapProductCollection = (rows: any[] | null) =>
    (rows || []).map((r) => canonicalizeProduct({ ...r.data, id: r.id, localized: r.localized || {} }));

  /** SSS, sözlük vb. — ürün canonicalizer uygulanmaz (sahte diff/veri bozulması önlenir). */
  const mapGenericCollection = (rows: any[] | null) =>
    (rows || []).map((r) => ({
      ...r.data,
      id: r.id,
      localized: r.localized || {},
    }));

  const mapSingleton = (rows: any[] | null, key: string) => {
    const obj: Record<string, any> = {};
    (rows || []).forEach(r => { obj[r[key]] = r.data || {}; });
    return obj;
  };

  const content = {
    meta: sMeta?.data || {},
    companyFacts: compFacts?.data || {},
    products: mapProductCollection(prods),
    news: mapGenericCollection(nws),
    services: mapGenericCollection(serv),
    solutions: mapGenericCollection(sol),
    clients: mapGenericCollection(cli),
    faqs: mapGenericCollection(fq),
    glossary: mapGenericCollection(glos),
    pageContent: mapSingleton(pContent, "page"),
    pageSeo: mapSingleton(pSeo, "page"),
    translations: mapSingleton(trns, "locale")
  };

  cachedContent = content;
  lastFetchTime = Date.now();
  return content;
}

/**
 * Saves content to Supabase using the service role key.
 * This is a heavy operation (full sync) mimicking the original file write.
 */
export async function saveContent(data: any): Promise<void> {
  if (data && (data as any)._fallback) {
    throw new Error("Refusing to save: payload is bundled fallback data, not real DB content.");
  }
  if (!hasSupabaseEnv) {
    if (!import.meta.env.DEV) {
      throw new Error("Supabase env not configured — refusing to write to ephemeral local file in production.");
    }
    data.meta = { ...(data.meta || {}), updatedAt: new Date().toISOString() };
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + "\n", "utf8");
    cachedContent = data;
    lastFetchTime = Date.now();
    return;
  }

  const supabase = getServiceClient();
  data.meta = { ...(data.meta || {}), updatedAt: new Date().toISOString() };

  const extractLocal = (item: any) => {
    const { localized, ...rest } = item;
    return { data: rest, localized: localized || {} };
  };

  // Helper to sync a collection table
  const syncCollection = async (table: string, items: any[]) => {
    // 1. Get current IDs to detect deletions
    const { data: current } = await supabase.from(table).select("id");
    const currentIds = new Set((current || []).map(r => r.id));
    
    // 2. Upsert items
    const rows = (items || []).map(it => {
      currentIds.delete(it.id);
      return { id: it.id, ...extractLocal(it) };
    });
    if (rows.length > 0) {
      await supabase.from(table).upsert(rows);
    }
    
    // 3. Delete removed items
    if (currentIds.size > 0) {
      await supabase.from(table).delete().in("id", Array.from(currentIds));
    }
  };

  // Helper to sync a singleton map table
  const syncSingleton = async (table: string, keyName: string, mapData: any) => {
    const { data: current } = await supabase.from(table).select(keyName);
    const currentKeys = new Set((current || []).map(r => (r as any)[keyName]));

    const rows = Object.entries(mapData || {}).map(([k, v]) => {
      currentKeys.delete(k);
      return { [keyName]: k, data: v };
    });
    
    if (rows.length > 0) {
      await supabase.from(table).upsert(rows);
    }
    if (currentKeys.size > 0) {
      await supabase.from(table).delete().in(keyName, Array.from(currentKeys));
    }
  };

  await Promise.all([
    syncCollection("products", data.products),
    syncCollection("news", data.news),
    syncCollection("services", data.services),
    syncCollection("solutions", data.solutions),
    syncCollection("clients", data.clients),
    syncCollection("faqs", data.faqs),
    syncCollection("glossary", data.glossary),
    syncSingleton("page_content", "page", data.pageContent),
    syncSingleton("page_seo", "page", data.pageSeo),
    syncSingleton("translations", "locale", data.translations),
    supabase.from("company_facts").upsert({ id: 1, data: data.companyFacts || {} }),
    supabase.from("site_meta").upsert({ id: 1, data: data.meta || {} })
  ]);

  // Bust cache
  cachedContent = data;
  lastFetchTime = Date.now();
}

/**
 * Saves a single section of the content.
 */
export async function saveContentSection(section: string, sectionData: any): Promise<void> {
  if (sectionData && (sectionData as any)._fallback) {
    throw new Error("Refusing to save: section payload is bundled fallback data, not real DB content.");
  }
  if (!hasSupabaseEnv) {
    if (!import.meta.env.DEV) {
      throw new Error("Supabase env not configured — refusing to write to ephemeral local file in production.");
    }
    let fullData: any = {};
    try {
      fullData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    } catch (err: any) {
      console.warn("Failed to read local dataFile, using bundled fallback:", err.message);
      fullData = { ...localSiteData };
    }

    fullData[section] = sectionData;
    fullData.meta = { ...(fullData.meta || {}), updatedAt: new Date().toISOString() };

    fs.writeFileSync(dataFile, JSON.stringify(fullData, null, 2) + "\n", "utf8");
    cachedContent = fullData;
    lastFetchTime = Date.now();
    return;
  }

  const supabase = getServiceClient();

  const extractLocal = (item: any) => {
    const { localized, ...rest } = item;
    return { data: rest, localized: localized || {} };
  };

  const syncCollection = async (table: string, items: any[]) => {
    const { data: current } = await supabase.from(table).select("id");
    const currentIds = new Set((current || []).map(r => r.id));

    const rows = (items || []).map(it => {
      currentIds.delete(it.id);
      return { id: it.id, ...extractLocal(it) };
    });
    if (rows.length > 0) {
      await supabase.from(table).upsert(rows);
    }
    if (currentIds.size > 0) {
      await supabase.from(table).delete().in("id", Array.from(currentIds));
    }
  };

  const syncSingleton = async (table: string, keyName: string, mapData: any) => {
    const { data: current } = await supabase.from(table).select(keyName);
    const currentKeys = new Set((current || []).map(r => (r as any)[keyName]));

    const rows = Object.entries(mapData || {}).map(([k, v]) => {
      currentKeys.delete(k);
      return { [keyName]: k, data: v };
    });

    if (rows.length > 0) {
      await supabase.from(table).upsert(rows);
    }
    if (currentKeys.size > 0) {
      await supabase.from(table).delete().in(keyName, Array.from(currentKeys));
    }
  };

  switch (section) {
    case "products":
      await syncCollection("products", sectionData);
      break;
    case "news":
      await syncCollection("news", sectionData);
      break;
    case "services":
      await syncCollection("services", sectionData);
      break;
    case "solutions":
      await syncCollection("solutions", sectionData);
      break;
    case "clients":
      await syncCollection("clients", sectionData);
      break;
    case "faqs":
      await syncCollection("faqs", sectionData);
      break;
    case "glossary":
      await syncCollection("glossary", sectionData);
      break;
    case "pageContent":
      await syncSingleton("page_content", "page", sectionData);
      break;
    case "pageSeo":
      await syncSingleton("page_seo", "page", sectionData);
      break;
    case "translations":
      await syncSingleton("translations", "locale", sectionData);
      break;
    case "companyFacts":
      await supabase.from("company_facts").upsert({ id: 1, data: sectionData || {} });
      break;
    case "meta":
      await supabase.from("site_meta").upsert({ id: 1, data: sectionData || {} });
      break;
    default:
      throw new Error(`Unknown section: ${section}`);
  }

  // Bust cache to force fresh load next time
  cachedContent = null;
  lastFetchTime = 0;
}

/** Upsert a single page_content row (safer than rewriting every page at once). */
export async function savePageContentSlice(page: string, data: any): Promise<void> {
  if (!page) throw new Error("Missing page key");
  if (data && (data as any)._fallback) {
    throw new Error("Refusing to save: page payload is bundled fallback data.");
  }

  if (!hasSupabaseEnv) {
    if (!import.meta.env.DEV) {
      throw new Error("Supabase env not configured — refusing to write page content in production.");
    }
    let fullData: any = {};
    try {
      fullData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    } catch (err: any) {
      console.warn("Failed to read local dataFile, using bundled fallback:", err.message);
      fullData = { ...localSiteData };
    }
    fullData.pageContent = { ...(fullData.pageContent || {}), [page]: data };
    fullData.meta = { ...(fullData.meta || {}), updatedAt: new Date().toISOString() };
    fs.writeFileSync(dataFile, JSON.stringify(fullData, null, 2) + "\n", "utf8");
    cachedContent = fullData;
    lastFetchTime = Date.now();
    return;
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("page_content").upsert({ page, data });
  if (error) throw new Error(error.message);

  if (cachedContent?.pageContent) {
    cachedContent = {
      ...cachedContent,
      pageContent: { ...cachedContent.pageContent, [page]: data },
    };
    lastFetchTime = Date.now();
  } else {
    cachedContent = null;
    lastFetchTime = 0;
  }
}
