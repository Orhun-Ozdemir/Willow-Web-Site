import { getPublicClient, getServiceClient, hasSupabaseEnv } from "./supabase";
import { canonicalizeProduct } from "./product-model";
import fs from "node:fs";
import path from "node:path";
import localSiteData from "../../../data/site-data.json";

const dataFile = path.join(process.cwd(), "../data/site-data.json");

let cachedContent: any = null;
let lastFetchTime = 0;
const TTL_MS = 60000; // 60 seconds cache

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
 * Loads content from Supabase. Fallbacks to local JSON if no Supabase env is found.
 */
export async function loadContent(): Promise<any> {
  if (!hasSupabaseEnv) {
    try {
      return normalizeContentShape(JSON.parse(fs.readFileSync(dataFile, "utf8")));
    } catch (err: any) {
      console.warn("Failed to read local dataFile, using bundled fallback:", err.message);
      return normalizeContentShape(localSiteData || {});
    }
  }

  const now = Date.now();
  if (cachedContent && now - lastFetchTime < TTL_MS) {
    return cachedContent;
  }

  const supabase = getPublicClient();

  const collections = ["products", "news", "services", "solutions", "clients", "faqs", "glossary"];
  const singletons = ["page_content", "page_seo", "translations"];

  const [
    { data: prods }, { data: nws }, { data: serv }, { data: sol }, { data: cli }, { data: fq }, { data: glos },
    { data: pContent }, { data: pSeo }, { data: trns },
    { data: compFacts }, { data: sMeta }
  ] = await Promise.all([
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

  // If Supabase returned no products or failed, fall back to the bundled site-data JSON.
  if ((!prods || prods.length === 0) && localSiteData) {
    console.warn("Supabase returned no products or failed. Falling back to local site-data.");
    return normalizeContentShape(localSiteData);
  }

  const mapCollection = (rows: any[] | null) =>
    (rows || []).map(r => canonicalizeProduct({ ...r.data, id: r.id, localized: r.localized || {} }));

  const mapSingleton = (rows: any[] | null, key: string) => {
    const obj: Record<string, any> = {};
    (rows || []).forEach(r => { obj[r[key]] = r.data || {}; });
    return obj;
  };

  const content = {
    meta: sMeta?.data || {},
    companyFacts: compFacts?.data || {},
    products: mapCollection(prods),
    news: mapCollection(nws),
    services: mapCollection(serv),
    solutions: mapCollection(sol),
    clients: mapCollection(cli),
    faqs: mapCollection(fq),
    glossary: mapCollection(glos),
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
  if (!hasSupabaseEnv) {
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
    const currentKeys = new Set((current || []).map(r => r[keyName]));

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
