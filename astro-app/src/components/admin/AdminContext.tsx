"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";


interface AdminContextValue {
  content: any;
  leads: any[];
  session: any;
  loading: boolean;
  setContent: (updater: (prev: any) => any) => void;
  setLeads: React.Dispatch<React.SetStateAction<any[]>>;
  isDirty: boolean;
  saving: boolean;
  saveMessage: string;
  saveContent: () => Promise<void>;
  updateLeadStatus: (leadId: string, status: string) => Promise<void>;
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
        setSession(sessionData.user);

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

  const isDirty = useMemo(() => {
    if (!initialContent || !content) return false;
    const keys = [
      "products", "news", "services", "solutions", "clients", 
      "faqs", "glossary", "pageContent", "pageSeo", "translations", 
      "companyFacts", "meta"
    ];
    return keys.some(key => JSON.stringify(initialContent[key]) !== JSON.stringify(content[key]));
  }, [initialContent, content]);

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
      companyFacts: "Şirket Bilgileri",
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

  const updateLeadStatus = useCallback(async (leadId: string, status: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

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
        saving,
        saveMessage,
        saveContent,
        updateLeadStatus,
        deleteLead,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
