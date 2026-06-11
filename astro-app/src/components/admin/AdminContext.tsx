"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";


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
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
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
      const next = updater(prev);
      setIsDirty(true);
      return next;
    });
  }, []);

  const saveContent = useCallback(async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        setIsDirty(false);
        setSaveMessage("Tüm değişiklikler kaydedildi ✓");
      } else {
        const err = await res.json();
        setSaveMessage(`Hata: ${err.error || "Kayıt başarısız"}`);
      }
    } catch {
      setSaveMessage("Kayıt başarısız. Ağ hatası.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }, [content]);

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
