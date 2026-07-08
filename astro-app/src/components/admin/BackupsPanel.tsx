"use client";

import { useState } from "react";
import { useAdmin } from "./AdminContext";
import {
  buildFullBackupZip,
  restoreFullBackupZip,
  downloadBytes,
  FULL_BACKUP_SCHEMA_VERSION,
  type BackupProgress,
} from "@/lib/backup-client";
import {
  buildLocalizationBundle,
  isRecognizedCmsPayload,
  mergeCmsPayload,
} from "@/lib/localization-export";

function getDraftTs() {
  return typeof window !== "undefined" ? localStorage.getItem("willowsoft-draft-ts") : null;
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type RestoreScope = "content" | "full";

export default function BackupsPanel() {
  const { content, setContent } = useAdmin();
  const [uploadMessage, setUploadMessage] = useState("");
  const [dbMessage, setDbMessage] = useState("");
  const [dbLoading, setDbLoading] = useState(false);
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [draftInfo, setDraftInfo] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(() => typeof window !== "undefined" && !!localStorage.getItem("willowsoft-draft"));
  const [draftTs, setDraftTs] = useState<string | null>(getDraftTs);

  const handleContentDownload = () => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    downloadJson(content, `willowsoft-backup-${ts}.json`);
  };

  const handleLocalizationDownload = () => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    downloadJson(buildLocalizationBundle(content), `willowsoft-localizations-${ts}.json`);
  };

  const handleFullZipExport = async (scope: "content" | "full") => {
    setDbLoading(true);
    setDbMessage("");
    setProgress({ phase: "db-start", message: "Veritabanı okunuyor…" });
    try {
      const [dbRes, storageRes] = await Promise.all([
        fetch(`/api/admin/backups?scope=${scope}`),
        fetch("/api/admin/backups/storage"),
      ]);
      if (!dbRes.ok || !storageRes.ok) {
        const err = await dbRes.json().catch(() => ({}));
        throw new Error(err.error || "Yedek verisi alınamadı");
      }
      const db = await dbRes.json();
      const storage = await storageRes.json();
      if (!storage.ok) throw new Error(storage.error || "Storage listesi alınamadı");

      const manifest = {
        schemaVersion: FULL_BACKUP_SCHEMA_VERSION,
        source: "willowsoft-supabase",
        scope,
        createdAt: new Date().toISOString(),
        bucket: storage.bucket,
        tables: db.tables,
        stats: {
          ...db.stats,
          storageFiles: storage.files.length,
          storageBytes: storage.stats.totalBytes,
        },
        storage: storage.files,
        includes: { database: true, storage: true, localizations: true },
      };

      const zip = await buildFullBackupZip(
        manifest,
        storage.supabaseUrl,
        storage.files,
        setProgress,
      );

      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      downloadBytes(zip, `willowsoft-full-${scope}-${ts}.zip`);

      const mb = (storage.stats.totalBytes / 1024 / 1024).toFixed(1);
      setDbMessage(
        `Tam yedek indirildi — ${storage.files.length} storage dosyası (${mb} MB), tüm çeviriler (localized) dahil.`,
      );
    } catch (e: unknown) {
      setDbMessage(`Hata: ${e instanceof Error ? e.message : "Tam yedek alınamadı"}`);
    } finally {
      setDbLoading(false);
      setProgress(null);
    }
  };

  const handleFullZipRestore = async (file: File) => {
    const warn = [
      "⚠️ TAM GERİ YÜKLEME",
      "DB + Storage birebir yedekteki hâle getirilir.",
      "Tüm localized çeviriler, görseller ve CMS verisi dahil.",
      "Yedekte olmayan DB satırları ve storage dosyaları SİLİNİR.",
      "",
      'Devam için "RESTORE" yazmanız istenecek.',
    ].join("\n");
    if (!confirm(warn)) return;

    const typed = prompt('Onaylamak için büyük harflerle "RESTORE" yazın:');
    if (typed !== "RESTORE") {
      setDbMessage("Geri yükleme iptal edildi.");
      return;
    }

    setDbLoading(true);
    setDbMessage("");
    try {
      const buf = await file.arrayBuffer();
      await restoreFullBackupZip(new Uint8Array(buf), setProgress);
      setDbMessage("Tam geri yükleme tamamlandı. Sayfa yenileniyor…");
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: unknown) {
      setDbMessage(`Hata: ${e instanceof Error ? e.message : "Geri yükleme başarısız"}`);
    } finally {
      setDbLoading(false);
      setProgress(null);
    }
  };

  const handleDbExport = async (scope: "content" | "full") => {
    setDbLoading(true);
    setDbMessage("");
    try {
      const res = await fetch(`/api/admin/backups?scope=${scope}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      downloadJson(data, `willowsoft-db-${scope}-${ts}.json`);
      const stats = data.stats as Record<string, number> | undefined;
      const total = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;
      setDbMessage(`Veritabanı yedeği indirildi (${scope}) — ${total} satır, ${stats ? Object.keys(stats).length : 0} tablo.`);
    } catch (e: unknown) {
      setDbMessage(`Hata: ${e instanceof Error ? e.message : "Yedek alınamadı"}`);
    } finally {
      setDbLoading(false);
    }
  };

  const handleContentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMessage("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data?.tables && data?.schemaVersion) {
          setUploadMessage("Bu dosya tam veritabanı yedeği — aşağıdaki «Veritabanına Geri Yükle» bölümünü kullanın.");
          return;
        }
        if (!isRecognizedCmsPayload(data)) {
          setUploadMessage(
            "Geçersiz dosya — tam CMS yedeği, çeviri paketi (willowsoft-localizations) veya en az bir içerik bölümü gerekli.",
          );
          return;
        }
        const { next, sections } = mergeCmsPayload(content, data);
        const label = sections.join(", ");
        if (
          !confirm(
            `Bu dosya mevcut içeriğe birleştirilecek:\n\n${label}\n\nYalnızca dosyada olan bölümler güncellenir; diğerleri korunur.\n\nDevam edilsin mi? (Henüz kaydedilmez — önce gözden geçirebilirsiniz.)`,
          )
        ) {
          return;
        }
        setContent(() => next);
        setUploadMessage(
          `Yüklendi — ${sections.length} bölüm güncellendi (${label}). Kalıcı yapmak için sağ üstteki "Değişiklikleri Kaydet" butonuna basın.`,
        );
      } catch {
        setUploadMessage("JSON ayrıştırma hatası — dosya geçerli JSON değil.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDbRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.name.endsWith(".zip")) {
      void handleFullZipRestore(file);
      return;
    }

    setDbMessage("");

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const backup = JSON.parse(ev.target?.result as string);

        const isDbBackup = backup?.tables && typeof backup.tables === "object";
        const isLegacy = !isDbBackup && (backup?.products || backup?.pageContent);

        if (!isDbBackup && !isLegacy) {
          setDbMessage("Geçersiz yedek — tables (DB) veya CMS alanları (products, pageContent) gerekli.");
          return;
        }

        const scope: RestoreScope = isLegacy
          ? "content"
          : backup.scope === "content"
            ? "content"
            : "full";

        const stats = isDbBackup ? backup.stats as Record<string, number> | undefined : undefined;
        const tableList = isDbBackup ? Object.keys(backup.tables).join(", ") : "CMS içerik tabloları";

        const scopeLabel = scope === "full"
          ? "TAM VERİTABANI (içerik + leadler + bildirimler + admin kullanıcıları + analitik)"
          : "yalnızca site içeriği";

        const warn = [
          `⚠️ Bu işlem doğrudan Supabase'e yazılır.`,
          `Kapsam: ${scopeLabel}`,
          `Tablolar: ${tableList}`,
          stats ? `Satır sayıları: ${Object.entries(stats).map(([k, v]) => `${k}=${v}`).join(", ")}` : "",
          ``,
          `Yedekte olmayan mevcut kayıtlar SİLİNİR (duplicate oluşmaz).`,
          `Geri yüklemeden önce otomatik güvenlik yedeği alınır.`,
          ``,
          `Devam etmek için «RESTORE» yazmanız istenecek.`,
        ].filter(Boolean).join("\n");

        if (!confirm(warn)) return;

        const typed = prompt('Onaylamak için büyük harflerle "RESTORE" yazın:');
        if (typed !== "RESTORE") {
          setDbMessage("Geri yükleme iptal edildi — onay metni eşleşmedi.");
          return;
        }

        setDbLoading(true);
        setDbMessage("Geri yükleniyor…");

        const res = await fetch("/api/admin/backups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backup, confirm: "RESTORE", scope }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Geri yükleme başarısız");

        const summary = Object.entries(result.result?.tables || {})
          .map(([t, s]: [string, any]) => `${t}: ${s.upserted} güncellendi, ${s.deleted} silindi`)
          .join("; ");

        setDbMessage(`Geri yükleme tamamlandı. ${summary}. Sayfa yenileniyor…`);
        setTimeout(() => window.location.reload(), 2000);
      } catch (err: unknown) {
        setDbMessage(`Hata: ${err instanceof Error ? err.message : "Geri yükleme başarısız"}`);
      } finally {
        setDbLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const progressLabel = () => {
    if (!progress) return null;
    if (progress.phase === "storage-download" && progress.current && progress.total) {
      return `Görseller indiriliyor: ${progress.current}/${progress.total}${progress.path ? ` — ${progress.path}` : ""}`;
    }
    if (progress.phase === "storage-upload" && progress.current && progress.total) {
      return `Görseller yükleniyor: ${progress.current}/${progress.total}${progress.path ? ` — ${progress.path}` : ""}`;
    }
    return progress.message || progress.phase;
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
    <div className="space-y-6 max-w-3xl">
      {/* Metinler & çeviriler — önceki akış, güncellenmiş */}
      <div className="bg-[#132175]/5 border border-[#132175]/15 rounded-xl p-5">
        <h3 className="text-sm font-bold text-[#132175]">Metinler & Çeviriler (JSON)</h3>
        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
          Sitenin <strong>tüm metin ve çeviri katmanı</strong> — sayfa metinleri (<code>pageContent</code>),
          arayüz string&apos;leri (<code>translations</code>), ürün/haber/SSS <code>localized</code> alanları,
          SEO metinleri ve şirket metinleri — tek JSON dosyasında toplanır. Dosyayı indirip dışarıda düzenleyip
          geri yükleyebilirsiniz. Buton alanları artık <code>{`{ "tr": { "label": "...", "url": "/solutions" } }`}</code>{" "}
          formatını da destekler; eski düz metin kayıtları bozulmaz.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-800">1 · Tüm Metinleri İndir (Dışa Aktar)</h3>
        <p className="text-xs text-gray-500">
          Admin panelindeki tüm CMS içeriğini indirir (<code>willowsoft-backup-…json</code>). Görseller ve slug&apos;lar
          dahil tam paket — eskiden kullandığınız akış.
        </p>
        <button
          onClick={handleContentDownload}
          className="px-4 py-2 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded-lg text-xs font-bold transition"
        >
          Tüm Metinleri İndir (.json)
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-800">1b · Yalnızca Çevirileri İndir</h3>
        <p className="text-xs text-gray-500">
          Daha küçük dosya: yalnızca çeviri/metin alanları (<code>willowsoft-localizations-…json</code>).
          Koleksiyonlarda <code>id</code> + <code>localized</code>; sayfalarda tüm dil alanları.
        </p>
        <button
          onClick={handleLocalizationDownload}
          className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold transition"
        >
          Çevirileri İndir (.json)
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-800">2 · JSON Yükle (İçe Aktar)</h3>
        <p className="text-xs text-gray-500">
          İndirdiğiniz/düzenlediğiniz JSON dosyasını seçin. Tam yedek veya çeviri paketi olabilir.
          Yalnızca dosyadaki bölümler güncellenir. Kalıcı kayıt için sağ üstteki{" "}
          <strong>Değişiklikleri Kaydet</strong> gerekir.
        </p>
        <label className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-bold cursor-pointer transition">
          Dosya Seç (.json)
          <input type="file" accept=".json" onChange={handleContentUpload} className="hidden" />
        </label>
        {uploadMessage && (
          <p
            className={`text-xs font-medium ${uploadMessage.includes("hata") || uploadMessage.includes("Geçersiz") ? "text-red-400" : "text-[#132175]"}`}
          >
            {uploadMessage}
          </p>
        )}
      </div>

      {/* Tam yedek: DB + Storage + localizations */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-emerald-900">Gelişmiş · Tam Site Yedeği (DB + Storage + Çeviriler)</h3>
          <p className="text-xs text-emerald-800/80 mt-1.5 leading-relaxed">
            Tek ZIP dosyasında <strong>her şey</strong>: tüm veritabanı tabloları (ürünler, sayfa metinleri, SEO,
            <code className="mx-0.5">translations</code> ve her satırdaki <code className="mx-0.5">localized</code> alanları),
            Supabase Storage görselleri (<code>uploads/</code>, <code>team/</code>, <code>news/</code> vb.).
            Geri yükleme yedekteki hâli birebir uygular; fazlalık veya duplicate oluşmaz.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFullZipExport("full")}
            disabled={dbLoading}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
          >
            {dbLoading ? "İşleniyor…" : "Tam ZIP Yedeği İndir"}
          </button>
          <button
            onClick={() => handleFullZipExport("content")}
            disabled={dbLoading}
            className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
          >
            İçerik ZIP Yedeği
          </button>
        </div>

        {progressLabel() && (
          <p className="text-xs text-emerald-700 font-medium animate-pulse">{progressLabel()}</p>
        )}

        <div className="border-t border-emerald-200 pt-4 space-y-2">
          <h4 className="text-xs font-bold text-emerald-900">Tam Geri Yükle (.zip)</h4>
          <p className="text-xs text-emerald-800/70">
            ZIP veya JSON yedeği seçin. ZIP = DB + görseller birlikte; JSON = yalnızca veritabanı.
          </p>
          <label className="inline-block px-4 py-2 bg-white border border-emerald-300 hover:bg-emerald-50 rounded-lg text-xs font-bold cursor-pointer transition text-emerald-900">
            Yedek Dosyası Seç (.zip / .json)
            <input type="file" accept=".zip,.json" onChange={handleDbRestore} className="hidden" disabled={dbLoading} />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-emerald-200 pt-4">
          <button
            onClick={() => handleDbExport("full")}
            disabled={dbLoading}
            className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 disabled:opacity-50 rounded-lg text-xs font-bold transition"
          >
            Yalnızca DB JSON (tam)
          </button>
          <button
            onClick={() => handleDbExport("content")}
            disabled={dbLoading}
            className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 disabled:opacity-50 rounded-lg text-xs font-bold transition"
          >
            Yalnızca DB JSON (içerik)
          </button>
        </div>

        {dbMessage && (
          <p className={`text-xs font-medium ${dbMessage.includes("Hata") || dbMessage.includes("iptal") || dbMessage.includes("Geçersiz") ? "text-red-600" : "text-emerald-800"}`}>
            {dbMessage}
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

      {/* CLI bilgisi */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2">
        <h3 className="text-sm font-bold text-gray-700">Komut Satırı (CI / sunucu)</h3>
        <pre className="text-[11px] text-gray-600 bg-white border border-gray-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
{`node --env-file=.env scripts/backup-full.mjs
node --env-file=.env scripts/restore-full.mjs backups/willowsoft-full-....zip --force
node --env-file=.env scripts/backup-db.mjs   # yalnızca DB JSON`}
        </pre>
      </div>
    </div>
  );
}
