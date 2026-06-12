import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  const { data: pageContent, error } = await supabase.from('page_content').select('*');
  if (error) throw error;

  const contentMap = {};
  for (const row of pageContent) {
    contentMap[row.page] = row.data;
  }

  const addLabel = (page, key, translations) => {
    if (!contentMap[page]) contentMap[page] = {};
    if (!contentMap[page][key]) {
      contentMap[page][key] = translations;
    } else {
      // merge
      contentMap[page][key] = { ...contentMap[page][key], ...translations };
    }
  };

  // HOME
  const serviceRail = [
    {
      title: { en: "Embedded", tr: "Gömülü Sistemler", de: "Embedded", fr: "Embarqué", es: "Embebido", it: "Embedded", ar: "الأنظمة المدمجة", ja: "組み込み" },
      desc: { en: "Hardware, firmware, RF and low-power architecture.", tr: "Donanım, gömülü yazılım, RF ve düşük güç mimarisi.", de: "Hardware, Firmware, HF und Low-Power-Architektur.", fr: "Matériel, firmware, RF et architecture basse consommation.", es: "Hardware, firmware, RF y arquitectura de bajo consumo.", it: "Hardware, firmware, RF e architettura a basso consumo.", ar: "العتاد والبرامج الثابتة والترددات اللاسلكية وبنية الطاقة المنخفضة.", ja: "ハードウェア、ファームウェア、RF、低消費電力設計。" },
    },
    {
      title: { en: "Platform", tr: "Platform", de: "Plattform", fr: "Plateforme", es: "Plataforma", it: "Piattaforma", ar: "المنصة", ja: "プラットフォーム" },
      desc: { en: "Backend APIs, PostgreSQL, dashboards and admin panels.", tr: "Backend API'ler, PostgreSQL, kontrol panelleri ve yönetim ekranları.", de: "Backend-APIs, PostgreSQL, Dashboards und Admin-Panels.", fr: "API backend, PostgreSQL, tableaux de bord et panneaux d'administration.", es: "APIs de backend, PostgreSQL, paneles de control y administración.", it: "API backend, PostgreSQL, dashboard e pannelli di amministrazione.", ar: "واجهات برمجة خلفية وPostgreSQL ولوحات تحكم وإدارة.", ja: "バックエンドAPI、PostgreSQL、ダッシュボード、管理画面。" },
    },
    {
      title: { en: "Interfaces", tr: "Arayüzler", de: "Schnittstellen", fr: "Interfaces", es: "Interfaces", it: "Interfacce", ar: "الواجهات", ja: "インターフェース" },
      desc: { en: "Mobile apps, web portals and product websites.", tr: "Mobil uygulamalar, web portalları ve ürün siteleri.", de: "Mobile Apps, Webportale und Produkt-Websites.", fr: "Applications mobiles, portails web et sites produits.", es: "Aplicaciones móviles, portales web y sitios de producto.", it: "App mobili, portali web e siti di prodotto.", ar: "تطبيقات الجوال وبوابات الويب ومواقع المنتجات.", ja: "モバイルアプリ、Webポータル、製品サイト。" },
    }
  ];

  const simRail = [
    {
      title: { en: "VR Training", tr: "VR Eğitim", de: "VR-Training", fr: "Formation VR", es: "Capacitación VR", it: "Formazione VR", ar: "تدريب الواقع الافتراضي", ja: "VRトレーニング" },
      desc: { en: "Interactive VR experiences for complex equipment.", tr: "Karmaşık ekipmanlar için etkileşimli VR deneyimleri.", de: "Interaktive VR-Erlebnisse für komplexe Geräte.", fr: "Expériences VR interactives pour des équipements complexes.", es: "Experiencias de VR interactivas para equipos complejos.", it: "Esperienze VR interattive per apparecchiature complesse.", ar: "تجارب واقع افتراضي تفاعلية للمعدات المعقدة.", ja: "複雑な機器の操作を学習するインタラクティブVR体験。" },
    },
    {
      title: { en: "Digital Twins", tr: "Dijital İkizler", de: "Digitale Zwillinge", fr: "Jumeaux numériques", es: "Gemelos digitales", it: "Gemelli digitali", ar: "التوائم الرقمية", ja: "デジタルツイン" },
      desc: { en: "Web-based 3D dashboards for real-time telemetry.", tr: "Gerçek zamanlı telemetri için web tabanlı 3D paneller.", de: "Webbasierte 3D-Dashboards für Echtzeit-Telemetrie.", fr: "Tableaux de bord 3D web pour la télémétrie en temps réel.", es: "Paneles 3D basados en web para telemetría en tiempo real.", it: "Dashboard 3D web per la telemetria in tempo reale.", ar: "لوحات تحكم ثلاثية الأبعاد على الويب للقياس عن بُعد في الوقت الفعلي.", ja: "リアルタイムデータと連動するWebベースの3Dダッシュボード。" },
    }
  ];

  serviceRail.forEach((rail, i) => {
    addLabel('home', `serviceRail_${i}_title`, rail.title);
    addLabel('home', `serviceRail_${i}_desc`, rail.desc);
  });
  simRail.forEach((rail, i) => {
    addLabel('home', `simRail_${i}_title`, rail.title);
    addLabel('home', `simRail_${i}_desc`, rail.desc);
  });
  
  // also the home labels that are NOT in translations
  addLabel('home', 'talkEngineering', { en: "Talk to Engineering", tr: "Mühendislerimizle Görüşün", de: "Mit Engineering sprechen", fr: "Parler à l'ingénierie", es: "Hablar con ingeniería", it: "Parla con il team", ar: "تحدث إلى الهندسة", ja: "技術チームへ相談" });

  // NEWS LABELS
  const newsLabels = {
    backAdmin: { en: "Open Admin", tr: "Yönetici Panelini Aç", de: "Admin öffnen", fr: "Ouvrir l'admin", es: "Abrir admin", it: "Apri admin", ar: "افتح الإدارة", ja: "管理画面を開く" },
    heroAlt: { en: "WillowSoft engineering updates", tr: "WillowSoft mühendislik haberleri", de: "WillowSoft Engineering-Neuigkeiten", fr: "Actualités d'ingénierie WillowSoft", es: "Actualizaciones de ingeniería de WillowSoft", it: "Aggiornamenti tecnici WillowSoft", ar: "تحديثات WillowSoft الهندسية", ja: "WillowSoft エンジニアリングニュース" },
    latestUpdates: { en: "Latest Updates", tr: "Son Güncellemeler", de: "Aktuelle Meldungen", fr: "Dernières actualités", es: "Últimas novedades", it: "Ultimi aggiornamenti", ar: "آخر التحديثات", ja: "最新情報" },
    proofTitle: { en: "Proof that WillowSoft is active in the field.", tr: "WillowSoft'un sahada aktif olduğunu gösteren kanıtlar.", de: "Nachweise, dass WillowSoft im Feld aktiv ist.", fr: "La preuve que WillowSoft est actif sur le terrain.", es: "Pruebas de que WillowSoft está activo sobre el terreno.", it: "Prove concrete dell'attività di WillowSoft sul campo.", ar: "دليل على أن WillowSoft نشطة في الميدان.", ja: "WillowSoft が現場で活動していることを示す実績。" },
    ctaEyebrow: { en: "Turn proof into pipeline", tr: "Kanıtı fırsat akışına dönüştür", de: "Nachweise in Anfragen verwandeln", fr: "Transformer la preuve en opportunités", es: "Convertir pruebas en oportunidades", it: "Trasforma le prove in opportunità", ar: "حوّل الدليل إلى فرص", ja: "実績を商談につなげる" },
    ctaTitle: { en: "Use news, events and product launches to drive qualified leads.", tr: "Haberleri, etkinlikleri ve ürün lansmanlarını nitelikli taleplere dönüştürün.", de: "Nutzen Sie News, Events und Produktstarts für qualifizierte Anfragen.", fr: "Utilisez les actualités, événements et lancements produits pour générer des prospects qualifiés.", es: "Use noticias, eventos y lanzamientos de producto para generar clientes potenciales cualificados.", it: "Usa notizie, eventi e lanci di prodotto per generare lead qualificati.", ar: "استخدم الأخبار والفعاليات وإطلاق المنتجات لجذب عملاء محتملين مؤهلين.", ja: "ニュース、イベント、製品発表を有望な問い合わせにつなげます。" },
    ctaLead: { en: "The admin panel can add new news items without touching code. Featured updates can later be surfaced on Home and Company pages.", tr: "Yönetici paneli kod yazmadan yeni haber ekleyebilir. Öne çıkan güncellemeler daha sonra Ana Sayfa ve Şirket sayfalarında gösterilebilir.", de: "Über das Admin-Panel lassen sich neue Meldungen ohne Codeänderung hinzufügen. Ausgewählte Updates können später auf Startseite und Unternehmensseite erscheinen.", fr: "Le panneau d'administration permet d'ajouter des actualités sans modifier le code. Les mises à jour importantes peuvent ensuite apparaître sur les pages Accueil et Entreprise.", es: "El panel de administración permite añadir noticias sin tocar código. Las novedades destacadas pueden mostrarse después en Inicio y Empresa.", it: "Il pannello admin permette di aggiungere news senza modificare il codice. Gli aggiornamenti in evidenza possono poi comparire in Home e nella pagina Azienda.", ar: "يمكن للوحة الإدارة إضافة أخبار جديدة دون تعديل الكود. ويمكن لاحقاً عرض التحديثات المميزة في الصفحة الرئيسية وصفحة الشركة.", ja: "管理画面からコードを触らずにニュースを追加できます。重要な更新は後でホームや会社情報ページにも表示できます。" }
  };
  Object.entries(newsLabels).forEach(([k, v]) => addLabel('news', k, v));

  // START PROJECT LABELS
  const spLabels = {
    talkToEngineering: { en: "Talk to Engineering", tr: "Mühendislerimizle Görüşün", de: "Mit Engineering sprechen", fr: "Parler à l'ingénierie", es: "Hablar con ingeniería", it: "Parla con il team", ar: "تحدث إلى الهندسة", ja: "技術チームへ相談" },
    bookMeeting: { en: "Book a technical meeting", tr: "Teknik bir toplantı planlayın", de: "Technisches Meeting buchen", fr: "Réserver une réunion technique", es: "Agendar reunión técnica", it: "Prenota un incontro tecnico", ar: "احجز اجتماعًا فنيًا", ja: "技術ミーティングを予約" },
    meetingLead: { en: "If your project requires extensive hardware design or complex backend integrations, it's best to start with a technical scoping call.", tr: "Projeniz kapsamlı donanım tasarımı veya karmaşık arka uç entegrasyonları gerektiriyorsa, teknik bir değerlendirme görüşmesi ile başlamak en iyisidir.", de: "Wenn Ihr Projekt umfangreiches Hardware-Design oder komplexe Backend-Integrationen erfordert, beginnen wir am besten mit einem technischen Scoping-Gespräch.", fr: "Si votre projet nécessite une conception matérielle approfondie ou des intégrations backend complexes, il est préférable de commencer par un appel de définition technique.", es: "Si su proyecto requiere un diseño de hardware extenso o integraciones de backend complejas, es mejor comenzar con una llamada de evaluación técnica.", it: "Se il tuo progetto richiede una progettazione hardware approfondita o integrazioni backend complesse, è meglio iniziare con una chiamata di definizione tecnica.", ar: "إذا كان مشروعك يتطلب تصميمًا مكثفًا للأجهزة أو تكاملات خلفية معقدة، فمن الأفضل أن تبدأ بمكالمة تحديد النطاق الفني.", ja: "複雑なハードウェア設計やバックエンド統合が必要な場合は、技術要件をすり合わせるオンラインミーティングから始めることをお勧めします。" },
    scheduleMeeting: { en: "Schedule Meeting", tr: "Toplantı Planla", de: "Meeting planen", fr: "Planifier une réunion", es: "Agendar reunión", it: "Pianifica incontro", ar: "جدولة اجتماع", ja: "ミーティングを予約" },
    startDesc: { en: "Select your project phase and core requirements. A WillowSoft engineer will review the details and provide a technical roadmap and budget estimate within 48 hours.", tr: "Proje aşamanızı ve temel gereksinimlerinizi seçin. Bir WillowSoft mühendisi detayları inceleyecek ve 48 saat içinde size teknik bir yol haritası ile bütçe tahmini sunacaktır.", de: "Wählen Sie Ihre Projektphase und Kernanforderungen. Ein WillowSoft-Ingenieur prüft die Details und liefert innerhalb von 48 Stunden eine technische Roadmap sowie eine Budgetschätzung.", fr: "Sélectionnez la phase de votre projet et vos exigences de base. Un ingénieur WillowSoft examinera les détails et fournira une feuille de route technique et une estimation budgétaire sous 48 heures.", es: "Seleccione la fase de su proyecto y los requisitos principales. Un ingeniero de WillowSoft revisará los detalles y proporcionará una hoja de ruta técnica y un presupuesto estimado en 48 horas.", it: "Seleziona la fase del progetto e i requisiti principali. Un ingegnere WillowSoft esaminerà i dettagli e fornirà una roadmap tecnica e un preventivo di budget entro 48 ore.", ar: "حدد مرحلة مشروعك والمتطلبات الأساسية. سيقوم مهندس من WillowSoft بمراجعة التفاصيل وتقديم خارطة طريق فنية وتقدير للميزانية خلال 48 ساعة.", ja: "現在のプロジェクトフェーズと主な要件を選択してください。WillowSoftのエンジニアが内容を確認し、48時間以内に技術的なロードマップと概算お見積りをご提案します。" },
    step1: { en: "Step 1: The Context", tr: "Adım 1: Bağlam", de: "Schritt 1: Der Kontext", fr: "Étape 1 : Le contexte", es: "Paso 1: El contexto", it: "Passo 1: Il contesto", ar: "الخطوة 1: السياق", ja: "ステップ1：プロジェクトの背景" },
    step1Desc: { en: "Tell us about the company and the problem you are solving.", tr: "Bize şirketinizden ve çözdüğünüz problemden bahsedin.", de: "Erzählen Sie uns über Ihr Unternehmen und das Problem, das Sie lösen.", fr: "Parlez-nous de l'entreprise et du problème que vous résolvez.", es: "Cuéntenos sobre la empresa y el problema que está resolviendo.", it: "Parlaci dell'azienda e del problema che stai risolvendo.", ar: "أخبرنا عن الشركة والمشكلة التي تحلها.", ja: "会社情報と、解決したい課題について教えてください。" },
    step2: { en: "Step 2: The Stack", tr: "Adım 2: Mimari", de: "Schritt 2: Der Stack", fr: "Étape 2 : L'architecture", es: "Paso 2: La arquitectura", it: "Passo 2: Lo stack", ar: "الخطوة 2: البنية", ja: "ステップ2：必要とする技術レイヤー" },
    step2Desc: { en: "What layers of the product do you need WillowSoft to build?", tr: "Ürünün hangi katmanlarını WillowSoft'un oluşturmasına ihtiyacınız var?", de: "Welche Schichten des Produkts soll WillowSoft entwickeln?", fr: "Quelles couches du produit WillowSoft doit-elle construire ?", es: "¿Qué capas del producto necesita que WillowSoft construya?", it: "Quali livelli del prodotto vuoi che WillowSoft sviluppi?", ar: "ما هي طبقات المنتج التي تحتاج من WillowSoft بنائها؟", ja: "WillowSoftに開発を依頼したいレイヤーを選択してください。" },
    step3: { en: "Step 3: Timeline & Budget", tr: "Adım 3: Zaman Çizelgesi ve Bütçe", de: "Schritt 3: Zeitplan & Budget", fr: "Étape 3 : Calendrier et budget", es: "Paso 3: Cronograma y presupuesto", it: "Passo 3: Tempistiche e budget", ar: "الخطوة 3: الجدول الزمني والميزانية", ja: "ステップ3：スケジュールと予算" },
    step3Desc: { en: "Provide constraints so we can propose realistic architecture.", tr: "Gerçekçi bir mimari önerebilmemiz için sınırlarınızı belirtin.", de: "Nennen Sie uns Einschränkungen, damit wir eine realistische Architektur vorschlagen können.", fr: "Indiquez les contraintes pour que nous puissions proposer une architecture réaliste.", es: "Proporcione las limitaciones para que podamos proponer una arquitectura realista.", it: "Fornisci dei vincoli per permetterci di proporre un'architettura realistica.", ar: "قدم لنا القيود حتى نتمكن من اقتراح بنية واقعية.", ja: "現実的なシステム構成をご提案するため、制約条件（納期や予算感）をお知らせください。" }
  };
  Object.entries(spLabels).forEach(([k, v]) => addLabel('startProject', k, v));

  const spSteps = [
    { title: { en: "Project Definition", tr: "Proje Tanımı", de: "Projektdefinition", fr: "Définition du projet", es: "Definición del proyecto", it: "Definizione del progetto", ar: "تعريف المشروع", ja: "要件定義" } },
    { title: { en: "Technical Architecture", tr: "Teknik Mimari", de: "Technische Architektur", fr: "Architecture technique", es: "Arquitectura técnica", it: "Architettura tecnica", ar: "البنية الفنية", ja: "基本・詳細設計" } },
    { title: { en: "Timeline & Budget", tr: "Zaman ve Bütçe", de: "Zeitplan & Budget", fr: "Calendrier et budget", es: "Cronograma y presupuesto", it: "Tempistiche e budget", ar: "الجدول الزمني والميزانية", ja: "スケジュール・予算" } },
    { title: { en: "Review & Send", tr: "İncele ve Gönder", de: "Prüfen & Senden", fr: "Vérifier et envoyer", es: "Revisar y enviar", it: "Rivedi e invia", ar: "مراجعة وإرسال", ja: "確認・送信" } }
  ];
  spSteps.forEach((step, i) => {
    addLabel('startProject', `step_${i}_title`, step.title);
  });

  const spTypes = [
    {
      id: "hardware",
      icon: "cpu",
      title: { en: "Hardware Device", tr: "Donanım Cihazı", de: "Hardware-Gerät", fr: "Appareil matériel", es: "Dispositivo de hardware", it: "Dispositivo hardware", ar: "جهاز عتاد", ja: "ハードウェアデバイス" },
      desc: { en: "PCB design, sensor integration, battery optimization.", tr: "PCB tasarımı, sensör entegrasyonu, pil optimizasyonu.", de: "PCB-Design, Sensorintegration, Batterieoptimierung.", fr: "Conception de PCB, intégration de capteurs, optimisation de batterie.", es: "Diseño de PCB, integración de sensores, optimización de batería.", it: "Progettazione PCB, integrazione sensori, ottimizzazione batteria.", ar: "تصميم ثنائي الفينيل متعدد الكلور ، تكامل المستشعر ، تحسين البطارية.", ja: "基板設計、センサー統合、バッテリー最適化。" }
    },
    {
      id: "cloud",
      icon: "server",
      title: { en: "Cloud Backend", tr: "Bulut Backend", de: "Cloud-Backend", fr: "Backend Cloud", es: "Backend en la nube", it: "Backend Cloud", ar: "الخلفية السحابية", ja: "クラウドバックエンド" },
      desc: { en: "PostgreSQL, API development, telemetry ingestion.", tr: "PostgreSQL, API geliştirme, telemetri alımı.", de: "PostgreSQL, API-Entwicklung, Telemetrieerfassung.", fr: "PostgreSQL, développement d'API, ingestion de télémétrie.", es: "PostgreSQL, desarrollo de API, ingesta de telemetría.", it: "PostgreSQL, sviluppo API, acquisizione telemetria.", ar: "تطوير واجهة برمجة التطبيقات، PostgreSQL، استيعاب القياس عن بُعد.", ja: "PostgreSQL、API開発、テレメトリ収集。" }
    },
    {
      id: "app",
      icon: "smartphone",
      title: { en: "Mobile/Web App", tr: "Mobil/Web Uygulaması", de: "Mobile/Web-App", fr: "Application mobile/web", es: "Aplicación móvil/web", it: "App mobile/web", ar: "تطبيق جوال/ويب", ja: "モバイル/Webアプリ" },
      desc: { en: "Operator dashboards, user interfaces, control panels.", tr: "Operatör panelleri, kullanıcı arayüzleri, kontrol panelleri.", de: "Operator-Dashboards, Benutzeroberflächen, Bedienfelder.", fr: "Tableaux de bord opérateurs, interfaces utilisateur, panneaux de contrôle.", es: "Paneles de operador, interfaces de usuario, paneles de control.", it: "Dashboard operatori, interfacce utente, pannelli di controllo.", ar: "لوحات تحكم المشغلين، واجهات المستخدم، لوحات التحكم.", ja: "オペレーターダッシュボード、ユーザーインターフェース、コントロールパネル。" }
    },
    {
      id: "simulation",
      icon: "vr",
      title: { en: "VR/Simulation", tr: "VR/Simülasyon", de: "VR/Simulation", fr: "VR/Simulation", es: "VR/Simulación", it: "VR/Simulazione", ar: "محاكاة/واقع افتراضي", ja: "VR/シミュレーション" },
      desc: { en: "Digital twins, operator training, 3D visualizations.", tr: "Dijital ikizler, operatör eğitimi, 3D görselleştirmeler.", de: "Digitale Zwillinge, Bedienerschulung, 3D-Visualisierungen.", fr: "Jumeaux numériques, formation des opérateurs, visualisations 3D.", es: "Gemelos digitales, capacitación de operadores, visualizaciones 3D.", it: "Gemelli digitali, formazione operatori, visualizzazioni 3D.", ar: "التوائم الرقمية، تدريب المشغلين، تصورات ثلاثية الأبعاد.", ja: "デジタルツイン、オペレータートレーニング、3Dビジュアライゼーション。" }
    }
  ];
  spTypes.forEach((type, i) => {
    addLabel('startProject', `type_${type.id}_title`, type.title);
    addLabel('startProject', `type_${type.id}_desc`, type.desc);
  });

  for (const page of Object.keys(contentMap)) {
    const { error } = await supabase
      .from('page_content')
      .update({ data: contentMap[page] })
      .eq('page', page);
    if (error) throw error;
  }
  
  console.log("Migration complete!");
}

migrate().catch(console.error);
