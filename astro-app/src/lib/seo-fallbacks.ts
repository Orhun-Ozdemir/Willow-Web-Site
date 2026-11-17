import type { Locale } from "@/lib/cms";

/** Localized SEO defaults derived from site and catalog content. */
const BRAND = "Willow Software";

const strip = (value: unknown): string =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const compactDescription = (value: string, maxLength = 155): string => {
  const clean = strip(value);
  if (Array.from(clean).length <= maxLength) return clean;
  const initial = Array.from(clean).slice(0, maxLength - 1).join("");
  const sentence = initial.match(/^(.+[.!?])(?:\s|$)/)?.[1];
  if (sentence && Array.from(sentence).length >= 90) return sentence;
  const wordBoundary = initial.replace(/\s+\S*$/, "").trim();
  return `${wordBoundary || initial.trimEnd()}…`;
};

const hasBrand = (value: string) => /willow\s*software|willowsoft/i.test(value);

const compactTitle = (primary: string, suffix = ` | ${BRAND}`): string => {
  const cleanPrimary = strip(primary);
  if (!cleanPrimary) return BRAND;
  const withBrand = hasBrand(cleanPrimary) ? cleanPrimary : `${cleanPrimary}${suffix}`;
  // Keep the full localized product/news name whenever possible. If branding
  // pushes the title beyond the common mobile snippet range, the name carries
  // stronger query intent than a repeated brand suffix.
  const candidate = withBrand.length <= 60 ? withBrand : cleanPrimary;
  if (Array.from(candidate).length <= 60) return candidate;
  const chars = Array.from(candidate);
  const initial = chars.slice(0, 59).join("");
  const wordBoundary = initial.replace(/\s+\S*$/, "").trim();
  return `${wordBoundary.length >= 42 ? wordBoundary : initial.trimEnd()}…`;
};

// Factual product description templates used only when neither a CMS meta
// description nor a short description exists for the locale.
const PRODUCT_DESC: Record<Locale, (name: string, category: string) => string> = {
  en: (n, c) => `${n}${c ? ` — ${c}` : ""} by Willow Software. Industrial IoT hardware delivered with firmware, backend and dashboard integration.`,
  tr: (n, c) => `${n}${c ? ` — ${c}` : ""}, Willow Software tarafından geliştirilir. Firmware, backend ve panel entegrasyonuyla sunulan endüstriyel IoT donanımı.`,
  de: (n, c) => `${n}${c ? ` — ${c}` : ""} von Willow Software. Industrielle IoT-Hardware mit Firmware-, Backend- und Dashboard-Integration.`,
  fr: (n, c) => `${n}${c ? ` — ${c}` : ""} par Willow Software. Matériel IoT industriel livré avec firmware, backend et tableau de bord.`,
  es: (n, c) => `${n}${c ? ` — ${c}` : ""} de Willow Software. Hardware de IoT industrial con firmware, backend e integración de panel.`,
  it: (n, c) => `${n}${c ? ` — ${c}` : ""} di Willow Software. Hardware IoT industriale con firmware, backend e integrazione dashboard.`,
  ar: (n, c) => `${n}${c ? ` — ${c}` : ""} من Willow Software. عتاد إنترنت الأشياء الصناعي مع دمج البرامج الثابتة والخادم ولوحة التحكم.`,
  ja: (n, c) => `${n}${c ? `（${c}）` : ""}｜Willow Software の産業用 IoT ハードウェア。ファームウェア・バックエンド・ダッシュボードまで統合提供します。`,
};

const NEWS_DESC: Record<Locale, (title: string) => string> = {
  en: (t) => `${t} — news and updates from Willow Software on embedded hardware and Industrial IoT.`,
  tr: (t) => `${t} — Willow Software'tan gömülü donanım ve Endüstriyel IoT haberleri ve güncellemeleri.`,
  de: (t) => `${t} — Neuigkeiten von Willow Software zu Embedded-Hardware und Industrial IoT.`,
  fr: (t) => `${t} — actualités de Willow Software sur le matériel embarqué et l'IoT industriel.`,
  es: (t) => `${t} — noticias de Willow Software sobre hardware embebido e IoT industrial.`,
  it: (t) => `${t} — notizie di Willow Software su hardware embedded e IoT industriale.`,
  ar: (t) => `${t} — أخبار وتحديثات Willow Software حول العتاد المدمج وإنترنت الأشياء الصناعي.`,
  ja: (t) => `${t}｜組み込みハードウェアと産業用 IoT に関する Willow Software のニュース。`,
};

export interface SeoText {
  title: string;
  description: string;
}

/**
 * Search-intent overrides for the small number of products with verified GSC
 * opportunities. CMS values still win; these are factual, code-level defaults
 * for environments where the product row has no explicit SEO fields.
 */
const PRODUCT_SEO_OVERRIDES: Record<string, Partial<Record<Locale, SeoText>>> = {
  willowsonic: {
    en: {
      title: "Ultrasonic LoRaWAN Level Sensor (IP67, 7.5m) — WillowSonic",
      description: "Industrial ultrasonic LoRaWAN level sensor for water tanks, silos and sewers. 7.5m non-contact range, IP67. Direct alternative to Teneo & Ellenex.",
    },
    tr: {
      title: "LoRaWAN Ultrasonik Seviye Sensörü (IP67) — WillowSonic",
      description: "Sıvı tankı, silo, rögar ve kar seviyesi ölçümü için endüstriyel LoRaWAN ultrasonik seviye sensörü. 7,5 m menzil, IP67 gövde, 10 yıl pil ömrü.",
    },
    de: {
      title: "LoRaWAN Füllstandssensor & Tankfüllstand (IP67) — WillowSonic",
      description: "Industrieller LoRaWAN Füllstandssensor für zuverlässige Messung von Tankfüllstand, Silo, Schacht und Flüssigkeiten. Ultraschall bis 7,5m, IP67.",
    },
    fr: {
      title: "Capteur de niveau ultrasonique LoRaWAN (IP67) - WillowSonic",
      description: "WillowSonic mesure jusqu’à 7,5 m les niveaux de liquides, silos, neige et regards, avec IP67, LoRaWAN 868/915 MHz et jusqu’à 10 ans d’autonomie.",
    },
    es: {
      title: "Sensor ultrasónico de nivel LoRaWAN (IP67) - WillowSonic",
      description: "WillowSonic mide hasta 7,5 m en líquidos, silos, nieve y arquetas, con IP67, LoRaWAN 868/915 MHz y hasta 10 años de autonomía.",
    },
    it: {
      title: "Sensore di livello LoRaWAN a ultrasuoni (IP67) - WillowSonic",
      description: "WillowSonic misura fino a 7,5 m i livelli di liquidi, sili, neve e pozzetti, con IP67, LoRaWAN 868/915 MHz e fino a 10 anni di autonomia.",
    },
    ar: {
      title: "مستشعر مستوى LoRaWAN بالموجات فوق الصوتية - WillowSonic",
      description: "يقيس WillowSonic مستويات السوائل والصوامع والثلوج وغرف التفتيش حتى 7.5 متر، مع حماية IP67 وعمر بطارية يصل إلى 10 سنوات.",
    },
    ja: {
      title: "LoRaWAN超音波レベルセンサー (IP67) - WillowSonic",
      description: "液体、サイロ、積雪、マンホールのレベルを最大7.5 mまで測定。IP67、LoRaWAN 868/915 MHz、最長10年の電池寿命に対応します。",
    },
  },
  willowpre: {
    en: {
      title: "LoRaWAN Pressure Sensor (0–1500 PSI, IP67) - WillowPre",
      description: "Industrial LoRaWAN liquid pressure sensor for pipes and tanks. 0–1500 PSI range, stainless steel, IP67 enclosure, up to 10-year battery life.",
    },
    tr: {
      title: "LoRaWAN Basınç Sensörü (0–1500 PSI, IP67) - WillowPre",
      description: "Boru hattı ve tanklarda sıvı basıncı izleme için endüstriyel LoRaWAN basınç sensörü. 0–1500 PSI, paslanmaz çelik, IP67, 10 yıla varan pil ömrü.",
    },
    de: {
      title: "LoRaWAN-Drucksensor (0–1500 PSI, IP67) - WillowPre",
      description: "WillowPre misst 0–1500 PSI Flüssigkeitsdruck in Rohrleitungen und Tanks. Mit IP67, LoRaWAN 868/915 MHz und bis zu 10 Jahren Batterielaufzeit.",
    },
    fr: {
      title: "Sonde LoRaWAN de pression et niveau (0–1500 PSI) — WillowPre",
      description: "Sonde LoRaWAN industrielle pour mesure de pression et niveau de liquide dans canalisations et cuves (0–1500 PSI). Inox 316L, IP67.",
    },
    es: {
      title: "Sensor de presión LoRaWAN (0–1500 PSI) - WillowPre",
      description: "WillowPre mide de 0 a 1500 PSI de presión de líquidos en tuberías y tanques, con IP67 y hasta 10 años de autonomía.",
    },
    it: {
      title: "Sensore di pressione LoRaWAN (0–1500 PSI) - WillowPre",
      description: "WillowPre misura la pressione dei liquidi da 0 a 1500 PSI in tubazioni e serbatoi, con IP67 e fino a 10 anni di autonomia.",
    },
    ar: {
      title: "مستشعر ضغط LoRaWAN (0-1500 PSI) - WillowPre",
      description: "يراقب WillowPre ضغط السوائل من 0 إلى 1500 PSI في الأنابيب والخزانات، مع حماية IP67 وعمر بطارية يصل إلى 10 سنوات.",
    },
    ja: {
      title: "LoRaWAN圧力センサー (0–1500 PSI, IP67) - WillowPre",
      description: "配管・タンク内の液体圧力を0～1500 PSIで監視。IP67、LoRaWAN 868/915 MHz、最長10年のバッテリー寿命に対応します。",
    },
  },
  willowbee: {
    en: {
      title: "STM32WL LoRaWAN MCU Module (Cortex-M4) - WillowBee",
      description: "Industrial STM32WL-based LoRaWAN MCU module for low-power sensor nodes. Single-chip MCU and LoRa radio, 22 dBm RF, ultra-low sleep current.",
    },
    tr: {
      title: "STM32WL LoRaWAN MCU Modülü (Cortex-M4) - WillowBee",
      description: "Düşük güçlü sensör uç noktaları için STM32WL tabanlı endüstriyel LoRaWAN modülü. Tek çipte MCU ve LoRa radyo, 22 dBm RF, ultra düşük uyku akımı.",
    },
    de: {
      title: "Industrielles LoRaWAN Modul (STM32WL, 22 dBm) — WillowBee",
      description: "Industrielles LoRaWAN Modul auf STM32WL-Basis für stromsparende Sensorknoten mit integriertem LoRa-Funk und 22 dBm RF.",
    },
    fr: {
      title: "Module MCU LoRaWAN STM32WL - WillowBee",
      description: "Module MCU LoRaWAN industriel basé sur STM32WL pour nœuds de capteurs basse consommation. MCU et radio LoRa sur une seule puce.",
    },
    es: {
      title: "Módulo MCU LoRaWAN STM32WL - WillowBee",
      description: "Módulo MCU LoRaWAN industrial basado en STM32WL para nodos de sensores de bajo consumo con MCU y radio LoRa integrados.",
    },
    it: {
      title: "Modulo MCU LoRaWAN STM32WL - WillowBee",
      description: "Modulo MCU LoRaWAN industriale basato su STM32WL per nodi sensore a basso consumo energetico con radio LoRa integrata.",
    },
    ar: {
      title: "وحدة STM32WL LoRaWAN MCU - WillowBee",
      description: "وحدة MCU LoRaWAN صناعية تعتمد على STM32WL لعقد استشعار منخفضة الطاقة مع راديو LoRa مدمج.",
    },
    ja: {
      title: "STM32WL搭載 LoRaWAN MCUモジュール - WillowBee",
      description: "低消費電力センサー端末向けSTM32WL搭載産業用LoRaWANモジュール。MCUとLoRa無線を1チップに統合、22 dBm RF出力対応。",
    },
  },
  willowmod: {
    en: {
      title: "Industrial LoRaWAN Modbus Bridge (RS485 RTU) - WillowMod",
      description: "Wireless RS485 Modbus RTU to LoRaWAN bridge for PLCs, energy meters and industrial equipment telemetry. Long-range wireless integration.",
    },
    tr: {
      title: "LoRaWAN Modbus Köprüsü (RS485 RTU Entegrasyon) - WillowMod",
      description: "PLC, sayaç ve enerji analizörlerini kablosuz izlemek için RS485 Modbus RTU LoRaWAN köprüsü. Uzun menzil, tak-çalıştır register haritası.",
    },
    de: {
      title: "Industrielles LoRaWAN Modul & Modbus Bridge (RS485) — WillowMod",
      description: "Industrielles LoRaWAN Modul zur RS485 Modbus RTU Überwachung von SPS, Energiezählern und Industrieanlagen. Große Reichweite.",
    },
    fr: {
      title: "Passerelle Modbus LoRaWAN (RS485 RTU) - WillowMod",
      description: "Pont sans fil RS485 Modbus RTU vers LoRaWAN pour automates PLC, compteurs d'énergie et télémétrie industrielle longue portée.",
    },
    es: {
      title: "Puente Modbus LoRaWAN (RS485 RTU) - WillowMod",
      description: "Puente inalámbrico RS485 Modbus RTU a LoRaWAN para PLCs, contadores de energía y telemetría de equipos industriales.",
    },
  },
  willowair: {
    en: {
      title: "LoRaWAN Indoor Air Quality Sensor (TVOC, eCO2, Temp) - WillowAir",
      description: "Indoor air quality monitoring sensor measuring TVOC, eCO2, temperature and relative humidity over LoRaWAN. Smart building and HVAC telemetry.",
    },
    tr: {
      title: "LoRaWAN Hava Kalitesi Sensörü (TVOC, eCO2, Sıcaklık) - WillowAir",
      description: "İç ortam hava kalitesi, TVOC, eCO2, sıcaklık ve bağıl nem ölçümü için kablosuz LoRaWAN sensörü. Akıllı bina ve HVAC izleme.",
    },
    de: {
      title: "Luftqualitätssensor LoRaWAN (CO2, TVOC, Temp) — WillowAir",
      description: "Industrieller Luftqualitätssensor LoRaWAN für Innenraum, Büro und Schule. Misst TVOC, eCO2, Temperatur und Feuchte für Gebäudeautomation.",
    },
    fr: {
      title: "Capteur de qualité de l'air intérieur LoRaWAN - WillowAir",
      description: "Surveillance de la qualité de l'air intérieur mesurant TVOC, eCO2, température et humidité via LoRaWAN pour bâtiments intelligents.",
    },
    es: {
      title: "Sensor de calidad del aire interior LoRaWAN - WillowAir",
      description: "Sensor para monitorización de calidad del aire interior que mide TVOC, eCO2, temperatura y humedad a través de LoRaWAN.",
    },
  },
  willowmos: {
    en: {
      title: "LoRaWAN Soil Moisture & Temp Sensor (IP68) - WillowMos",
      description: "Industrial LoRaWAN soil moisture and temperature sensor for smart agriculture and irrigation. IP68 probe, up to 10-year battery life.",
    },
    tr: {
      title: "LoRaWAN Toprak Nem ve Sıcaklık Sensörü (IP68) - WillowMos",
      description: "Akıllı tarım, sera ve peyzaj sulama için hassas LoRaWAN toprak nemi ve sıcaklık sensörü. IP68 su geçirmez prob, 10 yıl pil ömrü.",
    },
    de: {
      title: "LoRaWAN-Bodenfeuchte- und Temperatursensor (IP68) - WillowMos",
      description: "Industrieller LoRaWAN-Sensor für Bodenfeuchte und Temperatur für intelligente Landwirtschaft und Bewässerung. IP68-Sonde, 10 Jahre Batterielaufzeit.",
    },
    fr: {
      title: "Sonde LoRaWAN d'humidité du sol et température (IP68) — WillowMos",
      description: "Sonde LoRaWAN industrielle pour mesure d'humidité volumique du sol et température en agriculture de précision. Sonde IP68 étanche.",
    },
    es: {
      title: "Sensor de humedad y temperatura del suelo LoRaWAN (IP68) - WillowMos",
      description: "Sensor industrial de humedad del suelo y temperatura para agricultura inteligente y riego de precisión. Sonda IP68, batería de 10 años.",
    },
  },
  willowgps: {
    en: {
      title: "LoRaWAN GPS Tracker (Asset & Fleet Tracking, IP67) — WillowGPS",
      description: "Industrial LoRaWAN GPS tracker for cargo, containers and fleet tracking. Integrated antennas, smart motion detection, multi-year battery.",
    },
    tr: {
      title: "LoRaWAN GPS Takip Modülü (Varlık ve Filo) — WillowGPS",
      description: "Konteyner, filo ve saha varlıkları için düşük güçlü LoRaWAN GPS takip cihazı. Entegre anten, hareket algılama ve uzun pil ömrü.",
    },
    de: {
      title: "LoRaWAN GPS Tracker & Ortung (IP67 Gehäuse) — WillowGPS",
      description: "Robuster LoRaWAN GPS Tracker für Ortung von Containern, Fracht und Flotten. IP67 Gehäuse, Bewegungserkennung, bis zu 7 Jahre Batterielaufzeit.",
    },
    fr: {
      title: "Traceur GPS LoRaWAN pour actifs et flotte - WillowGPS",
      description: "Traceur GPS LoRaWAN basse consommation pour actifs, conteneurs et flotte avec détection de mouvement et autonomie pluriannuelle.",
    },
    es: {
      title: "Rastreador GPS LoRaWAN para activos y flotas - WillowGPS",
      description: "Rastreador GPS LoRaWAN de bajo consumo para activos, contenedores y flotas con detección de movimiento y batería de larga duración.",
    },
  },
  willowtemp: {
    en: {
      title: "LoRaWAN Temperature & Humidity Sensor (Cold Chain, IP67) - WillowTemp",
      description: "High-accuracy LoRaWAN temperature and humidity sensor for cold chain, pharmaceutical storage, warehouses, and HACCP compliance. Long battery life.",
    },
    tr: {
      title: "LoRaWAN Sıcaklık ve Nem Sensörü (Soğuk Zincir, IP67) - WillowTemp",
      description: "Soğuk zincir, aşı dolapları, ilaç depoları ve HACCP uyumluluğu için yüksek hassasiyetli endüstriyel LoRaWAN sıcaklık ve nem sensörü.",
    },
    de: {
      title: "LoRaWAN-Temperatur- und Feuchtigkeitssensor (Kühlkette) - WillowTemp",
      description: "Hochpräziser LoRaWAN-Temperatur- und Feuchtesensor für Kühlketten, Pharmalager und HACCP-Konformität mit langer Batterielaufzeit.",
    },
    fr: {
      title: "Capteur de température et humidité LoRaWAN (Chaîne du froid) - WillowTemp",
      description: "Capteur haute précision de température et d'humidité LoRaWAN pour la chaîne du froid, stockage pharmaceutique et normes HACCP.",
    },
    es: {
      title: "Sensor de temperatura y humedad LoRaWAN (Cadena de frío) - WillowTemp",
      description: "Sensor LoRaWAN de alta precisión para monitorización de cadena de frío, almacenes farmacéuticos y cumplimiento HACCP.",
    },
  },
  willowtilt: {
    en: {
      title: "LoRaWAN 3-Axis Inclinometer & Structural Tilt Sensor (IP67) - WillowTilt",
      description: "Precision LoRaWAN tilt and vibration sensor for utility poles, bridges, towers and structural health monitoring (SHM). Instant threshold alert.",
    },
    tr: {
      title: "LoRaWAN 3 Eksenli Eğim ve İvme Sensörü (Yapısal Sağlık, IP67) - WillowTilt",
      description: "Elektrik direkleri, köprüler, kuleler ve istinat duvarları için 0,01° hassasiyetli LoRaWAN 3 eksenli eğim ve titreşim sensörü. Anlık alarm iletimi.",
    },
    de: {
      title: "LoRaWAN-3-Achsen-Neigungssensor (Strukturüberwachung) - WillowTilt",
      description: "Präziser LoRaWAN-Neigungs- und Vibrationssensor für Maste, Brücken, Türme und Bauwerksüberwachung (SHM) mit sofortigem Schwellenwert-Alarm.",
    },
    fr: {
      title: "Inclinomètre et capteur d'inclinaison 3 axes LoRaWAN - WillowTilt",
      description: "Capteur d'inclinaison et vibration LoRaWAN 3 axes de haute précision pour poteaux, ponts, pylônes et surveillance structurelle (SHM).",
    },
    es: {
      title: "Inclinómetro y sensor de inclinación 3 ejes LoRaWAN - WillowTilt",
      description: "Sensor de inclinación y vibración LoRaWAN de 3 ejes para postes, puentes, torres y monitorización de salud estructural (SHM).",
    },
  },
  willowsens: {
    en: {
      title: "LoRaWAN Multi-Input Sensor & Door Contact Hub (IP67) — WillowSens",
      description: "Industrial LoRaWAN multi-input hub for magnetic door contacts, digital inputs, and pulse meters. Real-time enclosure and access monitoring.",
    },
    tr: {
      title: "LoRaWAN Çok Amaçlı Giriş & Kapı Kontak Sensörü (IP67) — WillowSens",
      description: "Trafo merkezleri, sunucu kabinetleri ve pano kapıları için manyetik kontak, kuru kontak ve darbe sayıcı destekli endüstriyel LoRaWAN sensörü.",
    },
    de: {
      title: "Überwachung LoRaWAN Modul & Türkontakt (IP67) — WillowSens",
      description: "Industrielles LoRaWAN Modul zur Überwachung von Schaltschränken, Türen und Zugängen. Magnetkontakt, digitale Eingänge und Impulszählung, IP67.",
    },
    fr: {
      title: "Capteur multi-entrées et contact de porte LoRaWAN (IP67) — WillowSens",
      description: "Hub LoRaWAN industriel pour contacts magnétiques, entrées numériques et comptage d'impulsions pour la surveillance d'accès.",
    },
    es: {
      title: "Sensor multientrada y contacto de puerta LoRaWAN (IP67) — WillowSens",
      description: "Concentrador LoRaWAN industrial para contactos magnéticos de puerta, entradas digitales y conteo de pulsos en armarios e instalaciones.",
    },
  },
  willowpanic: {
    en: {
      title: "LoRaWAN Industrial Panic Button & Lone Worker Alarm (IP65) - WillowPanic",
      description: "Rugged LoRaWAN emergency panic button with haptic feedback and instant priority uplink for lone workers, industrial safety, and healthcare.",
    },
    tr: {
      title: "LoRaWAN Endüstriyel Panik Butonu (Yalnız Çalışan Güvenliği) - WillowPanic",
      description: "Yalnız çalışan iş güvenliği (İSG), hastane ve acil durum çağrıları için anlık öncelikli uplink ileten endüstriyel LoRaWAN panik butonu.",
    },
    de: {
      title: "LoRaWAN-Industrie-Paniktaster (Alleinarbeiterschutz) - WillowPanic",
      description: "Robuster LoRaWAN-Notruftaster mit haptischer Rückmeldung und sofortiger Alarmübertragung für Alleinarbeiter und Arbeitssicherheit.",
    },
    fr: {
      title: "Bouton de panique et alarme travailleur isolé LoRaWAN - WillowPanic",
      description: "Bouton d'urgence LoRaWAN industriel avec retour haptique et transmission d'alerte prioritaire instantanée pour travailleurs isolés.",
    },
    es: {
      title: "Botón de pánico y alarma para trabajadores aislados LoRaWAN - WillowPanic",
      description: "Botón de emergencia industrial LoRaWAN con respuesta háptica y enlace ascendente prioritario instantáneo para seguridad laboral.",
    },
  },
  willowane: {
    en: {
      title: "LoRaWAN Ultrasonic Anemometer (Wind Speed & Direction, IP66) - WillowAne",
      description: "Solid-state LoRaWAN ultrasonic anemometer measuring wind speed and direction with zero moving parts. Ideal for solar farms, cranes, and weather stations.",
    },
    tr: {
      title: "LoRaWAN Ultrasonik Anemometre (Rüzgâr Hızı ve Yönü, IP66) - WillowAne",
      description: "Hareketli mekanik parça içermeyen katı hal ultrasonik rüzgar sensörü. Güneş santralleri, vinçler ve meteoroloji istasyonları için LoRaWAN anemometre.",
    },
    de: {
      title: "LoRaWAN-Ultraschall-Anemometer (Windgeschwindigkeit & Richtung) - WillowAne",
      description: "Verschleißfreies LoRaWAN-Ultraschall-Anemometer ohne bewegliche Teile zur Messung von Windgeschwindigkeit und -richtung für Solarparks und Kräne.",
    },
    fr: {
      title: "Anémomètre ultrasonique LoRaWAN (Vitesse et direction du vent) - WillowAne",
      description: "Anémomètre ultrasonique LoRaWAN statique sans pièces mobiles mesurant la vitesse et la direction du vent pour parcs solaires et grues.",
    },
    es: {
      title: "Anemómetro ultrasonico LoRaWAN (Velocidad y dirección del viento) - WillowAne",
      description: "Anemómetro ultrasónico LoRaWAN de estado sólido sin partes móviles para medir la velocidad y dirección del viento en plantas solares y grúas.",
    },
  },
  lumiosafe: {
    en: {
      title: "LoRaWAN Voice & Light Alert Beacon (Class C) - LumioSafe",
      description: "Industrial LoRaWAN Class C alert beacon combining natural human voice announcements, RGB light effects, and acoustic sirens for emergency alerting.",
    },
    tr: {
      title: "LoRaWAN Sesli ve Işıklı Anons Uyarı Cihazı (Class C) — LumioSafe",
      description: "Doğal insan sesiyle Türkçe anons, çok renkli RGB ışık ve acil durum sireni içeren endüstriyel LoRaWAN Class C akıllı uyarı ve anons cihazı.",
    },
    de: {
      title: "LoRaWAN-Alarmbake mit Sprachausgabe und RGB-Licht - LumioSafe",
      description: "Industrielle LoRaWAN Klasse C Alarmbake mit natürlicher Sprachausgabe, RGB-Lichteffekten und Sirene für Hallen, Depots und Schulen.",
    },
    fr: {
      title: "Balise d'alerte vocale et lumineuse LoRaWAN (Classe C) - LumioSafe",
      description: "Balise d'alerte industrielle LoRaWAN Classe C combinant annonces vocales naturelles, effets lumineux RGB et sirène pour urgences.",
    },
    es: {
      title: "Baliza de alerta por voz y luz LoRaWAN (Clase C) - LumioSafe",
      description: "Baliza de alerta industrial LoRaWAN Clase C con voz humana natural, efectos de luz RGB y sirena para avisos de emergencia inmediatos.",
    },
  },
  "product-1792414012667": {
    en: {
      title: "LoRaWAN Voice & Light Alert Beacon (Class C) - LumioSafe",
      description: "Industrial LoRaWAN Class C alert beacon combining natural human voice announcements, RGB light effects, and acoustic sirens for emergency alerting.",
    },
    tr: {
      title: "LoRaWAN Sesli ve Işıklı Anons Uyarı Cihazı (Class C) — LumioSafe",
      description: "Doğal insan sesiyle Türkçe anons, çok renkli RGB ışık ve acil durum sireni içeren endüstriyel LoRaWAN Class C akıllı uyarı ve anons cihazı.",
    },
    de: {
      title: "LoRaWAN-Alarmbake mit Sprachausgabe und RGB-Licht - LumioSafe",
      description: "Industrielle LoRaWAN Klasse C Alarmbake mit natürlicher Sprachausgabe, RGB-Lichteffekten und Sirene für Hallen, Depots und Schulen.",
    },
  },
};

/**
 * Builds a product title/description fallback from the localized name, category
 * label and short description. `seo` values (already resolved by the caller)
 * take priority; only missing fields are generated.
 */
export function productSeoFallback(
  locale: Locale,
  opts: { productId?: string; name: string; categoryLabel?: string; shortDescription?: string; seoTitle?: string; metaDescription?: string },
): SeoText {
  const productId = String(opts.productId || "").toLowerCase();
  const name = strip(opts.name);
  const category = strip(opts.categoryLabel);
  const shortDesc = strip(opts.shortDescription);
  const override = PRODUCT_SEO_OVERRIDES[productId]?.[locale];

  const descriptor = PRODUCT_TITLE_DESCRIPTORS[productId]?.[locale]
    || PRODUCT_TITLE_DESCRIPTORS[productId]?.en
    || category;
  // Non-branded first title pattern: [Search Descriptor] — [Product Name] | Willow Software
  const searchIntentTitle = descriptor ? `${descriptor} — ${name}` : name;
  const cmsTitle = strip(opts.seoTitle);
  const preferredTitle = cmsTitle || override?.title || searchIntentTitle;
  // Keep the model name when a longer catalog title would be cut short.
  const compactedTitle = compactTitle(preferredTitle);
  const title = compactedTitle.endsWith("…")
    ? searchIntentTitle
    : compactedTitle;

  const template = (PRODUCT_DESC[locale] || PRODUCT_DESC.en)(name, category);
  const generatedDescription = override?.description || shortDesc || template;

  return {
    title,
    description: compactDescription(strip(opts.metaDescription) || generatedDescription),
  };
}

/**
 * Builds a news title/description fallback from the localized title and excerpt.
 */
export function newsSeoFallback(
  locale: Locale,
  opts: { title: string; excerpt?: string; seoTitle?: string; metaDescription?: string },
): SeoText {
  const title = strip(opts.title);
  const excerpt = strip(opts.excerpt);

  const generatedTitle = compactTitle(title);
  const generatedDescription = excerpt || (NEWS_DESC[locale] || NEWS_DESC.en)(title);

  return {
    title: opts.seoTitle ? compactTitle(opts.seoTitle) : generatedTitle,
    description: compactDescription(strip(opts.metaDescription) || generatedDescription),
  };
}

const PRODUCT_TITLE_DESCRIPTORS: Record<string, Partial<Record<Locale, string>>> = {
  willowbee: { en: "STM32WL LoRaWAN MCU Module", tr: "STM32WL LoRaWAN MCU Modülü", de: "Industrielles LoRaWAN-Modul", fr: "Module MCU LoRaWAN", es: "Módulo MCU LoRaWAN", it: "Modulo MCU LoRaWAN", ar: "وحدة MCU LoRaWAN", ja: "LoRaWAN MCUモジュール" },
  willowsonic: { en: "Ultrasonic LoRaWAN Level Sensor", tr: "LoRaWAN Ultrasonik Seviye Sensörü", de: "LoRaWAN-Füllstandssensor", fr: "Capteur de niveau ultrasonique LoRaWAN", es: "Sensor ultrasónico de nivel LoRaWAN", it: "Sensore di livello LoRaWAN a ultrasuoni", ar: "مستشعر مستوى LoRaWAN بالموجات فوق الصوتية", ja: "LoRaWAN超音波レベルセンサー" },
  willowair: { en: "LoRaWAN Air Quality Sensor", tr: "LoRaWAN Hava Kalitesi Sensörü", de: "LoRaWAN-Luftqualitätssensor", fr: "Capteur d’air LoRaWAN", es: "Sensor de aire LoRaWAN", it: "Sensore aria LoRaWAN", ar: "مستشعر جودة الهواء LoRaWAN", ja: "LoRaWAN空気品質センサー" },
  willowgps: { en: "LoRaWAN GPS Tracker", tr: "LoRaWAN GPS Takip Modülü", de: "LoRaWAN-GPS-Tracker", fr: "Traceur GPS LoRaWAN", es: "Rastreador GPS LoRaWAN", it: "Tracker GPS LoRaWAN", ar: "متعقب GPS LoRaWAN", ja: "LoRaWAN GPSトラッカー" },
  willowpanic: { en: "LoRaWAN Panic Button", tr: "LoRaWAN Panik Butonu", de: "LoRaWAN-Paniktaster", fr: "Bouton d’alerte LoRaWAN", es: "Botón de pánico LoRaWAN", it: "Pulsante di emergenza LoRaWAN", ar: "زر طوارئ LoRaWAN", ja: "LoRaWANパニックボタン" },
  willowsens: { en: "LoRaWAN Door Contact Sensor", tr: "LoRaWAN Kapı Kontak Sensörü", de: "LoRaWAN-Überwachungsmodul", fr: "Capteur de porte LoRaWAN", es: "Sensor de puerta LoRaWAN", it: "Sensore porta LoRaWAN", ar: "مستشعر باب LoRaWAN", ja: "LoRaWANドアセンサー" },
  willowtilt: { en: "LoRaWAN Tilt & Acceleration Sensor", tr: "LoRaWAN Eğim ve İvme Sensörü", de: "LoRaWAN-Neigungssensor", fr: "Capteur d’inclinaison LoRaWAN", es: "Sensor de inclinación LoRaWAN", it: "Sensore di inclinazione LoRaWAN", ar: "مستشعر ميل LoRaWAN", ja: "LoRaWAN傾斜センサー" },
  willowtemp: { en: "LoRaWAN Temperature & Humidity Sensor", tr: "LoRaWAN Sıcaklık ve Nem Sensörü", de: "LoRaWAN-Temperatur- und Feuchtesensor", fr: "Capteur de température LoRaWAN", es: "Sensor de temperatura LoRaWAN", it: "Sensore di temperatura LoRaWAN", ar: "مستشعر حرارة LoRaWAN", ja: "LoRaWAN温度センサー" },
  willowmod: { en: "RS485 Modbus RTU to LoRaWAN Bridge", tr: "RS485 Modbus RTU LoRaWAN Köprüsü", de: "Industrielles LoRaWAN-Modul & Modbus", fr: "Passerelle Modbus LoRaWAN", es: "Puente Modbus LoRaWAN", it: "Bridge Modbus LoRaWAN", ar: "جسر Modbus LoRaWAN", ja: "LoRaWAN Modbusブリッジ" },
  willowmos: { en: "LoRaWAN Soil Moisture & Temperature Sensor", tr: "LoRaWAN Toprak Nemi ve Sıcaklık Sensörü", de: "LoRaWAN-Bodenfeuchtesensor", fr: "Capteur d’humidité du sol LoRaWAN", es: "Sensor de humedad del suelo LoRaWAN", it: "Sensore umidità terreno LoRaWAN", ar: "مستشعر رطوبة التربة LoRaWAN", ja: "LoRaWAN土壌水分センサー" },
  willowpre: { en: "IP67 LoRaWAN Pressure Sensor", tr: "IP67 LoRaWAN Basınç Sensörü", de: "IP67-LoRaWAN-Drucksensor", fr: "Capteur de pression LoRaWAN IP67", es: "Sensor de presión LoRaWAN IP67", it: "Sensore di pressione LoRaWAN IP67", ar: "مستشعر ضغط LoRaWAN بتصنيف IP67", ja: "IP67対応LoRaWAN圧力センサー" },
  willowane: { en: "LoRaWAN Ultrasonic Anemometer", tr: "LoRaWAN Ultrasonik Anemometre", de: "LoRaWAN-Ultraschallanemometer", fr: "Anémomètre LoRaWAN", es: "Anemómetro LoRaWAN", it: "Anemometro LoRaWAN", ar: "مقياس رياح LoRaWAN", ja: "LoRaWAN風速計" },
  lumiosafe: { en: "LoRaWAN Voice & Light Alert Beacon", tr: "LoRaWAN Sesli ve Işıklı Uyarı Cihazı", de: "LoRaWAN-Alarmbake mit Sprache und Licht", fr: "Balise d’alerte vocale et lumineuse LoRaWAN", es: "Baliza de alerta por voz y luz LoRaWAN", it: "Faro di allarme vocale e luminoso LoRaWAN", ar: "منارة تنبيه صوتية وضوئية LoRaWAN", ja: "LoRaWAN音声・光アラートビーコン" },
  "product-1792414012667": { en: "LoRaWAN Voice & Light Alert Beacon", tr: "LoRaWAN Sesli ve Işıklı Uyarı Cihazı", de: "LoRaWAN-Alarmbake mit Sprache und Licht", fr: "Balise d’alerte vocale et lumineuse LoRaWAN", es: "Baliza de alerta por voz y luz LoRaWAN", it: "Faro di allarme vocale e luminoso LoRaWAN", ar: "منارة تنبيه صوتية وضوئية LoRaWAN", ja: "LoRaWAN音声・光アラートビーコン" },
};

/** Search-intent descriptor for product headings, image alternatives and links. */
export function productSearchDescriptor(productId: string, locale: Locale): string {
  const descriptors = PRODUCT_TITLE_DESCRIPTORS[String(productId || "").toLowerCase()];
  return descriptors?.[locale] || descriptors?.en || "";
}
