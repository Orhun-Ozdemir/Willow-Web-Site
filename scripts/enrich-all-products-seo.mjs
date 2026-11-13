#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDataPath = path.join(__dirname, "..", "data", "site-data.json");
const apply = process.argv.includes("--apply");

const site = JSON.parse(fs.readFileSync(siteDataPath, "utf8"));

// Helper to ensure localized object
function ensureLoc(product, locale) {
  if (!product.localized) product.localized = {};
  if (!product.localized[locale]) product.localized[locale] = {};
  return product.localized[locale];
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. WILLOWAIR (Indoor Air Quality)
// ══════════════════════════════════════════════════════════════════════════════
const air = site.products.find(p => p.id === "willowair");
if (air) {
  air.shortDescription = "LoRaWAN indoor air quality monitoring sensor measuring TVOC, eCO2, ambient temperature, and relative humidity for smart buildings, schools, and HVAC automation.";
  air.description = `The WillowAir (WS-O-X-AI-AQ-1) is an industrial-grade, wireless indoor air quality (IAQ) monitoring sensor designed for smart buildings, schools, commercial offices, hospitals, and HVAC demand-controlled ventilation (DCV) networks over LoRaWAN.

### Comprehensive Multi-Parameter Air Sensing
WillowAir integrates high-precision Metal Oxide Semiconductor (MOS) and Non-Dispersive Infrared (NDIR) sensing arrays to simultaneously monitor Total Volatile Organic Compounds (TVOC from 0 to 60,000 ppb), equivalent Carbon Dioxide (eCO2 from 400 to 5,000 ppm), ambient temperature (-20°C to +60°C), and relative humidity (0% to 100% RH). By continuously analyzing indoor contaminant concentrations, facility managers can optimize fresh air intake, reduce ventilation energy consumption, and maintain compliance with LEED, WELL, and ASHRAE 62.1 indoor air standards.

### Smart Building HVAC Integration & Demand Ventilation
Stale indoor air directly impairs cognitive function, productivity, and health. WillowAir acts as an autonomous wireless edge node that communicates directly with Building Management Systems (BMS) and automated dampers via LoRaWAN. When eCO2 or TVOC levels exceed user-defined health thresholds, WillowAir triggers immediate priority uplinks, instructing air handling units (AHUs) to modulate ventilation without requiring complex, expensive wall conduit rewiring.

### Low-Power Architecture & Long Battery Autonomy
Engineered for indoor aesthetics and zero-maintenance operation, WillowAir is housed in a clean, flame-retardant ABS enclosure designed for wall mounting. Powered by high-capacity internal batteries combined with an ultra-low power microcontroller operating at microamp-level sleep currents, the device delivers 5 to 8 years of continuous operation under standard 10-minute telemetry reporting intervals.

### LoRaWAN Telemetry & Enterprise Cloud Integration
Supporting LoRaWAN 1.0.3/1.1 Class A protocol across EU868, US915, and global regional frequencies, WillowAir penetrates through reinforced concrete floors and office drywall with ease. Uplink payloads are formatted in standard binary structures, with ready-to-deploy JavaScript decoders for ChirpStack, The Things Network (TTN), AWS IoT Core, and Azure IoT Hub.`;

  air.detailBlocks = [
    {
      id: "iaq-measurement",
      icon: "cloud",
      kicker: "SENSOR MECHANICS",
      title: "Multi-Parameter TVOC, eCO2 & Climate Sensing",
      body: "High-stability multi-pixel gas sensor measures volatile organic compounds and CO2 equivalence alongside temperature and humidity with automatic baseline calibration.",
      items: ["TVOC: 0–60,000 ppb dynamic range", "eCO2: 400–5,000 ppm resolution", "Temperature (±0.2°C) & Humidity (±2% RH)"]
    },
    {
      id: "hvac-automation",
      icon: "activity",
      kicker: "SMART VENTILATION",
      title: "BMS & Demand-Controlled HVAC Integration",
      body: "Enables demand-controlled ventilation by communicating room occupancy and air freshness metrics to Building Automation Systems (BAS) to slash HVAC heating/cooling costs.",
      items: ["LEED, WELL & ASHRAE 62.1 compliance", "Zero-cabling wall installation", "Configurable instant threshold alarms"]
    },
    {
      id: "lorawan-connectivity",
      icon: "radio",
      kicker: "WIRELESS PROTOCOL",
      title: "Long-Range LoRaWAN Indoor Telemetry",
      body: "Pioneering Sub-GHz radio propagation penetrates deep concrete walls and multi-story office slabs, connecting reliably to building gateways up to several floors away.",
      items: ["EU868, US915, AU915, AS923 frequency support", "AES-128 end-to-end payload encryption", "ChirpStack, TTN & AWS IoT decoders included"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "BATTERY AUTONOMY",
      title: "5 to 8-Year Maintenance-Free Power Design",
      body: "Advanced power management firmware keeps quiescent current below 2 μA between measurements, ensuring multi-year battery life in commercial installations.",
      items: ["Up to 8 years battery life", "Tool-free battery replacement", "Continuous battery voltage reporting"]
    }
  ];

  air.aiFAQ = [
    {
      question: "How does WillowAir measure eCO2 and TVOC?",
      answer: "WillowAir utilizes calibrated Metal Oxide Semiconductor (MOS) gas sensor arrays that detect volatile organic compounds and calculate equivalent carbon dioxide (eCO2) using advanced algorithmic baseline tracking, eliminating the need for frequent manual recalibration."
    },
    {
      question: "Can WillowAir integrate into our existing Building Management System (BMS)?",
      answer: "Yes. WillowAir transmits standard LoRaWAN telemetry. Data forwarded from your LoRaWAN gateway (via ChirpStack, TTN, or AWS IoT) can be ingested into any BMS, Niagara framework, BACnet gateway, or cloud SCADA via MQTT, REST API, or Webhooks."
    },
    {
      question: "What is the recommended installation height for WillowAir?",
      answer: "For representative human breathing zone monitoring, mount WillowAir on an interior wall approximately 1.2 to 1.8 meters (4 to 6 feet) above the floor, away from direct sunlight, air supply vents, and open windows."
    }
  ];

  // TR Localization
  const trAir = ensureLoc(air, "tr");
  trAir.shortDescription = "Akıllı binalar, ofisler, okullar ve HVAC otomasyonu için TVOC, eCO2, ortam sıcaklığı ve bağıl nem ölçen kablosuz LoRaWAN iç ortam hava kalitesi sensörü.";
  trAir.description = `WillowAir (WS-O-X-AI-AQ-1), akıllı binalar, kurumsal ofisler, okullar, hastaneler ve HVAC talep kontrollü havalandırma (DCV) sistemleri için geliştirilmiş endüstriyel sınıf kablosuz iç ortam hava kalitesi (IAQ) izleme sensörüdür.

### Çok Parametreli Hassas Hava Kalitesi Analizi
WillowAir, gelişmiş Metal Oksit Yarı İletken (MOS) ve NDIR algılama teknolojilerini bir araya getirerek Toplam Uçucu Organik Bileşikleri (TVOC: 0 - 60.000 ppb), eşdeğer Karbondioksit miktarını (eCO2: 400 - 5.000 ppm), ortam sıcaklığını (-20°C ila +60°C) ve bağıl nemi (%0 ila %100 RH) eş zamanlı olarak takip eder. Bina yöneticileri bu veriler sayesinde LEED, WELL ve ASHRAE standartlarına tam uyum sağlarken, taze hava sirkülasyonunu optimize eder.

### Akıllı Bina ve HVAC Otomasyon Entegrasyonu
Havasız ve yüksek CO2 içeren iç mekanlar, çalışanların bilişsel performansını ve sağlığını olumsuz etkiler. WillowAir, ortamdaki hava kalitesi eşik değerleri aşıldığında anında öncelikli alarm paketleri fırlatarak havalandırma santrallerini (klima santralleri / VAV damperleri) devreye sokar. Kablolama gerektirmeyen yapısı, tarihi veya faal binalarda sıfır kırma-dökme ile kurulum avantajı sağlar.

### Düşük Güç Tüketimi ve 8 Yıla Varan Pil Ömrü
Minimalist ve modern duvar tipi kasaya sahip cihaz, ultra düşük uyku akımı çeken işlemcisi ve yüksek kapasiteli dahili lityum pilleri ile 10 dakikalık ölçüm periyotlarında 5 ila 8 yıl boyunca bakım gerektirmeksizin çalışır.

### LoRaWAN İletişimi ve Bulut Entegrasyonu
LoRaWAN 1.0.3/1.1 Class A desteğiyle betonarme katları ve ofis bölmelerini aşarak ağ geçidine (gateway) güvenle bağlanır. Veriler ChirpStack, The Things Network (TTN) veya AWS IoT platformlarına hazır JavaScript decoder'lar üzerinden aktarılır.`;

  trAir.detailBlocks = [
    {
      id: "iaq-measurement",
      icon: "cloud",
      kicker: "ÖLÇÜM PRENSİBİ",
      title: "Çok Parametreli TVOC, eCO2 ve İklim Takibi",
      body: "Otomatik taban çizgisi kalibrasyonuna sahip çok pikselli gaz sensörü, uçucu organik bileşikleri ve karbondioksiti yüksek doğrulukla ölçer.",
      items: ["0–60.000 ppb TVOC aralığı", "400–5.000 ppm eCO2 çözünürlüğü", "Hassas sıcaklık ve bağıl nem kompanzasyonu"]
    },
    {
      id: "hvac-automation",
      icon: "activity",
      kicker: "BİNA OTOMASYONU",
      title: "BMS ve Havalandırma Santrali Entegrasyonu",
      body: "Ortam doluluğu ve hava kirliliği seviyesine göre HVAC sistemlerini dinamik yöneterek enerji maliyetlerini düşürür.",
      items: ["LEED, WELL ve ASHRAE standartlarına uyum", "Sıfır kablolama ile kolay duvar montajı", "Eşik değer aşımında anlık LoRaWAN alarmı"]
    },
    {
      id: "lorawan-connectivity",
      icon: "radio",
      kicker: "KABLOSUZ İLETİŞİM",
      title: "Uzun Menzilli LoRaWAN Bina İçi Yayılımı",
      body: "Sub-GHz frekansında çalışan LoRa radyo mimarisi, çok katlı binalarda ve betonarme duvarlarda kesintisiz iletişim sağlar.",
      items: ["EU868 frekans bandı uyumlu", "AES-128 uçtan uca veri güvenliği", "ChirpStack ve TTN hazır entegrasyonu"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "PİL PERFORMANSI",
      title: "8 Yıla Varan Bakımsız Çalışma Ömrü",
      body: "Mikroamper seviyesindeki derin uyku modu ile ticari binalarda yıllarca pil değişimi gerektirmeden görev yapar.",
      items: ["8 yıla varan saha ömrü", "Aletsiz pil değişim yuvası", "Gerçek zamanlı pil seviyesi telemetrisi"]
    }
  ];

  trAir.aiFAQ = [
    {
      question: "WillowAir eCO2 ve TVOC değerlerini nasıl ölçer?",
      answer: "WillowAir, Metal Oksit Yarı İletken (MOS) sensör dizilimi kullanarak ortamdaki uçucu organik gazları analiz eder ve akıllı taban çizgisi algoritmasıyla eşdeğer CO2 (eCO2) seviyesini hesaplar; böylece manuel kalibrasyon ihtiyacını ortadan kaldırır."
    },
    {
      question: "Sensör mevcut Bina Yönetim Sistemimize (BMS) bağlanabilir mi?",
      answer: "Evet. Cihaz standart LoRaWAN Class A protokolüyle çalışır. LoRaWAN ağ geçidiniz üzerinden ChirpStack, TTN veya MQTT broker aracılığıyla BACnet, Modbus IP veya SCADA sistemlerine doğrudan entegre edilebilir."
    },
    {
      question: "Sensör odada hangi yüksekliğe monte edilmelidir?",
      answer: "İnsan nefes alma seviyesini en doğru şekilde temsil etmesi için cihazın zeminden yaklaşık 1,2 ila 1,8 metre yükseklikte, doğrudan güneş ışığı ve menfez akımından uzak bir iç duvara monte edilmesi önerilir."
    }
  ];

  // DE Localization
  const deAir = ensureLoc(air, "de");
  deAir.shortDescription = "LoRaWAN-Raumluftqualitätssensor zur Messung von TVOC, eCO2, Temperatur und Feuchte für Smart Buildings, Schulen und HVAC-Automatisierung.";
  deAir.description = `Der WillowAir (WS-O-X-AI-AQ-1) ist ein drahtloser LoRaWAN-Sensor für die Überwachung der Raumluftqualität (IAQ) in Smart Buildings, Büros, Bildungseinrichtungen und bedarfsgesteuerten Lüftungsanlagen (DCV).

### Mehrparametrige Raumluftüberwachung
WillowAir kombiniert hochpräzise Metalloxid-Gassensoren (MOS) und Halbleiter-Arrays, um flüchtige organische Verbindungen (TVOC von 0 bis 60.000 ppb), CO2-Äquivalente (eCO2 von 400 bis 5.000 ppm), Umgebungstemperatur (-20°C bis +60°C) und relative Luftfeuchtigkeit (0 bis 100 % rF) kontinuierlich zu erfassen. Facility Manager optimieren damit den Frischluftanteil, senken Lüftungsbetriebskosten und gewährleisten die Einhaltung internationaler Standards wie LEED und WELL.

### HVAC-Automatisierung und Gebäudemanagement
Erhöhte CO2- und TVOC-Werte mindern Konzentration und Wohlbefinden. Bei Überschreiten definierter Grenzwerte sendet WillowAir sofortige Prioritätsmeldungen an das Gebäudeleitsystem (BMS/GLT), um Lüftungsstufen oder Klappen bedarfsgerecht zu steuern. Die drahtlose LoRaWAN-Technologie ermöglicht die Nachrüstung in bestehenden Gebäuden völlig ohne Verkabelungsaufwand.

### Langlebige Batteriearchitektur und Reichweite
Mit einem extrem niedrigen Ruhestrom im Mikroampere-Bereich erreicht WillowAir bei typischen 10-Minuten-Übertragungsintervallen eine Batterielebensdauer von 5 bis 8 Jahren. Die LoRaWAN EU868-Funktechnik durchdringt Stahlbetondecken und Bürotrennwände zuverlässig.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. WILLOWGPS (LoRaWAN Asset Tracker)
// ══════════════════════════════════════════════════════════════════════════════
const gps = site.products.find(p => p.id === "willowgps");
if (gps) {
  gps.shortDescription = "Industrial-grade LoRaWAN GPS asset tracker with 3-axis motion detection, geofencing, and multi-year battery life for fleet, cargo containers, and non-powered industrial equipment.";
  gps.description = `The WillowGPS (WS-O-X-AI-GT-1) is an industrial low-power LoRaWAN asset tracking terminal engineered for non-powered heavy equipment, intermodal shipping containers, commercial vehicle fleets, and logistics infrastructure.

### Multi-Constellation GNSS Precision & Smart Motion Triggering
Equipped with a high-sensitivity multi-constellation GNSS receiver (supporting GPS, GLONASS, Galileo, and BeiDou), WillowGPS achieves rapid Time-to-First-Fix (TTFF) under diverse satellite visibility conditions. Integrated 3-axis MEMS accelerometer firmware intelligently regulates device operational states: while assets are stationary in yards or storage, the device maintains deep microamp sleep; upon movement or vibration detection, it instantly wakes up to calculate positional coordinates and transmit location updates over LoRaWAN.

### Dynamic Geofencing & Anti-Theft Telemetry
WillowGPS supports edge-based and cloud-synchronized geofence thresholding. If an unauthorized movement event occurs outside scheduled operational perimeters or designated site boundaries, the device triggers an immediate high-priority alarm packet. Historical trip data, route velocity, and tilt angles are bundled into compact binary payloads to maximize radio channel efficiency.

### Rugged IP67 Enclosure & Multi-Year Power Architecture
Engineered to withstand heavy vibrations, pressure washing, UV radiation, and sub-zero maritime shipping conditions, the tracker is enclosed in an IP67 waterproof polymer housing. Powered by high-energy industrial lithium cells, WillowGPS delivers 3 to 7 years of field autonomy depending on daily movement cycles and reporting intervals.`;

  gps.detailBlocks = [
    {
      id: "gnss-tracking",
      icon: "compass",
      kicker: "POSITIONING ENGINE",
      title: "Multi-Constellation GNSS & Fast TTFF",
      body: "High-sensitivity receiver processes signals from GPS, GLONASS, Galileo, and BeiDou for accurate positioning even in semi-occluded environments.",
      items: ["2.5 m circular positioning accuracy", "Multi-GNSS concurrent satellite reception", "Integrated high-efficiency patch antenna"]
    },
    {
      id: "motion-intelligence",
      icon: "activity",
      kicker: "SMART TELEMETRY",
      title: "Accelerometer-Driven Adaptive Reporting",
      body: "Onboard 3-axis accelerometer sleeps during stationary periods and switches to real-time periodic tracking upon asset movement.",
      items: ["Instant motion & vibration trigger", "Geofence boundary deviation alarm", "Low duty cycle radio optimization"]
    },
    {
      id: "rugged-hardware",
      icon: "shield",
      kicker: "MECHANICAL INTEGRITY",
      title: "IP67 Weatherproof & Shock-Resistant Casing",
      body: "Sealed enclosure designed to endure harsh maritime container transport, mining environments, pressure washing, and wide temperature swings.",
      items: ["IP67 hermetic sealing", "-40°C to +85°C operating range", "Magnetic or screw-mount mounting kit"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "BATTERY AUTONOMY",
      title: "Multi-Year Autonomous Battery Operation",
      body: "Optimized power architecture consumes less than 3 μA in standby, providing 3 to 7 years of maintenance-free asset visibility in the field.",
      items: ["Field-proven Li-SOCl2 chemistry", "Over-The-Air configurable reporting cadence", "Battery capacity telemetry on every uplink"]
    }
  ];

  gps.aiFAQ = [
    {
      question: "How long does the battery last on the WillowGPS tracker?",
      answer: "With its internal industrial lithium battery and motion-triggered sleep algorithms, WillowGPS achieves 3 to 7 years of autonomy. A typical asset reporting once per day when stationary and every 15 minutes during motion operates for over 5 years."
    },
    {
      question: "Can WillowGPS work inside metal shipping containers?",
      answer: "GNSS satellite signals cannot penetrate solid steel container walls. WillowGPS is designed to be mounted on the container exterior, roof, or chassis using its IP67 housing and magnetic/bolt brackets for unobstructed satellite and LoRaWAN connectivity."
    },
    {
      question: "How are geofence alerts handled?",
      answer: "When movement is detected outside authorized hours or beyond predefined geographical coordinates, WillowGPS immediately transmits an alarm uplink to your LoRaWAN server (ChirpStack, TTN, etc.), which forwards webhooks or SMS alerts to your operations team."
    }
  ];

  // TR Localization
  const trGps = ensureLoc(gps, "tr");
  trGps.shortDescription = "Filo, konteyner, iş makineleri ve sahadaki enerjisiz varlıklar için 3 eksenli hareket algılama ve uzun pil ömrüne sahip endüstriyel LoRaWAN GPS takip modülü.";
  trGps.description = `WillowGPS (WS-O-X-AI-GT-1), şantiyelerdeki enerjisiz iş makineleri, intermodal yük konteynerleri, ticari araç filoları ve lojistik varlıklar için geliştirilmiş endüstriyel düşük güçlü LoRaWAN GPS konum takip cihazıdır.

### Çoklu Uydu (GNSS) Hassasiyeti ve Akıllı Hareket Yönetimi
GPS, GLONASS, Galileo ve BeiDou uydularını eş zamanlı izleyen yüksek duyarlılıklı GNSS alıcısı sayesinde en zorlu açık ve yarı kapalı alanlarda hızlı ilk konum tespiti (TTFF) sağlar. Dahili 3 eksenli MEMS ivmeölçer, cihazın enerji tüketimini akıllıca yönetir: Varlık park halinde hareketsizken cihaz derin uyku modunda mikroamper seviyesinde akım harcar; hareket veya titreşim başladığı anda uyanarak konumu belirler ve LoRaWAN üzerinden iletir.

### Dinamik Coğrafi Sınır (Geofence) ve Hırsızlık Koruması
WillowGPS, şantiye veya tesis sınırları dışına çıkan yetkisiz hareketleri anında tespit eder. Yetki dışı bölgeden çıkış (geofence ihlali) veya mesai dışı sarsıntı algılandığında merkezi izleme paneline anında yüksek öncelikli alarm paketi fırlatır.

### IP67 Zorlu Saha Gövdesi ve Yıllarca Süren Pil Ömrü
Ağır vibrasyon, basınçlı yıkama, UV ışınları ve aşırı soğuk deniz taşımacılığı koşullarına dayanıklı IP67 sızdırmaz polimer gövdeye sahiptir. Yüksek enerjili endüstriyel lityum pilleriyle günlük kullanım sıklığına bağlı olarak 3 ila 7 yıl kesintisiz çalışır.`;

  trGps.detailBlocks = [
    {
      id: "gnss-tracking",
      icon: "compass",
      kicker: "KONUM MOTORU",
      title: "Çoklu GNSS Desteği ve Hızlı Konumlandırma",
      body: "GPS, GLONASS, Galileo ve BeiDou sistemlerini eşzamanlı işleyerek en zorlu saha koşullarında dahi 2,5 metre doğrulukla konum belirler.",
      items: ["2,5 m dairesel konum doğruluğu", "Dahili yüksek kazançlı patch anten", "Yarı kapalı alanlarda yüksek uydu duyarlılığı"]
    },
    {
      id: "motion-intelligence",
      icon: "activity",
      kicker: "AKILLI TELEMETRİ",
      title: "İvmeölçer Destekli Dinamik Konum İletimi",
      body: "3 eksenli ivmeölçer varlığın durduğunu algıladığında uyku moduna geçer, hareket başladığında ise anlık periyodik takibi başlatır.",
      items: ["Anlık hareket ve sarsıntı algılama", "Geofence sınır ihlali alarmı", "Kanal kirliliğini önleyen akıllı telemetri"]
    },
    {
      id: "rugged-hardware",
      icon: "shield",
      kicker: "MEKANİK DAYANIM",
      title: "IP67 Su Geçirmez ve Darbeye Dayanıklı Kasa",
      body: "Deniz konteyner taşımacılığı, madencilik sahaları ve basınçlı yıkamaya karşı tam sızdırmaz koruma sağlar.",
      items: ["IP67 hermetik sızdırmazlık", "-40°C ila +85°C çalışma aralığı", "Mıknatıslı veya vidalı montaj kiti"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "PİL YÖNETİMİ",
      title: "7 Yıla Varan Sahada Bakımsız Çalışma",
      body: "Bekleme modunda 3 μA altında güç tüketen donanım mimarisi ile varlıklarınızı yıllarca şarj derdi olmadan takip edin.",
      items: ["Li-SOCl2 endüstriyel lityum pil", "Havadan (OTA) yapılandırılabilir raporlama", "Her pakette pil gerilimi telemetrisi"]
    }
  ];

  trGps.aiFAQ = [
    {
      question: "WillowGPS takip cihazının pil ömrü ne kadardır?",
      answer: "Dahili endüstriyel lityum pili ve hareket duyarlı uyku algoritması sayesinde 3 ila 7 yıl ömür sunar. Hareketsizken günde 1 kez, hareket halindeyken 15 dakikada bir konum ileten standart bir kullanım senaryosunda 5 yılın üzerinde çalışır."
    },
    {
      question: "Cihaz kapalı çelik konteynerlerin içine takılabilir mi?",
      answer: "Çelik konteyner duvarları GNSS uydu sinyallerini engeller. WillowGPS, IP67 sızdırmaz gövdesi ve güçlü manyetik/vidalı montaj kiti sayesinde konteynerin dış yüzeyine, tavanına veya şasesine takılacak şekilde tasarlanmıştır."
    },
    {
      question: "Geofence (coğrafi alan ihlali) uyarıları nasıl çalışır?",
      answer: "Varlık yetkisiz bir saatte veya tanımlı coğrafi çitin dışına çıktığında, cihaz derhal öncelikli LoRaWAN alarm paketi iletir. Sunucunuz (ChirpStack/TTN) bu sinyali SMS, e-posta veya webhook ile anında operasyon ekibine bildirir."
    }
  ];

  // DE Localization
  const deGps = ensureLoc(gps, "de");
  deGps.shortDescription = "Industrieller LoRaWAN-GPS-Asset-Tracker mit 3-Achsen-Bewegungserkennung, Geofencing und mehrjähriger Batterielaufzeit für Fracht, Container und Flotten.";
  deGps.description = `Der WillowGPS (WS-O-X-AI-GT-1) ist ein robuster, stromsparender LoRaWAN-GPS-Asset-Tracker für unmotorisierte Schwermaschinen, intermodale Frachtcontainer, Fahrzeugflotten und Baugeräte.

### Multi-GNSS-Präzision und intelligente Bewegungserkennung
Mit Unterstützung für GPS, GLONASS, Galileo und BeiDou liefert WillowGPS eine schnelle und präzise Standortbestimmung (2,5 m Genauigkeit). Der integrierte 3-Achsen-MEMS-Beschleunigungssensor steuert die Energieaufnahme: Im Ruhezustand schläft das Gerät im Mikroampere-Bereich; bei Bewegung oder Erschütterung erwacht es sofort, ermittelt die Koordinaten und überträgt die Telemetrie über LoRaWAN.

### Dynamisches Geofencing und Diebstahlschutz
Verlässt ein Wirtschaftsgut vordefinierte Baustellen- oder Betriebsgrenzen, setzt WillowGPS umgehend einen hochpriorisierten Alarm über das LoRaWAN-Netzwerk ab. 

### IP67-Schutz und mehrjährige Batterielaufzeit
Das robuste, hermetisch dichte IP67-Polymergehäuse widersteht extremen Temperaturen (-40°C bis +85°C), Hochdruckreinigern und Seewasser. Zusammen mit industriellen Lithiumbatterien garantiert das Gerät eine wartungsfreie Einsatzdauer von 3 bis 7 Jahren.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. WILLOWMOS (Soil Moisture & Temperature)
// ══════════════════════════════════════════════════════════════════════════════
const mos = site.products.find(p => p.id === "willowmos");
if (mos) {
  mos.shortDescription = "Industrial LoRaWAN soil moisture and temperature sensor for smart agriculture, greenhouses, and precision irrigation. IP68 probe with multi-year battery life.";
  mos.description = `The WillowMos (WS-O-X-AI-SM-1) is a specialized LoRaWAN soil telemetry sensor engineered for precision agriculture, smart commercial greenhouses, municipal turf landscaping, and viticulture irrigation automation.

### High-Precision FDR Soil Moisture & Thermal Sensing
Utilizing Frequency Domain Reflectometry (FDR) capacitive dielectric measurement, WillowMos determines the Volumetric Water Content (VWC) of soil across a 0% to 100% range without suffering from salinity drift or electrode polarization common in resistive probes. Triple 316L medical-grade stainless steel needles probe root-zone moisture while an embedded digital thermal probe measures soil temperature (-40°C to +85°C).

### Precision Irrigation & Water Conservation
By streaming real-time root-zone hydration metrics to central irrigation controllers and farm management dashboards, WillowMos eliminates over-watering and underwater stress. Agronomists can precisely schedule drip irrigation runs based on soil saturation thresholds, saving up to 40% in agricultural water and pumping energy costs.

### Hermetic IP68 Submersible Design & 10-Year Field Life
The sensor probe is fully resin-potted and IP68 waterproof, capable of permanent underground burial in aggressive fertilizers, organic compost, and sub-zero freeze cycles. The above-ground IP67 LoRaWAN transceiver features UV-stabilized polymer and operates up to 10 years on an internal Li-SOCl2 battery pack under hourly measurement intervals.`;

  mos.detailBlocks = [
    {
      id: "fdr-dielectric",
      icon: "sprout",
      kicker: "MEASUREMENT PHYSICS",
      title: "Capacitive FDR Dielectric Soil Moisture",
      body: "High-frequency dielectric measurement accurately determines volumetric soil moisture content without calibration degradation across varied soil types.",
      items: ["0% to 100% Volumetric Water Content (VWC)", "±2% accuracy across mineral soils", "Salinity & fertilizer drift compensation"]
    },
    {
      id: "root-zone-climate",
      icon: "thermo",
      kicker: "THERMAL METRICS",
      title: "Root-Zone Soil Temperature Telemetry",
      body: "Monitors subterranean temperature trends to determine optimal planting windows, prevent frost damage, and guide fertilizer absorption efficiency.",
      items: ["-40°C to +85°C measurement range", "±0.3°C high-accuracy digital thermal probe", "Dual-parameter payload transmission"]
    },
    {
      id: "ip68-submersible",
      icon: "droplet",
      kicker: "FIELD RESILIENCE",
      title: "IP68 Sealed Probe & 316L Stainless Steel",
      body: "Resin-encapsulated sensing head with anti-corrosive stainless steel electrodes designed for long-term underground burial in acidic or saline soils.",
      items: ["Permanent underground burial rating", "UV and pesticide resistant cable", "Corrosion-proof 316L needle array"]
    },
    {
      id: "battery-autonomy",
      icon: "battery",
      kicker: "AUTONOMOUS POWER",
      title: "10-Year Agricultural Battery Architecture",
      body: "High-capacity industrial lithium power source combined with ultra-low microamp sleep current delivers a decade of continuous field monitoring.",
      items: ["Up to 10 years battery life", "Long-range LoRaWAN connectivity (up to 15 km)", "Plug-and-play TTN & ChirpStack decoders"]
    }
  ];

  mos.aiFAQ = [
    {
      question: "How does FDR capacitive soil measurement differ from resistive probes?",
      answer: "Resistive probes rely on direct electrical conduction, which causes rapid electrode oxidation and gives false readings as soil fertilizer/salt levels fluctuate. WillowMos uses Frequency Domain Reflectometry (FDR) to measure the dielectric permittivity of soil, providing stable, long-term accuracy immune to fertilizer salts."
    },
    {
      question: "Can the sensor probe remain buried through freezing winters?",
      answer: "Yes. The sensing head is encapsulated in IP68 polyurethane resin and rated for temperatures from -40°C to +85°C, allowing it to remain permanently buried in frozen soil without cracking or water ingress."
    },
    {
      question: "How deep should the probe be installed?",
      answer: "The installation depth depends on crop root architecture. For shallow turf and vegetables, 10–20 cm is common; for vineyards, orchards, and nut trees, multiple sensors are often installed at 30 cm, 60 cm, and 90 cm to monitor water percolation across root depths."
    }
  ];

  // TR Localization
  const trMos = ensureLoc(mos, "tr");
  trMos.shortDescription = "Akıllı tarım, sera ve otomatik sulama sistemleri için toprağın hacimsel nemini ve sıcaklığını ölçen IP68 endüstriyel LoRaWAN toprak nem sensörü.";
  trMos.description = `WillowMos (WS-O-X-AI-SM-1), hassas tarım, endüstriyel seralar, bağcılık, meyve bahçeleri ve belediye peyzaj sulama sistemleri için tasarlanmış yüksek hassasiyetli kablosuz LoRaWAN toprak nemi ve sıcaklık sensörüdür.

### Hassas FDR Dielektrik Nem ve Sıcaklık Ölçümü
Frekans Alanı Reflektometrisi (FDR) prensibiyle çalışan kapasitif dielektrik sensör, toprağın Hacimsel Su İçeriğini (VWC: %0 - %100) gübre ve tuzluluk değişimlerinden etkilenmeden yüksek doğrulukla ölçer. Klasik dirençli probların aksine elektrotlarında oksitlenme veya aşınma yaşanmaz. 316L paslanmaz çelik prob uçları kök derinliğindeki su doygunluğunu, entegre sıcaklık sensörü ise (-40°C ila +85°C) toprak sıcaklığını takip eder.

### Hassas Sulama ve Su Tasarrufu
Kök bölgesindeki gerçek nem seviyesini merkezi sulama otomasyonuna kablosuz ileten WillowMos, aşırı veya yetersiz sulama riskini ortadan kaldırır. Çiftçiler ve ziraat mühendisleri sulama periyotlarını toprak doygunluk eşiklerine göre optimize ederek %40'a varan su ve elektrik enerjisi tasarrufu sağlar.

### IP68 Yeraltı Dayanımı ve 10 Yıllık Pil Ömrü
Tamamen reçine dolgulu IP68 sızdırmaz prob yapısı, asidik gübreler, zirai kimyasallar ve kış don döngülerinde toprak altında yıllarca güvenle kalır. Toprak üstündeki IP67 LoRaWAN verici ünitesi 10 yıla varan pil ömrü ve açık alanda 15 km'ye varan çekim menzili sunar.`;

  trMos.detailBlocks = [
    {
      id: "fdr-dielectric",
      icon: "sprout",
      kicker: "ÖLÇÜM FİZİĞİ",
      title: "Kapasitif FDR Dielektrik Nem Algılama",
      body: "Yüksek frekanslı dielektrik ölçüm, farklı toprak türlerinde tuz ve gübreden etkilenmeden hacimsel su içeriğini belirler.",
      items: ["%0 - %100 Hacimsel Su İçeriği (VWC)", "Mineral topraklarda ±%2 hassasiyet", "Gübre ve tuzluluk sapmalarına karşı korumalı"]
    },
    {
      id: "root-zone-climate",
      icon: "thermo",
      kicker: "KÖK BÖLGESİ",
      title: "Toprak Sıcaklığı Telemetrisi",
      body: "Tohum ekimi, don riski ve gübre emilim verimliliğini yönetmek için kök derinliğindeki sıcaklık profilini takip eder.",
      items: ["-40°C ila +85°C geniş ölçüm aralığı", "±0,3°C hassasiyetli dijital sıcaklık sensörü", "Nem ve sıcaklığı tek pakette iletme"]
    },
    {
      id: "ip68-submersible",
      icon: "droplet",
      kicker: "SAHA DAYANIMI",
      title: "IP68 Reçine Dolgulu Gövde & 316L Çelik",
      body: "Asidik veya kireçli topraklarda korozyona uğramayan 316L paslanmaz çelik elektrotlar ve su geçirmez prob yapısı.",
      items: ["Kalıcı yeraltı gömülme standardı", "UV ve zirai ilaçlara dayanıklı kablo", "Donma ve çözülme döngülerine tam dayanım"]
    },
    {
      id: "battery-autonomy",
      icon: "battery",
      kicker: "PİL PERFORMANSI",
      title: "10 Yıl Bakımsız Tarımsal Güç Mimarisi",
      body: "Dahili yüksek kapasiteli endüstriyel lityum pili ve mikroamper uyku moduyla 10 yıl boyunca kesintisiz telemetri sunar.",
      items: ["10 yıla varan pil ömrü", "Açık sahada 15 km çekim menzili", "ChirpStack ve TTN hazır entegrasyonu"]
    }
  ];

  trMos.aiFAQ = [
    {
      question: "FDR kapasitif ölçüm klasik dirençli problardan neden üstündür?",
      answer: "Dirençli problar elektrik akımı geçirerek çalıştığı için elektrotları kısa sürede korozyona uğrar ve gübreli sularda hatalı ölçüm yapar. WillowMos, toprağın dielektrik katsayısını ölçen FDR teknolojisiyle çalışır; tuz ve gübre değişimlerinden etkilenmeden yıllarca stabil kalır."
    },
    {
      question: "Prob kış aylarında toprak altında donmaya dayanabilir mi?",
      answer: "Evet. Sensör başlığı IP68 poliüretan reçine ile mühürlenmiştir ve -40°C ila +85°C aralığında çalışır. Donan toprak içinde çatlama veya su sızdırma yapmadan kalıcı olarak gömülü kalabilir."
    },
    {
      question: "Sensör probu toprağa ne kadar derinlikte gömülmelidir?",
      answer: "Montaj derinliği bitkinin kök yapısına bağlıdır. Çim ve sebzelerde 10–20 cm yeterliyken, bağ ve meyve ağaçlarında suyun süzülme profilini izlemek için genellikle 30 cm, 60 cm ve 90 cm derinliklere ayrı problar yerleştirilir."
    }
  ];

  // DE Localization
  const deMos = ensureLoc(mos, "de");
  deMos.shortDescription = "Industrieller LoRaWAN-Sensor für Bodenfeuchte und Temperatur für intelligente Landwirtschaft, Gewächshäuser und Bewässerungssteuerung. IP68-Sonde mit 10 Jahren Batterielaufzeit.";
  deMos.description = `Der WillowMos (WS-O-X-AI-SM-1) ist ein drahtloser LoRaWAN-Sensor für die Bodenüberwachung in der Präzisionslandwirtschaft, in kommerziellen Gewächshäusern, im Weinbau und bei kommunalen Bewässerungssystemen.

### Kapazitive FDR-Bodenfeuchte- und Temperaturmessung
Mittels Frequency Domain Reflectometry (FDR) misst der WillowMos den volumetrischen Wassergehalt (VWC) von 0 bis 100 % ohne Drift durch Düngemittel oder Salinität. Drei Edelstahlnadeln (316L) erfassen die Feuchte in der Wurzelzone, während ein digitaler Temperatursensor die Bodentemperatur (-40°C bis +85°C) überwacht.

### Präzise Bewässerung und Wassereinsparung
Durch die kontinuierliche Übertragung von Feuchtewerten an Bewässerungssteuerungen und Farm-Management-Plattformen können Landwirte Überwässerung vermeiden und den Wasser- und Energieverbrauch um bis zu 40 % senken.

### IP68-Unterwassersonde und 10 Jahre Batterielaufzeit
Die Sonde ist vollständig vergossen (IP68) und dauerhaft erdverlegbar. Die überirdische IP67-Sendeeinheit mit LoRaWAN EU868 erreicht eine Batterielaufzeit von bis zu 10 Jahren und Reichweiten von bis zu 15 km im Freifeld.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. WILLOWTEMP (Industrial Temperature & Humidity)
// ══════════════════════════════════════════════════════════════════════════════
const temp = site.products.find(p => p.id === "willowtemp");
if (temp) {
  temp.shortDescription = "High-accuracy LoRaWAN temperature and humidity sensor for cold chain logistics, pharmaceutical warehouses, cleanrooms, and HACCP compliance. Long-life IP67 enclosure.";
  temp.description = `The WillowTemp (WS-O-X-AI-TH-1) is an industrial-grade LoRaWAN temperature and humidity monitoring transmitter engineered for cold chain integrity, pharmaceutical warehousing, food processing HACCP compliance, and cleanroom surveillance.

### Precision Digital Sensor Architecture
Featuring a factory-calibrated Swiss digital sensing element, WillowTemp delivers high-precision temperature measurements (±0.2°C accuracy across -40°C to +85°C) and relative humidity monitoring (±2% RH across 0% to 100% RH). For cryogenic and ultra-low temperature applications such as -80°C bio-freezers or industrial ovens up to +200°C, an optional external PT100/PT1000 RTD stainless steel probe with a Teflon/silicone cable is available.

### Cold Chain Compliance & Threshold Alarms (HACCP / GxP)
Maintaining continuous thermal records is mandatory for Good Distribution Practice (GDP), pharmaceutical validation, and food safety. WillowTemp provides real-time threshold excursion alerting: when temperatures drift outside predefined upper or lower bounds, the device instantly transmits an urgent priority LoRaWAN packet, enabling immediate corrective action before inventory spoilage occurs.

### IP67 Housing & Ultra-Long Battery Life
Built into an IP67 dustproof and waterproof enclosure, WillowTemp is immune to condensation in refrigerated trucks, washdown procedures, and damp cellars. Powered by an internal industrial Li-SOCl2 battery with a 1.5 μA quiescent current draw, the device delivers up to 10 years of autonomous operation under standard periodic transmission cadences.`;

  temp.detailBlocks = [
    {
      id: "precision-sensor",
      icon: "thermo",
      kicker: "CALIBRATED ACCURACY",
      title: "High-Accuracy Swiss Digital Sensing Element",
      body: "Factory-calibrated digital sensor achieves ±0.2°C temperature and ±2% RH humidity accuracy with exceptional long-term drift stability.",
      items: ["-40°C to +85°C standard measurement range", "Optional external PT100/PT1000 probe (-80°C to +200°C)", "NIST-traceable calibration support"]
    },
    {
      id: "cold-chain-alerts",
      icon: "activity",
      kicker: "REGULATORY COMPLIANCE",
      title: "HACCP & GxP Cold Chain Excursion Alarms",
      body: "Provides automated thermal logging and immediate threshold excursion alarms to safeguard perishable pharmaceuticals and food stocks.",
      items: ["GDP / HACCP / GxP compliance ready", "Instant high/low temperature excursion uplink", "Automated compliance audit reports via cloud"]
    },
    {
      id: "enclosure-protection",
      icon: "shield",
      kicker: "ENVIRONMENTAL RESILIENCE",
      title: "IP67 Condensation & Washdown Proof",
      body: "Sealed enclosure with breathable PTFE membrane protects electronics from heavy frost, condensation, and sanitizing washdown spray.",
      items: ["IP67 waterproof and frost-resistant", "PTFE vapor-permeable membrane vent", "Magnetic or wall-mount bracket kit"]
    },
    {
      id: "battery-autonomy",
      icon: "battery",
      kicker: "LOW-POWER DESIGN",
      title: "Up to 10-Year Autonomous Field Autonomy",
      body: "Ultra-low power sleep states combined with high-capacity lithium chemistry provide years of dependable, maintenance-free temperature tracking.",
      items: ["Up to 10-year battery lifespan", "Long-range LoRaWAN indoor and trailer penetration", "ChirpStack, TTN & AWS IoT payload decoders"]
    }
  ];

  temp.aiFAQ = [
    {
      question: "Is WillowTemp suitable for ultra-low temperature medical freezers (-80°C)?",
      answer: "Yes. For -80°C cryogenic storage and vaccine freezers, WillowTemp is supplied with an external Teflon-jacketed stainless steel PT100 probe. The main transmitter sits outside the freezer, while the thin probe cable easily passes through cabinet door gaskets."
    },
    {
      question: "How does the sensor help with HACCP or GDP compliance?",
      answer: "WillowTemp eliminates manual paper temperature logging by streaming timestamped temperature and humidity readings over LoRaWAN directly into your cloud dashboard. In case of cooling failure, automated SMS/email alerts are triggered instantly."
    },
    {
      question: "Can WillowTemp monitor humidity inside damp food storage cellars?",
      answer: "Yes. The internal sensor is protected by an IP67 waterproof enclosure and a microporous PTFE filter membrane that allows humidity vapor to enter while keeping liquid water droplets and dust away from the sensor circuitry."
    }
  ];

  // TR Localization
  const trTemp = ensureLoc(temp, "tr");
  trTemp.shortDescription = "Soğuk zincir, aşı dolapları, ilaç depoları ve HACCP uyumluluğu için yüksek hassasiyetli endüstriyel LoRaWAN sıcaklık ve nem sensörü.";
  trTemp.description = `WillowTemp (WS-O-X-AI-TH-1), soğuk zincir lojistiği, ilaç depoları, aşı saklama merkezleri, gıda işleme tesisleri ve HACCP uyumluluğu için geliştirilmiş yüksek hassasiyetli endüstriyel LoRaWAN sıcaklık ve nem sensörüdür.

### Hassas Dijital Sensör Mimarisi
Fabrika kalibrasyonlu İsviçre menşeili dijital sensör çipi ile donatılan WillowTemp, -40°C ila +85°C aralığında ±0,2°C sıcaklık ve %0 ila %100 RH aralığında ±%2 bağıl nem hassasiyeti sunar. Aşı saklama dolapları (-80°C) veya endüstriyel fırınlar (+200°C) gibi ekstrem uygulamalar için opsiyonel harici paslanmaz çelik PT100/PT1000 problu modeli mevcuttur.

### Soğuk Zincir ve HACCP / GxP Uyumluluğu
İlaç ve gıda sektöründe yasal denetimler için sürekli sıcaklık kaydı zorunludur. WillowTemp, sıcaklık belirlenen alt veya üst limitlerin dışına çıktığında bekleme periyodunu atlayarak anında öncelikli LoRaWAN alarm paketi fırlatır; böylece ürünler bozulmadan önce müdahale edilmesini sağlar.

### IP67 Yoğuşma Dayanımı ve 10 Yıllık Pil Ömrü
Soğuk hava depolarındaki yoğun yoğuşma, don ve basınçlı yıkamalara karşı IP67 sızdırmaz gövdeye ve nefes alabilir PTFE koruma membranına sahiptir. 1,5 μA ultra düşük bekleme akımı ile 10 yıla varan bakım gerektirmeyen pil ömrü sunar.`;

  trTemp.detailBlocks = [
    {
      id: "precision-sensor",
      icon: "thermo",
      kicker: "KALİBRE HASSASİYET",
      title: "Yüksek Doğruluklu Dijital Sensör Çipi",
      body: "Uzun vadeli kararlılığa sahip dijital sensör, sıcaklığı ±0,2°C, bağıl nemi ±%2 hassasiyetle ölçer.",
      items: ["-40°C ila +85°C standart ölçüm aralığı", "Opsiyonel -80°C / +200°C harici PT100 probu", "NIST izlenebilir kalibrasyon desteği"]
    },
    {
      id: "cold-chain-alerts",
      icon: "activity",
      kicker: "YASAL UYUMLULUK",
      title: "HACCP ve GDP Uyumlu Sıcaklık İhlal Alarmları",
      body: "Manuel kağıt kayıt ihtiyacını bitirir; eşik değer aşımında anlık alarm ileterek bozulmaları önler.",
      items: ["HACCP ve GDP standartlarına tam uyum", "Anlık sıcaklık sapması öncelikli alarmı", "Bulut üzerinde otomatik denetim raporları"]
    },
    {
      id: "enclosure-protection",
      icon: "shield",
      kicker: "SAHA DAYANIMI",
      title: "IP67 Yoğuşma ve Su Geçirmez Kasa",
      body: "Yoğuşmalı soğuk hava depolarında su damlalarının devreye ulaşmasını engelleyen PTFE membranlı gövde.",
      items: ["IP67 koruma ve dona karşı dayanıklılık", "Nefes alabilir buhar geçirgen filtre", "Mıknatıslı veya vidalı kolay montaj"]
    },
    {
      id: "battery-autonomy",
      icon: "battery",
      kicker: "PİL YÖNETİMİ",
      title: "10 Yıla Varan Sahada Kesintisiz Güç",
      body: "Mikroamper bekleme akımı ve yüksek kapasiteli lityum pili ile yıllarca pil değişimi gerektirmez.",
      items: ["10 yıla varan pil ömrü", "Frigofirik araç ve depolarda güçlü LoRa menzili", "ChirpStack ve TTN hazır entegrasyonu"]
    }
  ];

  trTemp.aiFAQ = [
    {
      question: "WillowTemp -80°C aşı ve medikal derin dondurucular için uygun mudur?",
      answer: "Evet. -80°C derin dondurucu ve kriyojenik tanklar için teflon kaplı harici paslanmaz çelik PT100 problu varyantımız kullanılır. Verici ünite dolap dışında kalırken, ince prob kablosu kapak contasından dondurucu içine uzatılır."
    },
    {
      question: "HACCP ve soğuk zincir denetimlerine nasıl yardımcı olur?",
      answer: "WillowTemp, manuel kayıt tutma ihtiyacını tamamen ortadan kaldırır. Ölçülen sıcaklık ve nem verilerini zaman damgasıyla LoRaWAN üzerinden bulut platformunuza aktarır; soğutucu arızalandığında saniyeler içinde SMS/e-posta alarmı üretir."
    },
    {
      question: "Sensör nemli soğuk hava depolarında yoğuşmadan zarar görür mü?",
      answer: "Hayır. Cihaz IP67 sızdırmaz kasaya ve mikro gözenekli PTFE membran filtreye sahiptir. Bu filtre nem buharının sensöre ulaşmasını sağlarken sıvı su damlacıklarını ve tozu dışarıda tutar."
    }
  ];

  // DE Localization
  const deTemp = ensureLoc(temp, "de");
  deTemp.shortDescription = "Hochpräziser LoRaWAN-Temperatur- und Feuchtesensor für Kühlketten, Pharmalager, Reinräume und HACCP-Konformität mit langer Batterielaufzeit.";
  deTemp.description = `Der WillowTemp (WS-O-X-AI-TH-1) ist ein industrieller LoRaWAN-Temperatur- und Luftfeuchtigkeitssensor für Kühlkettenlogistik, Pharmalager, Lebensmittelverarbeitung (HACCP) und Reinräume.

### Präzise Schweizer Sensortechnik
Mit einem werkskalibrierten Sensorelement bietet WillowTemp eine Messgenauigkeit von ±0,2°C (-40°C bis +85°C) und ±2 % rF (0 bis 100 % rF). Für kryogene Anwendungen (-80°C Impfstoff-Tiefkühlschränke) oder Hochtemperaturbereiche (+200°C) ist eine externe PT100/PT1000-Edelstahlsonde erhältlich.

### HACCP- und GDP-Konformität mit Sofortalarm
Zur Einhaltung von GDP- und HACCP-Standards alarmiert WillowTemp sofort bei Schwellenwertüberschreitungen. Das drahtlose System ersetzt fehleranfällige manuelle Listen durch lückenlose, manipulationssichere digitale Protokolle.

### IP67-Kondensationsschutz und 10 Jahre Autonomie
Das IP67-Gehäuse mit atmungsaktiver PTFE-Membran schützt die Elektronik vor Betauung in Kühlhäusern und hält Reinigungszyklen stand. Mit 1,5 μA Ruhestrom arbeitet der Sensor bis zu 10 Jahre wartungsfrei.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. WILLOWTILT (3-Axis Inclinometer & Structural Tilt)
// ══════════════════════════════════════════════════════════════════════════════
const tilt = site.products.find(p => p.id === "willowtilt");
if (tilt) {
  tilt.shortDescription = "High-precision LoRaWAN 3-axis inclinometer and tilt sensor for utility poles, telecommunication towers, bridges, retaining walls, and structural health monitoring (SHM).";
  tilt.description = `The WillowTilt (WS-O-X-AI-TL-1) is a high-precision industrial LoRaWAN 3-axis inclinometer and tilt transmitter engineered for Structural Health Monitoring (SHM), utility pole stability, bridge deflection, telecommunication towers, and landslide risk assessment.

### High-Resolution MEMS Inclinometry & Angular Drift Compensation
Utilizing ultra-low noise 3-axis MEMS sensor technology, WillowTilt measures pitch, roll, and inclination angles with 0.01° resolution and ±0.05° absolute accuracy. Embedded firmware performs real-time digital filtering and thermal compensation, filtering out transient high-frequency vibrations caused by passing traffic or wind gusts to deliver pristine static tilt telemetry.

### Structural Health Monitoring & Rapid Alarm Routing
Geotechnical shifts, heavy storms, vehicular collisions, or soil foundation erosion can jeopardize power transmission towers and retaining walls. WillowTilt operates on dual reporting cadences: under normal conditions, it broadcasts periodic static inclination packets; the moment a sudden tilt deflection exceeds user-defined threshold limits, it immediately bypasses sleep cycles and transmits a priority emergency uplink.

### Harsh Environment IP67 Enclosure & Multi-Year Power
Housed in an impact-resistant, UV-stabilized IP67 waterproof enclosure with rugged aluminum mounting flanges, WillowTilt is built to survive harsh outdoor weather and seismic shocks. Drawing minimal microamp-level quiescent current, its internal industrial battery delivers up to 8 years of autonomous field operation.`;

  tilt.detailBlocks = [
    {
      id: "tilt-measurement",
      icon: "activity",
      kicker: "ANGULAR ACCURACY",
      title: "0.01° Resolution Dual/Triple-Axis Inclinometry",
      body: "High-stability MEMS accelerometer core calculates pitch and roll angles with temperature compensation to eliminate thermal drift.",
      items: ["0.01° angular resolution", "±0.05° absolute accuracy", "Programmable low-pass vibration filtering"]
    },
    {
      id: "shm-alarms",
      icon: "shield",
      kicker: "EARLY WARNING",
      title: "Threshold Excursion & Collision Alarms",
      body: "Triggers immediate emergency uplink transmissions upon structural displacement, pole tilt, or vehicle collision events.",
      items: ["Instant tilt deviation interrupt", "Utility pole & transmission tower safety", "Historical inclination drift tracking"]
    },
    {
      id: "enclosure-rigidity",
      icon: "mount",
      kicker: "MECHANICAL DESIGN",
      title: "IP67 Waterproof & Impact-Resistant Casing",
      body: "Heavy-duty outdoor enclosure with galvanized mounting bracket mounts securely onto steel poles, concrete pylons, and bridge abutments.",
      items: ["IP67 sealed against rain, ice and dust", "-40°C to +85°C outdoor operating range", "Universal pole/wall bracket included"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "LONG-LIFE POWER",
      title: "Up to 8-Year Autonomous Battery Design",
      body: "Low-power firmware architecture ensures multi-year field deployment without requiring external cables or solar panel maintenance.",
      items: ["Up to 8 years field lifespan", "Long-range LoRaWAN radio coverage (up to 15 km)", "Plug-and-play ChirpStack and TTN decoders"]
    }
  ];

  tilt.aiFAQ = [
    {
      question: "How does WillowTilt filter out wind vibrations from real structural tilt?",
      answer: "WillowTilt incorporates digital low-pass filtering and statistical averaging inside its onboard microcontroller. Transient high-frequency vibrations caused by wind or passing traffic are smoothed out, ensuring that only genuine structural ground movement or sustained pole lean triggers an alert."
    },
    {
      question: "What infrastructure can WillowTilt monitor?",
      answer: "It is widely deployed on electrical utility poles, high-voltage transmission towers, telecommunication monopoles, highway bridge abutments, retaining walls, scaffolding, and open-pit mining slopes."
    },
    {
      question: "How quickly does the sensor send an alert if a pole is hit by a vehicle?",
      answer: "The sensor's hardware interrupt instantly detects impact acceleration or angular displacement exceeding the preset threshold, triggering an immediate Class A priority uplink within seconds."
    }
  ];

  // TR Localization
  const trTilt = ensureLoc(tilt, "tr");
  trTilt.shortDescription = "Elektrik direkleri, köprüler, kuleler ve istinat duvarları için 0,01° hassasiyetli LoRaWAN 3 eksenli eğim ve titreşim sensörü. Anlık alarm iletimi.";
  trTilt.description = `WillowTilt (WS-O-X-AI-TL-1), Yapısal Sağlık İzleme (SHM), elektrik dağıtım direkleri, baz istasyonu kuleleri, köprü tabliyeleri, istinat duvarları ve heyelan izleme sistemleri için geliştirilmiş yüksek hassasiyetli LoRaWAN 3 eksenli eğim ve ivme sensörüdür.

### Yüksek Çözünürlüklü MEMS Eğim ve Titreşim Algılama
Ultra düşük gürültülü 3 eksenli MEMS sensör çekirdeği ile donatılan WillowTilt, eğim açılarını (pitch ve roll) 0,01° çözünürlük ve ±0,05° mutlak doğrulukla hesaplar. Gömülü sayısal filtreleme algoritmaları, rüzgar esintileri veya araç trafiğinden kaynaklanan geçici yüksek frekanslı titreşimleri süzerek yalnızca kalıcı zemin ve yapı hareketlerini raporlar.

### Yapısal Sağlık ve Anlık Çarpışma / Eğim Alarmı
Fırtına, zemin oturması veya araç çarpması sonucu direk veya kulelerde oluşabilecek tehlikeli eğilmeler can ve mal güvenliği için kritik tehdittir. WillowTilt, belirlenen eşik açı aşıldığında veya ani darbe algılandığında uyku döngüsünü kırarak merkezi yönetim paneline saniyeler içinde acil durum LoRaWAN paketi fırlatır.

### IP67 Ağır Saha Dayanımı ve 8 Yıllık Pil Ömrü
Darbe dayanımlı, UV korumalı IP67 sızdırmaz gövdesi ve galvanizli montaj aparatı ile çelik veya betonarme direklere kolayca sabitlenir. Mikroamper seviyesindeki güç tüketimiyle sahada harici kabloya veya güneş paneline ihtiyaç duymadan 8 yıla kadar kesintisiz çalışır.`;

  trTilt.detailBlocks = [
    {
      id: "tilt-measurement",
      icon: "activity",
      kicker: "AÇISAL HASSASİYET",
      title: "0,01° Çözünürlüklü 3 Eksenli Eğim Ölçümü",
      body: "Sıcaklık kompanzasyonlu MEMS sensör mimarisi, termal sapmaları sıfırlayarak pitch ve roll açılarını yüksek hassasiyetle hesaplar.",
      items: ["0,01° açısal çözünürlük", "±0,05° mutlak doğruluk", "Ayarlanabilir titreşim ve gürültü filtreleme"]
    },
    {
      id: "shm-alarms",
      icon: "shield",
      kicker: "ERKEN UYARI",
      title: "Eşik Aşımı ve Çarpışma Erken Uyarısı",
      body: "Direğin yatması, zemin kayması veya araç çarpması gibi kritik durumlarda saniyeler içinde öncelikli alarm iletir.",
      items: ["Anlık eşik ihlal kesmesi (interrupt)", "Enerji nakil hatları ve kule güvenliği", "Uzun dönemli eğim kayması telemetrisi"]
    },
    {
      id: "enclosure-rigidity",
      icon: "mount",
      kicker: "MEKANİK KORUMA",
      title: "IP67 Sızdırmaz ve Darbeye Dayanıklı Gövde",
      body: "Fırtına, kar, buz ve şiddetli mekanik şoklara dayanıklı sağlam gövde ve direk bağlantı kiti.",
      items: ["IP67 toz ve su sızdırmazlık", "-40°C ila +85°C geniş sıcaklık aralığı", "Direk ve duvar montaj braketi dahil"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "PİL YÖNETİMİ",
      title: "8 Yıla Varan Sahada Kesintisiz Güç",
      body: "Karasal elektrik şebekesinden bağımsız, harici kablo gerektirmeyen düşük güçlü donanım tasarımı.",
      items: ["8 yıla varan pil ömrü", "Açık alanda 15 km LoRaWAN menzili", "ChirpStack ve TTN hazır entegrasyonu"]
    }
  ];

  trTilt.aiFAQ = [
    {
      question: "WillowTilt rüzgar sallantısı ile gerçek yapısal eğilmeyi nasıl ayırt eder?",
      answer: "WillowTilt, işlemcisinde çalışan dijital alçak geçiren filtreler (low-pass filter) ile rüzgar veya araç trafiğinden kaynaklanan geçici titreşimleri eler; yalnızca kalıcı zemin hareketi veya kalıcı direkteki yatıklık durumunda alarm tetikler."
    },
    {
      question: "Cihaz hangi yapılarda kullanılabilir?",
      answer: "Elektrik dağıtım direkleri, yüksek gerilim nakil kuleleri, baz istasyonları, karayolu köprü ayakları, istinat duvarları, iskele sistemleri ve maden açık ocak şevlerinde yaygın olarak kullanılır."
    },
    {
      question: "Bir araç direğe çarptığında alarm ne kadar sürede iletilir?",
      answer: "Dahili ivmeölçerin donanımsal kesme (interrupt) özelliği sayesinde çarpma anındaki ani ivmelenme ve açı değişimi saniyeler içinde öncelikli Class A LoRaWAN uplink paketi olarak ağ geçidine ulaştırılır."
    }
  ];

  // DE Localization
  const deTilt = ensureLoc(tilt, "de");
  deTilt.shortDescription = "Präziser LoRaWAN-3-Achsen-Neigungssensor für Maste, Brücken, Türme und Bauwerksüberwachung (SHM) mit 0,01° Auflösung und Schwellenwert-Alarm.";
  deTilt.description = `Der WillowTilt (WS-O-X-AI-TL-1) ist ein hochpräziser industrieller LoRaWAN-3-Achsen-Neigungsmesser für die Bauwerksüberwachung (Structural Health Monitoring, SHM), Stromleitungsmasten, Funkmasten und Brücken.

### Hochauflösende MEMS-Neigungsmessung
Mit einer Auflösung von 0,01° und einer Genauigkeit von ±0,05° erfasst WillowTilt Nick- und Rollwinkel zuverlässig. Integrierte Filteralgorithmen eliminieren dynamische Erschütterungen durch Windböen oder Straßenverkehr, sodass ausschließlich reale strukturelle Neigungen übertragen werden.

### Sofortige Kollisions- und Grenzwertalarme
Wird ein Mast durch Sturm, Erdrutsch oder Fahrzeugkollision gefährlich geneigt, unterbricht das Gerät sofort den Schlafmodus und sendet ein Prioritätsdatenpaket über LoRaWAN an die Leitstelle.

### IP67-Wetterschutz und 8 Jahre Batterielaufzeit
Das UV-beständige IP67-Gehäuse widersteht extremen Witterungsbedingungen von -40°C bis +85°C. Die interne Batterie ermöglicht bis zu 8 Jahre autarken Betrieb ohne externe Verkabelung.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. WILLOWSENS (Multi-Input & Door Contact Hub)
// ══════════════════════════════════════════════════════════════════════════════
const sens = site.products.find(p => p.id === "willowsens");
if (sens) {
  sens.shortDescription = "Industrial LoRaWAN multi-input hub for magnetic door contacts, digital inputs, and pulse meters. Real-time enclosure, transformer substation, and perimeter access monitoring.";
  sens.description = `The WillowSens (WS-O-X-AI-DS-1) is a versatile industrial LoRaWAN telemetry terminal engineered for remote perimeter security, magnetic door contact surveillance, water/gas meter pulse counting, and electrical substation cabinet monitoring.

### Versatile Multi-Input Sensing (Reed, DI & Pulse Counter)
WillowSens integrates an internal high-sensitivity magnetic reed switch alongside external dry-contact digital inputs (DI) and high-speed pulse counter interfaces. It seamlessly captures cabinet door open/close transitions, security tamper events, and pulses from utility flow meters, translating raw physical events into timestamped, structured LoRaWAN packets.

### Critical Substation & Server Rack Security
Industrial transformer stations, solar combiner boxes, telecommunication shelters, and server racks frequently sit in unstaffed remote locations. WillowSens provides immediate status change notifications: opening an authorized enclosure door or unauthorized forced entry triggers a sub-second interrupt uplink, logging the exact event time and transmitting tamper alerts to security operations teams.

### Rugged IP67 Ingress Protection & 10-Year Field Life
Engineered for demanding utility environments, WillowSens is encapsulated in an IP67 weatherproof housing. Its ultra-low power microcontroller draws under 1.5 μA in standby, allowing the internal industrial battery to deliver up to 10 years of autonomous operation under thousands of door open/close trigger events.`;

  sens.detailBlocks = [
    {
      id: "multi-input",
      icon: "radio",
      kicker: "INPUT FLEXIBILITY",
      title: "Magnetic Reed, Dry Contact & Pulse Counter",
      body: "Combines an internal magnetic contact with external digital input terminals to monitor door states and interface with pulse-output meters.",
      items: ["Internal magnetic reed switch", "External dry-contact DI interface", "High-speed pulse accumulator for flow meters"]
    },
    {
      id: "tamper-alerts",
      icon: "shield",
      kicker: "SECURITY TELEMETRY",
      title: "Instant Intrusion & Tamper Detection",
      body: "Generates sub-second Class A LoRaWAN uplink packets upon door open events, providing instant remote visibility of unstaffed infrastructure.",
      items: ["Instant open/close state change trigger", "Optical tamper sensor protection", "Periodic keep-alive heartbeat"]
    },
    {
      id: "industrial-casing",
      icon: "mount",
      kicker: "ENCLOSURE RATING",
      title: "IP67 Weatherproof Utility Housing",
      body: "Robust UV-stabilized polycarbonate enclosure designed for outdoor transformer stations, solar arrays, and high-moisture manholes.",
      items: ["IP67 dust and immersion protection", "-40°C to +85°C operating range", "External magnet and screw mounting hardware"]
    },
    {
      id: "battery-autonomy",
      icon: "battery",
      kicker: "AUTONOMOUS POWER",
      title: "10-Year Industrial Battery Lifespan",
      body: "Ultra-low power design handles tens of thousands of event triggers over a decade of field service without battery replacement.",
      items: ["Up to 10 years field life", "100,000+ switch event cycles", "ChirpStack, TTN & AWS IoT decoders included"]
    }
  ];

  sens.aiFAQ = [
    {
      question: "Can WillowSens be used for water meter or gas meter pulse counting?",
      answer: "Yes. The external digital input can be configured as a pulse counter accumulator. It counts high-speed pulses from industrial flow meters or gas meters and transmits cumulative consumption values over LoRaWAN at programmed intervals."
    },
    {
      question: "What is the operating distance between the sensor and the magnet?",
      answer: "The magnetic reed switch operates reliably with an open/close gap threshold of approximately 15 mm to 25 mm, allowing flexible installation on warped metal enclosure doors or heavy security gates."
    },
    {
      question: "Does the sensor confirm when a door is closed again?",
      answer: "Yes. WillowSens transmits separate uplinks for both 'Door Open' and 'Door Closed' events, including the duration of the opening, allowing full operational auditing of access history."
    }
  ];

  // TR Localization
  const trSens = ensureLoc(sens, "tr");
  trSens.shortDescription = "Trafo merkezleri, sunucu kabinetleri ve pano kapıları için manyetik kontak, kuru kontak ve darbe sayıcı destekli endüstriyel LoRaWAN sensörü.";
  trSens.description = `WillowSens (WS-O-X-AI-DS-1), uzak trafo merkezleri, güneş enerjisi toplama panoları, sunucu kabinleri, sayaç darbe okuma ve çevre güvenliği için geliştirilmiş çok fonksiyonlu endüstriyel LoRaWAN telemetri modülüdür.

### Çok Yönlü Giriş Mimarisi (Manyetik Reed, Kuru Kontak ve Darbe Sayıcı)
Dahili yüksek hassasiyetli manyetik reed rölesinin yanı sıra harici kuru kontak (DI) klemenslerine ve hızlı darbe (pulse) sayıcı arayüzüne sahiptir. Pano kapılarının açık/kapalı durumunu, izinsiz müdahaleleri ve mekanik su/gaz sayaçlarından gelen tüketim darbelerini saniyeler içinde LoRaWAN paketine dönüştürür.

### Kritik Tesis ve Trafo Güvenliği
İnsansız trafo binaları, saha dağıtım panoları ve baz istasyonu konteynerleri hırsızlık ve sabotaj riskine açıktır. WillowSens, pano kapağı açıldığı anda uyku modunu kırarak güvenlik merkezine anında öncelikli alarm iletir; açılış ve kapanış zaman damgalarını eksiksiz kaydeder.

### IP67 Ağır Saha Koruması ve 10 Yıllık Pil Ömrü
Dış ortam trafo sahaları ve nemli menfezlere uygun IP67 sızdırmaz gövdeye sahiptir. 1,5 μA seviyesindeki uyku akımı sayesinde yüz binlerce açma/kapama olayını kapsayan 10 yıla varan bakım gerektirmeyen pil ömrü sunar.`;

  trSens.detailBlocks = [
    {
      id: "multi-input",
      icon: "radio",
      kicker: "GİRİŞ ESNEKLİĞİ",
      title: "Manyetik Reed, Kuru Kontak ve Pulse Arayüzü",
      body: "Dahili manyetik kontak ile harici klemens girişini bir arada sunarak hem kapı durumunu hem sayaç darbelerini okur.",
      items: ["Dahili manyetik reed anahtar", "Harici kuru kontak (DI) girişi", "Su ve gaz sayaçları için pulse sayıcı"]
    },
    {
      id: "tamper-alerts",
      icon: "shield",
      kicker: "GÜVENLİK TELEMETRİSİ",
      title: "Anında Kapı Açılma ve Müdahale Alarmı",
      body: "Pano kapısı açıldığı anda saniyenin altında gecikmeyle Class A LoRaWAN alarm paketi fırlatır.",
      items: ["Anlık açılma/kapanma durum bildirimi", "Sabotaj (tamper) algılama anahtarı", "Periyodik sağlıklı çalışma sinyali (heartbeat)"]
    },
    {
      id: "industrial-casing",
      icon: "mount",
      kicker: "GÖVDE KORUMASI",
      title: "IP67 Toz ve Su Geçirmez Endüstriyel Kasa",
      body: "Güneş enerjisi santralleri, rögarlar ve trafo sahaları için UV dayanımlı sağlam polimer gövde.",
      items: ["IP67 tam sızdırmazlık standardı", "-40°C ila +85°C çalışma sıcaklığı", "Harici güçlü mıknatıs ve vida kiti"]
    },
    {
      id: "battery-autonomy",
      icon: "battery",
      kicker: "PİL YÖNETİMİ",
      title: "10 Yıl Kesintisiz Saha Ömrü",
      body: "Düşük güç tüketimiyle 100.000'den fazla açılma olayını kapsayan 10 yıllık pil performansı sunar.",
      items: ["10 yıla varan pil ömrü", "100.000+ anahtarlama döngüsü", "ChirpStack ve TTN hazır entegrasyonu"]
    }
  ];

  trSens.aiFAQ = [
    {
      question: "WillowSens su veya gaz sayacı okumak için kullanılabilir mi?",
      answer: "Evet. Harici dijital giriş klemensleri darbe (pulse) sayıcı olarak yapılandırılabilir. Mekanik su veya gaz sayaçlarının pulse çıkışını sayarak biriken tüketim verisini LoRaWAN üzerinden periyodik iletir."
    },
    {
      question: "Sensör ile mıknatıs arasındaki algılama mesafesi nedir?",
      answer: "Manyetik reed anahtar, yaklaşık 15 mm ila 25 mm aralığındaki açılma/kapanma mesafelerinde kararlı şekilde tetiklenir; bu sayede esnemiş metal pano kapaklarında dahi sorunsuz çalışır."
    },
    {
      question: "Kapı tekrar kapandığında sistem bilgi verir mi?",
      answer: "Evet. Cihaz hem 'Kapı Açıldı' hem de 'Kapı Kapandı' olaylarını ayrı paketlerle iletir ve kapının ne kadar süre açık kaldığını raporlar."
    }
  ];

  // DE Localization
  const deSens = ensureLoc(sens, "de");
  deSens.shortDescription = "Industrieller LoRaWAN-Hub für Magnetkontakte, digitale Eingänge und Impulszählung zur Überwachung von Schaltschränken und Zugängen (IP67).";
  deSens.description = `Der WillowSens (WS-O-X-AI-DS-1) ist ein vielseitiger industrieller LoRaWAN-Telemetrie-Sensor für Türüberwachung, Schaltschrank-Sicherheit in Trafostationen und Impulszählung von Durchflussmessern.

### Flexible Eingänge: Reed, Digitaleingang und Impulszähler
Kombiniert einen internen hochempfindlichen Magnet-Reedkontakt mit externen Klemmen für potenzialfreie Kontakte und schnelle Impulszählung (z.B. für Wasser- oder Gaszähler).

### Sofortige Einbruchs- und Manipulationserkennung
Beim Öffnen von Schaltschränken in unbemannten Trafostationen sendet das Gerät innerhalb von Sekundenbruchteilen ein Prioritätssignal über LoRaWAN an das Sicherheitssystem.

### IP67-Schutz und 10 Jahre Batterielaufzeit
Das robuste IP67-Gehäuse widersteht extremen Temperaturen (-40°C bis +85°C) und Feuchtigkeit. Die Batteriearchitektur ermöglicht bis zu 10 Jahre autarken Betrieb bei über 100.000 Schaltvorgängen.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 7. WILLOWPANIC (Lone Worker & Industrial Panic Button)
// ══════════════════════════════════════════════════════════════════════════════
const panic = site.products.find(p => p.id === "willowpanic");
if (panic) {
  panic.shortDescription = "Rugged LoRaWAN industrial emergency panic button with haptic feedback, LED indicator, and instant priority uplink for lone workers, workplace safety, and healthcare.";
  panic.description = `The WillowPanic (WS-O-X-AI-PB-1) is a heavy-duty industrial LoRaWAN emergency panic button designed for lone worker safety (OSHA/OHS compliance), factory floor distress alerting, healthcare patient calls, and hotel staff security.

### Tactical Emergency Mechanics & Haptic Feedback
Featuring an oversized tactile push button designed for rapid activation even when wearing heavy work gloves, WillowPanic provides clear multi-sensory feedback: an integrated LED indicator and acoustic buzzer instantly confirm that the alert was captured and successfully transmitted. Firmware includes anti-accidental press logic (such as press-and-hold or double-click options).

### Instant Priority LoRaWAN Uplink & Automated Escalation
In hazardous environments such as chemical plants, mining tunnels, remote utility substations, or solitary night shifts, emergency response latency is a matter of life and death. The moment the button is pressed, WillowPanic bypasses all sleep delays and transmits a high-priority Class A LoRaWAN packet. Network servers can automatically route this trigger to security consoles, SMS gateways, siren relays, or emergency dispatchers.

### IP65 Ruggedized Industrial Casing & Long Battery Autonomy
Enclosed in a high-impact, flame-retardant ABS enclosure sealed to IP65, WillowPanic withstands water splashes, dust, and physical drops. Powered by an internal lithium cell optimized for years of standby with periodic heartbeat transmissions, it requires zero maintenance in mission-critical facilities.`;

  panic.detailBlocks = [
    {
      id: "tactile-activation",
      icon: "activity",
      kicker: "TACTICAL INTERFACE",
      title: "Glove-Friendly Push Button & Multi-Sensory Feedback",
      body: "Large tactile dome button provides definite click feel with LED illumination and buzzer confirmation upon emergency transmission.",
      items: ["Large glove-compatible push surface", "Visual LED confirmation ring", "Acoustic buzzer feedback"]
    },
    {
      id: "priority-routing",
      icon: "radio",
      kicker: "EMERGENCY PROTOCOL",
      title: "Zero-Latency Priority LoRaWAN Uplink",
      body: "Bypasses normal periodic sleep states to fire an immediate Class A uplink with automatic ACK confirmations and retransmissions.",
      items: ["Immediate sub-second alarm uplink", "Programmable hold or multi-click trigger", "Automated SMS, email and siren routing"]
    },
    {
      id: "rugged-casing",
      icon: "shield",
      kicker: "INDUSTRIAL RATING",
      title: "IP65 Impact-Resistant Enclosure",
      body: "Robust casing withstands harsh factory chemicals, washdown splashes, and drops onto concrete floors.",
      items: ["IP65 dust and splash protection", "Wall, desk or lanyard mounting options", "Flame-retardant industrial polymer"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "LONG-LIFE STANDBY",
      title: "Multi-Year Standby with Health Heartbeats",
      body: "Microamp sleep current coupled with daily keep-alive heartbeats ensures the emergency button is always operational when needed.",
      items: ["5+ years standby battery life", "Periodic battery and radio health telemetry", "ChirpStack & TTN ready-to-deploy decoders"]
    }
  ];

  panic.aiFAQ = [
    {
      question: "How does WillowPanic prevent accidental false alarms?",
      answer: "The firmware can be configured via downlink for different trigger modes: instant single click, press-and-hold for 2–3 seconds, or double-click, effectively preventing accidental triggers in high-activity environments."
    },
    {
      question: "How does the user know the emergency signal was received?",
      answer: "Upon pressing the button, the integrated LED flashes and the buzzer emits a distinct confirmation tone as soon as the LoRaWAN gateway acknowledges the transmission."
    },
    {
      question: "Can WillowPanic be mounted on a wall or worn on a belt?",
      answer: "Yes. WillowPanic includes a quick-release wall bracket for fixed mounting in restrooms, hotel rooms, or machine stations, and supports wearable lanyard or belt clip attachments for mobile workers."
    }
  ];

  // TR Localization
  const trPanic = ensureLoc(panic, "tr");
  trPanic.shortDescription = "Yalnız çalışan iş güvenliği (İSG), hastane ve acil durum çağrıları için anlık öncelikli uplink ileten endüstriyel LoRaWAN panik butonu.";
  trPanic.description = `WillowPanic (WS-O-X-AI-PB-1), yalnız çalışan personel güvenliği (İSG / OSHA uyumluluğu), fabrika sahaları, otel personeli güvenliği ve hastane acil çağrı sistemleri için geliştirilmiş endüstriyel LoRaWAN panik ve imdat butonudur.

### Taktiksel Acil Durum Mekaniği ve Çift Yönlü Geri Bildirim
Ağır iş eldivenleriyle dahi kolayca basılabilen geniş ergonomik butona sahiptir. Butona basıldığında entegre LED halkası ve sesli uyarıcı (buzzer), alarmın başarıyla merkeze iletildiğini kullanıcıya anında bildirir. Yanlış alarmları önlemek için uzun basma (2 saniye) veya çift tıklama gibi akıllı tetikleme modları yapılandırılabilir.

### Anlık Öncelikli LoRaWAN İletimi ve Hızlı Müdahale
Kimyasal tesisler, maden ocakları, gece vardiyaları veya izole depolarda acil müdahale saniyelerle yarışır. Butona basıldığı anda tüm uyku döngüleri devre dışı kalır ve en yüksek öncelikli LoRaWAN paketi fırlatılır. Bu sinyal güvenlik merkezine, SMS ağ geçitlerine, acil çağrı sirelerine veya mobil ekiplere anında yönlendirilir.

### IP65 Dayanıklı Kasa ve Yıllarca Süren Pil Güvencesi
Darbe dayanımlı, alev geciktirici gövdesi su sıçramalarına, toza ve düşmelere karşı IP65 korumalıdır. Düşük bekleme akımı ve düzenli sağlık telemetrisi (heartbeat) ile acil bir durumda butona basıldığında her zaman çalışır durumda kalır.`;

  trPanic.detailBlocks = [
    {
      id: "tactile-activation",
      icon: "activity",
      kicker: "KULLANICI ARAYÜZÜ",
      title: "Eldiven Uyumlu Buton ve Çift Yönlü Bildirim",
      body: "Büyük ergonomik buton yüzeyi, basıldığında hissedilen mekanik tıklama hissi, LED ışık ve sesli teyit sunar.",
      items: ["Eldivenle kolay basılabilir geniş yüzey", "Görsel LED teyit halkası", "Sesli buzzer geri bildirimi"]
    },
    {
      id: "priority-routing",
      icon: "radio",
      kicker: "ACİL DURUM PROTOKOLÜ",
      title: "Sıfır Gecikmeli Öncelikli LoRaWAN İletimi",
      body: "Bekleme süresini atlayarak en yüksek öncelikli Class A uplink fırlatır; SMS, siren veya güvenlik konsoluna anında ulaşır.",
      items: ["Saniyenin altında gecikmeyle acil uplink", "Yanlış basmayı önleyen akıllı tetikleme", "Otomatik SMS ve siren entegrasyonu"]
    },
    {
      id: "rugged-casing",
      icon: "shield",
      kicker: "ENDÜSTRİYEL GÖVDE",
      title: "IP65 Darbeye Dayanıklı Güçlü Kasa",
      body: "Fabrika ortamlarındaki toza, neme, kimyasal sıçramalara ve beton zemine düşmelere karşı tam koruma sağlar.",
      items: ["IP65 toz ve sıvı koruması", "Duvara, masaya sabitleme veya kordonla taşıma", "Alev iletmez endüstriyel polimer gövde"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "GÜVENİLİR GÜÇ",
      title: "5+ Yıl Bekleme Süresi ve Sağlık Telemetrisi",
      body: "Günlük sağlıklı çalışma paketi ile pil ve sinyal seviyesini sürekli bildirerek her an göreve hazır bekler.",
      items: ["5 yıldan fazla bekleme süresi", "Düzenli pil ve bağlantı testi (heartbeat)", "ChirpStack ve TTN hazır entegrasyonu"]
    }
  ];

  trPanic.aiFAQ = [
    {
      question: "Yanlışlıkla basmalara karşı nasıl bir önlem vardır?",
      answer: "Cihaz yazılımı üzerinden tek basma, 2-3 saniye basılı tutma veya çift tıklama gibi tetikleme kuralları seçilebilir; bu sayede yoğun çalışma ortamlarında kazara alarm oluşması engellenir."
    },
    {
      question: "Kullanıcı alarmın merkeze ulaştığını nasıl anlar?",
      answer: "Butona basıldığında LED halkası yanıp söner ve ağ geçidinden onay (ACK) alındığı anda sesli uyarıcı teyit melodisi çalarak yardım çağrısının iletildiğini doğrular."
    },
    {
      question: "Cihaz duvara sabitlenebilir mi?",
      answer: "Evet. Ürünle birlikte gelen montaj kiti sayesinde duvara, tezgahlara veya kapı girişlerine sabitlenebileceği gibi, hareketli personel için kordonla boyna asılarak veya kemere takılarak da kullanılabilir."
    }
  ];

  // DE Localization
  const dePanic = ensureLoc(panic, "de");
  dePanic.shortDescription = "Robuster LoRaWAN-Industrie-Paniktaster mit haptischer Rückmeldung, LED und sofortiger Alarmübertragung für Alleinarbeiter und Arbeitssicherheit.";
  dePanic.description = `Der WillowPanic (WS-O-X-AI-PB-1) ist ein robuster industrieller LoRaWAN-Notfalltaster für den Alleinarbeiterschutz (Arbeitssicherheit), Produktionshallen, Logistiklager und Gesundheitseinrichtungen.

### Taktile Notfallmechanik mit Bestätigung
Die große, auch mit Arbeitshandschuhen sicher bedienbare Taste liefert klares Feedback: Eine LED und ein akustischer Signalgeber bestätigen dem Benutzer sofort, dass der Notruf erfolgreich abgesetzt wurde. Fehlalarme werden durch konfigurierbare Druckdauer (z.B. 2 Sekunden Halten) vermieden.

### Sofortige Prioritäts-Alarmierung über LoRaWAN
Im Ernstfall sendet WillowPanic sofort ein hochpriorisiertes LoRaWAN-Datenpaket, das Notfallpläne, SMS-Warnungen oder Alarmsirenen unverzüglich auslöst.

### IP65-Industriegehäuse und lange Batterielaufzeit
Das robuste IP65-Gehäuse ist staub- und spritzwassergeschützt. Bei extrem geringem Standby-Strom und regelmäßigen Selbsttests garantiert das Gerät über 5 Jahre zuverlässige Einsatzbereitschaft.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 8. WILLOWANE (Ultrasonic Anemometer)
// ══════════════════════════════════════════════════════════════════════════════
const ane = site.products.find(p => p.id === "willowane");
if (ane) {
  ane.shortDescription = "Solid-state LoRaWAN ultrasonic anemometer measuring wind speed and direction with zero moving parts. Ideal for solar farms, cranes, ports, and weather stations.";
  ane.description = `The WillowAne (WS-O-X-AI-WN-1) is a solid-state industrial LoRaWAN ultrasonic anemometer engineered for solar photovoltaic tracking farms, construction tower crane safety, maritime port logistics, and remote meteorological stations.

### Solid-State Ultrasonic Time-of-Flight (ToF) Wind Sensing
Traditional mechanical cup anemometers and wind vanes suffer from bearing wear, friction degradation, and ice jamming during winter freezes. WillowAne utilizes four ultrasonic acoustic transducers positioned in an orthogonal array to calculate wind velocity (0 to 60 m/s) and wind direction (0° to 360°) via high-frequency Time-of-Flight sound phase differences. With zero moving mechanical parts, it delivers lifelong measurement accuracy without physical wear.

### Solar Farm Tracking & Crane Safety Automation
Excessive wind gusts pose severe structural risks to single-axis solar trackers and high-rise construction cranes. WillowAne continuously monitors average wind velocity and peak gust speed. When gusts exceed critical safety thresholds, it immediately broadcasts high-priority LoRaWAN packets, instructing solar tracker controllers to stow panels into protective horizontal positions or sounding crane evacuation alarms.

### IP66 Weatherproof Construction & Autonomous Operation
Constructed from marine-grade anodized aluminum and UV-stabilized polymer, WillowAne withstands coastal salt spray, heavy torrential rain, and gale-force storms. Designed for low power consumption, it integrates seamlessly into solar-powered weather stations or operates autonomously with internal high-capacity batteries.`;

  ane.detailBlocks = [
    {
      id: "ultrasonic-tof",
      icon: "activity",
      kicker: "MEASUREMENT PHYSICS",
      title: "Solid-State Acoustic Time-of-Flight Sensing",
      body: "Four orthogonal ultrasonic transducers calculate wind vector speed and direction without mechanical cups or bearings.",
      items: ["0 to 60 m/s wind speed range (±0.3 m/s accuracy)", "0° to 360° wind direction (±3° accuracy)", "Zero moving mechanical parts to wear or seize"]
    },
    {
      id: "solar-crane-safety",
      icon: "shield",
      kicker: "CRITICAL AUTOMATION",
      title: "High-Wind Gust Protection & Tracker Stow",
      body: "Monitors peak wind gust dynamics and triggers immediate threshold alarms to protect solar trackers and tower cranes from gale damage.",
      items: ["Instant peak gust threshold alarm", "Automatic solar panel stow trigger", "Coastal port and crane safety compliance"]
    },
    {
      id: "marine-enclosure",
      icon: "mount",
      kicker: "ENVIRONMENTAL HARDENING",
      title: "IP66 Marine-Grade Corrosion-Proof Casing",
      body: "Engineered to endure severe weather, freezing sleet, UV exposure, and saline coastal air across all seasons.",
      items: ["IP66 weatherproof sealing", "-40°C to +75°C operating range", "Standard mast/pipe mounting flange"]
    },
    {
      id: "wireless-telemetry",
      icon: "radio",
      kicker: "CONNECTIVITY",
      title: "Long-Range LoRaWAN Meteorological Telemetry",
      body: "Transmits comprehensive wind vectors, temperature, and gust metrics over long distances to cloud platforms.",
      items: ["Long-range LoRaWAN connectivity (up to 15 km)", "Low power consumption architecture", "ChirpStack, TTN and AWS IoT decoders included"]
    }
  ];

  ane.aiFAQ = [
    {
      question: "Why is an ultrasonic anemometer superior to traditional cup-and-vane anemometers?",
      answer: "Mechanical anemometers have bearings that wear down, gather dirt, and freeze solid during ice storms. Ultrasonic anemometers have zero moving parts, require no periodic lubrication or bearing replacement, and maintain calibration accuracy for years."
    },
    {
      question: "Can WillowAne trigger emergency stow on solar trackers?",
      answer: "Yes. When peak wind speeds cross your safety threshold, WillowAne transmits an immediate alarm uplink. Your SCADA or cloud system receives this packet and triggers the tracker motor controllers to rotate panels into a flat stow position."
    },
    {
      question: "What is the maximum wind speed WillowAne can measure?",
      answer: "WillowAne measures wind velocities up to 60 m/s (approx. 216 km/h or 134 mph), covering severe tropical storms, gales, and hurricane-force winds."
    }
  ];

  // TR Localization
  const trAne = ensureLoc(ane, "tr");
  trAne.shortDescription = "Güneş santralleri, kule vinçler ve meteoroloji istasyonları için hareketli parça içermeyen katı hal LoRaWAN ultrasonik anemometre (rüzgâr hızı ve yönü).";
  trAne.description = `WillowAne (WS-O-X-AI-WN-1), güneş enerjisi (GES) takip sistemleri, şantiye kule vinçleri, liman lojistiği ve meteoroloji istasyonları için tasarlanmış, hareketli mekanik parça içermeyen endüstriyel LoRaWAN ultrasonik anemometredir.

### Katı Hal Ultrasonik Uçuş Zamanı (ToF) Rüzgar Ölçümü
Geleneksel pervaneli ve kepçeli anemometreler mekanik rulman aşınması, sürtünme ve kışın donma sorunlarıyla karşılaşır. WillowAne, karşılıklı yerleştirilmiş dört adet ultrasonik akustik transdüser yardımıyla ses dalgalarının uçuş süresi farkını (Time-of-Flight) mikrosaniyeler mertebesinde hesaplar. Rüzgar hızını (0 ila 60 m/s) ve yönünü (0° ila 360°) sıfır mekanik aşınma ve bakım gerektirmeksizin ölçer.

### Güneş Santrali (GES) ve Vinç Güvenlik Otomasyonu
Şiddetli rüzgar ve fırtına darbeleri tek eksenli solar takip sistemlerinde panellerin kırılmasına veya kule vinçlerin devrilmesine yol açabilir. WillowAne anlık rüzgar hızını ve pik fırtına darbelerini sürekli izler. Kritik eşik aşıldığında derhal LoRaWAN alarmı göndererek solar panellerin yatay koruma (stow) moduna geçmesini sağlar veya şantiyede vinç operasyonunu durdurur.

### IP66 Deniz Sınıfı Korozyon Dayanımı ve Kablosuz İletişim
Tuzlu deniz kıyısı havasına, yoğun fırtınaya ve dondurucu soğuklara karşı IP66 korumalı eloksallı alüminyum ve UV dayanımlı gövdeye sahiptir. Uzun menzilli LoRaWAN bağlantısı ile açık alanda 15 km mesafeden meteorolojik verileri kesintisiz iletir.`;

  trAne.detailBlocks = [
    {
      id: "ultrasonic-tof",
      icon: "activity",
      kicker: "ÖLÇÜM FİZİĞİ",
      title: "Katı Hal Akustik ToF Rüzgâr Analizi",
      body: "Dört transdüserli ultrasonik akustik ölçüm mimarisi ile mekanik aşınma ve donma olmadan rüzgar hızını ve yönünü hesaplar.",
      items: ["0 ila 60 m/s rüzgar hızı aralığı (±0,3 m/s hassasiyet)", "0° ila 360° rüzgar yönü (±3° hassasiyet)", "Hareketli parça içermeyen ömürlük kalibrasyon"]
    },
    {
      id: "solar-crane-safety",
      icon: "shield",
      kicker: "GÜVENLİK OTOMASYONU",
      title: "Fırtına Erken Uyarısı ve Güvenli Konum (Stow)",
      body: "Pik rüzgar darbelerini saniyelik takip ederek güneş santralleri ve kule vinçleri devrilme ve kırılmalara karşı korur.",
      items: ["Anlık pik fırtına eşik alarmı", "Güneş panelleri için otomatik stow tetikleme", "Liman ve şantiye İSG mevzuatına uyum"]
    },
    {
      id: "marine-enclosure",
      icon: "mount",
      kicker: "SAHA DAYANIMI",
      title: "IP66 Korozyona Dayanıklı Deniz Sınıfı Kasa",
      body: "Tuzlu sahil havası, şiddetli yağmur ve dona karşı eloksallı alüminyum ve UV korumalı dış gövde.",
      items: ["IP66 tam hava koşullarına dayanıklılık", "-40°C ila +75°C çalışma sıcaklığı", "Standart boru ve direk montaj flanşı"]
    },
    {
      id: "wireless-telemetry",
      icon: "radio",
      kicker: "KABLOSUZ TELEMETRİ",
      title: "Uzun Menzilli LoRaWAN Meteoroloji Ağı",
      body: "Açık arazide 15 km mesafeye kadar rüzgar hızı, yönü ve pik darbe verilerini kablosuz olarak sunucuya taşır.",
      items: ["15 km'ye varan açık alan LoRaWAN menzili", "Düşük güç tüketimli mimari", "ChirpStack ve TTN hazır entegrasyonu"]
    }
  ];

  trAne.aiFAQ = [
    {
      question: "Ultrasonik anemometre mekanik kepçeli anemometrelerden neden daha iyidir?",
      answer: "Mekanik anemometrelerde dönen rulmanlar zamanla tozlanır, aşınır ve kış aylarında buzlanarak kilitlenir. Ultrasonik anemometrede hareketli parça yoktur; yağlama veya parça değişimi gerektirmez ve yıllarca fabrika kalibrasyonunu korur."
    },
    {
      question: "Güneş enerjisi santrallerinde (GES) solar takipçileri nasıl korur?",
      answer: "Rüzgar hızı önceden belirlenen güvenlik sınırını aştığında, WillowAne saniyeler içinde öncelikli alarm iletir. SCADA sisteminiz bu komutu alarak güneş panellerini rüzgar direncini en aza indiren yatay konuma (stow) alır."
    },
    {
      question: "Sensör maksimum ne kadar rüzgar hızını ölçebilir?",
      answer: "WillowAne, 60 m/s'ye (yaklaşık 216 km/s) kadar olan şiddetli fırtına ve kasırga seviyesindeki rüzgarları kesintisiz ölçebilir."
    }
  ];

  // DE Localization
  const deAne = ensureLoc(ane, "de");
  deAne.shortDescription = "Verschleißfreies LoRaWAN-Ultraschall-Anemometer ohne bewegliche Teile zur Messung von Windgeschwindigkeit und -richtung für Solarparks und Kräne (IP66).";
  deAne.description = `Der WillowAne (WS-O-X-AI-WN-1) ist ein industrielles Festkörper-Ultraschall-Anemometer mit LoRaWAN für Solarparks (Tracker-Schutz), Turmdrehkrane, Häfen und Wetterstationen.

### Festkörper-Ultraschallmessung (Time-of-Flight)
Ohne mechanische Schalensterne oder Windfahnen misst WillowAne über vier Ultraschallwandler Windgeschwindigkeit (0 bis 60 m/s) und Windrichtung (0° bis 360°). Die Festkörpertechnologie eliminiert Verschleiß, Schmiermittelbedarf und Vereisungsprobleme im Winter.

### Automatische Notfallabschaltung für Kräne und Tracker
Bei starken Sturmböen sendet WillowAne sofortige Prioritätsalarme, um Solartracker in die schützende Horizontalposition (Stow-Position) zu fahren oder Kräne rechtzeitig stillzulegen.

### IP66-Schutz und weitreichende LoRaWAN-Funktechnik
Das seewasserbeständige Gehäuse aus eloxiertem Aluminium trotzt stärksten Unwettern. Mit LoRaWAN EU868 werden die Messwerte zuverlässig über bis zu 15 km Entfernung übertragen.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 9. WILLOWMOD (Enrich detailBlocks & aiFAQ)
// ══════════════════════════════════════════════════════════════════════════════
const mod = site.products.find(p => p.id === "willowmod");
if (mod) {
  mod.detailBlocks = [
    {
      id: "modbus-polling",
      icon: "radio",
      kicker: "RS485 INTERFACE",
      title: "Configurable Modbus RTU Register Polling",
      body: "Polls multiple slave devices over an RS485 bus using standard Modbus RTU protocol, collecting registers and packing them into compact LoRaWAN payloads.",
      items: ["Supports up to 16 Modbus RTU slave devices", "Baud rates from 1200 to 115200 bps", "Configurable Holding & Input register polling"]
    },
    {
      id: "telemetry-mapping",
      icon: "activity",
      kicker: "DATA INTEGRATION",
      title: "Dynamic Register to LoRaWAN Mapping",
      body: "Maps energy analyzers, flow meters, PLCs, and generator controllers directly into wireless telemetry dashboards without modifying PLC code.",
      items: ["Energy meter (kWh, Voltage, Current) telemetry", "Generator and chiller status monitoring", "Zero-cable wireless plant modernization"]
    },
    {
      id: "industrial-hardware",
      icon: "mount",
      kicker: "MECHANICAL DESIGN",
      title: "DIN-Rail and IP66 Wall Mount Options",
      body: "Engineered for electrical control cabinets and outdoor harsh environments with surge-protected RS485 transceiver ports.",
      items: ["Standard DIN-rail snap-on mounting", "Surge and ESD protected serial lines", "Wide DC power input: 9V to 36V DC"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "FLEXIBLE POWER",
      title: "Line Powered or Long-Life Battery Operation",
      body: "Operates from external 24V DC cabinet power or optional internal backup battery for uninterrupted communication during mains power failure.",
      items: ["Continuous 24V industrial cabinet power", "Mains failure power loss alarm uplink", "ChirpStack, TTN and AWS IoT decoders included"]
    }
  ];

  mod.aiFAQ = [
    {
      question: "How many Modbus slave devices can WillowMod poll?",
      answer: "WillowMod supports up to 16 Modbus RTU slave devices connected across its RS485 bus, reading configured Holding, Input, or Coil registers at user-defined polling intervals."
    },
    {
      question: "Can WillowMod monitor power meters and solar inverters?",
      answer: "Yes. It is widely used to wirelessly read energy meters (kWh, active power, voltage, current), solar inverters, flow meters, and generator controllers, forwarding telemetry to cloud dashboards without costly cable trenching."
    },
    {
      question: "What happens if the main industrial power fails?",
      answer: "If equipped with the optional backup battery, WillowMod immediately transmits a 'Mains Power Loss' alarm uplink over LoRaWAN, notifying maintenance engineers of power outages before communication is interrupted."
    }
  ];

  const trMod = ensureLoc(mod, "tr");
  trMod.detailBlocks = [
    {
      id: "modbus-polling",
      icon: "radio",
      kicker: "RS485 ARAYÜZÜ",
      title: "Yapılandırılabilir Modbus RTU Register Okuma",
      body: "RS485 hattı üzerindeki birden fazla köle (slave) cihazı standart Modbus RTU protokolüyle sorgular ve verileri LoRaWAN paketine dönüştürür.",
      items: ["16 adede kadar Modbus slave cihaz desteği", "1200 ila 115200 bps ayarlanabilir baud rate", "Holding ve Input register okuma desteği"]
    },
    {
      id: "telemetry-mapping",
      icon: "activity",
      kicker: "VERİ ENTEGRASYONU",
      title: "Dinamik Register - LoRaWAN Eşleme",
      body: "PLC, enerji analizörü, debimetre ve jeneratörleri PLC yazılımını değiştirmeden kablosuz bulut paneline bağlar.",
      items: ["Elektrik sayacı (kWh, Akım, Gerilim) telemetrisi", "Jeneratör ve soğutma grubu durum takibi", "Kablo çekmeden kablosuz fabrika modernizasyonu"]
    },
    {
      id: "industrial-hardware",
      icon: "mount",
      kicker: "MEKANİK TASARIM",
      title: "DIN-Ray ve IP66 Pano Montajı",
      body: "Elektrik kontrol panoları için DIN-ray montaj aparatı ve aşırı gerilim korumalı (ESD/Surge) RS485 portları.",
      items: ["Standart DIN-ray raya geçmeli montaj", "Aşırı gerilim ve parazit korumalı seri hat", "Geniş DC besleme aralığı: 9V ila 36V DC"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "GÜÇ YÖNETİMİ",
      title: "Harici Besleme ve Elektrik Kesintisi Alarmı",
      body: "24V pano beslemesiyle sürekli çalışır; opsiyonel dahili batarya ile elektrik kesintilerinde anında uyarı iletir.",
      items: ["24V DC endüstriyel pano beslemesi", "Şebeke kesintisi anlık alarm uplink'i", "ChirpStack ve TTN hazır entegrasyonu"]
    }
  ];

  trMod.aiFAQ = [
    {
      question: "WillowMod kaç adet Modbus cihazını sorgulayabilir?",
      answer: "WillowMod, RS485 hattı üzerinde 16 adede kadar Modbus RTU cihazını adresleyebilir ve her cihazdan seçilen register değerlerini periyodik olarak okuyup LoRaWAN üzerinden iletir."
    },
    {
      question: "Enerji analizörleri ve invertörler için uygun mudur?",
      answer: "Evet. Elektrik sayaçları, güneş enerjisi invertörleri, debimetreler ve jeneratörleri kablo çekmeden uzaktan izlemek için en yaygın kullanılan endüstriyel LoRaWAN köprümüzdür."
    },
    {
      question: "Panonun elektriği kesilirse ne olur?",
      answer: "Opsiyonel yedek bataryalı model, şebeke gerilimi kesildiği anda 'Enerji Kesildi' alarm paketi göndererek teknik ekibi elektrik kesintisinden anında haberdar eder."
    }
  ];

  const deMod = ensureLoc(mod, "de");
  deMod.shortDescription = "Drahtlose RS485 Modbus RTU zu LoRaWAN Schnittstelle für SPS, Energiezähler und Industrieanlagen. Große Reichweite und einfache Integration.";
  deMod.description = `Die WillowMod (WS-O-X-AI-MB-1) ist eine industrielle drahtlose Modbus-RTU-zu-LoRaWAN-Brücke zur Fernauslesung von SPS, Energiezählern, Durchflussmessern und Generatoren über RS485.

### Konfigurierbare Modbus-RTU-Registerauslesung
WillowMod adressiert bis zu 16 Slave-Geräte am RS485-Bus und liest Holding- und Input-Register mit flexiblen Baudraten (1200 bis 115200 bps) aus.

### Schnelle Nachrüstung ohne Kabelverlegung
Statt teurer Steuerleitungen über Fabrikgelände hinweg sendet WillowMod Energiedaten (kWh, Strom, Spannung) und Maschinenstatus drahtlos an zentrale SCADA- und IoT-Plattformen.

### Hutschienenmontage und 24V-Industrieversorgung
Das kompakte DIN-Schienen-Gehäuse mit überspannungsgeschütztem RS485-Port passt in jeden Schaltschrank und wird mit 9–36 V DC versorgt.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 10. EXPAND GERMAN (DE) FOR WILLOWSONIC, WILLOWPRE, WILLOWBEE
// ══════════════════════════════════════════════════════════════════════════════
const sonic = site.products.find(p => p.id === "willowsonic");
if (sonic) {
  const deSonic = ensureLoc(sonic, "de");
  deSonic.description = `Der WillowSonic (WS-O-X-AI-UD-1) ist ein industrieller, berührungsloser LoRaWAN-Ultraschall-Füllstands- und Abstandssensor für Wasserbehälter, Silos, Kanalschächte und Schneeüberwachung.

### Berührungslose akustische Laufzeitmessung (Time-of-Flight)
Mit hochfrequenten Ultraschallimpulsen misst WillowSonic den Abstand zu Flüssigkeiten, Schüttgütern oder Schnee präzise von 0,25 m bis 7,5 m. Da kein Medienkontakt stattfindet, treten im Vergleich zu Tauchsonden weder Korrosion noch Schmutzanhaftungen auf. Ein integrierter Temperatursensor kompensiert temperaturbedingte Schallgeschwindigkeitsänderungen in Echtzeit (-40°C bis +85°C).

### Optimierte Totzone und einfache Montage
Mit einer minimalen Totzone von nur 25 cm und einem schmalen Schallkegel eignet sich der Sensor hervorragend für Schachtabdeckungen, Regenüberlaufbecken und Tanks. Das robuste IP67-Polymergehäuse mit Edelstahlhalterung ist in wenigen Minuten installiert.

### LoRaWAN-Konnektivität und 10 Jahre Batterielaufzeit
Mit LoRaWAN EU868 erreicht WillowSonic Reichweiten von bis zu 15 km im Freifeld und durchdringt dicke Schachtabdeckungen. Dank 19.000 mAh Li-SOCl2-Batterie und 1,5 μA Ruhestrom arbeitet das Gerät bis zu 10 Jahre wartungsfrei.`;

  deSonic.detailBlocks = [
    {
      id: "measurement-mechanics",
      icon: "activity",
      kicker: "MESSVERFAHREN",
      title: "Berührungslose Ultraschallmessung mit Temperaturkompensation",
      body: "Ultraschallimpulse ermitteln den Abstand millimetergenau über Time-of-Flight; der interne Temperatursensor gleicht thermische Drift aus.",
      items: ["0,25 m bis 7,5 m Messbereich", "±1 mm Auflösung mit Rauschfilter", "Wartungsfrei ohne Medienkontakt"]
    },
    {
      id: "installation-guide",
      icon: "mount",
      kicker: "MONTAGE",
      title: "Installation an Tanks, Schächten und Silos",
      body: "Wand- und Deckenmontage mit mindestens 25 cm Abstand zur maximalen Füllhöhe zur Vermeidung von Totzoneneffekten.",
      items: ["IP67 wasser- und wetterfest", "Korrosionsbeständiges Montagekit", "Betriebsbereich: -40°C bis +85°C"]
    },
    {
      id: "payload-integration",
      icon: "radio",
      kicker: "DATENINTEGRATION",
      title: "LoRaWAN-Payload und Decoder",
      body: "Kompaktes Binärdatenpaket überträgt Füllstand, Temperatur und Batteriestand direkt an ChirpStack, TTN und AWS IoT.",
      items: ["Fertige JavaScript-Decoder", "Sofortiger Schwellenwertalarm", "Konfigurierbare Sendeintervalle"]
    },
    {
      id: "power-budget",
      icon: "battery",
      kicker: "ENERGIEVERSORGUNG",
      title: "19.000 mAh Li-SOCl2 Langzeitbatterie",
      body: "Hochenergetische Lithiumchemie und 1,5 μA Ruhestrom garantieren bis zu 10 Jahre autonomen Feldeinsatz.",
      items: ["19.000 mAh Kapazität", "Vor Ort austauschbar", "Batterietelemetrie bei jedem Uplink"]
    }
  ];

  deSonic.aiFAQ = [
    {
      question: "Wie groß ist die Totzone des WillowSonic-Sensors?",
      answer: "Die Totzone (Blindzone) beträgt 0,25 m (25 cm). Der Sensor sollte mindestens 25 cm über dem maximalen Füllstand montiert werden."
    },
    {
      question: "Ist WillowSonic für korrosive Abwasserschächte geeignet?",
      answer: "Ja, das Gehäuse besteht aus chemikalienbeständigem IP67-Polycarbonat und widersteht Schwefelwasserstoff (H2S) und Feuchtigkeit in Kanälen."
    },
    {
      question: "Wie wird die 10-jährige Batterielaufzeit erreicht?",
      answer: "Durch einen extrem geringen Ruhestrom von 1,5 μA und eine 19.000 mAh Lithium-Thionylchlorid-Batterie bei stündlichen Sendeintervallen."
    }
  ];
}

const pre = site.products.find(p => p.id === "willowpre");
if (pre) {
  const dePre = ensureLoc(pre, "de");
  dePre.description = `Der WillowPre (WS-O-X-AI-PS-1) ist ein industrieller LoRaWAN-Flüssigkeits- und Gasdrucksensor für Rohrleitungen, Hydrauliksysteme und Druckbehälter von 0 bis 1500 PSI (100 bar).

### Piezoresistive Druckmessung mit Edelstahlmembran
WillowPre nutzt ein isoliertes piezoresistives Drucksensorelement mit lasergeschweißter 316L-Edelstahlmembran. Es misst Druck von Wasser, Hydrauliköl, Druckluft und Gasen hochpräzise (±0,5 % F.S.) und widersteht Druckstößen (Water Hammer).

### Drahtlose Leckage- und Drucküberwachung
Sinkender Druck signalisiert Rohrbrüche oder Pumpenausfälle; Überdruck droht Leitungen zu beschädigen. WillowPre alarmiert sofort bei Grenzwertverletzungen über LoRaWAN an das Leitsystem.

### IP67-Industriegehäuse und 10 Jahre Autonomie
Mit G1/4" oder NPT-Gewinde lässt sich der Sensor direkt in Rohrleitungen schrauben. Die interne Li-SOCl2-Batterie gewährleistet bis zu 10 Jahre Betrieb.`;

  dePre.detailBlocks = [
    {
      id: "pressure-sensing",
      icon: "activity",
      kicker: "MESSPRINZIP",
      title: "Piezoresistive 316L-Edelstahl-Druckzelle",
      body: "Isolierte Edelstahlmembran misst Drücke bis 1500 PSI mit hoher Langzeitstabilität und Druckstoßfestigkeit.",
      items: ["0 bis 1500 PSI (0–100 bar) Messbereich", "±0,5 % F.S. Messgenauigkeit", "Kompatibel mit Wasser, Öl und Gasen"]
    },
    {
      id: "pipe-mounting",
      icon: "mount",
      kicker: "INSTALLATION",
      title: "G1/4\" & 1/4\" NPT Industrie-Prozessanschluss",
      body: "Wird direkt in T-Stücke oder Druckmessstutzen von Rohrleitungen und Pumpenanlagen geschraubt.",
      items: ["IP67 hermetisch dichtes Gehäuse", "-40°C bis +85°C Medientemperatur", "Integrierter Druckstoßdämpfer"]
    },
    {
      id: "telemetry",
      icon: "radio",
      kicker: "KONNEKTIVITÄT",
      title: "LoRaWAN-Drucktelemetrie & Sofortalarm",
      body: "Überträgt Druck- und Temperaturwerte; bei Druckabfall oder Überdruck erfolgt sofortige Alarmierung.",
      items: ["Sofortiger Druckabfall-Alarm (Leckage)", "ChirpStack, TTN & AWS IoT Decoder", "AES-128 verschlüsselte Telemetrie"]
    },
    {
      id: "battery-autonomy",
      icon: "battery",
      kicker: "BATTERIELEBENSDAUER",
      title: "Bis zu 10 Jahre wartungsfreier Feldeinsatz",
      body: "Hocheffiziente Energiearchitektur für langlebigen Feldeinsatz ohne externe Stromversorgung.",
      items: ["19.000 mAh Li-SOCl2 Batterie", "Mikroampere-Ruhestrom", "Batterieüberwachung bei jedem Uplink"]
    }
  ];

  dePre.aiFAQ = [
    {
      question: "Welche Medien kann WillowPre messen?",
      answer: "Dank der 316L-Edelstahlmembran ist der Sensor für Trinkwasser, Abwasser, Hydrauliköle, Heizöl, Druckluft und inerte Gase geeignet."
    },
    {
      question: "Wie reagiert der Sensor auf plötzliche Druckabfälle?",
      answer: "Der interne Prozessor vergleicht jede Messung mit einstellbaren Schwellenwerten und sendet bei plötzlichem Druckverlust sofort ein Notfall-Datenpaket über LoRaWAN."
    }
  ];
}

const bee = site.products.find(p => p.id === "willowbee");
if (bee) {
  const deBee = ensureLoc(bee, "de");
  deBee.description = `Das WillowBee (WS-O-X-AI-WB-1) ist ein industrielles LoRaWAN-fähiges Funk- und MCU-Modul auf Basis des STMicroelectronics STM32WL (ARM Cortex-M4).

### STM32WL SoC-Architektur mit integriertem LoRa-Funk
Durch die Integration von Mikrocontroller und Sub-GHz-Transceiver auf einem einzigen Halbleiterchip reduziert WillowBee Bauteilekosten, Leiterplattenfläche und Stromverbrauch drastisch. Mit bis zu 22 dBm Sendeleistung und hoher Empfindlichkeit (-137 dBm) eignet es sich ideal für robuste IoT-Endgeräte.

### Vielseitige Schnittstellen und Open-Source-Firmware
Mit UART, SPI, I2C, ADC und GPIOs verbindet das Modul Sensoren direkt. Es ist kompatibel mit LoRaWAN 1.0.3/1.1 (Klasse A/B/C) und unterstützt kundenspezifische Firmwareentwicklung.`;

  deBee.detailBlocks = [
    {
      id: "soc-architecture",
      icon: "chip",
      kicker: "CHIP-ARCHITEKTUR",
      title: "STMicroelectronics STM32WL Single-Core SoC",
      body: "Kombiniert ARM Cortex-M4 mit Sub-GHz-LoRa-Transceiver auf einem Chip für maximale Energie- und Kosteneffizienz.",
      items: ["ARM Cortex-M4 mit bis zu 48 MHz", "256 KB Flash & 64 KB SRAM", "Integrierter TCXO für hohe Frequenzstabilität"]
    },
    {
      id: "rf-performance",
      icon: "radio",
      kicker: "FUNKLEISTUNG",
      title: "Bis zu +22 dBm HF-Ausgangsleistung",
      body: "Maximale Funkreichweite mit hervorragender Empfindlichkeit (-137 dBm in LoRa) für weltweite Sub-GHz-Frequenzbänder.",
      items: ["EU868, US915, AS923 Frequenzunterstützung", "Bis zu +22 dBm Sendeleistung", "Integrierter HF-Schalter"]
    },
    {
      id: "low-power",
      icon: "battery",
      kicker: "ENERGIEVERBRAUCH",
      title: "Ultra-niedriger Ruhestrom unter 1,5 μA",
      body: "Ermöglicht den Bau batteriebetriebener IoT-Sensorknoten mit mehr als 10 Jahren Laufzeit.",
      items: ["<1,5 μA im Deep-Sleep-Modus", "Schnelles Aufwachen für Funkübertragungen", "2,0V bis 3,6V Betriebsspannung"]
    },
    {
      id: "interfaces",
      icon: "terminal",
      kicker: "PERIPHERIE",
      title: "Umfangreiche Sensorschnittstellen",
      body: "Direkter Anschluss digitaler und analoger Sensoren über I2C, SPI, UART und 12-Bit-ADC.",
      items: ["I2C, SPI, 2x USART Peripherie", "12-Bit-ADC mit internem Referenzkanal", "Standard 2,0 mm Stiftleisten-Raster"]
    }
  ];

  deBee.aiFAQ = [
    {
      question: "Welche Entwicklungsumgebungen werden für WillowBee unterstützt?",
      answer: "WillowBee basiert auf dem STM32WL und kann mit STM32CubeIDE, Keil MDK, IAR oder VS Code entwickelt werden."
    },
    {
      question: "Unterstützt WillowBee private LoRa-P2P-Verbindungen?",
      answer: "Ja, neben dem standardmäßigen LoRaWAN-Stack (Klasse A, B, C) kann das Modul auch für proprietäre Punkt-zu-Punkt- (P2P) oder Punkt-zu-Mehrpunkt-LoRa-Funknetze programmiert werden."
    }
  ];
}

// ══════════════════════════════════════════════════════════════════════════════
// 11. LUMIOSAFE (Voice & Light Alert Beacon)
// ══════════════════════════════════════════════════════════════════════════════
const lumioPath = path.join(__dirname, "import-lumiosafe", "product.json");
let lumio = site.products.find(p => p.id === "lumiosafe" || p.id === "product-1792414012667" || p.slug === "lumiosafe");

if (!lumio && fs.existsSync(lumioPath)) {
  const lumioRaw = JSON.parse(fs.readFileSync(lumioPath, "utf8"));
  lumio = {
    ...lumioRaw,
    id: "product-1792414012667",
    slug: "lumiosafe",
    visible: true,
  };
  site.products.push(lumio);
  console.log("Appended LumioSafe to site.products!");
}

if (lumio) {
  lumio.id = "product-1792414012667";
  lumio.slug = "lumiosafe";
  lumio.title = "LumioSafe";
  lumio.name = "LumioSafe";
  lumio.visible = true;
  lumio.category = "tracking";
  lumio.type = "LoRaWAN® Voice & Light Alert Beacon";
  lumio.shortDescription = "LoRaWAN Class C alert beacon combining natural human voice announcements, RGB light effects, and acoustic sirens in one compact battery-powered enclosure.";
  lumio.description = `The LumioSafe (WS-O-X-AI-LS-1) is an industrial-grade LoRaWAN Class C alert beacon engineered for instant audio-visual emergency notification in logistics depots, cold chain warehouses, manufacturing plants, educational campuses, and commercial facilities.

### Natural Human Voice Generation & Zero Audio Streaming
Unlike conventional siren strobes that merely signal that an unspecified problem has occurred, LumioSafe speaks what happened in natural human speech. Up to 49 pre-recorded, studio-quality voice fragments—including alarm classifications, spoken vehicle and zone numbers (0 to 9999), and situational status codes—are stored in local device flash. The application server transmits a tiny 6-to-11 byte downlink message, and LumioSafe instantly constructs and articulates the complete phrase (e.g., "Attention! Vehicle seventeen. Compressor stopped."). Because voice data is decoded at the device edge, it requires zero bandwidth-intensive audio streaming.

### 360° Omnidirectional RGB Illumination & Acoustic Sirens
A central optical window houses four high-lumen RGB LEDs projecting light through a perforated four-petal grille, dispersing vibrant colors and strobe patterns across warehouse halls and high-noise production bays. With 7 distinct colors and 7 lighting effects (including steady, slow strobe, rapid pulse, and dual-color alternating), coupled with 11 acoustic melodies, a sweeping evacuation siren, and customizable buzzer tones, LumioSafe cuts through ambient factory noise with unmistakable urgency.

### LoRaWAN Class C Ultra-Low Latency & Supervised Hardware
Operating in LoRaWAN Class C mode, LumioSafe continuously listens for incoming network downlinks, executing spoken alerts within 2 to 4 seconds of server transmission. Built for zero-maintenance unattended deployment, the device features an independent hardware watchdog, scheduled health uplinks reporting battery voltage and ambient temperature, and dual-fused Li-SOCl2 battery slots with ideal-diode OR-ing.`;

  // Ensure Turkish rich description
  const trLumio = ensureLoc(lumio, "tr");
  trLumio.title = "LumioSafe";
  trLumio.type = "LoRaWAN® Sesli ve Işıklı Uyarı Cihazı";
  trLumio.shortDescription = "Doğal insan sesiyle Türkçe anons, çok renkli RGB ışık ve acil durum sireni içeren endüstriyel LoRaWAN Class C akıllı uyarı ve anons cihazı.";
  trLumio.description = `LumioSafe (WS-O-X-AI-LS-1), lojistik antrepoları, soğuk hava depoları, endüstriyel üretim tesisleri, okullar ve kurumsal binalar için geliştirilmiş kablosuz bir LoRaWAN Class C akıllı sesli ve ışıklı uyarı feneridir.

### Doğal İnsan Sesiyle Anons ve Sıfır Ses Akışı (Edge Decoding)
Geleneksel sirenler sadece belirsiz bir tehlike olduğunu belirtirken, LumioSafe ne olduğunu insan sesiyle net bir şekilde söyler: Cihazın dahili hafızasında alarm türleri, 0-9999 arası araç ve kapı numaraları ile durum mesajlarını içeren 49 adet stüdyo kalitesinde Türkçe ses parçası saklanır. Sunucunuz LoRaWAN üzerinden sadece 6-11 baytlık bir downlink gönderdiğinde, LumioSafe bu parçaları saniyeler içinde birleştirerek eksiksiz bir anons yapar (Örn: "Dikkat! On yedi numaralı araç. Kompresör durdu."). Cihaz içi çözümleme sayesinde yüksek bant genişliği gerektiren ses akışı (streaming) ve internet altyapısına ihtiyaç kalmaz.

### 360° Çok Renkli RGB Işıklandırma ve Siren Modları
Ön ızgaranın arkasında yer alan 4 adet yüksek parlaklıklı RGB LED, 7 farklı renk ve 7 görsel ışık efekti (sürekli, yavaş flaş, hızlı stroboskop, iki renkli yanıp sönme vb.) ile tüm gövdeyi ışıl ışıl aydınlatır. 11 farklı ikaz melodisi ve güçlü tahliye sireni ile birleştiğinde en gürültülü fabrika ortamlarında dahi personelin dikkatini anında çeker.

### LoRaWAN Class C ile Saniyeler İçinde İletim ve Donanım Güvenilirliği
Class C modunda çalıştığı için sürekli dinlemede kalır; downlink gönderildikten sonra 2 ila 4 saniye içinde anons başlar. Bağımsız donanım watchdog'u, çift sigortalı pilleri ve her uplink'te pil/sıcaklık telemetrisi ile kritik tesislerde yıllarca kesintisiz ve bakımsız güvenlik sağlar.`;

  // Ensure German localization
  const deLumio = ensureLoc(lumio, "de");
  deLumio.title = "LumioSafe";
  deLumio.type = "LoRaWAN®-Alarmbake mit Sprach- und Lichtausgabe";
  deLumio.shortDescription = "LoRaWAN Klasse C Alarmbake mit natürlicher Sprachausgabe, RGB-Lichteffekten und Sirene für Hallen, Depots und Schulen.";
  deLumio.description = `Die LumioSafe (WS-O-X-AI-LS-1) ist eine industrielle LoRaWAN-Klasse-C-Alarmbake zur sofortigen audio-visuellen Notfallwarnung in Logistiklagern, Kühlhäusern, Produktionsstätten und Bildungseinrichtungen.

### Natürliche Sprachausgabe ohne Audio-Streaming
Während herkömmliche Sirenen lediglich signalisieren, dass ein Fehler vorliegt, sagt LumioSafe genau, was passiert ist: Auf dem Gerät sind bis zu 49 natürliche Sprachbausteine und Zahlen von 0 bis 9999 gespeichert. Ein Downlink von wenigen Bytes genügt, und die Bake spricht vollständige Sätze (z.B. „Achtung! Fahrzeug 17. Kompressor ausgefallen.“).

### 360°-RGB-Lichteffekte und akustische Melodien
Vier helle RGB-LEDs illuminieren das gesamte Gehäuse in 7 Farben und 7 Effekten (Dauerlicht, Stroboskop, Impuls). Zusammen mit 11 Warntönen und einer Evakuierungssirene durchdringt LumioSafe auch laute Industrieumgebungen zuverlässig.

### LoRaWAN Klasse C mit 2–4 Sekunden Latenz
Dank permanentem Class-C-Empfang erfolgt die Sprachausgabe innerhalb von 2 bis 4 Sekunden nach dem Server-Downlink – ohne Audioverkabelung und ohne Softwareinstallation.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// WRITE LOCAL JSON
// ══════════════════════════════════════════════════════════════════════════════
fs.writeFileSync(siteDataPath, JSON.stringify(site, null, 2), "utf8");
console.log(`Successfully updated local site-data.json with ALL 13 products (including LumioSafe) enriched across EN, TR, DE!`);

// ══════════════════════════════════════════════════════════════════════════════
// SYNC TO SUPABASE IF --apply IS PASSED
// ══════════════════════════════════════════════════════════════════════════════
if (apply) {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables!");
    process.exit(1);
  }

  console.log(`Connecting to Supabase at ${supabaseUrl}...`);
  console.log(`Preparing payload for all ${site.products.length} products (including LumioSafe)...`);

  const rows = site.products.map(p => ({
    id: p.id,
    slug: p.slug || p.id,
    category: p.category || "",
    sort_order: p.sortOrder ?? p.sort_order ?? 0,
    data: p,
    localized: p.localized || {},
    updated_at: new Date().toISOString()
  }));

  const endpoint = `${supabaseUrl}/rest/v1/products?on_conflict=id`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Prefer": "resolution=merge-duplicates"
    },
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Supabase sync failed: HTTP ${response.status}: ${errText}`);
    process.exit(1);
  }

  console.log(`SUCCESS: Successfully synchronized all ${rows.length} products to Supabase production database!`);
} else {
  console.log("Dry-run complete. Run with --apply to push updates to live Supabase database.");
}
