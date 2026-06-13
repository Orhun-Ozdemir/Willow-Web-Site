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

