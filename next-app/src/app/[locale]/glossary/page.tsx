import type { Metadata } from "next";
import { fetchContentSync, localizeItem, localizedValue, type Locale } from "@/lib/cms";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = fetchContentSync();
  const seo = content.pageSeo?.glossary?.[locale] || {};
  return {
    title: seo.seoTitle || "IoT & LoRaWAN Glossary | WillowSoft",
    description: seo.metaDescription || "WillowSoft terms and definitions.",
    alternates: {
      canonical: seo.canonical || `https://willowsoft.co/${locale}/glossary`,
    },
  };
}

export default async function GlossaryPage({ params }: PageProps) {
  const { locale } = await params;
  const content = fetchContentSync();
  const pageContent = content.pageContent?.glossary || {};
  const glossaryList = content.glossary || [];

  const getVal = (key: string) => localizedValue(pageContent[key], locale as Locale);

  const glossaryItems = (category: string) => {
    return glossaryList
      .filter((item: any) => item.category === category)
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item: any, index: number) => {
        const localized = localizeItem(item, locale as Locale);
        const delay = index % 2 ? " delay-1" : "";
        const noteLabel = localized.noteLabel || (locale === "tr" ? "WillowSoft kullanım alanları:" : "WillowSoft uses it in:");
        return (
          <article className={`card reveal${delay}`} id={localized.id} key={localized.id}>
            <h3>{localized.term}</h3>
            <p>{localized.definition}</p>
            {localized.note && (
              <p>
                <strong>{noteLabel}</strong> {localized.note}
              </p>
            )}
          </article>
        );
      });
  };

  return (
    <main>
      <section className="hero compact">
        <canvas className="signal-canvas" data-density="28" data-color="26, 163, 196"></canvas>
        <div className="hero-inner">
          <p className="eyebrow reveal">{getVal("heroEyebrow")}</p>
          <h1 className="reveal delay-1" dangerouslySetInnerHTML={{ __html: getVal("heroTitle") }}></h1>
          <p className="reveal delay-2">{getVal("heroLead")}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="eyebrow">{getVal("connectivityEyebrow")}</p>
            <h2>{getVal("connectivityTitle")}</h2>
          </div>
          <div className="grid grid-2">
            {glossaryItems("connectivity")}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="eyebrow">{getVal("devicesEyebrow")}</p>
            <h2>{getVal("devicesTitle")}</h2>
          </div>
          <div className="grid grid-2">
            {glossaryItems("devices")}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="eyebrow">{getVal("softwareEyebrow")}</p>
            <h2>{getVal("softwareTitle")}</h2>
          </div>
          <div className="grid grid-2">
            {glossaryItems("software")}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="section-inner split">
          <div className="reveal">
            <p className="eyebrow">{getVal("ctaEyebrow")}</p>
            <h2 className="page-title">{getVal("ctaTitle")}</h2>
          </div>
          <div className="reveal delay-1">
            <p className="section-lead">{getVal("ctaLead")}</p>
            <p><a className="btn btn-primary" href={`/${locale}/contact`}>Talk to Engineering</a></p>
          </div>
        </div>
      </section>
    </main>
  );
}
