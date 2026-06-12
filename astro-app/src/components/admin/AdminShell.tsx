"use client";

import { useState } from "react";

import { useAdmin } from "./AdminContext";
import OverviewPanel from "./OverviewPanel";
import LeadsTablePanel from "./LeadsTablePanel";
import LeadsKanbanPanel from "./LeadsKanbanPanel";
import ProductsPanel from "./ProductsPanel";
import NewsPanel from "./NewsPanel";
import FaqsPanel from "./FaqsPanel";
import SolutionsPanel from "./SolutionsPanel";
import ClientsPanel from "./ClientsPanel";
import SEOCenterPanel from "./SEOCenterPanel";
import PageContentPanel from "./PageContentPanel";
import TranslationHealthPanel from "./TranslationHealthPanel";
import SettingsPanel from "./SettingsPanel";
import BackupsPanel from "./BackupsPanel";

type Tab =
  | "overview" | "leads" | "kanban"
  | "products" | "news" | "faqs" | "solutions" | "clients"
  | "seo" | "translations" | "health"
  | "settings" | "backups";

const ICON_PATHS: Record<Tab, string> = {
  overview: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  leads: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  kanban: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  news: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  faqs: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  solutions: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  clients: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  seo: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  translations: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129",
  health: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  backups: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
};

function TabIcon({ tab }: { tab: Tab }) {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[tab]} />
    </svg>
  );
}

const TABS: { section: string; items: { key: Tab; label: string }[] }[] = [
  {
    section: "Genel",
    items: [
      { key: "overview", label: "Genel Bakış" },
      { key: "leads", label: "Mesajlar (Tablo)" },
      { key: "kanban", label: "Leads Pipeline" },
    ],
  },
  {
    section: "İçerik Yönetimi",
    items: [
      { key: "products", label: "Ürünler" },
      { key: "news", label: "Haberler" },
      { key: "faqs", label: "SSS" },
      { key: "solutions", label: "Çözümler" },
      { key: "clients", label: "Müşteriler" },
    ],
  },
  {
    section: "SEO & Çeviriler",
    items: [
      { key: "seo", label: "SEO Merkezi" },
      { key: "translations", label: "Sayfa Çevirileri" },
      { key: "health", label: "Çeviri Sağlığı" },
    ],
  },
  {
    section: "Sistem",
    items: [
      { key: "settings", label: "Ayarlar" },
      { key: "backups", label: "Yedekleme" },
    ],
  },
];

export default function AdminShell() {
  const { session, isDirty, saving, saveMessage, saveContent, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]" style={{ fontFamily: "var(--font-body)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#132175] flex items-center justify-center">
            <span className="text-white font-black text-lg">W</span>
          </div>
          <p className="text-sm font-semibold text-[#131b2e] animate-pulse">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f5f3ff]" style={{ fontFamily: "var(--font-body)" }}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#132175] flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur">
              <img src={`${import.meta.env.BASE_URL}assets/willow-mark-transparent.png`} alt="" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide text-white" style={{ fontFamily: "var(--font-display)" }}>WILLOWSOFT</h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>

          <nav className="px-3 py-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-200px)]">
            {TABS.map((group) => (
              <div key={group.section}>
                <p className="text-[10px] font-bold text-white/35 uppercase tracking-wider px-3 mb-1.5 mt-4 first:mt-1">{group.section}</p>
                {group.items.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5 ${
                      activeTab === tab.key
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-white/60 hover:bg-white/8 hover:text-white/90"
                    }`}
                  >
                    <TabIcon tab={tab.key} />
                    {tab.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-white/10 space-y-2">
          <div className="text-xs text-white/50 px-2">
            Oturum: <strong className="text-white/80">{session?.name}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-white/8 hover:bg-red-500/20 hover:text-red-200 rounded-lg text-xs font-semibold text-white/50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur px-8 flex items-center justify-between shrink-0 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight text-[#131b2e]" style={{ fontFamily: "var(--font-display)" }}>
            {TABS.flatMap((g) => g.items).find((t) => t.key === activeTab)?.label || "Panel"}
          </h2>
          <div className="flex items-center gap-3">
            {saveMessage && <span className="text-xs font-medium text-emerald-600">{saveMessage}</span>}
            <button
              onClick={saveContent}
              disabled={saving}
              className={`px-5 py-2 font-bold text-xs rounded-lg shadow-sm transition ${
                isDirty
                  ? "bg-[#132175] hover:bg-[#0e1a5e] text-white shadow-[#132175]/20"
                  : "bg-gray-100 text-gray-400 cursor-default"
              } disabled:opacity-50`}
            >
              {saving ? "Kaydediliyor..." : isDirty ? "Değişiklikleri Kaydet" : "Kayıtlı"}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "overview" && <OverviewPanel />}
          {activeTab === "leads" && <LeadsTablePanel />}
          {activeTab === "kanban" && <LeadsKanbanPanel />}
          {activeTab === "products" && <ProductsPanel />}
          {activeTab === "news" && <NewsPanel />}
          {activeTab === "faqs" && <FaqsPanel />}
          {activeTab === "solutions" && <SolutionsPanel />}
          {activeTab === "clients" && <ClientsPanel />}
          {activeTab === "seo" && <SEOCenterPanel />}
          {activeTab === "translations" && <PageContentPanel />}
          {activeTab === "health" && <TranslationHealthPanel />}
          {activeTab === "settings" && <SettingsPanel />}
          {activeTab === "backups" && <BackupsPanel />}
        </div>
      </main>
    </div>
  );
}
