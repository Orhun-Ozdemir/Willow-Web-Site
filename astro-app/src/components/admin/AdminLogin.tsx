"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
            <img src={`${import.meta.env.BASE_URL}assets/willow-mark-transparent.png`} alt="WillowSoft" className="w-16 h-16 object-contain drop-shadow-lg" />
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 focus:border-[#132175] focus:ring-2 focus:ring-[#132175]/10 rounded-xl text-[#131b2e] outline-none transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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
