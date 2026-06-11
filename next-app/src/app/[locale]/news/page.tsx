import type { Metadata } from "next";
import Link from "next/link";
import { localizedValue, type Locale } from "@/lib/cms";
import { fetchContentSync } from "@/lib/cms-server";
import NewsCard from "@/components/NewsCard";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = fetchContentSync();
  const seo = content.pageSeo?.news?.[locale] || {};
  return {
    title: seo.seoTitle || "News | WillowSoft",
    description: seo.metaDescription || "WillowSoft company updates, events, export news, and engineering updates.",
    alternates: {
      canonical: seo.canonical || `https://willowsoft.co/${locale}/news`,
    },
  };
}

export default async function NewsPage({ params }: PageProps) {
  const { locale } = await params;
  const content = fetchContentSync();
  const pageContent = content.pageContent?.news || {};
  const getVal = (key: string) => localizedValue(pageContent[key], locale as Locale);

  const newsList = (content.news || []).sort((a: any, b: any) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  const labels = {
    backAdmin: { en: "Open Admin", tr: "Yönetici Panelini Aç", de: "Admin öffnen", fr: "Ouvrir l'admin", es: "Abrir admin", it: "Apri admin", ar: "افتح الإدارة", ja: "管理画面を開く" }
  };

  const getLabel = (key: keyof typeof labels) => {
    return labels[key][locale as keyof (typeof labels)[typeof key]] || labels[key]["en"];
  };

  return (
    <main>
      <section className="hero compact">
        <div className="hero-media"><img src="/pdf-assets/p29_06_X111.jpg" alt="WillowSoft engineering updates" loading="lazy" decoding="async"/></div>
        <canvas className="signal-canvas" data-density="34"></canvas>
        <div className="hero-inner">
          <p className="eyebrow reveal">{getVal("heroEyebrow")}</p>
          <h1 className="reveal delay-1">{getVal("heroTitle")}</h1>
          <p className="reveal delay-2">{getVal("heroLead")}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="eyebrow">Latest Updates</p>
            <h2>Proof that WillowSoft is active in the field.</h2>
          </div>
          <div className="grid grid-3">
            {newsList.map((item: any, idx: number) => (
              <NewsCard key={item.id} item={item} locale={locale as Locale} index={idx} />
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <canvas className="signal-canvas" data-density="26" data-color="215, 154, 43"></canvas>
        <div className="section-inner split">
          <div className="reveal">
            <p className="eyebrow">Turn proof into pipeline</p>
            <h2 className="page-title">Use news, events and product launches to drive qualified leads.</h2>
          </div>
          <div className="reveal delay-1">
            <p className="section-lead">The admin panel can add new news items without touching code. Featured updates can later be surfaced on Home and Company pages.</p>
            <p><Link className="btn btn-primary" href="/admin">{getLabel("backAdmin")}</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
