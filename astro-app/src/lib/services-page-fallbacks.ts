/** Default /services page content when CMS arrays are empty (matches live template). */
import { locales, type Locale } from "./cms";
export const fallbackServiceLayers = [
  {
    title: { en: "Device engineering", tr: "Cihaz mühendisliği", de: "Geräteentwicklung", fr: "Ingénierie des appareils", es: "Ingeniería de dispositivos", it: "Ingegneria dei dispositivi", ar: "هندسة الأجهزة", ja: "デバイス開発" },
    headline: { en: "Hardware, firmware and connectivity.", tr: "Donanım, firmware ve bağlantı.", de: "Hardware, Firmware und Konnektivität.", fr: "Matériel, firmware et connectivité.", es: "Hardware, firmware y conectividad.", it: "Hardware, firmware e connettività.", ar: "العتاد والبرمجيات الثابتة والاتصال.", ja: "ハードウェア、ファームウェア、通信。" },
    description: { en: "For teams building physical IoT products that need reliable sensing, power, RF behavior and production-ready firmware.", tr: "Güvenilir ölçüm, güç yönetimi, RF performansı ve üretime hazır firmware gerektiren fiziksel IoT ürünleri geliştiren ekipler için.", de: "Für Teams, die physische IoT-Produkte mit zuverlässiger Sensorik, Stromversorgung, RF-Verhalten und produktionsreifer Firmware entwickeln.", fr: "Pour les équipes qui développent des produits IoT physiques avec mesure fiable, gestion d’énergie, comportement RF et firmware prêt pour la production.", es: "Para equipos que desarrollan productos IoT físicos con medición fiable, gestión de energía, comportamiento RF y firmware listo para producción.", it: "Per team che sviluppano prodotti IoT fisici con sensori affidabili, gestione energia, comportamento RF e firmware pronto per la produzione.", ar: "للفرق التي تطوّر منتجات IoT فعلية تحتاج إلى قياس موثوق، وإدارة طاقة، وأداء RF، وfirmware جاهز للإنتاج.", ja: "信頼できるセンシング、電源設計、RF 挙動、量産対応ファームウェアが必要な物理 IoT 製品を開発するチーム向け。" },
    output: { en: "PCB package, firmware source, RF notes and production handoff.", tr: "PCB tasarım dosyaları, firmware kaynak kodu, RF notları ve üretim devri.", de: "PCB-Unterlagen, Firmware-Quellcode, RF-Dokumentation und Übergabe an die Fertigung.", fr: "Dossier de conception PCB, code source du firmware, notes RF et transfert en production.", es: "Documentación de PCB, código fuente del firmware, notas de RF y traspaso a producción.", it: "Documentazione PCB, codice sorgente del firmware, note RF e passaggio alla produzione.", ar: "ملفات تصميم لوحة الدوائر وكود البرمجيات الثابتة ووثائق الترددات اللاسلكية وتسليم الإنتاج.", ja: "基板設計データ、ファームウェアソース、RF資料、量産引き渡し資料。" },
    tags: [
      { en: "Embedded Hardware", tr: "Gömülü Donanım", de: "Embedded Hardware", fr: "Hardware embarqué", es: "Hardware embebido", it: "Hardware embedded", ar: "عتاد مدمج", ja: "組み込みハードウェア" },
      { en: "Firmware", tr: "Firmware", de: "Firmware", fr: "Firmware", es: "Firmware", it: "Firmware", ar: "البرمجيات الثابتة", ja: "ファームウェア" },
      { en: "Connectivity", tr: "Bağlantı", de: "Konnektivität", fr: "Connectivité", es: "Conectividad", it: "Connettività", ar: "الاتصال", ja: "コネクティビティ" },
    ],
  },
  {
    title: { en: "Cloud & data", tr: "Bulut ve veri", de: "Cloud und Daten", fr: "Cloud et données", es: "Cloud y datos", it: "Cloud e dati", ar: "السحابة والبيانات", ja: "クラウドとデータ" },
    headline: { en: "Backend APIs and PostgreSQL architecture.", tr: "Backend API ve PostgreSQL mimarisi.", de: "Backend-APIs und PostgreSQL-Architektur.", fr: "API backend et architecture PostgreSQL.", es: "API de backend y arquitectura PostgreSQL.", it: "API backend e architettura PostgreSQL.", ar: "واجهات برمجية خلفية وبنية PostgreSQL.", ja: "バックエンドAPIとPostgreSQL設計。" },
    description: { en: "For products that collect device data, need authentication, reporting, alerts, dashboards and scalable operational data models.", tr: "Cihaz verisi toplayan; kimlik doğrulama, raporlama, uyarı, yönetim paneli ve ölçeklenebilir veri modeli gerektiren ürünler için.", de: "Für Produkte, die Gerätedaten erfassen und Authentifizierung, Berichte, Alarme, Dashboards sowie skalierbare Datenmodelle benötigen.", fr: "Pour les produits qui collectent des données d’appareils et nécessitent authentification, rapports, alertes, tableaux de bord et modèles de données évolutifs.", es: "Para productos que recopilan datos de dispositivos y necesitan autenticación, informes, alertas, paneles y modelos de datos escalables.", it: "Per prodotti che raccolgono dati dai dispositivi e richiedono autenticazione, report, allarmi, cruscotti e modelli dati scalabili.", ar: "للمنتجات التي تجمع بيانات الأجهزة وتحتاج إلى المصادقة والتقارير والتنبيهات ولوحات المتابعة ونماذج بيانات قابلة للتوسع.", ja: "デバイスデータの収集に加え、認証、レポート、アラート、ダッシュボード、拡張性の高いデータモデルが必要な製品向け。" },
    output: { en: "API contracts, database schema, auth flow and reporting queries.", tr: "API sözleşmeleri, veritabanı şeması, kimlik doğrulama akışı ve raporlama sorguları.", de: "API-Spezifikation, Datenbankschema, Authentifizierungsablauf und Berichtsabfragen.", fr: "Spécification des API, schéma de base de données, parcours d’authentification et requêtes de reporting.", es: "Especificación de API, esquema de base de datos, flujo de autenticación y consultas para informes.", it: "Specifiche API, schema del database, flusso di autenticazione e query per i report.", ar: "مواصفات الواجهات البرمجية ومخطط قاعدة البيانات ومسار المصادقة واستعلامات التقارير.", ja: "API仕様、データベーススキーマ、認証フロー、レポート用クエリ。" },
    tags: [
      { en: "Backend API", tr: "Backend API", de: "Backend-API", fr: "API backend", es: "API backend", it: "API backend", ar: "API خلفية", ja: "バックエンド API" },
      { en: "PostgreSQL", tr: "PostgreSQL", de: "PostgreSQL", fr: "PostgreSQL", es: "PostgreSQL", it: "PostgreSQL", ar: "PostgreSQL", ja: "PostgreSQL" },
      { en: "IoT Cloud", tr: "IoT Bulut", de: "IoT Cloud", fr: "Cloud IoT", es: "Cloud IoT", it: "Cloud IoT", ar: "سحابة IoT", ja: "IoT クラウド" },
    ],
  },
  {
    title: { en: "Operator interface", tr: "Operasyon arayüzleri", de: "Bedienoberflächen", fr: "Interfaces opérateur", es: "Interfaces de operación", it: "Interfacce operative", ar: "واجهات التشغيل", ja: "運用インターフェース" },
    headline: { en: "Web platforms, admin panels and mobile apps.", tr: "Web platformları, yönetim panelleri ve mobil uygulamalar.", de: "Webplattformen, Verwaltungsoberflächen und mobile Apps.", fr: "Plateformes web, interfaces d’administration et applications mobiles.", es: "Plataformas web, paneles de administración y aplicaciones móviles.", it: "Piattaforme web, pannelli di amministrazione e app mobili.", ar: "منصات ويب ولوحات إدارة وتطبيقات جوال.", ja: "Webプラットフォーム、管理画面、モバイルアプリ。" },
    description: { en: "For teams that need operators, customers and field technicians to actually use the connected product every day.", tr: "Operatörlerin, müşterilerin ve saha teknisyenlerinin ürünü her gün gerçekten kullanması gereken ekipler için.", de: "Für Teams, deren Operatoren, Kunden und Feldtechniker das IoT-Produkt täglich nutzen müssen.", fr: "Pour les équipes dont les opérateurs, clients et techniciens terrain doivent utiliser le produit IoT au quotidien.", es: "Para equipos cuyos operadores, clientes y técnicos de campo necesitan usar el producto IoT cada día.", it: "Per team in cui operatori, clienti e tecnici sul campo devono usare il prodotto IoT ogni giorno.", ar: "للفرق التي يحتاج فيها المشغّلون والعملاء وفنيو الميدان إلى استخدام منتج IoT يوميًا.", ja: "オペレーター、顧客、現場技術者が IoT 製品を日常的に使う必要があるチーム向け。" },
    output: { en: "Dashboards, mobile flows, user roles, alerts and portal screens.", tr: "Gösterge panelleri, mobil kullanıcı akışları, kullanıcı rolleri, uyarılar ve portal ekranları.", de: "Übersichtsseiten, mobile Abläufe, Benutzerrollen, Alarme und Portalansichten.", fr: "Tableaux de bord, parcours mobiles, rôles utilisateur, alertes et écrans du portail.", es: "Paneles de control, recorridos móviles, roles de usuario, alertas y pantallas del portal.", it: "Cruscotti, percorsi su dispositivi mobili, ruoli utente, avvisi e schermate del portale.", ar: "لوحات متابعة ومسارات استخدام على الجوال وأدوار مستخدمين وتنبيهات وشاشات للبوابة.", ja: "ダッシュボード、モバイルの操作フロー、ユーザー権限、アラート、ポータル画面。" },
    tags: [
      { en: "Web/Admin", tr: "Web/Yönetim", de: "Web/Admin", fr: "Web/Admin", es: "Web/Admin", it: "Web/Admin", ar: "ويب/إدارة", ja: "Web/管理" },
      { en: "Mobile Apps", tr: "Mobil Uygulamalar", de: "Mobile Apps", fr: "Apps mobiles", es: "Apps móviles", it: "App mobile", ar: "تطبيقات جوال", ja: "モバイルアプリ" },
      { en: "Customer Portal", tr: "Müşteri Portalı", de: "Kundenportal", fr: "Portail client", es: "Portal de cliente", it: "Portale clienti", ar: "بوابة العملاء", ja: "顧客ポータル" },
    ],
  },
  {
    title: { en: "Immersive", tr: "VR ve simülasyon", de: "Immersive Erlebnisse", fr: "Expériences immersives", es: "Experiencias inmersivas", it: "Esperienze immersive", ar: "تجارب غامرة", ja: "没入型体験" },
    headline: { en: "VR, simulation and digital twin experiences.", tr: "VR, simülasyon ve dijital ikiz deneyimleri.", de: "VR-, Simulations- und Digital-Twin-Erlebnisse.", fr: "Expériences en VR, simulation et jumeau numérique.", es: "Experiencias de VR, simulación y gemelo digital.", it: "Esperienze di VR, simulazione e gemello digitale.", ar: "تجارب واقع افتراضي ومحاكاة وتوأم رقمي.", ja: "VR、シミュレーション、デジタルツインを活用した体験。" },
    description: { en: "For products or environments that are hard to explain through flat screens, training documents or static presentations.", tr: "Düz ekranlar, eğitim dokümanları veya statik sunumlarla anlatması zor ürün ve ortamlar için.", de: "Für Produkte oder Umgebungen, die sich mit flachen Screens, Schulungsunterlagen oder statischen Präsentationen schwer erklären lassen.", fr: "Pour les produits ou environnements difficiles à expliquer avec des écrans plats, documents de formation ou présentations statiques.", es: "Para productos o entornos difíciles de explicar con pantallas planas, documentos de formación o presentaciones estáticas.", it: "Per prodotti o ambienti difficili da spiegare con schermate piatte, documenti di formazione o presentazioni statiche.", ar: "للمنتجات أو البيئات التي يصعب شرحها عبر شاشات مسطحة أو مستندات تدريب أو عروض ثابتة.", ja: "平面画面、トレーニング資料、静的なプレゼンでは説明しにくい製品や環境向け。" },
    output: { en: "Simulation scene, training flow, 3D presentation and demo assets.", tr: "Simülasyon sahnesi, eğitim akışı, 3D sunum ve tanıtım içerikleri.", de: "Simulationsszene, Schulungsablauf, 3D-Präsentation und Vorführmaterial.", fr: "Scène de simulation, parcours de formation, présentation 3D et contenus de démonstration.", es: "Escena de simulación, recorrido formativo, presentación 3D y materiales de demostración.", it: "Scenario di simulazione, percorso formativo, presentazione 3D e materiali dimostrativi.", ar: "مشهد محاكاة ومسار تدريبي وعرض ثلاثي الأبعاد ومواد توضيحية.", ja: "シミュレーションシーン、研修フロー、3Dプレゼンテーション、デモ用素材。" },
    tags: [
      { en: "VR Training", tr: "VR Eğitim", de: "VR-Training", fr: "Formation VR", es: "Formación VR", it: "Training VR", ar: "تدريب VR", ja: "VR トレーニング" },
      { en: "Product Demo", tr: "Ürün Demosu", de: "Produktdemo", fr: "Démo produit", es: "Demo de producto", it: "Demo prodotto", ar: "عرض المنتج", ja: "製品デモ" },
      { en: "Digital Twin", tr: "Digital Twin", de: "Digital Twin", fr: "Jumeau numérique", es: "Gemelo digital", it: "Digital twin", ar: "توأم رقمي", ja: "デジタルツイン" },
    ],
  },
];

export const fallbackDeliverables = [
  {
    title: { en: "Device package", tr: "Cihaz paketi", de: "Gerätepaket", fr: "Dossier de l’appareil", es: "Paquete del dispositivo", it: "Pacchetto del dispositivo", ar: "حزمة الجهاز", ja: "デバイスパッケージ" },
    description: { en: "Schematics, PCB, BOM, prototype notes, RF and power decisions.", tr: "Şemalar, PCB, BOM, prototip notları, RF ve güç kararları.", de: "Schaltpläne, PCB, BOM, Prototypnotizen sowie RF- und Energieentscheidungen.", fr: "Schémas, PCB, BOM, notes de prototype et décisions RF/énergie.", es: "Esquemas, PCB, BOM, notas de prototipo y decisiones RF/energía.", it: "Schemi, PCB, BOM, note prototipo e decisioni RF/energia.", ar: "مخططات، PCB، BOM، ملاحظات النموذج الأولي، وقرارات RF والطاقة.", ja: "回路図、PCB、BOM、試作メモ、RF と電源に関する判断。" }
  },
  {
    title: { en: "Firmware package", tr: "Firmware paketi", de: "Firmware-Paket", fr: "Dossier du firmware", es: "Paquete de firmware", it: "Pacchetto firmware", ar: "حزمة البرمجيات الثابتة", ja: "ファームウェアパッケージ" },
    description: { en: "Firmware source, drivers, protocol logic, OTA and low-power behavior.", tr: "Firmware kaynak kodu, sürücüler, protokol mantığı, OTA ve düşük güç çalışma özellikleri.", de: "Firmware-Quellcode, Treiber, Protokolllogik, OTA und energiesparender Betrieb.", fr: "Code source du firmware, pilotes, logique des protocoles, OTA et fonctionnement basse consommation.", es: "Código fuente del firmware, controladores, lógica de protocolos, OTA y funcionamiento de bajo consumo.", it: "Codice sorgente del firmware, driver, logica dei protocolli, OTA e funzionamento a basso consumo.", ar: "كود مصدر البرمجيات الثابتة وبرامج التشغيل ومنطق البروتوكولات والتحديث عن بُعد وآليات خفض استهلاك الطاقة.", ja: "ファームウェアソース、ドライバー、プロトコル制御、OTA、低消費電力動作。" }
  },
  {
    title: { en: "Platform package", tr: "Platform paketi", de: "Plattform-Paket", fr: "Dossier plateforme", es: "Paquete de plataforma", it: "Pacchetto piattaforma", ar: "حزمة المنصة", ja: "プラットフォームパッケージ" },
    description: { en: "API contracts, WebSocket events, PostgreSQL schema, auth and reporting flow.", tr: "API sözleşmeleri, WebSocket olayları, PostgreSQL şeması, kimlik doğrulama ve raporlama akışı.", de: "API-Spezifikationen, WebSocket-Ereignisse, PostgreSQL-Schema, Authentifizierung und Berichtsabläufe.", fr: "Spécifications des API, événements WebSocket, schéma PostgreSQL, authentification et parcours de reporting.", es: "Especificaciones de API, eventos WebSocket, esquema PostgreSQL, autenticación y flujo de informes.", it: "Specifiche API, eventi WebSocket, schema PostgreSQL, autenticazione e flusso dei report.", ar: "مواصفات الواجهات البرمجية وأحداث WebSocket ومخطط PostgreSQL والمصادقة ومسار التقارير.", ja: "API仕様、WebSocketイベント、PostgreSQLスキーマ、認証、レポート処理の流れ。" }
  },
  {
    title: { en: "Interface package", tr: "Arayüz paketi", de: "Interface-Paket", fr: "Dossier interface", es: "Paquete de interfaz", it: "Pacchetto interfaccia", ar: "حزمة الواجهة", ja: "インターフェースパッケージ" },
    description: { en: "Dashboard, admin panel, mobile app, roles, alerts and operator workflows.", tr: "Gösterge paneli, yönetim paneli, mobil uygulama, roller, uyarılar ve operatör iş akışları.", de: "Übersichtsseite, Verwaltungsoberfläche, mobile App, Rollen, Alarme und Bedienabläufe.", fr: "Tableau de bord, interface d’administration, application mobile, rôles, alertes et parcours opérateur.", es: "Panel de control, panel de administración, aplicación móvil, roles, alertas y flujos de operación.", it: "Cruscotto, pannello di amministrazione, app mobile, ruoli, avvisi e flussi operativi.", ar: "لوحة متابعة ولوحة إدارة وتطبيق جوال وأدوار وتنبيهات ومسارات عمل للمشغّلين.", ja: "ダッシュボード、管理画面、モバイルアプリ、権限、アラート、運用フロー。" }
  },
  {
    title: { en: "Launch package", tr: "Yayına alma paketi", de: "Einführungspaket", fr: "Dossier de lancement", es: "Paquete de lanzamiento", it: "Pacchetto di lancio", ar: "حزمة الإطلاق", ja: "導入パッケージ" },
    description: { en: "Testing notes, deployment support, documentation and production handoff.", tr: "Test notları, devreye alma desteği, dokümantasyon ve üretim devri.", de: "Testprotokolle, Unterstützung bei der Inbetriebnahme, Dokumentation und Übergabe an die Produktion.", fr: "Notes de test, accompagnement à la mise en service, documentation et transfert en production.", es: "Notas de prueba, apoyo durante la puesta en marcha, documentación y traspaso a producción.", it: "Note di collaudo, supporto alla messa in esercizio, documentazione e passaggio alla produzione.", ar: "ملاحظات الاختبار ودعم التشغيل والوثائق وتسليم المشروع إلى الإنتاج.", ja: "テスト記録、導入支援、ドキュメント、量産への引き渡し。" }
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
    description: { en: "The product is developed across layers without vendor hand-off gaps.", tr: "Ürün, farklı ekipler arasındaki devirlerde bilgi kaybı yaşanmadan uçtan uca geliştirilir.", de: "Das Produkt wird durchgängig entwickelt, ohne Informationsverluste bei der Übergabe zwischen Anbietern.", fr: "Le produit est développé de bout en bout, sans perte d’information lors des transferts entre prestataires.", es: "El producto se desarrolla de principio a fin, sin pérdidas de información entre proveedores.", it: "Il prodotto viene sviluppato dall’inizio alla fine, evitando perdite di informazioni nei passaggi tra fornitori.", ar: "نطوّر المنتج من البداية إلى النهاية دون فقدان المعلومات عند الانتقال بين المورّدين.", ja: "担当会社間の引き継ぎで情報が抜け落ちないよう、製品全体を一貫して開発します。" }
  },
  {
    title: { en: "Validate", tr: "Doğrulama", de: "Validierung", fr: "Validation", es: "Validación", it: "Validazione", ar: "التحقق", ja: "検証" },
    description: { en: "RF, device stability, API reliability, UX and field readiness are tested together.", tr: "RF performansı, cihaz kararlılığı, API güvenilirliği, UX ve saha koşullarına uygunluk birlikte test edilir.", de: "RF-Leistung, Gerätestabilität, API-Zuverlässigkeit, UX und Praxistauglichkeit werden gemeinsam getestet.", fr: "Les performances RF, la stabilité de l’appareil, la fiabilité des API, l’UX et l’aptitude au terrain sont testées ensemble.", es: "El rendimiento de RF, la estabilidad del dispositivo, la fiabilidad de las API, la UX y la preparación para el uso en campo se prueban conjuntamente.", it: "Prestazioni RF, stabilità del dispositivo, affidabilità delle API, UX e idoneità all’uso sul campo vengono verificate insieme.", ar: "نختبر أداء الترددات اللاسلكية واستقرار الجهاز وموثوقية الواجهات البرمجية وتجربة المستخدم والجاهزية للعمل الميداني معًا.", ja: "RF性能、デバイスの安定性、APIの信頼性、UX、現場投入への準備状況をまとめて検証します。" }
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
    tags: layer.tags.map((tag) => (typeof tag === "string" ? tag : tag.en || "")).filter(Boolean),
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
