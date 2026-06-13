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

  const disabled = loading || !username.trim() || !password.trim();


      <div className="ws-login-shell">
        <div className="ws-login-brand">
          <div className="ws-login-logo">
            <img
              src={`${import.meta.env.BASE_URL}assets/willow-mark-transparent.png`}
              alt="WillowSoft"
            />
          </div>

          <h1 className="ws-login-title">WILLOWSOFT</h1>
          <p className="ws-login-subtitle">Admin Panel</p>
        </div>

        <section className="ws-login-card">
          <div>
            <span className="ws-login-badge">Yönetim Paneli</span>
            <h2 className="ws-login-heading">Giriş Yap</h2>
            <p className="ws-login-desc">
              Devam etmek için yetkili kullanıcı bilgilerinizi girin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="ws-login-form">
            <div className="ws-login-field">
              <label htmlFor="username" className="ws-login-label">
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
                className="ws-login-input"
              />
            </div>

            <div className="ws-login-field">
              <label htmlFor="password" className="ws-login-label">
                Parola
              </label>

              <div className="ws-login-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Parolanızı girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ws-login-input password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ws-login-eye-button"
                  aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
                >
                  {showPassword ? (
                    <svg
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

            {error && <div className="ws-login-error">{error}</div>}

            <button type="submit" disabled={disabled} className="ws-login-submit">
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <p className="ws-login-security">
            Yetkisiz erişim denemeleri sistem kayıtlarına işlenir.
          </p>
        </section>

        <p className="ws-login-footer">
          © 2026 WillowSoft. All rights reserved.
        </p>
      </div>
    </main>
  );
}