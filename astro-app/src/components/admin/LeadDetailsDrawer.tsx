"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAdmin } from "./AdminContext";
import AdminDrawer, { DrawerCloseButton } from "./AdminDrawer";

interface Note {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface Document {
  id: string;
  name: string;
  url: string;
  type: "file" | "link";
  uploadedBy: string;
  createdAt: string;
}

interface Activity {
  id: string;
  type: "status_change" | "note_added" | "document_added" | "lead_created";
  description: string;
  author: string;
  createdAt: string;
}

interface ParsedNoteData {
  notes: Note[];
  documents: Document[];
  activities: Activity[];
}

interface LeadDetailsDrawerProps {
  leadId: string | null;
  onClose: () => void;
}

export default function LeadDetailsDrawer({ leadId, onClose }: LeadDetailsDrawerProps) {
  const { leads, updateLead, session } = useAdmin();
  const [activeTab, setActiveTab] = useState<"details" | "notes" | "timeline">("details");
  const [newNoteText, setNewNoteText] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Link attachment states
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const lead = useMemo(() => {
    if (!leadId) return null;
    return leads.find((l) => l.id === leadId) || null;
  }, [leads, leadId]);

  // Reset tab when active lead changes
  useEffect(() => {
    if (leadId) {
      setActiveTab("details");
      setShowAddLink(false);
      setNewLinkName("");
      setNewLinkUrl("");
      setNewNoteText("");
    }
  }, [leadId]);

  // Parse internal note JSON or treat as legacy text
  const parsedNoteData = useMemo<ParsedNoteData>(() => {
    const defaultData: ParsedNoteData = { notes: [], documents: [], activities: [] };
    if (!lead || !lead.internalNote || !lead.internalNote.trim()) return defaultData;

    const noteText = lead.internalNote.trim();
    try {
      if (noteText.startsWith("{")) {
        const parsed = JSON.parse(noteText);
        return {
          notes: parsed.notes || [],
          documents: parsed.documents || [],
          activities: parsed.activities || [],
        };
      }
    } catch (e) {
      // JSON parsing failed, fallback to plain text treatment below
    }

    // Treat as legacy plain text note
    return {
      notes: [
        {
          id: "legacy",
          text: lead.internalNote,
          author: "Sistem",
          createdAt: lead.updatedAt || lead.createdAt || new Date().toISOString(),
        },
      ],
      documents: [],
      activities: [],
    };
  }, [lead]);

  if (!leadId || !lead) return null;

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: "Yeni",
      contacted: "Görüşüldü",
      qualified: "Uygun",
      won: "Kazanıldı",
      lost: "Kapandı",
      spam: "Spam",
    };
    return labels[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "contacted":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "qualified":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "won":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "lost":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const oldStatus = lead.status || "new";
    if (oldStatus === newStatus) return;

    // Generate activity
    const activity: Activity = {
      id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      type: "status_change",
      description: `Durum '${getStatusLabel(oldStatus)}' -> '${getStatusLabel(newStatus)}' olarak değiştirildi.`,
      author: session?.name || "Admin",
      createdAt: new Date().toISOString(),
    };

    const updatedNoteData = {
      ...parsedNoteData,
      activities: [activity, ...parsedNoteData.activities],
    };

    await updateLead(lead.id, {
      status: newStatus,
      internalNote: JSON.stringify(updatedNoteData),
    });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: Note = {
      id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      text: newNoteText.trim(),
      author: session?.name || "Admin",
      createdAt: new Date().toISOString(),
    };

    const newActivity: Activity = {
      id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      type: "note_added",
      description: `Not eklendi: "${newNote.text.substring(0, 30)}${newNote.text.length > 30 ? "..." : ""}"`,
      author: session?.name || "Admin",
      createdAt: new Date().toISOString(),
    };

    const updatedNoteData = {
      ...parsedNoteData,
      notes: [newNote, ...parsedNoteData.notes],
      activities: [newActivity, ...parsedNoteData.activities],
    };

    await updateLead(lead.id, {
      internalNote: JSON.stringify(updatedNoteData),
    });

    setNewNoteText("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "leads-attachments");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.url) {
          const newDoc: Document = {
            id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            name: file.name,
            url: data.url,
            type: "file",
            uploadedBy: session?.name || "Admin",
            createdAt: new Date().toISOString(),
          };

          const newActivity: Activity = {
            id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            type: "document_added",
            description: `Dosya eklendi: ${file.name}`,
            author: session?.name || "Admin",
            createdAt: new Date().toISOString(),
          };

          const updatedNoteData = {
            ...parsedNoteData,
            documents: [newDoc, ...parsedNoteData.documents],
            activities: [newActivity, ...parsedNoteData.activities],
          };

          await updateLead(lead.id, {
            internalNote: JSON.stringify(updatedNoteData),
          });
        } else {
          alert("Dosya yüklenirken sunucu hatası oluştu.");
        }
      } else {
        alert("Dosya yüklenemedi.");
      }
    } catch (err) {
      console.error(err);
      alert("Dosya yükleme işlemi başarısız oldu.");
    } finally {
      setUploading(false);
      // Reset input element value so same file can be selected again
      e.target.value = "";
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkUrl.trim() || !newLinkName.trim()) return;

    const linkUrl = newLinkUrl.trim();
    const formattedUrl = linkUrl.startsWith("http://") || linkUrl.startsWith("https://") ? linkUrl : `https://${linkUrl}`;

    const newDoc: Document = {
      id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      name: newLinkName.trim(),
      url: formattedUrl,
      type: "link",
      uploadedBy: session?.name || "Admin",
      createdAt: new Date().toISOString(),
    };

    const newActivity: Activity = {
      id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      type: "document_added",
      description: `Bağlantı eklendi: ${newLinkName.trim()}`,
      author: session?.name || "Admin",
      createdAt: new Date().toISOString(),
    };

    const updatedNoteData = {
      ...parsedNoteData,
      documents: [newDoc, ...parsedNoteData.documents],
      activities: [newActivity, ...parsedNoteData.activities],
    };

    await updateLead(lead.id, {
      internalNote: JSON.stringify(updatedNoteData),
    });

    setNewLinkName("");
    setNewLinkUrl("");
    setShowAddLink(false);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Bu dokümanı/bağlantıyı listeden kaldırmak istediğinize emin misiniz?")) return;

    const docToDelete = parsedNoteData.documents.find((d) => d.id === docId);
    const docName = docToDelete ? docToDelete.name : "Bilinmeyen Doküman";

    const newActivity: Activity = {
      id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      type: "document_added",
      description: `Doküman silindi: ${docName}`,
      author: session?.name || "Admin",
      createdAt: new Date().toISOString(),
    };

    const updatedNoteData = {
      ...parsedNoteData,
      documents: parsedNoteData.documents.filter((d) => d.id !== docId),
      activities: [newActivity, ...parsedNoteData.activities],
    };

    await updateLead(lead.id, {
      internalNote: JSON.stringify(updatedNoteData),
    });
  };

  const drawerHeader = (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-md border text-[10px] font-extrabold tracking-wider uppercase ${getStatusBadgeClass(lead.status || "new")}`}>
            {getStatusLabel(lead.status || "new")}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            {new Date(lead.createdAt).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <h3 id="admin-drawer-title" className="text-lg font-extrabold text-[#172032] leading-tight truncate" style={{ fontFamily: "var(--font-display)" }}>
          {lead.name || "İsimsiz Başvuru"}
        </h3>
        {lead.company && (
          <p className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {lead.company}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
          <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <select
            value={lead.status || "new"}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-transparent text-xs font-bold outline-none text-gray-700 cursor-pointer max-w-[7rem]"
            aria-label="Durum değiştir"
          >
            <option value="new">Yeni</option>
            <option value="contacted">Görüşüldü</option>
            <option value="qualified">Uygun</option>
            <option value="won">Kazanıldı</option>
            <option value="lost">Kapandı</option>
            <option value="spam">Spam</option>
          </select>
        </div>
        <DrawerCloseButton onClose={onClose} />
      </div>
    </div>
  );

  const drawerTabs = (
    <div className="px-4 sm:px-6 flex gap-1 overflow-x-auto" role="tablist" aria-label="Mesaj detay sekmeleri">
      {(["details", "notes", "timeline"] as const).map((tab) => {
        const labels = { details: "Detaylar & Mesaj", notes: "Notlar & Ekler", timeline: "Aktivite Geçmişi" };
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            id={`lead-tab-${tab}`}
            aria-controls={`lead-panel-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`relative shrink-0 py-3.5 px-2 mr-2 text-xs font-bold tracking-wide uppercase transition flex items-center gap-1.5 whitespace-nowrap ${
              isActive ? "text-[#132175]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#132175] rounded-full" />}
            {labels[tab]}
            {tab === "notes" && parsedNoteData.notes.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${isActive ? "bg-[#132175]/10 text-[#132175]" : "bg-gray-100 text-gray-500"}`}>
                {parsedNoteData.notes.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <AdminDrawer open onClose={onClose} maxWidth="xl" header={drawerHeader} tabs={drawerTabs} labelledById="admin-drawer-title">
          {/* TAB 1: DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-6 animate-[adminFadeIn_200ms_ease-out]" role="tabpanel" id="lead-panel-details" aria-labelledby="lead-tab-details">
              {/* Contact Grid Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">İletişim Bilgileri</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium block">E-Posta Adresi</span>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-[#132175] font-semibold hover:underline block mt-0.5 text-sm"
                    >
                      {lead.email || "—"}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Telefon</span>
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="text-gray-800 font-semibold block mt-0.5 text-sm">
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-gray-800 font-semibold block mt-0.5 text-sm">—</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Ülke</span>
                    <span className="text-gray-800 font-semibold block mt-0.5">{lead.country || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">İletişim Dili / Locale</span>
                    <span className="text-gray-800 font-semibold uppercase block mt-0.5">{lead.locale || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Lead Details Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Talep Detayları</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium block">İlgi Türü</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold inline-block mt-1">
                      {lead.interestType || lead.projectType || lead.subject || "Bilinmiyor"}
                    </span>
                  </div>
                  {lead.subject && lead.subject !== lead.interestType && lead.subject !== lead.projectType && (
                    <div>
                      <span className="text-gray-400 font-medium block">İletişim Konusu</span>
                      <span className="text-gray-800 font-semibold block mt-0.5">{lead.subject}</span>
                    </div>
                  )}
                  {lead.productInterest && (
                    <div>
                      <span className="text-gray-400 font-medium block">İlgilenilen Ürün</span>
                      <span className="text-gray-800 font-semibold block mt-0.5">{lead.productInterest}</span>
                    </div>
                  )}
                  {lead.serviceInterest && (
                    <div>
                      <span className="text-gray-400 font-medium block">İlgilenilen Servis</span>
                      <span className="text-gray-800 font-semibold block mt-0.5">{lead.serviceInterest}</span>
                    </div>
                  )}
                  {lead.timeline && (
                    <div>
                      <span className="text-gray-400 font-medium block">İstenen Süreç</span>
                      <span className="text-gray-800 font-semibold block mt-0.5">{lead.timeline}</span>
                    </div>
                  )}
                  {lead.budgetRange && (
                    <div>
                      <span className="text-gray-400 font-medium block">Bütçe Aralığı</span>
                      <span className="text-emerald-700 font-bold block mt-0.5">{lead.budgetRange}</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-gray-400 font-medium block">Geldiği Kaynak Sayfa</span>
                    <span className="text-gray-600 font-mono text-[10px] break-all block mt-0.5">{lead.sourcePage || "Doğrudan/Bilinmiyor"}</span>
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Gönderilen Mesaj</h4>
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
                  {(lead.message || "").replace(/\n\n--- Project brief ---[\s\S]*$/, "").trim() || "Mesaj içeriği boş."}
                </div>
                {(lead.projectType || lead.currentStatus || (lead.layers && lead.layers.length) || lead.timeline || lead.budgetRange || lead.subject) && (
                  <div className="rounded-lg border border-slate-100 bg-white p-3 text-xs text-gray-600 space-y-1">
                    {lead.subject && <p><span className="font-semibold text-gray-500">Konu:</span> {lead.subject}</p>}
                    {lead.projectType && <p><span className="font-semibold text-gray-500">Kapsam:</span> {lead.projectType}</p>}
                    {lead.currentStatus && <p><span className="font-semibold text-gray-500">Durum:</span> {lead.currentStatus}</p>}
                    {Array.isArray(lead.layers) && lead.layers.length > 0 && (
                      <p><span className="font-semibold text-gray-500">Katmanlar:</span> {lead.layers.join(", ")}</p>
                    )}
                    {lead.timeline && <p><span className="font-semibold text-gray-500">Süre:</span> {lead.timeline}</p>}
                    {lead.budgetRange && <p><span className="font-semibold text-gray-500">Bütçe:</span> {lead.budgetRange}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NOTES & DOCUMENTS */}
          {activeTab === "notes" && (
            <div className="space-y-6 animate-[adminFadeIn_200ms_ease-out]" role="tabpanel" id="lead-panel-notes" aria-labelledby="lead-tab-notes">
              
              {/* Write Note Form */}
              <form onSubmit={handleAddNote} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">İş ile İlgili Not Ekle</h4>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Bu talep hakkında görüşmelerinizi, önemli ayrıntıları veya atılacak adımları not edin..."
                  rows={3}
                  className="w-full text-xs border border-gray-200 rounded-lg p-3 outline-none focus:border-[#132175] transition resize-y placeholder-gray-400"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2 bg-[#132175] text-white hover:bg-[#0e1a5e] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs rounded-lg transition"
                  >
                    Notu Kaydet
                  </button>
                </div>
              </form>

              {/* Documents & Links Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Ekler ve Dokümanlar</h4>
                  <div className="flex gap-2">
                    {/* Add Link Toggle */}
                    <button
                      onClick={() => setShowAddLink(!showAddLink)}
                      className="px-2 py-1 text-[#132175] hover:bg-slate-100 hover:text-[#0e1a5e] text-xs font-bold rounded flex items-center gap-1 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {showAddLink ? "İptal" : "Bağlantı Ekle"}
                    </button>

                    {/* File Upload Button wrapper */}
                    <label className="px-2 py-1 bg-[#132175] text-white hover:bg-[#0e1a5e] text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition">
                      {uploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Dosya Yükle
                        </>
                      )}
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Add Link Form */}
                {showAddLink && (
                  <form onSubmit={handleAddLink} className="p-3 bg-slate-50 border border-gray-200 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Bağlantı Adı</label>
                        <input
                          type="text"
                          required
                          value={newLinkName}
                          onChange={(e) => setNewLinkName(e.target.value)}
                          placeholder="Örn: Google Drive Klasörü"
                          className="w-full text-xs border border-gray-200 bg-white rounded p-2 outline-none focus:border-[#132175]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">URL / Link</label>
                        <input
                          type="text"
                          required
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                          placeholder="Örn: drive.google.com/..."
                          className="w-full text-xs border border-gray-200 bg-white rounded p-2 outline-none focus:border-[#132175]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddLink(false)}
                        className="px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded font-semibold"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1.5 text-xs bg-[#132175] text-white hover:bg-[#0e1a5e] rounded font-bold"
                      >
                        Ekle
                      </button>
                    </div>
                  </form>
                )}

                {/* Documents list */}
                <div className="space-y-2">
                  {parsedNoteData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-lg text-xs transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {doc.type === "file" ? (
                          <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        )}
                        <div className="min-w-0">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-gray-700 hover:text-[#132175] hover:underline block truncate"
                          >
                            {doc.name}
                          </a>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {doc.uploadedBy} tarafından • {new Date(doc.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded transition sm:opacity-60 sm:hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-200"
                        aria-label={`${doc.name} dokümanını sil`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {parsedNoteData.documents.length === 0 && (
                    <div className="text-center py-6 text-gray-400 bg-slate-50/50 rounded-lg border border-dashed border-gray-200">
                      <p className="text-xs">Henüz doküman veya harici bağlantı eklenmemiş.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Notes Feed */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider pl-1">Not Geçmişi</h4>
                <div className="space-y-3">
                  {parsedNoteData.notes.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold border-b border-gray-100 pb-1.5">
                        <span className="text-gray-600">{note.author}</span>
                        <span>
                          {new Date(note.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                    </div>
                  ))}

                  {parsedNoteData.notes.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-200">
                      <p className="text-xs">Bu talep hakkında henüz not yazılmamış.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm animate-[adminFadeIn_200ms_ease-out] space-y-4" role="tabpanel" id="lead-panel-timeline" aria-labelledby="lead-tab-timeline">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">İşleyiş Geçmişi</h4>

              <div className="relative border-l-2 border-[#132175]/15 pl-4 ml-2 space-y-6 py-2">
                {parsedNoteData.activities.map((act) => (
                  <div key={act.id} className="relative text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#132175] ring-4 ring-[#f7f8fc]" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">{act.author}</span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(act.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600">{act.description}</p>
                    </div>
                  </div>
                ))}

                {/* Initial Creation Log */}
                <div className="relative text-xs">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#5ba65b] ring-4 ring-[#f7f8fc]" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">Müşteri (Talep Sahibi)</span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(lead.createdAt).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600">Form doldurularak yeni iş talebi oluşturuldu.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

    </AdminDrawer>
  );
}
