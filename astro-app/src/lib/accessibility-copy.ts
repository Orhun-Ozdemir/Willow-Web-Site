import type { Locale } from "@/lib/cms";

const COPY: Record<string, Record<Locale, string>> = {
  breadcrumb: { en: "Breadcrumb", tr: "Sayfa yolu", de: "Brotkrümelnavigation", fr: "Fil d’Ariane", es: "Ruta de navegación", it: "Percorso di navigazione", ar: "مسار التنقل", ja: "パンくずリスト" },
  contentVerification: { en: "Content verification", tr: "İçerik doğrulama", de: "Inhaltsprüfung", fr: "Vérification du contenu", es: "Verificación del contenido", it: "Verifica dei contenuti", ar: "التحقق من المحتوى", ja: "コンテンツ検証情報" },
  trustedClients: { en: "Trusted by clients", tr: "Bizi tercih eden müşteriler", de: "Von Kunden geschätzt", fr: "Ils nous font confiance", es: "Clientes que confían en nosotros", it: "Clienti che ci hanno scelto", ar: "عملاء يثقون بنا", ja: "導入企業" },
  additionalSectors: { en: "Additional sectors", tr: "Diğer sektörler", de: "Weitere Branchen", fr: "Autres secteurs", es: "Otros sectores", it: "Altri settori", ar: "قطاعات إضافية", ja: "その他の業界" },
  projectStartingPoints: { en: "Common project starting points", tr: "Yaygın proje başlangıç noktaları", de: "Typische Projektstartpunkte", fr: "Points de départ habituels", es: "Puntos de partida habituales", it: "Punti di partenza comuni", ar: "نقاط بدء شائعة للمشاريع", ja: "一般的なプロジェクト開始点" },
  productFacts: { en: "Product portfolio facts", tr: "Ürün portföyü bilgileri", de: "Fakten zum Produktportfolio", fr: "Données du portefeuille produits", es: "Datos del portafolio de productos", it: "Dati del portafoglio prodotti", ar: "معلومات محفظة المنتجات", ja: "製品ポートフォリオ情報" },
  featuredHardware: { en: "Featured WillowSoft hardware", tr: "Öne çıkan WillowSoft donanımları", de: "Ausgewählte WillowSoft-Hardware", fr: "Matériel WillowSoft à la une", es: "Hardware WillowSoft destacado", it: "Hardware WillowSoft in evidenza", ar: "أجهزة WillowSoft المميزة", ja: "注目のWillowSoft製品" },
  productFamilies: { en: "Product families", tr: "Ürün aileleri", de: "Produktfamilien", fr: "Familles de produits", es: "Familias de productos", it: "Famiglie di prodotti", ar: "عائلات المنتجات", ja: "製品ファミリー" },
  productFilters: { en: "Product family filters", tr: "Ürün ailesi filtreleri", de: "Filter für Produktfamilien", fr: "Filtres par famille de produits", es: "Filtros por familia de productos", it: "Filtri per famiglia di prodotti", ar: "مرشحات عائلات المنتجات", ja: "製品ファミリーフィルター" },
  architectureSummary: { en: "Connected product architecture summary", tr: "Bağlantılı ürün mimarisi özeti", de: "Übersicht der vernetzten Produktarchitektur", fr: "Résumé de l’architecture du produit connecté", es: "Resumen de la arquitectura del producto conectado", it: "Riepilogo dell’architettura del prodotto connesso", ar: "ملخص بنية المنتج المتصل", ja: "コネクテッド製品アーキテクチャ概要" },
  newsSummary: { en: "News summary", tr: "Haber özeti", de: "Nachrichtenübersicht", fr: "Résumé des actualités", es: "Resumen de noticias", it: "Riepilogo delle notizie", ar: "ملخص الأخبار", ja: "ニュース概要" },
  newsFilters: { en: "News filters", tr: "Haber filtreleri", de: "Nachrichtenfilter", fr: "Filtres d’actualités", es: "Filtros de noticias", it: "Filtri delle notizie", ar: "مرشحات الأخبار", ja: "ニュースフィルター" },
  newsCategories: { en: "News categories", tr: "Haber kategorileri", de: "Nachrichtenkategorien", fr: "Catégories d’actualités", es: "Categorías de noticias", it: "Categorie delle notizie", ar: "فئات الأخبار", ja: "ニュースカテゴリー" },
};

export const accessibilityCopy = (key: keyof typeof COPY, locale: Locale): string =>
  COPY[key]?.[locale] || COPY[key]?.en || key;
