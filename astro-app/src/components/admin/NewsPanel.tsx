"use client";

import React, { useMemo, useState } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import ListEditorField from "./ListEditorField";
import TranslationEditor from "./TranslationEditor";
import VisualHtmlEditor, { htmlToPlainPreview } from "./VisualHtmlEditor";

const NEWS_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "category", label: "Kategori" },
  { key: "excerpt", label: "Özet", type: "textarea" as const },
  { key: "content", label: "İçerik", type: "richtext" as const, rows: 6 },
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
  images?: string[];
  excerpt?: string;
  content?: string;
  featured?: boolean;
  sourceUrl?: string;
  sourceId?: number | string;
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

function getGalleryImages(item: NewsItem): string[] {
  return Array.isArray(item.images)
    ? item.images.filter((src): src is string => typeof src === "string" && src.trim().length > 0)
    : [];
}

function getCoverImage(item: NewsItem): string {
  return item.image || getGalleryImages(item)[0] || "";
}

function formatAdminDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("tr", { year: "numeric", month: "short", day: "numeric" });
}

function getNewsTime(item: NewsItem): number {
  const time = item.date ? new Date(`${item.date}T00:00:00`).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function getNewsStatus(item: NewsItem): "Hazır" | "Eksik" {
  const hasRequiredContent =
    Boolean(item.title?.trim()) &&
    Boolean(item.slug?.trim()) &&
    Boolean(item.date?.trim()) &&
    Boolean(getCoverImage(item)) &&
    Boolean(item.excerpt?.trim()) &&
    Boolean(item.content?.trim());

  return hasRequiredContent ? "Hazır" : "Eksik";
}

export default function NewsPanel() {
  const { content, setContent } = useAdmin();

  const [editId, setEditId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ basics: true });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");

  const news: NewsItem[] = useMemo(() => {
    const list = content?.news || [];
    return list.map((item: NewsItem, idx: number) => ({
      ...item,
      id: item.id || `news-${idx}`,
    }));
  }, [content?.news]);

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

  const publicFeaturedMatch = useMemo(() => {
    const sorted = [...news].sort((a, b) => getNewsTime(b) - getNewsTime(a));
    return sorted.find((item) => item.featured) || sorted[0] || null;
  }, [news]);

  const publicFeatured = publicFeaturedMatch;
  const publicFeaturedId = publicFeaturedMatch?.id || "";

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return news
      .filter((item) => {
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
          return String(a.title || "").localeCompare(
            String(b.title || ""),
            "tr"
          );
        }

        const dateA = getNewsTime(a);
        const dateB = getNewsTime(b);

        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [news, search, categoryFilter, statusFilter, sortBy]);

  const updateNews = <K extends keyof NewsItem>(id: string, key: K, val: NewsItem[K]) => {
    setContent((c: any) => {
      const list = (c.news || []).map((item: NewsItem, idx: number) => {
        const itemId = item.id || `news-${idx}`;
        if (itemId === id) {
          return { ...item, id: itemId, [key]: val };
        }
        return item;
      });
      return { ...c, news: list };
    });
  };

  const updateLocalized = (
    id: string,
    locale: Locale,
    fieldKey: string,
    value: string
  ) => {
    setContent((c: any) => {
      const list = (c.news || []).map((item: NewsItem, idx: number) => {
        const itemId = item.id || `news-${idx}`;
        if (itemId === id) {
          const localized = {
            ...(item.localized || {}),
            [locale]: {
              ...(item.localized?.[locale] || {}),
              [fieldKey]: value,
            },
          };
          return { ...item, id: itemId, localized };
        }
        return item;
      });
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
      images: [],
      excerpt: "",
      content: "",
      featured: false,
      localized: {},
    };

    setContent((c: any) => ({
      ...c,
      news: [...(c.news || []), newItem],
    }));

    setEditId(id);
    setOpenSections({ basics: true });
  };

  const updateNewsMedia = (id: string, images: string[], cover?: string) => {
    setContent((c: any) => {
      const list = (c.news || []).map((item: NewsItem, idx: number) => {
        const itemId = item.id || `news-${idx}`;
        if (itemId === id) {
          const uniqueImages = images
            .filter((src): src is string => typeof src === "string" && src.trim().length > 0)
            .filter((src, imageIdx, arr) => arr.indexOf(src) === imageIdx);
          const currentCover = typeof item.image === "string" ? item.image : "";
          const nextCover =
            cover !== undefined
              ? cover
              : currentCover && uniqueImages.includes(currentCover)
                ? currentCover
                : uniqueImages[0] || "";

          return { ...item, id: itemId, image: nextCover, images: uniqueImages };
        }
        return item;
      });
      return { ...c, news: list };
    });
  };

  const deleteNews = (id: string) => {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) return;

    setContent((c: any) => {
      const list = (c.news || []).filter((item: NewsItem, idx: number) => {
        const itemId = item.id || `news-${idx}`;
        return itemId !== id;
      });
      return { ...c, news: list };
    });

    setEditId(null);
  };

  const toggleSection = (key: string) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const n = useMemo(() => {
    return news.find((item) => item.id === editId) || null;
  }, [editId, news]);

  if (editId !== null && n) {
    const status = getNewsStatus(n);
    const galleryImages = getGalleryImages(n);
    const coverImage = getCoverImage(n);
    const previewImage = getAssetSrc(coverImage);
    const previewExcerpt = n.excerpt || htmlToPlainPreview(n.content || "", 140) || "Özet girilmemiş.";
    const previewBody = n.content || `<p>${previewExcerpt}</p>`;
    const isPublicFeatured = n.id === publicFeaturedId;

    const SectionTrigger = ({ sKey, icon, label, hint }: { sKey: string; icon: React.ReactNode; label: string; hint: string }) => (
      <button type="button" className="ws-prod-section-trigger" onClick={() => toggleSection(sKey)}>
        <div className="ws-prod-section-trigger-left">
          <span className="ws-prod-section-icon">{icon}</span>
          <span className="ws-prod-section-label">
            <strong>{label}</strong>
            <span>{hint}</span>
          </span>
        </div>
        <span className={`ws-prod-section-chevron ${openSections[sKey] ? "open" : ""}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
    );

    return (
      <div className="ws-news-page">
        {/* Header */}
        <div className="ws-prod-edit-header">
          <div>
            <button type="button" onClick={() => setEditId(null)} className="ws-back-button">
              ← Haber listesine dön
            </button>
            <h3>{n.title || "Haber Düzenle"}</h3>
            <p>Aşağıdaki bölümleri açıp kapayarak düzenleyin.</p>
          </div>
          <div className="ws-prod-edit-actions">
            <a
              href={`/en/news/${n.slug || n.id}`}
              target="_blank"
              rel="noopener"
              className="ws-edit-button"
              style={{ width: "auto", padding: "8px 16px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            >
              Sitede önizle ↗
            </a>
            {isPublicFeatured && <span className="ws-status ws-status-featured">Public vitrin</span>}
            <span className={`ws-status ${status === "Hazır" ? "ws-status-ready" : "ws-status-missing"}`}>
              {status}
            </span>
            <button type="button" onClick={() => deleteNews(n.id!)} className="ws-delete-button">Sil</button>
          </div>
        </div>

        <div className="ws-edit-layout">
          <div className="ws-edit-main">
            {/* Accordion */}
            <div className="ws-prod-accordion">

          {/* ① Temel Bilgiler */}
          <div className="ws-prod-section">
            <SectionTrigger
              sKey="basics"
              label="Temel Bilgiler"
              hint="Başlık, slug, tarih, kategori"
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            />
            {openSections.basics && (
              <div className="ws-prod-section-body">
                <div className="ws-prod-field-row">
                  <FormField
                    label="Başlık"
                    value={n.title || ""}
                    onChange={(v) => updateNews(n.id!, "title", v)}
                    placeholder="Haber başlığını girin"
                  />
                  <div className="ws-custom-field">
                    <div className="ws-field-top">
                      <label>Slug</label>
                      <button type="button" onClick={() => updateNews(n.id!, "slug", slugify(n.title || ""))}>
                        Başlıktan üret
                      </button>
                    </div>
                    <input
                      value={n.slug || ""}
                      onChange={(e) => updateNews(n.id!, "slug", e.target.value)}
                      placeholder="haber-slug"
                      className="ws-imgfield-input"
                    />
                  </div>
                </div>
                <div className="ws-prod-field-row">
                  <FormField
                    label="Tarih"
                    type="date"
                    value={n.date || ""}
                    onChange={(v) => updateNews(n.id!, "date", v)}
                  />
                  <FormField
                    label="Kategori"
                    value={n.category || ""}
                    onChange={(v) => updateNews(n.id!, "category", v)}
                    placeholder="case-study, update, company..."
                  />
                </div>
                <label className="ws-feature-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(n.featured)}
                    onChange={(e) => updateNews(n.id!, "featured", e.target.checked)}
                  />
                  <span>
                    <strong>Öne çıkan haber</strong>
                    <small>
                      Public News sayfasındaki öne çıkan alana aday olur. Birden fazla haber seçiliyse en yeni tarihli haber görünür.
                    </small>
                  </span>
                </label>
                <div className={`ws-feature-note${isPublicFeatured ? " is-active" : ""}`}>
                  {isPublicFeatured
                    ? "Bu haber şu anda public News sayfasındaki öne çıkan alanda görünüyor."
                    : publicFeatured
                      ? `Public News sayfasında şu an "${publicFeatured.title || "Başlıksız haber"}" görünüyor.`
                      : "Public News sayfasında öne çıkan haber yok."}
                </div>
              </div>
            )}
          </div>

          {/* ② Görsel */}
          <div className="ws-prod-section">
            <SectionTrigger
              sKey="media"
              label="Görsel"
              hint="Kapak görseli ve haber galerisi"
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
            />
            {openSections.media && (
              <div className="ws-prod-section-body">
                <FormField
                  label="Kapak Görseli"
                  type="image"
                  value={coverImage}
                  onChange={(v) => {
                    const nextImages = v && !galleryImages.includes(v) ? [v, ...galleryImages] : galleryImages;
                    updateNewsMedia(n.id!, nextImages, v);
                  }}
                  placeholder="assets/news/example.webp"
                />
                <ListEditorField
                  label="Haber Galerisi"
                  value={galleryImages}
                  onChange={(value) => {
                    const nextCover = coverImage && value.includes(coverImage) ? coverImage : value[0] || "";
                    updateNewsMedia(n.id!, value, nextCover);
                  }}
                  featuredValue={coverImage}
                  featuredLabel="Kapak"
                  onMakeFeatured={(src) => updateNewsMedia(n.id!, galleryImages, src)}
                  placeholder="https://... veya assets/news/example.webp"
                  helper="Kapak görseli önde gösterilir; galeri ise haber detayında editoryal görsel blok olarak görünür."
                />
              </div>
            )}
          </div>

          {/* ③ İçerik */}
          <div className="ws-prod-section">
            <SectionTrigger
              sKey="content"
              label="İçerik"
              hint="Başlık, paragraf ve liste blokları"
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>}
            />
            {openSections.content && (
              <div className="ws-prod-section-body">
                <FormField
                  label="Özet"
                  type="textarea"
                  value={n.excerpt || ""}
                  onChange={(v) => updateNews(n.id!, "excerpt", v)}
                  rows={3}
                  placeholder="Haberin kısa açıklamasını girin"
                />
                <div className="ws-custom-field">
                  <div className="ws-field-top">
                    <label>İçerik</label>
                    <span className="ws-field-helper">HTML yazmadan bloklarla düzenleyin</span>
                  </div>
                  <VisualHtmlEditor
                    value={n.content || ""}
                    onChange={(v) => updateNews(n.id!, "content", v)}
                    placeholder="Haber paragrafını yazın"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ④ Çeviriler */}
          <div className="ws-prod-section">
            <SectionTrigger
              sKey="translations"
              label="Çeviriler"
              hint={`${getTranslationCount(n)} dil mevcut`}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
            />
            {openSections.translations && (
              <div className="ws-prod-section-body">
                <TranslationEditor
                  item={n}
                  fields={NEWS_FIELDS}
                  onChange={(locale, key, val) => updateLocalized(n.id!, locale, key, val)}
                />
              </div>
            )}
          </div>

          {/* ⑤ Durum */}
          <div className="ws-prod-section">
            <SectionTrigger
              sKey="status"
              label="İçerik Durumu"
              hint="Slug, görsel, çeviri özeti"
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
            />
            {openSections.status && (
              <div className="ws-prod-section-body">
                <div className="ws-info-list">
                  <div><span>Durum</span><strong>{status}</strong></div>
                  <div><span>Çeviri</span><strong>{getTranslationCount(n)} dil</strong></div>
                  <div><span>Slug</span><strong>{n.slug || "-"}</strong></div>
                  <div><span>Görsel</span><strong>{coverImage ? `${galleryImages.length || 1} görsel` : "Yok"}</strong></div>
                  <div><span>Öne çıkan</span><strong>{n.featured ? "Evet" : "Hayır"}</strong></div>
                  <div><span>Public vitrin</span><strong>{isPublicFeatured ? "Bu haber" : "Hayır"}</strong></div>
                  {n.sourceUrl && <div><span>Kaynak</span><strong>{n.sourceUrl}</strong></div>}
                </div>
              </div>
            )}
          </div>

        </div>
          </div>

          <aside className="ws-edit-side">
            <section className="ws-section-card ws-news-preview-panel">
              <div className="ws-section-title">
                <h4>Ön yüzde nasıl görünür?</h4>
                <p>Liste kartı ve detay sayfası önizlemesi.</p>
              </div>

              <div className="ws-preview-stack">
                <div>
                  <h5 className="ws-preview-title">News liste kartı</h5>
                  <article className="ws-news-list-preview">
                    <div className="ws-preview-image">
                      {previewImage ? <img src={previewImage} alt={n.title || "Haber görseli"} /> : <span>Görsel yok</span>}
                    </div>
                    <div className="ws-preview-body">
                      <div className="ws-preview-meta">
                        <span>{n.category || "Kategori"}</span>
                        {n.featured && <small>Öne çıkan</small>}
                      </div>
                      <h5>{n.title || "Başlıksız haber"}</h5>
                      <p>{previewExcerpt}</p>
                      <div className="ws-news-preview-footer">
                        <span>Tarih</span>
                        <strong>{formatAdminDate(n.date)}</strong>
                      </div>
                    </div>
                  </article>
                </div>

                <div>
                  <h5 className="ws-preview-title">News detay sayfası</h5>
                  <article className="ws-news-detail-preview">
                    <div className="ws-news-detail-preview-hero">
                      {previewImage ? <img src={previewImage} alt={n.title || "Haber görseli"} /> : <span>Kapak görseli yok</span>}
                    </div>
                    <div className="ws-news-detail-preview-body">
                      <small>{n.category || "Kategori"} · {formatAdminDate(n.date)}</small>
                      <h5>{n.title || "Başlıksız haber"}</h5>
                      <p>{previewExcerpt}</p>
                      <VisualHtmlEditor value={previewBody} readOnly />
                      {galleryImages.length > 1 && (
                        <div className="ws-news-preview-gallery">
                          {galleryImages.slice(1, 5).map((src, idx) => (
                            <img key={idx} src={getAssetSrc(src)} alt={`Galeri ${idx + 1}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
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

        {publicFeatured && (
          <div className="ws-admin-featured-card">
            <div className="ws-admin-featured-media">
              {getAssetSrc(getCoverImage(publicFeatured)) ? (
                <img src={getAssetSrc(getCoverImage(publicFeatured))} alt={publicFeatured.title || "Öne çıkan haber"} />
              ) : (
                <span>Görsel yok</span>
              )}
            </div>
            <div className="ws-admin-featured-content">
              <span className="ws-admin-featured-kicker">News sayfasındaki öne çıkan haber</span>
              <h4>{publicFeatured.title || "Başlıksız haber"}</h4>
              <p>
                {publicFeatured.featured
                  ? "Bu haber öne çıkan olarak işaretli ve public News vitrini burada bunu gösteriyor."
                  : "Hiçbir haber öne çıkan seçilmediği için public News vitrini en yeni haberi gösteriyor."}
              </p>
              <div className="ws-admin-featured-meta">
                <span>{publicFeatured.category || "Kategori yok"}</span>
                <span>{formatAdminDate(publicFeatured.date)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setEditId(publicFeaturedId); setOpenSections({ basics: true }); }}
              className="ws-admin-featured-action"
            >
              Düzenle
            </button>
          </div>
        )}
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
            {filteredNews.map((n) => {
              const status = getNewsStatus(n);
              const imageSrc = getAssetSrc(getCoverImage(n));
              const galleryCount = getGalleryImages(n).length;

              return (
                <article key={n.id} className={`ws-news-card${n.id === publicFeaturedId ? " is-public-featured" : ""}`}>
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
                    {n.id === publicFeaturedId && (
                      <div className="ws-news-public-badge">Public vitrin</div>
                    )}
                  </div>

                  <div className="ws-news-card-body">
                    <div className="ws-news-meta">
                      <span>{n.category || "Kategori yok"}</span>
                      <small>{n.date || "-"}</small>
                      {n.featured && <small>Öne çıkan</small>}
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
                      <div>
                        <span>Galeri</span>
                        <strong>{galleryCount || (n.image ? 1 : 0)} görsel</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setEditId(n.id || ""); setOpenSections({ basics: true }); }}
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
