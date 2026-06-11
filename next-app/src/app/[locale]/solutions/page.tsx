import type { Metadata } from "next";
import Link from "next/link";
import { fetchContentSync } from "@/lib/cms-server";
import { localizedValue, type Locale } from "@/lib/cms";
import SolutionCard from "@/components/SolutionCard";
import FaqAccordion from "@/components/FaqAccordion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = fetchContentSync();
  const seo = content.pageSeo?.solutions?.[locale] || {};
  return {
    title: seo.seoTitle || "Solutions | WillowSoft",
    description: seo.metaDescription || "Industrial IoT solutions.",
    alternates: {
      canonical: seo.canonical || `https://willowsoft.co/${locale}/solutions`,
    },
  };
}

export default async function SolutionsPage({ params }: PageProps) {
  const { locale } = await params;
  const content = fetchContentSync();
  const pageContent = content.pageContent?.solutions || {};
  const getVal = (key: string) => localizedValue(pageContent[key], locale as Locale);

  const solutions = (content.solutions || []).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const labels = {
    useCases: { en: "Use Cases", tr: "Kullanım Alanları", de: "Anwendungsbereiche", fr: "Cas d'usage", es: "Casos de uso", it: "Casi d'uso", ar: "حالات الاستخدام", ja: "ユースケース" },
    whyWillowSoft: { en: "Why WillowSoft", tr: "Neden WillowSoft", de: "Warum WillowSoft", fr: "Pourquoi WillowSoft", es: "Por qué WillowSoft", it: "Perché WillowSoft", ar: "لماذا WillowSoft", ja: "WillowSoftの強み" },
    mapCase: { en: "Map Your Use Case", tr: "Kullanım Senaryonuzu Belirleyin", de: "Anwendung zuordnen", fr: "Cartographier votre usage", es: "Mapear su caso de uso", it: "Mappa il tuo caso", ar: "خطط لحالة استخدامك", ja: "ユースケースを相談する" },
    faqEyebrow: { en: "Frequently asked", tr: "Sıkça sorulanlar", de: "Häufig gestellte Fragen", fr: "Questions fréquentes", es: "Preguntas frecuentes", it: "Domande frequenti", ar: "أسئلة مكرrea", ja: "よくある質問" },
    faqTitle: { en: "Questions about our solutions.", tr: "Çözümlerimiz hakkında sorular.", de: "Fragen zu unseren Lösungen.", fr: "Questions sur nos solutions.", es: "Preguntas sobre nuestras soluciones.", it: "Domande sulle nostre soluzioni.", ar: "أسئلة حول حلولنا.", ja: "ソリューションに関するご質問" },
    faqLead: {
      en: "Here are the answers to the most common questions about our IoT capabilities and deployments.",
      tr: "IoT yeteneklerimiz ve kurulumlarımız hakkında en sık sorulan soruların yanıtları.",
      de: "Hier finden Sie Antworten auf die häufigsten Fragen zu unseren IoT-Funktionen und -Bereitstellungen.",
      fr: "Voici les réponses aux questions les plus courantes sur nos capacités IoT et nos déploiements.",
      es: "Aquí encontrará respuestas a las preguntas más comunes sobre nuestras capacidades y despliegues de IoT.",
      it: "Ecco le risposte alle domande più comuni sulle nostre capacità e installazioni IoT.",
      ar: "إليك إجابات الأسئلة الأكثر شيوعًا حول قدرات إنترنت الأشياء وعمليات النشر لدينا.",
      ja: "IoT機能と導入実績に関する最も一般的な質問への回答です。"
    }
  };

  const getLabel = (key: keyof typeof labels) => {
    return labels[key][locale as keyof (typeof labels)[typeof key]] || labels[key]["en"];
  };

  return (
    <main>
      <section className="hero compact">
        <div className="hero-media"><img src="/pdf-assets/p04_01_X9.jpg" alt="Industrial IoT concept" loading="lazy" decoding="async"/></div>
        <canvas className="signal-canvas" data-density="38"></canvas>
        <div className="hero-inner">
          <p className="eyebrow reveal">{getVal("heroEyebrow")}</p>
          <h1 className="reveal delay-1">{getVal("heroTitle")}</h1>
          <p className="reveal delay-2">{getVal("heroLead")}</p>
        </div>
      </section>

      <section className="section solution-market-section">
        <div className="section-inner">
          <div className="section-head reveal product-headline">
            <div>
              <p className="eyebrow">{getLabel("useCases")}</p>
              <h2>{getVal("useCasesTitle")}</h2>
            </div>
            <Link className="btn btn-secondary btn-small" href={`/${locale}/start-project`}>{getLabel("mapCase")}</Link>
          </div>
          <div className="solution-case-grid" data-cms-solutions>
            {solutions.map((s: any, idx: number) => (
              <SolutionCard key={s.id} solution={s} locale={locale as Locale} index={idx} />
            ))}
          </div>
        </div>
      </section>

      <section className="section soft solution-selector-section">
        <div className="section-inner">
          <div className="section-head center reveal">
            <p className="eyebrow">{getVal("whyEyebrow")}</p>
            <h2>{getVal("whyTitle")}</h2>
            <p className="section-lead">The strongest IoT projects do not start with “which sensor?” They start with what the user must see, decide, or automate.</p>
          </div>
          <div className="solution-selector-grid">
            <article className="solution-selector-card reveal">
              <span>Need visibility?</span>
              <h3>Remote monitoring</h3>
              <p>For assets that are hard to reach, distributed, or checked manually today.</p>
            </article>
            <article className="solution-selector-card reveal delay-1">
              <span>Need action?</span>
              <h3>Alerts and workflows</h3>
              <p>For operations where threshold, motion, panic, door, level or pressure events require response.</p>
            </article>
            <article className="solution-selector-card reveal delay-2">
              <span>Need integration?</span>
              <h3>Data platform</h3>
              <p>For telemetry that must feed ERP, reporting, customer portals, PostgreSQL or internal APIs.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section dark">
        <canvas className="signal-canvas" data-density="32" data-color="35, 168, 216"></canvas>
        <div className="section-inner split">
          <div className="reveal">
            <p className="eyebrow">{getVal("howEyebrow")}</p>
            <h2 className="page-title">{getVal("howTitle")}</h2>
            <p className="section-lead">{getVal("howLead")}</p>
          </div>
          <div className="tech-flow reveal delay-1">
            <div className="flow-row">
              <div className="flow-node"><strong>Measure</strong><span>Level, pressure, air, motion, GPS.</span></div>
              <div className="flow-node"><strong>Transmit</strong><span>LoRaWAN and low-power network paths.</span></div>
              <div className="flow-node"><strong>Store</strong><span>Backend APIs and PostgreSQL.</span></div>
              <div className="flow-node"><strong>Visualize</strong><span>Dashboards, maps, mobile apps.</span></div>
              <div className="flow-node"><strong>Act</strong><span>Alerts, reports, and workflows.</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why WillowSoft Section */}
      <section className="section soft solutions-why-section">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="eyebrow">{getLabel("whyWillowSoft")}</p>
            <h2>Solutions are engineered around the site, not forced onto it.</h2>
          </div>
          <div className="grid grid-3">
            <article className="card reveal">
              <h3>Low-Power Expertise</h3>
              <p>Battery life and data intervals are designed according to operational reality, not generic lab assumptions.</p>
            </article>
            <article className="card reveal delay-1">
              <h3>RF-Aware Deployment</h3>
              <p>Connectivity planning accounts for metal-heavy factories, distance, harsh weather, and gateway placement.</p>
            </article>
            <article className="card reveal delay-2">
              <h3>Full Digital Layer</h3>
              <p>Backend, database, dashboard, admin panel, mobile alerts, and reporting are designed with the device workflow.</p>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section soft services-faq-section" id="faq">
        <div className="section-inner">
          <div className="section-head reveal center" style={{ marginBottom: "36px" }}>
            <p className="eyebrow">{getLabel("faqEyebrow")}</p>
            <h2 className="page-title">{getLabel("faqTitle")}</h2>
            <p className="section-lead" style={{ maxWidth: "720px", marginLeft: "auto", marginRight: "auto" }}>
              {getLabel("faqLead")}
            </p>
          </div>
          <FaqAccordion faqs={content.faqs || []} pageKey="solutions" locale={locale as Locale} />
        </div>
      </section>
    </main>
  );
}
