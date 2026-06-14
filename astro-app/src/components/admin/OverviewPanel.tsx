"use client";

import { useMemo } from "react";
import { locales } from "@/lib/cms";
import { useAdmin } from "./AdminContext";

type AdminTab =
  | "overview" | "leads" | "kanban"
  | "products" | "news" | "faqs" | "solutions" | "clients" | "company"
  | "seo" | "translations" | "health"
  | "settings" | "backups" | "users";

interface OverviewPanelProps {
  onNavigate?: (tab: AdminTab) => void;
}

const SEO_CORE_FIELDS = ["seoTitle", "metaDescription", "focusKeyword", "h1", "slug"];

function filled(value: any): boolean {
  return String(value ?? "").trim().length > 0;
}

function list(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function pct(done: number, total: number): number {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function formatDate(value: any): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("tr", { year: "numeric", month: "short", day: "numeric" });
}

function getDateTime(value: any): number {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function hasMedia(item: any): boolean {
  return filled(item?.image) || (Array.isArray(item?.images) && item.images.some(filled)) || filled(item?.logo);
}

function newsReady(item: any): boolean {
  return filled(item?.title) && filled(item?.slug) && filled(item?.date) && hasMedia(item) && filled(item?.excerpt) && filled(item?.content);
}

function productReady(item: any): boolean {
  return filled(item?.title) && filled(item?.slug) && hasMedia(item) && filled(item?.shortDescription || item?.description);
}

function CoverageBar({ value, tone = "blue" }: { value: number; tone?: "blue" | "green" | "amber" | "red" }) {
  const color = tone === "green" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : tone === "red" ? "bg-red-500" : "bg-[#132175]";
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "amber" | "red" | "blue" }) {
  const cls =
    tone === "green" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
    tone === "amber" ? "bg-amber-50 text-amber-700 border-amber-100" :
    tone === "red" ? "bg-red-50 text-red-600 border-red-100" :
    "bg-[#132175]/10 text-[#132175] border-[#132175]/10";
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${cls}`}>{label}</span>;
}

export default function OverviewPanel({ onNavigate }: OverviewPanelProps) {
  const { content, leads, isDirty } = useAdmin();

  const products = list(content?.products);
  const news = list(content?.news);
  const services = list(content?.services);
  const solutions = list(content?.solutions);
  const clients = list(content?.clients);
  const faqs = list(content?.faqs);
  const glossary = list(content?.glossary);

  const overview = useMemo(() => {
    const readyProducts = products.filter(productReady).length;
    const readyNews = news.filter(newsReady).length;
    const mediaItems = [...products, ...news, ...clients];
    const mediaReady = mediaItems.filter(hasMedia).length;

    const pageSeo = content?.pageSeo || {};
    let seoTotal = 0;
    let seoFilled = 0;
    Object.keys(pageSeo).forEach((pageKey) => {
      locales.forEach((locale) => {
        SEO_CORE_FIELDS.forEach((field) => {
          seoTotal += 1;
          if (filled(pageSeo?.[pageKey]?.[locale]?.[field])) seoFilled += 1;
        });
      });
    });

    const pageContent = content?.pageContent || {};
    let translationTotal = 0;
    let translationFilled = 0;
    Object.values(pageContent).forEach((page: any) => {
      Object.values(page || {}).forEach((localized: any) => {
        locales.forEach((locale) => {
          translationTotal += 1;
          if (filled(localized?.[locale])) translationFilled += 1;
        });
      });
    });

    const newLeads = leads.filter((lead) => !lead.status || lead.status === "new").length;
    const activeLeads = leads.filter((lead) => ["new", "contacted", "qualified"].includes(lead.status || "new")).length;
    const latestLeads = [...leads]
      .sort((a, b) => getDateTime(b.created_at || b.createdAt || b.date) - getDateTime(a.created_at || a.createdAt || a.date))
      .slice(0, 4);
    const latestNews = [...news]
      .sort((a, b) => getDateTime(`${b.date || ""}T00:00:00`) - getDateTime(`${a.date || ""}T00:00:00`))
      .slice(0, 4);
    const featuredNews = [...news]
      .sort((a, b) => getDateTime(`${b.date || ""}T00:00:00`) - getDateTime(`${a.date || ""}T00:00:00`))
      .find((item) => item.featured) || latestNews[0];

    return {
      readyProducts,
      readyNews,
      mediaReady,
      mediaTotal: mediaItems.length,
      seoPercent: pct(seoFilled, seoTotal),
      seoFilled,
      seoTotal,
      translationPercent: pct(translationFilled, translationTotal),
      translationFilled,
      translationTotal,
      newLeads,
      activeLeads,
      latestLeads,
      latestNews,
      featuredNews,
    };
  }, [content, leads, products, news, clients]);

  const totalContent =
    products.length + news.length + services.length + solutions.length + clients.length + faqs.length + glossary.length;
  const readyContent = overview.readyProducts + overview.readyNews + services.length + solutions.length + clients.length + faqs.length + glossary.length;
  const contentHealth = pct(readyContent, totalContent);
  const contentTone = contentHealth >= 80 ? "green" : contentHealth >= 50 ? "amber" : "red";
  const seoTone = overview.seoPercent >= 80 ? "green" : overview.seoPercent >= 50 ? "amber" : "red";
  const translationTone = overview.translationPercent >= 80 ? "green" : overview.translationPercent >= 50 ? "amber" : "red";

  const quickActions: { label: string; desc: string; tab: AdminTab; tone: string }[] = [
    { label: "News vitrinini düzenle", desc: "Öne çıkan haber, galeri ve public preview.", tab: "news", tone: "bg-amber-50 text-amber-700 border-amber-100" },
    { label: "SEO durumunu kontrol et", desc: "Dil bazlı SEO, H1 ve canlı görünüm.", tab: "seo", tone: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "Çevirileri tamamla", desc: "Canlı sayfa metinleri ve dil eksikleri.", tab: "translations", tone: "bg-cyan-50 text-cyan-700 border-cyan-100" },
    { label: "Yeni mesajlara bak", desc: "Form gönderileri ve pipeline.", tab: "leads", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#132175]">WillowSoft Admin</p>
            <h3 className="mt-2 text-2xl font-black text-[#131b2e]">Genel Bakış</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
              İçerik, SEO, çeviri ve form taleplerinin kısa durum özeti. Buradan hangi bölüme müdahale gerektiğini hızlıca görebilirsin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill label={isDirty ? "Kaydedilmemiş değişiklik var" : "Tüm değişiklikler kayıtlı"} tone={isDirty ? "amber" : "green"} />
            <StatusPill label={`${overview.newLeads} yeni mesaj`} tone={overview.newLeads ? "blue" : "green"} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <span className="text-xs font-black uppercase text-gray-400">İçerik sağlığı</span>
            <strong className="mt-3 block text-3xl font-black text-[#131b2e]">{contentHealth}%</strong>
            <div className="mt-3"><CoverageBar value={contentHealth} tone={contentTone} /></div>
            <p className="mt-2 text-xs text-gray-500">{readyContent}/{totalContent || 0} içerik hazır görünüyor</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <span className="text-xs font-black uppercase text-gray-400">SEO doluluk</span>
            <strong className="mt-3 block text-3xl font-black text-[#131b2e]">{overview.seoPercent}%</strong>
            <div className="mt-3"><CoverageBar value={overview.seoPercent} tone={seoTone} /></div>
            <p className="mt-2 text-xs text-gray-500">{overview.seoFilled}/{overview.seoTotal || 0} temel SEO alanı dolu</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <span className="text-xs font-black uppercase text-gray-400">Çeviri kapsamı</span>
            <strong className="mt-3 block text-3xl font-black text-[#131b2e]">{overview.translationPercent}%</strong>
            <div className="mt-3"><CoverageBar value={overview.translationPercent} tone={translationTone} /></div>
            <p className="mt-2 text-xs text-gray-500">{overview.translationFilled}/{overview.translationTotal || 0} sayfa metni dolu</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <span className="text-xs font-black uppercase text-gray-400">Aktif form talepleri</span>
            <strong className="mt-3 block text-3xl font-black text-[#131b2e]">{overview.activeLeads}</strong>
            <div className="mt-3"><CoverageBar value={leads.length ? pct(overview.activeLeads, leads.length) : 0} tone="blue" /></div>
            <p className="mt-2 text-xs text-gray-500">{leads.length} toplam form kaydı</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ["Ürünler", products.length, `${overview.readyProducts} hazır`, "products" as AdminTab],
              ["Haberler", news.length, `${overview.readyNews} hazır`, "news" as AdminTab],
              ["Çözümler", solutions.length, "yayında", "solutions" as AdminTab],
              ["Müşteriler", clients.length, `${overview.mediaReady}/${overview.mediaTotal || 0} görselli`, "clients" as AdminTab],
              ["Servisler", services.length, "yayında", "services" as AdminTab],
              ["SSS", faqs.length, "cevap", "faqs" as AdminTab],
              ["Sözlük", glossary.length, "terim", "health" as AdminTab],
              ["Mesajlar", leads.length, `${overview.newLeads} yeni`, "leads" as AdminTab],
            ].map(([label, value, note, tab]) => (
              <button
                key={label as string}
                type="button"
                onClick={() => onNavigate?.(tab as AdminTab)}
                className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#132175]/30 hover:shadow-md"
              >
                <span className="text-[10px] font-black uppercase tracking-wide text-gray-400">{label}</span>
                <strong className="mt-2 block text-2xl font-black text-[#131b2e]">{value as number}</strong>
                <p className="mt-1 text-xs font-semibold text-gray-500">{note as string}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-[#131b2e]">Hızlı aksiyonlar</h4>
                <p className="mt-1 text-xs text-gray-400">En sık bakılan yönetim işleri.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onNavigate?.(action.tab)}
                  className={`rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${action.tone}`}
                >
                  <strong className="block text-sm font-black">{action.label}</strong>
                  <span className="mt-1 block text-xs font-semibold opacity-75">{action.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-[#131b2e]">Son haberler</h4>
                <p className="mt-1 text-xs text-gray-400">Public News sayfasındaki içerik akışı.</p>
              </div>
              <button type="button" onClick={() => onNavigate?.("news")} className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200">
                Haberleri aç
              </button>
            </div>
            <div className="mt-4 divide-y divide-gray-100">
              {overview.latestNews.length ? overview.latestNews.map((item: any) => (
                <div key={item.id || item.slug || item.title} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-800">{item.title || "Başlıksız haber"}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{item.category || "kategori yok"} · {formatDate(item.date)}</p>
                  </div>
                  {item.featured && <StatusPill label="Öne çıkan" tone="blue" />}
                </div>
              )) : (
                <p className="py-6 text-center text-sm text-gray-400">Henüz haber yok.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-[#132175]/10 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#132175]">Public vitrin</span>
            <h4 className="mt-3 text-base font-black leading-snug text-[#131b2e]">
              {overview.featuredNews?.title || "Öne çıkan haber yok"}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {overview.featuredNews?.excerpt || "News sayfasında vitrine çıkan haber burada görünür."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill label={overview.featuredNews?.featured ? "Manuel öne çıkan" : "En yeni haber fallback"} tone={overview.featuredNews?.featured ? "blue" : "amber"} />
              <StatusPill label={formatDate(overview.featuredNews?.date)} tone="green" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-[#131b2e]">Son form talepleri</h4>
                <p className="mt-1 text-xs text-gray-400">Yeni müşteri temasları.</p>
              </div>
              <button type="button" onClick={() => onNavigate?.("leads")} className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200">
                Aç
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {overview.latestLeads.length ? overview.latestLeads.map((lead: any) => (
                <div key={lead.id || lead.email || lead.name} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="truncate text-sm font-black text-gray-800">{lead.name || "İsimsiz kişi"}</p>
                  <p className="mt-0.5 truncate text-xs text-[#132175]">{lead.email || "email yok"}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-gray-500">{lead.projectType || lead.subject || lead.message || "Konu girilmemiş"}</p>
                </div>
              )) : (
                <p className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-400">Henüz form talebi yok.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-black text-[#131b2e]">Hızlı site linkleri</h4>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["en", "tr", "de"].map((locale) => (
                <a
                  key={locale}
                  href={`/${locale}`}
                  target="_blank"
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center text-xs font-black uppercase text-gray-600 hover:bg-gray-100"
                >
                  {locale}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
