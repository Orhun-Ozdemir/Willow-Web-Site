"use client";

import type { Locale } from "@/lib/cms";
import { pageButtonText, pageLocaleHref } from "@/lib/cms";
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
import {
  fallbackDeliverables,
  fallbackProcessSteps,
  fallbackServiceLayers,
} from "@/lib/services-page-fallbacks";

function arrayItems(data: Record<string, any>, key?: string) {
  if (!key) return [];
  const items = data[key];
  return Array.isArray(items) ? items : [];
}

const SERVICES_ARRAY_FALLBACKS: Record<string, readonly any[]> = {
  serviceLayers: fallbackServiceLayers,
  deliverables: fallbackDeliverables,
  processSteps: fallbackProcessSteps,
};

function arrayItemsOrFallback(data: Record<string, any>, key?: string) {
  const items = arrayItems(data, key);
  if (items.length || !key) return { items, usingFallback: false };
  const fallback = SERVICES_ARRAY_FALLBACKS[key];
  return { items: fallback ? [...fallback] : [], usingFallback: Boolean(fallback?.length) };
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
  const companyFacts = extraData.companyFacts || {};
  const pageFaqs = Array.isArray(extraData.faqs) ? extraData.faqs : [];

  const statLabel = (key: string, fallback: string) => {
    const labels: Record<string, Record<string, string>> = {
      productsOnMarket: { tr: "Teslim Edilen Proje", en: "Delivered projects" },
      happyClients: { tr: "Kurumsal Müşteri", en: "Enterprise clients" },
      founded: { tr: "Kuruluş", en: "Founded" },
    };
    return labels[key]?.[locale] || labels[key]?.en || fallback;
  };

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
                  <div className="services-hero-meta">
                    <span className="hero-meta-item">
                      <strong>{companyFacts.productsOnMarket || "100+"}</strong>
                      <span>{statLabel("productsOnMarket", "Teslim Edilen Proje")}</span>
                    </span>
                    <span className="hero-meta-divider" aria-hidden="true" />
                    <span className="hero-meta-item">
                      <strong>{companyFacts.happyClients || "41+"}</strong>
                      <span>{statLabel("happyClients", "Kurumsal Müşteri")}</span>
                    </span>
                    <span className="hero-meta-divider" aria-hidden="true" />
                    <span className="hero-meta-item">
                      <strong>{companyFacts.founded || "2020"}</strong>
                      <span>{statLabel("founded", "Kuruluş")}</span>
                    </span>
                  </div>
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
        const heroPrimary = locale === "tr" ? "Projenizi Planlayın" : "Map your case";
        const heroSecondary = locale === "tr" ? "Cihazları İnceleyin" : "Explore devices";
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <div className="company-hero-c" style={{ background: "#070d19", position: "relative", overflow: "hidden" }}>
              <div className="solutions-hero-inner">
                <div className="solutions-hero-content">
                  <SectionHead data={data} locale={locale} fields={block.fields?.filter((f) => !f.startsWith("metric"))} h1 />
                  <div className="solutions-hero-actions mirror-btn-row">
                    <span className="ws-btn ws-btn-primary" title={`/${locale}/start-project`}>{heroPrimary}</span>
                    <span className="ws-btn ws-btn-ghost" title={`/${locale}/products`}>{heroSecondary}</span>
                  </div>
                </div>
                <div className="solutions-hero-panel">
                  <span className="panel-kicker">{locale === "tr" ? "Katmanlar" : "Stack"}</span>
                  <div className="solution-stack-list">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n}><strong>0{n}</strong><span>{locale === "tr" ? "Katman" : "Layer"}</span></div>
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
            </div>
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
                  <div className="hero-ctas">
                    <span className="btn btn-primary" title="#lead-form">{locale === "tr" ? "Proje özeti oluştur" : "Create project brief"}</span>
                    <span className="btn btn-secondary" title={`/${locale}/contact`}>{locale === "tr" ? "Genel iletişim" : "General contact"}</span>
                  </div>
                  <div className="start-hero-proofline">
                    <span>{locale === "tr" ? "Teknik kapsam" : "Technical scope"}</span>
                    <span>{locale === "tr" ? "Katman planı" : "Layer planning"}</span>
                    <span>{locale === "tr" ? "Mühendislik incelemesi" : "Engineering review"}</span>
                  </div>
                </div>
                <aside className="brief-overview-card">
                  <p className="architecture-label">{locale === "tr" ? "Keşif planı" : "Discovery plan"}</p>
                  <h2>{locale === "tr" ? "Proje özeti" : "Project brief"}</h2>
                  <div className="summary-metrics">
                    <div>
                      <strong>{companyFacts.productsOnMarket || "100+"}</strong>
                      <span>{statLabel("productsOnMarket", "Teslim Edilen Proje")}</span>
                    </div>
                    <div>
                      <strong>{companyFacts.happyClients || "41+"}</strong>
                      <span>{statLabel("happyClients", "Kurumsal Müşteri")}</span>
                    </div>
                    <div>
                      <strong>{companyFacts.founded || "2020"}</strong>
                      <span>{statLabel("founded", "Kuruluş")}</span>
                    </div>
                  </div>
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
                <SectionHead
                  data={data}
                  locale={locale}
                  fields={["heroEyebrow", "heroTitle", "heroLead"]}
                  h1
                />
                {!v("heroTitle") && (
                  <>
                    <p className="eyebrow" style={{ color: "var(--ws-teal)" }}>{locale === "tr" ? "WillowSoft Hakkında" : "About WillowSoft"}</p>
                    <h1 style={{ color: "#fff", fontSize: "2.4rem", margin: 0 }}>
                      {locale === "tr" ? "Akıllı Ekipler. Dayanıklı Sistemler." : "Smart Teams. Resilient Systems."}
                    </h1>
                  </>
                )}
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
        const { items, usingFallback } = arrayItemsOrFallback(data, block.arrayKey);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section tight service-capabilities-section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} />
                {usingFallback && (
                  <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Supabase&apos;te <code className="text-[11px]">serviceLayers</code> boş — canlıdaki şablon kartlar gösteriliyor. Düzenlemek için <strong>Hizmetler Sayfası → Hizmet Kartları → Düzenle</strong>.
                  </p>
                )}
                <div className="service-system-grid">
                  {items.map((item: any, idx: number) => (
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
        const { items, usingFallback } = arrayItemsOrFallback(data, block.arrayKey);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section service-outcomes-section">
              <div className="section-inner">
                <div className="deliverables-split">
                  <SectionHead data={data} locale={locale} fields={block.fields?.slice(0, 3)} />
                  {usingFallback && (
                    <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      Supabase&apos;te <code className="text-[11px]">deliverables</code> boş — şablon teslimat paketleri gösteriliyor. Düzenlemek için <strong>Hizmetler Sayfası → Teslimatlar → Şablonu Supabase&apos;e kaydet</strong>.
                    </p>
                  )}
                  <div className="deliverable-ledger">
                    {items.map((item: any, idx: number) => (
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
        const { items, usingFallback } = arrayItemsOrFallback(data, block.arrayKey);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section soft process-section">
              <div className="section-inner">
                <SectionHead data={data} locale={locale} fields={block.fields} />
                {usingFallback && (
                  <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Supabase&apos;te <code className="text-[11px]">processSteps</code> boş — şablon süreç adımları gösteriliyor. Düzenlemek için <strong>Hizmetler Sayfası → Süreç Adımları → Şablonu Supabase&apos;e kaydet</strong>.
                  </p>
                )}
                <div className="process process-premium process-compact">
                  {items.map((item: any, idx: number) => (
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

      case "services-cta": {
        const ctaPrimary = pageButtonText(data.ctaPrimaryButton, locale, v("ctaPrimaryButton") || "CTA");
        const ctaSecondary = pageButtonText(data.ctaSecondaryButton, locale, v("ctaSecondaryButton") || "CTA");
        const ctaPrimaryHref = pageLocaleHref(locale, data.ctaPrimaryButton, "/contact");
        const ctaSecondaryHref = pageLocaleHref(locale, data.ctaSecondaryButton, "/start-project");
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section soft services-cta-section">
              <div className="section-inner">
                <div className="services-cta-block">
                  <div className="services-cta-content">
                    <SectionHead data={data} locale={locale} fields={block.fields?.slice(0, 3)} />
                  </div>
                  <div className="services-cta-actions">
                    <span className="btn btn-primary" title={ctaPrimaryHref}>{ctaPrimary}</span>
                    <span className="btn btn-secondary" title={ctaSecondaryHref}>{ctaSecondary}</span>
                  </div>
                </div>
              </div>
            </section>
          </Hit>
        );
      }

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

      case "company-team": {
        const teamItems = arrayItems(extraData.companyFacts || {}, block.arrayKey);
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <section className="section soft company-team-section">
              <div className="company-container company-grid-team">
                <div>
                  <SectionHead data={data} locale={locale} fields={block.fields} />
                  <p className="text-xs text-gray-400 mt-3">Üye listesi: Hakkımızda → Ekibimiz sekmesinden düzenlenir.</p>
                </div>
                <div className="company-team-list">
                  {teamItems.length > 0 ? teamItems.map((member: any, idx: number) => {
                    const name = locItem(data, member, "name", locale);
                    const role = locItem(data, member, "role", locale);
                    const bio = locItem(data, member, "bio", locale);
                    return (
                      <div key={member.id || idx} className="ws-card company-team-card">
                        <div className="company-team-body">
                          <b>{name || "—"}</b>
                          <span>{role || ""}</span>
                          <p>{bio || ""}</p>
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-sm text-gray-400">Henüz ekip üyesi eklenmemiş.</p>
                  )}
                </div>
              </div>
            </section>
          </Hit>
        );
      }

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
        return (
          <Hit id={block.id} active={active} onClick={onClick}>
            <StaticFaq data={data} locale={locale} faqs={pageFaqs} pageKey={pageKey} />
          </Hit>
        );

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
