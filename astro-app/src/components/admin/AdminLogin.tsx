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

  return (
    <main className="ws-login-page">
      <style>{`
        .ws-login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          font-family: var(--font-body), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background:
            radial-gradient(circle at 20% 20%, rgba(48, 91, 255, 0.28), transparent 32%),
            radial-gradient(circle at 80% 80%, rgba(26, 107, 138, 0.38), transparent 34%),
            linear-gradient(145deg, #07123f 0%, #101b63 50%, #0f6b86 100%);
          box-sizing: border-box;
        }

        .ws-login-shell {
          width: 100%;
          max-width: 460px;
        }

        .ws-login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 28px;
        }

        .ws-login-logo {
          width: 92px;
          height: 92px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
          margin-bottom: 18px;
        }

        .ws-login-logo img {
          width: 62px;
          height: 62px;
          object-fit: contain;
          display: block;
        }

        .ws-login-title {
          margin: 0;
          color: #ffffff;
          font-family: var(--font-display), system-ui, sans-serif;
          font-size: 28px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .ws-login-subtitle {
          margin: 8px 0 0;
          color: rgba(255, 255, 255, 0.55);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .ws-login-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 28px;
          padding: 34px;
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.26);
          box-sizing: border-box;
        }

        .ws-login-badge {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(19, 33, 117, 0.08);
          color: #132175;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 18px;
        }

        .ws-login-heading {
          margin: 0;
          color: #111827;
          font-size: 28px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .ws-login-desc {
          margin: 10px 0 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        .ws-login-form {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .ws-login-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ws-login-label {
          color: #374151;
          font-size: 14px;
          font-weight: 700;
        }

        .ws-login-input-wrap {
          position: relative;
          width: 100%;
        }

        .ws-login-input {
          width: 100%;
          height: 50px;
          border-radius: 14px;
          border: 1px solid #dfe3ea;
          background: #f8fafc;
          color: #111827;
          font-size: 15px;
          font-weight: 500;
          padding: 0 15px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }

        .ws-login-input.password {
          padding-right: 54px;
        }

        .ws-login-input:focus {
          border-color: #132175;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(19, 33, 117, 0.10);
        }

        .ws-login-input::placeholder {
          color: #9ca3af;
        }

        .ws-login-eye-button {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #8b95a5;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: background 160ms ease, color 160ms ease;
        }

        .ws-login-eye-button:hover {
          background: #eef2f7;
          color: #132175;
        }

        .ws-login-eye-button svg {
          width: 20px;
          height: 20px;
          display: block;
        }

        .ws-login-error {
          border-radius: 14px;
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          font-weight: 700;
          padding: 12px 14px;
        }

        .ws-login-submit {
          width: 100%;
          height: 52px;
          border: none;
          border-radius: 14px;
          background: #132175;
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 16px 34px rgba(19, 33, 117, 0.28);
          transition: background 160ms ease, transform 160ms ease, box-shadow 160ms ease;
        }

        .ws-login-submit:hover:not(:disabled) {
          background: #0e1a5e;
          transform: translateY(-1px);
          box-shadow: 0 20px 42px rgba(19, 33, 117, 0.34);
        }

        .ws-login-submit:disabled {
          cursor: not-allowed;
          background: #cbd5e1;
          box-shadow: none;
        }

        .ws-login-security {
          margin: 22px 0 0;
          padding-top: 20px;
          border-top: 1px solid #eef2f7;
          color: #9ca3af;
          text-align: center;
          font-size: 12px;
          line-height: 1.5;
        }

        .ws-login-footer {
          margin-top: 22px;
          text-align: center;
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
        }

        @media (max-width: 520px) {
          .ws-login-page {
            padding: 24px 14px;
          }

          .ws-login-logo {
            width: 78px;
            height: 78px;
            border-radius: 20px;
          }

          .ws-login-logo img {
            width: 52px;
            height: 52px;
          }

          .ws-login-title {
            font-size: 24px;
          }

          .ws-login-card {
            padding: 24px;
            border-radius: 24px;
          }

          .ws-login-heading {
            font-size: 24px;
          }
        }
      `}</style>

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