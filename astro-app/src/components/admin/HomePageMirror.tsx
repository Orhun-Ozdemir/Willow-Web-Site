"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { flowNodesFromPageContent, industryLanesFromPageContent, localizeItem, pageButtonLabel, pageButtonText, pageLocaleHref, serviceRailFromPageContent, type Locale } from "@/lib/cms";
import { resolveAdminImageSrc } from "@/lib/admin-media";
import type { MirrorCard } from "./mirrorShared";

export type { MirrorCard } from "./mirrorShared";

const MIRROR_SCALE = 0.255;
const MIRROR_WIDTH = 1180;

type RailItem = { title: string; desc: string; titleKey: string; descKey: string; index: number };

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function locVal(data: Record<string, any>, key: string, locale: Locale) {
  return (data[key]?.[locale] || data[key]?.en || "").trim();
}

function buildServiceRail(data: Record<string, any>, locale: Locale): RailItem[] {
  const cms = serviceRailFromPageContent(data, locale);
  if (cms.length > 0) {
    return cms.map((item, index) => ({
      title: item.title,
      desc: item.desc,
      titleKey: `serviceRail_${index}_title`,
      descKey: `serviceRail_${index}_desc`,
      index,
    }));
  }
  return [0, 1, 2, 3].map((i) => ({
    title: `Kart ${i + 1}`,
    desc: "",
    titleKey: `serviceRail_${i}_title`,
    descKey: `serviceRail_${i}_desc`,
    index: i,
  }));
}

const INDUSTRY_ICONS = ["🏙️", "⚙️", "🩺", "📦"];

function buildIndustryLanes(data: Record<string, any>, locale: Locale): RailItem[] {
  const cms = industryLanesFromPageContent(data, locale);
  if (cms.length > 0) {
    return cms.map((item, index) => ({
      title: item.title,
      desc: item.desc,
      titleKey: `industryLane_${index}_title`,
      descKey: `industryLane_${index}_desc`,
      index,
    }));
  }
  return [0, 1, 2, 3].map((i) => ({
    title: `Sektör ${i + 1}`,
    desc: "",
    titleKey: `industryLane_${i}_title`,
    descKey: `industryLane_${i}_desc`,
    index: i,
  }));
}
function buildFlowNodes(data: Record<string, any>, locale: Locale): RailItem[] {
  const cms = flowNodesFromPageContent(data, locale);
  if (cms.length > 0) {
    return cms.map((item, index) => ({
      title: item.title,
      desc: item.desc,
      titleKey: `flowNode_${index}_title`,
      descKey: `flowNode_${index}_desc`,
      index,
    }));
  }
  return [0, 1, 2, 3, 4].map((i) => ({
    title: `Katman ${i + 1}`,
    desc: "",
    titleKey: `flowNode_${i}_title`,
    descKey: `flowNode_${i}_desc`,
    index: i,
  }));
}

function Hit({
  id, active, onClick, className, children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`ws-pc-mirror-hit ${active ? "is-active" : ""} ${className || ""}`}
      data-block={id}
    >
      {children}
    </div>
  );
}

const TRUST_CHIPS: Record<string, string>[] = [
  { en: "Industrial Automation", tr: "Endüstriyel Otomasyon", de: "Industrieautomation" },
  { en: "MedTech", tr: "MedTech" },
  { en: "Energy", tr: "Enerji", de: "Energie" },
  { en: "Telecom", tr: "Telekom" },
  { en: "Smart Logistics", tr: "Akıllı Lojistik" },
];

const HOME_UI: Record<string, Record<string, string>> = {
  viewProducts: { tr: "Ürünlere Göz At", en: "Browse Products" },
  viewNews: { tr: "Haberleri Görüntüle", en: "View News" },
  talkEngineering: { tr: "Mühendislerimizle Görüşün", en: "Talk to Engineering" },
  startProject: { tr: "Projeye Başla", en: "Start Your Project" },
  exploreServices: { tr: "Hizmetleri Keşfet", en: "Explore Services" },
};

function uiLabel(key: string, locale: Locale) {
  return HOME_UI[key]?.[locale] || HOME_UI[key]?.en || key;
}

function chipText(chip: Record<string, string>, locale: Locale) {
  return chip[locale] || chip.en || "Sektör";
}

export default function HomePageMirror({
  data,
  locale,
  companyFacts = {},
  clients = [],
  products = [],
  news = [],
  faqs = [],
  activeBlockId,
  activeCard,
  onSelectBlock,
  onSelectCard,
}: {
  data: Record<string, any>;
  locale: Locale;
  companyFacts?: Record<string, any>;
  clients?: any[];
  products?: any[];
  news?: any[];
  faqs?: any[];
  activeBlockId: string | null;
  activeCard: MirrorCard | null;
  onSelectBlock: (id: string) => void;
  onSelectCard: (blockId: string, card: MirrorCard) => void;
}) {
  const v = (key: string) => locVal(data, key, locale);
  const html = (key: string) => locVal(data, key, locale);
  const serviceRail = buildServiceRail(data, locale);
  const flowNodes = buildFlowNodes(data, locale);
  const industryLanes = buildIndustryLanes(data, locale);
  const proofLabels = {
    products: locale === "tr" ? "Teslim Edilen Proje" : "Delivered projects",
    clients: locale === "tr" ? "Kurumsal Müşteri" : "Enterprise clients",
    founded: locale === "tr" ? "Kuruluş" : "Founded",
  };

  const heroCtaLabel = pageButtonText(data.heroCta, locale, pageButtonLabel(data.heroCta, locale) || v("heroCta") || uiLabel("startProject", locale));
  const heroCtaSecondaryLabel = pageButtonText(data.heroCtaSecondary, locale, pageButtonLabel(data.heroCtaSecondary, locale) || v("heroCtaSecondary") || uiLabel("exploreServices", locale));
  const heroCtaHref = pageLocaleHref(locale, data.heroCta, "/start-project");
  const heroCtaSecondaryHref = pageLocaleHref(locale, data.heroCtaSecondary, "/solutions");
  const ctaCtaLabel = pageButtonText(data.ctaCta, locale, v("ctaCta") || uiLabel("talkEngineering", locale));
  const ctaCtaHref = pageLocaleHref(locale, data.ctaCta, "/contact");
  const productsBtnLabel = uiLabel("viewProducts", locale);
  const newsBtnLabel = uiLabel("viewNews", locale);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const latestNews = news.slice(0, 3);
  const featuredClients = clients
    .filter((c) => c.featured)
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .slice(0, 6);
  const homeFaqs = faqs.filter((f) => !f.page || f.page === "home").slice(0, 5);

  const cardActive = (titleKey: string) => activeCard?.titleKey === titleKey;

  const innerRef = useRef<HTMLDivElement>(null);
  const [shellHeight, setShellHeight] = useState(0);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const update = () => setShellHeight(el.offsetHeight * MIRROR_SCALE);

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, locale]);

  return (
    <div className="ws-pc-mirror-viewport">
      <div
        className="ws-pc-mirror-shell"
        style={{ width: MIRROR_WIDTH * MIRROR_SCALE, height: shellHeight || undefined }}
      >
        <div
          ref={innerRef}
          className="ws-pc-mirror"
          style={{
            width: MIRROR_WIDTH,
            transform: `scale(${MIRROR_SCALE})`,
            transformOrigin: "top left",
          }}
        >
        <main id="mirror-main">
          {/* Hero */}
          <Hit id="hero" active={activeBlockId === "hero"} onClick={() => onSelectBlock("hero")}>
            <section className="hero motion-hero">
              <div className="hero-inner hero-layout">
                <div className="hero-copy">
                  {v("heroEyebrow") && <p className="eyebrow">{v("heroEyebrow")}</p>}
                  <h1 dangerouslySetInnerHTML={{ __html: html("heroTitle") || "Hero başlığı" }} />
                  {v("heroLead") && <p>{v("heroLead")}</p>}
                  <div className="hero-ctas">
                    <span className="btn btn-primary" title={heroCtaHref}>{heroCtaLabel}</span>
                    <span className="btn btn-secondary" title={heroCtaSecondaryHref}>{heroCtaSecondaryLabel}</span>
                  </div>
                  <div className="hero-proof">
                    <div className="proof-item"><strong>{companyFacts.productsOnMarket || "100+"}</strong><span>{proofLabels.products}</span></div>
                    <div className="proof-item"><strong>{companyFacts.happyClients || "41+"}</strong><span>{proofLabels.clients}</span></div>
                    <div className="proof-item"><strong>{companyFacts.founded || "2020"}</strong><span>{proofLabels.founded}</span></div>
                  </div>
                </div>
                <aside className="hero-product-stage" aria-hidden="true">
                  <div className="product-spotlight" />
                  <article className="floating-product product-one"><figure /><div><strong>WillowBee</strong><span>LoRaWAN</span></div></article>
                  <article className="floating-product product-two"><figure /><div><strong>WillowAir</strong><span>Air quality</span></div></article>
                  <article className="floating-product product-three"><figure /><div><strong>WillowMod</strong><span>Modbus</span></div></article>
                </aside>
              </div>
            </section>
          </Hit>

          {/* Service Rail */}
          <Hit id="serviceRail" active={activeBlockId === "serviceRail"} onClick={() => onSelectBlock("serviceRail")}>
            <section className="section tight">
              <div className="section-inner">
                <div className="service-rail">
                  {serviceRail.map((item) => (
                    <article
                      key={item.titleKey}
                      className={cardActive(item.titleKey) ? "mirror-card-active" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCard("serviceRail", { titleKey: item.titleKey, descKey: item.descKey, index: item.index });
                      }}
                    >
                      <span className="service-number">{String(item.index + 1).padStart(2, "0")}</span>
                      <h3>{item.title || "—"}</h3>
                      <p>{item.desc || "—"}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </Hit>

          {/* Trust */}
          <Hit id="trust" active={activeBlockId === "trust"} onClick={() => onSelectBlock("trust")}>
            <section className="trust-showcase">
              <div className="section-inner trust-layout">
                <div className="trust-copy">
                  {v("trustEyebrow") && <p className="eyebrow">{v("trustEyebrow")}</p>}
                  <h2 dangerouslySetInnerHTML={{ __html: html("trustTitle") || "Güven bölümü" }} />
                  {v("trustLead") && <p>{v("trustLead")}</p>}
                  <div className="trust-more">
                    {TRUST_CHIPS.slice(0, 3).map((chip, i) => (
                      <span key={i}>{chipText(chip, locale)}</span>
                    ))}
                  </div>
                </div>
                <div className="trust-stage">
                  <div className="logo-cloud">
                    {(featuredClients.length ? featuredClients : [0, 1, 2, 3, 4, 5]).map((item: any, i: number) => (
                      <div key={item.id || i} className="logo-tile">
                        {item.logo || item.image ? (
                          <img src={resolveAdminImageSrc(item.logo || item.image)} alt={item.name || ""} className="max-h-8 object-contain mx-auto" />
                        ) : (
                          <span className="ws-pc-mirror-logo-ph" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </Hit>

          {/* Ecosystem */}
          <Hit id="ecosystem" active={activeBlockId === "ecosystem"} onClick={() => onSelectBlock("ecosystem")}>
            <section className="section dark ecosystem-section">
              <div className="section-inner">
                <div className="section-head center">
                  {v("ecosystemEyebrow") && <p className="eyebrow">{v("ecosystemEyebrow")}</p>}
                  <h2 dangerouslySetInnerHTML={{ __html: html("ecosystemTitle") || "Ekosistem" }} />
                  <p className="section-lead">{v("ecosystemLead") || "Her katman bir sonrakiyle planlanır…"}</p>
                </div>
                <div className="tech-flow">
                  <div className="flow-row">
                    {flowNodes.map((node) => (
                      <div
                        key={node.titleKey}
                        className={`flow-node ${cardActive(node.titleKey) ? "mirror-card-active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCard("ecosystem", { titleKey: node.titleKey, descKey: node.descKey, index: node.index });
                        }}
                      >
                        <small>{String(node.index + 1).padStart(2, "0")}</small>
                        <strong>{node.title || "—"}</strong>
                        <span>{node.desc || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </Hit>

          {/* Products */}
          <Hit id="products" active={activeBlockId === "products"} onClick={() => onSelectBlock("products")}>
            <section className="section home-products">
              <div className="section-inner">
                <div className="section-head product-headline">
                  <div>
                    {v("productsEyebrow") && <p className="eyebrow">{v("productsEyebrow")}</p>}
                    <h2 dangerouslySetInnerHTML={{ __html: html("productsTitle") || "Ürünler" }} />
                  </div>
                  <span className="btn btn-secondary btn-small" title={`/${locale}/products`}>{productsBtnLabel}</span>
                </div>
                <div className="grid grid-4 ws-pc-mirror-product-grid">
                  {(featuredProducts.length ? featuredProducts : [0, 1, 2, 3]).map((item: any, i: number) => {
                    if (typeof item === "number") {
                      return <div key={i} className="ws-pc-mirror-ph-card" />;
                    }
                    const p = localizeItem(item, locale);
                    const img = resolveAdminImageSrc(p?.image || p?.heroImage);
                    return (
                      <article key={p?.id || i} className="ws-pc-mirror-ph-card p-3 flex flex-col gap-2">
                        {img ? <img src={img} alt="" className="h-16 object-contain" /> : null}
                        <strong className="text-[10px] line-clamp-2">{p?.name || p?.title || "Ürün"}</strong>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </Hit>

          {/* Industries */}
          <Hit id="industries" active={activeBlockId === "industries"} onClick={() => onSelectBlock("industries")}>
            <section className="section soft industries-section">
              <div className="section-inner">
                <div className="section-head center">
                  {v("industriesEyebrow") && <p className="eyebrow">{v("industriesEyebrow")}</p>}
                  <h2 dangerouslySetInnerHTML={{ __html: html("industriesTitle") || "Sektörler" }} />
                </div>
                <div className="industry-lanes">
                  {industryLanes.map((lane, i) => (
                    <article
                      key={lane.titleKey}
                      className={`industry-lane ${cardActive(lane.titleKey) ? "mirror-card-active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCard("industries", { titleKey: lane.titleKey, descKey: lane.descKey, index: lane.index });
                      }}
                    >
                      <div className="industry-lane-icon">{INDUSTRY_ICONS[i] || "📦"}</div>
                      <h3>{lane.title || "—"}</h3>
                      <p>{lane.desc || "—"}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </Hit>

          {/* News */}
          <Hit id="news" active={activeBlockId === "news"} onClick={() => onSelectBlock("news")}>
            <section className="section proof-section">
              <div className="section-inner">
                <div className="section-head product-headline">
                  <div>
                    {v("newsEyebrow") && <p className="eyebrow">{v("newsEyebrow")}</p>}
                    <h2 dangerouslySetInnerHTML={{ __html: html("newsTitle") || "Haberler" }} />
                  </div>
                  <span className="btn btn-secondary btn-small" title={`/${locale}/news`}>{newsBtnLabel}</span>
                </div>
                <div className="grid grid-3 ws-pc-mirror-news-grid">
                  {(latestNews.length ? latestNews : [0, 1, 2]).map((item: any, i: number) => {
                    if (typeof item === "number") {
                      return <div key={i} className="ws-pc-mirror-ph-card tall" />;
                    }
                    const n = localizeItem(item, locale);
                    const img = resolveAdminImageSrc(n?.image || n?.heroImage);
                    return (
                      <article key={n?.id || i} className="ws-pc-mirror-ph-card tall p-3 flex flex-col gap-2">
                        {img ? <img src={img} alt="" className="h-14 object-cover rounded" /> : null}
                        <strong className="text-[10px] line-clamp-2">{n?.title || n?.headline || "Haber"}</strong>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </Hit>

          {/* FAQ */}
          <Hit id="faq" active={activeBlockId === "faq"} onClick={() => onSelectBlock("faq")}>
            <section className="section soft services-faq-section">
              <div className="section-inner">
                <div className="section-head center">
                  {v("faqEyebrow") && <p className="eyebrow">{v("faqEyebrow")}</p>}
                  <h2 className="page-title" dangerouslySetInnerHTML={{ __html: html("faqTitle") || "Merak Edilenler" }} />
                  {v("faqLead") && <p className="section-lead">{v("faqLead")}</p>}
                </div>
                <div className="ws-pc-mirror-faq-list space-y-1">
                  {homeFaqs.length > 0 ? homeFaqs.map((f, i) => {
                    const loc = f.localized?.[locale] || f.localized?.en || {};
                    const q = String(loc.question || f.question || "—").trim();
                    return (
                      <details key={f.id || i} className="bg-white border border-gray-100 rounded px-2 py-1 text-[10px]">
                        <summary className="font-semibold text-[#132175]">{q}</summary>
                      </details>
                    );
                  }) : (
                    <div className="ws-pc-mirror-faq"><span /><span /><span /></div>
                  )}
                </div>
              </div>
            </section>
          </Hit>

          {/* CTA */}
          <Hit id="cta" active={activeBlockId === "cta"} onClick={() => onSelectBlock("cta")}>
            <section className="section dark final-cta">
              <div className="section-inner split">
                <div>
                  {v("ctaEyebrow") && <p className="eyebrow">{v("ctaEyebrow")}</p>}
                  <h2 className="page-title" dangerouslySetInnerHTML={{ __html: html("ctaTitle") || "CTA" }} />
                </div>
                <div>
                  {v("ctaLead") && <p className="section-lead">{v("ctaLead")}</p>}
                  <div className="cta-choice-grid">
                    <span>{v("ctaChoice_0") || "donanım+gömülü yazılım"}</span>
                    <span>{v("ctaChoice_1") || "bulut+veri tabanı"}</span>
                    <span>{v("ctaChoice_2") || "web, mobil, Simülasyon"}</span>
                  </div>
                  <p><span className="btn btn-primary" title={ctaCtaHref}>{ctaCtaLabel}</span></p>
                </div>
              </div>
            </section>
          </Hit>
        </main>
        </div>
      </div>
    </div>
  );
}
