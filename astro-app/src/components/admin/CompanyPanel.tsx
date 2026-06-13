"use client";

import { useState } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import TranslationEditor from "./TranslationEditor";

type SubTab = "general" | "team" | "timeline" | "offices" | "expertise" | "industries";

const GENERAL_FIELDS = [
  { key: "heroSub", label: "Hero Alt Metin", type: "textarea" as const, rows: 3 },
  { key: "aboutHeadline", label: "Hakkımızda Başlık" },
  { key: "aboutSub", label: "Hakkımızda Detay Metni", type: "textarea" as const, rows: 4 },
  { key: "aboutTags", label: "Etiketler (virgülle ayrılmış)", type: "textarea" as const, rows: 2 },
  { key: "mission", label: "Misyon", type: "textarea" as const, rows: 3 },
  { key: "vision", label: "Vizyon", type: "textarea" as const, rows: 3 },
];

const TEAM_TRANSLATION_FIELDS = [
  { key: "role", label: "Rol" },
  { key: "bio", label: "Biyografi", type: "textarea" as const, rows: 3 },
];

const TIMELINE_TRANSLATION_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "body", label: "Açıklama", type: "textarea" as const, rows: 3 },
];

const OFFICE_TRANSLATION_FIELDS = [
  { key: "address", label: "Adres", type: "textarea" as const, rows: 3 },
];

const EXPERTISE_TRANSLATION_FIELDS = [
  { key: "label", label: "Başlık" },
  { key: "note", label: "Alt Not" },
];

const INDUSTRY_TRANSLATION_FIELDS = [
  { key: "name", label: "Sektör Adı" },
  { key: "tag", label: "Etiket (büyük harf)" },
  { key: "body", label: "Açıklama", type: "textarea" as const, rows: 4 },
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

export default function CompanyPanel() {
  const { content, setContent } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("general");
  
  // States for editing items
  const [editingTeamIdx, setEditingTeamIdx] = useState<number | null>(null);
  const [editingTimelineIdx, setEditingTimelineIdx] = useState<number | null>(null);
  const [editingOfficeIdx, setEditingOfficeIdx] = useState<number | null>(null);

  const [editingExpertiseIdx, setEditingExpertiseIdx] = useState<number | null>(null);

  const facts = content?.companyFacts || {};
  const team = facts.team || [];
  const timeline = facts.timeline || [];
  const officesList = facts.officesList || [];
  const expertiseList: any[] = facts.expertise || [];
  const industriesList: any[] = facts.industries || [];
  const aboutBullets: any[] = facts.aboutBullets || [];
  const [editingIndustryIdx, setEditingIndustryIdx] = useState<number | null>(null);

  // General Field Updates
  const updateGeneralField = (key: string, value: string) => {
    setContent((c: any) => {
      const parsedVal = key === "aboutTags"
        ? value.split(",").map((t: string) => t.trim()).filter(Boolean)
        : value;
      return {
        ...c,
        companyFacts: {
          ...(c.companyFacts || {}),
          [key]: parsedVal,
        },
      };
    });
  };

  const updateGeneralLocalized = (locale: Locale, key: string, value: string) => {
    setContent((c: any) => {
      const facts = { ...(c.companyFacts || {}) };
      const localized = { ...(facts.localized || {}) };
      const localeData = { ...(localized[locale] || {}) };

      // aboutTags arrives as "\n"-joined string from TranslationEditor (fieldValueToText joins with \n)
      const parsedVal = key === "aboutTags"
        ? value.split("\n").map((t: string) => t.trim()).filter(Boolean)
        : value;

      localeData[key] = parsedVal;
      localized[locale] = localeData;
      facts.localized = localized;
      return { ...c, companyFacts: facts };
    });
  };

  // About Bullets
  const addBullet = () => {
    const newB = { id: `bullet-${Date.now()}`, text: "Yeni madde", localized: {} };
    setContent((c: any) => ({ ...c, companyFacts: { ...c.companyFacts, aboutBullets: [...(c.companyFacts?.aboutBullets || []), newB] } }));
  };
  const updateBulletText = (idx: number, value: string) => {
    setContent((c: any) => {
      const list = [...(c.companyFacts?.aboutBullets || [])];
      list[idx] = { ...list[idx], text: value };
      return { ...c, companyFacts: { ...c.companyFacts, aboutBullets: list } };
    });
  };
  const updateBulletLocalized = (idx: number, locale: Locale, value: string) => {
    setContent((c: any) => {
      const list = [...(c.companyFacts?.aboutBullets || [])];
      const item = { ...list[idx] };
      item.localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), text: value } };
      list[idx] = item;
      return { ...c, companyFacts: { ...c.companyFacts, aboutBullets: list } };
    });
  };
  const deleteBullet = (idx: number) => {
    setContent((c: any) => {
      const list = (c.companyFacts?.aboutBullets || []).filter((_: any, i: number) => i !== idx);
      return { ...c, companyFacts: { ...c.companyFacts, aboutBullets: list } };
    });
  };
  const moveBullet = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= aboutBullets.length) return;
    setContent((c: any) => {
      const list = [...(c.companyFacts?.aboutBullets || [])];
      [list[idx], list[target]] = [list[target], list[idx]];
      return { ...c, companyFacts: { ...c.companyFacts, aboutBullets: list } };
    });
  };

  // Team Updates
  const addTeamMember = () => {
    const id = `member-${Date.now()}`;
    const newMember = {
      id,
      name: "Yeni Üye",
      role: "Rol",
      bio: "Biyografi...",
      image: "",
      sortOrder: getNextSortOrder(team),
      localized: {},
    };
    setContent((c: any) => {
      const t = [...(c.companyFacts?.team || []), newMember];
      return { ...c, companyFacts: { ...c.companyFacts, team: t } };
    });
    setEditingTeamIdx(team.length);
  };

  const updateTeamMember = (idx: number, key: string, val: any) => {
    setContent((c: any) => {
      const t = [...(c.companyFacts?.team || [])];
      t[idx] = { ...t[idx], [key]: val };
      return { ...c, companyFacts: { ...c.companyFacts, team: t } };
    });
  };

  const updateTeamLocalized = (idx: number, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const t = [...(c.companyFacts?.team || [])];
      const item = { ...t[idx] };
      const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
      t[idx] = { ...item, localized };
      return { ...c, companyFacts: { ...c.companyFacts, team: t } };
    });
  };

  const deleteTeamMember = (idx: number) => {
    if (!confirm("Bu ekip üyesini silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const t = (c.companyFacts?.team || []).filter((_: any, i: number) => i !== idx);
      return { ...c, companyFacts: { ...c.companyFacts, team: t } };
    });
    setEditingTeamIdx(null);
  };

  // Timeline Updates
  const addTimelineStep = () => {
    const id = `time-${Date.now()}`;
    const newStep = {
      id,
      year: new Date().getFullYear().toString(),
      title: "Yeni Kilometre Taşı",
      body: "Açıklama...",
      sortOrder: getNextSortOrder(timeline),
      localized: {},
    };
    setContent((c: any) => {
      const t = [...(c.companyFacts?.timeline || []), newStep];
      return { ...c, companyFacts: { ...c.companyFacts, timeline: t } };
    });
    setEditingTimelineIdx(timeline.length);
  };

  const updateTimelineStep = (idx: number, key: string, val: any) => {
    setContent((c: any) => {
      const t = [...(c.companyFacts?.timeline || [])];
      t[idx] = { ...t[idx], [key]: val };
      return { ...c, companyFacts: { ...c.companyFacts, timeline: t } };
    });
  };

  const updateTimelineLocalized = (idx: number, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const t = [...(c.companyFacts?.timeline || [])];
      const item = { ...t[idx] };
      const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
      t[idx] = { ...item, localized };
      return { ...c, companyFacts: { ...c.companyFacts, timeline: t } };
    });
  };

  const deleteTimelineStep = (idx: number) => {
    if (!confirm("Bu zaman çizelgesi adımını silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const t = (c.companyFacts?.timeline || []).filter((_: any, i: number) => i !== idx);
      return { ...c, companyFacts: { ...c.companyFacts, timeline: t } };
    });
    setEditingTimelineIdx(null);
  };

  // Offices Updates
  const addOffice = () => {
    const id = `office-${Date.now()}`;
    const newOffice = {
      id,
      country: "Yeni Ülke",
      flag: "📍",
      phone: "",
      email: "info@willowsoft.co",
      address: "Adres...",
      image: "",
      sortOrder: getNextSortOrder(officesList),
      localized: {},
    };
    setContent((c: any) => {
      const o = [...(c.companyFacts?.officesList || []), newOffice];
      return { ...c, companyFacts: { ...c.companyFacts, officesList: o } };
    });
    setEditingOfficeIdx(officesList.length);
  };

  const updateOffice = (idx: number, key: string, val: any) => {
    setContent((c: any) => {
      const o = [...(c.companyFacts?.officesList || [])];
      o[idx] = { ...o[idx], [key]: val };
      return { ...c, companyFacts: { ...c.companyFacts, officesList: o } };
    });
  };

  const updateOfficeLocalized = (idx: number, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const o = [...(c.companyFacts?.officesList || [])];
      const item = { ...o[idx] };
      const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
      o[idx] = { ...item, localized };
      return { ...c, companyFacts: { ...c.companyFacts, officesList: o } };
    });
  };

  const deleteOffice = (idx: number) => {
    if (!confirm("Bu ofisi silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const o = (c.companyFacts?.officesList || []).filter((_: any, i: number) => i !== idx);
      return { ...c, companyFacts: { ...c.companyFacts, officesList: o } };
    });
    setEditingOfficeIdx(null);
  };

  // Expertise helpers
  const addExpertise = () => {
    const newItem = { id: `exp-${Date.now()}`, label: "Yeni Uzmanlık", note: "Alt başlık", icon: "check", sortOrder: getNextSortOrder(expertiseList), localized: {} };
    setContent((c: any) => ({ ...c, companyFacts: { ...c.companyFacts, expertise: [...(c.companyFacts?.expertise || []), newItem] } }));
    setEditingExpertiseIdx(expertiseList.length);
  };

  const updateExpertise = (idx: number, key: string, value: any) => {
    setContent((c: any) => {
      const list = [...(c.companyFacts?.expertise || [])];
      list[idx] = { ...list[idx], [key]: value };
      return { ...c, companyFacts: { ...c.companyFacts, expertise: list } };
    });
  };

  const updateExpertiseLocalized = (idx: number, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = [...(c.companyFacts?.expertise || [])];
      const item = { ...list[idx] };
      const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
      list[idx] = { ...item, localized };
      return { ...c, companyFacts: { ...c.companyFacts, expertise: list } };
    });
  };

  const deleteExpertise = (idx: number) => {
    if (!confirm("Bu uzmanlık alanını silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const list = (c.companyFacts?.expertise || []).filter((_: any, i: number) => i !== idx);
      return { ...c, companyFacts: { ...c.companyFacts, expertise: list } };
    });
    setEditingExpertiseIdx(null);
  };

  const sortedExpertise = [...expertiseList].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Industries helpers
  const addIndustry = () => {
    const newItem = {
      id: `ind-${Date.now()}`,
      name: "Yeni Sektör",
      tag: "ETİKET",
      body: "Açıklama...",
      icon: "globe",
      c: "rgba(19,33,117,0.08)",
      t: "#132175",
      sortOrder: getNextSortOrder(industriesList),
      localized: {},
    };
    setContent((c: any) => ({ ...c, companyFacts: { ...c.companyFacts, industries: [...(c.companyFacts?.industries || []), newItem] } }));
    setEditingIndustryIdx(industriesList.length);
  };

  const updateIndustry = (idx: number, key: string, value: any) => {
    setContent((c: any) => {
      const list = [...(c.companyFacts?.industries || [])];
      list[idx] = { ...list[idx], [key]: value };
      return { ...c, companyFacts: { ...c.companyFacts, industries: list } };
    });
  };

  const updateIndustryLocalized = (idx: number, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = [...(c.companyFacts?.industries || [])];
      const item = { ...list[idx] };
      const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
      list[idx] = { ...item, localized };
      return { ...c, companyFacts: { ...c.companyFacts, industries: list } };
    });
  };

  const deleteIndustry = (idx: number) => {
    if (!confirm("Bu sektörü silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const list = (c.companyFacts?.industries || []).filter((_: any, i: number) => i !== idx);
      return { ...c, companyFacts: { ...c.companyFacts, industries: list } };
    });
    setEditingIndustryIdx(null);
  };

  const sortedIndustries = [...industriesList].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="space-y-6">
      {/* Sub-tabs header */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        {[
          { key: "general", label: "Genel Sayfa Metinleri" },
          { key: "expertise", label: "Uzmanlık Alanları" },
          { key: "industries", label: "Sektörler" },
          { key: "team", label: "Ekibimiz" },
          { key: "timeline", label: "Zaman Tüneli" },
          { key: "offices", label: "Ofislerimiz" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveSubTab(tab.key as SubTab);
              setEditingTeamIdx(null);
              setEditingTimelineIdx(null);
              setEditingOfficeIdx(null);
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px ${
              activeSubTab === tab.key
                ? "border-[#132175] text-[#132175]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. General page info tab */}
      {activeSubTab === "general" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Kuruluş Yılı (founded)"
              value={facts.founded || ""}
              onChange={(v) => updateGeneralField("founded", v)}
            />
            <FormField
              label="Aktif Ülke Sayısı (countries)"
              value={facts.countries || ""}
              onChange={(v) => updateGeneralField("countries", v)}
            />
            <div className="col-span-2">
              <FormField
                label="Hero Alt Metni (EN)"
                type="textarea"
                value={facts.heroSub || ""}
                onChange={(v) => updateGeneralField("heroSub", v)}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <FormField
                label="Hakkımızda Başlığı (EN)"
                value={facts.aboutHeadline || ""}
                onChange={(v) => updateGeneralField("aboutHeadline", v)}
              />
            </div>
            <div className="col-span-2">
              <FormField
                label="Hakkımızda Detay Metni (EN)"
                type="textarea"
                value={facts.aboutSub || ""}
                onChange={(v) => updateGeneralField("aboutSub", v)}
                rows={3}
              />
            </div>
            <div className="col-span-2">
              <FormField
                label="Etiketler (EN - Virgülle ayrılmış)"
                type="textarea"
                value={Array.isArray(facts.aboutTags) ? facts.aboutTags.join(", ") : (facts.aboutTags || "")}
                onChange={(v) => updateGeneralField("aboutTags", v)}
                rows={1}
                hint="Virgülle ayırarak yazın. Örn: Hardware, Firmware, Cloud"
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <FormField
                label="Misyon (EN)"
                type="textarea"
                value={facts.mission || ""}
                onChange={(v) => updateGeneralField("mission", v)}
                rows={2}
              />
              <FormField
                label="Vizyon (EN)"
                type="textarea"
                value={facts.vision || ""}
                onChange={(v) => updateGeneralField("vision", v)}
                rows={2}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-xs font-bold text-gray-700 mb-3">Genel Metin Çevirileri</h4>
            <TranslationEditor
              item={facts}
              fields={GENERAL_FIELDS}
              onChange={(locale, key, val) => updateGeneralLocalized(locale, key, val)}
            />
          </div>

          {/* About Bullets */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-gray-700">Hakkımızda Madde İşaretleri</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Sayfadaki madde işaretli liste. Her madde için çeviri eklenebilir.</p>
              </div>
              <button onClick={addBullet} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Ekle</button>
            </div>
            <div className="space-y-3">
              {aboutBullets.map((b: any, i: number) => (
                <div key={b.id || i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-1 shrink-0 mt-1">
                      <button onClick={() => moveBullet(i, -1)} disabled={i === 0} className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-30 text-xs flex items-center justify-center">▲</button>
                      <button onClick={() => moveBullet(i, 1)} disabled={i === aboutBullets.length - 1} className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-30 text-xs flex items-center justify-center">▼</button>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase w-6">{String(i + 1).padStart(2, "0")}</span>
                        <input
                          type="text"
                          value={b.text || ""}
                          onChange={(e) => updateBulletText(i, e.target.value)}
                          placeholder="İngilizce metin..."
                          className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4]"
                        />
                      </div>
                      {/* Locale translations inline */}
                      {(["tr", "de", "fr"] as Locale[]).map((loc) => (
                        <div key={loc} className="flex items-center gap-2 ml-8">
                          <span className="text-[10px] font-bold text-gray-300 w-6 uppercase">{loc}</span>
                          <input
                            type="text"
                            value={b.localized?.[loc]?.text || ""}
                            onChange={(e) => updateBulletLocalized(i, loc, e.target.value)}
                            placeholder={`${loc.toUpperCase()} çevirisi...`}
                            className="flex-1 p-1.5 bg-white border border-gray-100 rounded text-xs text-gray-700 outline-none focus:border-[#1aa3c4]"
                          />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => deleteBullet(i)} className="shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-400 hover:bg-red-200 text-[10px] font-black flex items-center justify-center mt-1">✕</button>
                  </div>
                </div>
              ))}
              {aboutBullets.length === 0 && (
                <p className="text-xs text-gray-300 italic px-2">Henüz madde eklenmemiş. "+ Ekle" ile başlayın.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Team Tab */}
      {activeSubTab === "team" && (
        <div>
          {editingTeamIdx !== null && team[editingTeamIdx] ? (
            (() => {
              const member = team[editingTeamIdx];
              return (
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="font-bold text-sm text-[#131b2e]">Ekip Üyesi Düzenle: {member.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteTeamMember(editingTeamIdx)}
                        className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => setEditingTeamIdx(null)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold"
                      >
                        Listeye Dön
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Ad Soyad"
                      value={member.name || ""}
                      onChange={(v) => updateTeamMember(editingTeamIdx, "name", v)}
                    />
                    <FormField
                      label="Sıra Numarası"
                      type="number"
                      value={String(member.sortOrder || 0)}
                      onChange={(v) => updateTeamMember(editingTeamIdx, "sortOrder", parseInt(v) || 0)}
                    />
                    <FormField
                      label="Rol (EN)"
                      value={member.role || ""}
                      onChange={(v) => updateTeamMember(editingTeamIdx, "role", v)}
                    />
                    <FormField
                      label="Görsel Dosya Yolu"
                      type="image"
                      value={member.image || ""}
                      onChange={(v) => updateTeamMember(editingTeamIdx, "image", v)}
                      placeholder="assets/team/..."
                    />
                    <div className="col-span-2">
                      <FormField
                        label="Biyografi (EN)"
                        type="textarea"
                        value={member.bio || ""}
                        onChange={(v) => updateTeamMember(editingTeamIdx, "bio", v)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-xs font-bold text-gray-700 mb-3">Çeviriler</h4>
                    <TranslationEditor
                      item={member}
                      fields={TEAM_TRANSLATION_FIELDS}
                      onChange={(locale, key, val) => updateTeamLocalized(editingTeamIdx, locale, key, val)}
                    />
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#131b2e]">Ekip Üyeleri</h3>
                <button
                  onClick={addTeamMember}
                  className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold"
                >
                  + Yeni Üye Ekle
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {[...team]
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((m: any) => {
                    const originalIndex = team.findIndex((x: any) => x.id === m.id);
                    return (
                      <div key={m.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.image || "/assets/willow-mark-transparent.png"}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200"
                            onError={(e: any) => {
                              e.target.onerror = null;
                              e.target.src = "/assets/willow-mark-transparent.png";
                            }}
                          />
                          <div>
                            <p className="font-bold text-sm text-gray-800">{m.name}</p>
                            <p className="text-xs text-gray-400">Rol: {m.role} • Sıra: {m.sortOrder || 0}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingTeamIdx(originalIndex)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition"
                        >
                          Düzenle
                        </button>
                      </div>
                    );
                  })}
                {team.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">Henüz ekip üyesi eklenmemiş.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Timeline Tab */}
      {activeSubTab === "timeline" && (
        <div>
          {editingTimelineIdx !== null && timeline[editingTimelineIdx] ? (
            (() => {
              const step = timeline[editingTimelineIdx];
              return (
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="font-bold text-sm text-[#131b2e]">Zaman Tüneli Adımı Düzenle: {step.year}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteTimelineStep(editingTimelineIdx)}
                        className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => setEditingTimelineIdx(null)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold"
                      >
                        Listeye Dön
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Yıl / Dönem"
                      value={step.year || ""}
                      onChange={(v) => updateTimelineStep(editingTimelineIdx, "year", v)}
                    />
                    <FormField
                      label="Sıra Numarası"
                      type="number"
                      value={String(step.sortOrder || 0)}
                      onChange={(v) => updateTimelineStep(editingTimelineIdx, "sortOrder", parseInt(v) || 0)}
                    />
                    <div className="col-span-2">
                      <FormField
                        label="Başlık (EN)"
                        value={step.title || ""}
                        onChange={(v) => updateTimelineStep(editingTimelineIdx, "title", v)}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        label="Açıklama (EN)"
                        type="textarea"
                        value={step.body || ""}
                        onChange={(v) => updateTimelineStep(editingTimelineIdx, "body", v)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-xs font-bold text-gray-700 mb-3">Çeviriler</h4>
                    <TranslationEditor
                      item={step}
                      fields={TIMELINE_TRANSLATION_FIELDS}
                      onChange={(locale, key, val) => updateTimelineLocalized(editingTimelineIdx, locale, key, val)}
                    />
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#131b2e]">Zaman Tüneli</h3>
                <button
                  onClick={addTimelineStep}
                  className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold"
                >
                  + Yeni Adım Ekle
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {[...timeline]
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((t: any) => {
                    const originalIndex = timeline.findIndex((x: any) => x.id === t.id);
                    return (
                      <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div>
                          <p className="font-bold text-sm text-gray-800">{t.year} — {t.title}</p>
                          <p className="text-xs text-gray-400">Sıra: {t.sortOrder || 0} • Açıklama: {t.body?.substring(0, 80)}...</p>
                        </div>
                        <button
                          onClick={() => setEditingTimelineIdx(originalIndex)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition"
                        >
                          Düzenle
                        </button>
                      </div>
                    );
                  })}
                {timeline.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">Henüz zaman tüneli adımı eklenmemiş.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Expertise Tab */}
      {activeSubTab === "expertise" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
            "Core Expertise" bölümündeki uzmanlık alanları. Her birinin Türkçe ve diğer dil çevirileri ayrıca girilebilir.
          </div>

          {editingExpertiseIdx !== null && expertiseList[editingExpertiseIdx] ? (() => {
            const exp = expertiseList[editingExpertiseIdx];
            return (
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h3 className="font-bold text-sm">{exp.label}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => deleteExpertise(editingExpertiseIdx)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
                    <button onClick={() => setEditingExpertiseIdx(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold">← Listeye Dön</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Başlık (EN)" value={exp.label || ""} onChange={(v) => updateExpertise(editingExpertiseIdx, "label", v)} />
                  <FormField label="Alt Not (EN)" value={exp.note || ""} onChange={(v) => updateExpertise(editingExpertiseIdx, "note", v)} hint="Örn: Custom PCB & RF" />
                  <FormField label="İkon" value={exp.icon || "check"} onChange={(v) => updateExpertise(editingExpertiseIdx, "icon", v)} hint="check, cpu, server, terminal, phone, gear, database, globe, shield, water, mail, pin" />
                  <FormField label="Sıra Numarası" type="number" value={String(exp.sortOrder || 0)} onChange={(v) => updateExpertise(editingExpertiseIdx, "sortOrder", parseInt(v) || 0)} />
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-3">Çeviriler</h4>
                  <TranslationEditor
                    item={exp}
                    fields={EXPERTISE_TRANSLATION_FIELDS}
                    onChange={(locale, key, val) => updateExpertiseLocalized(editingExpertiseIdx, locale, key, val)}
                  />
                </div>
              </div>
            );
          })() : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-sm">Uzmanlık Alanları ({sortedExpertise.length})</h3>
                <button onClick={addExpertise} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Yeni Ekle</button>
              </div>
              <div className="divide-y divide-gray-100">
                {sortedExpertise.map((exp: any) => {
                  const origIdx = expertiseList.findIndex((x: any) => x.id === exp.id);
                  return (
                    <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#132175]/8 text-[#132175] flex items-center justify-center text-xs font-black">
                          {String((sortedExpertise.indexOf(exp)) + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-gray-800">{exp.label}</p>
                          <p className="text-xs text-gray-400">{exp.note}</p>
                        </div>
                      </div>
                      <button onClick={() => setEditingExpertiseIdx(origIdx)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition">Düzenle</button>
                    </div>
                  );
                })}
                {sortedExpertise.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">Henüz uzmanlık alanı eklenmemiş.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Industries Tab */}
      {activeSubTab === "industries" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
            "Who we work with" bölümündeki sektör kartları. Her birinin Türkçe ve diğer dil çevirileri ayrıca girilebilir.
          </div>

          {editingIndustryIdx !== null && industriesList[editingIndustryIdx] ? (() => {
            const ind = industriesList[editingIndustryIdx];
            return (
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h3 className="font-bold text-sm">{ind.name}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => deleteIndustry(editingIndustryIdx)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
                    <button onClick={() => setEditingIndustryIdx(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold">← Listeye Dön</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Sektör Adı (EN)" value={ind.name || ""} onChange={(v) => updateIndustry(editingIndustryIdx, "name", v)} hint="Örn: Industrial & Energy" />
                  <FormField label="Etiket (EN)" value={ind.tag || ""} onChange={(v) => updateIndustry(editingIndustryIdx, "tag", v)} hint="Büyük harf. Örn: IIoT & TELEMETRY" />
                  <div className="col-span-2">
                    <FormField label="Açıklama (EN)" type="textarea" rows={3} value={ind.body || ""} onChange={(v) => updateIndustry(editingIndustryIdx, "body", v)} hint="Sektörü ve WillowSoft'un bu alandaki çalışmalarını anlatan kısa paragraf." />
                  </div>
                  <FormField label="İkon" value={ind.icon || "globe"} onChange={(v) => updateIndustry(editingIndustryIdx, "icon", v)} hint="globe, cpu, server, terminal, phone, gear, database, shield, water, mail, pin" />
                  <FormField label="Sıra Numarası" type="number" value={String(ind.sortOrder || 0)} onChange={(v) => updateIndustry(editingIndustryIdx, "sortOrder", parseInt(v) || 0)} />
                  <FormField label="Arkaplan Rengi" value={ind.c || ""} onChange={(v) => updateIndustry(editingIndustryIdx, "c", v)} hint="CSS renk değeri. Örn: rgba(19,33,117,0.08)" />
                  <FormField label="İkon Rengi" value={ind.t || ""} onChange={(v) => updateIndustry(editingIndustryIdx, "t", v)} hint="CSS renk değeri. Örn: #132175" />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-3">Çeviriler</h4>
                  <TranslationEditor
                    item={ind}
                    fields={INDUSTRY_TRANSLATION_FIELDS}
                    onChange={(locale, key, val) => updateIndustryLocalized(editingIndustryIdx, locale, key, val)}
                  />
                </div>
              </div>
            );
          })() : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-sm">Sektörler ({sortedIndustries.length})</h3>
                <button onClick={addIndustry} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Yeni Sektör Ekle</button>
              </div>
              <div className="divide-y divide-gray-100">
                {sortedIndustries.map((ind: any) => {
                  const origIdx = industriesList.findIndex((x: any) => x.id === ind.id);
                  return (
                    <div key={ind.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                          style={{ background: ind.c || "rgba(19,33,117,0.08)", color: ind.t || "#132175" }}>
                          {String(sortedIndustries.indexOf(ind) + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-gray-800">{ind.name}</p>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">{ind.tag}</p>
                        </div>
                      </div>
                      <button onClick={() => setEditingIndustryIdx(origIdx)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition">Düzenle</button>
                    </div>
                  );
                })}
                {sortedIndustries.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">Henüz sektör eklenmemiş.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Offices Tab */}
      {activeSubTab === "offices" && (
        <div>
          {editingOfficeIdx !== null && officesList[editingOfficeIdx] ? (
            (() => {
              const office = officesList[editingOfficeIdx];
              return (
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="font-bold text-sm text-[#131b2e]">Ofis Düzenle: {office.country}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteOffice(editingOfficeIdx)}
                        className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => setEditingOfficeIdx(null)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold"
                      >
                        Listeye Dön
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Ülke"
                      value={office.country || ""}
                      onChange={(v) => updateOffice(editingOfficeIdx, "country", v)}
                    />
                    <FormField
                      label="Sıra Numarası"
                      type="number"
                      value={String(office.sortOrder || 0)}
                      onChange={(v) => updateOffice(editingOfficeIdx, "sortOrder", parseInt(v) || 0)}
                    />
                    <FormField
                      label="Bayrak Emojisi"
                      value={office.flag || ""}
                      onChange={(v) => updateOffice(editingOfficeIdx, "flag", v)}
                      placeholder="🇬🇧"
                    />
                    <FormField
                      label="Telefon"
                      value={office.phone || ""}
                      onChange={(v) => updateOffice(editingOfficeIdx, "phone", v)}
                    />
                    <FormField
                      label="E-posta"
                      value={office.email || ""}
                      onChange={(v) => updateOffice(editingOfficeIdx, "email", v)}
                    />
                    <FormField
                      label="Görsel Dosya Yolu"
                      type="image"
                      value={office.image || ""}
                      onChange={(v) => updateOffice(editingOfficeIdx, "image", v)}
                      placeholder="assets/offices/..."
                    />
                    <div className="col-span-2">
                      <FormField
                        label="Adres (EN)"
                        type="textarea"
                        value={office.address || ""}
                        onChange={(v) => updateOffice(editingOfficeIdx, "address", v)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-xs font-bold text-gray-700 mb-3">Çeviriler</h4>
                    <TranslationEditor
                      item={office}
                      fields={OFFICE_TRANSLATION_FIELDS}
                      onChange={(locale, key, val) => updateOfficeLocalized(editingOfficeIdx, locale, key, val)}
                    />
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#131b2e]">Ofisler</h3>
                <button
                  onClick={addOffice}
                  className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold"
                >
                  + Yeni Ofis Ekle
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {[...officesList]
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((o: any) => {
                    const originalIndex = officesList.findIndex((x: any) => x.id === o.id);
                    return (
                      <div key={o.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{o.flag}</span>
                          <div>
                            <p className="font-bold text-sm text-gray-800">{o.country}</p>
                            <p className="text-xs text-gray-400">Telefon: {o.phone || "—"} • E-posta: {o.email || "—"}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingOfficeIdx(originalIndex)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition"
                        >
                          Düzenle
                        </button>
                      </div>
                    );
                  })}
                {officesList.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">Henüz ofis eklenmemiş.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
