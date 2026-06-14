#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const LOCALES = ["en", "tr", "de", "fr", "es", "it", "ar", "ja"];
const WP_POSTS_URL = "https://willowsoft.co/wp-json/wp/v2/posts?per_page=100&_embed=1&categories=137";
const WP_ORIGIN = "https://willowsoft.co";

const POST_CONFIG = {
  "willowsoft-is-exhibiting-at-embedded-world-2026": {
    id: "embedded-world-2026",
    slug: "embedded-world-2026",
    category: "event",
    featured: true,
  },
  "willowsoft-launches-uk-operations-in-london": {
    id: "uk-operations",
    slug: "uk-operations",
    category: "company",
    featured: true,
  },
  "mustafa-varank-mugla-teknopark-ziyareti": {
    id: "minister-varank-visit",
    slug: "minister-varank-visit",
    category: "field-update",
    featured: false,
  },
  "willow-software-win-eurasia-2022": {
    id: "win-eurasia",
    slug: "win-eurasia",
    category: "event",
    featured: false,
  },
  "willow-software-bakim-istanbul-2022-sempozyumunda-2": {
    id: "bakim-istanbul-2022",
    slug: "bakim-istanbul-2022",
    category: "event",
    featured: false,
  },
  "willow-software-bipom-turkey-endustri-4-0-fuarinda": {
    id: "industry-4-0-fair-2022",
    slug: "industry-4-0-fair-2022",
    category: "event",
    featured: false,
  },
  "amerikali-firmalarin-mugla-teknoparka-ilgisi-devam-ediyor": {
    id: "american-firms-mugla-teknopark",
    slug: "american-firms-mugla-teknopark",
    category: "field-update",
    featured: false,
  },
  "tubitak-willow-software-workshop": {
    id: "tubitak-workshop",
    slug: "tubitak-workshop",
    category: "workshop",
    featured: false,
  },
  "mugla-teknoparktan-ilk-ihracat-amerikaya": {
    id: "usa-export-mugla-teknopark",
    slug: "usa-export-mugla-teknopark",
    category: "export",
    featured: false,
  },
  "willow-software-faaliyetlerine-basliyor": {
    id: "mugla-teknopark-launch",
    slug: "mugla-teknopark-launch",
    category: "company",
    featured: false,
  },
};

const COPY = {
  "embedded-world-2026": {
    en: {
      title: "WillowSoft is Exhibiting at Embedded World 2026",
      excerpt: "Meet WillowSoft in Nuremberg on 10-12 March 2026 to discuss embedded systems, wireless connectivity and IoT product delivery.",
    },
    tr: {
      title: "WillowSoft Embedded World 2026'da Yer Alıyor",
      excerpt: "WillowSoft ile 10-12 Mart 2026'da Nuremberg'de buluşun; embedded systems, wireless connectivity ve IoT product delivery konularını birlikte konuşalım.",
    },
    de: {
      title: "WillowSoft stellt auf der Embedded World 2026 aus",
      excerpt: "Treffen Sie WillowSoft vom 10. bis 12. Maerz 2026 in Nuernberg, um ueber Embedded Systems, Wireless Connectivity und IoT-Produktlieferung zu sprechen.",
    },
    fr: {
      title: "WillowSoft expose a Embedded World 2026",
      excerpt: "Retrouvez WillowSoft a Nuremberg du 10 au 12 mars 2026 pour echanger sur les systemes embarques, la connectivite sans fil et la livraison de produits IoT.",
    },
    es: {
      title: "WillowSoft expondra en Embedded World 2026",
      excerpt: "Reunase con WillowSoft en Nuremberg del 10 al 12 de marzo de 2026 para hablar sobre sistemas embebidos, conectividad inalambrica y entrega de productos IoT.",
    },
    it: {
      title: "WillowSoft espone a Embedded World 2026",
      excerpt: "Incontra WillowSoft a Norimberga dal 10 al 12 marzo 2026 per parlare di sistemi embedded, connettivita wireless e delivery di prodotti IoT.",
    },
    ar: {
      title: "WillowSoft تشارك في Embedded World 2026",
      excerpt: "التقوا WillowSoft في نورمبرغ بين 10 و12 مارس 2026 لمناقشة الأنظمة المضمنة والاتصال اللاسلكي وتسليم منتجات IoT.",
    },
    ja: {
      title: "WillowSoft、Embedded World 2026 に出展",
      excerpt: "2026年3月10日から12日までニュルンベルクで、組込みシステム、無線接続、IoT製品デリバリーについて WillowSoft とご相談ください。",
    },
  },
  "uk-operations": {
    en: {
      title: "WillowSoft Launches UK Operations in London",
      excerpt: "WillowSoft is expanding to London to support UK and European customers with production-focused embedded and IoT development.",
    },
    tr: {
      title: "WillowSoft Londra'da UK Operasyonlarını Başlattı",
      excerpt: "WillowSoft, UK ve Avrupa müşterilerine production-focused embedded ve IoT development desteği vermek için Londra operasyonlarını başlattı.",
    },
    de: {
      title: "WillowSoft startet UK-Operationen in London",
      excerpt: "WillowSoft expandiert nach London, um Kunden in Grossbritannien und Europa bei produktionsorientierter Embedded- und IoT-Entwicklung zu unterstuetzen.",
    },
    fr: {
      title: "WillowSoft lance ses operations UK a Londres",
      excerpt: "WillowSoft s'implante a Londres afin d'accompagner les clients britanniques et europeens sur le developpement embedded et IoT oriente production.",
    },
    es: {
      title: "WillowSoft inicia operaciones en Reino Unido desde Londres",
      excerpt: "WillowSoft se expande a Londres para apoyar a clientes del Reino Unido y Europa con desarrollo embedded e IoT orientado a produccion.",
    },
    it: {
      title: "WillowSoft avvia le operazioni UK a Londra",
      excerpt: "WillowSoft si espande a Londra per supportare clienti UK ed europei nello sviluppo embedded e IoT orientato alla produzione.",
    },
    ar: {
      title: "WillowSoft تطلق عملياتها في المملكة المتحدة من لندن",
      excerpt: "تتوسع WillowSoft إلى لندن لدعم عملاء المملكة المتحدة وأوروبا في تطوير الأنظمة المضمنة ومنتجات IoT الموجهة للإنتاج.",
    },
    ja: {
      title: "WillowSoft、ロンドンで英国事業を開始",
      excerpt: "WillowSoft はロンドンに拠点を広げ、英国および欧州の顧客に生産志向の組込み・IoT開発を提供します。",
    },
  },
  "minister-varank-visit": {
    en: {
      title: "Showcasing IIoT Innovation During Minister Varank's Visit",
      excerpt: "WillowSoft presented IIoT and embedded technology capabilities during Minister Mustafa Varank's visit to Mugla Teknopark.",
    },
    tr: {
      title: "Bakan Varank Ziyaretinde IIoT İnovasyonu Sergilendi",
      excerpt: "WillowSoft, Bakan Mustafa Varank'ın Muğla Teknopark ziyaretinde IIoT ve embedded technology yeteneklerini sundu.",
    },
    de: {
      title: "IIoT-Innovation beim Besuch von Minister Varank vorgestellt",
      excerpt: "WillowSoft praesentierte beim Besuch von Minister Mustafa Varank im Mugla Teknopark Kompetenzen in IIoT und Embedded Technology.",
    },
    fr: {
      title: "Innovation IIoT presentee lors de la visite du ministre Varank",
      excerpt: "WillowSoft a presente ses capacites IIoT et embedded technology lors de la visite du ministre Mustafa Varank a Mugla Teknopark.",
    },
    es: {
      title: "Innovacion IIoT durante la visita del ministro Varank",
      excerpt: "WillowSoft presento sus capacidades de IIoT y embedded technology durante la visita del ministro Mustafa Varank a Mugla Teknopark.",
    },
    it: {
      title: "Innovazione IIoT durante la visita del ministro Varank",
      excerpt: "WillowSoft ha presentato capacita IIoT ed embedded technology durante la visita del ministro Mustafa Varank a Mugla Teknopark.",
    },
    ar: {
      title: "عرض ابتكارات IIoT خلال زيارة الوزير فارانك",
      excerpt: "قدمت WillowSoft قدراتها في IIoT والتقنيات المضمنة خلال زيارة الوزير مصطفى فارانك إلى Muğla Teknopark.",
    },
    ja: {
      title: "Varank 大臣訪問時に IIoT イノベーションを紹介",
      excerpt: "WillowSoft は Mustafa Varank 大臣の Muğla Teknopark 訪問時に、IIoT と組込み技術の能力を紹介しました。",
    },
  },
  "win-eurasia": {
    en: {
      title: "WillowSoft at WIN EURASIA 2022",
      excerpt: "WillowSoft joined WIN EURASIA 2022 to meet industrial visitors and present IoT, IIoT and smart solution capabilities.",
    },
    tr: {
      title: "WillowSoft WIN EURASIA 2022'de",
      excerpt: "WillowSoft, endüstriyel ziyaretçilerle buluşmak ve IoT, IIoT ve smart solution yeteneklerini sunmak için WIN EURASIA 2022'ye katıldı.",
    },
    de: {
      title: "WillowSoft auf der WIN EURASIA 2022",
      excerpt: "WillowSoft nahm an der WIN EURASIA 2022 teil, um Industriebesucher zu treffen und IoT-, IIoT- und Smart-Solution-Kompetenzen zu zeigen.",
    },
    fr: {
      title: "WillowSoft a WIN EURASIA 2022",
      excerpt: "WillowSoft a participe a WIN EURASIA 2022 pour rencontrer les visiteurs industriels et presenter ses capacites IoT, IIoT et smart solutions.",
    },
    es: {
      title: "WillowSoft en WIN EURASIA 2022",
      excerpt: "WillowSoft participo en WIN EURASIA 2022 para reunirse con visitantes industriales y presentar capacidades IoT, IIoT y smart solutions.",
    },
    it: {
      title: "WillowSoft a WIN EURASIA 2022",
      excerpt: "WillowSoft ha partecipato a WIN EURASIA 2022 per incontrare visitatori industriali e presentare capacita IoT, IIoT e smart solution.",
    },
    ar: {
      title: "WillowSoft في WIN EURASIA 2022",
      excerpt: "شاركت WillowSoft في WIN EURASIA 2022 للقاء زوار القطاع الصناعي وعرض قدراتها في IoT وIIoT والحلول الذكية.",
    },
    ja: {
      title: "WillowSoft、WIN EURASIA 2022 に参加",
      excerpt: "WillowSoft は WIN EURASIA 2022 に参加し、産業分野の来場者に IoT、IIoT、スマートソリューションの能力を紹介しました。",
    },
  },
  "bakim-istanbul-2022": {
    en: {
      title: "WillowSoft Shines at Bakim Istanbul 2022",
      excerpt: "WillowSoft met industry professionals at Bakim Istanbul 2022 and presented LoRaWAN sensors and IIoT solutions.",
    },
    tr: {
      title: "WillowSoft Bakım İstanbul 2022'de Öne Çıktı",
      excerpt: "WillowSoft, Bakım İstanbul 2022'de sektör profesyonelleriyle buluştu ve LoRaWAN sensor ile IIoT çözümlerini sundu.",
    },
    de: {
      title: "WillowSoft ueberzeugt auf der Bakim Istanbul 2022",
      excerpt: "WillowSoft traf auf der Bakim Istanbul 2022 Branchenexperten und stellte LoRaWAN-Sensoren sowie IIoT-Loesungen vor.",
    },
    fr: {
      title: "WillowSoft se distingue a Bakim Istanbul 2022",
      excerpt: "WillowSoft a rencontre des professionnels du secteur a Bakim Istanbul 2022 et presente ses capteurs LoRaWAN et solutions IIoT.",
    },
    es: {
      title: "WillowSoft destaca en Bakim Istanbul 2022",
      excerpt: "WillowSoft se reunio con profesionales del sector en Bakim Istanbul 2022 y presento sensores LoRaWAN y soluciones IIoT.",
    },
    it: {
      title: "WillowSoft si distingue a Bakim Istanbul 2022",
      excerpt: "WillowSoft ha incontrato professionisti del settore a Bakim Istanbul 2022 e presentato sensori LoRaWAN e soluzioni IIoT.",
    },
    ar: {
      title: "WillowSoft تبرز في Bakim Istanbul 2022",
      excerpt: "التقت WillowSoft بمهنيي القطاع في Bakim Istanbul 2022 وعرضت مستشعرات LoRaWAN وحلول IIoT.",
    },
    ja: {
      title: "WillowSoft、Bakim Istanbul 2022 で存在感を発揮",
      excerpt: "WillowSoft は Bakim Istanbul 2022 で業界関係者と交流し、LoRaWAN センサーと IIoT ソリューションを紹介しました。",
    },
  },
  "industry-4-0-fair-2022": {
    en: {
      title: "WillowSoft Showcases LoRaWAN and IIoT at Industry 4.0 Fair 2022",
      excerpt: "WillowSoft demonstrated LoRaWAN, IIoT and smart industrial solutions at the Industry 4.0 Fair in Istanbul.",
    },
    tr: {
      title: "WillowSoft Industry 4.0 Fair 2022'de LoRaWAN ve IIoT Çözümlerini Sergiledi",
      excerpt: "WillowSoft, İstanbul'daki Industry 4.0 Fair'de LoRaWAN, IIoT ve smart industrial solution yeteneklerini gösterdi.",
    },
    de: {
      title: "WillowSoft zeigt LoRaWAN und IIoT auf der Industry 4.0 Fair 2022",
      excerpt: "WillowSoft demonstrierte LoRaWAN, IIoT und smarte Industrieloesungen auf der Industry 4.0 Fair in Istanbul.",
    },
    fr: {
      title: "WillowSoft presente LoRaWAN et IIoT au salon Industry 4.0 2022",
      excerpt: "WillowSoft a demontre LoRaWAN, IIoT et des solutions industrielles intelligentes au salon Industry 4.0 a Istanbul.",
    },
    es: {
      title: "WillowSoft presenta LoRaWAN e IIoT en Industry 4.0 Fair 2022",
      excerpt: "WillowSoft demostro LoRaWAN, IIoT y soluciones industriales inteligentes en la feria Industry 4.0 de Estambul.",
    },
    it: {
      title: "WillowSoft presenta LoRaWAN e IIoT a Industry 4.0 Fair 2022",
      excerpt: "WillowSoft ha dimostrato LoRaWAN, IIoT e soluzioni industriali smart alla fiera Industry 4.0 di Istanbul.",
    },
    ar: {
      title: "WillowSoft تعرض LoRaWAN وIIoT في Industry 4.0 Fair 2022",
      excerpt: "عرضت WillowSoft قدرات LoRaWAN وIIoT والحلول الصناعية الذكية في معرض Industry 4.0 في إسطنبول.",
    },
    ja: {
      title: "WillowSoft、Industry 4.0 Fair 2022 で LoRaWAN と IIoT を紹介",
      excerpt: "WillowSoft はイスタンブールの Industry 4.0 Fair で LoRaWAN、IIoT、スマート産業ソリューションを実演しました。",
    },
  },
  "american-firms-mugla-teknopark": {
    en: {
      title: "American Firms Boost Collaboration with Mugla Teknopark's WillowSoft",
      excerpt: "American technology partners visited Mugla Teknopark to explore collaboration opportunities with WillowSoft around embedded systems and wireless products.",
    },
    tr: {
      title: "Amerikan Firmaları Muğla Teknopark'ta WillowSoft ile İş Birliğini Güçlendirdi",
      excerpt: "Amerikalı teknoloji partnerleri, embedded systems ve wireless products odağında WillowSoft ile iş birliği fırsatlarını görüşmek için Muğla Teknopark'ı ziyaret etti.",
    },
    de: {
      title: "US-Unternehmen staerken die Zusammenarbeit mit WillowSoft im Mugla Teknopark",
      excerpt: "Amerikanische Technologiepartner besuchten den Mugla Teknopark, um Kooperationsmoeglichkeiten mit WillowSoft rund um Embedded Systems und Wireless Products zu pruefen.",
    },
    fr: {
      title: "Des entreprises americaines renforcent leur collaboration avec WillowSoft a Mugla Teknopark",
      excerpt: "Des partenaires technologiques americains ont visite Mugla Teknopark pour explorer des collaborations avec WillowSoft autour des systemes embedded et produits wireless.",
    },
    es: {
      title: "Empresas estadounidenses refuerzan la colaboracion con WillowSoft en Mugla Teknopark",
      excerpt: "Socios tecnologicos estadounidenses visitaron Mugla Teknopark para explorar oportunidades con WillowSoft en embedded systems y wireless products.",
    },
    it: {
      title: "Aziende americane rafforzano la collaborazione con WillowSoft a Mugla Teknopark",
      excerpt: "Partner tecnologici americani hanno visitato Mugla Teknopark per esplorare opportunita con WillowSoft su embedded systems e wireless products.",
    },
    ar: {
      title: "شركات أمريكية تعزز التعاون مع WillowSoft في Muğla Teknopark",
      excerpt: "زار شركاء تقنيون أمريكيون Muğla Teknopark لاستكشاف فرص التعاون مع WillowSoft في الأنظمة المضمنة والمنتجات اللاسلكية.",
    },
    ja: {
      title: "米国企業、Muğla Teknopark の WillowSoft との連携を強化",
      excerpt: "米国の技術パートナーが Muğla Teknopark を訪問し、組込みシステムと無線製品に関する WillowSoft との協業機会を検討しました。",
    },
  },
  "tubitak-workshop": {
    en: {
      title: "TUBITAK - WillowSoft Workshop",
      excerpt: "WillowSoft partnered with TUBITAK to deliver a LoRaWAN end-node design and training workshop for embedded connectivity teams.",
    },
    tr: {
      title: "TÜBİTAK - WillowSoft Workshop",
      excerpt: "WillowSoft, embedded connectivity ekipleri için LoRaWAN end-node design ve training workshop düzenlemek üzere TÜBİTAK ile çalıştı.",
    },
    de: {
      title: "TUBITAK - WillowSoft Workshop",
      excerpt: "WillowSoft arbeitete mit TUBITAK zusammen, um einen Workshop zu LoRaWAN-End-Node-Design und Training fuer Embedded-Connectivity-Teams durchzufuehren.",
    },
    fr: {
      title: "Workshop TUBITAK - WillowSoft",
      excerpt: "WillowSoft s'est associe a TUBITAK pour organiser un workshop de design et formation LoRaWAN end-node pour les equipes embedded connectivity.",
    },
    es: {
      title: "Workshop TUBITAK - WillowSoft",
      excerpt: "WillowSoft colaboro con TUBITAK para impartir un workshop de diseno LoRaWAN end-node y formacion para equipos de embedded connectivity.",
    },
    it: {
      title: "Workshop TUBITAK - WillowSoft",
      excerpt: "WillowSoft ha collaborato con TUBITAK per erogare un workshop di LoRaWAN end-node design e training per team di embedded connectivity.",
    },
    ar: {
      title: "ورشة TUBITAK - WillowSoft",
      excerpt: "تعاونت WillowSoft مع TUBITAK لتقديم ورشة تصميم وتدريب LoRaWAN end-node لفرق الاتصال المضمن.",
    },
    ja: {
      title: "TUBITAK - WillowSoft ワークショップ",
      excerpt: "WillowSoft は TUBITAK と連携し、組込み接続チーム向けに LoRaWAN end-node design と training workshop を実施しました。",
    },
  },
  "usa-export-mugla-teknopark": {
    en: {
      title: "WillowSoft's USA Export Marks Mugla Teknopark's First Milestone",
      excerpt: "WillowSoft completed a high-tech export to the United States, marking an important milestone for Mugla Teknopark.",
    },
    tr: {
      title: "WillowSoft'un ABD İhracatı Muğla Teknopark İçin İlk Dönüm Noktası Oldu",
      excerpt: "WillowSoft'un Amerika Birleşik Devletleri'ne gerçekleştirdiği yüksek teknoloji ihracatı, Muğla Teknopark için önemli bir dönüm noktası oldu.",
    },
    de: {
      title: "WillowSofts USA-Export markiert einen Meilenstein fuer Mugla Teknopark",
      excerpt: "WillowSoft schloss einen Hightech-Export in die USA ab und setzte damit einen wichtigen Meilenstein fuer Mugla Teknopark.",
    },
    fr: {
      title: "L'export USA de WillowSoft marque un jalon pour Mugla Teknopark",
      excerpt: "WillowSoft a realise un export high-tech vers les Etats-Unis, marquant une etape importante pour Mugla Teknopark.",
    },
    es: {
      title: "La exportacion de WillowSoft a EE. UU. marca un hito para Mugla Teknopark",
      excerpt: "WillowSoft completo una exportacion de alta tecnologia a Estados Unidos, un hito importante para Mugla Teknopark.",
    },
    it: {
      title: "L'export USA di WillowSoft segna un traguardo per Mugla Teknopark",
      excerpt: "WillowSoft ha completato un export high-tech verso gli Stati Uniti, segnando un traguardo importante per Mugla Teknopark.",
    },
    ar: {
      title: "تصدير WillowSoft إلى الولايات المتحدة يمثل محطة مهمة لـ Muğla Teknopark",
      excerpt: "أكملت WillowSoft تصديراً عالي التقنية إلى الولايات المتحدة، مسجلة محطة مهمة لـ Muğla Teknopark.",
    },
    ja: {
      title: "WillowSoft の米国輸出、Muğla Teknopark の重要な節目に",
      excerpt: "WillowSoft は米国向けのハイテク輸出を完了し、Muğla Teknopark にとって重要な節目となりました。",
    },
  },
  "mugla-teknopark-launch": {
    en: {
      title: "WillowSoft Launches Operations at Mugla Teknopark",
      excerpt: "WillowSoft began operations at Mugla Teknopark, strengthening its work in IoT, electronics and software development.",
    },
    tr: {
      title: "WillowSoft Muğla Teknopark'ta Faaliyetlerine Başladı",
      excerpt: "WillowSoft, IoT, elektronik ve yazılım geliştirme çalışmalarını güçlendirmek üzere Muğla Teknopark'ta faaliyetlerine başladı.",
    },
    de: {
      title: "WillowSoft nimmt den Betrieb im Mugla Teknopark auf",
      excerpt: "WillowSoft startete den Betrieb im Mugla Teknopark und staerkt damit die Arbeit in IoT, Elektronik und Softwareentwicklung.",
    },
    fr: {
      title: "WillowSoft demarre ses operations a Mugla Teknopark",
      excerpt: "WillowSoft a demarre ses operations a Mugla Teknopark, renforcant son travail en IoT, electronique et developpement logiciel.",
    },
    es: {
      title: "WillowSoft inicia operaciones en Mugla Teknopark",
      excerpt: "WillowSoft inicio operaciones en Mugla Teknopark, reforzando su trabajo en IoT, electronica y desarrollo de software.",
    },
    it: {
      title: "WillowSoft avvia le attivita a Mugla Teknopark",
      excerpt: "WillowSoft ha avviato le attivita a Mugla Teknopark, rafforzando il lavoro in IoT, elettronica e sviluppo software.",
    },
    ar: {
      title: "WillowSoft تبدأ عملياتها في Muğla Teknopark",
      excerpt: "بدأت WillowSoft عملياتها في Muğla Teknopark، معززة عملها في IoT والإلكترونيات وتطوير البرمجيات.",
    },
    ja: {
      title: "WillowSoft、Muğla Teknopark で事業を開始",
      excerpt: "WillowSoft は Muğla Teknopark で事業を開始し、IoT、電子機器、ソフトウェア開発の取り組みを強化しました。",
    },
  },
};

const CATEGORY_CONTEXT = {
  event: {
    en: "This event update shows WillowSoft's active presence in industrial technology ecosystems and its focus on field-ready connected products.",
    tr: "Bu etkinlik haberi, WillowSoft'un endüstriyel teknoloji ekosistemlerindeki aktif varlığını ve sahaya hazır bağlı ürün odağını gösterir.",
    de: "Dieses Event-Update zeigt WillowSofts aktive Rolle in industriellen Technologie-Oekosystemen und den Fokus auf feldbereite Connected Products.",
    fr: "Cette actualite evenementielle montre la presence active de WillowSoft dans les ecosystemes industriels et son focus sur les produits connectes prets terrain.",
    es: "Esta actualizacion de evento muestra la presencia activa de WillowSoft en ecosistemas industriales y su foco en productos conectados listos para campo.",
    it: "Questo aggiornamento evento mostra la presenza attiva di WillowSoft negli ecosistemi industriali e il focus su prodotti connessi pronti per il campo.",
    ar: "يوضح هذا الخبر حضور WillowSoft النشط في منظومات التقنية الصناعية وتركيزها على المنتجات المتصلة الجاهزة للميدان.",
    ja: "このイベント更新は、産業技術エコシステムにおける WillowSoft の活動と、現場対応できるコネクテッド製品への注力を示します。",
  },
  company: {
    en: "This company milestone strengthens WillowSoft's operating base and gives customers a clearer partner for long-term product delivery.",
    tr: "Bu şirket dönüm noktası, WillowSoft'un operasyonel zeminini güçlendirir ve müşterilere uzun vadeli ürün teslimi için daha net bir partner sunar.",
    de: "Dieser Unternehmensmeilenstein staerkt WillowSofts operative Basis und gibt Kunden einen klareren Partner fuer langfristige Produktlieferung.",
    fr: "Ce jalon d'entreprise renforce la base operationnelle de WillowSoft et donne aux clients un partenaire plus clair pour la livraison produit long terme.",
    es: "Este hito corporativo fortalece la base operativa de WillowSoft y ofrece a los clientes un socio mas claro para entregas de producto a largo plazo.",
    it: "Questo traguardo aziendale rafforza la base operativa di WillowSoft e offre ai clienti un partner piu chiaro per delivery di prodotto a lungo termine.",
    ar: "تعزز هذه المحطة المؤسسية قاعدة WillowSoft التشغيلية وتمنح العملاء شريكاً أوضح لتسليم المنتجات على المدى الطويل.",
    ja: "この企業マイルストーンは WillowSoft の事業基盤を強化し、長期的な製品デリバリーに向けた明確なパートナー像を示します。",
  },
  "field-update": {
    en: "This field update highlights ecosystem engagement, stakeholder confidence and WillowSoft's ability to present technical capability in real settings.",
    tr: "Bu saha güncellemesi, ekosistem etkileşimini, paydaş güvenini ve WillowSoft'un teknik yetkinliğini gerçek ortamlarda gösterebilme gücünü vurgular.",
    de: "Dieses Field-Update hebt Oekosystem-Engagement, Stakeholder-Vertrauen und WillowSofts Faehigkeit hervor, technische Kompetenz real zu zeigen.",
    fr: "Cette mise a jour terrain souligne l'engagement ecosysteme, la confiance des parties prenantes et la capacite de WillowSoft a presenter ses competences en conditions reelles.",
    es: "Esta actualizacion de campo destaca el compromiso del ecosistema, la confianza de los stakeholders y la capacidad de WillowSoft para mostrar competencia tecnica en entornos reales.",
    it: "Questo aggiornamento sul campo evidenzia engagement dell'ecosistema, fiducia degli stakeholder e capacita di WillowSoft di mostrare competenze tecniche in contesti reali.",
    ar: "يسلط هذا التحديث الميداني الضوء على تفاعل المنظومة وثقة أصحاب المصلحة وقدرة WillowSoft على عرض قدراتها التقنية في بيئات حقيقية.",
    ja: "この現場アップデートは、エコシステムとの関係、ステークホルダーの信頼、実環境で技術力を示す WillowSoft の能力を強調します。",
  },
  workshop: {
    en: "This workshop update demonstrates WillowSoft's training capability and hands-on knowledge transfer for embedded connectivity teams.",
    tr: "Bu workshop haberi, WillowSoft'un eğitim kabiliyetini ve embedded connectivity ekiplerine uygulamalı bilgi aktarımını gösterir.",
    de: "Dieses Workshop-Update zeigt WillowSofts Trainingskompetenz und praxisnahe Wissensvermittlung fuer Embedded-Connectivity-Teams.",
    fr: "Cette actualite workshop demontre la capacite de formation de WillowSoft et le transfert pratique de savoir pour les equipes embedded connectivity.",
    es: "Esta actualizacion de workshop demuestra la capacidad formativa de WillowSoft y la transferencia practica de conocimiento para equipos embedded connectivity.",
    it: "Questo aggiornamento workshop dimostra la capacita formativa di WillowSoft e il trasferimento pratico di conoscenza per team embedded connectivity.",
    ar: "يوضح هذا الخبر قدرة WillowSoft التدريبية ونقل المعرفة العملي لفرق الاتصال المضمن.",
    ja: "このワークショップ更新は、WillowSoft の教育力と組込み接続チームへの実践的な知識移転を示します。",
  },
  export: {
    en: "This export milestone is a market signal: WillowSoft's engineering output can move beyond local delivery and reach international customers.",
    tr: "Bu ihracat dönüm noktası güçlü bir pazar sinyalidir: WillowSoft'un mühendislik çıktısı yerel teslimatın ötesine geçip uluslararası müşterilere ulaşabilir.",
    de: "Dieser Exportmeilenstein ist ein Marktsignal: WillowSofts Engineering-Output kann ueber lokale Lieferung hinaus internationale Kunden erreichen.",
    fr: "Ce jalon export est un signal marche : les livrables engineering de WillowSoft peuvent depasser le local et atteindre des clients internationaux.",
    es: "Este hito de exportacion es una senal de mercado: la ingenieria de WillowSoft puede ir mas alla de la entrega local y llegar a clientes internacionales.",
    it: "Questo traguardo export e un segnale di mercato: l'engineering output di WillowSoft puo superare la delivery locale e raggiungere clienti internazionali.",
    ar: "تمثل محطة التصدير هذه إشارة سوقية: يمكن لمخرجات WillowSoft الهندسية أن تتجاوز التسليم المحلي وتصل إلى عملاء دوليين.",
    ja: "この輸出マイルストーンは市場シグナルです。WillowSoft のエンジニアリング成果は国内提供を越え、国際顧客に届くことを示します。",
  },
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function decodeEntities(value = "") {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#8212;|&mdash;/g, "-")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&ldquo;/g, '"')
    .replace(/&#8221;|&rdquo;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function stripHtml(value = "") {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value = "") {
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

function sanitizeHtml(html = "", fallback = "") {
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<a\b[^>]*href=["'][^"']*\/wp-content\/uploads\/[^"']+["'][^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  clean = clean.replace(/<(\/?)(section|div|article|span|main|header|footer)[^>]*>/gi, "");
  clean = clean.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi, (_m, href) => {
    const safeHref = String(href || "").startsWith("http") ? href : `${WP_ORIGIN}${href}`;
    return `<a href="${escapeHtml(safeHref)}" rel="noopener noreferrer">`;
  });
  clean = clean.replace(/<(p|h2|h3|ul|ol|li|strong|em|br)\b[^>]*>/gi, "<$1>");
  clean = clean.replace(/<\/(p|h2|h3|ul|ol|li|strong|em|a)>/gi, "</$1>");
  clean = clean.replace(/<(?!\/?(?:p|h2|h3|ul|ol|li|strong|em|a|br)\b)[^>]+>/gi, "");
  clean = decodeEntities(clean)
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!stripHtml(clean)) return `<p>${escapeHtml(fallback)}</p>`;
  return clean;
}

function bestSrcFromSrcset(srcset = "") {
  const candidates = srcset
    .split(",")
    .map((part) => {
      const [url, width] = part.trim().split(/\s+/);
      return { url, width: Number(String(width || "").replace(/\D/g, "")) || 0 };
    })
    .filter((item) => item.url);
  candidates.sort((a, b) => b.width - a.width);
  return candidates[0]?.url || "";
}

function extensionFor(url, contentType = "") {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase();
  if (ext) return ext;
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  return ".jpg";
}

function contentTypeFor(ext = "") {
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

function collectContentImages(html = "") {
  const images = [];
  const addImage = (value) => {
    if (!value || value.startsWith("data:")) return;
    const absolute = new URL(value, WP_ORIGIN).href;
    if (!/\/wp-content\/uploads\//i.test(absolute)) return;
    if (/logo|favicon|cropped/i.test(absolute)) return;
    if (!images.includes(absolute)) images.push(absolute);
  };

  for (const match of html.matchAll(/<img[^>]+>/gi)) {
    const tag = match[0];
    const src = tag.match(/\s(?:src|data-src)=["']([^"']+)["']/i)?.[1] || "";
    const srcset = tag.match(/\ssrcset=["']([^"']+)["']/i)?.[1] || "";
    const selected = bestSrcFromSrcset(srcset) || src;
    addImage(selected);
  }

  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']*\/wp-content\/uploads\/[^"']+)["'][^>]*>/gi)) {
    addImage(match[1]);
  }
  return images;
}

function getFeaturedImage(post) {
  return post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
}

function uniqueImages(images) {
  const seen = new Set();
  return images.filter((url) => {
    if (!url) return false;
    const key = url.replace(/-\d+x\d+(?=\.(?:jpe?g|png|webp|gif)$)/i, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function localizedContent(slug, locale, category, englishContent) {
  if (locale === "en") return englishContent;
  const copy = COPY[slug]?.[locale] || COPY[slug]?.en;
  const context = CATEGORY_CONTEXT[category]?.[locale] || CATEGORY_CONTEXT.event[locale];
  return `<p>${escapeHtml(copy.excerpt)}</p>\n<p>${escapeHtml(context)}</p>`;
}

function buildLocalized(slug, category, englishContent) {
  const localized = {};
  for (const locale of LOCALES) {
    const copy = COPY[slug]?.[locale] || COPY[slug]?.en;
    localized[locale] = {
      title: copy.title,
      excerpt: copy.excerpt,
      content: localizedContent(slug, locale, category, englishContent),
    };
  }
  return localized;
}

async function fetchWordpressPosts() {
  const response = await fetch(WP_POSTS_URL, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`WordPress posts fetch failed: ${response.status}`);
  const posts = await response.json();
  return posts
    .filter((post) => POST_CONFIG[post.slug])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function buildNewsItems(posts, imageMap = new Map()) {
  return posts.map((post, index) => {
    const config = POST_CONFIG[post.slug];
    const copy = COPY[config.slug]?.en;
    const sourceContent = sanitizeHtml(post.content?.rendered || "", stripHtml(post.excerpt?.rendered || copy.excerpt));
    const remoteCover = getFeaturedImage(post);
    const remoteImages = uniqueImages([remoteCover, ...collectContentImages(post.content?.rendered || "")]);
    const uploadedImages = remoteImages.map((url) => imageMap.get(url) || url);
    const coverImage = uploadedImages[0] || "";
    const localized = buildLocalized(config.slug, config.category, sourceContent);

    return {
      id: config.id,
      title: copy.title,
      slug: config.slug,
      date: String(post.date || "").slice(0, 10),
      category: config.category,
      image: coverImage,
      images: uploadedImages,
      excerpt: copy.excerpt,
      content: sourceContent,
      featured: Boolean(config.featured),
      sourceUrl: post.link,
      sourceId: post.id,
      sortOrder: index,
      localized,
      remoteImages,
    };
  });
}

async function uploadImage(supabase, supabaseUrl, remoteUrl, storagePath) {
  const response = await fetch(remoteUrl);
  if (!response.ok) throw new Error(`Image download failed (${response.status}): ${remoteUrl}`);
  const contentType = response.headers.get("content-type") || contentTypeFor(path.extname(storagePath));
  const buffer = Buffer.from(await response.arrayBuffer());
  const { error } = await supabase.storage
    .from("assets")
    .upload(storagePath, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Supabase upload failed for ${storagePath}: ${error.message}`);
  return `${supabaseUrl}/storage/v1/object/public/assets/${storagePath}`;
}

async function uploadAllImages(supabase, supabaseUrl, items) {
  const imageMap = new Map();
  for (const item of items) {
    for (const [idx, remoteUrl] of item.remoteImages.entries()) {
      if (imageMap.has(remoteUrl)) continue;
      const ext = extensionFor(remoteUrl);
      const name = idx === 0 ? "cover" : `gallery-${idx}`;
      const storagePath = `news/${item.slug}/${name}${ext}`;
      const publicUrl = await uploadImage(supabase, supabaseUrl, remoteUrl, storagePath);
      imageMap.set(remoteUrl, publicUrl);
      console.log(`  uploaded ${item.slug}/${name}${ext}`);
    }
  }
  return imageMap;
}

function toRow(item) {
  const { localized, remoteImages, ...data } = item;
  return {
    id: item.id,
    slug: item.slug,
    category: item.category,
    date: item.date,
    featured: item.featured,
    sort_order: item.sortOrder,
    data,
    localized,
  };
}

async function replaceNewsCollection(supabase, items) {
  const rows = items.map(toRow);
  const { data: current, error: readError } = await supabase.from("news").select("id");
  if (readError) throw new Error(`Current news read failed: ${readError.message}`);

  const { error: upsertError } = await supabase.from("news").upsert(rows, { onConflict: "id" });
  if (upsertError) throw new Error(`News upsert failed: ${upsertError.message}`);

  const nextIds = new Set(rows.map((row) => row.id));
  const staleIds = (current || []).map((row) => row.id).filter((id) => !nextIds.has(id));
  if (staleIds.length) {
    const { error: deleteError } = await supabase.from("news").delete().in("id", staleIds);
    if (deleteError) throw new Error(`Stale news delete failed: ${deleteError.message}`);
  }
}

function printReport(items, mode) {
  console.log(`WordPress news import ${mode}`);
  console.table(items.map((item) => ({
    id: item.id,
    slug: item.slug,
    date: item.date,
    category: item.category,
    featured: item.featured,
    images: item.images.length,
    cover: item.image ? "yes" : "missing",
  })));
  console.log(`Total: ${items.length} news items`);
}

function findWpImageLeaks(value, prefix = "root", leaks = []) {
  if (typeof value === "string") {
    if (value.includes("willowsoft.co/wp-content")) leaks.push({ path: prefix, value });
    return leaks;
  }
  if (Array.isArray(value)) {
    value.forEach((item, idx) => findWpImageLeaks(item, `${prefix}[${idx}]`, leaks));
    return leaks;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => findWpImageLeaks(item, `${prefix}.${key}`, leaks));
  }
  return leaks;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = process.argv.includes("--dry-run") || !apply;

  loadEnvFile(path.join(rootDir, ".env"));
  loadEnvFile(path.join(rootDir, "astro-app", ".env"));

  const posts = await fetchWordpressPosts();
  if (posts.length !== 10) {
    throw new Error(`Expected 10 WordPress news posts, got ${posts.length}.`);
  }

  const dryItems = buildNewsItems(posts);
  printReport(dryItems, dryRun ? "dry-run" : "apply");
  if (dryRun) return;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing SUPABASE_URL/PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  console.log("Uploading images to Supabase Storage...");
  const imageMap = await uploadAllImages(supabase, supabaseUrl, dryItems);
  const finalItems = buildNewsItems(posts, imageMap);
  const persistedItems = finalItems.map(({ remoteImages, ...item }) => item);
  const leaks = findWpImageLeaks(persistedItems);
  if (leaks.length) {
    console.error("WordPress image URL leaks:", leaks.slice(0, 6));
    throw new Error("Import still contains WordPress image URLs after upload mapping.");
  }

  console.log("Replacing Supabase news collection...");
  await replaceNewsCollection(supabase, finalItems);
  printReport(finalItems, "completed");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
