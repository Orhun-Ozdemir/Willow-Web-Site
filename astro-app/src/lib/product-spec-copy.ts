import type { Locale } from "./cms";

type IconItem = { id?: string; label: string; icon?: string; description?: string; visible?: boolean };

const WILLOWPRE_APPLICATIONS: Record<Locale, string[]> = {
  en: ["Pipeline pressure monitoring", "Water tank pressure monitoring", "Pump pressure monitoring", "Industrial liquid pressure systems", "Water distribution networks", "Hydraulic systems", "Irrigation systems"],
  tr: ["Boru hattı basınç izleme", "Su tankı basınç izleme", "Pompa basıncı izleme", "Endüstriyel sıvı basınç sistemleri", "Su dağıtım şebekeleri", "Hidrolik sistemler", "Sulama sistemleri"],
  de: ["Drucküberwachung in Rohrleitungen", "Drucküberwachung in Wassertanks", "Überwachung des Pumpendrucks", "Industrielle Flüssigkeitsdrucksysteme", "Wasserverteilungsnetze", "Hydrauliksysteme", "Bewässerungssysteme"],
  fr: ["Surveillance de la pression des conduites", "Surveillance de la pression des réservoirs d’eau", "Surveillance de la pression des pompes", "Systèmes industriels de pression des liquides", "Réseaux de distribution d’eau", "Systèmes hydrauliques", "Systèmes d’irrigation"],
  es: ["Monitorización de presión en tuberías", "Monitorización de presión en depósitos de agua", "Monitorización de presión en bombas", "Sistemas industriales de presión de líquidos", "Redes de distribución de agua", "Sistemas hidráulicos", "Sistemas de riego"],
  it: ["Monitoraggio della pressione nelle tubazioni", "Monitoraggio della pressione nei serbatoi d’acqua", "Monitoraggio della pressione delle pompe", "Sistemi industriali per la pressione dei liquidi", "Reti di distribuzione idrica", "Sistemi idraulici", "Sistemi di irrigazione"],
  ar: ["مراقبة ضغط خطوط الأنابيب", "مراقبة ضغط خزانات المياه", "مراقبة ضغط المضخات", "أنظمة ضغط السوائل الصناعية", "شبكات توزيع المياه", "الأنظمة الهيدروليكية", "أنظمة الري"],
  ja: ["配管圧力の監視", "水タンク圧力の監視", "ポンプ圧力の監視", "産業用液体圧力システム", "配水ネットワーク", "油圧システム", "灌漑システム"],
};

const WILLOWSONIC_APPLICATIONS: Record<Locale, string[]> = {
  en: ["Manhole flooding monitoring", "Water tank level monitoring", "Snow depth measurement", "Wastewater level monitoring", "Grain storage level monitoring", "Industrial liquid level monitoring", "Flood prevention systems", "Stormwater drainage monitoring"],
  tr: ["Rögar taşkın izleme", "Su tankı seviye izleme", "Kar yüksekliği ölçümü", "Atık su seviye izleme", "Tahıl deposu seviye izleme", "Endüstriyel sıvı seviye izleme", "Taşkın önleme sistemleri", "Yağmur suyu drenaj izleme"],
  de: ["Überwachung von Schachtüberflutungen", "Füllstandsüberwachung in Wassertanks", "Schneehöhenmessung", "Füllstandsüberwachung im Abwasser", "Füllstandsüberwachung in Getreidelagern", "Überwachung industrieller Flüssigkeitsfüllstände", "Hochwasserschutzsysteme", "Überwachung der Regenwasserentwässerung"],
  fr: ["Surveillance des débordements de regards", "Surveillance du niveau des réservoirs d’eau", "Mesure de l’épaisseur de neige", "Surveillance du niveau des eaux usées", "Surveillance du niveau des stocks de céréales", "Surveillance des niveaux de liquides industriels", "Systèmes de prévention des inondations", "Surveillance du drainage des eaux pluviales"],
  es: ["Monitorización de inundación en arquetas", "Monitorización de nivel en depósitos de agua", "Medición del espesor de nieve", "Monitorización del nivel de aguas residuales", "Monitorización del nivel en almacenes de grano", "Monitorización de niveles de líquidos industriales", "Sistemas de prevención de inundaciones", "Monitorización del drenaje de aguas pluviales"],
  it: ["Monitoraggio degli allagamenti nei pozzetti", "Monitoraggio del livello nei serbatoi d’acqua", "Misura dell’altezza della neve", "Monitoraggio del livello delle acque reflue", "Monitoraggio del livello nei depositi di cereali", "Monitoraggio dei livelli di liquidi industriali", "Sistemi di prevenzione delle inondazioni", "Monitoraggio del drenaggio delle acque meteoriche"],
  ar: ["مراقبة غمر غرف التفتيش", "مراقبة مستوى خزانات المياه", "قياس عمق الثلوج", "مراقبة مستوى مياه الصرف", "مراقبة مستوى مخازن الحبوب", "مراقبة مستويات السوائل الصناعية", "أنظمة الوقاية من الفيضانات", "مراقبة تصريف مياه الأمطار"],
  ja: ["マンホール浸水監視", "水タンクのレベル監視", "積雪深の測定", "排水レベル監視", "穀物貯蔵量の監視", "産業用液体レベル監視", "洪水防止システム", "雨水排水監視"],
};

const REPORTED_PARAMETERS: Record<string, Record<Locale, string[]>> = {
  willowpre: {
    en: ["Pipeline pressure", "Tank pressure"], tr: ["Boru hattı basıncı", "Tank basıncı"], de: ["Rohrleitungsdruck", "Tankdruck"], fr: ["Pression des conduites", "Pression des réservoirs"], es: ["Presión de tuberías", "Presión de depósitos"], it: ["Pressione delle tubazioni", "Pressione dei serbatoi"], ar: ["ضغط خطوط الأنابيب", "ضغط الخزانات"], ja: ["配管圧力", "タンク圧力"],
  },
  willowsonic: {
    en: ["Target distance (liquid, snow, etc.)", "Sensor temperature", "Battery level"], tr: ["Hedef mesafesi (sıvı, kar vb.)", "Sensör sıcaklığı", "Pil seviyesi"], de: ["Zielabstand (Flüssigkeit, Schnee usw.)", "Sensortemperatur", "Batteriestand"], fr: ["Distance de la cible (liquide, neige, etc.)", "Température du capteur", "Niveau de batterie"], es: ["Distancia al objetivo (líquido, nieve, etc.)", "Temperatura del sensor", "Nivel de batería"], it: ["Distanza dal bersaglio (liquido, neve, ecc.)", "Temperatura del sensore", "Livello batteria"], ar: ["المسافة إلى الهدف (سائل، ثلج، إلخ)", "درجة حرارة المستشعر", "مستوى البطارية"], ja: ["対象物までの距離（液体、雪など）", "センサー温度", "電池残量"],
  },
};

const PRODUCT_FEATURES: Record<string, Record<Locale, string[]>> = {
  willowpre: {
    en: ["Low-power design", "Configurable instant status notifications"], tr: ["Düşük güç tüketimli tasarım", "Yapılandırılabilir anlık durum bildirimleri"], de: ["Energiesparendes Design", "Konfigurierbare sofortige Statusmeldungen"], fr: ["Conception basse consommation", "Notifications d’état immédiates configurables"], es: ["Diseño de bajo consumo", "Notificaciones de estado inmediatas configurables"], it: ["Design a basso consumo", "Notifiche di stato immediate configurabili"], ar: ["تصميم منخفض استهلاك الطاقة", "إشعارات حالة فورية قابلة للإعداد"], ja: ["低消費電力設計", "設定可能な即時ステータス通知"],
  },
};

const APPLICATIONS: Record<string, Record<Locale, string[]>> = {
  willowpre: WILLOWPRE_APPLICATIONS,
  willowsonic: WILLOWSONIC_APPLICATIONS,
};

function localizeItems(productId: string, locale: Locale, fallback: IconItem[], copy: Record<string, Record<Locale, string[]>>): IconItem[] {
  const labels = copy[String(productId || "").toLowerCase()]?.[locale];
  if (!labels?.length) return fallback;
  return labels.map((label, index) => ({
    ...(fallback[index] || {}),
    id: fallback[index]?.id || `${productId}-${index + 1}`,
    label,
    description: "",
    visible: true,
  }));
}

export function localizedProductApplications(productId: string, locale: Locale, fallback: IconItem[]): IconItem[] {
  return localizeItems(productId, locale, fallback, APPLICATIONS);
}

export function localizedReportedParameters(productId: string, locale: Locale, fallback: IconItem[]): IconItem[] {
  return localizeItems(productId, locale, fallback, REPORTED_PARAMETERS);
}

export function localizedProductFeatures(productId: string, locale: Locale, fallback: string[]): string[] {
  return PRODUCT_FEATURES[String(productId || "").toLowerCase()]?.[locale] || fallback;
}
