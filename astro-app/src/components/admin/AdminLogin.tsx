"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        window.location.href = "/admin/dashboard";
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        fontFamily: "var(--font-body)",
        background: "linear-gradient(160deg, #0e1a5e 0%, #132175 50%, #1a6b8a 100%)",
      }}
    >
      <div className="w-full max-w-md space-y-0">
        <div className="flex flex-col items-center pb-8">
          <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center shadow-2xl mb-5">
            <img src="/assets/willow-mark-transparent.png" alt="WillowSoft" className="w-16 h-16 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            WILLOWSOFT
          </h1>
          <p className="text-sm text-white/50 tracking-wider uppercase mt-1">Admin Panel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-[#131b2e]">Giriş Yap</h2>
            <p className="text-sm text-gray-400">CMS ve lead yönetim paneli</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-400 tracking-wide">Kullanıcı Adı</label>
              <input type="text" disabled value="admin" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed outline-none text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-400 tracking-wide">Parola</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#132175] focus:ring-2 focus:ring-[#132175]/10 rounded-xl text-[#131b2e] outline-none transition text-sm"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-medium text-center bg-red-50 rounded-lg py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#132175] hover:bg-[#0e1a5e] disabled:bg-[#132175]/60 text-white font-bold rounded-xl shadow-lg shadow-[#132175]/25 hover:shadow-[#132175]/35 transition duration-200 text-sm"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
