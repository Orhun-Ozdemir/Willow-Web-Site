import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localizeItem, type Locale } from "@/lib/cms";
import { fetchContentSync } from "@/lib/cms-server";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = fetchContentSync();
  const rawItem = (content.news || []).find((n: any) => n.slug === slug || n.id === slug);
  if (!rawItem) return {};

  const item = localizeItem(rawItem, locale as Locale);
  return {
    title: `${item.title} | WillowSoft News`,
    description: item.excerpt || "WillowSoft engineering updates.",
    alternates: {
      canonical: `https://willowsoft.co/${locale}/news/${slug}`,
    },
    openGraph: {
      type: "article",
      url: `https://willowsoft.co/${locale}/news/${slug}`,
      title: item.title,
      description: item.excerpt,
      images: item.image ? [`https://willowsoft.co/${item.image}`] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.excerpt,
      images: item.image ? [`https://willowsoft.co/${item.image}`] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const content = fetchContentSync();
  const rawItem = (content.news || []).find((n: any) => n.slug === slug || n.id === slug);

  if (!rawItem) {
    notFound();
  }

  const item = localizeItem(rawItem, locale as Locale);
  const date = item.date
    ? new Date(`${item.date}T00:00:00`).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const labels = {
    backNews: { en: "Back to News", tr: "Haberlere Dön", de: "Zurück zu News", fr: "Retour aux actualités", es: "Volver a noticias", it: "Torna alle news", ar: "العودة إلى الأخبار", ja: "ニュース一覧に戻る" },
    newsLabel: { en: "News", tr: "Haber", de: "News", fr: "Actualités", es: "Noticias", it: "News", ar: "الأخبار", ja: "ニュース" },
    companyProof: { en: "Company Proof", tr: "Şirket Kanıtı", de: "Nachweis des Unternehmens", fr: "Preuve de l'entreprise", es: "Prueba de la empresa", it: "Evidenze aziendali", ar: "إثبات الشركة", ja: "実績と信頼の証" },
    whyMatters: { en: "Why this matters for customers.", tr: "Bunun müşteriler için önemi.", de: "Warum dies für Kunden wichtig ist.", fr: "Pourquoi cela compte pour les clients.", es: "Por qué esto es importante para los clientes.", it: "Perché questo è importante per i clienti.", ar: "لماذا يهم هذا العملاء.", ja: "お客様にとっての価値" }
  };

  const getLabel = (key: keyof typeof labels) => {
    return labels[key][locale as keyof (typeof labels)[typeof key]] || labels[key]["en"];
  };

  // Schema.org Graph injection
  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://willowsoft.co/#org",
        "name": "WillowSoft",
        "url": "https://willowsoft.co",
        "logo": "https://willowsoft.co/assets/willow-mark-transparent.png"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `https://willowsoft.co/${locale}` },
          { "@type": "ListItem", "position": 2, "name": "News", "item": `https://willowsoft.co/${locale}/news` },
          { "@type": "ListItem", "position": 3, "name": item.title }
        ]
      },
      {
        "@type": "NewsArticle",
        "headline": item.title,
        "description": item.excerpt || "",
        "image": item.image ? [`https://willowsoft.co/${item.image}`] : [],
        "datePublished": item.date || undefined,
        "dateModified": item.date || undefined,
        "author": { "@id": "https://willowsoft.co/#org" },
        "publisher": { "@id": "https://willowsoft.co/#org" },
        "mainEntityOfPage": `https://willowsoft.co/${locale}/news/${slug}`,
        "articleSection": item.category || "Company News"
      }
    ]
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
      />
      <section className="hero compact">
        <div className="hero-media">
          <img src={item.image ? `/${item.image}` : "/assets/hero-industrial-iot.png"} alt={item.title} loading="lazy" decoding="async" />
        </div>
        <canvas className="signal-canvas" data-density="34"></canvas>
        <div className="hero-inner">
          <p className="eyebrow reveal">
            {item.category || getLabel("newsLabel")} {date && `• ${date}`}
          </p>
          <h1 className="reveal delay-1">{item.title}</h1>
          <p className="reveal delay-2">{item.excerpt}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-inner split">
          <div className="reveal">
            <p className="eyebrow">{getLabel("companyProof")}</p>
            <h2 className="page-title">{getLabel("whyMatters")}</h2>
          </div>
          <div className="reveal delay-1">
            <p className="section-lead" dangerouslySetInnerHTML={{ __html: item.content || `${item.excerpt} This update serves as a trust signal on the public site and can be expanded from the admin panel with full article content.` }} />
            <p style={{ marginTop: "24px" }}>
              <Link className="btn btn-secondary" href={`/${locale}/news`}>
                {getLabel("backNews")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
