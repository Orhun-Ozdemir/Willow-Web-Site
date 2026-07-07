"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";


import type { AdminRole } from "@/lib/permissions";

interface AdminContextValue {
  content: any;
  leads: any[];
  session: any;
  loading: boolean;
  setContent: (updater: (prev: any) => any) => void;
  setLeads: React.Dispatch<React.SetStateAction<any[]>>;
  isDirty: boolean;
  dirtyKeys: string[];
  saving: boolean;
  saveMessage: string;
  saveContent: () => Promise<void>;
  savePageContent: (pageKey: string) => Promise<void>;
  isPageContentDirty: (pageKey: string) => boolean;
  updateLeadStatus: (leadId: string, status: string) => Promise<void>;
  updateLead: (leadId: string, updates: { status?: string; internalNote?: string }) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [content, setContentRaw] = useState<any>(null);
  const [initialContent, setInitialContent] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  

  useEffect(() => {
    async function fetchData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok || !sessionData.authenticated) {
          window.location.href = "/admin";
          return;
        }
        setSession({
          ...sessionData.user,
          role: (sessionData.user?.role as AdminRole) || "super_admin",
        });

        const contentRes = await fetch("/api/content");
        const contentData = await contentRes.json();
        setContentRaw(contentData);
        setInitialContent(JSON.parse(JSON.stringify(contentData)));

        const leadsRes = await fetch("/api/leads");
        const leadsData = await leadsRes.json();
        setLeads(leadsRes.ok ? leadsData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const setContent = useCallback((updater: (prev: any) => any) => {
    setContentRaw((prev: any) => {
      return updater(prev);
    });
  }, []);

  const dirtyKeys = useMemo<string[]>(() => {
    if (!initialContent || !content) return [];
    const keys = [
      "products", "news", "services", "solutions", "clients",
      "faqs", "glossary", "pageContent", "pageSeo", "translations",
      "companyFacts", "meta"
    ];
    return keys.filter(key => JSON.stringify(initialContent[key]) !== JSON.stringify(content[key]));
  }, [initialContent, content]);
  const isDirty = dirtyKeys.length > 0;

  // Guard against losing unsaved edits when the tab is closed or reloaded.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const saveContent = useCallback(async () => {
    if (!initialContent || !content) return;

    const keys = [
      "products", "news", "services", "solutions", "clients", 
      "faqs", "glossary", "pageContent", "pageSeo", "translations", 
      "companyFacts", "meta"
    ];
    const dirtyKeys = keys.filter(key => JSON.stringify(initialContent[key]) !== JSON.stringify(content[key]));

    if (dirtyKeys.length === 0) return;

    setSaving(true);
    setSaveMessage("");

    const keyLabels: Record<string, string> = {
      products: "Ürünler",
      news: "Haberler",
      services: "Hizmetler",
      solutions: "Çözümler",
      clients: "Müşteriler",
      faqs: "Sıkça Sorulan Sorular",
      glossary: "Sözlük",
      pageContent: "Sayfa İçeriği",
      pageSeo: "SEO Ayarları",
      translations: "Çeviriler",
      companyFacts: "Hakkımızda",
      meta: "Site Ayarları"
    };

    try {
      for (const key of dirtyKeys) {
        const label = keyLabels[key] || key;
        setSaveMessage(`${label} kaydediliyor...`);

        const res = await fetch(`/api/content?section=${key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(content[key]),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(`[${label}] ${err.error || "Kayıt başarısız"}`);
        }
      }

      setInitialContent(JSON.parse(JSON.stringify(content)));
      setSaveMessage("Tüm değişiklikler kaydedildi ✓");
    } catch (err: any) {
      setSaveMessage(`Hata: ${err.message || "Kayıt sırasında bir hata oluştu"}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 4000);
    }
  }, [initialContent, content]);

  const savePageContent = useCallback(async (pageKey: string) => {
    if (!initialContent || !content) return;
    const pageData = content.pageContent?.[pageKey];
    if (!pageData) return;
    if (JSON.stringify(initialContent.pageContent?.[pageKey]) === JSON.stringify(pageData)) return;

    const keyLabels: Record<string, string> = {
      home: "Ana Sayfa",
      products: "Ürünler",
      solutions: "Çözümler",
      services: "Hizmetler",
      news: "Haberler",
      company: "Hakkımızda",
      contact: "İletişim",
      startProject: "Proje Başlat",
      glossary: "Sözlük",
    };

    setSaving(true);
    setSaveMessage("");
    const label = keyLabels[pageKey] || pageKey;
    setSaveMessage(`${label} kaydediliyor...`);

    try {
      const res = await fetch(`/api/content?section=pageContent&page=${encodeURIComponent(pageKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Kayıt başarısız");
      }

      setInitialContent((prev: any) => ({
        ...prev,
        pageContent: {
          ...prev.pageContent,
          [pageKey]: JSON.parse(JSON.stringify(pageData)),
        },
      }));
      setSaveMessage(`${label} kaydedildi ✓`);
    } catch (err: any) {
      setSaveMessage(`Hata: ${err.message || "Kayıt sırasında bir hata oluştu"}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 4000);
    }
  }, [initialContent, content]);

  const isPageContentDirty = useCallback((pageKey: string) => {
    if (!initialContent || !content) return false;
    return JSON.stringify(initialContent.pageContent?.[pageKey]) !== JSON.stringify(content.pageContent?.[pageKey]);
  }, [initialContent, content]);

  const updateLead = useCallback(async (leadId: string, updates: { status?: string; internalNote?: string }) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.lead) {
          setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const updateLeadStatus = useCallback(async (leadId: string, status: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const oldStatus = lead.status || "new";
    if (oldStatus === status) return;

    const getStatusLabel = (s: string) => {
      const labels: Record<string, string> = {
        new: "Yeni",
        contacted: "Görüşüldü",
        qualified: "Uygun",
        won: "Kazanıldı",
        lost: "Kapandı",
        spam: "Spam",
      };
      return labels[s] || s;
    };

    const noteText = lead.internalNote || "";
    let parsedNote: any = { notes: [], documents: [], activities: [] };
    try {
      if (noteText.trim().startsWith("{")) {
        parsedNote = JSON.parse(noteText);
      } else if (noteText.trim()) {
        parsedNote.notes.push({
          id: "legacy",
          text: noteText,
          author: "Sistem",
          createdAt: lead.updatedAt || lead.createdAt || new Date().toISOString(),
        });
      }
    } catch (e) {
      if (noteText.trim()) {
        parsedNote.notes.push({
          id: "legacy",
          text: noteText,
          author: "Sistem",
          createdAt: lead.updatedAt || lead.createdAt || new Date().toISOString(),
        });
      }
    }

    const activity = {
      id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      type: "status_change",
      description: `Durum '${getStatusLabel(oldStatus)}' -> '${getStatusLabel(status)}' olarak değiştirildi.`,
      author: session?.name || "Admin",
      createdAt: new Date().toISOString(),
    };

    parsedNote.activities = [activity, ...(parsedNote.activities || [])];

    await updateLead(leadId, {
      status,
      internalNote: JSON.stringify(parsedNote),
    });
  }, [leads, session, updateLead]);

  const deleteLead = useCallback(async (leadId: string) => {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        content,
        leads,
        session,
        loading,
        setContent,
        setLeads,
        isDirty,
        dirtyKeys,
        saving,
        saveMessage,
        saveContent,
        savePageContent,
        isPageContentDirty,
        updateLeadStatus,
        updateLead,
        deleteLead,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
