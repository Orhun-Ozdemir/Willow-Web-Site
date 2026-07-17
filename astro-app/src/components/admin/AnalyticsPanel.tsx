"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type RangeKey = "7d" | "30d" | "90d";
type RankedItem = { label: string; count: number };
type DailyItem = { date: string; pageViews: number; visitors: number; conversions: number };
type AnalyticsSummary = {
  range: RangeKey;
  totalEvents: number;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  returningVisitors: number;
  averageEngagementMs: number;
  bounceRate: number;
  conversions: number;
  conversionRate: number;
  topPages: RankedItem[];
  topCountries: RankedItem[];
  topCities: RankedItem[];
  topReferrers: RankedItem[];
  topDevices: RankedItem[];
  topBrowsers: RankedItem[];
  topEvents: RankedItem[];
  topProducts: RankedItem[];
  daily: DailyItem[];
};

type LatestEvent = {
  id: string;
  eventType: string;
  path: string;
  title: string;
  country: string;
  city: string;
  deviceType: string;
  browser: string;
  durationMs: number;
  createdAt: string;
};

const EVENT_LABELS: Record<string, string> = {
  page_view: "Sayfa görüntüleme",
  page_engagement: "Sayfa etkileşimi",
  scroll_depth: "Scroll derinliği",
  cta_click: "CTA tıklaması",
  nav_click: "Menü tıklaması",
  language_switch: "Dil değişimi",
  product_card_click: "Ürün kartı",
  product_view: "Ürün görüntüleme",
  document_download: "Doküman indirme",
  outbound_click: "Dış bağlantı",
  email_click: "E-posta tıklaması",
  phone_click: "Telefon tıklaması",
  whatsapp_click: "WhatsApp tıklaması",
  contact_form_start: "İletişim formu başlangıcı",
  contact_form_submit: "İletişim formu gönderimi",
  start_project_form_start: "Proje formu başlangıcı",
  start_project_form_submit: "Proje formu gönderimi",
  form_error: "Form hatası",
};

const DEVICE_LABELS: Record<string, string> = { desktop: "Masaüstü", mobile: "Mobil", tablet: "Tablet", unknown: "Bilinmiyor" };

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value || 0);
}

function formatDuration(value: number) {
  if (!value) return "0 sn";
  const seconds = Math.round(value / 1000);
  if (seconds < 60) return `${seconds} sn`;
  return `${Math.floor(seconds / 60)} dk ${seconds % 60} sn`;
}

function countryName(code: string) {
  if (!code) return "Bilinmiyor";
  try { return new Intl.DisplayNames(["tr"], { type: "region" }).of(code) || code; }
  catch { return code; }
}

function eventName(value: string) {
  return EVENT_LABELS[value] || value.replaceAll("_", " ");
}

function MetricCard({ label, value, note, tone = "blue" }: { label: string; value: string; note: string; tone?: "blue" | "cyan" | "green" | "violet" }) {
  const toneClass = tone === "green" ? "from-emerald-500/15 to-emerald-50 text-emerald-700" : tone === "cyan" ? "from-cyan-500/15 to-cyan-50 text-cyan-700" : tone === "violet" ? "from-violet-500/15 to-violet-50 text-violet-700" : "from-[#132175]/15 to-blue-50 text-[#132175]";
  return (
    <article className={`rounded-2xl border border-white bg-gradient-to-br ${toneClass} p-5 shadow-sm`}>
      <span className="text-[10px] font-black uppercase tracking-[0.14em] opacity-60">{label}</span>
      <strong className="mt-3 block text-3xl font-black tracking-tight">{value}</strong>
      <p className="mt-2 text-xs font-semibold opacity-65">{note}</p>
    </article>
  );
}

function Ranking({ title, subtitle, items, labelMap }: { title: string; subtitle: string; items: RankedItem[]; labelMap?: (label: string) => string }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h4 className="text-sm font-black text-[#131b2e]">{title}</h4>
      <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
      <div className="mt-5 space-y-4">
        {items.length ? items.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="min-w-0 truncate font-bold text-gray-700">{labelMap ? labelMap(item.label) : item.label}</span>
              <span className="shrink-0 font-black text-[#132175]">{formatNumber(item.count)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-gradient-to-r from-[#132175] to-[#2bb7df]" style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }} />
            </div>
          </div>
        )) : <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">Bu dönem için veri yok.</p>}
      </div>
    </section>
  );
}

export default function AnalyticsPanel() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [latest, setLatest] = useState<LatestEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/events?range=${range}`, { signal, credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Analytics yüklenemedi");
      setSummary(data.summary);
      setLatest(data.latest || []);
    } catch (err: any) {
      if (err?.name !== "AbortError") setError(err?.message || "Analytics yüklenemedi");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const chartMax = useMemo(() => Math.max(1, ...(summary?.daily || []).map((day) => day.pageViews)), [summary]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-[#101b58] p-6 text-white shadow-xl shadow-[#132175]/10 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Visitor Intelligence</p>
            <h3 className="mt-2 text-2xl font-black md:text-3xl">Site Analytics</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Anonim VisitorID ile ziyaret, ülke, şehir, trafik kaynağı, cihaz, ürün ilgisi ve form dönüşümlerini takip edin.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/8 p-1">
            {(["7d", "30d", "90d"] as RangeKey[]).map((item) => (
              <button key={item} type="button" onClick={() => setRange(item)} className={`rounded-lg px-3 py-2 text-xs font-black transition ${range === item ? "bg-white text-[#132175]" : "text-white/60 hover:text-white"}`}>
                {item === "7d" ? "7 gün" : item === "30d" ? "30 gün" : "90 gün"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <strong className="text-sm">Analytics verisi alınamadı</strong>
          <p className="mt-1 text-xs opacity-75">{error}</p>
          <button type="button" onClick={() => load()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-black text-white">Tekrar dene</button>
        </section>
      ) : loading && !summary ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-white" />)}</div>
      ) : summary ? (
        <>
          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <MetricCard label="Tekil ziyaretçi" value={formatNumber(summary.uniqueVisitors)} note={`${formatNumber(summary.returningVisitors)} geri dönen ziyaretçi`} />
            <MetricCard label="Session" value={formatNumber(summary.sessions)} note={`${formatNumber(summary.pageViews)} sayfa görüntüleme`} tone="cyan" />
            <MetricCard label="Ortalama etkileşim" value={formatDuration(summary.averageEngagementMs)} note={`Bounce oranı %${summary.bounceRate}`} tone="violet" />
            <MetricCard label="Dönüşüm" value={formatNumber(summary.conversions)} note={`Session dönüşüm oranı %${summary.conversionRate}`} tone="green" />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><h4 className="text-sm font-black text-[#131b2e]">Ziyaret eğilimi</h4><p className="mt-1 text-xs text-gray-400">Günlük sayfa görüntüleme ve tekil ziyaretçiler.</p></div>
              <button type="button" onClick={() => load()} disabled={loading} className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-black text-gray-600 disabled:opacity-50">{loading ? "Yenileniyor" : "Yenile"}</button>
            </div>
            <div className="mt-6 flex h-48 items-end gap-1.5 overflow-hidden border-b border-gray-100 pb-1">
              {summary.daily.length ? summary.daily.map((day) => (
                <div key={day.date} className="group relative flex h-full min-w-[8px] flex-1 items-end" title={`${day.date}: ${day.pageViews} görüntüleme, ${day.visitors} ziyaretçi`}>
                  <div className="w-full rounded-t-sm bg-gradient-to-t from-[#132175] to-[#34b9df] transition group-hover:brightness-110" style={{ height: `${Math.max(3, (day.pageViews / chartMax) * 100)}%` }} />
                </div>
              )) : <p className="m-auto text-xs text-gray-400">Grafik için henüz veri yok.</p>}
            </div>
            {summary.daily.length > 0 && <div className="mt-2 flex justify-between text-[10px] font-semibold text-gray-400"><span>{summary.daily[0]?.date}</span><span>{summary.daily.at(-1)?.date}</span></div>}
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <Ranking title="En çok ziyaret edilen sayfalar" subtitle="Page view sayısına göre" items={summary.topPages} />
            <Ranking title="Ülkeler" subtitle="Yaklaşık IP ülke sinyali" items={summary.topCountries} labelMap={countryName} />
            <Ranking title="Şehirler" subtitle="Vercel yaklaşık şehir sinyali" items={summary.topCities} />
            <Ranking title="Trafik kaynakları" subtitle="İlk yönlendiren domain" items={summary.topReferrers} />
            <Ranking title="Cihazlar" subtitle="Desktop, mobile ve tablet" items={summary.topDevices} labelMap={(label) => DEVICE_LABELS[label] || label} />
            <Ranking title="Browser dağılımı" subtitle="Ziyaretçinin Browser ailesi" items={summary.topBrowsers} />
            <Ranking title="Ürün ilgisi" subtitle="Ürün detay görüntülemeleri" items={summary.topProducts} />
            <Ranking title="Event dağılımı" subtitle="Ölçülen kullanıcı davranışları" items={summary.topEvents} labelMap={eventName} />
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5"><h4 className="text-sm font-black text-[#131b2e]">Son aktiviteler</h4><p className="mt-1 text-xs text-gray-400">Kişisel form içeriği veya tam IP gösterilmez.</p></div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wide text-gray-400"><tr><th className="px-5 py-3">Event</th><th className="px-5 py-3">Sayfa</th><th className="px-5 py-3">Konum</th><th className="px-5 py-3">Cihaz</th><th className="px-5 py-3">Zaman</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {latest.slice(0, 30).map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50/70">
                      <td className="whitespace-nowrap px-5 py-3 font-bold text-[#132175]">{eventName(event.eventType)}</td>
                      <td className="max-w-[300px] truncate px-5 py-3 text-gray-600" title={event.path}>{event.path || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-600">{[event.city, event.country].filter(Boolean).join(", ") || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-600">{DEVICE_LABELS[event.deviceType] || event.deviceType || "—"} · {event.browser || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-400">{new Date(event.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!latest.length && <p className="p-8 text-center text-sm text-gray-400">Henüz izinli Analytics eventi yok.</p>}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
