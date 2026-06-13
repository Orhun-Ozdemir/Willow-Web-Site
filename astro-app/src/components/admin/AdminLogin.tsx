"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormDisabled = loading || !username.trim() || !password.trim();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormDisabled) return;

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

      let data: { ok?: boolean; error?: string } = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.ok) {
        window.location.href = "/admin/dashboard";
        return;
      }

      setError(data.error || "Kullanıcı adı veya parola hatalı.");
    } catch {
      setError("Bağlantı sırasında bir sorun oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen w-full overflow-hidden bg-[#07123f] text-[#111827]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="relative min-h-screen w-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(48,91,255,0.30),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(26,107,138,0.35),transparent_34%),linear-gradient(145deg,#07123f_0%,#101b63_48%,#0f6b86_100%)]" />
        <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-160px] h-[520px] w-[520px] rounded-full bg-cyan-400/20 blur-3xl" />

        <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8">
          <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
            <div className="hidden min-h-[620px] flex-col justify-between border-r border-white/10 p-10 text-white lg:flex">
              <div>
                <div className="mb-10 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl">
                    <img
                      src={`${import.meta.env.BASE_URL}assets/willow-mark-transparent.png`}
                      alt="WillowSoft"
                      className="h-10 w-10 object-contain"
                    />
                  </div>

                  <div>
                    <h1
                      className="text-2xl font-extrabold tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      WILLOWSOFT
                    </h1>
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/55">
                      Admin Panel
                    </p>
                  </div>
                </div>

                <div className="max-w-xl">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
                    CMS & Lead Management
                  </p>

                  <h2 className="text-4xl font-bold leading-tight tracking-tight">
                    Kurumsal içerik, SEO ve lead süreçlerini tek yerden yönetin.
                  </h2>

                  <p className="mt-5 max-w-lg text-base leading-7 text-white/65">
                    WillowSoft yönetim paneli; sayfa içerikleri, çoklu dil yapısı,
                    SEO alanları ve müşteri talepleri için güvenli bir operasyon
                    ekranı sunar.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/45">
                    Access
                  </p>
                  <p className="mt-1 text-sm font-semibold">Secure Login</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/45">
                    Content
                  </p>
                  <p className="mt-1 text-sm font-semibold">CMS Ready</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/45">
                    Leads
                  </p>
                  <p className="mt-1 text-sm font-semibold">Pipeline</p>
                </div>
              </div>
            </div>

            <div className="flex min-h-[620px] items-center justify-center bg-[#f7f9fc] px-5 py-10 sm:px-8 lg:px-12">
              <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center text-center lg:hidden">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/30 bg-[#132175] shadow-xl">
                    <img
                      src={`${import.meta.env.BASE_URL}assets/willow-mark-transparent.png`}
                      alt="WillowSoft"
                      className="h-14 w-14 object-contain"
                    />
                  </div>

                  <h1
                    className="text-2xl font-extrabold tracking-tight text-[#101b63]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    WILLOWSOFT
                  </h1>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Admin Panel
                  </p>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-8">
                  <div className="mb-8">
                    <div className="mb-4 inline-flex rounded-full border border-[#132175]/10 bg-[#132175]/5 px-3 py-1 text-xs font-semibold text-[#132175]">
                      Yönetim Paneli
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      Giriş Yap
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Devam etmek için yetkili kullanıcı bilgilerinizi girin.
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <label
                        htmlFor="username"
                        className="text-sm font-semibold text-slate-700"
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
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#132175] focus:bg-white focus:ring-4 focus:ring-[#132175]/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label
                          htmlFor="password"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Parola
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="current-password"
                          placeholder="Parolanızı girin"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#132175] focus:bg-white focus:ring-4 focus:ring-[#132175]/10"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
                          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132175]/20"
                        >
                          {showPassword ? (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div
                        role="alert"
                        className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                      >
                        <svg
                          className="mt-0.5 h-5 w-5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m0 3.75h.008v.008H12V16.5zM10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h17.78A1.5 1.5 0 0022.18 18L13.71 3.86a1.5 1.5 0 00-2.42 0z"
                          />
                        </svg>

                        <span className="font-medium">{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isFormDisabled}
                      className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#132175] px-4 text-sm font-bold text-white shadow-lg shadow-[#132175]/25 transition hover:bg-[#0e1a5e] hover:shadow-xl hover:shadow-[#132175]/30 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      {loading && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      )}

                      {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                  </form>

                  <div className="mt-8 border-t border-slate-100 pt-5">
                    <p className="text-center text-xs leading-5 text-slate-400">
                      Yetkisiz erişim denemeleri sistem kayıtlarına işlenir.
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-center text-xs text-white/60 lg:text-slate-400">
                  © 2026 WillowSoft. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}