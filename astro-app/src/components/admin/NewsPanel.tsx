"use client";

import { useMemo, useState } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import TranslationEditor from "./TranslationEditor";

const NEWS_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "category", label: "Kategori" },
  { key: "excerpt", label: "Özet", type: "textarea" as const },
  { key: "content", label: "İçerik", type: "textarea" as const, rows: 6 },
];

type SortType = "newest" | "oldest" | "title";
type StatusFilter = "all" | "ready" | "missing";

type NewsItem = {
  id?: string;
  title?: string;
  slug?: string;
  date?: string;
  category?: string;
  image?: string;
  excerpt?: string;
  content?: string;
  localized?: Record<string, Record<string, string>>;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getAssetSrc(path?: string): string {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
}

function getTranslationCount(item: NewsItem): number {
  return Object.keys(item.localized || {}).length;
}

function getNewsStatus(item: NewsItem): "Hazır" | "Eksik" {
  const hasRequiredContent =
    Boolean(item.title?.trim()) &&
    Boolean(item.slug?.trim()) &&
    Boolean(item.date?.trim()) &&
    Boolean(item.excerpt?.trim()) &&
    Boolean(item.content?.trim());

  return hasRequiredContent ? "Hazır" : "Eksik";
}

export default function NewsPanel() {
  const { content, setContent } = useAdmin();

  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");

  const news: NewsItem[] = content?.news || [];

  const categories = useMemo<string[]>(() => {
    const values = news
      .map((item) => item.category)
      .filter((value): value is string => {
        return typeof value === "string" && value.trim().length > 0;
      })
      .map((value) => value.trim());

    return Array.from(new Set(values));
  }, [news]);

  const readyCount = useMemo(() => {
    return news.filter((item) => getNewsStatus(item) === "Hazır").length;
  }, [news]);

  const missingCount = useMemo(() => {
    return news.filter((item) => getNewsStatus(item) === "Eksik").length;
  }, [news]);

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return news
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => {
        const searchableText = [
          item.title,
          item.slug,
          item.category,
          item.excerpt,
          item.content,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !query || searchableText.includes(query);

        const matchesCategory =
          categoryFilter === "all" || item.category === categoryFilter;

        const status = getNewsStatus(item);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "ready" && status === "Hazır") ||
          (statusFilter === "missing" && status === "Eksik");

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "title") {
          return String(a.item.title || "").localeCompare(
            String(b.item.title || ""),
            "tr"
          );
        }

        const dateA = new Date(a.item.date || 0).getTime();
        const dateB = new Date(b.item.date || 0).getTime();

        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [news, search, categoryFilter, statusFilter, sortBy]);

  const updateNews = (idx: number, key: keyof NewsItem, val: string) => {
    setContent((c: any) => {
      const list = [...(c.news || [])];
      list[idx] = { ...list[idx], [key]: val };
      return { ...c, news: list };
    });
  };

  const updateLocalized = (
    idx: number,
    locale: Locale,
    fieldKey: string,
    value: string
  ) => {
    setContent((c: any) => {
      const list = [...(c.news || [])];
      const item = { ...list[idx] };

      const localized = {
        ...(item.localized || {}),
        [locale]: {
          ...(item.localized?.[locale] || {}),
          [fieldKey]: value,
        },
      };

      list[idx] = { ...item, localized };
      return { ...c, news: list };
    });
  };

  const addNews = () => {
    const id = `news-${Date.now()}`;

    const newItem: NewsItem = {
      id,
      title: "Yeni Haber",
      slug: id,
      date: new Date().toISOString().slice(0, 10),
      category: "update",
      image: "",
      excerpt: "",
      content: "",
      localized: {},
    };

    setContent((c: any) => ({
      ...c,
      news: [...(c.news || []), newItem],
    }));

    setEditIdx(news.length);
  };

  const deleteNews = (idx: number) => {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) return;

    setContent((c: any) => ({
      ...c,
      news: (c.news || []).filter((_: NewsItem, i: number) => i !== idx),
    }));

    setEditIdx(null);
  };

  if (editIdx !== null && news[editIdx]) {
    const n = news[editIdx];
    const status = getNewsStatus(n);
    const imageSrc = getAssetSrc(n.image);

    return (
      <div className="ws-news-page">
        <style>{newsPanelCss}</style>

        <div className="ws-news-edit-header">
          <div>
            <button
              type="button"
              onClick={() => setEditIdx(null)}
              className="ws-back-button"
            >
              ← Haber listesine dön
            </button>

            <h3>Haber Düzenle</h3>
            <p>Haber bilgileri, görsel, içerik ve çeviri alanlarını düzenleyin.</p>
          </div>

          <div className="ws-edit-actions">
            <span
              className={
                status === "Hazır"
                  ? "ws-status ws-status-ready"
                  : "ws-status ws-status-missing"
              }
            >
              {status}
            </span>

            <button
              type="button"
              onClick={() => deleteNews(editIdx)}
              className="ws-delete-button"
            >
              Sil
            </button>
          </div>
        </div>

        <div className="ws-edit-layout">
          <div className="ws-edit-main">
            <section className="ws-section-card">
              <div className="ws-section-title">
                <h4>Temel Bilgiler</h4>
                <p>Liste kartında ve detay sayfasında kullanılan ana bilgiler.</p>
              </div>

              <div className="ws-form-grid">
                <FormField
                  label="Başlık"
                  value={n.title || ""}
                  onChange={(v) => updateNews(editIdx, "title", v)}
                  placeholder="Haber başlığını girin"
                />

                <div className="ws-custom-field">
                  <div className="ws-field-top">
                    <label>Slug</label>
                    <button
                      type="button"
                      onClick={() =>
                        updateNews(editIdx, "slug", slugify(n.title || ""))
                      }
                    >
                      Başlıktan üret
                    </button>
                  </div>

                  <input
                    value={n.slug || ""}
                    onChange={(e) =>
                      updateNews(editIdx, "slug", e.target.value)
                    }
                    placeholder="haber-slug"
                  />
                </div>

                <FormField
                  label="Tarih"
                  type="date"
                  value={n.date || ""}
                  onChange={(v) => updateNews(editIdx, "date", v)}
                />

                <FormField
                  label="Kategori"
                  value={n.category || ""}
                  onChange={(v) => updateNews(editIdx, "category", v)}
                  placeholder="case-study, update, company..."
                />

                <div className="ws-form-full">
                  <FormField
                    label="Görsel Yolu"
                    type="image"
                    value={n.image || ""}
                    onChange={(v) => updateNews(editIdx, "image", v)}
                    placeholder="assets/news/example.webp"
                  />
                </div>
              </div>
            </section>

            <section className="ws-section-card">
              <div className="ws-section-title">
                <h4>İçerik</h4>
                <p>Özet kartlarda, içerik ise haber detay sayfasında kullanılır.</p>
              </div>

              <div className="ws-form-stack">
                <FormField
                  label="Özet"
                  type="textarea"
                  value={n.excerpt || ""}
                  onChange={(v) => updateNews(editIdx, "excerpt", v)}
                  rows={3}
                  placeholder="Haberin kısa açıklamasını girin"
                />

                <FormField
                  label="İçerik HTML"
                  type="textarea"
                  value={n.content || ""}
                  onChange={(v) => updateNews(editIdx, "content", v)}
                  rows={9}
                  placeholder="<p>Haber içeriği...</p>"
                />
              </div>
            </section>

            <section className="ws-section-card">
              <div className="ws-section-title">
                <h4>Çeviriler</h4>
                <p>Çoklu dil destekli haber metinlerini buradan düzenleyin.</p>
              </div>

              <TranslationEditor
                item={n}
                fields={NEWS_FIELDS}
                onChange={(locale, key, val) =>
                  updateLocalized(editIdx, locale, key, val)
                }
              />
            </section>
          </div>

          <aside className="ws-edit-side">
            <section className="ws-section-card">
              <h4 className="ws-preview-title">Haber Ön İzleme</h4>

              <div className="ws-preview-card">
                <div className="ws-preview-image">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={n.title || "News image"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span>Görsel Yok</span>
                  )}
                </div>

                <div className="ws-preview-body">
                  <div className="ws-preview-meta">
                    <span>{n.category || "Kategori yok"}</span>
                    <small>{n.date || "-"}</small>
                  </div>

                  <h5>{n.title || "Haber başlığı"}</h5>
                  <p>{n.excerpt || "Haber özeti burada görünecek."}</p>
                </div>
              </div>
            </section>

            <section className="ws-section-card">
              <h4 className="ws-preview-title">İçerik Durumu</h4>

              <div className="ws-info-list">
                <div>
                  <span>Durum</span>
                  <strong>{status}</strong>
                </div>

                <div>
                  <span>Çeviri</span>
                  <strong>{getTranslationCount(n)} dil</strong>
                </div>

                <div>
                  <span>Slug</span>
                  <strong>{n.slug || "-"}</strong>
                </div>

                <div>
                  <span>Görsel</span>
                  <strong>{n.image ? "Var" : "Yok"}</strong>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="ws-news-page">
      <style>{newsPanelCss}</style>

      <section className="ws-news-header">
        <div className="ws-news-header-top">
          <div>
            <h3>Haber Yönetimi</h3>
            <p>
              Haberleri kart görünümünde listeleyin, filtreleyin ve düzenleme
              ekranında yönetin.
            </p>
          </div>

          <button type="button" onClick={addNews} className="ws-primary-button">
            + Yeni Haber
          </button>
        </div>

        <div className="ws-stats-grid">
          <div className="ws-stat-card">
            <span>Toplam Haber</span>
            <strong>{news.length}</strong>
          </div>

          <div className="ws-stat-card">
            <span>Hazır</span>
            <strong className="ws-green">{readyCount}</strong>
          </div>

          <div className="ws-stat-card">
            <span>Eksik</span>
            <strong className="ws-orange">{missingCount}</strong>
          </div>

          <div className="ws-stat-card">
            <span>Kategori</span>
            <strong className="ws-blue">{categories.length}</strong>
          </div>
        </div>
      </section>

      <section className="ws-filter-card">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Başlık, slug, kategori veya içerik içinde ara..."
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Tüm kategoriler</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">Tüm durumlar</option>
          <option value="ready">Hazır</option>
          <option value="missing">Eksik</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortType)}
        >
          <option value="newest">En yeni</option>
          <option value="oldest">En eski</option>
          <option value="title">Başlığa göre</option>
        </select>
      </section>

      <section className="ws-news-list-card">
        {filteredNews.length > 0 ? (
          <div className="ws-news-grid">
            {filteredNews.map(({ item: n, idx }) => {
              const status = getNewsStatus(n);
              const imageSrc = getAssetSrc(n.image);

              return (
                <article key={n.id || idx} className="ws-news-card">
                  <div className="ws-news-image">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={n.title || "News image"}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span>Görsel Yok</span>
                    )}

                    <div className="ws-news-status-wrap">
                      <span
                        className={
                          status === "Hazır"
                            ? "ws-status ws-status-ready"
                            : "ws-status ws-status-missing"
                        }
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="ws-news-card-body">
                    <div className="ws-news-meta">
                      <span>{n.category || "Kategori yok"}</span>
                      <small>{n.date || "-"}</small>
                    </div>

                    <h4>{n.title || "Başlıksız haber"}</h4>

                    <p>{n.excerpt || "Özet girilmemiş."}</p>

                    <div className="ws-news-details">
                      <div>
                        <span>Slug</span>
                        <strong>{n.slug || "-"}</strong>
                      </div>

                      <div>
                        <span>Çeviri</span>
                        <strong>{getTranslationCount(n)} dil</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditIdx(idx)}
                      className="ws-edit-button"
                    >
                      Düzenle
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="ws-empty-state">
            <div>📰</div>
            <h4>Haber bulunamadı</h4>
            <p>
              Arama veya filtreleri değiştirerek tekrar deneyebilir ya da yeni
              haber ekleyebilirsiniz.
            </p>
            <button type="button" onClick={addNews}>
              + Yeni Haber Ekle
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

const newsPanelCss = `
  .ws-news-page {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    box-sizing: border-box;
  }

  .ws-news-header,
  .ws-filter-card,
  .ws-news-list-card,
  .ws-section-card,
  .ws-news-edit-header {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
    box-sizing: border-box;
  }

  .ws-news-header {
    padding: 28px;
  }

  .ws-news-header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
  }

  .ws-news-header h3,
  .ws-news-edit-header h3 {
    margin: 0;
    color: #111827;
    font-size: 24px;
    line-height: 1.2;
    font-weight: 800;
  }

  .ws-news-header p,
  .ws-news-edit-header p {
    margin: 8px 0 0;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.6;
  }

  .ws-primary-button {
    border: none;
    border-radius: 14px;
    background: #132175;
    color: #ffffff;
    padding: 12px 18px;
    min-width: 150px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 14px 30px rgba(19, 33, 117, 0.22);
    transition: background 160ms ease, transform 160ms ease;
    white-space: nowrap;
  }

  .ws-primary-button:hover {
    background: #0e1a5e;
    transform: translateY(-1px);
  }

  .ws-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .ws-stat-card {
    min-height: 105px;
    border-radius: 18px;
    border: 1px solid #eef2f7;
    background: #f8fafc;
    padding: 18px;
    box-sizing: border-box;
  }

  .ws-stat-card span {
    display: block;
    color: #9ca3af;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ws-stat-card strong {
    display: block;
    margin-top: 12px;
    color: #111827;
    font-size: 30px;
    line-height: 1;
    font-weight: 900;
  }

  .ws-green {
    color: #059669 !important;
  }

  .ws-orange {
    color: #d97706 !important;
  }

  .ws-blue {
    color: #132175 !important;
  }

  .ws-filter-card {
    padding: 18px;
    display: grid;
    grid-template-columns: minmax(260px, 1.6fr) minmax(160px, 0.8fr) minmax(160px, 0.8fr) minmax(160px, 0.8fr);
    gap: 12px;
  }

  .ws-filter-card input,
  .ws-filter-card select,
  .ws-custom-field input {
    width: 100%;
    height: 44px;
    border-radius: 14px;
    border: 1px solid #dfe3ea;
    background: #f8fafc;
    color: #111827;
    padding: 0 14px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
  }

  .ws-filter-card input:focus,
  .ws-filter-card select:focus,
  .ws-custom-field input:focus {
    border-color: #132175;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(19, 33, 117, 0.1);
  }

  .ws-news-list-card {
    padding: 22px;
  }

  .ws-news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
    align-items: stretch;
  }

  .ws-news-card {
    min-height: 390px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    box-shadow: 0 4px 18px rgba(15, 23, 42, 0.05);
    transition: transform 160ms ease, box-shadow 160ms ease;
  }

  .ws-news-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.1);
  }

  .ws-news-image {
    position: relative;
    height: 135px;
    background: linear-gradient(135deg, rgba(19, 33, 117, 0.08), rgba(26, 107, 138, 0.12));
    overflow: hidden;
  }

  .ws-news-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .ws-news-image > span {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .ws-news-status-wrap {
    position: absolute;
    left: 12px;
    top: 12px;
  }

  .ws-status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    line-height: 1;
    font-weight: 800;
  }

  .ws-status-ready {
    background: #ecfdf5;
    color: #047857;
  }

  .ws-status-missing {
    background: #fffbeb;
    color: #b45309;
  }

  .ws-news-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
  }

  .ws-news-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }

  .ws-news-meta span,
  .ws-preview-meta span {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 999px;
    background: rgba(19, 33, 117, 0.08);
    color: #132175;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .ws-news-meta small,
  .ws-preview-meta small {
    color: #9ca3af;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  .ws-news-card h4 {
    min-height: 44px;
    margin: 0;
    color: #111827;
    font-size: 15px;
    line-height: 22px;
    font-weight: 850;
    overflow: hidden;
  }

  .ws-news-card p {
    min-height: 66px;
    max-height: 66px;
    margin: 10px 0 0;
    overflow: hidden;
    color: #6b7280;
    font-size: 13px;
    line-height: 22px;
  }

  .ws-news-details {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #eef2f7;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ws-news-details div,
  .ws-info-list div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .ws-news-details span,
  .ws-info-list span {
    color: #9ca3af;
    font-size: 12px;
    font-weight: 700;
  }

  .ws-news-details strong,
  .ws-info-list strong {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #374151;
    font-size: 12px;
    font-weight: 800;
  }

  .ws-edit-button {
    width: 100%;
    height: 42px;
    margin-top: auto;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    color: #374151;
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
    transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
  }

  .ws-edit-button:hover {
    border-color: rgba(19, 33, 117, 0.25);
    background: rgba(19, 33, 117, 0.06);
    color: #132175;
  }

  .ws-empty-state {
    min-height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    padding: 32px;
  }

  .ws-empty-state div {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    background: rgba(19, 33, 117, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    margin-bottom: 16px;
  }

  .ws-empty-state h4 {
    margin: 0;
    color: #111827;
    font-size: 18px;
    font-weight: 850;
  }

  .ws-empty-state p {
    max-width: 460px;
    margin: 10px 0 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  .ws-empty-state button {
    margin-top: 20px;
    border: none;
    border-radius: 14px;
    background: #132175;
    color: #ffffff;
    padding: 12px 18px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
  }

  .ws-news-edit-header {
    padding: 24px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  .ws-back-button {
    border: none;
    background: transparent;
    color: #132175;
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
    padding: 0;
    margin-bottom: 12px;
  }

  .ws-edit-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ws-delete-button {
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #b91c1c;
    border-radius: 14px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
  }

  .ws-edit-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 24px;
    align-items: start;
  }

  .ws-edit-main {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .ws-edit-side {
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: sticky;
    top: 20px;
  }

  .ws-section-card {
    padding: 24px;
  }

  .ws-section-title {
    padding-bottom: 16px;
    margin-bottom: 18px;
    border-bottom: 1px solid #eef2f7;
  }

  .ws-section-title h4,
  .ws-preview-title {
    margin: 0;
    color: #111827;
    font-size: 15px;
    font-weight: 850;
  }

  .ws-section-title p {
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.5;
  }

  .ws-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .ws-form-full {
    grid-column: 1 / -1;
  }

  .ws-form-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ws-custom-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ws-field-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .ws-field-top label {
    color: #6b7280;
    font-size: 12px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ws-field-top button {
    border: none;
    background: transparent;
    color: #132175;
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
    padding: 0;
  }

  .ws-preview-card {
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
  }

  .ws-preview-image {
    height: 150px;
    background: linear-gradient(135deg, rgba(19, 33, 117, 0.08), rgba(26, 107, 138, 0.12));
  }

  .ws-preview-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .ws-preview-image span {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 12px;
    font-weight: 850;
  }

  .ws-preview-body {
    padding: 16px;
  }

  .ws-preview-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }

  .ws-preview-body h5 {
    margin: 0;
    color: #111827;
    font-size: 15px;
    line-height: 1.4;
    font-weight: 850;
  }

  .ws-preview-body p {
    max-height: 70px;
    overflow: hidden;
    margin: 10px 0 0;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.6;
  }

  .ws-info-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  @media (max-width: 1200px) {
    .ws-filter-card {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ws-edit-layout {
      grid-template-columns: 1fr;
    }

    .ws-edit-side {
      position: static;
    }
  }

  @media (max-width: 900px) {
    .ws-news-header-top,
    .ws-news-edit-header {
      flex-direction: column;
    }

    .ws-primary-button {
      width: 100%;
    }

    .ws-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ws-filter-card {
      grid-template-columns: 1fr;
    }

    .ws-form-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .ws-news-header,
    .ws-filter-card,
    .ws-news-list-card,
    .ws-section-card,
    .ws-news-edit-header {
      border-radius: 18px;
    }

    .ws-news-header,
    .ws-news-list-card,
    .ws-section-card,
    .ws-news-edit-header {
      padding: 18px;
    }

    .ws-stats-grid {
      grid-template-columns: 1fr;
    }

    .ws-news-grid {
      grid-template-columns: 1fr;
    }
  }
`;