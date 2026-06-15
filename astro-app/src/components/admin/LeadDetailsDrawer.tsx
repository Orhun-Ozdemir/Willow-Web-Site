"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAdmin } from "./AdminContext";

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

  if (!lead) return null;

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

  return (
    <>
      {/* Backdrop Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 transition-transform duration-300 transform translate-x-0">
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${getStatusBadgeClass(lead.status || "new")}`}>
                {getStatusLabel(lead.status || "new")}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(lead.createdAt).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900">{lead.name || "İsimsiz Başvuru"}</h3>
            {lead.company && <p className="text-xs text-gray-500 font-semibold">{lead.company}</p>}
          </div>

          <div className="flex items-center gap-4">
            {/* Status Changer */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Durum:</span>
              <select
                value={lead.status || "new"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold outline-none text-gray-700 shadow-xs cursor-pointer hover:border-gray-300 transition"
              >
                <option value="new">Yeni</option>
                <option value="contacted">Görüşüldü</option>
                <option value="qualified">Uygun</option>
                <option value="won">Kazanıldı</option>
                <option value="lost">Kapandı</option>
                <option value="spam">Spam</option>
              </select>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-gray-100 flex gap-4 bg-white">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 text-xs font-bold border-b-2 tracking-wide uppercase transition ${
              activeTab === "details"
                ? "border-[#132175] text-[#132175]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Detaylar & Mesaj
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-3 text-xs font-bold border-b-2 tracking-wide uppercase transition flex items-center gap-1.5 ${
              activeTab === "notes"
                ? "border-[#132175] text-[#132175]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Notlar & Ekler
            {parsedNoteData.notes.length > 0 && (
              <span className="bg-[#132175]/10 text-[#132175] px-1.5 py-0.5 rounded-full text-[9px] font-extrabold">
                {parsedNoteData.notes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-3 text-xs font-bold border-b-2 tracking-wide uppercase transition ${
              activeTab === "timeline"
                ? "border-[#132175] text-[#132175]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Aktivite Geçmişi
          </button>
        </div>

        {/* Scrollable Content Workspace */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

          {/* TAB 1: DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Contact Grid Card */}
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs space-y-4">
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
                    <a
                      href={lead.phone ? `tel:${lead.phone}` : undefined}
                      className="text-gray-800 font-semibold block mt-0.5 text-sm"
                    >
                      {lead.phone || "—"}
                    </a>
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
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Talep Detayları</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium block">İlgi Türü</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold inline-block mt-1">
                      {lead.interestType || lead.projectType || "Bilinmiyor"}
                    </span>
                  </div>
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
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Gönderilen Mesaj</h4>
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
                  {lead.message || "Mesaj içeriği boş."}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOTES & DOCUMENTS */}
          {activeTab === "notes" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Write Note Form */}
              <form onSubmit={handleAddNote} className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs space-y-3">
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
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Ekler ve Dokümanlar</h4>
                  <div className="flex gap-2">
                    {/* Add Link Toggle */}
                    <button
                      onClick={() => setShowAddLink(!showAddLink)}
                      className="px-2 py-1 text-[#132175] hover:bg-slate-55 hover:text-[#0e1a5e] text-xs font-bold rounded flex items-center gap-1 transition"
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
                            className="font-bold text-gray-750 hover:text-[#132175] hover:underline block truncate"
                          >
                            {doc.name}
                          </a>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {doc.uploadedBy} tarafından • {new Date(doc.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition opacity-0 group-hover:opacity-100"
                        title="Dokümanı sil"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {parsedNoteData.documents.length === 0 && (
                    <div className="text-center py-6 text-gray-450 bg-slate-50/50 rounded-lg border border-dashed border-gray-200">
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
                    <div key={note.id} className="bg-white border border-gray-150 rounded-xl p-4 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold border-b border-gray-100 pb-1.5">
                        <span className="text-gray-650">{note.author}</span>
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
                    <div className="text-center py-8 text-gray-450 bg-white rounded-xl border border-gray-150">
                      <p className="text-xs">Bu talep hakkında henüz not yazılmamış.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs animate-fadeIn space-y-4">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">İşleyiş Geçmişi</h4>
              
              <div className="relative border-l border-gray-200 pl-4 ml-2 space-y-6 py-2">
                {parsedNoteData.activities.map((act) => (
                  <div key={act.id} className="relative text-xs">
                    {/* Circle Dot indicator on vertical line */}
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                    
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
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
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

        </div>
      </div>
    </>
  );
}
