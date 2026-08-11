import type { Locale } from "./cms";

type LandingCopy = {
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  familiesTitle: string;
  familiesLead: string;
  portfolioTitle: string;
  portfolioLead: string;
  integrationTitle: string;
  integrationText: string;
  evidenceNote: string;
  categoryBack: string;
  allProducts: string;
};

export const LORAWAN_LANDING_COPY: Record<Locale, LandingCopy> = {
  en: {
    eyebrow: "LoRaWAN hardware portfolio",
    title: "LoRaWAN Sensors and Industrial IoT Devices",
    description: "Explore WillowSoft LoRaWAN sensors, embedded modules, tracking devices and industrial interfaces using specifications maintained in the product catalog.",
    intro: "WillowSoft develops connected hardware for environmental sensing, asset and safety monitoring, industrial data collection and embedded LoRaWAN product development.",
    familiesTitle: "Browse by operational purpose",
    familiesLead: "Product families follow the work performed in the field. Open a family to compare the products and their current technical information.",
    portfolioTitle: "Current LoRaWAN product portfolio",
    portfolioLead: "Compare products by operational purpose, category and current technical specifications.",
    integrationTitle: "From device data to an operational interface",
    integrationText: "WillowSoft combines hardware, embedded firmware, backend services and web or mobile interfaces. The exact scope is defined for each product and project.",
    evidenceNote: "Frequency plan, enclosure, measurement range and battery information vary by product. Use the product specification and its current datasheet when making a technical selection.",
    categoryBack: "LoRaWAN sensor portfolio",
    allProducts: "View all products",
  },
  tr: {
    eyebrow: "LoRaWAN donanım portföyü",
    title: "LoRaWAN Sensörleri ve Endüstriyel IoT Cihazları",
    description: "WillowSoft LoRaWAN sensörlerini, gömülü modülleri, takip cihazlarını ve endüstriyel arayüzleri güncel ürün verileriyle inceleyin.",
    intro: "WillowSoft; çevresel ölçüm, varlık ve güvenlik takibi, endüstriyel veri toplama ve gömülü LoRaWAN ürün geliştirme için bağlantılı donanımlar geliştirir.",
    familiesTitle: "Operasyonel amaca göre inceleyin",
    familiesLead: "Ürün aileleri sahada üstlendikleri göreve göre ayrılır. Ürünleri ve güncel teknik bilgilerini karşılaştırmak için bir aile seçin.",
    portfolioTitle: "Güncel LoRaWAN ürün portföyü",
    portfolioLead: "Ürünleri kullanım amacı, kategori ve güncel teknik özelliklerine göre karşılaştırın.",
    integrationTitle: "Cihaz verisinden operasyon arayüzüne",
    integrationText: "WillowSoft; donanım, gömülü yazılım, backend servisleri ile web veya mobil arayüzleri birlikte geliştirir. Kesin kapsam ürün ve projeye göre belirlenir.",
    evidenceNote: "Frekans planı, gövde, ölçüm aralığı ve batarya bilgileri ürüne göre değişir. Teknik seçimde ürün özelliklerini ve güncel datasheet'i esas alın.",
    categoryBack: "LoRaWAN sensör portföyü",
    allProducts: "Tüm ürünleri görüntüle",
  },
  de: {
    eyebrow: "LoRaWAN-Hardwareportfolio",
    title: "LoRaWAN-Sensoren und industrielle IoT-Geräte",
    description: "Entdecken Sie LoRaWAN-Sensoren, Embedded-Module, Tracking-Geräte und industrielle Schnittstellen von WillowSoft anhand gepflegter Produktdaten.",
    intro: "WillowSoft entwickelt vernetzte Hardware für Umweltmessung, Asset- und Sicherheitsüberwachung, industrielle Datenerfassung und Embedded-LoRaWAN-Produkte.",
    familiesTitle: "Nach Einsatzzweck auswählen",
    familiesLead: "Die Produktfamilien folgen ihrer Aufgabe im Feld. Öffnen Sie eine Familie, um Produkte und aktuelle technische Angaben zu vergleichen.",
    portfolioTitle: "Aktuelles LoRaWAN-Produktportfolio",
    portfolioLead: "Vergleichen Sie Produkte nach Einsatzzweck, Kategorie und aktuellen technischen Spezifikationen.",
    integrationTitle: "Von Gerätedaten zur Bedienoberfläche",
    integrationText: "WillowSoft verbindet Hardware, Embedded-Firmware, Backend-Dienste und Web- oder Mobile-Oberflächen. Der genaue Umfang wird je Produkt und Projekt festgelegt.",
    evidenceNote: "Frequenzplan, Gehäuse, Messbereich und Batterieangaben unterscheiden sich je Produkt. Maßgeblich sind Produktspezifikation und aktuelles Datenblatt.",
    categoryBack: "LoRaWAN-Sensorportfolio",
    allProducts: "Alle Produkte ansehen",
  },
  fr: {
    eyebrow: "Portefeuille matériel LoRaWAN",
    title: "Capteurs LoRaWAN et appareils IoT industriels",
    description: "Découvrez les capteurs LoRaWAN, modules embarqués, dispositifs de suivi et interfaces industrielles WillowSoft à partir des données produit à jour.",
    intro: "WillowSoft développe du matériel connecté pour la mesure environnementale, le suivi des actifs et de la sécurité, la collecte de données industrielles et les produits LoRaWAN embarqués.",
    familiesTitle: "Explorer par finalité opérationnelle",
    familiesLead: "Les familles correspondent au rôle assuré sur le terrain. Ouvrez une famille pour comparer les produits et leurs informations techniques actuelles.",
    portfolioTitle: "Portefeuille LoRaWAN actuel",
    portfolioLead: "Comparez les produits selon leur usage, leur catégorie et leurs spécifications techniques actuelles.",
    integrationTitle: "Des données terrain à l’interface opérationnelle",
    integrationText: "WillowSoft réunit matériel, firmware embarqué, services backend et interfaces web ou mobiles. Le périmètre exact est défini pour chaque produit et projet.",
    evidenceNote: "Le plan de fréquences, le boîtier, la plage de mesure et la batterie varient selon le produit. Consultez la spécification et la fiche technique à jour.",
    categoryBack: "Portefeuille de capteurs LoRaWAN",
    allProducts: "Voir tous les produits",
  },
  es: {
    eyebrow: "Cartera de hardware LoRaWAN",
    title: "Sensores LoRaWAN y dispositivos IoT industriales",
    description: "Explore sensores LoRaWAN, módulos embebidos, dispositivos de seguimiento e interfaces industriales WillowSoft con datos de producto mantenidos.",
    intro: "WillowSoft desarrolla hardware conectado para medición ambiental, seguimiento de activos y seguridad, captura de datos industriales y productos LoRaWAN embebidos.",
    familiesTitle: "Explorar por finalidad operativa",
    familiesLead: "Las familias siguen el trabajo realizado en campo. Abra una familia para comparar productos y su información técnica actual.",
    portfolioTitle: "Cartera LoRaWAN actual",
    portfolioLead: "Compare los productos por finalidad, categoría y especificaciones técnicas vigentes.",
    integrationTitle: "De los datos del dispositivo a la interfaz operativa",
    integrationText: "WillowSoft integra hardware, firmware embebido, servicios backend e interfaces web o móviles. El alcance exacto se define para cada producto y proyecto.",
    evidenceNote: "El plan de frecuencia, la carcasa, el rango de medición y la batería varían según el producto. Consulte la especificación y la ficha técnica vigente.",
    categoryBack: "Cartera de sensores LoRaWAN",
    allProducts: "Ver todos los productos",
  },
  it: {
    eyebrow: "Portafoglio hardware LoRaWAN",
    title: "Sensori LoRaWAN e dispositivi IoT industriali",
    description: "Esplora sensori LoRaWAN, moduli embedded, dispositivi di tracciamento e interfacce industriali WillowSoft con dati di prodotto aggiornati.",
    intro: "WillowSoft sviluppa hardware connesso per misure ambientali, monitoraggio di asset e sicurezza, raccolta dati industriali e prodotti LoRaWAN embedded.",
    familiesTitle: "Esplora per finalità operativa",
    familiesLead: "Le famiglie seguono il compito svolto sul campo. Apri una famiglia per confrontare prodotti e informazioni tecniche aggiornate.",
    portfolioTitle: "Portafoglio LoRaWAN attuale",
    portfolioLead: "Confronta i prodotti per finalità, categoria e specifiche tecniche aggiornate.",
    integrationTitle: "Dai dati del dispositivo all’interfaccia operativa",
    integrationText: "WillowSoft combina hardware, firmware embedded, servizi backend e interfacce web o mobile. L’ambito esatto viene definito per ogni prodotto e progetto.",
    evidenceNote: "Piano di frequenza, custodia, intervallo di misura e batteria variano per prodotto. Fare riferimento alle specifiche e al datasheet aggiornato.",
    categoryBack: "Portafoglio sensori LoRaWAN",
    allProducts: "Vedi tutti i prodotti",
  },
  ar: {
    eyebrow: "مجموعة عتاد LoRaWAN",
    title: "مستشعرات LoRaWAN وأجهزة إنترنت الأشياء الصناعية",
    description: "استكشف مستشعرات LoRaWAN والوحدات المدمجة وأجهزة التتبع والواجهات الصناعية من WillowSoft اعتماداً على بيانات المنتجات المحدثة.",
    intro: "تطور WillowSoft عتاداً متصلاً للقياس البيئي وتتبع الأصول والسلامة وجمع البيانات الصناعية وتطوير منتجات LoRaWAN المدمجة.",
    familiesTitle: "التصفح حسب الغرض التشغيلي",
    familiesLead: "تُصنف عائلات المنتجات وفق المهمة الميدانية. افتح إحدى العائلات لمقارنة المنتجات ومعلوماتها الفنية الحالية.",
    portfolioTitle: "مجموعة منتجات LoRaWAN الحالية",
    portfolioLead: "قارن المنتجات حسب الغرض التشغيلي والفئة والمواصفات الفنية الحالية.",
    integrationTitle: "من بيانات الجهاز إلى واجهة التشغيل",
    integrationText: "تجمع WillowSoft بين العتاد والبرامج الثابتة المدمجة وخدمات الخلفية وواجهات الويب أو الهاتف. يُحدد النطاق الدقيق لكل منتج ومشروع.",
    evidenceNote: "تختلف خطة التردد والغلاف ونطاق القياس والبطارية حسب المنتج. يُرجى الرجوع إلى مواصفات المنتج وورقة البيانات الحالية.",
    categoryBack: "مجموعة مستشعرات LoRaWAN",
    allProducts: "عرض جميع المنتجات",
  },
  ja: {
    eyebrow: "LoRaWANハードウェア製品群",
    title: "LoRaWANセンサーと産業用IoTデバイス",
    description: "WillowSoftのLoRaWANセンサー、組み込みモジュール、追跡デバイス、産業用インターフェースを管理された製品情報から確認できます。",
    intro: "WillowSoftは、環境計測、資産・安全監視、産業データ収集、組み込みLoRaWAN製品開発向けのコネクテッドハードウェアを開発しています。",
    familiesTitle: "運用目的から選ぶ",
    familiesLead: "製品群は現場で担う役割ごとに分類されています。各分類から、製品と最新の技術情報を比較できます。",
    portfolioTitle: "現在のLoRaWAN製品ポートフォリオ",
    portfolioLead: "運用目的、カテゴリー、最新の技術仕様から製品を比較できます。",
    integrationTitle: "デバイスデータから運用画面まで",
    integrationText: "WillowSoftは、ハードウェア、組み込みファームウェア、バックエンド、Web・モバイル画面を統合します。正確な範囲は製品・案件ごとに定義します。",
    evidenceNote: "周波数プラン、筐体、測定範囲、電池情報は製品ごとに異なります。選定時は製品仕様と最新データシートをご確認ください。",
    categoryBack: "LoRaWANセンサー製品群",
    allProducts: "すべての製品を見る",
  },
};

const CATEGORY_NAMES: Record<string, Record<Locale, string>> = {
  modules: { en: "LoRaWAN Modules", tr: "LoRaWAN Modülleri", de: "LoRaWAN-Module", fr: "Modules LoRaWAN", es: "Módulos LoRaWAN", it: "Moduli LoRaWAN", ar: "وحدات LoRaWAN", ja: "LoRaWANモジュール" },
  environment: { en: "LoRaWAN Environmental Sensors", tr: "LoRaWAN Çevresel Ölçüm Sensörleri", de: "LoRaWAN-Umweltsensoren", fr: "Capteurs environnementaux LoRaWAN", es: "Sensores ambientales LoRaWAN", it: "Sensori ambientali LoRaWAN", ar: "مستشعرات LoRaWAN البيئية", ja: "LoRaWAN環境センサー" },
  tracking: { en: "LoRaWAN Tracking and Safety Devices", tr: "LoRaWAN Takip ve Güvenlik Cihazları", de: "LoRaWAN-Tracking- und Sicherheitsgeräte", fr: "Dispositifs LoRaWAN de suivi et de sécurité", es: "Dispositivos LoRaWAN de seguimiento y seguridad", it: "Dispositivi LoRaWAN di tracciamento e sicurezza", ar: "أجهزة LoRaWAN للتتبع والسلامة", ja: "LoRaWAN追跡・安全デバイス" },
  industrial: { en: "Industrial LoRaWAN Sensors and Interfaces", tr: "Endüstriyel LoRaWAN Sensörleri ve Arayüzleri", de: "Industrielle LoRaWAN-Sensoren und Schnittstellen", fr: "Capteurs et interfaces LoRaWAN industriels", es: "Sensores e interfaces LoRaWAN industriales", it: "Sensori e interfacce LoRaWAN industriali", ar: "مستشعرات وواجهات LoRaWAN الصناعية", ja: "産業用LoRaWANセンサー・インターフェース" },
};

export function categorySearchName(key: string, locale: Locale): string {
  return CATEGORY_NAMES[key]?.[locale] || CATEGORY_NAMES[key]?.en || key;
}

export function categorySeoDescription(key: string, locale: Locale, productCount: number): string {
  const name = categorySearchName(key, locale);
  const templates: Record<Locale, string> = {
    en: `Compare ${productCount} WillowSoft ${name.toLowerCase()} using current catalog descriptions and product specifications.`,
    tr: `${productCount} WillowSoft ${name.toLocaleLowerCase("tr-TR")} ürününü güncel katalog açıklamaları ve teknik özelliklerle karşılaştırın.`,
    de: `Vergleichen Sie ${productCount} WillowSoft-Produkte aus „${name}“ anhand aktueller Katalogdaten und Spezifikationen.`,
    fr: `Comparez ${productCount} produits WillowSoft de la gamme « ${name} » à partir des descriptions et spécifications actuelles.`,
    es: `Compare ${productCount} productos WillowSoft de « ${name} » mediante descripciones y especificaciones actuales.`,
    it: `Confronta ${productCount} prodotti WillowSoft della gamma “${name}” usando descrizioni e specifiche aggiornate.`,
    ar: `قارن بين ${productCount} من منتجات WillowSoft ضمن «${name}» بالاعتماد على الأوصاف والمواصفات الحالية.`,
    ja: `「${name}」に属するWillowSoft製品${productCount}点を、最新の説明と仕様で比較できます。`,
  };
  return templates[locale] || templates.en;
}

export const COLLECTION_TABLE_LABELS: Record<Locale, { product: string; type: string; category: string; description: string }> = {
  en: { product: "Product", type: "Product type", category: "Category", description: "Catalog description" },
  tr: { product: "Ürün", type: "Ürün türü", category: "Kategori", description: "Katalog açıklaması" },
  de: { product: "Produkt", type: "Produkttyp", category: "Kategorie", description: "Katalogbeschreibung" },
  fr: { product: "Produit", type: "Type de produit", category: "Catégorie", description: "Description du catalogue" },
  es: { product: "Producto", type: "Tipo de producto", category: "Categoría", description: "Descripción del catálogo" },
  it: { product: "Prodotto", type: "Tipo di prodotto", category: "Categoria", description: "Descrizione catalogo" },
  ar: { product: "المنتج", type: "نوع المنتج", category: "الفئة", description: "وصف الكتالوج" },
  ja: { product: "製品", type: "製品タイプ", category: "カテゴリー", description: "カタログ説明" },
};
