import { diffJson, type DiffEntry } from "./json-diff";

export const CMS_SECTION_KEYS = [
  "products",
  "news",
  "services",
  "solutions",
  "clients",
  "faqs",
  "glossary",
  "pageContent",
  "pageSeo",
  "translations",
  "companyFacts",
  "meta",
] as const;

export type CmsSectionKey = (typeof CMS_SECTION_KEYS)[number];

/** Kayıt API'sindeki section/page ile CMS dilimini okur. */
export function extractSectionSlice(
  content: Record<string, unknown>,
  section: string | null | undefined,
  page?: string | null,
): unknown {
  if (!section || section === "all") return content;
  if (section === "pageContent" && page) {
    const pages = content.pageContent as Record<string, unknown> | undefined;
    return pages?.[page] ?? {};
  }
  return content[section];
}

/** Yalnızca kaydedilen bölümde before→after diff. */
export function diffSectionChange(
  contentBefore: Record<string, unknown>,
  contentAfter: Record<string, unknown>,
  section: string | null | undefined,
  page?: string | null,
): DiffEntry[] {
  const before = extractSectionSlice(contentBefore, section, page);
  const after = extractSectionSlice(contentAfter, section, page);
  return diffJson(before, after);
}

/** UI için okunabilir yol etiketi. */
export function humanizeDiffPath(path: string, section?: string): string {
  let p = path;
  if (section && section !== "all" && section !== "pageContent" && !p.startsWith("[")) {
    p = `${section}.${p}`;
  }
  return p
    .replace(/^faqs\[(\d+)\]/, "SSS #$1")
    .replace(/^products\[(\d+)\]/, "Ürün #$1")
    .replace(/^news\[(\d+)\]/, "Haber #$1")
    .replace(/\.localized\.([a-z]{2})\./g, " [$1] ")
    .replace(/\.question/g, " · Soru")
    .replace(/\.answer/g, " · Cevap")
    .replace(/\.title/g, " · Başlık")
    .replace(/\.label/g, " · Metin")
    .replace(/\.url/g, " · Link");
}
