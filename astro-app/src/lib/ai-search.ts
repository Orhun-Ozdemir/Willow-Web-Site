import { localizedValue, type Locale } from "@/lib/cms";

export interface AiFaqItem {
  question: string;
  answer: string;
}

export interface AiAnswerMeta {
  updatedAt?: string;
  reviewedBy?: string;
  sourceLabel?: string;
}

const REVIEWED_BY: Record<Locale, string> = {
  en: "WillowSoft Engineering Team",
  tr: "WillowSoft Mühendislik Ekibi",
  de: "WillowSoft Engineering Team",
  fr: "Équipe d'ingénierie WillowSoft",
  es: "Equipo de ingeniería de WillowSoft",
  it: "Team di ingegneria WillowSoft",
  ar: "فريق هندسة WillowSoft",
  ja: "WillowSoft エンジニアリングチーム",
};

const SOURCE_LABEL: Record<Locale, string> = {
  en: "About us, product and service data",
  tr: "Hakkımızda, ürün ve hizmet verileri",
  de: "Über uns, Produkt- und Servicedaten",
  fr: "À propos, données produits et services",
  es: "Sobre nosotros, datos de productos y servicios",
  it: "Chi siamo, dati di prodotto e servizio",
  ar: "من نحن، بيانات المنتجات والخدمات",
  ja: "会社概要・製品・サービスデータ",
};

const AI_SHORT_FALLBACKS: Record<string, Partial<Record<Locale, string>>> = {
  home: {
    en: "WillowSoft designs connected products from embedded hardware and firmware to backend APIs, PostgreSQL databases, dashboards, mobile apps and VR simulation layers.",
    tr: "WillowSoft; gömülü donanım ve firmware'den backend API, PostgreSQL, panel, mobil uygulama ve VR simülasyon katmanlarına kadar IoT ürünleri geliştirir.",
    de: "WillowSoft entwickelt vernetzte Produkte von Embedded-Hardware und Firmware bis zu Backend-APIs, PostgreSQL, Dashboards, mobilen Apps und VR-Simulationen.",
    fr: "WillowSoft conçoit des produits connectés, du matériel embarqué et firmware aux API backend, PostgreSQL, tableaux de bord, applications mobiles et simulations VR.",
    es: "WillowSoft diseña productos conectados desde hardware embebido y firmware hasta APIs backend, PostgreSQL, dashboards, apps móviles y simulación VR.",
    it: "WillowSoft progetta prodotti connessi, dall'hardware embedded e firmware ad API backend, PostgreSQL, dashboard, app mobili e simulazioni VR.",
    ar: "تطوّر WillowSoft منتجات متصلة من العتاد المدمج والبرمجيات الثابتة إلى واجهات API الخلفية وPostgreSQL ولوحات التحكم وتطبيقات الجوال ومحاكاة الواقع الافتراضي.",
    ja: "WillowSoft は、組み込みハードウェアとファームウェアから、バックエンド API、PostgreSQL、ダッシュボード、モバイルアプリ、VR シミュレーションまで、コネクテッド製品を一貫して設計します。",
  },
  products: {
    en: "WillowSoft's product catalog focuses on LoRaWAN modules, environmental sensors, tracking devices and industrial interfaces that can be delivered as standalone hardware or as part of a complete IoT platform.",
    tr: "WillowSoft ürün kataloğu; LoRaWAN modülleri, çevresel sensörler, takip cihazları ve endüstriyel arayüzleri tekil donanım veya eksiksiz IoT platformu parçası olarak sunar.",
    de: "Der WillowSoft-Produktkatalog umfasst LoRaWAN-Module, Umweltsensoren, Tracking-Geräte und Industrieschnittstellen für Einzelgeräte oder vollständige IoT-Plattformen.",
    fr: "Le catalogue WillowSoft regroupe modules LoRaWAN, capteurs environnementaux, dispositifs de suivi et interfaces industrielles pour matériel autonome ou plateforme IoT complète.",
    es: "El catálogo de WillowSoft reúne módulos LoRaWAN, sensores ambientales, dispositivos de seguimiento e interfaces industriales para hardware independiente o plataformas IoT completas.",
    it: "Il catalogo WillowSoft include moduli LoRaWAN, sensori ambientali, dispositivi di tracciamento e interfacce industriali per hardware standalone o piattaforme IoT complete.",
    ar: "يركز كتالوج WillowSoft على وحدات LoRaWAN والمستشعرات البيئية وأجهزة التتبع والواجهات الصناعية كعتاد مستقل أو ضمن منصة إنترنت أشياء متكاملة.",
    ja: "WillowSoft の製品カタログは、LoRaWAN モジュール、環境センサー、追跡デバイス、産業用インターフェースを、単体ハードウェアまたは統合 IoT プラットフォームの一部として提供します。",
  },
  services: {
    en: "WillowSoft delivers connected-product engineering across hardware, firmware, RF/LoRaWAN, backend APIs, PostgreSQL, web dashboards, mobile apps and VR simulation.",
    tr: "WillowSoft; donanım, firmware, RF/LoRaWAN, backend API, PostgreSQL, web paneli, mobil uygulama ve VR simülasyon katmanlarında IoT mühendisliği sunar.",
  },
  solutions: {
    en: "WillowSoft builds industry IoT solutions for industrial monitoring, smart infrastructure, energy, logistics, healthcare and field telemetry by combining devices, connectivity and software.",
    tr: "WillowSoft; cihaz, bağlantı ve yazılımı birleştirerek endüstriyel izleme, akıllı altyapı, enerji, lojistik, sağlık ve saha telemetrisi için IoT çözümleri kurar.",
  },
  contact: {
    en: "Use the WillowSoft contact page for engineering inquiries, office information, supplier communication, NDAs and discovery calls for connected product projects.",
    tr: "WillowSoft iletişim sayfası; mühendislik talepleri, ofis bilgileri, tedarikçi iletişimi, gizlilik sözleşmeleri ve IoT proje keşif görüşmeleri için kullanılır.",
  },
  startProject: {
    en: "The Start Project form collects product idea, required layers, timeline, budget and contact details so WillowSoft can prepare a practical engineering discovery plan.",
    tr: "Projeye Başla formu; ürün fikri, gerekli katmanlar, takvim, bütçe ve iletişim bilgilerini toplayarak WillowSoft'un gerçekçi mühendislik keşif planı hazırlamasını sağlar.",
  },
};

const FAQ_FALLBACKS: Record<string, Partial<Record<Locale, AiFaqItem[]>>> = {
  home: {
    en: [
      { question: "What does WillowSoft do?", answer: "WillowSoft delivers ready-made industrial IoT solutions, builds custom hardware and software from scratch, and implements cloud platforms that process field data." },
      { question: "Which product development stages can WillowSoft handle?", answer: "From schematic design to PCB production, embedded firmware, cloud APIs and user interfaces — WillowSoft completes every layer under one roof." },
      { question: "Who is WillowSoft the right solution partner for?", answer: "Businesses that want a complete, fast, market-ready system from a single partner instead of splitting hardware and software across multiple vendors." },
    ],
    tr: [
      { question: "WillowSoft ne yapar?", answer: "Endüstriyel ihtiyaçlara yönelik hazır IoT çözümleri sunar, sıfırdan özel donanım/yazılım geliştirir ve sahadaki veriyi işleyen bulut platformları kurar." },
      { question: "Ürün geliştirme sürecinin hangi aşamaları yapılabilir?", answer: "Şematik tasarımdan PCB üretimine, gömülü yazılımdan bulut API'lerine ve kullanıcı arayüzlerine kadar tüm katmanları tek çatı altında tamamlıyoruz." },
      { question: "WillowSoft kimler için doğru çözüm ortağıdır?", answer: "Donanım ve yazılım süreçlerini farklı yüklenicilere bölmek yerine tüm sistemi tek bir çözüm ortağından eksiksiz, hızlı ve pazara hazır şekilde teslim almak isteyen işletmeler için uygundur." },
    ],
  },
  products: {
    en: [
      { question: "Which WillowSoft product should I choose?", answer: "Choose modules for custom device builds, environmental sensors for telemetry, tracking devices for event and asset state, and industrial interfaces for Modbus or machine data integration." },
      { question: "Can WillowSoft products be integrated with dashboards and APIs?", answer: "Yes. WillowSoft products can be paired with firmware, LoRaWAN payload design, backend ingestion, PostgreSQL schemas, dashboards, alerts and mobile workflows." },
      { question: "Are WillowSoft products only hardware?", answer: "No. They can be evaluated as hardware products or as part of a complete connected-product stack that includes software, cloud, database and operator interfaces." },
    ],
    tr: [
      { question: "Hangi WillowSoft ürünü seçilmeli?", answer: "Özel cihaz geliştirme için modüller, telemetri için çevresel sensörler, olay ve varlık durumu için takip cihazları, Modbus veya makine verisi entegrasyonu için endüstriyel arayüzler seçilir." },
      { question: "WillowSoft ürünleri dashboard ve API ile entegre edilebilir mi?", answer: "Evet. WillowSoft ürünleri firmware, LoRaWAN payload tasarımı, backend veri alımı, PostgreSQL şeması, dashboard, alarm ve mobil iş akışlarıyla birlikte çalışabilir." },
      { question: "WillowSoft ürünleri sadece donanım mı?", answer: "Hayır. Ürünler yalnızca donanım olarak veya yazılım, bulut, veritabanı ve operatör arayüzlerini kapsayan eksiksiz bir IoT yığını içinde değerlendirilebilir." },
    ],
  },
};

export function stripHtml(value: string): string {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function aiAnswerForPage(content: any, pageKey: string, locale: Locale, fallback = ""): string {
  const seo = content.pageSeo?.[pageKey]?.[locale] || {};
  const englishSeo = content.pageSeo?.[pageKey]?.en || {};
  return stripHtml(
    seo.aiShortAnswer ||
      englishSeo.aiShortAnswer ||
      localizedValue(AI_SHORT_FALLBACKS[pageKey], locale) ||
      fallback,
  );
}

export function aiMetaForPage(content: any, pageKey: string, locale: Locale): AiAnswerMeta {
  const seo = content.pageSeo?.[pageKey]?.[locale] || {};
  const englishSeo = content.pageSeo?.[pageKey]?.en || {};
  return {
    updatedAt: seo.lastUpdated || englishSeo.lastUpdated || content.meta?.updatedAt?.slice?.(0, 10),
    reviewedBy: seo.expertReviewedBy || englishSeo.expertReviewedBy || REVIEWED_BY[locale],
    sourceLabel: SOURCE_LABEL[locale],
  };
}

export function fallbackFaqsForPage(pageKey: string, locale: Locale): AiFaqItem[] {
  return FAQ_FALLBACKS[pageKey]?.[locale] || FAQ_FALLBACKS[pageKey]?.en || [];
}

export function faqItemsForPage(
  faqs: any[],
  pageKey: string,
  locale: Locale,
  fallbackItems: AiFaqItem[] = [],
  limit = 6,
): AiFaqItem[] {
  const cmsFaqs = (faqs || [])
    .filter((faq: any) => faq.page === pageKey)
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((faq: any) => ({
      question: stripHtml(faq.localized?.[locale]?.question || faq.question || ""),
      answer: stripHtml(faq.localized?.[locale]?.answer || faq.answer || ""),
    }))
    .filter((faq) => faq.question && faq.answer);

  return [...cmsFaqs, ...fallbackItems]
    .filter((faq, index, list) => list.findIndex((item) => item.question === faq.question) === index)
    .slice(0, limit);
}

export function faqSchemaNode(canonical: string, faqItems: AiFaqItem[]) {
  if (!faqItems.length) return null;
  return {
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function appendSchemaNodes(schema: any, nodes: any[]) {
  const validNodes = nodes.filter(Boolean);
  if (!validNodes.length) return schema;

  if (schema?.["@graph"]) {
    return { ...schema, "@graph": [...schema["@graph"], ...validNodes] };
  }

  if (schema?.["@context"]) {
    return { "@context": schema["@context"], "@graph": [schema, ...validNodes] };
  }

  return schema;
}
