"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type RangeKey = "7d" | "30d" | "90d";
type RankedItem = { label: string; count: number };
type DailyItem = { date: string; pageViews: number; visitors: number; conversions: number };
type PagePerformanceItem = { path: string; pageViews: number; uniqueVisitors: number; sessions: number; averageEngagementMs: number; totalEngagementMs: number };
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
  pagePerformance: PagePerformanceItem[];
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

type IconName = "users" | "sessions" | "clock" | "conversion" | "refresh" | "shield" | "activity" | "globe" | "arrow";

const ICONS: Record<IconName, string> = {
  users: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m7-10a4 4 0 100-8 4 4 0 000 8zm13 10v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75",
  sessions: "M4 6h16M4 12h10M4 18h7m6-3 3 3-3 3",
  clock: "M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z",
  conversion: "M5 12l5 5L20 7",
  refresh: "M20 11a8.1 8.1 0 00-15.5-2M4 5v4h4m-4 4a8.1 8.1 0 0015.5 2M20 19v-4h-4",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-3-10 2 2 4-4",
  activity: "M3 12h4l2-7 4 14 2-7h6",
  globe: "M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.2-2.4 3.3-5.4 3.3-9S14.2 5.4 12 3m0 18c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3M3.5 9h17M3.5 15h17",
  arrow: "M5 12h14m-5-5 5 5-5 5",
};

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d={ICONS[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const METRIC_TONES = {
  blue: { icon: "bg-indigo-50 text-[#21348d]", line: "from-[#243d9f] to-[#6175d8]" },
  cyan: { icon: "bg-cyan-50 text-cyan-700", line: "from-[#1499c1] to-[#62d2e7]" },
  violet: { icon: "bg-violet-50 text-violet-700", line: "from-[#7050c8] to-[#ac87ef]" },
  green: { icon: "bg-emerald-50 text-emerald-700", line: "from-[#168c68] to-[#59c9a4]" },
};

function MetricCard({ label, value, note, tone, icon }: { label: string; value: string; note: string; tone: keyof typeof METRIC_TONES; icon: IconName }) {
  const colors = METRIC_TONES[tone];
  return (
    <article className="group relative overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(21,31,65,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(21,31,65,0.08)]">
      <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${colors.line}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</span>
          <strong className="mt-2 block text-[25px] font-black tracking-[-0.04em] text-[#111b3b] md:text-[28px]">{value}</strong>
        </div>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${colors.icon}`}><Icon name={icon} className="h-3.5 w-3.5" /></span>
      </div>
      <p className="mt-1.5 text-[10px] font-semibold leading-relaxed text-slate-400">{note}</p>
    </article>
  );
}

const RANKING_ACCENTS = {
  indigo: { bar: "from-[#233a95] to-[#6879d8]", badge: "bg-indigo-50 text-indigo-700" },
  cyan: { bar: "from-[#168cac] to-[#56c9df]", badge: "bg-cyan-50 text-cyan-700" },
  violet: { bar: "from-[#7251bd] to-[#b48bec]", badge: "bg-violet-50 text-violet-700" },
  emerald: { bar: "from-[#198865] to-[#60c7a4]", badge: "bg-emerald-50 text-emerald-700" },
};

function Ranking({ title, subtitle, items, labelMap, accent = "indigo" }: { title: string; subtitle: string; items: RankedItem[]; labelMap?: (label: string) => string; accent?: keyof typeof RANKING_ACCENTS }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  const colors = RANKING_ACCENTS[accent];
  return (
    <section className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(21,31,65,0.04)] md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div><h4 className="text-[13px] font-black tracking-tight text-[#121c3d]">{title}</h4><p className="mt-1 text-[10px] font-medium text-slate-400">{subtitle}</p></div>
        <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${colors.badge}`}>{formatNumber(items.reduce((sum, item) => sum + item.count, 0))}</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.length ? items.slice(0, 5).map((item, index) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center gap-2 text-[11px]">
              <span className="w-4 shrink-0 text-[9px] font-black text-slate-300">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1 truncate font-bold text-slate-600" title={item.label}>{labelMap ? labelMap(item.label) : item.label}</span>
              <span className="shrink-0 font-black tabular-nums text-[#172451]">{formatNumber(item.count)}</span>
            </div>
            <div className="ml-6 h-1 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`} style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }} />
            </div>
          </div>
        )) : <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-[11px] font-medium text-slate-400">Bu dönem için veri yok.</p>}
      </div>
    </section>
  );
}

function eventTone(eventType: string) {
  if (/_submit$/.test(eventType)) return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
  if (eventType === "form_error") return "bg-rose-50 text-rose-700 ring-rose-600/10";
  if (/product/.test(eventType)) return "bg-violet-50 text-violet-700 ring-violet-600/10";
  if (/click|download/.test(eventType)) return "bg-cyan-50 text-cyan-700 ring-cyan-600/10";
  return "bg-indigo-50 text-indigo-700 ring-indigo-600/10";
}

export default function AnalyticsPanel() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [latest, setLatest] = useState<LatestEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [insightGroup, setInsightGroup] = useState<"audience" | "behavior">("audience");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/events?range=${range}`, { signal, credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Analytics yüklenemedi");
      setSummary(data.summary);
      setLatest(data.latest || []);
      setLastUpdated(new Date());
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
  const chartGeometry = useMemo(() => {
    const days = summary?.daily || [];
    const point = (value: number, index: number) => {
      const x = days.length <= 1 ? 400 : 24 + (index / (days.length - 1)) * 752;
      const y = 194 - (value / chartMax) * 158;
      return [Number(x.toFixed(2)), Number(y.toFixed(2))];
    };
    const page = days.map((day, index) => point(day.pageViews, index));
    const visitors = days.map((day, index) => point(day.visitors, index));
    const path = (points: number[][]) => points.map(([x, y], index) => `${index ? "L" : "M"}${x},${y}`).join(" ");
    return { page, visitors, pagePath: path(page), visitorPath: path(visitors) };
  }, [summary, chartMax]);

  const pagesPerSession = summary?.sessions ? (summary.pageViews / summary.sessions).toFixed(1) : "0";
  const rangeLabel = range === "7d" ? "Son 7 gün" : range === "30d" ? "Son 30 gün" : "Son 90 gün";
  const pagePerformanceMax = Math.max(1, ...(summary?.pagePerformance || []).map((page) => page.pageViews));

  return (
    <div className="mx-auto max-w-[1580px] space-y-4 pb-6">
      <section className="relative isolate overflow-hidden rounded-[22px] bg-[#0f1949] p-5 text-white shadow-[0_18px_55px_rgba(15,25,73,0.18)] md:p-6">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="relative grid items-end gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-cyan-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]" /> First-party intelligence</span>
              <span className="text-[10px] font-semibold text-white/35">{rangeLabel}</span>
            </div>
            <h3 className="mt-3 max-w-3xl text-[27px] font-black tracking-[-0.045em] md:text-[34px]">Analytics <span className="font-medium text-white/42">Command Center</span></h3>
            <p className="mt-2 max-w-2xl text-[11px] font-medium leading-5 text-white/52">Ziyaretçi davranışı, içerik performansı ve dönüşüm sinyalleri için kompakt operasyon görünümü.</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[9px] font-semibold text-white/42">
              <span className="inline-flex items-center gap-2"><Icon name="shield" className="h-3.5 w-3.5 text-emerald-300" /> Anonim VisitorID</span>
              <span className="inline-flex items-center gap-2"><Icon name="globe" className="h-3.5 w-3.5 text-cyan-300" /> Yaklaşık konum</span>
              <span className="inline-flex items-center gap-2"><Icon name="activity" className="h-3.5 w-3.5 text-violet-300" /> Consent tabanlı ölçüm</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.065] p-3.5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Rapor aralığı</p><p className="mt-1 text-xs font-bold text-white/80">{rangeLabel}</p></div>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black text-emerald-300">LIVE DATA</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-black/15 p-1">
              {(["7d", "30d", "90d"] as RangeKey[]).map((item) => (
                <button key={item} type="button" onClick={() => setRange(item)} className={`rounded-lg px-3 py-2 text-[9px] font-black transition ${range === item ? "bg-white text-[#132175] shadow-lg" : "text-white/45 hover:bg-white/[0.06] hover:text-white"}`}>
                  {item === "7d" ? "7 Gün" : item === "30d" ? "30 Gün" : "90 Gün"}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[9px] font-semibold text-white/30"><span>{formatNumber(summary?.totalEvents || 0)} işlenmiş event</span><span>{lastUpdated ? `Güncellendi ${lastUpdated.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` : "Veri bekleniyor"}</span></div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-[22px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          <strong className="text-sm">Analytics verisi alınamadı</strong>
          <p className="mt-1 text-xs opacity-75">{error}</p>
          <button type="button" onClick={() => load()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-black text-white">Tekrar dene</button>
        </section>
      ) : loading && !summary ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-[18px] bg-white" />)}</div>
      ) : summary ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Tekil ziyaretçi" value={formatNumber(summary.uniqueVisitors)} note={`${formatNumber(summary.returningVisitors)} geri dönen ziyaretçi`} tone="blue" icon="users" />
            <MetricCard label="Aktif session" value={formatNumber(summary.sessions)} note={`${formatNumber(summary.pageViews)} toplam sayfa görüntüleme`} tone="cyan" icon="sessions" />
            <MetricCard label="Ortalama etkileşim" value={formatDuration(summary.averageEngagementMs)} note={`Bounce oranı %${summary.bounceRate}`} tone="violet" icon="clock" />
            <MetricCard label="Dönüşüm" value={formatNumber(summary.conversions)} note={`Session dönüşüm oranı %${summary.conversionRate}`} tone="green" icon="conversion" />
          </section>

          <section className="grid gap-3 xl:grid-cols-[minmax(0,1.85fr)_minmax(280px,.65fr)]">
            <div className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_32px_rgba(21,31,65,0.045)] md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-500">Traffic overview</p><h4 className="mt-1.5 text-[17px] font-black tracking-tight text-[#111b3b]">Ziyaret eğilimi</h4><p className="mt-1 text-[11px] text-slate-400">Günlük page view ve tekil ziyaretçi hareketi.</p></div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500"><i className="h-2 w-2 rounded-full bg-[#263f9d]" /> Page view</span>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500"><i className="h-2 w-2 rounded-full bg-[#38b9d5]" /> Ziyaretçi</span>
                  <button type="button" onClick={() => load()} disabled={loading} aria-label="Analytics verisini yenile" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 disabled:opacity-50"><Icon name="refresh" className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /></button>
                </div>
              </div>
              <div className="mt-3 h-[170px] w-full">
                {summary.daily.length ? (
                  <svg viewBox="0 0 800 220" className="h-full w-full overflow-visible" role="img" aria-label="Günlük ziyaret grafiği">
                    <defs>
                      <linearGradient id="analytics-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#304aa9" stopOpacity=".18" /><stop offset="1" stopColor="#304aa9" stopOpacity="0" /></linearGradient>
                    </defs>
                    {[36, 76, 116, 156, 196].map((y) => <line key={y} x1="24" x2="776" y1={y} y2={y} stroke="#e8ebf2" strokeWidth="1" strokeDasharray="4 6" />)}
                    <path d={`${chartGeometry.pagePath} L${chartGeometry.page.at(-1)?.[0] || 776},202 L${chartGeometry.page[0]?.[0] || 24},202 Z`} fill="url(#analytics-area)" />
                    <path d={chartGeometry.pagePath} fill="none" stroke="#263f9d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={chartGeometry.visitorPath} fill="none" stroke="#38b9d5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 5" />
                    {chartGeometry.page.map(([x, y], index) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="white" stroke="#263f9d" strokeWidth="2"><title>{`${summary.daily[index]?.date}: ${summary.daily[index]?.pageViews} görüntüleme`}</title></circle>)}
                  </svg>
                ) : <div className="grid h-full place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-400">Grafik için henüz veri yok.</div>}
              </div>
              {summary.daily.length > 0 && <div className="mt-1 flex justify-between border-t border-slate-100 pt-3 text-[9px] font-bold text-slate-400"><span>{summary.daily[0]?.date}</span><span>{summary.daily.at(-1)?.date}</span></div>}
            </div>

            <aside className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#17245d] to-[#10183f] p-5 text-white shadow-[0_12px_35px_rgba(18,28,79,0.14)]">
              <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-cyan-400/10 blur-2xl" />
              <div className="relative">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300">Journey quality</p>
                <h4 className="mt-2 text-lg font-black tracking-tight">Ziyaret özeti</h4>
                <div className="mt-4 space-y-4">
                  <div><div className="flex justify-between text-[10px] font-semibold text-white/48"><span>Sayfa / Session</span><strong className="text-sm text-white">{pagesPerSession}</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-300" style={{ width: `${Math.min(100, Number(pagesPerSession) * 25)}%` }} /></div></div>
                  <div><div className="flex justify-between text-[10px] font-semibold text-white/48"><span>Geri dönen ziyaretçi</span><strong className="text-sm text-white">{formatNumber(summary.returningVisitors)}</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-300" style={{ width: `${summary.uniqueVisitors ? Math.max(3, (summary.returningVisitors / summary.uniqueVisitors) * 100) : 0}%` }} /></div></div>
                  <div><div className="flex justify-between text-[10px] font-semibold text-white/48"><span>Conversion rate</span><strong className="text-sm text-white">%{summary.conversionRate}</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" style={{ width: `${Math.min(100, Math.max(summary.conversionRate ? 3 : 0, summary.conversionRate))}%` }} /></div></div>
                </div>
                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.055] p-3"><div className="flex items-center gap-2 text-[9px] font-black text-white/75"><Icon name="shield" className="h-3.5 w-3.5 text-emerald-300" /> Privacy-safe analytics</div><p className="mt-1.5 text-[8.5px] leading-4 text-white/35">Form içerikleri ve tam IP adresi raporlarda gösterilmez.</p></div>
              </div>
            </aside>
          </section>

          <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_10px_32px_rgba(21,31,65,0.045)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 md:px-5">
              <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-500">Page intelligence</p><h4 className="mt-1 text-[15px] font-black tracking-tight text-[#111b3b]">Sayfa performansı ve geçirilen süre</h4><p className="mt-1 text-[9px] font-medium text-slate-400">Hangi sayfaların görüntülendiğini ve ziyaretçilerin ortalama aktif süresini karşılaştırın.</p></div>
              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[9px] font-black text-indigo-700">{summary.pagePerformance?.length || 0} SAYFA</span>
            </div>
            <div className="max-h-[360px] overflow-auto">
              <table className="min-w-[760px] w-full text-left text-[10px]">
                <thead className="sticky top-0 z-10 bg-slate-50/95 text-[8.5px] font-black uppercase tracking-[0.13em] text-slate-400 backdrop-blur"><tr><th className="px-5 py-3">Sayfa</th><th className="px-4 py-3 text-right">Görüntülenme</th><th className="px-4 py-3 text-right">Ziyaretçi</th><th className="px-4 py-3 text-right">Ort. aktif süre</th><th className="px-5 py-3 text-right">Toplam süre</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {(summary.pagePerformance || []).map((page) => (
                    <tr key={page.path} className="transition hover:bg-indigo-50/25">
                      <td className="px-5 py-3">
                        <div className="max-w-[430px]"><p className="truncate font-bold text-[#172451]" title={page.path}>{page.path}</p><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#263f9d] to-[#52bfd8]" style={{ width: `${Math.max(3, (page.pageViews / pagePerformanceMax) * 100)}%` }} /></div></div>
                      </td>
                      <td className="px-4 py-3 text-right font-black tabular-nums text-slate-700">{formatNumber(page.pageViews)}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-500">{formatNumber(page.uniqueVisitors)}</td>
                      <td className="px-4 py-3 text-right"><span className="inline-flex min-w-[64px] justify-center rounded-lg bg-violet-50 px-2 py-1 font-black tabular-nums text-violet-700">{formatDuration(page.averageEngagementMs)}</span></td>
                      <td className="px-5 py-3 text-right font-bold tabular-nums text-slate-500">{formatDuration(page.totalEngagementMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!summary.pagePerformance?.length && <p className="p-8 text-center text-[10px] font-semibold text-slate-400">Sayfa süresi için henüz yeterli engagement verisi yok.</p>}
            </div>
          </section>

          <div className="flex flex-wrap items-end justify-between gap-3 pt-1">
            <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-500">Intelligence breakdown</p><h4 className="mt-1 text-[16px] font-black tracking-tight text-[#111b3b]">Kitle ve davranış kırılımı</h4></div>
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button type="button" onClick={() => setInsightGroup("audience")} className={`rounded-lg px-4 py-2 text-[9px] font-black transition ${insightGroup === "audience" ? "bg-[#17245d] text-white shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>Kitle</button>
              <button type="button" onClick={() => setInsightGroup("behavior")} className={`rounded-lg px-4 py-2 text-[9px] font-black transition ${insightGroup === "behavior" ? "bg-[#17245d] text-white shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>Davranış</button>
            </div>
          </div>
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-4">
            {insightGroup === "audience" ? <>
              <Ranking title="Ülkeler" subtitle="Yaklaşık IP ülke sinyali" items={summary.topCountries} labelMap={countryName} accent="cyan" />
              <Ranking title="Şehirler" subtitle="Vercel yaklaşık şehir sinyali" items={summary.topCities} accent="cyan" />
              <Ranking title="Cihazlar" subtitle="Desktop, mobile ve tablet" items={summary.topDevices} labelMap={(label) => DEVICE_LABELS[label] || label} accent="indigo" />
              <Ranking title="Browser dağılımı" subtitle="Ziyaretçinin Browser ailesi" items={summary.topBrowsers} accent="violet" />
            </> : <>
              <Ranking title="En çok ziyaret edilen sayfalar" subtitle="Page view hacmine göre" items={summary.topPages} accent="indigo" />
              <Ranking title="Trafik kaynakları" subtitle="Yönlendiren domain dağılımı" items={summary.topReferrers} accent="violet" />
              <Ranking title="Ürün ilgisi" subtitle="Ürün detay görüntülemeleri" items={summary.topProducts} accent="emerald" />
              <Ranking title="Event dağılımı" subtitle="Ölçülen kullanıcı davranışları" items={summary.topEvents} labelMap={eventName} accent="emerald" />
            </>}
          </section>

          <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_10px_32px_rgba(21,31,65,0.045)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 md:px-5"><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-500">Event stream</p><h4 className="mt-1 text-[15px] font-black tracking-tight text-[#111b3b]">Son aktiviteler</h4></div><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-700"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> {Math.min(latest.length, 12)} SON KAYIT</span></div>
            <div className="max-h-[430px] overflow-auto">
              <table className="min-w-full text-left text-[11px]">
                <thead className="bg-slate-50/80 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400"><tr><th className="px-5 py-3.5 md:px-7">Event</th><th className="px-5 py-3.5">Sayfa</th><th className="px-5 py-3.5">Konum</th><th className="px-5 py-3.5">Cihaz</th><th className="px-5 py-3.5 md:px-7">Zaman</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {latest.slice(0, 12).map((event) => (
                    <tr key={event.id} className="transition hover:bg-indigo-50/25">
                      <td className="whitespace-nowrap px-5 py-3.5 md:px-7"><span className={`inline-flex rounded-lg px-2.5 py-1.5 text-[9px] font-black ring-1 ring-inset ${eventTone(event.eventType)}`}>{eventName(event.eventType)}</span></td>
                      <td className="max-w-[300px] truncate px-5 py-3.5 font-semibold text-slate-600" title={event.path}>{event.path || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{[event.city, event.country].filter(Boolean).join(", ") || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{DEVICE_LABELS[event.deviceType] || event.deviceType || "—"} <span className="text-slate-300">·</span> {event.browser || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-400 md:px-7">{new Date(event.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!latest.length && <p className="p-10 text-center text-[11px] font-semibold text-slate-400">Henüz izinli Analytics eventi yok.</p>}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
