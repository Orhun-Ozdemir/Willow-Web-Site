/** Default /services page content when CMS arrays are empty (matches live template). */
import { locales, type Locale } from "./cms";
export const fallbackServiceLayers = [
  {
    title: { en: "Device engineering", tr: "Cihaz mühendisliği", de: "Device Engineering", fr: "Ingénierie device", es: "Ingeniería de dispositivo", it: "Ingegneria device", ar: "هندسة الأجهزة", ja: "デバイスエンジニアリング" },
    headline: { en: "Hardware, firmware and connectivity.", tr: "Donanım, firmware ve bağlantı.", de: "Hardware, Firmware und Konnektivität.", fr: "Hardware, firmware et connectivité.", es: "Hardware, firmware y conectividad.", it: "Hardware, firmware e connettività.", ar: "العتاد، والـ firmware، والاتصال.", ja: "ハードウェア、ファームウェア、通信。" },
    description: { en: "For teams building physical IoT products that need reliable sensing, power, RF behavior and production-ready firmware.", tr: "Güvenilir ölçüm, güç yönetimi, RF performansı ve üretime hazır firmware gerektiren fiziksel IoT ürünleri geliştiren ekipler için.", de: "Für Teams, die physische IoT-Produkte mit zuverlässiger Sensorik, Stromversorgung, RF-Verhalten und produktionsreifer Firmware entwickeln.", fr: "Pour les équipes qui développent des produits IoT physiques avec mesure fiable, gestion d’énergie, comportement RF et firmware prêt pour la production.", es: "Para equipos que desarrollan productos IoT físicos con medición fiable, gestión de energía, comportamiento RF y firmware listo para producción.", it: "Per team che sviluppano prodotti IoT fisici con sensori affidabili, gestione energia, comportamento RF e firmware pronto per la produzione.", ar: "للفرق التي تطوّر منتجات IoT فعلية تحتاج إلى قياس موثوق، وإدارة طاقة، وأداء RF، وfirmware جاهز للإنتاج.", ja: "信頼できるセンシング、電源設計、RF 挙動、量産対応ファームウェアが必要な物理 IoT 製品を開発するチーム向け。" },
    output: { en: "PCB package, firmware source, RF notes and production handoff.", tr: "PCB paketi, firmware kaynak kodu, RF notları ve üretim devri.", de: "PCB-Paket, Firmware-Quellcode, RF-Notizen und Übergabe an die Produktion.", fr: "Dossier PCB, source firmware, notes RF et transfert vers la production.", es: "Paquete PCB, código fuente de firmware, notas RF y traspaso a producción.", it: "Pacchetto PCB, sorgente firmware, note RF e handoff alla produzione.", ar: "حزمة PCB، وكود firmware، وملاحظات RF، وتسليم الإنتاج.", ja: "PCB パッケージ、ファームウェアソース、RF メモ、量産引き渡し。" },
    tags: ["Embedded Hardware", "Firmware", "Connectivity"]
  },
  {
    title: { en: "Cloud & data", tr: "Cloud ve veri", de: "Cloud & Daten", fr: "Cloud & data", es: "Cloud y datos", it: "Cloud e dati", ar: "Cloud والبيانات", ja: "クラウドとデータ" },
    headline: { en: "Backend APIs and PostgreSQL architecture.", tr: "Backend API'ler ve PostgreSQL mimarisi.", de: "Backend-APIs und PostgreSQL-Architektur.", fr: "API backend et architecture PostgreSQL.", es: "API backend y arquitectura PostgreSQL.", it: "API backend e architettura PostgreSQL.", ar: "API backend وبنية PostgreSQL.", ja: "バックエンド API と PostgreSQL 設計。" },
    description: { en: "For products that collect device data, need authentication, reporting, alerts, dashboards and scalable operational data models.", tr: "Cihaz verisi toplayan; kimlik doğrulama, raporlama, uyarılar, dashboard'lar ve ölçeklenebilir veri modelleri gerektiren ürünler için.", de: "Für Produkte, die Gerätedaten sammeln und Authentifizierung, Reporting, Alarme, Dashboards und skalierbare Datenmodelle benötigen.", fr: "Pour les produits qui collectent des données device et nécessitent authentification, reporting, alertes, dashboards et modèles de données scalables.", es: "Para productos que recopilan datos de dispositivos y necesitan autenticación, informes, alertas, dashboards y modelos de datos escalables.", it: "Per prodotti che raccolgono dati dai dispositivi e richiedono autenticazione, reporting, allarmi, dashboard e modelli dati scalabili.", ar: "للمنتجات التي تجمع بيانات الأجهزة وتحتاج إلى مصادقة وتقارير وتنبيهات وdashboards ونماذج بيانات قابلة للتوسع.", ja: "デバイスデータを収集し、認証、レポート、アラート、ダッシュボード、スケーラブルなデータモデルが必要な製品向け。" },
    output: { en: "API contracts, database schema, auth flow and reporting queries.", tr: "API sözleşmeleri, veritabanı şeması, auth akışı ve raporlama sorguları.", de: "API-Verträge, Datenbankschema, Auth-Flow und Reporting-Abfragen.", fr: "Contrats API, schéma de base de données, flow d’authentification et requêtes de reporting.", es: "Contratos API, esquema de base de datos, flujo de autenticación y consultas de reporting.", it: "Contratti API, schema database, flusso auth e query di reporting.", ar: "عقود API، ومخطط قاعدة البيانات، ومسار auth، واستعلامات التقارير.", ja: "API 契約、データベーススキーマ、認証フロー、レポートクエリ。" },
    tags: ["Backend API", "PostgreSQL", "IoT Cloud"]
  },
  {
    title: { en: "Operator interface", tr: "Operasyon arayüzleri", de: "Operator Interfaces", fr: "Interfaces opérateur", es: "Interfaces de operación", it: "Interfacce operative", ar: "واجهات التشغيل", ja: "運用インターフェース" },
    headline: { en: "Web platforms, admin panels and mobile apps.", tr: "Web platformları, yönetim panelleri ve mobil uygulamalar.", de: "Webplattformen, Admin-Panels und mobile Apps.", fr: "Plateformes web, panneaux admin et applications mobiles.", es: "Plataformas web, paneles admin y apps móviles.", it: "Piattaforme web, pannelli admin e app mobile.", ar: "منصات ويب، ولوحات admin، وتطبيقات جوال.", ja: "Web プラットフォーム、管理パネル、モバイルアプリ。" },
    description: { en: "For teams that need operators, customers and field technicians to actually use the connected product every day.", tr: "Operatörlerin, müşterilerin ve saha teknisyenlerinin ürünü her gün gerçekten kullanması gereken ekipler için.", de: "Für Teams, deren Operatoren, Kunden und Feldtechniker das IoT-Produkt täglich nutzen müssen.", fr: "Pour les équipes dont les opérateurs, clients et techniciens terrain doivent utiliser le produit IoT au quotidien.", es: "Para equipos cuyos operadores, clientes y técnicos de campo necesitan usar el producto IoT cada día.", it: "Per team in cui operatori, clienti e tecnici sul campo devono usare il prodotto IoT ogni giorno.", ar: "للفرق التي يحتاج فيها المشغّلون والعملاء وفنيو الميدان إلى استخدام منتج IoT يوميًا.", ja: "オペレーター、顧客、現場技術者が IoT 製品を日常的に使う必要があるチーム向け。" },
    output: { en: "Dashboards, mobile flows, user roles, alerts and portal screens.", tr: "Dashboard'lar, mobil akışlar, kullanıcı rolleri, uyarılar ve portal ekranları.", de: "Dashboards, Mobile Flows, Benutzerrollen, Alarme und Portal-Screens.", fr: "Dashboards, parcours mobiles, rôles utilisateur, alertes et écrans portail.", es: "Dashboards, flujos móviles, roles de usuario, alertas y pantallas de portal.", it: "Dashboard, flussi mobile, ruoli utente, alert e schermate portale.", ar: "Dashboards، ومسارات الجوال، وأدوار المستخدمين، والتنبيهات، وشاشات البوابة.", ja: "ダッシュボード、モバイルフロー、ユーザーロール、アラート、ポータル画面。" },
    tags: ["Web/Admin", "Mobile Apps", "Customer Portal"]
  },
  {
    title: { en: "Immersive", tr: "VR ve simülasyon", de: "Immersive", fr: "Immersif", es: "Inmersivo", it: "Immersive", ar: "تجارب غامرة", ja: "イマーシブ" },
    headline: { en: "VR, simulation and digital twin experiences.", tr: "VR, simülasyon ve digital twin deneyimleri.", de: "VR, Simulation und Digital-Twin-Erlebnisse.", fr: "VR, simulation et expériences digital twin.", es: "VR, simulación y experiencias digital twin.", it: "VR, simulazione ed esperienze digital twin.", ar: "VR ومحاكاة وتجارب digital twin.", ja: "VR、シミュレーション、デジタルツイン体験。" },
    description: { en: "For products or environments that are hard to explain through flat screens, training documents or static presentations.", tr: "Düz ekranlar, eğitim dokümanları veya statik sunumlarla anlatması zor ürün ve ortamlar için.", de: "Für Produkte oder Umgebungen, die sich mit flachen Screens, Schulungsunterlagen oder statischen Präsentationen schwer erklären lassen.", fr: "Pour les produits ou environnements difficiles à expliquer avec des écrans plats, documents de formation ou présentations statiques.", es: "Para productos o entornos difíciles de explicar con pantallas planas, documentos de formación o presentaciones estáticas.", it: "Per prodotti o ambienti difficili da spiegare con schermate piatte, documenti di formazione o presentazioni statiche.", ar: "للمنتجات أو البيئات التي يصعب شرحها عبر شاشات مسطحة أو مستندات تدريب أو عروض ثابتة.", ja: "平面画面、トレーニング資料、静的なプレゼンでは説明しにくい製品や環境向け。" },
    output: { en: "Simulation scene, training flow, 3D presentation and demo assets.", tr: "Simülasyon sahnesi, eğitim akışı, 3D sunum ve demo varlıkları.", de: "Simulationsszene, Trainingsablauf, 3D-Präsentation und Demo-Assets.", fr: "Scène de simulation, parcours de formation, présentation 3D et assets de démo.", es: "Escena de simulación, flujo de formación, presentación 3D y assets de demo.", it: "Scena di simulazione, flusso training, presentazione 3D e asset demo.", ar: "مشهد محاكاة، ومسار تدريب، وعرض 3D، وملفات demo.", ja: "シミュレーションシーン、トレーニングフロー、3D プレゼン、デモアセット。" },
    tags: ["VR Training", "Product Demo", "Digital Twin"]
  },
];

export const fallbackDeliverables = [
  {
    title: { en: "Device package", tr: "Cihaz paketi", de: "Device-Paket", fr: "Dossier device", es: "Paquete de dispositivo", it: "Pacchetto device", ar: "حزمة الجهاز", ja: "デバイスパッケージ" },
    description: { en: "Schematics, PCB, BOM, prototype notes, RF and power decisions.", tr: "Şemalar, PCB, BOM, prototip notları, RF ve güç kararları.", de: "Schaltpläne, PCB, BOM, Prototypnotizen sowie RF- und Energieentscheidungen.", fr: "Schémas, PCB, BOM, notes de prototype et décisions RF/énergie.", es: "Esquemas, PCB, BOM, notas de prototipo y decisiones RF/energía.", it: "Schemi, PCB, BOM, note prototipo e decisioni RF/energia.", ar: "مخططات، PCB، BOM، ملاحظات النموذج الأولي، وقرارات RF والطاقة.", ja: "回路図、PCB、BOM、試作メモ、RF と電源に関する判断。" }
  },
  {
    title: { en: "Firmware package", tr: "Firmware paketi", de: "Firmware-Paket", fr: "Dossier firmware", es: "Paquete de firmware", it: "Pacchetto firmware", ar: "حزمة firmware", ja: "ファームウェアパッケージ" },
    description: { en: "Firmware source, drivers, protocol logic, OTA and low-power behavior.", tr: "Firmware kaynak kodu, driver'lar, protokol logic'i, OTA ve düşük güç davranışı.", de: "Firmware-Quellcode, Treiber, Protokolllogik, OTA und Low-Power-Verhalten.", fr: "Source firmware, drivers, logique protocole, OTA et comportement basse consommation.", es: "Código firmware, drivers, lógica de protocolo, OTA y comportamiento de bajo consumo.", it: "Sorgente firmware, driver, logica protocollo, OTA e comportamento low-power.", ar: "كود firmware، وdrivers، ومنطق البروتوكول، وOTA، وسلوك منخفض الطاقة.", ja: "ファームウェアソース、ドライバー、プロトコルロジック、OTA、低消費電力動作。" }
  },
  {
    title: { en: "Platform package", tr: "Platform paketi", de: "Plattform-Paket", fr: "Dossier plateforme", es: "Paquete de plataforma", it: "Pacchetto piattaforma", ar: "حزمة المنصة", ja: "プラットフォームパッケージ" },
    description: { en: "API contracts, WebSocket events, PostgreSQL schema, auth and reporting flow.", tr: "API sözleşmeleri, WebSocket event'leri, PostgreSQL şeması, auth ve raporlama akışı.", de: "API-Verträge, WebSocket-Events, PostgreSQL-Schema, Auth und Reporting-Flow.", fr: "Contrats API, événements WebSocket, schéma PostgreSQL, auth et flow de reporting.", es: "Contratos API, eventos WebSocket, esquema PostgreSQL, auth y flujo de reporting.", it: "Contratti API, eventi WebSocket, schema PostgreSQL, auth e flusso reporting.", ar: "عقود API، وأحداث WebSocket، ومخطط PostgreSQL، وauth، ومسار التقارير.", ja: "API 契約、WebSocket イベント、PostgreSQL スキーマ、認証、レポートフロー。" }
  },
  {
    title: { en: "Interface package", tr: "Arayüz paketi", de: "Interface-Paket", fr: "Dossier interface", es: "Paquete de interfaz", it: "Pacchetto interfaccia", ar: "حزمة الواجهة", ja: "インターフェースパッケージ" },
    description: { en: "Dashboard, admin panel, mobile app, roles, alerts and operator workflows.", tr: "Dashboard, yönetim paneli, mobil uygulama, roller, uyarılar ve operatör workflow'ları.", de: "Dashboard, Admin-Panel, Mobile App, Rollen, Alarme und Operator-Workflows.", fr: "Dashboard, panneau admin, application mobile, rôles, alertes et workflows opérateur.", es: "Dashboard, panel admin, app móvil, roles, alertas y workflows de operación.", it: "Dashboard, pannello admin, app mobile, ruoli, alert e workflow operativi.", ar: "Dashboard، ولوحة admin، وتطبيق جوال، وأدوار، وتنبيهات، وworkflows للمشغلين.", ja: "ダッシュボード、管理パネル、モバイルアプリ、ロール、アラート、運用ワークフロー。" }
  },
  {
    title: { en: "Launch package", tr: "Yayına alma paketi", de: "Launch-Paket", fr: "Dossier de lancement", es: "Paquete de lanzamiento", it: "Pacchetto lancio", ar: "حزمة الإطلاق", ja: "ローンチパッケージ" },
    description: { en: "Testing notes, deployment support, documentation and production handoff.", tr: "Test notları, deployment desteği, dokümantasyon ve üretim devri.", de: "Testnotizen, Deployment-Support, Dokumentation und Übergabe an die Produktion.", fr: "Notes de test, support deployment, documentation et transfert en production.", es: "Notas de prueba, soporte de deployment, documentación y traspaso a producción.", it: "Note di test, supporto deployment, documentazione e handoff alla produzione.", ar: "ملاحظات اختبار، ودعم deployment، ووثائق، وتسليم الإنتاج.", ja: "テストメモ、デプロイ支援、ドキュメント、量産引き渡し。" }
  },
];

export const fallbackProcessSteps = [
  {
    title: { en: "Analyze", tr: "Analiz", de: "Analyse", fr: "Analyse", es: "Análisis", it: "Analisi", ar: "التحليل", ja: "分析" },
    description: { en: "Requirements, field conditions, integrations and technical risks are clarified first.", tr: "Önce ihtiyaçlar, saha koşulları, entegrasyonlar ve teknik riskler netleştirilir.", de: "Anforderungen, Feldbedingungen, Integrationen und technische Risiken werden zuerst geklärt.", fr: "Les besoins, conditions terrain, intégrations et risques techniques sont clarifiés en premier.", es: "Primero se aclaran requisitos, condiciones de campo, integraciones y riesgos técnicos.", it: "Prima si chiariscono requisiti, condizioni sul campo, integrazioni e rischi tecnici.", ar: "نوضّح أولًا المتطلبات، وظروف الميدان، والتكاملات، والمخاطر التقنية.", ja: "要件、現場条件、連携、技術リスクを最初に明確にします。" }
  },
  {
    title: { en: "Architect", tr: "Mimari", de: "Architektur", fr: "Architecture", es: "Arquitectura", it: "Architettura", ar: "البنية", ja: "設計" },
    description: { en: "Hardware, firmware, API, database and interfaces are planned as one system.", tr: "Donanım, firmware, API, veritabanı ve arayüzler tek bir sistem olarak planlanır.", de: "Hardware, Firmware, API, Datenbank und Interfaces werden als ein System geplant.", fr: "Hardware, firmware, API, base de données et interfaces sont planifiés comme un seul système.", es: "Hardware, firmware, API, base de datos e interfaces se planifican como un único sistema.", it: "Hardware, firmware, API, database e interfacce vengono pianificati come un unico sistema.", ar: "نخطط العتاد، والـ firmware، وAPI، وقاعدة البيانات، والواجهات كنظام واحد.", ja: "ハードウェア、ファームウェア、API、データベース、インターフェースを一つのシステムとして設計します。" }
  },
  {
    title: { en: "Build", tr: "Geliştirme", de: "Umsetzung", fr: "Développement", es: "Desarrollo", it: "Sviluppo", ar: "التطوير", ja: "開発" },
    description: { en: "The product is developed across layers without vendor hand-off gaps.", tr: "Ürün, katmanlar arasında kopuk vendor devri oluşmadan geliştirilir.", de: "Das Produkt wird über alle Layer hinweg entwickelt, ohne Lücken bei Vendor-Handoffs.", fr: "Le produit est développé sur tous les layers sans rupture entre prestataires.", es: "El producto se desarrolla entre capas sin vacíos de traspaso entre proveedores.", it: "Il prodotto viene sviluppato su più layer senza gap di handoff tra fornitori.", ar: "نطوّر المنتج عبر الطبقات بدون فجوات تسليم بين vendors.", ja: "ベンダー間の引き渡しギャップを作らず、各レイヤーを横断して開発します。" }
  },
  {
    title: { en: "Validate", tr: "Doğrulama", de: "Validierung", fr: "Validation", es: "Validación", it: "Validazione", ar: "التحقق", ja: "検証" },
    description: { en: "RF, device stability, API reliability, UX and field readiness are tested together.", tr: "RF performansı, cihaz kararlılığı, API güvenilirliği, UX ve saha hazırlığı birlikte test edilir.", de: "RF, Gerätestabilität, API-Zuverlässigkeit, UX und Feldreife werden gemeinsam getestet.", fr: "RF, stabilité device, fiabilité API, UX et préparation terrain sont testés ensemble.", es: "RF, estabilidad del dispositivo, fiabilidad API, UX y preparación de campo se prueban juntos.", it: "RF, stabilità del device, affidabilità API, UX e prontezza sul campo vengono testati insieme.", ar: "نختبر أداء RF، واستقرار الجهاز، وموثوقية API، وUX، وجاهزية الميدان معًا.", ja: "RF、デバイス安定性、API 信頼性、UX、現場投入準備をまとめて検証します。" }
  },
];

type LocalizedFieldMap = Record<string, string>;

function localizedFieldBundle(fields: Record<string, LocalizedFieldMap>): Record<Locale, Record<string, string>> {
  const localized = {} as Record<Locale, Record<string, string>>;
  for (const loc of locales) {
    localized[loc] = {};
    for (const [key, map] of Object.entries(fields)) {
      localized[loc][key] = map[loc] || map.en || "";
    }
  }
  return localized;
}

/** Convert template fallbacks into CMS list items (for admin import / preview). */
export function fallbackServiceLayersAsCmsItems() {
  return fallbackServiceLayers.map((layer, index) => ({
    id: `service-layer-${index + 1}`,
    title: layer.title.en,
    headline: layer.headline.en,
    description: layer.description.en,
    output: layer.output.en,
    tags: layer.tags,
    sortOrder: index + 1,
    localized: localizedFieldBundle({
      title: layer.title,
      headline: layer.headline,
      description: layer.description,
      output: layer.output,
    }),
  }));
}

export function fallbackDeliverablesAsCmsItems() {
  return fallbackDeliverables.map((item, index) => ({
    id: `deliverable-${index + 1}`,
    title: item.title.en,
    description: item.description.en,
    sortOrder: index + 1,
    localized: localizedFieldBundle({
      title: item.title,
      description: item.description,
    }),
  }));
}

export function fallbackProcessStepsAsCmsItems() {
  return fallbackProcessSteps.map((step, index) => ({
    id: `process-step-${index + 1}`,
    title: step.title.en,
    description: step.description.en,
    sortOrder: index + 1,
    localized: localizedFieldBundle({
      title: step.title,
      description: step.description,
    }),
  }));
}
