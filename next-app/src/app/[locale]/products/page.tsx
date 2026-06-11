import type { Metadata } from "next";
import Link from "next/link";
import { localizedValue, type Locale } from "@/lib/cms";
import { fetchContentSync } from "@/lib/cms-server";
import ProductCatalog from "@/components/ProductCatalog";
import FaqAccordion from "@/components/FaqAccordion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = fetchContentSync();
  const seo = content.pageSeo?.products?.[locale] || {};
  return {
    title: seo.seoTitle || "Products | WillowSoft",
    description: seo.metaDescription || "Industrial-grade LoRaWAN hardware portfolio.",
    alternates: {
      canonical: seo.canonical || `https://willowsoft.co/${locale}/products`,
    },
  };
}

export default async function ProductsPage({ params }: PageProps) {
  const { locale } = await params;
  const content = fetchContentSync();
  const pageContent = content.pageContent?.products || {};
  const companyFacts = content.companyFacts || {};
  const getVal = (key: string) => localizedValue(pageContent[key], locale as Locale);

  const productsList = content.products || [];

  const labels = {
    productsOnMarket: { en: "Products on Market", tr: "Piyasadaki Ürünler", de: "Produkte am Markt", fr: "Produits sur le marché", es: "Productos en el mercado", it: "Prodotti sul mercato", ar: "منتg في السوق", ja: "市場実績製品" },
    catalogItems: { en: "catalog items", tr: "katalog ürünü", de: "Katalogartikel", fr: "articles du catalogue", es: "artículos del catálogo", it: "articoli a catalogo", ar: "عنصر في الكتالوج", ja: "ラインナップ" },
    fieldReadyOptions: { en: "field-ready options", tr: "sahaya hazır seçenek", de: "praxisbereite Optionen", fr: "options prêtes pour le terrain", es: "opciones listas para el campo", it: "opzioni pronte per il campo", ar: "خيار جاهز للموقع", ja: "IP67定格デバイス" },
    featuredHardware: { en: "Featured Hardware", tr: "Öne Çıkan Donanım", de: "Vorgestellte Hardware", fr: "Matériel vedette", es: "Hardware destacado", it: "Hardware in evidenza", ar: "الأجهزة المميزة", ja: "主要製品" },
    willowbeeCore: { en: "WillowBee at the core.", tr: "Çekirdekte WillowBee var.", de: "WillowBee im Kern.", fr: "WillowBee au cœur.", es: "WillowBee en el núcleo.", it: "WillowBee al centro.", ar: "WillowBee في القلب.", ja: "核となる無線マイコン「WillowBee」" },
    willowbeeDesc: {
      en: "A compact LoRaWAN-enabled MCU module for low-power sensor end-nodes.",
      tr: "Düşük güç tüketen sensör uç düğümleri için LoRaWAN özellikli kompakt bir MCU modülü.",
      de: "Ein kompaktes LoRaWAN-fähiges MCU-Modul für stromsparende Sensorendknoten.",
      fr: "Un module MCU compact compatible LoRaWAN pour les nœuds d'extrémité de capteurs basse consommation.",
      es: "Un módulo MCU compacto compatible con LoRaWAN para nodos finales de sensores de bajo consumo.",
      it: "Un modulo MCU compatto abilitato LoRaWAN per nodi terminali di sensori a basso consumo.",
      ar: "وحدة MCU مدمجة تدعم LoRaWAN لعقد استشعار طرفية منخفضة الطاقة.",
      ja: "低消費電力センサ端末向けに設計された、超小型LoRaWAN対応無線マイコンモジュール。"
    },

    // Proof section
    rangeLabel: { en: "Range", tr: "Mesafe", de: "Reichweite", fr: "Portée", es: "Alcance", it: "Portata", ar: "المدى", ja: "通信距離" },
    rangeVal: { en: "15 km", tr: "15 km", de: "15 km", fr: "15 km", es: "15 km", it: "15 km", ar: "١٥ كم", ja: "15 km" },
    rangeDesc: {
      en: "Long-range LoRaWAN communication for remote field deployments.",
      tr: "Uzak saha kurulumları için uzun menzilli LoRaWAN iletişimi.",
      de: "LoRaWAN-Kommunikation mit großer Reichweite für Remote-Feldeinsätze.",
      fr: "Communication LoRaWAN longue portée pour les déploiements sur le terrain à distance.",
      es: "Comunicación LoRaWAN de largo alcance para implementaciones de campo remotas.",
      it: "Comunicazione LoRaWAN a lungo raggio per installazioni remote sul campo.",
      ar: "اتصال LoRaWAN طويل المدى لعمليات النشر الميدانية البعيدة.",
      ja: "ゲートウェイから離れた現場でも通信を確保する長距離LoRaWAN規格。"
    },

    batteryLabel: { en: "Battery", tr: "Pil Ömrü", de: "Batterie", fr: "Batterie", es: "Batería", it: "Batteria", ar: "البطارية", ja: "バッテリー" },
    batteryVal: { en: "10 yrs", tr: "10 Yıl", de: "10 Jahre", fr: "10 ans", es: "10 años", it: "10 anni", ar: "١٠ سنوات", ja: "10 年" },
    batteryDesc: {
      en: "Low-power hardware design for unattended sensor operation.",
      tr: "Müdahalesiz sensör çalışması için düşük güçlü donanım tasarımı.",
      de: "Stromsparendes Hardware-Design für wartungsfreien Sensorbetrieb.",
      fr: "Conception matérielle basse consommation pour un fonctionnement sans surveillance des capteurs.",
      es: "Diseño de hardware de bajo consumo para el funcionamiento de sensores sin supervisión.",
      it: "Design hardware a basso consumo per il funzionamento dei sensori senza manutenzione.",
      ar: "تصميم أجهزة منخفضة الطاقة لتشغيل المستشعرات دون الحاجة إلى صيانة.",
      ja: "電池交換の手間を省き、長期の単独動作を可能にする省電力設計。"
    },

    outdoorLabel: { en: "Outdoor", tr: "Dış Ortam", de: "Außenbereich", fr: "Extérieur", es: "Exterior", it: "Esterno", ar: "خارجي", ja: "耐環境性" },
    outdoorVal: { en: "IP67", tr: "IP67", de: "IP67", fr: "IP67", es: "IP67", it: "IP67", ar: "IP67", ja: "IP67" },
    outdoorDesc: {
      en: "Rugged enclosures for industrial, utility and outdoor sites.",
      tr: "Endüstriyel, altyapı ve dış mekan sahaları için dayanıklı korumalı kutu tasarımları.",
      de: "Robuste Gehäuse für Industrie-, Versorgungs- und Außenstandorte.",
      fr: "Boîtiers robustes pour les sites industriels, de services publics et extérieurs.",
      es: "Gabinetes robustos para sitios industriales, de servicios públicos y exteriores.",
      it: "Custodie robuste per siti industriali, di servizi pubblici e all'aperto.",
      ar: "علب متينة للمواقع الصناعية ومواقع المرافق والمواقع الخارجية.",
      ja: "工場、プラント、屋外など過酷な環境での使用に耐えうる防塵防水筐体。"
    },

    regionsLabel: { en: "Regions", tr: "Frekanslar", de: "Regionen", fr: "Régions", es: "Regiones", it: "Regioni", ar: "المناطق", ja: "グローバル対応" },
    regionsVal: { en: "7", tr: "7 Plan", de: "7 Pläne", fr: "7 plans", es: "7 planes", it: "7 bande", ar: "٧ خطط", ja: "7 帯域" },
    regionsDesc: {
      en: "US915, EU868, AS923, AU915, KR920, IN865 and RU864 support.",
      tr: "US915, EU868, AS923, AU915, KR920, IN865 ve RU864 frekans desteği.",
      de: "Unterstützung für US915, EU868, AS923, AU915, KR920, IN865 und RU864.",
      fr: "Prise en charge de US915, EU868, AS923, AU915, KR920, IN865 et RU864.",
      es: "Soporte para US915, EU868, AS923, AU915, KR920, IN865 y RU864.",
      it: "Supporto per US915, EU868, AS923, AU915, KR920, IN865 e RU864.",
      ar: "دعم خطط الترددات US915, EU868, AS923, AU915, KR920, IN865, RU864.",
      ja: "US915、EU868、AS923、AU915など、各国の周波数プランをサポート。"
    },

    requestQuote: { en: "Request Quote", tr: "Teklif Alın", de: "Angebot anfordern", fr: "Demander un devis", es: "Solicitar cotización", it: "Richiedi un preventivo", ar: "طلب عرض سعر", ja: "お見積り依頼" },
    
    // Filters
    filterAll: { en: "All", tr: "Tümü", de: "Alle", fr: "Tous", es: "Todos", it: "Tutti", ar: "الكل", ja: "すべて" },
    filterModules: { en: "Modules", tr: "Modüller", de: "Module", fr: "Modules", es: "Módulos", it: "Moduli", ar: "وحدات", ja: "通信モジュール" },
    filterEnvironment: { en: "Environmental", tr: "Çevresel Sensörler", de: "Umweltsensoren", fr: "Environnement", es: "Ambientales", it: "Sensori ambientali", ar: "مستشعرات بيئية", ja: "環境センサ" },
    filterTracking: { en: "Tracking & Safety", tr: "Takip & Güvenlik", de: "Ortung & Sicherheit", fr: "Suivi & Sécurité", es: "Seguimiento y seguridad", it: "Tracciamento e sicurezza", ar: "تتبع وأمان", ja: "追跡・防犯デバイス" },
    filterIndustrial: { en: "Industrial Interfaces", tr: "Endüstriyel Arayüzler", de: "Industrieschnittstellen", fr: "Interfaces industrielles", es: "Interfaces industriales", it: "Interfacce industriali", ar: "واجهات صناعية", ja: "産業用コンバータ" },

    // FAQ Section
    faqTitle: { en: "Questions about our products.", tr: "Ürünlerimiz hakkında sorular.", de: "Fragen zu unseren Produkten.", fr: "Questions sur nos produits.", es: "Preguntas sobre nuestros productos.", it: "Domande sui nostri prodotti.", ar: "أسئلة مكررة حول منتجاتنا.", ja: "製品に関するよくある質問" },
    faqLead: {
      en: "Here are answers to the most common questions about our LoRaWAN devices and module specifications.",
      tr: "LoRaWAN cihazlarımız ve modül özelliklerimiz hakkında en sık sorulan soruların yanıtları.",
      de: "Hier finden Sie Antworten auf die häufigsten Fragen zu unseren LoRaWAN-Geräten und Modulspezifikationen.",
      fr: "Voici les réponses aux questions les plus courantes sur nos appareils LoRaWAN et les spécifications de nos modules.",
      es: "Aquí encontrará respuestas a las preguntas más comunes sobre nuestros dispositivos LoRaWAN y las especificaciones de los módulos.",
      it: "Ecco le risposte alle domande più comuni sui nostri dispositivi LoRaWAN e sulle specifiche dei moduli.",
      ar: "إليك إجابات الأسئلة الأكثر شيوعًا حول أجهزة LoRaWAN ومواصفات الوحدات لدينا.",
      ja: "LoRaWANデバイスの仕様や機能について、よくいただく技術的な質問です。"
    }
  };

  const getLabel = (key: keyof typeof labels) => {
    return labels[key][locale as keyof (typeof labels)[typeof key]] || labels[key]["en"];
  };

  const catalogLabels = {
    filterAll: getLabel("filterAll"),
    filterModules: getLabel("filterModules"),
    filterEnvironment: getLabel("filterEnvironment"),
    filterTracking: getLabel("filterTracking"),
    filterIndustrial: getLabel("filterIndustrial"),
  };

  return (
    <main>
      <section className="hero compact products-motion-hero">
        <canvas className="signal-canvas" data-density="34" data-color="24, 167, 255"></canvas>
        <div className="services-hero-light" aria-hidden="true"></div>
        <div className="hero-inner products-hero-grid">
          <div className="products-hero-copy">
            <p className="eyebrow reveal">{getVal("heroEyebrow")}</p>
            <h1 className="reveal delay-1">{getVal("heroTitle")}</h1>
            <p className="reveal delay-2">{getVal("heroLead")}</p>
            <div className="services-hero-meta reveal delay-3" role="list" aria-label="Product portfolio facts">
              <span className="hero-meta-item" role="listitem">
                <strong data-company-fact="productsOnMarket">{companyFacts.productsOnMarket}</strong>
                <span>{getLabel("productsOnMarket")}</span>
              </span>
              <span className="hero-meta-divider" aria-hidden="true"></span>
              <span className="hero-meta-item" role="listitem">
                <strong>{productsList.length}</strong>
                <span>{getLabel("catalogItems")}</span>
              </span>
              <span className="hero-meta-divider" aria-hidden="true"></span>
              <span className="hero-meta-item" role="listitem">
                <strong>IP67</strong>
                <span>{getLabel("fieldReadyOptions")}</span>
              </span>
            </div>
          </div>
          <aside className="product-hero-showcase reveal delay-2" aria-label="Featured WillowSoft hardware">
            <div className="product-showcase-stage">
              <img src="/assets/product-cutouts/willowbee-lorawan-module.png" alt="WillowBee LoRaWAN module" loading="lazy" decoding="async" />
            </div>
            <div className="product-showcase-copy">
              <p className="architecture-label">{getLabel("featuredHardware")}</p>
              <h2>{getLabel("willowbeeCore")}</h2>
              <p>{getLabel("willowbeeDesc")}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section product-proof-section">
        <div className="section-inner">
          <div className="product-proof-grid">
            <article className="proof-stat-card reveal">
              <span>{getLabel("rangeLabel")}</span>
              <strong>{getLabel("rangeVal")}</strong>
              <p>{getLabel("rangeDesc")}</p>
            </article>
            <article className="proof-stat-card reveal delay-1">
              <span>{getLabel("batteryLabel")}</span>
              <strong>{getLabel("batteryVal")}</strong>
              <p>{getLabel("batteryDesc")}</p>
            </article>
            <article className="proof-stat-card reveal delay-2">
              <span>{getLabel("outdoorLabel")}</span>
              <strong>{getLabel("outdoorVal")}</strong>
              <p>{getLabel("outdoorDesc")}</p>
            </article>
            <article className="proof-stat-card reveal delay-3">
              <span>{getLabel("regionsLabel")}</span>
              <strong>{getLabel("regionsVal")}</strong>
              <p>{getLabel("regionsDesc")}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section soft product-catalog-section" id="catalog">
        <div className="section-inner">
          <div className="section-head reveal product-headline">
            <div>
              <p className="eyebrow">{getVal("catalogEyebrow")}</p>
              <h2>{getVal("catalogTitle")}</h2>
              <p className="section-lead">A clean catalog view for comparing modules, environmental sensors, tracking/safety devices and industrial interfaces without changing visual language from the rest of the site.</p>
            </div>
            <Link className="btn btn-secondary btn-small" href={`/${locale}/contact`}>{getLabel("requestQuote")}</Link>
          </div>

          <ProductCatalog products={productsList} locale={locale as Locale} labels={catalogLabels} />
        </div>
      </section>

      {/* FAQ */}
      <section className="section soft services-faq-section" id="faq">
        <div className="section-inner">
          <div className="section-head reveal center" style={{ marginBottom: "36px" }}>
            <p className="eyebrow">Frequently asked</p>
            <h2 className="page-title">{getLabel("faqTitle")}</h2>
            <p className="section-lead" style={{ maxWidth: "720px", marginLeft: "auto", marginRight: "auto" }}>
              {getLabel("faqLead")}
            </p>
          </div>
          <FaqAccordion faqs={content.faqs || []} pageKey="products" locale={locale as Locale} />
        </div>
      </section>
    </main>
  );
}
