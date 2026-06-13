"use client";

import { useState, useEffect } from "react";

interface AdminUser {
  id: string;
  username: string;
  active: boolean;
  created_at: string;
}

export default function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [changingPw, setChangingPw] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.ok) setUsers(data.users);
      else setError(data.error || "Kullanıcılar yüklenemedi.");
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      const data = await res.json();
      if (data.ok) {
        setUsers((prev) => [...prev, data.user]);
        setNewUsername("");
        setNewPassword("");
      } else {
        setAddError(data.error || "Hata oluştu.");
      }
    } catch {
      setAddError("Bağlantı hatası.");
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(user: AdminUser) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    const data = await res.json();
    if (data.ok) setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)));
  }

  async function deleteUser(user: AdminUser) {
    if (!confirm(`"${user.username}" kullanıcısını silmek istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== user.id));
  }

  async function changePassword(userId: string) {
    setPwError("");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPw }),
    });
    const data = await res.json();
    if (data.ok) {
      setChangingPw(null);
      setNewPw("");
    } else {
      setPwError(data.error || "Hata oluştu.");
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#131b2e", margin: 0 }}>Admin Kullanıcıları</h3>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          Panele erişebilecek kullanıcıları buradan yönetin. Supabase <code>admin_users</code> tablosu üzerinden çalışır.
        </p>
      </div>

      {/* Add user form */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Yeni Kullanıcı Ekle</p>
        <form onSubmit={addUser} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 160px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Kullanıcı Adı</label>
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="ornek.kullanici"
              required
              style={{ padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, background: "#f9fafb" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 160px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Şifre (min 8 karakter)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              style={{ padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, background: "#f9fafb" }}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            style={{ padding: "9px 20px", background: "#132175", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: adding ? "not-allowed" : "pointer", opacity: adding ? 0.7 : 1 }}
          >
            {adding ? "Ekleniyor..." : "+ Ekle"}
          </button>
        </form>
        {addError && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>{addError}</p>}
      </div>

      {/* User list */}
      {loading ? (
        <p style={{ color: "#6b7280", fontSize: 14 }}>Yükleniyor...</p>
      ) : error ? (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 18px", color: "#dc2626", fontSize: 13 }}>
          <strong>Hata:</strong> {error}
          <p style={{ marginTop: 6, fontSize: 12, color: "#991b1b" }}>
            Supabase'de <code>admin_users</code> tablosu oluşturuldu mu? Aşağıdaki SQL'i çalıştırman gerekiyor.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.length === 0 && (
            <div style={{ background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 10, padding: "20px 24px", color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
              Henüz kullanıcı yok. Yukarıdan ilk kullanıcıyı ekleyin.
            </div>
          )}
          {users.map((user) => (
            <div key={user.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#131b2e" }}>{user.username}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: user.active ? "#dcfce7" : "#f3f4f6", color: user.active ? "#16a34a" : "#9ca3af" }}>
                    {user.active ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
                  Eklenme: {new Date(user.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>

              {/* Change password inline */}
              {changingPw === user.id ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Yeni şifre (min 8)"
                    minLength={8}
                    autoFocus
                    style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 12, width: 160 }}
                  />
                  <button onClick={() => changePassword(user.id)} style={{ padding: "6px 12px", background: "#132175", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Kaydet</button>
                  <button onClick={() => { setChangingPw(null); setNewPw(""); setPwError(""); }} style={{ padding: "6px 10px", background: "#f3f4f6", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>İptal</button>
                  {pwError && <span style={{ fontSize: 11, color: "#ef4444" }}>{pwError}</span>}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setChangingPw(user.id); setNewPw(""); setPwError(""); }}
                    style={{ padding: "6px 12px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}
                  >
                    Şifre Değiştir
                  </button>
                  <button
                    onClick={() => toggleActive(user)}
                    style={{ padding: "6px 12px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, fontWeight: 600, color: user.active ? "#d97706" : "#16a34a", cursor: "pointer" }}
                  >
                    {user.active ? "Pasifleştir" : "Aktifleştir"}
                  </button>
                  <button
                    onClick={() => deleteUser(user)}
                    style={{ padding: "6px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#dc2626", cursor: "pointer" }}
                  >
                    Sil
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SQL hint */}
      <div style={{ marginTop: 32, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Supabase'de tablo yoksa — SQL Editor'da çalıştır:
        </p>
        <pre style={{ fontSize: 11, color: "#334155", background: "#e2e8f0", borderRadius: 8, padding: "12px 14px", overflowX: "auto", margin: 0, lineHeight: 1.6 }}>{`create table admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Service role only — disable public access
alter table admin_users enable row level security;
create policy "deny_all" on admin_users using (false);`}</pre>
      </div>
    </div>
  );
}
