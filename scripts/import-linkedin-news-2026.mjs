#!/usr/bin/env node

/**
 * Willow Software LinkedIn gönderilerini haber olarak içe aktarır.
 *
 * Bu script tam CMS sync yapmaz: yalnızca aşağıdaki sabit haber ID'lerini
 * Supabase `news` tablosuna upsert eder ve yerel fallback JSON'una ekler.
 * Çalıştırmadan önce içerik yedeği alınmalıdır.
 *
 * Kullanım:
 *   node --env-file=.env scripts/import-linkedin-news-2026.mjs \
 *     --assets-dir /absolute/path/to/browser-assets --force
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const force = args.includes("--force");
const assetsIndex = args.indexOf("--assets-dir");
const assetsDir = assetsIndex >= 0 ? args[assetsIndex + 1] : "";

if (!force) {
  console.error("Canlı içerik değişikliği için --force gerekli.");
  process.exit(1);
}

if (!assetsDir || !path.isAbsolute(assetsDir) || !fs.existsSync(assetsDir)) {
  console.error("Geçerli bir mutlak --assets-dir yolu gerekli.");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const STORAGE_BUCKET = "assets";
const LINKEDIN_COMPANY_URL = "https://www.linkedin.com/company/willow-software/posts/?feedView=all";

const assetPlans = {
  "metro-station-solutions-2026": [
    ["850dfb7210947dbc", "cover.jpg"],
    ["2ac90adc39624975", "gallery-1.jpg"],
  ],
  "us-customer-visits-2026": [
    ["7f6cc8b9f26595a5", "cover.jpg"],
    ["e188d191babe0f0c", "gallery-1.jpg"],
  ],
  "uc-berkeley-collaboration-2026": [
    ["b1097870a3e25c65", "cover.jpg"],
  ],
  "lorawan-energy-sensor-export-2026": [
    ["26dc9c0f64e48fdf", "cover.jpg"],
    ["b51774ca27c18d7a", "gallery-1.jpg"],
  ],
  "us-customer-production-shipment-2026": [
    ["633f9ff2bee22b7e", "cover.jpg"],
  ],
};

const sourceUrl = (activityId) =>
  `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}/`;

const html = (...paragraphs) => paragraphs.map((p) => `<p>${p}</p>`).join("\n");

const news = [
  {
    id: "metro-station-solutions-2026",
    title: "WillowSoft Ships New Electronics and Software Solutions for Metro Stations",
    slug: "metro-station-solutions-2026",
    date: "2026-08-03",
    category: "Project update",
    excerpt: "New WillowSoft products have been shipped for installation at metro stations, supporting smarter and more connected public transportation.",
    content: html(
      "WillowSoft has completed the shipment of a new group of electronics and software products developed for metro-station applications.",
      "The products are moving into the installation phase and will support more connected transportation infrastructure, reliable field operation, and smarter public-transport systems. The delivery reflects WillowSoft’s end-to-end capability across electronics, embedded software, integration, and production-ready product delivery."
    ),
    featured: true,
    sourceUrl: sourceUrl("7490017639008722944"),
    sourceId: "7490017639008722944",
    sourcePlatform: "LinkedIn",
    sortOrder: -70,
    localized: {
      tr: { title: "WillowSoft’tan Metro İstasyonlarına Yeni Elektronik ve Yazılım Çözümleri", category: "Proje Güncellemesi", excerpt: "WillowSoft’un metro istasyonları için geliştirdiği yeni ürünler kurulum amacıyla sevk edildi; daha akıllı ve bağlantılı toplu taşıma altyapılarını destekleyecek.", content: html("WillowSoft, metro istasyonu uygulamaları için geliştirdiği yeni elektronik ve yazılım ürünlerinin sevkiyatını tamamladı.", "Kurulum aşamasına geçen ürünler; bağlantılı ulaşım altyapısını, güvenilir saha operasyonunu ve daha akıllı toplu taşıma sistemlerini destekleyecek. Bu teslimat, WillowSoft’un elektronikten embedded software’e, entegrasyondan üretime hazır ürün teslimine uzanan uçtan uca mühendislik yetkinliğini ortaya koyuyor.") },
      de: { title: "Neue Elektronik- und Softwarelösungen für Metrostationen ausgeliefert", category: "Projekt-Update", excerpt: "WillowSoft hat neue Produkte zur Installation in Metrostationen ausgeliefert und unterstützt damit intelligentere, vernetzte Verkehrssysteme.", content: html("WillowSoft hat eine neue Gruppe von Elektronik- und Softwareprodukten für Metrostationen ausgeliefert.", "Die Produkte gehen nun in die Installationsphase und unterstützen vernetzte Verkehrsinfrastruktur, zuverlässigen Feldbetrieb und intelligentere öffentliche Mobilität.") },
      fr: { title: "WillowSoft livre de nouvelles solutions pour les stations de métro", category: "Projet", excerpt: "De nouveaux produits WillowSoft ont été expédiés pour équiper des stations de métro et soutenir des transports publics plus connectés.", content: html("WillowSoft a achevé l’expédition de nouveaux produits électroniques et logiciels conçus pour les stations de métro.", "Leur installation contribuera à une infrastructure de transport connectée, à des opérations fiables sur le terrain et à des systèmes de mobilité publique plus intelligents.") },
      es: { title: "WillowSoft entrega nuevas soluciones para estaciones de metro", category: "Proyecto", excerpt: "Los nuevos productos de WillowSoft se han enviado para su instalación en estaciones de metro y apoyarán un transporte público más conectado.", content: html("WillowSoft ha completado el envío de nuevos productos electrónicos y de software para estaciones de metro.", "La fase de instalación apoyará infraestructuras conectadas, operaciones de campo fiables y sistemas de transporte público más inteligentes.") },
      it: { title: "WillowSoft consegna nuove soluzioni per le stazioni della metropolitana", category: "Progetto", excerpt: "I nuovi prodotti WillowSoft sono stati spediti per l’installazione nelle stazioni della metropolitana, a supporto di trasporti più connessi.", content: html("WillowSoft ha completato la spedizione di nuovi prodotti elettronici e software progettati per le stazioni della metropolitana.", "L’installazione supporterà infrastrutture connesse, operazioni affidabili sul campo e sistemi di trasporto pubblico più intelligenti.") },
      ar: { title: "WillowSoft تشحن حلولاً إلكترونية وبرمجية جديدة لمحطات المترو", category: "تحديث مشروع", excerpt: "شُحنت منتجات WillowSoft الجديدة لتركيبها في محطات المترو ودعم أنظمة نقل عام أكثر ذكاءً واتصالاً.", content: html("أكملت WillowSoft شحن مجموعة جديدة من المنتجات الإلكترونية والبرمجية المصممة لتطبيقات محطات المترو.", "ستدعم مرحلة التركيب بنية نقل متصلة وعمليات ميدانية موثوقة وأنظمة نقل عام أكثر ذكاءً.") },
      ja: { title: "WillowSoft、地下鉄駅向け電子・ソフトウェア製品を出荷", category: "プロジェクト", excerpt: "地下鉄駅への設置に向けて新製品を出荷し、よりスマートで接続された公共交通を支援します。", content: html("WillowSoft は、地下鉄駅向けに開発した電子機器・ソフトウェア製品の新たな出荷を完了しました。", "設置後は、接続された交通インフラ、信頼性の高い現場運用、よりスマートな公共交通システムを支えます。") },
    },
  },
  {
    id: "uc-berkeley-collaboration-2026",
    title: "WillowSoft Explores Future Collaboration Opportunities at UC Berkeley",
    slug: "uc-berkeley-collaboration-2026",
    date: "2026-07-27",
    category: "Corporate",
    excerpt: "A productive meeting at UC Berkeley focused on future collaboration, innovation and new technology opportunities.",
    content: html(
      "WillowSoft held a productive and inspiring meeting with an esteemed professor at the University of California, Berkeley, Haas School of Business.",
      "The discussion explored future collaboration opportunities, innovation, and the connections that can turn engineering expertise into new technology initiatives. The meeting is part of WillowSoft’s continuing work to build international relationships across academia and industry."
    ),
    featured: true,
    sourceUrl: sourceUrl("7487462052555550720"),
    sourceId: "7487462052555550720",
    sourcePlatform: "LinkedIn",
    sortOrder: -69,
    localized: {
      tr: { title: "WillowSoft, UC Berkeley’de Gelecek İş Birliği Fırsatlarını Görüştü", category: "Kurumsal", excerpt: "UC Berkeley’de gerçekleştirilen verimli görüşmede gelecek iş birlikleri, inovasyon ve yeni teknoloji fırsatları ele alındı.", content: html("WillowSoft, University of California, Berkeley bünyesindeki Haas School of Business’ta değerli bir akademisyenle verimli ve ilham verici bir görüşme gerçekleştirdi.", "Görüşmede gelecekteki iş birliği fırsatları, inovasyon ve mühendislik yetkinliğini yeni teknoloji girişimlerine dönüştürebilecek bağlantılar değerlendirildi. Buluşma, WillowSoft’un akademi ve sanayi arasında uluslararası ilişkiler geliştirme çalışmalarının bir parçası oldu.") },
      de: { title: "WillowSoft erörtert Kooperationschancen an der UC Berkeley", category: "Unternehmen", excerpt: "Ein produktives Treffen an der UC Berkeley drehte sich um künftige Zusammenarbeit, Innovation und neue Technologiechancen.", content: html("WillowSoft traf sich an der Haas School of Business der UC Berkeley mit einem renommierten Professor.", "Im Mittelpunkt standen zukünftige Kooperationen, Innovation und internationale Beziehungen zwischen Wissenschaft und Industrie.") },
      fr: { title: "WillowSoft explore des collaborations futures à UC Berkeley", category: "Entreprise", excerpt: "Une rencontre productive à UC Berkeley a porté sur la collaboration, l’innovation et de nouvelles opportunités technologiques.", content: html("WillowSoft a rencontré un professeur reconnu à la Haas School of Business de l’UC Berkeley.", "Les échanges ont exploré de futures collaborations, l’innovation et les liens internationaux entre le monde académique et l’industrie.") },
      es: { title: "WillowSoft explora futuras colaboraciones en UC Berkeley", category: "Empresa", excerpt: "Una reunión productiva en UC Berkeley abordó la colaboración, la innovación y nuevas oportunidades tecnológicas.", content: html("WillowSoft mantuvo una reunión inspiradora con un prestigioso profesor de la Haas School of Business de UC Berkeley.", "La conversación exploró futuras colaboraciones, innovación y relaciones internacionales entre la academia y la industria.") },
      it: { title: "WillowSoft esplora future collaborazioni a UC Berkeley", category: "Azienda", excerpt: "Un incontro produttivo a UC Berkeley ha riguardato collaborazione, innovazione e nuove opportunità tecnologiche.", content: html("WillowSoft ha incontrato un autorevole professore della Haas School of Business di UC Berkeley.", "Il confronto ha esplorato future collaborazioni, innovazione e relazioni internazionali tra mondo accademico e industria.") },
      ar: { title: "WillowSoft تستكشف فرص تعاون مستقبلية في UC Berkeley", category: "الشركة", excerpt: "تناول اجتماع مثمر في UC Berkeley فرص التعاون والابتكار والتقنيات الجديدة.", content: html("عقدت WillowSoft اجتماعاً مثمراً مع أستاذ مرموق في Haas School of Business بجامعة UC Berkeley.", "بحث الاجتماع فرص التعاون المستقبلية والابتكار وتعزيز الروابط الدولية بين الأوساط الأكاديمية والصناعة.") },
      ja: { title: "WillowSoft、UC Berkeleyで将来の協業機会を協議", category: "会社", excerpt: "UC Berkeleyでの会談では、将来の協業、イノベーション、新たな技術機会について意見交換しました。", content: html("WillowSoft は UC Berkeley Haas School of Business の著名な教授と有意義な会談を行いました。", "将来の協業、イノベーション、学術界と産業界をつなぐ国際的な関係について議論しました。") },
    },
  },
  {
    id: "us-customer-visits-2026",
    title: "WillowSoft Continues Customer Visits Across the United States",
    slug: "us-customer-visits-2026",
    date: "2026-07-24",
    category: "Corporate",
    excerpt: "WillowSoft’s U.S. customer meetings are strengthening partnerships and creating new opportunities for connected-product programs.",
    content: html(
      "WillowSoft continues its customer visits across the United States, meeting partners and teams working on electronics, embedded systems, and IoT programs.",
      "The discussions are helping strengthen existing partnerships, clarify upcoming engineering needs, and identify new opportunities for reliable connected products. Working directly with customers is central to aligning technical scope, production expectations, and long-term delivery."
    ),
    featured: false,
    sourceUrl: sourceUrl("7486553871046209536"),
    sourceId: "7486553871046209536",
    sourcePlatform: "LinkedIn",
    sortOrder: -68,
    localized: {
      tr: { title: "WillowSoft’un ABD’deki Müşteri Ziyaretleri Devam Ediyor", category: "Kurumsal", excerpt: "ABD’de gerçekleştirilen müşteri görüşmeleri, mevcut iş birliklerini güçlendirirken bağlantılı ürün projeleri için yeni fırsatlar oluşturuyor.", content: html("WillowSoft; elektronik, embedded systems ve IoT projeleri üzerinde çalışan müşterileri ve iş ortaklarıyla buluşmak üzere ABD genelindeki ziyaretlerine devam ediyor.", "Görüşmeler mevcut iş birliklerini güçlendiriyor, yaklaşan mühendislik ihtiyaçlarını netleştiriyor ve güvenilir bağlantılı ürünler için yeni fırsatlar ortaya çıkarıyor. Müşterilerle doğrudan çalışmak; teknik kapsamı, üretim beklentilerini ve uzun vadeli teslimatı aynı çizgide buluşturuyor.") },
      de: { title: "WillowSoft setzt Kundenbesuche in den USA fort", category: "Unternehmen", excerpt: "Kundentermine in den USA stärken Partnerschaften und eröffnen neue Chancen für Connected Products.", content: html("WillowSoft besucht weiterhin Kunden und Partner in den USA, die an Elektronik-, Embedded- und IoT-Programmen arbeiten.", "Die Gespräche stärken bestehende Partnerschaften, klären Engineering-Anforderungen und schaffen neue Möglichkeiten für zuverlässige vernetzte Produkte.") },
      fr: { title: "WillowSoft poursuit ses visites clients aux États-Unis", category: "Entreprise", excerpt: "Les rencontres clients aux États-Unis renforcent les partenariats et ouvrent de nouvelles opportunités pour les produits connectés.", content: html("WillowSoft poursuit ses visites auprès de clients et partenaires américains travaillant sur l’électronique, l’embedded et l’IoT.", "Ces échanges renforcent les partenariats, précisent les besoins d’ingénierie et identifient de nouvelles opportunités de produits connectés fiables.") },
      es: { title: "WillowSoft continúa sus visitas a clientes en Estados Unidos", category: "Empresa", excerpt: "Las reuniones en Estados Unidos fortalecen alianzas y crean nuevas oportunidades para productos conectados.", content: html("WillowSoft continúa visitando a clientes y socios de Estados Unidos que trabajan en electrónica, sistemas embebidos e IoT.", "Las conversaciones fortalecen las alianzas, aclaran necesidades de ingeniería y detectan nuevas oportunidades de productos conectados fiables.") },
      it: { title: "WillowSoft prosegue le visite ai clienti negli Stati Uniti", category: "Azienda", excerpt: "Gli incontri negli USA rafforzano le partnership e creano nuove opportunità per i prodotti connessi.", content: html("WillowSoft prosegue le visite a clienti e partner statunitensi impegnati in elettronica, sistemi embedded e IoT.", "Gli incontri rafforzano le partnership, chiariscono le esigenze di engineering e individuano nuove opportunità per prodotti connessi affidabili.") },
      ar: { title: "WillowSoft تواصل زيارات العملاء في الولايات المتحدة", category: "الشركة", excerpt: "تعزز اجتماعات العملاء في الولايات المتحدة الشراكات وتفتح فرصاً جديدة للمنتجات المتصلة.", content: html("تواصل WillowSoft زيارة العملاء والشركاء في الولايات المتحدة العاملين في الإلكترونيات والأنظمة المضمنة وIoT.", "تسهم الاجتماعات في تقوية الشراكات وتوضيح الاحتياجات الهندسية واستكشاف فرص جديدة لمنتجات متصلة موثوقة.") },
      ja: { title: "WillowSoft、米国での顧客訪問を継続", category: "会社", excerpt: "米国での顧客会談を通じてパートナーシップを強化し、コネクテッド製品の新たな機会を開拓しています。", content: html("WillowSoft は、電子機器、組み込みシステム、IoTに取り組む米国の顧客・パートナー訪問を続けています。", "会談を通じて既存の関係を強化し、今後のエンジニアリング要件と新たな製品機会を明確にしています。") },
    },
  },
  {
    id: "engineering-capabilities-2026",
    title: "WillowSoft Highlights End-to-End Embedded Product Engineering Capabilities",
    slug: "engineering-capabilities-2026",
    date: "2026-06-11",
    category: "Expertise",
    image: "assets/og/willowsoft-industrial-iot.jpg",
    images: ["assets/og/willowsoft-industrial-iot.jpg"],
    excerpt: "More than 10 years of engineering experience now spans 15 countries, 50+ clients and 80+ electronics and embedded-product projects.",
    content: html(
      "WillowSoft’s engineering experience now spans more than 10 years, 15 countries, over 50 clients, and more than 80 completed projects.",
      "The team supports the complete product journey: hardware design and PCB layout, embedded firmware, STM32 and ESP32 systems, IoT and gateway integration, LoRa and LoRaWAN applications, prototyping, validation, and production readiness with DFM/DFA considerations. This end-to-end approach helps companies turn early product concepts into scalable and manufacturable electronic systems."
    ),
    featured: false,
    sourceUrl: sourceUrl("7470849038318297090"),
    sourceId: "7470849038318297090",
    sourcePlatform: "LinkedIn",
    sortOrder: -67,
    localized: {
      tr: { title: "WillowSoft’un Uçtan Uca Embedded Ürün Mühendisliği Yetkinliği", category: "Uzmanlık", excerpt: "10 yılı aşkın mühendislik deneyimi; 15 ülke, 50’den fazla müşteri ve 80’den fazla elektronik ve embedded ürün projesine ulaştı.", content: html("WillowSoft’un mühendislik deneyimi 10 yılı, uluslararası çalışma ağı 15 ülkeyi, müşteri portföyü 50 firmayı ve tamamlanan proje sayısı 80’i aştı.", "Ekip; hardware design ve PCB layout, embedded firmware, STM32 ve ESP32 tabanlı sistemler, IoT ve gateway entegrasyonu, LoRa ve LoRaWAN uygulamaları, prototipleme, doğrulama ve DFM/DFA odaklı üretime hazırlık süreçlerinin tamamını destekliyor. Bu uçtan uca yaklaşım, ürün fikirlerinin ölçeklenebilir ve üretilebilir elektronik sistemlere dönüşmesini sağlıyor.") },
      de: { title: "End-to-End-Kompetenz für Embedded-Produktentwicklung", category: "Expertise", excerpt: "Über 10 Jahre Erfahrung umfassen heute 15 Länder, mehr als 50 Kunden und über 80 Projekte.", content: html("WillowSoft blickt auf mehr als 10 Jahre Engineering-Erfahrung in 15 Ländern, bei über 50 Kunden und mehr als 80 Projekten zurück.", "Das Spektrum reicht von Hardware, PCB und Firmware über IoT, LoRaWAN und Integration bis zu Prototyping, Validierung und Produktionsreife.") },
      fr: { title: "Une expertise de bout en bout en ingénierie embedded", category: "Expertise", excerpt: "Plus de 10 ans d’expérience couvrent désormais 15 pays, plus de 50 clients et 80 projets.", content: html("L’expérience de WillowSoft dépasse 10 ans, dans 15 pays, auprès de plus de 50 clients et sur plus de 80 projets.", "L’équipe couvre le hardware, le PCB, le firmware embedded, l’IoT, LoRaWAN, l’intégration, le prototypage, la validation et la préparation à la production.") },
      es: { title: "Ingeniería integral de productos embebidos", category: "Experiencia", excerpt: "Más de 10 años de experiencia abarcan 15 países, más de 50 clientes y 80 proyectos.", content: html("La experiencia de WillowSoft supera los 10 años, 15 países, 50 clientes y 80 proyectos.", "El equipo cubre hardware, PCB, firmware embebido, IoT, LoRaWAN, integración, prototipos, validación y preparación para producción.") },
      it: { title: "Competenze end-to-end nello sviluppo di prodotti embedded", category: "Competenze", excerpt: "Oltre 10 anni di esperienza coprono 15 Paesi, più di 50 clienti e 80 progetti.", content: html("L’esperienza di WillowSoft supera 10 anni, 15 Paesi, 50 clienti e 80 progetti.", "Il team copre hardware, PCB, firmware embedded, IoT, LoRaWAN, integrazione, prototipazione, validazione e preparazione alla produzione.") },
      ar: { title: "خبرة متكاملة في هندسة المنتجات المضمنة", category: "الخبرة", excerpt: "أكثر من 10 سنوات من الخبرة عبر 15 دولة وأكثر من 50 عميلاً و80 مشروعاً.", content: html("تمتد خبرة WillowSoft لأكثر من 10 سنوات و15 دولة وأكثر من 50 عميلاً و80 مشروعاً.", "يغطي الفريق تصميم hardware وPCB وembedded firmware وIoT وLoRaWAN والتكامل والنماذج الأولية والتحقق والاستعداد للإنتاج.") },
      ja: { title: "組み込み製品のエンドツーエンド開発力", category: "技術力", excerpt: "10年以上の経験、15か国、50社超の顧客、80件超のプロジェクト実績。", content: html("WillowSoft の実績は10年以上、15か国、50社以上の顧客、80件以上のプロジェクトに広がっています。", "ハードウェア、PCB、組み込みファームウェア、IoT、LoRaWAN、統合、試作、検証、量産準備まで一貫して支援します。") },
    },
  },
  {
    id: "embedded-world-2026-recap",
    title: "WillowSoft Showcases Embedded Hardware and Software at Embedded World 2026",
    slug: "embedded-world-2026-recap",
    date: "2026-03-11",
    category: "Event",
    image: "pdf-assets/p29_06_X111.jpg",
    images: ["pdf-assets/p29_06_X111.jpg"],
    excerpt: "WillowSoft presented IoT control boards, sensor modules, camera systems and smart displays to visitors in Nuremberg.",
    content: html(
      "WillowSoft joined Embedded World 2026 in Nuremberg to present its latest embedded hardware and software solutions.",
      "Visitors explored IoT control boards, sensor modules, camera systems, smart displays, and the engineering processes behind production-ready connected products. The team thanks everyone who visited the stand and contributed to conversations on upcoming projects and partnerships."
    ),
    featured: false,
    sourceUrl: sourceUrl("7437558457752510464"),
    sourceId: "7437558457752510464",
    sourcePlatform: "LinkedIn",
    sortOrder: -66,
    localized: {
      tr: { title: "WillowSoft, Embedded World 2026’da Yeni Çözümlerini Sergiledi", category: "Etkinlik", excerpt: "WillowSoft; Nürnberg’de IoT kontrol kartları, sensör modülleri, kamera sistemleri ve akıllı ekran çözümlerini ziyaretçilerle buluşturdu.", content: html("WillowSoft, en yeni embedded hardware ve software çözümlerini tanıtmak üzere Nürnberg’de düzenlenen Embedded World 2026’ya katıldı.", "Ziyaretçiler; IoT kontrol kartlarını, sensör modüllerini, kamera sistemlerini, akıllı ekranları ve üretime hazır bağlantılı ürünlerin arkasındaki mühendislik süreçlerini inceleme fırsatı buldu. Ekibimiz, standı ziyaret eden ve yeni projeler ile iş birlikleri üzerine görüşmelere katkı sağlayan herkese teşekkür ediyor.") },
      de: { title: "WillowSoft präsentiert Lösungen auf der Embedded World 2026", category: "Veranstaltung", excerpt: "In Nürnberg präsentierte WillowSoft IoT-Steuerungen, Sensormodule, Kamerasysteme und Smart Displays.", content: html("WillowSoft nahm an der Embedded World 2026 in Nürnberg teil und präsentierte aktuelle Embedded-Hardware- und Softwarelösungen.", "Am Stand wurden IoT-Steuerungen, Sensormodule, Kamerasysteme, Smart Displays und produktionsreife Entwicklungsprozesse vorgestellt.") },
      fr: { title: "WillowSoft présente ses solutions à Embedded World 2026", category: "Événement", excerpt: "À Nuremberg, WillowSoft a présenté des cartes IoT, modules capteurs, systèmes caméra et écrans intelligents.", content: html("WillowSoft a participé à Embedded World 2026 à Nuremberg pour présenter ses solutions hardware et software embedded.", "Les visiteurs ont découvert des cartes de contrôle IoT, des modules capteurs, des systèmes caméra, des écrans intelligents et les processus menant à la production.") },
      es: { title: "WillowSoft presenta sus soluciones en Embedded World 2026", category: "Evento", excerpt: "En Núremberg, WillowSoft presentó tarjetas IoT, módulos de sensores, cámaras y pantallas inteligentes.", content: html("WillowSoft participó en Embedded World 2026 en Núremberg para presentar sus últimas soluciones de hardware y software embebido.", "Los visitantes conocieron tarjetas de control IoT, sensores, cámaras, pantallas inteligentes y procesos de desarrollo orientados a producción.") },
      it: { title: "WillowSoft presenta le sue soluzioni a Embedded World 2026", category: "Evento", excerpt: "A Norimberga, WillowSoft ha presentato schede IoT, moduli sensore, sistemi camera e smart display.", content: html("WillowSoft ha partecipato a Embedded World 2026 a Norimberga con le sue più recenti soluzioni hardware e software embedded.", "I visitatori hanno scoperto schede di controllo IoT, moduli sensore, sistemi camera, smart display e processi orientati alla produzione.") },
      ar: { title: "WillowSoft تعرض حلولها في Embedded World 2026", category: "فعالية", excerpt: "عرضت WillowSoft في نورمبرغ لوحات تحكم IoT ووحدات استشعار وأنظمة كاميرات وشاشات ذكية.", content: html("شاركت WillowSoft في Embedded World 2026 في نورمبرغ لعرض أحدث حلول hardware وsoftware المضمنة.", "اطلع الزوار على لوحات IoT ووحدات الاستشعار وأنظمة الكاميرات والشاشات الذكية وعمليات تطوير المنتجات الجاهزة للإنتاج.") },
      ja: { title: "WillowSoft、Embedded World 2026で最新ソリューションを展示", category: "イベント", excerpt: "ニュルンベルクでIoT制御基板、センサーモジュール、カメラシステム、スマートディスプレイを紹介しました。", content: html("WillowSoft はニュルンベルクの Embedded World 2026 に参加し、最新の組み込みハードウェア・ソフトウェアを展示しました。", "IoT制御基板、センサーモジュール、カメラシステム、スマートディスプレイ、量産対応の開発プロセスを紹介しました。") },
    },
  },
  {
    id: "us-customer-production-shipment-2026",
    title: "New Electronics Production Batch Prepared for Shipment to a U.S. Customer",
    slug: "us-customer-production-shipment-2026",
    date: "2026-02-14",
    category: "Project update",
    excerpt: "WillowSoft completed a new production batch for a U.S. customer, carrying the product from concept through manufacturing readiness.",
    content: html(
      "WillowSoft has completed a new electronics production batch and prepared it for shipment to a customer in the United States.",
      "The delivery represents a complete journey from concept and engineering through validation and production. Attention to precision, reliability, and performance at every stage helps international partners move forward with dependable electronic products."
    ),
    featured: false,
    sourceUrl: sourceUrl("7428395495867191298"),
    sourceId: "7428395495867191298",
    sourcePlatform: "LinkedIn",
    sortOrder: -65,
    localized: {
      tr: { title: "ABD’deki Müşteri İçin Yeni Üretim Partisi Sevkiyata Hazır", category: "Proje Güncellemesi", excerpt: "WillowSoft, ABD’deki bir müşteri için konseptten üretime uzanan süreci tamamlayarak yeni elektronik ürün partisini sevkiyata hazırladı.", content: html("WillowSoft, ABD’deki bir müşteri için yeni elektronik ürün üretim partisini tamamladı ve sevkiyata hazır hale getirdi.", "Teslimat; konsept ve mühendislikten doğrulama ile üretime kadar uzanan bütünsel bir sürecin sonucu. Her aşamada hassasiyet, güvenilirlik ve performansa odaklanılması, uluslararası iş ortaklarının güvenilir elektronik ürünlerle ilerlemesini destekliyor.") },
      de: { title: "Neue Produktionscharge für einen US-Kunden versandbereit", category: "Projekt-Update", excerpt: "WillowSoft hat eine neue Elektronikcharge vom Konzept bis zur Produktionsreife abgeschlossen.", content: html("WillowSoft hat eine neue Elektronik-Produktionscharge für einen Kunden in den USA fertiggestellt.", "Die Lieferung umfasst den Weg von Konzept und Engineering über Validierung bis zur Produktion und legt in jeder Phase Wert auf Präzision und Zuverlässigkeit.") },
      fr: { title: "Un nouveau lot de production prêt pour un client américain", category: "Projet", excerpt: "WillowSoft a finalisé un nouveau lot électronique, du concept jusqu’à la préparation industrielle.", content: html("WillowSoft a achevé un nouveau lot de production électronique destiné à un client aux États-Unis.", "La livraison couvre le parcours complet, du concept et de l’ingénierie à la validation et à la production, avec précision et fiabilité à chaque étape.") },
      es: { title: "Nuevo lote de producción listo para un cliente de Estados Unidos", category: "Proyecto", excerpt: "WillowSoft completó un nuevo lote electrónico desde el concepto hasta la preparación para fabricación.", content: html("WillowSoft ha completado un nuevo lote de producción electrónica para un cliente estadounidense.", "La entrega cubre desde el concepto y la ingeniería hasta la validación y la producción, con precisión y fiabilidad en cada etapa.") },
      it: { title: "Nuovo lotto di produzione pronto per un cliente statunitense", category: "Progetto", excerpt: "WillowSoft ha completato un nuovo lotto elettronico dal concept alla preparazione produttiva.", content: html("WillowSoft ha completato un nuovo lotto di produzione elettronica per un cliente negli Stati Uniti.", "La consegna copre concept, engineering, validazione e produzione, con attenzione a precisione e affidabilità in ogni fase.") },
      ar: { title: "دفعة إنتاج إلكترونية جديدة جاهزة للشحن إلى عميل أمريكي", category: "تحديث مشروع", excerpt: "أكملت WillowSoft دفعة إلكترونية جديدة من الفكرة حتى الجاهزية للتصنيع.", content: html("أكملت WillowSoft دفعة إنتاج إلكترونية جديدة لعميل في الولايات المتحدة وجهزتها للشحن.", "تشمل عملية التسليم الفكرة والهندسة والتحقق والإنتاج مع التركيز على الدقة والموثوقية في كل مرحلة.") },
      ja: { title: "米国顧客向け電子製品の新ロットを出荷準備", category: "プロジェクト", excerpt: "コンセプトから量産準備まで進めた新たな電子製品ロットが完成しました。", content: html("WillowSoft は米国顧客向けの電子製品の新しい生産ロットを完成し、出荷準備を整えました。", "コンセプト、設計、検証、量産までの全工程で精度、信頼性、性能を重視しています。") },
    },
  },
  {
    id: "lorawan-energy-sensor-export-2026",
    title: "WillowSoft Completes First 2026 Export of New LoRaWAN Energy Sensors",
    slug: "lorawan-energy-sensor-export-2026",
    date: "2026-01-27",
    category: "Product update",
    excerpt: "The new CE and CE RED-certified LoRaWAN energy sensor supports three-phase current measurement up to 1000 A and real-time voltage reporting.",
    content: html(
      "WillowSoft completed its first export shipment of 2026 with a new LoRaWAN energy-sensor solution developed for an energy-sector customer.",
      "The device also achieved WillowSoft’s first CE and CE RED certifications of the year. It supports three-phase current measurement from 0 to 1000 A and real-time voltage reporting, enabling reliable remote energy monitoring for industrial and commercial applications."
    ),
    featured: false,
    sourceUrl: sourceUrl("7422060747972673536"),
    sourceId: "7422060747972673536",
    sourcePlatform: "LinkedIn",
    sortOrder: -64,
    localized: {
      tr: { title: "WillowSoft’tan 2026’nın İlk LoRaWAN Enerji Sensörü İhracatı", category: "Ürün Güncellemesi", excerpt: "CE ve CE RED sertifikalı yeni LoRaWAN enerji sensörü, 1000 A’e kadar üç fazlı akım ölçümü ve gerçek zamanlı gerilim raporlaması sunuyor.", content: html("WillowSoft, enerji sektöründeki bir müşteri için geliştirdiği yeni LoRaWAN enerji sensörü çözümüyle 2026 yılının ilk ihracat sevkiyatını tamamladı.", "Cihaz aynı zamanda yılın ilk CE ve CE RED sertifikasyonlarını aldı. 0–1000 A aralığında üç fazlı akım ölçümü ve gerçek zamanlı gerilim raporlaması sunarak endüstriyel ve ticari uygulamalarda güvenilir uzaktan enerji izlemeyi mümkün kılıyor.") },
      de: { title: "Erster LoRaWAN-Energiesensor-Export 2026 abgeschlossen", category: "Produkt-Update", excerpt: "Der CE- und CE-RED-zertifizierte Sensor misst Dreiphasenstrom bis 1000 A und meldet Spannung in Echtzeit.", content: html("WillowSoft hat den ersten Export 2026 mit einer neuen LoRaWAN-Energiesensorlösung abgeschlossen.", "Das CE- und CE-RED-zertifizierte Gerät unterstützt Dreiphasenmessung von 0 bis 1000 A sowie Echtzeit-Spannungsdaten für zuverlässiges Remote Energy Monitoring.") },
      fr: { title: "Premier export 2026 des nouveaux capteurs d’énergie LoRaWAN", category: "Produit", excerpt: "Le capteur certifié CE et CE RED mesure le courant triphasé jusqu’à 1000 A et transmet la tension en temps réel.", content: html("WillowSoft a réalisé son premier export 2026 avec une nouvelle solution de capteur d’énergie LoRaWAN.", "Certifié CE et CE RED, l’appareil mesure le courant triphasé de 0 à 1000 A et transmet la tension en temps réel pour une supervision énergétique fiable.") },
      es: { title: "Primer envío de exportación de sensores de energía LoRaWAN en 2026", category: "Producto", excerpt: "El sensor con certificación CE y CE RED mide corriente trifásica hasta 1000 A y tensión en tiempo real.", content: html("WillowSoft completó su primera exportación de 2026 con una nueva solución de sensor de energía LoRaWAN.", "El dispositivo, certificado CE y CE RED, mide corriente trifásica de 0 a 1000 A y reporta tensión en tiempo real para una monitorización remota fiable.") },
      it: { title: "Primo export 2026 dei nuovi sensori di energia LoRaWAN", category: "Prodotto", excerpt: "Il sensore certificato CE e CE RED misura corrente trifase fino a 1000 A e tensione in tempo reale.", content: html("WillowSoft ha completato il primo export 2026 con una nuova soluzione LoRaWAN per il monitoraggio energetico.", "Il dispositivo certificato CE e CE RED misura corrente trifase da 0 a 1000 A e riporta la tensione in tempo reale per un monitoraggio remoto affidabile.") },
      ar: { title: "أول تصدير في 2026 لمستشعرات الطاقة LoRaWAN الجديدة", category: "تحديث منتج", excerpt: "يدعم المستشعر المعتمد CE وCE RED قياس التيار ثلاثي الطور حتى 1000 أمبير وتقرير الجهد لحظياً.", content: html("أكملت WillowSoft أول شحنة تصدير لعام 2026 باستخدام حل جديد لمستشعر طاقة LoRaWAN.", "يدعم الجهاز المعتمد CE وCE RED قياس التيار ثلاثي الطور من 0 إلى 1000 أمبير وتقرير الجهد في الوقت الفعلي للمراقبة الموثوقة عن بُعد.") },
      ja: { title: "WillowSoft、新型LoRaWAN電力センサーを2026年初輸出", category: "製品", excerpt: "CE・CE RED認証を取得し、最大1000 Aの三相電流測定とリアルタイム電圧報告に対応します。", content: html("WillowSoft は、新しい LoRaWAN 電力センサーで2026年最初の輸出出荷を完了しました。", "CEおよびCE RED認証を取得した本機は、0～1000 Aの三相電流測定とリアルタイム電圧報告に対応し、信頼性の高い遠隔エネルギー監視を実現します。") },
    },
  },
];

const publicUrlFor = (storagePath) =>
  supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;

for (const item of news) {
  const plan = assetPlans[item.id] || [];
  if (!plan.length) continue;

  const uploaded = [];
  for (const [sourceName, targetName] of plan) {
    const sourcePath = path.join(assetsDir, sourceName);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Kaynak görsel bulunamadı: ${sourcePath}`);
    }

    const storagePath = `news/${item.id}/${targetName}`;
    const file = fs.readFileSync(sourcePath);
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { contentType: "image/jpeg", upsert: true });

    if (error) throw new Error(`${storagePath} yükleme hatası: ${error.message}`);
    uploaded.push(publicUrlFor(storagePath));
  }

  item.image = uploaded[0];
  item.images = uploaded;
}

const rows = news.map((item) => {
  const { localized, ...data } = item;
  return {
    id: item.id,
    slug: item.slug,
    category: item.category,
    date: item.date,
    featured: Boolean(item.featured),
    sort_order: item.sortOrder,
    data,
    localized,
  };
});

const { error: upsertError } = await supabase
  .from("news")
  .upsert(rows, { onConflict: "id" });

if (upsertError) throw new Error(`News upsert hatası: ${upsertError.message}`);

const dataPath = path.resolve("data/site-data.json");
const siteData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const newIds = new Set(news.map((item) => item.id));
siteData.news = [
  ...news,
  ...(Array.isArray(siteData.news) ? siteData.news.filter((item) => !newIds.has(item.id)) : []),
];
siteData.meta = {
  ...(siteData.meta || {}),
  updatedAt: new Date().toISOString(),
  linkedinNewsSource: LINKEDIN_COMPANY_URL,
};
fs.writeFileSync(dataPath, `${JSON.stringify(siteData, null, 2)}\n`, "utf8");

const { data: verified, error: verifyError } = await supabase
  .from("news")
  .select("id, slug, date")
  .in("id", [...newIds])
  .order("date", { ascending: false });

if (verifyError) throw new Error(`Doğrulama hatası: ${verifyError.message}`);
if ((verified || []).length !== news.length) {
  throw new Error(`Doğrulama başarısız: ${news.length} yerine ${(verified || []).length} kayıt bulundu.`);
}

console.log(`${news.length} LinkedIn haberi eklendi ve doğrulandı.`);
for (const item of verified) console.log(`  ${item.date}  ${item.id}`);
