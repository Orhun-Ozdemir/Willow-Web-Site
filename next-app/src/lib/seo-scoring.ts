export interface SEOCheck {
  label: string;
  ok: boolean;
  pass?: boolean;
  warn?: boolean;
  fail?: boolean;
}

export interface SEOScoreResult {
  score: number;
  level: "good" | "ok" | "bad";
  seoScore: number;
  seoLevel: "good" | "ok" | "bad";
  seoChecks: SEOCheck[];
  aiScore: number;
  aiLevel: "good" | "ok" | "bad";
  aiChecks: SEOCheck[];
}

function levelFor(score: number): "good" | "ok" | "bad" {
  return score >= 80 ? "good" : score >= 50 ? "ok" : "bad";
}

export function calcSEOScore(
  seoData: any,
  locale: string,
  allPagesData: Record<string, any> | null,
  pageKey: string,
  pageContent?: Record<string, any>
): SEOScoreResult {
  const seoChecks: SEOCheck[] = [];
  const aiChecks: SEOCheck[] = [];

  const title = (seoData?.seoTitle || "").trim();
  const desc = (seoData?.metaDescription || "").trim();
  const keyword = (seoData?.focusKeyword || "").trim().toLowerCase();
  const slug = (seoData?.slug || "").trim();
  const canonical = (seoData?.canonical || "").trim();
  const h1 = (seoData?.h1 || "").trim();
  const ogImage = (seoData?.ogImage || "").trim();
  const schemaType = (seoData?.schemaType || "").trim();
  const noindex = !!seoData?.noindex;
  const nosnippet = !!seoData?.nosnippet;

  let seoScoreVal = 0;

  // 1. Title
  if (!title) {
    seoChecks.push({ label: "SEO başlığı girilmemiş.", ok: false, fail: true });
  } else {
    seoScoreVal += 10;
    if (title.length >= 50 && title.length <= 60) {
      seoScoreVal += 5;
      seoChecks.push({ label: `SEO başlığı ideal uzunlukta (${title.length} kar.).`, ok: true, pass: true });
    } else if (title.length >= 40 && title.length <= 70) {
      seoScoreVal += 2;
      seoChecks.push({ label: `SEO başlığı sınır değerlerde (${title.length} kar., ideal 50-60).`, ok: false, warn: true });
    } else {
      seoChecks.push({ label: `SEO başlığı çok ${title.length < 40 ? "kısa" : "uzun"} (${title.length} kar.).`, ok: false, fail: true });
    }
  }

  // 2. Meta Description
  if (!desc) {
    seoChecks.push({ label: "Meta açıklama girilmemiş.", ok: false, fail: true });
  } else {
    seoScoreVal += 10;
    if (desc.length >= 150 && desc.length <= 160) {
      seoScoreVal += 5;
      seoChecks.push({ label: `Meta açıklama ideal uzunlukta (${desc.length} kar.).`, ok: true, pass: true });
    } else if (desc.length >= 130 && desc.length <= 175) {
      seoScoreVal += 2;
      seoChecks.push({ label: `Meta açıklama sınır değerlerde (${desc.length} kar., ideal 150-160).`, ok: false, warn: true });
    } else {
      seoChecks.push({ label: `Meta açıklama çok ${desc.length < 130 ? "kısa" : "uzun"} (${desc.length} kar.).`, ok: false, fail: true });
    }
  }

  // 3. Focus Keyword
  if (!keyword) {
    seoChecks.push({ label: "Odak anahtar kelime belirlenmemiş.", ok: false, fail: true });
  } else {
    seoScoreVal += 10;
    seoChecks.push({ label: `Odak anahtar kelime tanımlanmış (${keyword}).`, ok: true, pass: true });
    if (title.toLowerCase().includes(keyword)) {
      seoScoreVal += 10;
      seoChecks.push({ label: "Anahtar kelime başlıkta geçiyor.", ok: true, pass: true });
    } else {
      seoChecks.push({ label: "Anahtar kelime başlıkta geçmiyor.", ok: false, warn: true });
    }
    if (desc.toLowerCase().includes(keyword)) {
      seoScoreVal += 10;
      seoChecks.push({ label: "Anahtar kelime açıklamada geçiyor.", ok: true, pass: true });
    } else {
      seoChecks.push({ label: "Anahtar kelime açıklamada geçmiyor.", ok: false, warn: true });
    }
  }

  // 4. Slug
  if (!slug) {
    seoChecks.push({ label: "Slug / URL yolu girilmemiş.", ok: false, fail: true });
  } else {
    seoScoreVal += 5;
    const isLower = slug === slug.toLowerCase();
    const hasSpaces = slug.includes(" ");
    const hasTr = /[çşğışöüIŞĞÖÜİ]/.test(slug);
    if (!isLower || hasSpaces || hasTr) {
      seoChecks.push({ label: "Slug temiz değil (küçük harf, tire ve İngilizce karakter olmalı).", ok: false, fail: true });
    } else if (slug.length > 75) {
      seoScoreVal += 2;
      seoChecks.push({ label: "Slug çok uzun (75 karakterden kısa tutun).", ok: false, warn: true });
    } else {
      seoScoreVal += 5;
      seoChecks.push({ label: "Slug yapısı temiz ve uygun.", ok: true, pass: true });
    }
  }

  // 5. Canonical
  if (!canonical) {
    seoChecks.push({ label: "Canonical URL girilmemiş (sayfanın kendi URL'si kullanılır).", ok: false, warn: true });
  } else {
    seoScoreVal += 10;
    seoChecks.push({ label: "Canonical URL tanımlanmış.", ok: true, pass: true });
  }

  // 6. Robots Index
  if (noindex) {
    seoChecks.push({ label: "Sayfa noindex durumunda (indekslenemez).", ok: false, warn: true });
  } else {
    seoScoreVal += 10;
    seoChecks.push({ label: "Sayfa indekslemeye açık.", ok: true, pass: true });
  }

  // 7. H1 & Title alignment
  if (!h1) {
    seoChecks.push({ label: "H1 başlığı eksik.", ok: false, fail: true });
  } else {
    seoScoreVal += 5;
    seoChecks.push({ label: "H1 başlığı mevcut.", ok: true, pass: true });
    if (title.toLowerCase().includes(h1.toLowerCase()) || h1.toLowerCase().includes(title.toLowerCase())) {
      seoScoreVal += 5;
      seoChecks.push({ label: "H1 başlığı ve SEO title birbiriyle uyumlu.", ok: true, pass: true });
    } else {
      seoChecks.push({ label: "H1 başlığı ve SEO title uyumsuz olabilir.", ok: false, warn: true });
    }
  }

  // 8. Schema
  if (!schemaType) {
    seoChecks.push({ label: "Schema yapısal veri tipi seçilmemiş.", ok: false, fail: true });
  } else {
    seoScoreVal += 5;
    seoChecks.push({ label: `Yapısal veri tipi: ${schemaType}.`, ok: true, pass: true });
  }

  // 9. OG Image
  if (!ogImage) {
    seoChecks.push({ label: "Sosyal paylaşım görseli (OG Image) eksik.", ok: false, warn: true });
  } else {
    seoScoreVal += 5;
    seoChecks.push({ label: "Sosyal paylaşım görseli tanımlı.", ok: true, pass: true });
  }

  // 10. Duplicate checks
  if (allPagesData && pageKey) {
    let duplicateTitle = false;
    let duplicateSlug = false;
    for (const [pk, localesData] of Object.entries(allPagesData)) {
      if (pk === pageKey) continue;
      const locData = (localesData as any)?.[locale] || {};
      if (title && locData.seoTitle?.trim().toLowerCase() === title.toLowerCase()) duplicateTitle = true;
      if (slug && locData.slug?.trim().toLowerCase() === slug.toLowerCase()) duplicateSlug = true;
    }
    if (duplicateTitle) {
      seoScoreVal -= 15;
      seoChecks.push({ label: "Bu SEO Başlığı başka bir sayfada kullanılıyor (Çift kayıt).", ok: false, fail: true });
    }
    if (duplicateSlug) {
      seoScoreVal -= 15;
      seoChecks.push({ label: "Bu URL Slug başka bir sayfada kullanılıyor (Çift kayıt).", ok: false, fail: true });
    }
  }

  const seoScore = Math.max(0, Math.min(100, seoScoreVal));

  // --- AI Score ---
  let aiScoreVal = 0;

  if (noindex) {
    aiChecks.push({ label: "Sayfa noindex olduğu için AI Overview kullanamaz.", ok: false, fail: true });
  } else if (nosnippet) {
    aiChecks.push({ label: "nosnippet aktif, arama robotları yapay zeka özeti üretemez.", ok: false, fail: true });
  } else {
    aiScoreVal += 20;
    aiChecks.push({ label: "Sayfa indekse açık ve snippet kullanımına izin veriyor.", ok: true, pass: true });
  }

  const aiShort = (seoData?.aiShortAnswer || "").trim();
  if (!aiShort) {
    aiChecks.push({ label: "AI Kısa Cevap alanı doldurulmamış.", ok: false, fail: true });
  } else if (aiShort.length < 50) {
    aiScoreVal += 10;
    aiChecks.push({ label: "AI Kısa Cevap alanı çok kısa (en az 50 kar. olmalı).", ok: false, warn: true });
  } else {
    aiScoreVal += 20;
    aiChecks.push({ label: "AI Kısa Cevap bölümü hazır.", ok: true, pass: true });
  }

  const faqList = seoData?.aiFAQ || [];
  if (faqList.length === 0) {
    aiChecks.push({ label: "AI soru-cevap blokları eklenmemiş.", ok: false, fail: true });
  } else if (faqList.length < 3) {
    aiScoreVal += faqList.length * 7;
    aiChecks.push({ label: `Soru-cevap sayısı az (${faqList.length}/3). En az 3 adet önerilir.`, ok: false, warn: true });
  } else {
    aiScoreVal += 20;
    aiChecks.push({ label: `AI soru-cevap listesi hazır (${faqList.length} adet).`, ok: true, pass: true });
  }

  let hasListsOrTables = false;
  if (pageContent) {
    const pageStr = JSON.stringify(pageContent).toLowerCase();
    if (
      pageStr.includes("<li>") || pageStr.includes("<ul") || pageStr.includes("<ol") ||
      pageStr.includes("<table") || pageStr.includes("\n-") || pageStr.includes("\n*") ||
      pageStr.includes("|") || ["solutions", "products", "news", "services"].includes(pageKey)
    ) {
      hasListsOrTables = true;
    }
  } else if (["solutions", "products", "news", "services"].includes(pageKey)) {
    hasListsOrTables = true;
  }

  if (hasListsOrTables) {
    aiScoreVal += 20;
    aiChecks.push({ label: "İçerikte maddeleme, tablo veya liste yapısı mevcut.", ok: true, pass: true });
  } else {
    aiChecks.push({ label: "İçerik düz uzun paragraflardan oluşuyor. Liste/tablo önerilir.", ok: false, warn: true });
  }

  const author = (seoData?.author || "").trim();
  const expertise = (seoData?.expertiseNote || "").trim();
  const sources = (seoData?.sources || "").trim();
  let eeatCount = 0;
  if (author) eeatCount++;
  if (expertise) eeatCount++;
  if ((seoData?.reviewedBy || "").trim()) eeatCount++;
  if (sources) eeatCount++;
  if ((seoData?.companyCompetency || "").trim()) eeatCount++;
  aiScoreVal += eeatCount * 2;

  if (author && expertise) {
    aiChecks.push({ label: "E-E-A-T yazar ve uzmanlık bilgisi girilmiş.", ok: true, pass: true });
  } else {
    aiChecks.push({ label: "Yazar veya uzmanlık bilgisi (E-E-A-T) eksik.", ok: false, warn: true });
  }

  if (sources) {
    aiChecks.push({ label: "Teknik kaynak ve referanslar listelenmiş.", ok: true, pass: true });
  } else {
    aiChecks.push({ label: "Kaynak gösterimi / resmi teknik referanslar girilmemiş.", ok: false, warn: true });
  }

  const lastUpd = (seoData?.lastUpdated || "").trim();
  if (lastUpd) {
    aiScoreVal += 10;
    aiChecks.push({ label: `Güncellik ve yayın tarihi bilgisi mevcut (${lastUpd}).`, ok: true, pass: true });
  } else {
    aiChecks.push({ label: "Son güncelleme tarihi girilmemiş.", ok: false, warn: true });
  }

  const aiScore = Math.max(0, Math.min(100, aiScoreVal));

  return {
    score: seoScore,
    level: levelFor(seoScore),
    seoScore,
    seoLevel: levelFor(seoScore),
    seoChecks,
    aiScore,
    aiLevel: levelFor(aiScore),
    aiChecks,
  };
}
