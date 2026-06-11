import type { Metadata } from "next";
import Link from "next/link";
import { fetchContentSync } from "@/lib/cms-server";
import { localizedValue, type Locale } from "@/lib/cms";
import ProductCard from "@/components/ProductCard";
import NewsCard from "@/components/NewsCard";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = fetchContentSync();
  const seo = content.pageSeo?.home?.[locale] || {};
  return {
    title: seo.seoTitle || "WillowSoft | Embedded Hardware & Industrial IoT Engineering",
    description: seo.metaDescription || "Embedded hardware and Industrial IoT engineering.",
    alternates: {
      canonical: seo.canonical || `https://willowsoft.co/${locale}`,
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const content = fetchContentSync();
  const pageContent = content.pageContent?.home || {};
  const companyFacts = content.companyFacts || {};
  
  const getVal = (key: string) => localizedValue(pageContent[key], locale as Locale);

  const featuredProducts = (content.products || []).filter((p: any) => p.featured).slice(0, 4);
  const latestNews = (content.news || []).slice(0, 3);
  const featuredClients = (content.clients || [])
    .filter((c: any) => c.featured)
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const labels = {
    productsOnMarket: { en: "Products on market", tr: "Piyasadaki ürünler", de: "Produkte am Markt", fr: "Produits sur le marché", es: "Productos en el mercado", it: "Prodotti sul mercato", ar: "منتج في السوق", ja: "市場実績製品" },
    happyClients: { en: "Happy clients", tr: "Mutlu müşteriler", de: "Zufriedene Kunden", fr: "Clients satisfaits", es: "Clientes satisfechos", it: "Clienti felici", ar: "عميل سعيد", ja: "取引先企業数" },
    founded: { en: "Founded", tr: "Kuruluş", de: "Gegründet", fr: "Fondation", es: "Fundación", it: "Fondazione", ar: "تأسست عام", ja: "設立年" },
    officesWorldwide: { en: "Offices worldwide", tr: "Dünya çapında ofis", de: "Büros weltweit", fr: "Bureaux dans le monde", es: "Oficinas en el mundo", it: "Uffici nel mondo", ar: "مكتب حول العالم", ja: "拠点数" },
    exploreServices: { en: "Explore Services", tr: "Hizmetleri Keşfet", de: "Dienste erkunden", fr: "Découvrir les services", es: "Explorar servicios", it: "Esplora i servizi", ar: "استكشف الخدمات", ja: "提供サービスを見る" },
    startProject: { en: "Start Your Project", tr: "Projeye Başla", de: "Projekt starten", fr: "Démarrer un projer", es: "Iniciar proyecto", it: "Avvia progetto", ar: "ابدأ مشروعًا", ja: "プロジェクトを開始" },
    viewProducts: { en: "Browse Products", tr: "Ürünlere Göz At", de: "Produkte durchsuchen", fr: "Parcourir les produits", es: "Ver productos", it: "Sfoglia i prodotti", ar: "تصفح المنتجات", ja: "製品カタログを見る" },
    viewNews: { en: "View News", tr: "Haberleri Görüntüle", de: "News anzeigen", fr: "Voir les actualités", es: "Ver noticias", it: "Vedi le news", ar: "عرض الأخbar", ja: "ニュースを見る" },
    talkEngineering: { en: "Talk to Engineering", tr: "Mühendislerimizle Görüşün", de: "Mit Engineering sprechen", fr: "Parler à l'ingénierie", es: "Hablar con ingeniería", it: "Parla con il team", ar: "تحدث إلى الهندسة", ja: "技術チームへ相談" },
  };

  const getLabel = (key: keyof typeof labels) => {
    return labels[key][locale as keyof (typeof labels)[typeof key]] || labels[key]["en"];
  };

  return (
    <main>
      {/* Hero */}
      <section className="hero motion-hero">
        <div className="hero-media">
          <img src="/assets/hero-industrial-iot.png" alt="Industrial IoT hardware on a lab bench" loading="lazy" decoding="async" />
        </div>
        <canvas className="hero-shader-canvas" aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}></canvas>
        <canvas className="signal-canvas" data-density="42" data-color="75, 87, 170"></canvas>
        <div className="hero-inner hero-layout">
          <div className="hero-copy">
            <p className="eyebrow reveal">{getVal("heroEyebrow")}</p>
            <h1 className="reveal delay-1" dangerouslySetInnerHTML={{ __html: getVal("heroTitle") }}></h1>
            <p className="reveal delay-2">{getVal("heroLead")}</p>
            <div className="hero-ctas reveal delay-3">
              <Link className="btn btn-primary" href={`/${locale}/start-project`}>{getLabel("startProject")}</Link>
              <Link className="btn btn-secondary" href={`/${locale}/services`}>{getLabel("exploreServices")}</Link>
            </div>
            <div className="hero-proof reveal delay-4">
              <div className="proof-item">
                <strong data-company-fact="productsOnMarket">{companyFacts.productsOnMarket}</strong>
                <span>{getLabel("productsOnMarket")}</span>
              </div>
              <div className="proof-item">
                <strong data-company-fact="happyClients">{companyFacts.happyClients}</strong>
                <span>{getLabel("happyClients")}</span>
              </div>
              <div className="proof-item">
                <strong>2020</strong>
                <span>{getLabel("founded")}</span>
              </div>
              <div className="proof-item">
                <strong data-company-fact="officesWorldwide">{companyFacts.officesWorldwide}</strong>
                <span>{getLabel("officesWorldwide")}</span>
              </div>
            </div>
          </div>

          <aside className="hero-product-stage reveal delay-2" aria-label="WillowSoft hardware showcase">
            <div className="product-spotlight"></div>
            <article className="floating-product product-one" style={{ "--delay": "0ms" } as any}>
              <figure><img src="/pdf-assets/p06_01_X13.jpg" alt="WillowBee LoRaWAN module" loading="lazy" decoding="async" /></figure>
              <div><strong>WillowBee</strong><span>Compact LoRaWAN MCU module</span></div>
            </article>
            <article className="floating-product product-two" style={{ "--delay": "180ms" } as any}>
              <figure><img src="/pdf-assets/p08_01_X22.jpg" alt="WillowAir sensor" loading="lazy" decoding="async" /></figure>
              <div><strong>WillowAir</strong><span>Indoor air quality monitoring</span></div>
            </article>
            <article className="floating-product product-three" style={{ "--delay": "360ms" } as any}>
              <figure><img src="/pdf-assets/p14_01_X50.jpg" alt="WillowMod sensor" loading="lazy" decoding="async" /></figure>
              <div><strong>WillowMod</strong><span>Wireless Modbus integration</span></div>
            </article>
          </aside>
        </div>
      </section>

      {/* Service Rail */}
      <section className="section tight">
        <div className="section-inner">
          <div className="service-rail reveal">
            <article><span className="service-number">01</span><h3>Embedded</h3><p>Hardware, firmware, RF and low-power architecture.</p></article>
            <article><span className="service-number">02</span><h3>Platform</h3><p>Backend APIs, PostgreSQL, dashboards and admin panels.</p></article>
            <article><span className="service-number">03</span><h3>Interfaces</h3><p>Mobile apps, web portals and product websites.</p></article>
            <article><span className="service-number">04</span><h3>Simulation</h3><p>VR training, product demos and digital twin views.</p></article>
          </div>
        </div>
      </section>

      {/* Trust Showcase */}
      <section className="trust-showcase" id="trusted-brands" aria-label="Trusted by clients">
        <div className="section-inner trust-layout">
          <div className="trust-copy reveal-left">
            <p className="eyebrow">{getVal("trustEyebrow")}</p>
            <h2 dangerouslySetInnerHTML={{ __html: getVal("trustTitle") }}></h2>
            <p>{getVal("trustLead")}</p>
            <div className="trust-more" aria-label="Additional sectors">
              <span>Industrial Automation</span>
              <span>MedTech</span>
              <span>Energy</span>
              <span>Telecom</span>
              <span>Smart Logistics</span>
            </div>
          </div>
          <div className="trust-stage reveal-right delay-1">
            <div className="trust-mark"><img src="/pdf-assets/p01_01_X0.jpg" alt="WillowSoft mark" loading="lazy" decoding="async" /></div>
            <div className="logo-cloud" data-cms-clients>
              {featuredClients.map((client: any, idx: number) => {
                const depths = [18, 54, 28, 42, 12, 66, 36, 24];
                const z = depths[idx % depths.length];
                const delay = idx * 130;
                return (
                  <div key={client.id} className="logo-tile" style={{ "--z": `${z}px`, "--delay": `${delay}ms` } as any} title={client.name}>
                    {client.logo ? <img src={`/${client.logo}`} alt={client.name} loading="lazy" decoding="async" /> : <strong>{client.name}</strong>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="section dark ecosystem-section">
        <canvas className="signal-canvas" data-density="34" data-color="91, 166, 91"></canvas>
        <div className="section-inner">
          <div className="section-head center reveal">
            <p className="eyebrow">{getVal("ecosystemEyebrow")}</p>
            <h2 dangerouslySetInnerHTML={{ __html: getVal("ecosystemTitle") }}></h2>
            <p className="section-lead">Each layer is planned against the next one, so field telemetry becomes useful operational software instead of isolated device data.</p>
          </div>
          <div className="tech-flow reveal delay-1">
            <div className="flow-row">
              <div className="flow-node"><small>01</small><strong>Hardware</strong><span>Custom PCB, sensors, power architecture.</span></div>
              <div className="flow-node"><small>02</small><strong>Firmware</strong><span>RTOS, OTA, protocols, low-power logic.</span></div>
              <div className="flow-node"><small>03</small><strong>Connectivity</strong><span>LoRaWAN, BLE, Wi-Fi, RF optimization.</span></div>
              <div className="flow-node"><small>04</small><strong>Backend</strong><span>APIs, PostgreSQL, auth, integrations.</span></div>
              <div className="flow-node"><small>05</small><strong>Interfaces</strong><span>Mobile apps, dashboards, admin panels, VR.</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section home-products">
        <div className="section-inner">
          <div className="section-head reveal product-headline">
            <div>
              <p className="eyebrow">{getVal("productsEyebrow")}</p>
              <h2 dangerouslySetInnerHTML={{ __html: getVal("productsTitle") }}></h2>
            </div>
            <Link className="btn btn-secondary btn-small" href={`/${locale}/products`}>{getLabel("viewProducts")}</Link>
          </div>
          <div className="grid grid-4" data-cms-featured-products>
            {featuredProducts.map((p: any, idx: number) => (
              <ProductCard key={p.id} product={p} locale={locale as Locale} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="section soft industries-section">
        <div className="section-inner">
          <div className="section-head center reveal">
            <p className="eyebrow">{getVal("industriesEyebrow")}</p>
            <h2 dangerouslySetInnerHTML={{ __html: getVal("industriesTitle") }}></h2>
          </div>
          <div className="industry-lanes">
            <article className="industry-lane reveal">
              <div className="industry-lane-icon" aria-hidden="true">🏙️</div>
              <h3>Smart Infrastructure</h3>
              <p>Flood levels, water tanks, smart lighting and public utility monitoring.</p>
            </article>
            <article className="industry-lane reveal delay-1">
              <div className="industry-lane-icon" aria-hidden="true">⚙️</div>
              <h3>Industrial Monitoring</h3>
              <p>Machine data, Modbus devices, factories, warehouses and energy systems.</p>
            </article>
            <article className="industry-lane reveal delay-2">
              <div className="industry-lane-icon" aria-hidden="true">🩺</div>
              <h3>MedTech &amp; Healthcare</h3>
              <p>Low-power sensor nodes for environmental and patient-adjacent monitoring.</p>
            </article>
            <article className="industry-lane reveal delay-3">
              <div className="industry-lane-icon" aria-hidden="true">📦</div>
              <h3>Logistics &amp; Telecoms</h3>
              <p>Asset tracking, GNSS, and field-connected devices for mobile operations.</p>
            </article>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="section proof-section">
        <div className="section-inner">
          <div className="section-head reveal product-headline">
            <div>
              <p className="eyebrow">{getVal("newsEyebrow")}</p>
              <h2 dangerouslySetInnerHTML={{ __html: getVal("newsTitle") }}></h2>
            </div>
            <Link className="btn btn-secondary btn-small" href={`/${locale}/news`}>{getLabel("viewNews")}</Link>
          </div>
          <div className="grid grid-3" data-cms-news>
            {latestNews.map((n: any, idx: number) => (
              <NewsCard key={n.id} item={n} locale={locale as Locale} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section dark final-cta">
        <canvas className="signal-canvas" data-density="26" data-color="215, 154, 43"></canvas>
        <div className="section-inner split">
          <div className="reveal">
            <p className="eyebrow">{getVal("ctaEyebrow")}</p>
            <h2 className="page-title" dangerouslySetInnerHTML={{ __html: getVal("ctaTitle") }}></h2>
          </div>
          <div className="reveal delay-1">
            <p className="section-lead">{getVal("ctaLead")}</p>
            <div className="cta-choice-grid" aria-label="Common project starting points">
              <span>Hardware + Firmware</span>
              <span>Backend + PostgreSQL</span>
              <span>Web, Mobile + VR</span>
            </div>
            <p><Link className="btn btn-primary" href={`/${locale}/contact`}>{getLabel("talkEngineering")}</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
