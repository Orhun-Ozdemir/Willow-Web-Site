"use client";

import { useMemo, useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import { specialDays as defaultSpecialDays, type CelebrationMotif, type SpecialDay } from "@/data/special-days";
import { useAdmin } from "./AdminContext";

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const MOTIFS: { value: CelebrationMotif; label: string }[] = [
  { value: "crescent", label: "Ay ve yıldız" }, { value: "modules", label: "Modüler şekiller" },
  { value: "horizon", label: "Ufuk" }, { value: "rays", label: "Işınlar" },
  { value: "stars", label: "Yıldızlar" }, { value: "harvest", label: "Hasat" },
  { value: "cross", label: "Çapraz form" }, { value: "unity", label: "Birleşme" },
  { value: "bands", label: "Renk bantları" }, { value: "sun", label: "Güneş" },
  { value: "geometry", label: "Geometrik desen" }, { value: "serrated", label: "Tırtıklı form" },
  { value: "orbit", label: "Yörünge" },
];

const deepCopy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

function dateForYear(day: SpecialDay, year: number): Date {
  if (day.date.type === "fixed") return new Date(year, day.date.month - 1, day.date.day, 12);
  const first = new Date(year, day.date.month - 1, 1, 12);
  const offset = (day.date.weekday - first.getDay() + 7) % 7;
  return new Date(year, day.date.month - 1, 1 + offset + (day.date.nth - 1) * 7, 12);
}

function isoDayString(day: SpecialDay, year: number): string {
  if (day.date.type === "fixed") {
    const mm = String(day.date.month).padStart(2, "0");
    const dd = String(day.date.day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }
  const d = dateForYear(day, year);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function dateLabel(day: SpecialDay, year: number) {
  return dateForYear(day, year).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function eventName(day: SpecialDay) {
  return day.greeting?.tr?.accent || day.greeting?.en?.accent || day.id;
}

function motifFor(day: SpecialDay): CelebrationMotif {
  if (day.motif) return day.motif;
  if (day.id === "tr-republic-day") return "crescent";
  if (["tr-national-sovereignty-day", "pt-republic-day"].includes(day.id)) return "modules";
  if (day.id === "tr-youth-sports-day") return "horizon";
  if (["tr-victory-day", "es-fiesta-nacional", "pt-liberty-day"].includes(day.id)) return "rays";
  if (day.id === "us-independence-day") return "stars";
  if (day.id === "us-thanksgiving") return "harvest";
  if (["gb-st-georges-day", "pt-restoration-day"].includes(day.id)) return "cross";
  if (day.id === "de-unity-day") return "unity";
  if (["fr-bastille-day", "it-republic-day", "ae-national-day"].includes(day.id)) return "bands";
  if (day.id === "jp-foundation-day") return "sun";
  if (["sa-national-day", "sa-founding-day"].includes(day.id)) return "geometry";
  if (day.id === "qa-national-day") return "serrated";
  if (day.id === "pt-portugal-day") return "orbit";
  return "orbit";
}

function resolveTargetLocale(day: SpecialDay, currentLocale: Locale): string {
  const c = (day.countries[0] || "").toUpperCase();
  if (c === "TR") return "tr";
  if (c === "DE") return "de";
  if (c === "FR") return "fr";
  if (c === "ES") return "es";
  if (c === "IT") return "it";
  if (c === "JP") return "ja";
  if (["SA", "QA", "AE"].includes(c)) return "ar";
  if (locales.includes(currentLocale)) return currentLocale;
  return "en";
}

function PreviewCard({ day, locale }: { day: SpecialDay; locale: Locale }) {
  const greeting = day.greeting?.[locale] || day.greeting?.en || day.greeting?.tr;
  const sampleDate = dateForYear(day, new Date().getFullYear());
  const activeCountry = day.countries.find((code) => code !== "*") || "TR";

  return (
    <div
      className="relative min-h-[260px] overflow-hidden rounded-3xl border border-white/20 p-6 text-white shadow-2xl"
      style={{ background: "#06070b" }}
    >
      {/* 3D WebP Flag Artwork Backdrop Preview */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}assets/special-days/${day.id}.webp`}
          alt=""
          className="h-full w-full object-cover object-right opacity-75"
          onError={(e) => { (e.target as HTMLElement).style.opacity = "0"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070b] via-[#06070b]/80 to-transparent" />
      </div>

      {/* Flag SVG Badge */}
      <div className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 backdrop-blur-md">
        <img
          src={`${import.meta.env.BASE_URL}assets/flags/${day.flag}.svg`}
          alt=""
          className="h-4 w-6 rounded object-cover shadow-sm"
          onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
        />
        <span className="text-[10px] font-black tracking-widest text-white/90">{activeCountry}</span>
      </div>

      {/* Hero Typography Overlay */}
      <div className="relative z-10 mt-14 max-w-[88%]">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-white/80">
          <span className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: day.accentColor }} />
          <span>WILLOWSOFT KUTLUYOR • {activeCountry}</span>
        </div>
        <p className="mt-2 text-xs font-black uppercase tracking-wider text-white/90">{greeting?.title}</p>
        <h4
          className="mt-1 text-2xl font-normal italic leading-snug drop-shadow-md"
          style={{ fontFamily: "var(--font-serif, serif)", color: "#ffffff", textShadow: `0 0 20px ${day.accentColor}` }}
        >
          {greeting?.accent}
        </h4>
        <div className="mt-4 flex items-center gap-3 text-[10px] font-bold text-white/70">
          <span className="h-px w-6" style={{ background: day.accentColor }} />
          <span className="truncate">{greeting?.subline}</span>
        </div>
      </div>
    </div>
  );
}

export default function SpecialDaysPanel() {
  const { content, setContent, dirtyKeys } = useAdmin();
  const storedDays = Array.isArray(content?.meta?.specialDays) && content.meta.specialDays.length
    ? content.meta.specialDays as SpecialDay[]
    : deepCopy(defaultSpecialDays);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedId, setSelectedId] = useState(storedDays[0]?.id || "");
  const [locale, setLocale] = useState<Locale>("tr");
  const [query, setQuery] = useState("");

  const selected = storedDays.find((day) => day.id === selectedId) || storedDays[0];
  const enabledCount = storedDays.filter((day) => day.enabled !== false).length;
  const countryCount = new Set(storedDays.flatMap((day) => day.countries).filter((code) => code !== "*")).size;

  const ordered = useMemo(() => [...storedDays].sort((a, b) => dateForYear(a, year).getTime() - dateForYear(b, year).getTime()), [storedDays, year]);
  const filtered = ordered.filter((day) => `${eventName(day)} ${day.id} ${day.countries.join(" ")}`.toLowerCase().includes(query.toLowerCase()));

  const commit = (days: SpecialDay[]) => setContent((prev: any) => ({ ...prev, meta: { ...(prev?.meta || {}), specialDays: days } }));
  const updateSelected = (updater: (day: SpecialDay) => SpecialDay) => commit(storedDays.map((day) => day.id === selected.id ? updater(deepCopy(day)) : day));

  const addDay = () => {
    const id = `custom-${Date.now()}`;
    const greeting = Object.fromEntries(locales.map((loc) => [loc, { title: loc === "tr" ? "Kutlu" : "Happy", accent: loc === "tr" ? "Özel Gün" : "Special Day", subline: loc === "tr" ? "Kutlu olsun — WillowSoft" : "Best wishes — WillowSoft" }])) as SpecialDay["greeting"];
    const next: SpecialDay = { id, enabled: false, countries: ["TR"], date: { type: "fixed", month: 1, day: 1 }, style: "confetti", accentColor: "#132175", secondaryColor: "#23A8D8", flag: "tr", motif: "orbit", greeting };
    commit([...storedDays, next]);
    setSelectedId(id);
    setView("list");
  };

  if (!selected) return null;

  const targetIsoDay = isoDayString(selected, year);
  const activeCountryCode = selected.countries.find((code) => code !== "*") || "TR";
  const targetLocale = resolveTargetLocale(selected, locale);
  const previewHref = `/${targetLocale}?willow-preview-day=${targetIsoDay}&willow-preview-country=${activeCountryCode}`;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-[#132175]/10 bg-[linear-gradient(135deg,#101b68,#25368f)] p-6 text-white shadow-xl shadow-[#132175]/10 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-200">Editorial Moments</p>
            <h3 className="mt-2 text-2xl font-black md:text-3xl">Özel Günler</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">Ülke ve tarihe göre yayınlanan tipografik Hero animasyonlarını, Navbar mesajlarını ve çevirilerini buradan planlayabilirsin.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => commit(deepCopy(defaultSpecialDays))} className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white/15">Varsayılanları yükle</button>
            <button type="button" onClick={addDay} className="rounded-xl bg-white px-4 py-2 text-xs font-black text-[#132175] shadow-lg">+ Yeni özel gün</button>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[["Toplam etkinlik", storedDays.length], ["Yayına açık", enabledCount], ["Hedef ülke", countryCount], ["Kaydetme durumu", dirtyKeys.includes("meta") ? "Bekliyor" : "Kayıtlı"]].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur"><span className="text-[9px] font-black uppercase tracking-widest text-white/45">{label}</span><strong className="mt-2 block text-2xl font-black">{value}</strong></div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-xl bg-gray-100 p-1">
            {(["calendar", "list"] as const).map((mode) => <button key={mode} onClick={() => setView(mode)} className={`rounded-lg px-4 py-2 text-xs font-black ${view === mode ? "bg-white text-[#132175] shadow-sm" : "text-gray-500"}`}>{mode === "calendar" ? "Takvim" : "Liste"}</button>)}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setYear((value) => value - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-500">←</button>
            <strong className="min-w-16 text-center text-sm text-[#131b2e]">{year}</strong>
            <button onClick={() => setYear((value) => value + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-500">→</button>
          </div>
        </div>

        {view === "calendar" ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {MONTHS.map((month, monthIndex) => {
              const events = ordered.filter((day) => dateForYear(day, year).getMonth() === monthIndex);
              return <div key={month} className="min-h-36 rounded-2xl border border-gray-100 bg-gray-50/70 p-4"><div className="flex items-center justify-between"><h4 className="text-xs font-black uppercase tracking-wider text-[#131b2e]">{month}</h4><span className="text-[10px] font-bold text-gray-400">{events.length || "—"}</span></div><div className="mt-3 space-y-2">{events.map((day) => <button key={day.id} onClick={() => setSelectedId(day.id)} className={`flex w-full items-center gap-2 rounded-xl border p-2 text-left transition ${selected.id === day.id ? "border-[#132175]/25 bg-white shadow-sm" : "border-transparent bg-white/65 hover:border-gray-200"}`}><span className="h-8 w-1 rounded-full" style={{ background: day.enabled === false ? "#cbd5e1" : day.accentColor }} /><span className="min-w-0 flex-1"><strong className="block truncate text-[11px] text-[#131b2e]">{eventName(day)}</strong><small className="text-[9px] font-bold text-gray-400">{dateForYear(day, year).getDate()} · {day.countries.join(", ")}</small></span>{day.enabled === false && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[8px] font-black text-gray-400">KAPALI</span>}</button>)}</div></div>;
            })}
          </div>
        ) : (
          <div className="mt-5">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Özel gün, ülke veya ID ara..." className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#132175]/40" />
            <div className="divide-y divide-gray-100">{filtered.map((day) => <button key={day.id} onClick={() => setSelectedId(day.id)} className="grid w-full grid-cols-[64px_1fr_auto] items-center gap-4 py-3 text-left"><div className="grid h-12 place-items-center rounded-xl text-xs font-black" style={{ color: day.accentColor, background: `${day.accentColor}12` }}>{dateForYear(day, year).getDate()}<span className="-mt-2 text-[8px] uppercase">{MONTHS[dateForYear(day, year).getMonth()].slice(0, 3)}</span></div><div><strong className="text-sm text-[#131b2e]">{eventName(day)}</strong><p className="mt-1 text-[10px] font-semibold text-gray-400">{day.countries.join(", ")} · {motifFor(day)}</p></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${day.enabled === false ? "bg-gray-100 text-gray-400" : "bg-emerald-50 text-emerald-700"}`}>{day.enabled === false ? "Kapalı" : "Yayında"}</span></button>)}</div>
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)]">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-5"><div><p className="text-[10px] font-black uppercase tracking-widest text-[#132175]">Etkinlik ayarları</p><h3 className="mt-1 text-xl font-black text-[#131b2e]">{eventName(selected)}</h3><code className="mt-1 block text-[10px] text-gray-400">{selected.id}</code></div><label className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 px-3 py-2"><span className="text-xs font-black text-gray-600">Yayında</span><input type="checkbox" checked={selected.enabled !== false} onChange={(event) => updateSelected((day) => ({ ...day, enabled: event.target.checked }))} className="h-4 w-4 accent-[#132175]" /></label></div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-xs font-black text-gray-600">Ülkeler <span className="font-medium text-gray-400">(ISO, virgülle)</span><input value={selected.countries.join(", ")} onChange={(event) => updateSelected((day) => ({ ...day, countries: event.target.value.toUpperCase().split(",").map((value) => value.trim()).filter(Boolean) }))} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none focus:border-[#132175]/40" /></label>
            <label className="text-xs font-black text-gray-600">Bayrak kodu<input value={selected.flag} onChange={(event) => updateSelected((day) => ({ ...day, flag: event.target.value.toLowerCase().trim() }))} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-medium outline-none focus:border-[#132175]/40" /></label>
            <label className="text-xs font-black text-gray-600">Tarih türü<select value={selected.date.type} onChange={(event) => updateSelected((day) => ({ ...day, date: event.target.value === "fixed" ? { type: "fixed", month: 1, day: 1 } : { type: "nth-weekday", month: 1, weekday: 1, nth: 1 } }))} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5"><option value="fixed">Sabit tarih</option><option value="nth-weekday">Ayın belirli haftası</option></select></label>
            <label className="text-xs font-black text-gray-600">Görsel motif<select value={motifFor(selected)} onChange={(event) => updateSelected((day) => ({ ...day, motif: event.target.value as CelebrationMotif }))} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5">{MOTIFS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          </div>

          {selected.date.type === "fixed" ? <div className="mt-4 grid grid-cols-2 gap-4"><label className="text-xs font-black text-gray-600">Ay<input type="number" min={1} max={12} value={selected.date.month} onChange={(event) => updateSelected((day) => ({ ...day, date: { type: "fixed", month: Number(event.target.value), day: day.date.type === "fixed" ? day.date.day : 1 } }))} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5" /></label><label className="text-xs font-black text-gray-600">Gün<input type="number" min={1} max={31} value={selected.date.day} onChange={(event) => updateSelected((day) => ({ ...day, date: { type: "fixed", month: day.date.type === "fixed" ? day.date.month : 1, day: Number(event.target.value) } }))} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5" /></label></div> : <div className="mt-4 grid grid-cols-3 gap-3"><label className="text-xs font-black text-gray-600">Ay<input type="number" min={1} max={12} value={selected.date.month} onChange={(event) => updateSelected((day) => ({ ...day, date: { ...(day.date as any), month: Number(event.target.value) } }))} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5" /></label><label className="text-xs font-black text-gray-600">Hafta<select value={selected.date.nth} onChange={(event) => updateSelected((day) => ({ ...day, date: { ...(day.date as any), nth: Number(event.target.value) } }))} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5">{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}.</option>)}</select></label><label className="text-xs font-black text-gray-600">Gün<select value={selected.date.weekday} onChange={(event) => updateSelected((day) => ({ ...day, date: { ...(day.date as any), weekday: Number(event.target.value) } }))} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5">{WEEKDAYS.map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label></div>}

          <div className="mt-4 grid grid-cols-2 gap-4"><label className="text-xs font-black text-gray-600">Ana renk<div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-200 p-2"><input type="color" value={selected.accentColor} onChange={(event) => updateSelected((day) => ({ ...day, accentColor: event.target.value }))} className="h-8 w-10 border-0 bg-transparent" /><span className="text-xs font-bold text-gray-500">{selected.accentColor}</span></div></label><label className="text-xs font-black text-gray-600">İkincil renk<div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-200 p-2"><input type="color" value={selected.secondaryColor || selected.accentColor} onChange={(event) => updateSelected((day) => ({ ...day, secondaryColor: event.target.value }))} className="h-8 w-10 border-0 bg-transparent" /><span className="text-xs font-bold text-gray-500">{selected.secondaryColor || selected.accentColor}</span></div></label></div>

          <div className="mt-6 border-t border-gray-100 pt-5"><div className="flex flex-wrap gap-1.5">{locales.map((loc) => <button key={loc} onClick={() => setLocale(loc)} className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase ${locale === loc ? "bg-[#132175] text-white" : "bg-gray-100 text-gray-500"}`}>{loc}</button>)}</div><div className="mt-4 grid gap-4"><label className="text-xs font-black text-gray-600">Üst başlık<input value={selected.greeting?.[locale]?.title || ""} onChange={(event) => updateSelected((day) => ({ ...day, greeting: { ...day.greeting, [locale]: { ...(day.greeting?.[locale] || { accent: "", subline: "" }), title: event.target.value } } }))} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5" /></label><label className="text-xs font-black text-gray-600">Ana kutlama başlığı<input value={selected.greeting?.[locale]?.accent || ""} onChange={(event) => updateSelected((day) => ({ ...day, greeting: { ...day.greeting, [locale]: { ...(day.greeting?.[locale] || { title: "", subline: "" }), accent: event.target.value } } }))} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5" /></label><label className="text-xs font-black text-gray-600">İmza mesajı<input value={selected.greeting?.[locale]?.subline || ""} onChange={(event) => updateSelected((day) => ({ ...day, greeting: { ...day.greeting, [locale]: { ...(day.greeting?.[locale] || { title: "", accent: "" }), subline: event.target.value } } }))} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5" /></label></div></div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <PreviewCard day={selected} locale={locale} />
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Yayın özeti</p><strong className="mt-1 block text-sm text-[#131b2e]">{dateLabel(selected, year)} · {selected.countries.join(", ")}</strong></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${selected.enabled === false ? "bg-gray-100 text-gray-400" : "bg-emerald-50 text-emerald-700"}`}>{selected.enabled === false ? "Kapalı" : "Hazır"}</span></div><p className="mt-3 text-xs leading-relaxed text-gray-500">Hero animasyonu 5,8 saniye oynar; ardından Navbar mesajı gün boyunca kalır.</p><a href={previewHref} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center rounded-xl border border-[#132175]/15 bg-[#132175]/5 px-4 py-2.5 text-xs font-black text-[#132175]">Tarayıcı önizlemesini aç ↗</a></div>
          {selected.id.startsWith("custom-") && <button type="button" onClick={() => { commit(storedDays.filter((day) => day.id !== selected.id)); setSelectedId(storedDays.find((day) => day.id !== selected.id)?.id || ""); }} className="w-full rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-black text-red-600">Bu özel günü sil</button>}
        </aside>
      </section>
    </div>
  );
}
