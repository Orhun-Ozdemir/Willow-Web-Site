"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { flowNodesFromPageContent, industryLanesFromPageContent, serviceRailFromPageContent, type Locale } from "@/lib/cms";

const MIRROR_SCALE = 0.255;
const MIRROR_WIDTH = 1180;

export type { MirrorCard } from "./mirrorShared";

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
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className={`ws-pc-mirror-hit ${active ? "is-active" : ""} ${className || ""}`}
      data-block={id}
    >
      {children}
    </div>
  );
}

export default function HomePageMirror({
  data,
  locale,
  activeBlockId,
  activeCard,
  onSelectBlock,
  onSelectCard,
}: {
  data: Record<string, any>;
  locale: Locale;
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
                    <span className="btn btn-primary">CTA</span>
                    <span className="btn btn-secondary">CTA</span>
                  </div>
                  <div className="hero-proof">
                    <div className="proof-item"><strong>12+</strong><span>Ürün</span></div>
                    <div className="proof-item"><strong>40+</strong><span>Müşteri</span></div>
                    <div className="proof-item"><strong>2020</strong><span>Kuruluş</span></div>
                    <div className="proof-item"><strong>3</strong><span>Ofis</span></div>
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
                    <span>Sektör</span><span>Sektör</span><span>Sektör</span>
                  </div>
                </div>
                <div className="trust-stage">
                  <div className="logo-cloud">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="logo-tile"><span className="ws-pc-mirror-logo-ph" /></div>
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
                  <span className="btn btn-secondary btn-small">Ürünler</span>
                </div>
                <div className="grid grid-4 ws-pc-mirror-product-grid">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="ws-pc-mirror-ph-card" />)}
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
                  <span className="btn btn-secondary btn-small">Haberler</span>
                </div>
                <div className="grid grid-3 ws-pc-mirror-news-grid">
                  {[0, 1, 2].map((i) => <div key={i} className="ws-pc-mirror-ph-card tall" />)}
                </div>
              </div>
            </section>
          </Hit>

          {/* FAQ (static) */}
          <section className="section soft services-faq-section">
            <div className="section-inner">
              <div className="section-head center">
                <p className="eyebrow">FAQ</p>
                <h2 className="page-title">WillowSoft FAQ</h2>
              </div>
              <div className="ws-pc-mirror-faq">
                <span /><span /><span />
              </div>
            </div>
          </section>

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
                    <span>Hardware</span><span>Backend</span><span>Mobile</span>
                  </div>
                  <p><span className="btn btn-primary">İletişim</span></p>
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
