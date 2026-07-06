"use client";

import type { Locale } from "@/lib/cms";
import type { PageLayoutBlock } from "./pageLayouts";
import { resolveAdminImageSrc } from "@/lib/admin-media";
import { localizeSolutionItem } from "@/lib/admin-solution";
import {
  Hit,
  MirrorShell,
  PlaceholderGrid,
  SectionHead,
  StaticFaq,
  locItem,
  locVal,
} from "./mirrorShared";
import type { MirrorCard } from "./mirrorShared";

function arrayItems(data: Record<string, any>, key?: string) {
  if (!key) return [];
  const items = data[key];
  return Array.isArray(items) ? items : [];
}

export default function PageMirror({
  pageKey,
  layout,
  data,
  locale,
  activeBlockId,
  activeCard,
  onSelectBlock,
  onSelectCard,
  extraData = {},
}: {
  pageKey: string;
  layout: PageLayoutBlock[];
  data: Record<string, any>;
  locale: Locale;
  activeBlockId: string | null;
  activeCard: MirrorCard | null;
  onSelectBlock: (id: string) => void;
  onSelectCard: (blockId: string, card: MirrorCard) => void;
  extraData?: Record<string, any>;
}) {
  const v = (key: string) => locVal(data, key, locale);
  const cardActive = (titleKey: string) => activeCard?.titleKey === titleKey;
  const solutionsList = Array.isArray(extraData.solutions) ? extraData.solutions : [];

  const renderBlock = (block: PageLayoutBlock) => {
    const active = activeBlockId === block.id;
    const onClick = () => onSelectBlock(block.id);

    switch (block.variant) {
      case "hero-compact-split":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="hero compact products-motion-hero">
              <div className="hero-inner products-hero-grid">
                <div className="products-hero-copy">
                  <SectionHead data={data} locale={locale} fields={block.fields} h1 />
                </div>
                <aside className="product-hero-showcase">
                  <div className="product-showcase-stage" />
                  <div className="product-showcase-copy">
                    <p className="architecture-label">Öne Çıkan</p>
                    <h2>WillowBee</h2>
                  </div>
                </aside>
              </div>
            </section>
          </Hit>
        );

      case "hero-compact-arch":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="hero compact hero-services services-motion-hero">
              <div className="hero-inner services-hero-grid">
                <div className="services-hero-copy">
                  <SectionHead data={data} locale={locale} fields={block.fields} h1 />
                </div>
                <div className="service-architecture">
                  <div className="architecture-deck architecture-deck-simple">
                    <p className="architecture-label">Mimari</p>
                    <h2>Cihaz → Veri → Arayüz</h2>
                    <div className="architecture-flow">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="flow-node-large">
                          <span>0{n}</span>
                          <strong>Katman</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Hit>
        );

      case "hero-minimal":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="hero compact">
              <div className="hero-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} h1 />
              </div>
            </section>
          </Hit>
        );

      case "hero-media":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="hero compact news-proof-hero">
              <div className="hero-media" />
              <div className="hero-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} h1 />
              </div>
            </section>
          </Hit>
        );

      case "solutions-hero": {
        const heroSrc = resolveAdminImageSrc(data.heroImage);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="solutions-hero-premium">
              <div className="solutions-hero-bg mirror-hero-media">
                {heroSrc ? <img src={heroSrc} alt="" loading="lazy" decoding="async" /> : null}
              </div>
              <div className="solutions-hero-overlay" />
              <div className="solutions-hero-inner">
                <div className="solutions-hero-content">
                  <SectionHead data={data} locale={locale} fields={block.fields} h1 />
                  <div className="solutions-hero-actions mirror-btn-row">
                    <span className="btn btn-primary">CTA</span>
                    <span className="btn btn-secondary">CTA</span>
                  </div>
                </div>
                <div className="solutions-hero-panel">
                  <span className="panel-kicker">Katmanlar</span>
                  <div className="solution-stack-list">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n}><strong>0{n}</strong><span>Katman</span></div>
                    ))}
                  </div>
                </div>
                <div className="solutions-hero-metrics">
                  <article>
                    <strong>{data.metric1Value || "15+"}</strong>
                    <span>{locVal(data, "metric1Label", locale) || "Metrik"}</span>
                  </article>
                  <article>
                    <strong>{data.metric2Value || "2020"}</strong>
                    <span>{locVal(data, "metric2Label", locale) || "Metrik"}</span>
                  </article>
                  <article>
                    <strong>{data.metric3Value || "24/7"}</strong>
                    <span>{locVal(data, "metric3Label", locale) || "Metrik"}</span>
                  </article>
                </div>
              </div>
            </section>
          </Hit>
        );
      }

      case "start-hero":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="hero compact start-project-hero">
              <div className="hero-inner start-hero-grid">
                <div className="start-hero-copy">
                  <SectionHead data={data} locale={locale} fields={block.fields} h1 />
                </div>
                <aside className="brief-overview-card">
                  <p className="architecture-label">Özet</p>
                  <h2>Keşif planı</h2>
                </aside>
              </div>
            </section>
          </Hit>
        );

      case "company-hero":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <div className="company-hero-c" style={{ background: "var(--ws-navy-950)", padding: "48px 0" }}>
              <div className="hero-inner-c">
                <p className="eyebrow" style={{ color: "var(--ws-teal)" }}>Hakkımızda</p>
                <h1 style={{ color: "#fff", fontSize: "2.4rem", margin: 0 }}>Smart Teams.</h1>
              </div>
            </div>
          </Hit>
        );

      case "static-proof":
        return (
          <section className="section product-proof-section">
            <div className="section-inner">
              <div className="product-proof-grid">
                {[0, 1, 2, 3].map((i) => (
                  <article key={i} className="proof-stat-card">
                    <span>Metrik</span>
                    <strong>—</strong>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );

      case "catalog":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section soft product-catalog-section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} />
                <PlaceholderGrid {...(block.placeholder ?? { count: 4 })} />
              </div>
            </section>
          </Hit>
        );

      case "use-cases": {
        const sorted = [...solutionsList].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
        const cards = sorted.length ? sorted.slice(0, 6) : null;
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section solution-market-section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields?.slice(0, 3)} />
                <div className="solutions-showcase-frame">
                  <div className="solutions-showcase-side">
                    {v("showcaseEyebrow") && <span>{v("showcaseEyebrow")}</span>}
                    <h3 dangerouslySetInnerHTML={{ __html: v("showcaseTitle") || "Vitrin" }} />
                    <p>{v("showcaseLead")}</p>
                  </div>
                  <div className="solution-case-grid mirror-solution-grid">
                    {cards ? cards.map((item: any, idx: number) => {
                      const s = localizeSolutionItem(item, locale);
                      const imgSrc = resolveAdminImageSrc(s?.image);
                      const headline = s?.headline || s?.title || "Çözüm";
                      const bullets = Array.isArray(s?.bullets) ? s.bullets.slice(0, 3) : [];
                      return (
                        <article key={s?.id || idx} className="solution-case-card mirror-solution-card">
                          <figure className="mirror-solution-figure">
                            {imgSrc ? (
                              <img src={imgSrc} alt={s?.alt || headline} loading="lazy" decoding="async" />
                            ) : (
                              <span className="mirror-solution-ph" />
                            )}
                          </figure>
                          <div className="solution-case-body">
                            {s?.category && <span>{s.category}</span>}
                            <h3>{headline}</h3>
                            {s?.summary && <p>{s.summary}</p>}
                            {bullets.length > 0 && (
                              <div className="solution-use-cases">
                                {bullets.map((b: string) => <span key={b}>{b}</span>)}
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    }) : (
                      <PlaceholderGrid count={4} columns={2} />
                    )}
                  </div>
                </div>
              </div>
            </section>
          </Hit>
        );
      }

      case "decision-cards": {
        const items = arrayItems(data, block.arrayKey);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section soft solution-selector-section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} center />
                <div className="solution-decision-grid">
                  {(items.length ? items : [0, 1, 2]).map((item: any, idx: number) => (
                    <article key={idx} className="solution-decision-card">
                      <div className="decision-icon">{String(idx + 1).padStart(2, "0")}</div>
                      <h3>{locItem(data, item, "title", locale) || `Kart ${idx + 1}`}</h3>
                      <p>{locItem(data, item, "body", locale)}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </Hit>
        );
      }

      case "flow-nodes": {
        const items = arrayItems(data, block.arrayKey);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section dark solutions-architecture-section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} center />
                <div className="tech-flow">
                  <div className="flow-row">
                    {(items.length ? items : [0, 1, 2, 3, 4]).map((item: any, idx: number) => (
                      <div key={idx} className="flow-node">
                        <small>{String(idx + 1).padStart(2, "0")}</small>
                        <strong>{locItem(data, item, "title", locale) || "—"}</strong>
                        <span>{locItem(data, item, "body", locale) || locItem(data, item, "description", locale)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </Hit>
        );
      }

      case "principle-cards": {
        const items = arrayItems(data, block.arrayKey);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section soft solutions-why-section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} />
                <div className="solutions-principle-grid">
                  {(items.length ? items : [0, 1, 2, 3]).map((item: any, idx: number) => (
                    <article key={idx} className="solutions-principle-card">
                      <span>{String(idx + 1).padStart(2, "0")}</span>
                      <h3>{locItem(data, item, "title", locale) || "—"}</h3>
                      <p>{locItem(data, item, "body", locale)}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </Hit>
        );
      }

      case "trusted-logos":
        return (
          <section className="section trusted-by-section">
            <div className="section-inner">
              <div className="trusted-by-row">
                <p className="trusted-by-label">Güvenilen markalar</p>
                <div className="trusted-by-logos">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="trusted-logo"><span className="ws-pc-mirror-logo-ph" /></div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case "service-layers": {
        const items = arrayItems(data, block.arrayKey);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section tight service-capabilities-section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} />
                <div className="service-system-grid">
                  {(items.length ? items : [0, 1, 2, 3]).map((item: any, idx: number) => (
                    <article key={idx} className="system-layer-card">
                      <span className="layer-index">{String(idx + 1).padStart(2, "0")}</span>
                      <h3>{locItem(data, item, "headline", locale) || locItem(data, item, "title", locale) || "—"}</h3>
                      <p>{locItem(data, item, "description", locale)}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </Hit>
        );
      }

      case "deliverables": {
        const items = arrayItems(data, block.arrayKey);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section service-outcomes-section">
              <div className="section-inner">
                <div className="deliverables-split">
                  <SectionHead data={data} locale={locale} fields={block.fields?.slice(0, 3)} />
                  <div className="deliverable-ledger">
                    {(items.length ? items : [0, 1, 2, 3]).map((item: any, idx: number) => (
                      <div key={idx}>
                        <span>{locItem(data, item, "title", locale) || "Teslimat"}</span>
                        <strong>{locItem(data, item, "description", locale)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </Hit>
        );
      }

      case "process-steps": {
        const items = arrayItems(data, block.arrayKey);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section soft process-section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} />
                <div className="process process-premium process-compact">
                  {(items.length ? items : [0, 1, 2, 3]).map((item: any, idx: number) => (
                    <div key={idx} className="process-step">
                      <div className="step-dot">{idx + 1}</div>
                      <article className="card process-card">
                        <h3>{locItem(data, item, "title", locale) || "Adım"}</h3>
                        <p>{locItem(data, item, "description", locale)}</p>
                      </article>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </Hit>
        );
      }

      case "services-cta":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section soft services-cta-section">
              <div className="section-inner">
                <div className="services-cta-block">
                  <div className="services-cta-content">
                    <SectionHead data={data} locale={locale} fields={block.fields?.slice(0, 3)} />
                  </div>
                  <div className="services-cta-actions">
                    <span className="btn btn-primary">CTA</span>
                    <span className="btn btn-secondary">CTA</span>
                  </div>
                </div>
              </div>
            </section>
          </Hit>
        );

      case "split-cta":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className={`section ${pageKey === "solutions" ? "solutions-final-cta-section" : "dark final-cta"}`}>
              <div className={pageKey === "solutions" ? "section-inner" : "section-inner split"}>
                <div className={pageKey === "solutions" ? "solutions-final-cta" : undefined}>
                  <div>
                    <SectionHead data={data} locale={locale} fields={block.fields?.slice(0, 3)} />
                  </div>
                  {pageKey === "solutions" ? (
                    <span className="btn btn-primary">{v("finalCtaButton") || "CTA"}</span>
                  ) : (
                    <div>
                      {fieldLead(block.fields) && <p className="section-lead">{v(fieldLead(block.fields)!)}</p>}
                      <p><span className="btn btn-primary">CTA</span></p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </Hit>
        );

      case "news-overview":
        return (
          <section className="section news-proof-overview">
            <div className="section-inner">
              <div className="news-proof-strip">
                {[0, 1, 2].map((i) => (
                  <article key={i}><strong>—</strong><span>Özet</span></article>
                ))}
              </div>
              <div className="news-featured-card">
                <figure className="is-empty" />
                <div className="news-featured-copy">
                  <h2>Öne çıkan haber</h2>
                </div>
              </div>
            </div>
          </section>
        );

      case "news-archive":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section news-proof-list-section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} />
                <PlaceholderGrid {...(block.placeholder ?? { count: 6, columns: 3, tall: true })} />
              </div>
            </section>
          </Hit>
        );

      case "contact-split":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section soft">
              <div className="section-inner split">
                <div>
                  <SectionHead data={data} locale={locale} fields={block.fields?.slice(0, 3)} h1 />
                  <div className="office-contact-grid">
                    {[0, 1].map((i) => (
                      <article key={i} className="office-contact-card">
                        <h3>Ofis {i + 1}</h3>
                        <p>İletişim bilgileri</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="ws-pc-mirror-form-ph">Form</div>
              </div>
            </section>
          </Hit>
        );

      case "intake-split":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section soft project-intake-section">
              <div className="section-inner intake-layout">
                <div className="intake-copy">
                  <SectionHead data={data} locale={locale} fields={["realityEyebrow", "realityTitle"]} />
                  <p className="section-lead">{v("formLead")}</p>
                </div>
                <div className="ws-pc-mirror-form-ph">Proje Formu</div>
              </div>
            </section>
          </Hit>
        );

      case "glossary-section":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className={`section ${block.tone === "soft" ? "soft" : ""}`}>
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} />
                <PlaceholderGrid {...(block.placeholder ?? { count: 4, columns: 2 })} />
              </div>
            </section>
          </Hit>
        );

      case "section":
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className={`section ${block.tone === "soft" ? "soft" : ""}`}>
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} />
              </div>
            </section>
          </Hit>
        );

      case "static-faq":
        return <StaticFaq key={block.id} />;

      default:
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} />
              </div>
            </section>
          </Hit>
        );
    }
  };

  return (
    <MirrorShell deps={[pageKey, data, locale, layout, extraData]}>
      <main id={`mirror-main-${pageKey}`}>
        {layout.map((block) => (
          <div key={block.id}>{renderBlock(block)}</div>
        ))}
      </main>
    </MirrorShell>
  );
}

function fieldLead(fields?: string[]) {
  return fields?.find((f) => /Lead$/i.test(f));
}
