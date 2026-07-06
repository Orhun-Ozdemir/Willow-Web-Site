"use client";

import { useState, useMemo } from "react";
import { type Locale } from "@/lib/cms";
import { resolveAdminImageSrc, imageInputValue } from "@/lib/admin-media";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import TranslationEditor from "./TranslationEditor";

type SubTab = "solutions" | "general" | "selector" | "flow" | "why";

const SUB_TABS: { key: SubTab; label: string; desc: string; icon: string }[] = [
  { key: "solutions", label: "Kullanım Senaryoları", desc: "Sitedeki çözüm kartları — görsel, başlık, kategori", icon: "🗂️" },
  { key: "general", label: "Sayfa Metinleri", desc: "Hero, metrikler ve bölüm başlıkları", icon: "📝" },
  { key: "selector", label: "Yol Seçici", desc: "“Görünürlük / müdahale / entegrasyon” kartları", icon: "🧭" },
  { key: "flow", label: "Nasıl Çalışır", desc: "Ölç → İlet → İşle → Görselleştir → Eylem adımları", icon: "⚡" },
  { key: "why", label: "Neden WillowSoft", desc: "Güçlü yönler / ilkeler kartları", icon: "✦" },
];

const SOLUTION_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "category", label: "Kategori" },
  { key: "headline", label: "Başlık Satırı" },
  { key: "summary", label: "Özet", type: "textarea" as const },
  { key: "bullets", label: "Madde İşaretleri (satır başına 1)", type: "textarea" as const, rows: 5 },
];

const GENERAL_FIELDS = [
  { key: "heroEyebrow", label: "Hero Üst Etiket" },
  { key: "heroTitle", label: "Hero Başlık" },
  { key: "heroLead", label: "Hero Açıklama", type: "textarea" as const, rows: 3 },
  { key: "useCasesEyebrow", label: "Kullanım Alanları Üst Etiket" },
  { key: "useCasesTitle", label: "Kullanım Alanları Başlık" },
  { key: "useCasesLead", label: "Kullanım Alanları Açıklama", type: "textarea" as const, rows: 3 },
  { key: "showcaseEyebrow", label: "Showcase Yan Panel Üst Etiket" },
  { key: "showcaseTitle", label: "Showcase Yan Panel Başlık" },
  { key: "showcaseLead", label: "Showcase Yan Panel Açıklama", type: "textarea" as const, rows: 3 },
  { key: "selectorEyebrow", label: "Seçim Yolu Üst Etiket" },
  { key: "selectorTitle", label: "Seçim Yolu Başlık" },
  { key: "selectorLead", label: "Seçim Yolu Açıklama", type: "textarea" as const, rows: 3 },
  { key: "howEyebrow", label: "Nasıl Çalışır Üst Etiket" },
  { key: "howTitle", label: "Nasıl Çalışır Başlık" },
  { key: "howLead", label: "Nasıl Çalışır Açıklama", type: "textarea" as const, rows: 3 },
  { key: "whyEyebrow", label: "Neden WillowSoft Üst Etiket" },
  { key: "whyTitle", label: "Neden WillowSoft Başlık" },
  { key: "finalCtaEyebrow", label: "Son CTA Üst Etiket" },
  { key: "finalCtaTitle", label: "Son CTA Başlık" },
  { key: "finalCtaLead", label: "Son CTA Açıklama", type: "textarea" as const, rows: 3 },
  { key: "finalCtaButton", label: "Son CTA Buton Metni" },
  { key: "metric1Label", label: "Metrik 1 Etiketi" },
  { key: "metric2Label", label: "Metrik 2 Etiketi" },
  { key: "metric3Label", label: "Metrik 3 Etiketi" }
];

const SELECTOR_TRANSLATION_FIELDS = [
  { key: "eyebrow", label: "Üst Başlık" },
  { key: "title", label: "Başlık" },
  { key: "body", label: "Açıklama", type: "textarea" as const, rows: 3 },
  { key: "bullets", label: "Madde İşaretleri (satır başına 1)", type: "textarea" as const, rows: 4 }
];

const FLOW_TRANSLATION_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "body", label: "Açıklama", type: "textarea" as const, rows: 3 }
];

const WHY_TRANSLATION_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "body", label: "Açıklama", type: "textarea" as const, rows: 3 }
];

const getNextSortOrder = (items: any[]) => {
  const maxSortOrder = Math.max(
    0,
    ...(items || [])
      .map((item) => Number(item?.sortOrder))
      .filter((order) => Number.isFinite(order))
  );
  return maxSortOrder + 1;
};

export default function SolutionsPanel() {
  const { content, setContent } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("solutions");
  const [editId, setEditId] = useState<string | null>(null);

  // Sub-editor edit indices
  const [editingSelectorIdx, setEditingSelectorIdx] = useState<number | null>(null);
  const [editingFlowIdx, setEditingFlowIdx] = useState<number | null>(null);
  const [editingWhyIdx, setEditingWhyIdx] = useState<number | null>(null);

  const solutions = useMemo(() => {
    const list = content?.solutions || [];
    return list.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `solution-${idx}`,
    }));
  }, [content?.solutions]);

  const solutionsPage = content?.pageContent?.solutions || {};
  const selectorCards = solutionsPage.selectorCards || [];
  const howItWorksSteps = solutionsPage.howItWorksSteps || [];
  const whyCards = solutionsPage.whyCards || [];

  // Use Case Solutions collection updates
  const updateSolution = (id: string, key: string, val: any) => {
    setContent((c: any) => {
      const list = (c.solutions || []).map((item: any, idx: number) => {
        const itemId = item.id || `solution-${idx}`;
        if (itemId === id) {
          return { ...item, id: itemId, [key]: val };
        }
        return item;
      });
      return { ...c, solutions: list };
    });
  };

  const updateLocalized = (id: string, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = (c.solutions || []).map((item: any, idx: number) => {
        const itemId = item.id || `solution-${idx}`;
        if (itemId === id) {
          const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
          return { ...item, id: itemId, localized };
        }
        return item;
      });
      return { ...c, solutions: list };
    });
  };

  const addSolution = () => {
    const id = `solution-${Date.now()}`;
    setContent((c: any) => ({
      ...c,
      solutions: [...(c.solutions || []), { id, title: "Yeni Çözüm", slug: id, category: "", featured: false, headline: "", summary: "", bullets: "", localized: {} }],
    }));
    setEditId(id);
  };

  const deleteSolution = (id: string) => {
    if (!confirm("Bu çözümü silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const list = (c.solutions || []).filter((item: any, idx: number) => {
        const itemId = item.id || `solution-${idx}`;
        return itemId !== id;
      });
      return { ...c, solutions: list };
    });
    setEditId(null);
  };

  // Solutions Page General Content updates
  const updateGeneralField = (key: string, value: any) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      pc.solutions = { ...(pc.solutions || {}), [key]: value };
      return { ...c, pageContent: pc };
    });
  };

  const updateGeneralLocalized = (locale: Locale, key: string, value: string) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      sol[key] = { ...(sol[key] || {}), [locale]: value };
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
  };

  // Selector Cards updates
  const addSelectorCard = () => {
    const id = `selector-${Date.now()}`;
    const newCard = { id, eyebrow: "Need visibility?", title: "Remote Monitoring", body: "Description...", bullets: [], sortOrder: getNextSortOrder(selectorCards), localized: {} };
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      sol.selectorCards = [...(sol.selectorCards || []), newCard];
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
    setEditingSelectorIdx(selectorCards.length);
  };

  const updateSelectorCard = (idx: number, key: string, val: any) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      const list = [...(sol.selectorCards || [])];
      list[idx] = { ...list[idx], [key]: val };
      sol.selectorCards = list;
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
  };

  const updateSelectorCardLocalized = (idx: number, locale: Locale, key: string, val: any) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      const list = [...(sol.selectorCards || [])];
      const item = { ...list[idx] };
      const parsedVal = key === "bullets" && typeof val === "string"
        ? val.split("\n").map((t: string) => t.trim()).filter(Boolean)
        : val;
      item.localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [key]: parsedVal } };
      list[idx] = item;
      sol.selectorCards = list;
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
  };

  const deleteSelectorCard = (id: string) => {
    if (!confirm("Bu kartı silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      sol.selectorCards = (sol.selectorCards || []).filter((x: any) => x.id !== id);
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
    setEditingSelectorIdx(null);
  };

  // Flow Steps updates
  const addFlowStep = () => {
    const id = `flow-${Date.now()}`;
    const newStep = { id, title: "Yeni Aşama", body: "Açıklama...", sortOrder: getNextSortOrder(howItWorksSteps), localized: {} };
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      sol.howItWorksSteps = [...(sol.howItWorksSteps || []), newStep];
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
    setEditingFlowIdx(howItWorksSteps.length);
  };

  const updateFlowStep = (idx: number, key: string, val: any) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      const list = [...(sol.howItWorksSteps || [])];
      list[idx] = { ...list[idx], [key]: val };
      sol.howItWorksSteps = list;
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
  };

  const updateFlowStepLocalized = (idx: number, locale: Locale, key: string, val: any) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      const list = [...(sol.howItWorksSteps || [])];
      const item = { ...list[idx] };
      item.localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [key]: val } };
      list[idx] = item;
      sol.howItWorksSteps = list;
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
  };

  const deleteFlowStep = (id: string) => {
    if (!confirm("Bu adımı silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      sol.howItWorksSteps = (sol.howItWorksSteps || []).filter((x: any) => x.id !== id);
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
    setEditingFlowIdx(null);
  };

  // Why Cards updates
  const addWhyCard = () => {
    const id = `why-${Date.now()}`;
    const newCard = { id, title: "Yeni Özellik", body: "Açıklama...", sortOrder: getNextSortOrder(whyCards), localized: {} };
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      sol.whyCards = [...(sol.whyCards || []), newCard];
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
    setEditingWhyIdx(whyCards.length);
  };

  const updateWhyCard = (idx: number, key: string, val: any) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      const list = [...(sol.whyCards || [])];
      list[idx] = { ...list[idx], [key]: val };
      sol.whyCards = list;
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
  };

  const updateWhyCardLocalized = (idx: number, locale: Locale, key: string, val: any) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      const list = [...(sol.whyCards || [])];
      const item = { ...list[idx] };
      item.localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [key]: val } };
      list[idx] = item;
      sol.whyCards = list;
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
  };

  const deleteWhyCard = (id: string) => {
    if (!confirm("Bu özelliği silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const sol = { ...(pc.solutions || {}) };
      sol.whyCards = (sol.whyCards || []).filter((x: any) => x.id !== id);
      pc.solutions = sol;
      return { ...c, pageContent: pc };
    });
    setEditingWhyIdx(null);
  };

  const s = useMemo(() => {
    return solutions.find((item: any) => item.id === editId) || null;
  }, [editId, solutions]);

  return (
    <div className="space-y-6">
      <div className="ws-sol-tabs">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveSubTab(tab.key);
              setEditId(null);
              setEditingSelectorIdx(null);
              setEditingFlowIdx(null);
              setEditingWhyIdx(null);
            }}
            className={`ws-sol-tab ${activeSubTab === tab.key ? "is-active" : ""}`}
          >
            <span className="ws-sol-tab-icon" aria-hidden>{tab.icon}</span>
            <span className="ws-sol-tab-copy">
              <strong>{tab.label}</strong>
              <small>{tab.desc}</small>
            </span>
          </button>
        ))}
      </div>

      {/* 1. Use Case Solutions collection tab */}
      {activeSubTab === "solutions" && (
        <div>
          {editId !== null && s ? (
            <div className="space-y-4">
              <button type="button" onClick={() => setEditId(null)} className="ws-back-button">
                ← Listeye Dön
              </button>
              <div className="ws-sol-edit-layout">
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="font-bold">Çözüm Düzenle</h3>
                    <button onClick={() => deleteSolution(s.id)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Başlık" value={s.title || ""} onChange={(v) => updateSolution(s.id, "title", v)} />
                    <FormField label="Slug" value={s.slug || ""} onChange={(v) => updateSolution(s.id, "slug", v)} />
                    <FormField label="Kategori" value={s.category || ""} onChange={(v) => updateSolution(s.id, "category", v)} />
                    <FormField label="Öne Çıkan" type="select" value={s.featured ? "true" : "false"} onChange={(v) => updateSolution(s.id, "featured", v === "true")} options={[{ value: "true", label: "Evet" }, { value: "false", label: "Hayır" }]} />
                    <FormField label="Sıra" type="number" value={String(s.sortOrder || 0)} onChange={(v) => updateSolution(s.id, "sortOrder", parseInt(v) || 0)} />
                    <FormField label="Görsel Alt Metni" value={s.alt || ""} onChange={(v) => updateSolution(s.id, "alt", v)} />
                    <div className="col-span-2">
                      <FormField
                        label="Kapak Görseli"
                        type="image"
                        value={imageInputValue(s.image)}
                        onChange={(v) => updateSolution(s.id, "image", v)}
                        hint="Yükleyin veya assets/... yolu / tam URL girin"
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField label="Başlık Satırı" value={s.headline || ""} onChange={(v) => updateSolution(s.id, "headline", v)} />
                    </div>
                    <div className="col-span-2">
                      <FormField label="Özet" type="textarea" value={s.summary || ""} onChange={(v) => updateSolution(s.id, "summary", v)} rows={3} />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        label="Madde İşaretleri (satır başına 1)"
                        type="textarea"
                        value={Array.isArray(s.bullets) ? s.bullets.join("\n") : (s.bullets || "")}
                        onChange={(v) => updateSolution(s.id, "bullets", v)}
                        rows={5}
                        hint="Sitede chip veya liste olarak görünür"
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Çeviriler</h4>
                    <TranslationEditor item={s} fields={SOLUTION_FIELDS} onChange={(locale, key, val) => updateLocalized(s.id, locale, key, val)} />
                  </div>
                </div>

                <aside className="ws-sol-live-preview">
                  <p className="ws-sol-live-preview-label">Sitede nasıl görünür</p>
                  <article className="solution-case-card mirror-solution-card">
                    <figure className="mirror-solution-figure">
                      {resolveAdminImageSrc(s.image) ? (
                        <img src={resolveAdminImageSrc(s.image)} alt={s.alt || s.title} />
                      ) : (
                        <span className="mirror-solution-ph">Görsel ekleyin</span>
                      )}
                    </figure>
                    <div className="solution-case-body">
                      {s.category && <span>{s.category}</span>}
                      <h3>{s.headline || s.title || "Başlık"}</h3>
                      <p>{s.summary || "Özet metni burada görünür."}</p>
                      {Array.isArray(s.bullets) && s.bullets.length > 0 && (
                        <div className="solution-use-cases">
                          {s.bullets.slice(0, 4).map((b: string) => <span key={b}>{b}</span>)}
                        </div>
                      )}
                    </div>
                  </article>
                  {s.slug && (
                    <a
                      href={`/tr/solutions#${encodeURIComponent(s.slug)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ws-sol-live-link"
                    >
                      Canlı sayfada aç ↗
                    </a>
                  )}
                </aside>
              </div>
            </div>
          ) : (
            <div className="ws-sol-page">
              <div className="ws-sol-list-header">
                <div>
                  <h3>Kullanım Senaryoları</h3>
                  <p>Her kart çözümler sayfasındaki vitrin gridinde görünür.</p>
                </div>
                <button onClick={addSolution} className="ws-primary-button">+ Yeni Çözüm</button>
              </div>
              {solutions.length === 0 ? (
                <div className="ws-sol-empty">Henüz çözüm eklenmemiş.</div>
              ) : (
                <div className="ws-sol-grid">
                  {[...solutions]
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((item: any) => {
                      const img = resolveAdminImageSrc(item.image);
                      return (
                        <div key={item.id} className="ws-sol-card">
                          <div className="ws-sol-card-thumb">
                            {img ? (
                              <img src={img} alt={item.title} onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.25"; }} />
                            ) : (
                              <span className="ws-sol-card-noimg">Görsel yok</span>
                            )}
                            {item.featured && <span className="ws-sol-card-badge">Öne çıkan</span>}
                          </div>
                          <div className="ws-sol-card-body">
                            <h4>{item.title}</h4>
                            <p>{item.summary || "Özet girilmemiş"}</p>
                          </div>
                          <div className="ws-sol-card-foot">
                            <span className="ws-sol-cat-pill">{item.category || "Kategori yok"}</span>
                            <button type="button" onClick={() => setEditId(item.id)} className="ws-edit-button" style={{ width: "auto", padding: "8px 16px" }}>
                              Düzenle
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. General Page texts tab */}
      {activeSubTab === "general" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-[#131b2e] mb-1">Sayfa üst bölümü</h3>
            <p className="text-sm text-gray-500 mb-4">Hero banner görseli ve istatistik değerleri (metin çevirileri aşağıda).</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField label="Hero Görseli" type="image" value={imageInputValue(solutionsPage.heroImage)} onChange={(v) => updateGeneralField("heroImage", v)} hint="Çözümler sayfası üst arka plan görseli" />
            <div className="ws-sol-hero-preview">
              {resolveAdminImageSrc(solutionsPage.heroImage) ? (
                <img src={resolveAdminImageSrc(solutionsPage.heroImage)} alt="Hero önizleme" />
              ) : (
                <span>Hero görseli seçilmedi</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Metrik 1 Değeri" value={solutionsPage.metric1Value || ""} onChange={(v) => updateGeneralField("metric1Value", v)} placeholder="15+" />
            <FormField label="Metrik 2 Değeri" value={solutionsPage.metric2Value || ""} onChange={(v) => updateGeneralField("metric2Value", v)} placeholder="2020" />
            <FormField label="Metrik 3 Değeri" value={solutionsPage.metric3Value || ""} onChange={(v) => updateGeneralField("metric3Value", v)} placeholder="24/7" />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-xs font-bold text-gray-700 mb-3">Çözümler Sayfası Metin Çevirileri</h4>
            <TranslationEditor
              item={solutionsPage}
              fields={GENERAL_FIELDS}
              onChange={(locale, key, val) => updateGeneralLocalized(locale, key, val)}
            />
          </div>
        </div>
      )}

      {/* 3. Selector Cards Tab */}
      {activeSubTab === "selector" && (
        <div>
          {editingSelectorIdx !== null && selectorCards[editingSelectorIdx] ? (
            (() => {
              const card = selectorCards[editingSelectorIdx];
              return (
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="font-bold text-sm text-[#131b2e]">Kart Düzenle: {card.title}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => deleteSelectorCard(card.id)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
                      <button onClick={() => setEditingSelectorIdx(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold">Listeye Dön</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Üst Başlık (EN)" value={card.eyebrow || ""} onChange={(v) => updateSelectorCard(editingSelectorIdx, "eyebrow", v)} />
                    <FormField label="Sıra Numarası" type="number" value={String(card.sortOrder || 0)} onChange={(v) => updateSelectorCard(editingSelectorIdx, "sortOrder", parseInt(v) || 0)} />
                    <div className="col-span-2">
                      <FormField label="Başlık (EN)" value={card.title || ""} onChange={(v) => updateSelectorCard(editingSelectorIdx, "title", v)} />
                    </div>
                    <div className="col-span-2">
                      <FormField label="Açıklama (EN)" type="textarea" value={card.body || ""} onChange={(v) => updateSelectorCard(editingSelectorIdx, "body", v)} rows={2} />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        label="Madde İşaretleri (satır başına 1) (EN)"
                        type="textarea"
                        value={Array.isArray(card.bullets) ? card.bullets.join("\n") : (card.bullets || "")}
                        onChange={(v) => updateSelectorCard(editingSelectorIdx, "bullets", v.split("\n").map((t: string) => t.trim()).filter(Boolean))}
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-xs font-bold text-gray-700 mb-3">Çeviriler</h4>
                    <TranslationEditor
                      item={card}
                      fields={SELECTOR_TRANSLATION_FIELDS}
                      onChange={(locale, key, val) => updateSelectorCardLocalized(editingSelectorIdx, locale, key, val)}
                    />
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#131b2e]">Seçim Kartları (Selector)</h3>
                <button onClick={addSelectorCard} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Yeni Kart Ekle</button>
              </div>
              <div className="divide-y divide-gray-100">
                {[...selectorCards]
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((c: any, displayIdx: number) => {
                    const originalIndex = selectorCards.findIndex((x: any) => x.id === c.id);
                    return (
                      <div key={c.id} className="ws-sol-mini-row">
                        <span className="ws-sol-mini-num">{String(displayIdx + 1).padStart(2, "0")}</span>
                        <div className="ws-sol-mini-copy">
                          <p className="font-bold text-sm text-gray-800">{c.title}</p>
                          <p className="text-xs text-gray-500">{c.eyebrow}</p>
                          <p className="text-xs text-gray-400 line-clamp-2">{c.body}</p>
                        </div>
                        <button onClick={() => setEditingSelectorIdx(originalIndex)} className="ws-edit-button" style={{ width: "auto", padding: "8px 14px" }}>Düzenle</button>
                      </div>
                    );
                  })}
                {selectorCards.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">Henüz seçim kartı eklenmemiş.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Flow Steps Tab */}
      {activeSubTab === "flow" && (
        <div>
          {editingFlowIdx !== null && howItWorksSteps[editingFlowIdx] ? (
            (() => {
              const step = howItWorksSteps[editingFlowIdx];
              return (
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="font-bold text-sm text-[#131b2e]">Aşama Düzenle: {step.title}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => deleteFlowStep(step.id)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
                      <button onClick={() => setEditingFlowIdx(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold">Listeye Dön</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Aşama Adı (EN)" value={step.title || ""} onChange={(v) => updateFlowStep(editingFlowIdx, "title", v)} />
                    <FormField label="Sıra Numarası" type="number" value={String(step.sortOrder || 0)} onChange={(v) => updateFlowStep(editingFlowIdx, "sortOrder", parseInt(v) || 0)} />
                    <div className="col-span-2">
                      <FormField label="Açıklama (EN)" type="textarea" value={step.body || ""} onChange={(v) => updateFlowStep(editingFlowIdx, "body", v)} rows={2} />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-xs font-bold text-gray-700 mb-3">Çeviriler</h4>
                    <TranslationEditor
                      item={step}
                      fields={FLOW_TRANSLATION_FIELDS}
                      onChange={(locale, key, val) => updateFlowStepLocalized(editingFlowIdx, locale, key, val)}
                    />
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#131b2e]">Nasıl Çalışır Adımları</h3>
                <button onClick={addFlowStep} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Yeni Adım Ekle</button>
              </div>
              <div className="divide-y divide-gray-100">
                {[...howItWorksSteps]
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((step: any, displayIdx: number) => {
                    const originalIndex = howItWorksSteps.findIndex((x: any) => x.id === step.id);
                    return (
                      <div key={step.id} className="ws-sol-mini-row">
                        <span className="ws-sol-mini-num">{String(displayIdx + 1).padStart(2, "0")}</span>
                        <div className="ws-sol-mini-copy">
                          <p className="font-bold text-sm text-gray-800">{step.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-2">{step.body}</p>
                        </div>
                        <button onClick={() => setEditingFlowIdx(originalIndex)} className="ws-edit-button" style={{ width: "auto", padding: "8px 14px" }}>Düzenle</button>
                      </div>
                    );
                  })}
                {howItWorksSteps.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">Henüz adım eklenmemiş.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Why Cards Tab */}
      {activeSubTab === "why" && (
        <div>
          {editingWhyIdx !== null && whyCards[editingWhyIdx] ? (
            (() => {
              const card = whyCards[editingWhyIdx];
              return (
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="font-bold text-sm text-[#131b2e]">Özellik Düzenle: {card.title}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => deleteWhyCard(card.id)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
                      <button onClick={() => setEditingWhyIdx(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold">Listeye Dön</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Özellik Adı (EN)" value={card.title || ""} onChange={(v) => updateWhyCard(editingWhyIdx, "title", v)} />
                    <FormField label="Sıra Numarası" type="number" value={String(card.sortOrder || 0)} onChange={(v) => updateWhyCard(editingWhyIdx, "sortOrder", parseInt(v) || 0)} />
                    <div className="col-span-2">
                      <FormField label="Açıklama (EN)" type="textarea" value={card.body || ""} onChange={(v) => updateWhyCard(editingWhyIdx, "body", v)} rows={2} />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-xs font-bold text-gray-700 mb-3">Çeviriler</h4>
                    <TranslationEditor
                      item={card}
                      fields={WHY_TRANSLATION_FIELDS}
                      onChange={(locale, key, val) => updateWhyCardLocalized(editingWhyIdx, locale, key, val)}
                    />
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#131b2e]">Neden WillowSoft Özellikleri</h3>
                <button onClick={addWhyCard} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Yeni Kart Ekle</button>
              </div>
              <div className="divide-y divide-gray-100">
                {[...whyCards]
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((card: any, displayIdx: number) => {
                    const originalIndex = whyCards.findIndex((x: any) => x.id === card.id);
                    return (
                      <div key={card.id} className="ws-sol-mini-row">
                        <span className="ws-sol-mini-num">{String(displayIdx + 1).padStart(2, "0")}</span>
                        <div className="ws-sol-mini-copy">
                          <p className="font-bold text-sm text-gray-800">{card.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-2">{card.body}</p>
                        </div>
                        <button onClick={() => setEditingWhyIdx(originalIndex)} className="ws-edit-button" style={{ width: "auto", padding: "8px 14px" }}>Düzenle</button>
                      </div>
                    );
                  })}
                {whyCards.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">Henüz özellik eklenmemiş.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
