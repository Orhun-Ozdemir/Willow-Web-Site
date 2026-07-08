"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type StorageFile = {
  path: string;
  size: number;
  contentType: string;
  updatedAt?: string;
  kind: "image" | "document" | "other";
  folder: string;
  used: boolean;
  sources: string[];
  isTemplateKeep: boolean;
  publicUrl: string;
};

type StorageStats = {
  total: number;
  used: number;
  unused: number;
  totalBytes: number;
  images: number;
  documents: number;
  other: number;
};

type UsageFilter = "all" | "used" | "unused";
type KindFilter = "all" | "image" | "document" | "other";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function sourceLabel(source: string) {
  const map: Record<string, string> = {
    template: "Şablon / sabit",
    page_content: "Sayfa içeriği",
    page_seo: "SEO",
    company_facts: "Hakkımızda",
    products: "Ürünler",
    news: "Haberler",
    articles: "Makaleler",
    solutions: "Çözümler",
    services: "Hizmetler",
    clients: "Müşteriler",
    platforms: "Platformlar",
    faqs: "SSS",
    glossary: "Sözlük",
    site_meta: "Site meta",
    admin_snapshots: "Değişiklik geçmişi",
  };
  return map[source] || source;
}

export default function StoragePanel() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("all");
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<StorageFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/storage");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Liste alınamadı");
      setFiles(data.files || []);
      setStats(data.stats || null);
      setSelected(new Set());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Yükleme hatası");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const folders = useMemo(() => {
    const set = new Set(files.map((f) => f.folder));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b, "tr"))];
  }, [files]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return files.filter((f) => {
      if (folder !== "all" && f.folder !== folder) return false;
      if (usageFilter === "used" && !f.used) return false;
      if (usageFilter === "unused" && f.used) return false;
      if (kindFilter !== "all" && f.kind !== kindFilter) return false;
      if (q && !f.path.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [files, folder, usageFilter, kindFilter, search]);

  const toggleSelect = (path: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelected(new Set(filtered.map((f) => f.path)));
  };

  const selectUnusedFiltered = () => {
    setSelected(new Set(filtered.filter((f) => !f.used && !f.isTemplateKeep).map((f) => f.path)));
  };

  const clearSelection = () => setSelected(new Set());

  const handleDelete = async (paths: string[], allowUsed = false) => {
    if (paths.length === 0) return;

    const usedCount = paths.filter((p) => files.find((f) => f.path === p)?.used).length;
    const templateCount = paths.filter((p) => files.find((f) => f.path === p)?.isTemplateKeep).length;

    let warn = `${paths.length} dosya Supabase Storage'dan kalıcı olarak silinecek.`;
    if (templateCount > 0) {
      warn += `\n\n⚠️ ${templateCount} dosya şablon/sabit listede — silinemez.`;
    }
    if (usedCount > 0 && !allowUsed) {
      warn += `\n\n⚠️ ${usedCount} dosya CMS'te kullanılıyor — listeden çıkarılacak veya "Kullanılanları da sil" seçeneği gerekir.`;
    }
    if (!confirm(warn)) return;

    const typed = prompt('Onaylamak için büyük harflerle "SİL" yazın:');
    if (typed !== "SİL") return;

    setDeleting(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths, confirm: "SİL", allowUsed }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Silme başarısız");

      const blocked = data.blocked?.length || 0;
      setMessage(
        `${data.deleted || 0} dosya silindi.${blocked ? ` ${blocked} dosya korundu (kullanımda veya şablon).` : ""}`,
      );
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Silme hatası");
    } finally {
      setDeleting(false);
    }
  };

  const selectedFiles = files.filter((f) => selected.has(f.path));
  const selectedUnused = selectedFiles.filter((f) => !f.used && !f.isTemplateKeep);
  const selectedUsed = selectedFiles.filter((f) => f.used);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Supabase Storage</p>
        <h2 className="mt-1 text-lg font-bold text-[#131b2e]">Medya & Dosyalar</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-3xl">
          <strong>assets</strong> bucket&apos;ındaki görselleri ve dökümanları görüntüleyin.
          Yeşil etiket = CMS veya şablonda referanslı; kırmızı = kullanılmıyor (güvenle silinebilir).
          Silinen dosyalar geri alınamaz — büyük temizlik öncesi Yedek & Aktarım&apos;dan tam ZIP alın.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Toplam", value: stats.total, sub: formatBytes(stats.totalBytes) },
            { label: "Kullanılıyor", value: stats.used, sub: "CMS / şablon", tone: "text-emerald-700" },
            { label: "Kullanılmıyor", value: stats.unused, sub: "Silinebilir", tone: "text-amber-700" },
            { label: "Görsel / Döküman", value: `${stats.images} / ${stats.documents}`, sub: `${stats.other} diğer` },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{card.label}</p>
              <p className={`mt-1 text-2xl font-black ${card.tone || "text-[#132175]"}`}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Dosya yolu ara…"
            className="flex-1 min-w-[180px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1aa3c4]"
          />
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            aria-label="Klasör filtresi"
          >
            {folders.map((f) => (
              <option key={f} value={f}>{f === "all" ? "Tüm klasörler" : f}</option>
            ))}
          </select>
          <select
            value={usageFilter}
            onChange={(e) => setUsageFilter(e.target.value as UsageFilter)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            aria-label="Kullanım filtresi"
          >
            <option value="all">Tümü</option>
            <option value="used">Kullanılıyor</option>
            <option value="unused">Kullanılmıyor</option>
          </select>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as KindFilter)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            aria-label="Tür filtresi"
          >
            <option value="all">Tüm türler</option>
            <option value="image">Görseller</option>
            <option value="document">Dökümanlar</option>
            <option value="other">Diğer</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Yükleniyor…" : "Yenile"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">{filtered.length} dosya · {selected.size} seçili</span>
          <button type="button" onClick={selectAllFiltered} className="text-xs font-semibold text-[#132175] hover:underline">
            Filtrelenenleri seç
          </button>
          <button type="button" onClick={selectUnusedFiltered} className="text-xs font-semibold text-amber-700 hover:underline">
            Kullanılmayanları seç
          </button>
          <button type="button" onClick={clearSelection} className="text-xs font-semibold text-gray-400 hover:underline">
            Seçimi temizle
          </button>
          {selectedUnused.length > 0 && (
            <button
              type="button"
              disabled={deleting}
              onClick={() => void handleDelete(selectedUnused.map((f) => f.path))}
              className="ml-auto rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {deleting ? "Siliniyor…" : `Seçili kullanılmayanları sil (${selectedUnused.length})`}
            </button>
          )}
          {selectedUsed.length > 0 && selectedUnused.length === 0 && (
            <button
              type="button"
              disabled={deleting}
              onClick={() => void handleDelete(selectedFiles.map((f) => f.path), true)}
              className="ml-auto rounded-lg bg-red-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50"
            >
              Kullanılanları da sil ({selectedUsed.length}) — riskli
            </button>
          )}
        </div>
      </div>

      {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      {loading && files.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 animate-pulse">
          Storage taranıyor…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((file) => {
            const isSelected = selected.has(file.path);
            return (
              <article
                key={file.path}
                className={`rounded-xl border bg-white overflow-hidden shadow-sm transition ${
                  isSelected ? "border-[#132175] ring-2 ring-[#132175]/20" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPreview(file)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                    {file.kind === "image" ? (
                      <img
                        src={file.publicUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : file.kind === "document" ? (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <span className="text-4xl">📄</span>
                        <span className="text-[10px] font-bold uppercase">{file.path.split(".").pop()}</span>
                      </div>
                    ) : (
                      <span className="text-3xl text-gray-300">📦</span>
                    )}
                    <span
                      className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        file.used ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {file.used ? "Kullanılıyor" : "Kullanılmıyor"}
                    </span>
                    {file.isTemplateKeep && (
                      <span className="absolute top-2 right-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                        Sabit
                      </span>
                    )}
                  </div>
                </button>
                <div className="p-3 space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(file.path)}
                      className="mt-1 shrink-0"
                    />
                    <span className="text-[11px] font-mono text-gray-700 break-all leading-snug">{file.path}</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {file.sources.slice(0, 3).map((s) => (
                      <span key={s} className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500">
                        {sourceLabel(s)}
                      </span>
                    ))}
                    {file.sources.length > 3 && (
                      <span className="text-[9px] text-gray-400">+{file.sources.length - 3}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{formatBytes(file.size)}</span>
                    <span>{formatDate(file.updatedAt)}</span>
                  </div>
                  {!file.used && !file.isTemplateKeep && (
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => void handleDelete([file.path])}
                      className="w-full rounded-lg border border-red-200 bg-red-50 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      Supabase&apos;den sil
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">Filtreye uyan dosya yok.</p>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="storage-preview-title"
        >
          <div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 id="storage-preview-title" className="font-bold text-sm text-[#131b2e] truncate pr-4">
                {preview.path}
              </h3>
              <button type="button" onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Kapat">
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              {preview.kind === "image" && (
                <img src={preview.publicUrl} alt="" className="max-h-80 w-full object-contain rounded-lg bg-gray-50" />
              )}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[10px] font-bold uppercase text-gray-400">Durum</dt>
                  <dd className="font-semibold">{preview.used ? "CMS'te kullanılıyor" : "Referans yok"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase text-gray-400">Boyut</dt>
                  <dd>{formatBytes(preview.size)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[10px] font-bold uppercase text-gray-400">Kaynaklar</dt>
                  <dd className="flex flex-wrap gap-1 mt-1">
                    {preview.sources.length ? preview.sources.map((s) => (
                      <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs">{sourceLabel(s)}</span>
                    )) : <span className="text-gray-400">—</span>}
                  </dd>
                </div>
              </dl>
              <a
                href={preview.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-xs font-bold text-[#132175] hover:underline"
              >
                Yeni sekmede aç ↗
              </a>
              {!preview.used && !preview.isTemplateKeep && (
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    void handleDelete([preview.path]).then(() => setPreview(null));
                  }}
                  className="w-full rounded-lg bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Bu dosyayı Supabase&apos;den sil
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
