"use client";

import { useState } from "react";
import { useAdmin } from "./AdminContext";

function getDraftTs() {
  return typeof window !== "undefined" ? localStorage.getItem("willowsoft-draft-ts") : null;
}

export default function BackupsPanel() {
  const { content, setContent } = useAdmin();
  const [uploadMessage, setUploadMessage] = useState("");
  const [draftInfo, setDraftInfo] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(() => typeof window !== "undefined" && !!localStorage.getItem("willowsoft-draft"));
  const [draftTs, setDraftTs] = useState<string | null>(getDraftTs);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.href = url;
    a.download = `willowsoft-backup-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMessage("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.products && !data.pageSeo && !data.meta) {
          setUploadMessage("Geçersiz yedek dosyası — products, pageSeo veya meta alanı bulunamadı.");
          return;
        }
        setContent(() => data);
        setUploadMessage(`Yedek yüklendi (${Object.keys(data).length} üst alan). Kaydetmek için "Değişiklikleri Kaydet" butonuna basın.`);
      } catch {
        setUploadMessage("JSON ayrıştırma hatası — dosya geçerli JSON değil.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const saveDraft = () => {
    try {
      const ts = new Date().toISOString();
      localStorage.setItem("willowsoft-draft", JSON.stringify(content));
      localStorage.setItem("willowsoft-draft-ts", ts);
      setHasDraft(true);
      setDraftTs(ts);
      setDraftInfo("Taslak kaydedildi: " + new Date(ts).toLocaleString("tr-TR"));
    } catch {
      setDraftInfo("localStorage hatası — taslak kaydedilemedi.");
    }
  };

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem("willowsoft-draft");
      const ts = localStorage.getItem("willowsoft-draft-ts");
      if (!raw) {
        setDraftInfo("Kayıtlı taslak bulunamadı.");
        return;
      }
      const data = JSON.parse(raw);
      setContent(() => data);
      setDraftInfo(`Taslak yüklendi (${ts ? new Date(ts).toLocaleString("tr-TR") : "tarih bilinmiyor"}). Kaydetmek için "Değişiklikleri Kaydet" butonuna basın.`);
    } catch {
      setDraftInfo("Taslak yüklenirken hata oluştu.");
    }
  };

  const clearDraft = () => {
    localStorage.removeItem("willowsoft-draft");
    localStorage.removeItem("willowsoft-draft-ts");
    setHasDraft(false);
    setDraftTs(null);
    setDraftInfo("Taslak silindi.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Download Backup */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-800">JSON Yedek İndir</h3>
        <p className="text-xs text-gray-500">Mevcut site-data.json içeriğini tam olarak indirir. Bu dosyayı tekrar yükleyerek geri dönebilirsiniz.</p>
        <button onClick={handleDownload} className="px-4 py-2 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded-lg text-xs font-bold transition">
          Yedek İndir (.json)
        </button>
      </div>

      {/* Upload Backup */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-800">Yedekten Geri Yükle</h3>
        <p className="text-xs text-gray-500">Daha önce indirdiğiniz bir yedek dosyasını yükleyin. Yükleme sonrası "Değişiklikleri Kaydet" ile veritabanına yazılır.</p>
        <label className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-bold cursor-pointer transition">
          Dosya Seç (.json)
          <input type="file" accept=".json" onChange={handleUpload} className="hidden" />
        </label>
        {uploadMessage && (
          <p className={`text-xs font-medium ${uploadMessage.includes("hata") || uploadMessage.includes("Geçersiz") ? "text-red-400" : "text-[#132175]"}`}>
            {uploadMessage}
          </p>
        )}
      </div>

      {/* Draft Recovery */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-800">Taslak Kurtarma (localStorage)</h3>
        <p className="text-xs text-gray-500">
          Mevcut düzenlemelerinizi tarayıcı belleğine kaydedin. Sayfa kapansa bile geri yükleyebilirsiniz.
          {draftTs && <span className="text-gray-400 ml-1">(Son taslak: {new Date(draftTs).toLocaleString("tr-TR")})</span>}
        </p>
        <div className="flex gap-2">
          <button onClick={saveDraft} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition">
            Taslak Kaydet
          </button>
          <button onClick={loadDraft} disabled={!hasDraft} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 disabled:opacity-40 rounded text-xs font-bold transition">
            Taslak Yükle
          </button>
          <button onClick={clearDraft} disabled={!hasDraft} className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-400 disabled:opacity-40 rounded text-xs font-bold text-gray-500 transition">
            Taslak Sil
          </button>
        </div>
        {draftInfo && <p className="text-xs text-gray-500">{draftInfo}</p>}
      </div>
    </div>
  );
}
