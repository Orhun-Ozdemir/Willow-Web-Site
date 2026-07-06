import type { MirrorCard } from "./mirrorShared";

export type PageLayoutBlock = {
  id: string;
  label: string;
  tone: "hero" | "light" | "soft" | "dark" | "cta";
  variant: string;
  fields?: string[];
  cards?: MirrorCard[];
  arrayKey?: string;
  placeholder?: { count: number; columns?: number; tall?: boolean };
  static?: boolean;
};

export const HOME_LAYOUT: PageLayoutBlock[] = [
  { id: "hero", label: "Hero", tone: "hero", variant: "home-hero", fields: ["heroEyebrow", "heroTitle", "heroLead", "heroCta", "heroCtaSecondary"] },
  { id: "serviceRail", label: "Yetenek Kartları", tone: "soft", variant: "home-service-rail", cards: [0, 1, 2, 3].map((i) => ({ index: i, titleKey: `serviceRail_${i}_title`, descKey: `serviceRail_${i}_desc` })) },
  { id: "trust", label: "Güven", tone: "light", variant: "home-trust", fields: ["trustEyebrow", "trustTitle", "trustLead"] },
  { id: "ecosystem", label: "Ekosistem", tone: "dark", variant: "home-ecosystem", fields: ["ecosystemEyebrow", "ecosystemTitle", "ecosystemLead"], cards: [0, 1, 2, 3, 4].map((i) => ({ index: i, titleKey: `flowNode_${i}_title`, descKey: `flowNode_${i}_desc` })) },
  { id: "products", label: "Ürünler", tone: "light", variant: "home-products", fields: ["productsEyebrow", "productsTitle", "productsLead"] },
  { id: "industries", label: "Sektörler", tone: "soft", variant: "home-industries", fields: ["industriesEyebrow", "industriesTitle"], cards: [0, 1, 2, 3].map((i) => ({ index: i, titleKey: `industryLane_${i}_title`, descKey: `industryLane_${i}_desc` })) },
  { id: "news", label: "Haberler", tone: "light", variant: "home-news", fields: ["newsEyebrow", "newsTitle"] },
  { id: "faq", label: "SSS", tone: "soft", variant: "home-faq", fields: ["faqEyebrow", "faqTitle", "faqLead"] },
  { id: "cta", label: "CTA", tone: "cta", variant: "home-cta", fields: ["ctaEyebrow", "ctaTitle", "ctaLead", "ctaChoice_0", "ctaChoice_1", "ctaChoice_2", "ctaCta"] },
];

export const PRODUCTS_LAYOUT: PageLayoutBlock[] = [
  { id: "hero", label: "Hero", tone: "hero", variant: "hero-compact-split", fields: ["heroEyebrow", "heroTitle", "heroLead"] },
  { id: "proof", label: "Kanıt", tone: "light", variant: "static-proof", static: true },
  { id: "catalog", label: "Katalog", tone: "soft", variant: "catalog", fields: ["catalogEyebrow", "catalogTitle"], placeholder: { count: 8, columns: 4 } },
  { id: "faq", label: "SSS", tone: "soft", variant: "static-faq", static: true },
];

export const SOLUTIONS_LAYOUT: PageLayoutBlock[] = [
  { id: "hero", label: "Hero", tone: "hero", variant: "solutions-hero", fields: ["heroEyebrow", "heroTitle", "heroLead", "heroImage", "metric1Value", "metric1Label", "metric2Value", "metric2Label", "metric3Value", "metric3Label"] },
  { id: "selector", label: "Yol Seçici", tone: "soft", variant: "decision-cards", fields: ["selectorEyebrow", "selectorTitle", "selectorLead"], arrayKey: "selectorCards" },
  { id: "useCases", label: "Kullanım Alanları", tone: "light", variant: "use-cases", fields: ["useCasesEyebrow", "useCasesTitle", "useCasesLead", "showcaseEyebrow", "showcaseTitle", "showcaseLead"], placeholder: { count: 6, columns: 3 } },
  { id: "how", label: "Nasıl Çalışır", tone: "dark", variant: "flow-nodes", fields: ["howEyebrow", "howTitle", "howLead"], arrayKey: "howItWorksSteps" },
  { id: "why", label: "Neden Biz", tone: "soft", variant: "principle-cards", fields: ["whyEyebrow", "whyTitle"], arrayKey: "whyCards" },
  { id: "finalCta", label: "CTA", tone: "cta", variant: "split-cta", fields: ["finalCtaEyebrow", "finalCtaTitle", "finalCtaLead", "finalCtaButton"] },
  { id: "faq", label: "SSS", tone: "soft", variant: "static-faq", static: true },
];

export const SERVICES_LAYOUT: PageLayoutBlock[] = [
  { id: "hero", label: "Hero", tone: "hero", variant: "hero-compact-arch", fields: ["heroEyebrow", "heroTitle", "heroLead"] },
  { id: "trust", label: "Güven", tone: "light", variant: "trusted-logos", static: true },
  { id: "layers", label: "Hizmet Katmanları", tone: "light", variant: "service-layers", fields: ["serviceSystemEyebrow", "serviceSystemTitle", "serviceSystemLead"], arrayKey: "serviceLayers" },
  { id: "deliverables", label: "Teslimatlar", tone: "light", variant: "deliverables", fields: ["deliverablesEyebrow", "deliverablesTitle", "deliverablesLead", "handoffTitle", "handoffDesc"], arrayKey: "deliverables" },
  { id: "process", label: "Süreç", tone: "soft", variant: "process-steps", fields: ["processEyebrow", "processTitle"], arrayKey: "processSteps" },
  { id: "cta", label: "CTA", tone: "cta", variant: "services-cta", fields: ["ctaEyebrow", "ctaTitle", "ctaLead", "ctaPrimaryButton", "ctaSecondaryButton"] },
  { id: "faq", label: "SSS", tone: "soft", variant: "static-faq", static: true },
];

export const NEWS_LAYOUT: PageLayoutBlock[] = [
  { id: "hero", label: "Hero", tone: "hero", variant: "hero-media", fields: ["heroEyebrow", "heroTitle", "heroLead"] },
  { id: "overview", label: "Özet", tone: "light", variant: "news-overview", static: true },
  { id: "archive", label: "Arşiv", tone: "light", variant: "news-archive", fields: ["latestEyebrow", "latestTitle"], placeholder: { count: 6, columns: 3, tall: true } },
  { id: "cta", label: "CTA", tone: "dark", variant: "split-cta", fields: ["pipelineEyebrow", "pipelineTitle", "pipelineLead"] },
];

export const COMPANY_LAYOUT: PageLayoutBlock[] = [
  { id: "hero", label: "Hero", tone: "hero", variant: "company-hero", static: true },
  { id: "intro", label: "Giriş", tone: "light", variant: "section", fields: ["introEyebrow", "introTitle", "introLead"] },
  { id: "principles", label: "İlkeler", tone: "light", variant: "section", fields: ["principlesEyebrow", "principlesTitle"] },
  { id: "history", label: "Tarihçe", tone: "soft", variant: "section", fields: ["historyEyebrow", "historyTitle"] },
  { id: "workWith", label: "İş Ortakları", tone: "light", variant: "section", fields: ["workWithEyebrow", "workWithTitle"] },
  { id: "cta", label: "CTA", tone: "cta", variant: "split-cta", fields: ["ctaEyebrow", "ctaTitle", "ctaLead"] },
];

export const CONTACT_LAYOUT: PageLayoutBlock[] = [
  { id: "hero", label: "İletişim", tone: "soft", variant: "contact-split", fields: ["heroEyebrow", "heroTitle", "heroLead", "directTitle", "directLead"] },
  { id: "faq", label: "SSS", tone: "soft", variant: "static-faq", static: true },
];

export const START_PROJECT_LAYOUT: PageLayoutBlock[] = [
  { id: "hero", label: "Hero", tone: "hero", variant: "start-hero", fields: ["heroEyebrow", "heroTitle", "heroLead"] },
  { id: "intake", label: "Form", tone: "soft", variant: "intake-split", fields: ["realityEyebrow", "realityTitle", "formEyebrow", "formTitle", "formLead", "afterSubmission"] },
  { id: "paths", label: "Süreç", tone: "soft", variant: "process-steps", fields: ["pathsEyebrow", "pathsTitle", "pathsLead"] },
  { id: "faq", label: "SSS", tone: "soft", variant: "static-faq", static: true },
];

export const GLOSSARY_LAYOUT: PageLayoutBlock[] = [
  { id: "hero", label: "Hero", tone: "hero", variant: "hero-minimal", fields: ["heroEyebrow", "heroTitle", "heroLead"] },
  { id: "connectivity", label: "Bağlantı", tone: "light", variant: "glossary-section", fields: ["connectivityEyebrow", "connectivityTitle"], placeholder: { count: 4, columns: 2 } },
  { id: "devices", label: "Cihazlar", tone: "soft", variant: "glossary-section", fields: ["devicesEyebrow", "devicesTitle"], placeholder: { count: 4, columns: 2 } },
  { id: "software", label: "Yazılım", tone: "light", variant: "glossary-section", fields: ["softwareEyebrow", "softwareTitle"], placeholder: { count: 4, columns: 2 } },
];

export const PAGE_LAYOUTS: Record<string, PageLayoutBlock[]> = {
  home: HOME_LAYOUT,
  products: PRODUCTS_LAYOUT,
  solutions: SOLUTIONS_LAYOUT,
  services: SERVICES_LAYOUT,
  news: NEWS_LAYOUT,
  company: COMPANY_LAYOUT,
  contact: CONTACT_LAYOUT,
  startProject: START_PROJECT_LAYOUT,
  glossary: GLOSSARY_LAYOUT,
};

export const HOME_EXTRA_KEYS = [
  ...[0, 1, 2, 3].flatMap((i) => [`serviceRail_${i}_title`, `serviceRail_${i}_desc`]),
  ...[0, 1, 2, 3, 4].flatMap((i) => [`flowNode_${i}_title`, `flowNode_${i}_desc`]),
  ...[0, 1, 2, 3].flatMap((i) => [`industryLane_${i}_title`, `industryLane_${i}_desc`]),
];

export function layoutForPage(pageKey: string): PageLayoutBlock[] {
  return PAGE_LAYOUTS[pageKey] ?? [];
}

export function firstEditableBlock(pageKey: string): { blockId: string; field: string | null } {
  const layout = layoutForPage(pageKey);
  const block = layout.find((b) => !b.static && (b.fields?.length || b.cards?.length));
  if (!block) return { blockId: layout[0]?.id ?? "hero", field: null };
  if (block.cards?.length) return { blockId: block.id, field: null };
  return { blockId: block.id, field: block.fields?.[0] ?? null };
}
