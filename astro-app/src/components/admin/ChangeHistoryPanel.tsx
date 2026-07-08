"use client";

import { useState, useEffect, useCallback } from "react";
import { summarizeDiff, formatDiffValue, type DiffEntry } from "@/lib/json-diff";
import { humanizeDiffPath } from "@/lib/snapshot-sections";

interface SnapshotListItem {
  id: string;
  created_at: string;
  actor_name: string;
  reason: string;
  scope: string;
  meta: Record<string, unknown> & {
    changeCount?: number;
    changePaths?: string[];
    changeDiff?: DiffEntry[];
    page?: string;
    section?: string;
  };
}

interface SnapshotDetail extends SnapshotListItem {
  content: Record<string, unknown>;
}

const REASON_LABELS: Record<string, string> = {
  "content.update: products": "Ürünler kaydedildi",
  "content.update: news": "Haberler kaydedildi",
  "content.update: services": "Hizmetler kaydedildi",
  "content.update: solutions": "Çözümler kaydedildi",
  "content.update: clients": "Müşteriler kaydedildi",
  "content.update: faqs": "SSS kaydedildi",
  "content.update: glossary": "Sözlük kaydedildi",
  "content.update: pageContent": "Sayfa içeriği kaydedildi",
  "content.update: pageSeo": "SEO kaydedildi",
  "content.update: translations": "Çeviriler kaydedildi",
  "content.update: companyFacts": "Hakkımızda kaydedildi",
  "content.update: meta": "Site ayarları kaydedildi",
  "content.update: all": "Tüm içerik kaydedildi",
  "content.update: pre-restore": "Geri yükleme öncesi güvenlik kopyası",
};

function labelReason(reason: string, meta: Record<string, unknown>) {
  if (reason.startsWith("content.update: pageContent.") && meta.page) {
    return `Sayfa kaydedildi: ${meta.page}`;
  }
  return REASON_LABELS[reason] || reason;
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

export default function ChangeHistoryPanel() {
  const [snapshots, setSnapshots] = useState<SnapshotListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [migrationPending, setMigrationPending] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actorFilter, setActorFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SnapshotDetail | null>(null);
  const [diffEntries, setDiffEntries] = useState<DiffEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [message, setMessage] = useState("");
  const limit = 20;

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (actorFilter) params.set("actor", actorFilter);
      if (reasonFilter) params.set("reason", reasonFilter);

      const res = await fetch(`/api/admin/snapshots?${params}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (res.status === 403) {
          setError("Bu sayfayı görüntüleme yetkiniz yok.");
        } else {
          setError(data.error || "Geçmiş yüklenemedi.");
        }
        return;
      }

      setSnapshots(data.snapshots || []);
      setTotal(data.pagination?.total ?? 0);
      setMigrationPending(!!data.migrationPending);
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }, [page, actorFilter, reasonFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchList();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchList]);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    setMessage("");
    try {
      const curRes = await fetch(`/api/admin/snapshots?id=${encodeURIComponent(id)}`);
      const curData = await curRes.json();
      if (!curRes.ok || !curData.ok) throw new Error(curData.error || "Snapshot yüklenemedi");

      const cur = curData.snapshot as SnapshotDetail;
      setDetail(cur);

      const storedDiff = Array.isArray(cur.meta?.changeDiff) ? (cur.meta.changeDiff as DiffEntry[]) : [];
      setDiffEntries(storedDiff);
    } catch (e: unknown) {
      setMessage(`Hata: ${e instanceof Error ? e.message : "Detay yüklenemedi"}`);
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRevertSection = async () => {
    if (!detail?.meta?.sectionBefore) return;

    const sectionLabel = labelReason(detail.reason, detail.meta);
    const warn = [
      `Yalnızca bu kayıt geri alınacak: ${sectionLabel}`,
      "Diğer bölümler (ürünler, diğer sayfalar vb.) etkilenmez.",
      "",
      'Devam için "REVERT" yazmanız istenecek.',
    ].join("\n");

    if (!confirm(warn)) return;
    const typed = prompt('Onaylamak için büyük harflerle "REVERT" yazın:');
    if (typed !== "REVERT") {
      setMessage("Geri alma iptal edildi.");
      return;
    }

    setReverting(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/snapshots/${detail.id}/revert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "REVERT" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Geri alma başarısız");

      setMessage("Değişiklik geri alındı. Sayfa yenileniyor…");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: unknown) {
      setMessage(`Hata: ${e instanceof Error ? e.message : "Geri alma başarısız"}`);
    } finally {
      setReverting(false);
    }
  };

  const handleRestore = async () => {
    if (!detail) return;

    const warn = [
      "Bu snapshot'taki CMS içeriğine komple geri dönülecek.",
      "Tüm ürünler, sayfa metinleri, çeviriler (localized) ve şirket bilgileri güncellenecek.",
      "Yedekte olmayan kayıtlar silinebilir (saveContent senkronu).",
      "",
      'Devam için "RESTORE" yazmanız istenecek.',
    ].join("\n");

    if (!confirm(warn)) return;
    const typed = prompt('Onaylamak için büyük harflerle "RESTORE" yazın:');
    if (typed !== "RESTORE") {
      setMessage("Geri yükleme iptal edildi.");
      return;
    }

    setRestoring(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/snapshots/${detail.id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "RESTORE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Geri yükleme başarısız");

      setMessage("Geri yükleme tamamlandı. Sayfa yenileniyor…");
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: unknown) {
      setMessage(`Hata: ${e instanceof Error ? e.message : "Geri yükleme başarısız"}`);
    } finally {
      setRestoring(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const diffSummary = summarizeDiff(diffEntries);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h3 className="text-lg font-bold text-[#131b2e]">Değişiklik Geçmişi</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Her <strong>Değişiklikleri Kaydet</strong> sonrası yalnızca o kaydın bölümü izlenir (ör. SSS, Ana Sayfa).
          Önce/sonra değerleri ve <strong>tek tıkla geri al</strong> burada. Tam site yedeği gelişmiş seçenektir.
        </p>
      </div>

      {migrationPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
          Snapshot tablosu henüz oluşturulmamış. Supabase&apos;de{" "}
          <code>0005_admin_snapshots.sql</code> migration&apos;ını çalıştırın.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          value={actorFilter}
          onChange={(e) => { setActorFilter(e.target.value); setPage(1); }}
          placeholder="Kullanıcı ara…"
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs min-w-[140px]"
        />
        <input
          value={reasonFilter}
          onChange={(e) => { setReasonFilter(e.target.value); setPage(1); }}
          placeholder="İşlem ara (örn. pageContent)…"
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs min-w-[180px]"
        />
        <button
          onClick={() => fetchList()}
          className="px-4 py-2 bg-[#132175] text-white rounded-lg text-xs font-bold"
        >
          Yenile
        </button>
      </div>

      {message && (
        <p className={`text-xs font-medium ${message.includes("Hata") || message.includes("iptal") ? "text-red-600" : "text-emerald-700"}`}>
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Yükleniyor…</p>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700">{error}</div>
      ) : snapshots.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-xs text-gray-400">
          Henüz snapshot yok. İçerik kaydettiğinizde otomatik oluşur.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-gray-600">Tarih</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600">Kullanıcı</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600">İşlem</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600">Değişiklik</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600" />
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snap) => (
                  <tr key={snap.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(snap.created_at).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#131b2e]">{snap.actor_name}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {labelReason(snap.reason, snap.meta)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {typeof snap.meta?.changeCount === "number"
                        ? `${snap.meta.changeCount} alan`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openDetail(snap.id)}
                        className="px-3 py-1.5 bg-[#132175]/10 hover:bg-[#132175]/20 text-[#132175] rounded-lg font-bold transition"
                      >
                        İncele
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40"
          >
            Önceki
          </button>
          <span className="text-xs text-gray-500 self-center">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40"
          >
            Sonraki
          </button>
        </div>
      )}

      {/* Detail drawer */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedId(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col max-h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-sm font-bold text-[#131b2e]">Snapshot Detayı</h4>
                {detail && (
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(detail.created_at).toLocaleString("tr-TR")} · {detail.actor_name}
                  </p>
                )}
              </div>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {detailLoading ? (
                <p className="text-xs text-gray-500">Yükleniyor…</p>
              ) : detail ? (
                <>
                  <div className="bg-[#132175]/5 border border-[#132175]/15 rounded-xl p-4">
                    <p className="text-xs font-bold text-[#132175]">{labelReason(detail.reason, detail.meta)}</p>
                    {diffEntries.length > 0 ? (
                      <p className="text-[11px] text-gray-600 mt-2">
                        Bu kayıtta değişen: <strong>{diffSummary.count}</strong> alan
                        {diffSummary.truncated ? " (liste kısaltıldı)" : ""}
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-500 mt-2">
                        Değişiklik özeti yok (eski kayıt). Yeni kayıtlarda önce/sonra görünür.
                      </p>
                    )}
                  </div>

                  {diffEntries.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-gray-700">Önce → Sonra</h5>
                      <ul className="space-y-3 max-h-80 overflow-y-auto">
                        {diffEntries.slice(0, 40).map((entry) => (
                          <li key={entry.path} className="text-[11px] bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <p className="font-semibold text-[#132175] mb-2">
                              {humanizeDiffPath(entry.path, detail.meta?.sectionKey as string | undefined)}
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="rounded-md bg-red-50/80 border border-red-100 p-2">
                                <p className="text-[9px] font-bold uppercase text-red-400 mb-1">Önce</p>
                                <p className="text-gray-700 whitespace-pre-wrap break-words">{formatDiffValue(entry.before)}</p>
                              </div>
                              <div className="rounded-md bg-emerald-50/80 border border-emerald-100 p-2">
                                <p className="text-[9px] font-bold uppercase text-emerald-600 mb-1">Sonra</p>
                                <p className="text-gray-900 whitespace-pre-wrap break-words">{formatDiffValue(entry.after)}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {diffEntries.length > 40 && (
                        <p className="text-[10px] text-gray-400">+{diffEntries.length - 40} alan daha…</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {detail.meta?.sectionBefore != null && (
                      <button
                        onClick={handleRevertSection}
                        disabled={reverting || restoring}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
                      >
                        {reverting ? "Geri alınıyor…" : "Bu değişikliği geri al"}
                      </button>
                    )}
                    <button
                      onClick={() => downloadJson(detail.content, `snapshot-${detail.id.slice(0, 8)}.json`)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold"
                    >
                      Tam JSON İndir
                    </button>
                    <button
                      onClick={handleRestore}
                      disabled={restoring || reverting}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 rounded-lg text-xs font-bold"
                      title="Tüm siteyi bu snapshot anına döndürür — dikkatli kullanın"
                    >
                      {restoring ? "Geri yükleniyor…" : "Tüm siteyi geri yükle (gelişmiş)"}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
