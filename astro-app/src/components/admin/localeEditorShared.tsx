import { locales, type Locale } from "@/lib/cms";

export const SOURCE_LANG: Locale = "en";
export const TARGET_LOCALES = locales.filter((l) => l !== SOURCE_LANG);

export const LOCALE_INFO: Record<string, { flag: string; name: string }> = {
  en: { flag: "🇬🇧", name: "English" },
  tr: { flag: "🇹🇷", name: "Türkçe" },
  de: { flag: "🇩🇪", name: "Deutsch" },
  fr: { flag: "🇫🇷", name: "Français" },
  es: { flag: "🇪🇸", name: "Español" },
  it: { flag: "🇮🇹", name: "Italiano" },
  ar: { flag: "🇸🇦", name: "العربية" },
  ja: { flag: "🇯🇵", name: "日本語" },
};

export function localeInputClass(isSource: boolean, isFilled: boolean): string {
  if (isSource) return "border-[#c7d2fe] bg-white text-[#132175] font-semibold";
  return isFilled ? "border-green-200 bg-gray-50" : "border-amber-200 bg-gray-50";
}

export function StatusDot({ status }: { status: "all" | "partial" | "empty" }) {
  if (status === "all") return <span className="ws-pc-status ws-pc-status--ok">✓</span>;
  if (status === "partial") return <span className="ws-pc-status ws-pc-status--warn">◐</span>;
  return <span className="ws-pc-status ws-pc-status--empty">○</span>;
}

export function fieldTranslationStatus(
  getVal: (loc: Locale) => string,
): "all" | "partial" | "empty" {
  const filled = TARGET_LOCALES.filter((l) => getVal(l).trim()).length;
  if (filled === TARGET_LOCALES.length) return "all";
  if (filled > 0 || getVal(SOURCE_LANG).trim()) return "partial";
  return "empty";
}
