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

  if (path.startsWith("http://") || path.startsWith("https://")) {
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
    Boolean(item.excerpt?.trim());

  return hasRequiredContent ? "Hazır" : "Eksik";
}

export default function NewsPanel() {
  const { content, setContent } = useAdmin();

  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
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

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return news
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => {
        const title = String(item.title || "").toLowerCase();
        const slug = String(item.slug || "").toLowerCase();
        const category = String(item.category || "").toLowerCase();
        const excerpt = String(item.excerpt || "").toLowerCase();

        const matchesSearch =
          !query ||
          title.includes(query) ||
          slug.includes(query) ||
          category.includes(query) ||
          excerpt.includes(query);

        const matchesCategory =
          categoryFilter === "all" || item.category === categoryFilter;

        return matchesSearch && matchesCategory;
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
  }, [news, search, categoryFilter, sortBy]);

  const latestNewsDate = useMemo(() => {
    if (!news.length) return "-";

    const dates = news
      .map((item) => item.date)
      .filter((value): value is string => Boolean(value))
      .sort()
      .reverse();

    return dates[0] || "-";
  }, [news]);

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
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => setEditIdx(null)}
              className="mb-3 text-xs font-bold text-[#132175] hover:text-[#0e1a5e]"
            >
              ← Haber listesine dön
            </button>

            <h3 className="text-xl font-bold text-gray-950">
              Haber Düzenle
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Haber bilgileri, görsel, içerik ve çeviri alanlarını düzenleyin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${status === "Hazır"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
                }`}
            >
              {status}
            </span>

            <button
              type="button"
              onClick={() => deleteNews(editIdx)}
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
            >
              Sil
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 border-b border-gray-100 pb-4">
                <h4 className="text-sm font-bold text-gray-900">
                  Temel Bilgiler
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Haber kartlarında ve detay sayfasında görünecek ana bilgiler.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Başlık"
                  value={n.title || ""}
                  onChange={(v) => updateNews(editIdx, "title", v)}
                  placeholder="Haber başlığını girin"
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Slug
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        updateNews(editIdx, "slug", slugify(n.title || ""))
                      }
                      className="text-xs font-bold text-[#132175] hover:text-[#0e1a5e]"
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#132175] focus:bg-white focus:ring-4 focus:ring-[#132175]/10"
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
                  placeholder="update, case-study, company..."
                />

                <div className="md:col-span-2">
                  <FormField
                    label="Görsel Yolu"
                    type="image"
                    value={n.image || ""}
                    onChange={(v) => updateNews(editIdx, "image", v)}
                    placeholder="assets/news/example.webp"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 border-b border-gray-100 pb-4">
                <h4 className="text-sm font-bold text-gray-900">
                  İçerik Alanları
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Özet liste kartında, içerik ise haber detay sayfasında kullanılır.
                </p>
              </div>

              <div className="space-y-4">
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
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 border-b border-gray-100 pb-4">
                <h4 className="text-sm font-bold text-gray-900">
                  Çeviriler
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Çoklu dil destekli haber metinlerini buradan düzenleyin.
                </p>
              </div>

              <TranslationEditor
                item={n}
                fields={NEWS_FIELDS}
                onChange={(locale, key, val) =>
                  updateLocalized(editIdx, locale, key, val)
                }
              />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="sticky top-6 space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="mb-4 text-sm font-bold text-gray-900">
                  Haber Ön İzleme
                </h4>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={n.title || "News image"}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-[#132175]/10 to-[#1a6b8a]/10">
                      <span className="text-xs font-semibold text-gray-400">
                        Görsel seçilmedi
                      </span>
                    </div>
                  )}

                  <div className="space-y-3 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#132175]/10 px-3 py-1 text-xs font-bold text-[#132175]">
                        {n.category || "Kategori yok"}
                      </span>

                      <span className="text-xs text-gray-400">
                        {n.date || "Tarih yok"}
                      </span>
                    </div>

                    <h5 className="text-base font-bold leading-6 text-gray-950">
                      {n.title || "Haber başlığı"}
                    </h5>

                    <p className="text-sm leading-6 text-gray-500">
                      {n.excerpt || "Haber özeti burada görünecek."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="mb-4 text-sm font-bold text-gray-900">
                  İçerik Durumu
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Durum</span>
                    <span
                      className={`font-bold ${status === "Hazır"
                        ? "text-emerald-600"
                        : "text-amber-600"
                        }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Çeviri</span>
                    <span className="font-bold text-gray-900">
                      {getTranslationCount(n)} dil
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Slug</span>
                    <span className="max-w-[180px] truncate font-bold text-gray-900">
                      {n.slug || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Görsel</span>
                    <span className="font-bold text-gray-900">
                      {n.image ? "Var" : "Yok"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-950">
              Haber Yönetimi
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Haberler, duyurular, case study içerikleri ve çoklu dil metinlerini
              buradan yönetin.
            </p>
          </div>

          <button
            type="button"
            onClick={addNews}
            className="rounded-xl bg-[#132175] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#132175]/20 transition hover:bg-[#0e1a5e]"
          >
            + Yeni Haber
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Toplam Haber
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-950">
              {news.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Kategori
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-950">
              {categories.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Son Haber Tarihi
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-950">
              {latestNewsDate}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Başlık, slug, kategori veya özet içinde ara..."
            className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#132175] focus:bg-white focus:ring-4 focus:ring-[#132175]/10"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#132175] focus:bg-white focus:ring-4 focus:ring-[#132175]/10"
          >
            <option value="all">Tüm kategoriler</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#132175] focus:bg-white focus:ring-4 focus:ring-[#132175]/10"
          >
            <option value="newest">En yeni</option>
            <option value="oldest">En eski</option>
            <option value="title">Başlığa göre</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {filteredNews.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredNews.map(({ item: n, idx }) => {
              const imageSrc = getAssetSrc(n.image);
              const status = getNewsStatus(n);

              return (
                <div
                  key={n.id || idx}
                  className="grid gap-4 p-4 transition hover:bg-gray-50 md:grid-cols-[96px_1fr_auto]"
                >
                  <div className="h-24 w-full overflow-hidden rounded-2xl bg-gray-100 md:w-24">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={n.title || "News image"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#132175]/10 to-[#1a6b8a]/10">
                        <span className="text-[10px] font-bold uppercase text-gray-400">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#132175]/10 px-2.5 py-1 text-xs font-bold text-[#132175]">
                        {n.category || "Kategori yok"}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${status === "Hazır"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                          }`}
                      >
                        {status}
                      </span>

                      <span className="text-xs text-gray-400">
                        {n.date || "Tarih yok"}
                      </span>
                    </div>

                    <h4 className="truncate text-base font-bold text-gray-950">
                      {n.title || "Başlıksız haber"}
                    </h4>

                    <p className="mt-1 max-h-12 overflow-hidden text-sm leading-6 text-gray-500">
                      {n.excerpt || "Özet girilmedi."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>Slug: {n.slug || "-"}</span>
                      <span>Çeviri: {getTranslationCount(n)} dil</span>
                    </div>
                  </div>

                  <div className="flex items-center md:justify-end">
                    <button
                      type="button"
                      onClick={() => setEditIdx(idx)}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:border-[#132175]/20 hover:bg-[#132175]/5 hover:text-[#132175]"
                    >
                      Düzenle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#132175]/10 text-[#132175]">
              <span className="text-2xl">📰</span>
            </div>

            <h4 className="text-lg font-bold text-gray-950">
              Haber bulunamadı
            </h4>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
              Arama veya kategori filtresini değiştirerek tekrar deneyebilir ya da
              yeni bir haber ekleyebilirsiniz.
            </p>

            <button
              type="button"
              onClick={addNews}
              className="mt-5 rounded-xl bg-[#132175] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0e1a5e]"
            >
              + Yeni Haber Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}