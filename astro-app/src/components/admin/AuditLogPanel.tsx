"use client";

import { useState, useEffect, useCallback } from "react";

interface AuditLog {
  id: string;
  actor_name: string;
  action: string;
  resource: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_hint: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Giriş",
  "auth.logout": "Çıkış",
  "content.update": "İçerik güncelleme",
  "lead.update": "Lead güncelleme",
  "lead.delete": "Lead silme",
  "user.create": "Kullanıcı oluşturma",
  "user.update": "Kullanıcı güncelleme",
  "user.delete": "Kullanıcı silme",
  "media.upload": "Dosya yükleme",
  "snapshot.restore": "Snapshot geri yükleme",
  "snapshot.revert_section": "Kayıt geri alma (tek bölüm)",
  "backup.export": "Yedek dışa aktarma",
  "backup.restore": "Yedek geri yükleme",
  "storage.delete": "Storage dosyası silme",
};

function formatAction(action: string) {
  return ACTION_LABELS[action] || action;
}

function formatMeta(metadata: Record<string, unknown>) {
  if (!metadata || Object.keys(metadata).length === 0) return "—";
  const parts: string[] = [];
  if (metadata.section) parts.push(`Bölüm: ${metadata.section}`);
  if (metadata.status) parts.push(`Durum: ${metadata.status}`);
  if (metadata.filename) parts.push(`Dosya: ${metadata.filename}`);
  if (metadata.role) parts.push(`Rol: ${metadata.role}`);
  if (parts.length) return parts.join(" · ");
  return JSON.stringify(metadata).slice(0, 80);
}

export default function AuditLogPanel() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [migrationPending, setMigrationPending] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const limit = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (actorFilter) params.set("actor", actorFilter);
      if (actionFilter) params.set("action", actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (res.status === 403) {
          setError("Bu sayfayı görüntüleme yetkiniz yok.");
        } else {
          setError(data.error || "Loglar yüklenemedi.");
        }
        return;
      }

      setLogs(data.logs || []);
      setTotal(data.pagination?.total ?? 0);
      setMigrationPending(!!data.migrationPending);
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }, [page, actorFilter, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#131b2e", margin: 0 }}>İşlem Logları</h3>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          Admin panelinde yapılan işlemlerin kaydı. Sadece süper admin görebilir.
        </p>
      </div>

      {migrationPending && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400e" }}>
          Audit log tablosu henüz oluşturulmamış. Supabase&apos;de <code>0004_audit_and_roles.sql</code> migration&apos;ını çalıştırdıktan sonra kayıtlar burada görünür.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={actorFilter}
          onChange={(e) => { setActorFilter(e.target.value); setPage(1); }}
          placeholder="Kullanıcı ara..."
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 160 }}
        />
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}
        >
          <option value="">Tüm işlemler</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          onClick={() => fetchLogs()}
          style={{ padding: "8px 16px", background: "#132175", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Yenile
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#6b7280", fontSize: 14 }}>Yükleniyor...</p>
      ) : error ? (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 18px", color: "#dc2626", fontSize: 13 }}>{error}</div>
      ) : logs.length === 0 ? (
        <div style={{ background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 10, padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
          Henüz kayıt yok.
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, color: "#374151" }}>Tarih</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, color: "#374151" }}>Kullanıcı</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, color: "#374151" }}>İşlem</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, color: "#374151" }}>Kaynak</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, color: "#374151" }}>Detay</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>
                    {new Date(log.created_at).toLocaleString("tr-TR")}
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#131b2e" }}>{log.actor_name}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: "#eef2ff", color: "#3730a3", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#374151" }}>
                    {log.resource}
                    {log.resource_id ? ` / ${log.resource_id.slice(0, 8)}…` : ""}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#6b7280", fontSize: 12 }}>{formatMeta(log.metadata)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}
          >
            Önceki
          </button>
          <span style={{ fontSize: 13, color: "#6b7280", alignSelf: "center" }}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}
