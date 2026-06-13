"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
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
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        window.location.href = "/admin/dashboard";
      } else {
        setError(data.error || "Kullanıcı adı veya parola hatalı.");
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !username.trim() || !password.trim();

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        fontFamily: "var(--font-body)",
        background:
          "linear-gradient(145deg, #07123f 0%, #101b63 50%, #0f6b86 100%)",
      }}
    >
      <div
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden border border-white/20 bg-white"
        style={{
          borderRadius: 28,
          boxShadow: "0 30px 90px rgba(0,0,0,0.28)",
        }}
      >
        <section
          className="hidden lg:flex flex-col justify-between p-10 text-white"
          style={{
            background:
              "linear-gradient(145deg, rgba(7,18,63,0.96), rgba(19,33,117,0.92), rgba(15,107,134,0.86))",
          }}
        >
          <div>
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
                <img
                  src={`${import.meta.env.BASE_URL}assets/willow-mark-transparent.png`}
                  alt="WillowSoft"
                  className="w-11 h-11 object-contain"
                />
              </div>

              <div>
                <h1
                  className="text-2xl font-extrabold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  WILLOWSOFT
                </h1>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/55 mt-1">
                  Admin Panel
                </p>
              </div>
            </div>

            <p className="text-sm font-bold uppercase tracking-widest text-cyan-100/70 mb-4">
              CMS & Lead Management
            </p>

            <h2 className="text-4xl font-bold leading-tight">
              İçerik, SEO ve lead süreçlerini tek panelden yönetin.
            </h2>

            <p className="mt-5 text-base leading-7 text-white/65 max-w-md">
              WillowSoft yönetim paneli; sayfa içerikleri, çoklu dil yapısı,
              SEO alanları ve müşteri talepleri için güvenli bir yönetim alanı sunar.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-white/45">
                Access
              </p>
              <p className="mt-1 text-sm font-semibold">Secure</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-white/45">
                Content
              </p>
              <p className="mt-1 text-sm font-semibold">CMS</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-white/45">
                Leads
              </p>
              <p className="mt-1 text-sm font-semibold">Pipeline</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-gray-50 px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-[#132175] flex items-center justify-center shadow-lg mb-4">
                <img
                  src={`${import.meta.env.BASE_URL}assets/willow-mark-transparent.png`}
                  alt="WillowSoft"
                  className="w-14 h-14 object-contain"
                />
              </div>

              <h1
                className="text-2xl font-extrabold text-[#132175]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                WILLOWSOFT
              </h1>

              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">
                Admin Panel
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="mb-8">
                <span className="inline-flex rounded-full bg-[#132175]/10 px-3 py-1 text-xs font-bold text-[#132175] mb-4">
                  Yönetim Paneli
                </span>

                <h2 className="text-2xl font-bold text-gray-950">
                  Giriş Yap
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Devam etmek için yetkili kullanıcı bilgilerinizi girin.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Kullanıcı adı
                  </label>

                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Kullanıcı adınızı girin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-[#132175] focus:bg-white focus:ring-2 focus:ring-[#132175]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Parola
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Parolanızı girin"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 pr-12 text-sm text-gray-900 outline-none transition focus:border-[#132175] focus:bg-white focus:ring-2 focus:ring-[#132175]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? "Gizle" : "Göster"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isDisabled}
                  className="w-full h-12 rounded-xl bg-[#132175] text-sm font-bold text-white shadow-lg shadow-[#132175]/20 transition hover:bg-[#0e1a5e] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-400">
                Yetkisiz erişim denemeleri sistem kayıtlarına işlenir.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-gray-300 lg:text-gray-400">
              © 2026 WillowSoft. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}