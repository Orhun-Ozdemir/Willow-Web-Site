"use client";

import { useMemo } from "react";
import { locales } from "@/lib/cms";
import { useAdmin } from "./AdminContext";

interface CoverageRow {
  label: string;
  byLocale: Record<string, { filled: number; total: number }>;
}

function isFilled(val: any): boolean {
  if (!val) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

function countLocalized(items: any[], fields: string[]): Record<string, { filled: number; total: number }> {
  const result: Record<string, { filled: number; total: number }> = {};
  for (const loc of locales) {
    let filled = 0;
    const total = items.length * fields.length;
    for (const item of items) {
      const ld = item?.localized?.[loc] || {};
      for (const f of fields) {
        if (isFilled(ld[f])) filled++;
      }
    }
    result[loc] = { filled, total };
  }
  return result;
}

function countPageContent(pageContent: any): Record<string, { filled: number; total: number }> {
  const result: Record<string, { filled: number; total: number }> = {};
  const pages = Object.keys(pageContent || {});
  for (const loc of locales) {
    let filled = 0;
    let total = 0;
    for (const page of pages) {
      const keys = Object.keys(pageContent[page] || {});
      total += keys.length;
      for (const key of keys) {
        if (isFilled(pageContent[page][key]?.[loc])) filled++;
      }
    }
    result[loc] = { filled, total };
  }
  return result;
}

function countPageSeo(pageSeo: any): Record<string, { filled: number; total: number }> {
  const result: Record<string, { filled: number; total: number }> = {};
  const pages = Object.keys(pageSeo || {});
  const fields = ["seoTitle", "metaDescription", "focusKeyword", "slug", "h1"];
  for (const loc of locales) {
    let filled = 0;
    const total = pages.length * fields.length;
    for (const page of pages) {
      const d = pageSeo[page]?.[loc] || {};
      for (const f of fields) {
        if (isFilled(d[f])) filled++;
      }
    }
    result[loc] = { filled, total };
  }
  return result;
}

const ROW_TO_TAB: Record<string, string> = {
  "Sayfa SEO": "seo",
  "Sayfa İçerik": "translations",
  "Ürünler": "products",
  "Haberler": "news",
  "Çözümler": "solutions",
  "SSS": "faqs",
  "Müşteriler": "clients",
};

export default function TranslationHealthPanel({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { content } = useAdmin();

  const rows: CoverageRow[] = useMemo(() => {
    if (!content) return [];
    return [
      { label: "Sayfa SEO", byLocale: countPageSeo(content.pageSeo) },
      { label: "Sayfa İçerik", byLocale: countPageContent(content.pageContent) },
      { label: "Ürünler", byLocale: countLocalized(content.products || [], ["title", "category", "shortDescription", "technicalSummary", "useCases", "specifications"]) },
      { label: "Haberler", byLocale: countLocalized(content.news || [], ["title", "category", "excerpt", "content"]) },
      { label: "Çözümler", byLocale: countLocalized(content.solutions || [], ["title", "category", "headline", "summary", "bullets"]) },
      { label: "SSS", byLocale: countLocalized(content.faqs || [], ["question", "answer"]) },
      { label: "Müşteriler", byLocale: countLocalized(content.clients || [], ["name", "industry", "country"]) },
    ];
  }, [content]);

  const overallByLocale: Record<string, { filled: number; total: number }> = {};
  for (const loc of locales) {
    let filled = 0, total = 0;
    for (const row of rows) {
      filled += row.byLocale[loc]?.filled || 0;
      total += row.byLocale[loc]?.total || 0;
    }
    overallByLocale[loc] = { filled, total };
  }

  const pct = (filled: number, total: number) => total === 0 ? 0 : Math.round((filled / total) * 100);
  const barColor = (p: number) => p >= 80 ? "bg-[#132175]" : p >= 50 ? "bg-amber-500" : "bg-red-500";
  const textColor = (p: number) => p >= 80 ? "text-[#132175]" : p >= 50 ? "text-amber-600" : "text-red-500";

  return (
    <div className="space-y-6">
      {/* Overall per-locale bars */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-bold text-gray-500 uppercase mb-4">Dil Bazlı Genel Kapsam</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {locales.map((loc) => {
            const { filled, total } = overallByLocale[loc] || { filled: 0, total: 0 };
            const p = pct(filled, total);
            return (
              <div key={loc} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">{loc.toUpperCase()}</span>
                  <span className={`text-xs font-bold ${textColor(p)}`}>{p}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor(p)}`} style={{ width: `${p}%` }} />
                </div>
                <p className="text-[10px] text-gray-400">{filled}/{total} alan</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matrix table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase">Bileşen Bazlı Detay</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-left text-gray-500 font-bold uppercase">Bileşen</th>
                {locales.map((loc) => (
                  <th key={loc} className="p-3 text-center text-gray-500 font-bold uppercase">{loc}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const targetTab = ROW_TO_TAB[row.label];
                const clickable = !!(targetTab && onNavigate);
                return (
                <tr
                  key={row.label}
                  onClick={() => clickable && onNavigate!(targetTab)}
                  className={`hover:bg-gray-100/30 transition ${clickable ? "cursor-pointer hover:bg-[#132175]/5" : ""}`}
                >
                  <td className="p-3 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      {row.label}
                      {clickable && (
                        <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#132175]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </td>
                  {locales.map((loc) => {
                    const { filled, total } = row.byLocale[loc] || { filled: 0, total: 0 };
                    const p = pct(filled, total);
                    return (
                      <td key={loc} className="p-3 text-center">
                        <span className={`font-bold ${textColor(p)}`}>{p}%</span>
                        <span className="text-gray-400 ml-1">({filled}/{total})</span>
                      </td>
                    );
                  })}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
