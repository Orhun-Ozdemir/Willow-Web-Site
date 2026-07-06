import type { Locale } from "@/lib/cms";

export const DEFAULT_BRAND_TAGLINE: Record<Locale, string> = {
  en: "Embedded Systems & IoT Connectivity",
  tr: "Gömülü Sistemler ve IoT Bağlantı Çözümleri",
  de: "Eingebettete Systeme und IoT-Konnektivität",
  fr: "Systèmes embarqués et connectivité IoT",
  es: "Sistemas embebidos y conectividad IoT",
  it: "Sistemi embedded e connettività IoT",
  ar: "الأنظمة المدمجة وحلول اتصال إنترنت الأشياء",
  ja: "組み込みシステムとIoT通信",
};

export function brandTaglineForLocale(
  meta: { brandTagline?: Partial<Record<Locale, string>> } | null | undefined,
  locale: Locale,
): string {
  const fromCms = meta?.brandTagline?.[locale] || meta?.brandTagline?.en;
  return fromCms || DEFAULT_BRAND_TAGLINE[locale] || DEFAULT_BRAND_TAGLINE.en;
}
