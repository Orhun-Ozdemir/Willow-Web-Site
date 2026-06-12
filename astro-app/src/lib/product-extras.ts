import type { Locale } from "./cms";

export interface ExtraItem {
  icon: string;
  name: Record<string, string>;
  desc: Record<string, string>;
}

export interface ProductExtra {
  parametersKicker?: Record<string, string>;
  parametersTitle?: Record<string, string>;
  parameters: ExtraItem[];
  applications: ExtraItem[];
  applicationsNote?: Record<string, string>;
}

export const PRODUCT_EXTRAS: Record<string, ProductExtra> = {
  "soil-moisture": {
    parametersKicker: {
      en: "Reported parameters",
      tr: "Raporlanan Parametreler",
      de: "Berichtete Parameter",
      fr: "Paramètres rapportés",
      es: "Parámetros reportados",
      it: "Parametri riportati",
      ar: "المعلمات المبلغ عنها",
      ja: "レポートパラメータ"
    },
    parametersTitle: {
      en: "Four signals. One probe.",
      tr: "Dört sinyal. Tek bir prob.",
      de: "Vier Signale. Eine Sonde.",
      fr: "Quatre signaux. Une sonde.",
      es: "Cuatro señales. Una sonda.",
      it: "Quattro segnali. Una sonda.",
      ar: "أربع إشارات. مسبار واحد.",
      ja: "4つの信号。1つのプローブ。"
    },
    parameters: [
      {
        icon: "droplet",
        name: { en: "Soil moisture", tr: "Toprak Nemi", de: "Bodenfeuchtigkeit", fr: "Humidité du sol", es: "Humedad del suelo", it: "Umidità del suolo", ar: "رطوبة التربة", ja: "土壌水分" },
        desc: {
          en: "Water content right at the root zone — the number irrigation decisions should run on.",
          tr: "Kök bölgesindeki su içeriği — sulama kararlarının verilmesi gereken temel veri.",
          de: "Wassergehalt direkt in der Wurzelzone — der Wert, auf dem Bewässerungsentscheidungen basieren sollten.",
          fr: "Teneur en eau directement dans la zone racinaire — la valeur clé pour les décisions d'irrigation.",
          es: "Contenido de agua en la zona de raíces — el dato clave para tomar decisiones de riego.",
          it: "Contenuto d'acqua nella zona delle radici — il valore su cui basare le decisioni di irrigazione.",
          ar: "محتوى الماء في منطقة الجذور مباشرة - الرقم الذي يجب أن تبنى عليه قرارات الري.",
          ja: "根域の水分含有量 — 灌水判断のベースとなる数値。"
        }
      },
      {
        icon: "thermo",
        name: { en: "Soil temperature", tr: "Toprak Sıcaklığı", de: "Bodentemperatur", fr: "Température du sol", es: "Temperatura del suelo", it: "Temperatura del suolo", ar: "درجة حرارة التربة", ja: "土壌温度" },
        desc: {
          en: "In-ground temperature reported alongside every moisture reading.",
          tr: "Her nem ölçümüyle birlikte raporlanan toprak içi sıcaklık verisi.",
          de: "Die Bodentemperatur wird zusammen mit jedem Feuchtigkeitswert gemeldet.",
          fr: "Température du sol rapportée avec chaque mesure d'humidité.",
          es: "Temperatura del suelo reportada junto con cada lectura de humedad.",
          it: "Temperatura del suolo riportata insieme a ogni lettura di umidità.",
          ar: "درجة حرارة التربة التي يتم الإبلاغ عنها مع her قراءة رطوبة.",
          ja: "すべての水分測定値とともに報告される地中温度。"
        }
      },
      {
        icon: "battery",
        name: { en: "Battery & internal temp", tr: "Pil ve İç Sıcaklık", de: "Batterie & Innentemperatur", fr: "Batterie & temp interne", es: "Batería y temp interna", it: "Batteria e temp interna", ar: "البطارية والحرارة الداخلية", ja: "バッテリーと内部温度" },
        desc: {
          en: "Battery level and sensor internal temperature with every uplink.",
          tr: "Her veri gönderiminde raporlanan pil seviyesi ve sensör iç sıcaklığı.",
          de: "Batteriestand und Sensor-Innentemperatur bei jedem Uplink.",
          fr: "Niveau de batterie et température interne du capteur à chaque liaison.",
          es: "Nivel de batería y temperatura interna del sensor con cada envío de datos.",
          it: "Livello della batteria e temperatura interna del sensore ad ogni trasmissione.",
          ar: "مستوى البطارية ودرجة الحرارة الداخلية للمستشعر مع كل إرسال.",
          ja: "毎回のデータ送信ごとのバッテリー残量とセンサー内部温度。"
        }
      },
      {
        icon: "cloud",
        name: { en: "Cloud visualization", tr: "Bulut Görselleştirme", de: "Cloud-Visualisierung", fr: "Visualisation cloud", es: "Visualización en la nube", it: "Visualizzazione cloud", ar: "عرض البيانات سحابيًا", ja: "クラウド可視化" },
        desc: {
          en: "All data can be easily visualized on the cloud.",
          tr: "Tüm veriler bulut üzerinde kolayca görselleştirilebilir.",
          de: "Alle Daten können einfach in der Cloud visualisiert werden.",
          fr: "Toutes les données peuvent être facilement visualisées sur le cloud.",
          es: "Todos los datos se pueden visualizar fácilmente en la nube.",
          it: "Tutti i dati possono essere facilmente visualizzati sul cloud.",
          ar: "يمكن عرض جميع البيانات بسهولة على السحابة.",
          ja: "すべてのデータをクラウド上で簡単に視覚化可能。"
        }
      }
    ],
    applications: [
      {
        icon: "sprout",
        name: { en: "Smart farming", tr: "Akıllı Tarım", de: "Smart Farming", fr: "Agriculture intelligente", es: "Agricultura inteligente", it: "Agricoltura intelligente", ar: "الزراعة الذكية", ja: "スマート農業" },
        desc: {
          en: "Irrigation scheduling driven by live root-zone data.",
          tr: "Canlı kök bölgesi verileriyle yönlendirilen sulama planlaması.",
          de: "Bewässerungsplanung basierend auf Live-Wurzelzonendaten.",
          fr: "Planification de l'irrigation basée sur les données racinaires en direct.",
          es: "Programación de riego impulsada por datos en tiempo real de la zona de raíces.",
          it: "Programmazione dell'irrigazione guidata dai dati in tempo real della zona delle radici.",
          ar: "جدولة الري بناءً على بيانات منطقة الجذور الحية.",
          ja: "生の根域データに基づいた灌水スケジューリング。"
        }
      },
      {
        icon: "leaf",
        name: { en: "Gardens", tr: "Peyzaj ve Bahçeler", de: "Gärten", fr: "Jardins", es: "Jardines", it: "Giardini", ar: "الحدائق", ja: "庭園・造園" },
        desc: {
          en: "Healthy beds and lawns without overwatering.",
          tr: "Aşırı sulama yapmadan sağlıklı bitki yatakları ve çimler.",
          de: "Gesunde Beete und Rasenflächen ohne Überwässerung.",
          fr: "Pelouses et parterres sains sans arrosage excessif.",
          es: "Céspedes y canteros saludables sin exceso de riego.",
          it: "Prati e aiuole sane senza eccessi di irrigazione.",
          ar: "حدائق ومسطحات خضراء صحية دون إفراط في الري.",
          ja: "過剰散水を防ぎ、芝生や花壇を健全に維持。"
        }
      },
      {
        icon: "greenhouse",
        name: { en: "Greenhouses", tr: "Seralar", de: "Gewächshäuser", fr: "Serres", es: "Invernaderos", it: "Serre", ar: "الدفيئات (الصوبات)", ja: "温室・ビニールハウス" },
        desc: {
          en: "Tight moisture control for consistent yields.",
          tr: "İstikrarlı mahsul verimi için hassas nem kontrolü.",
          de: "Präzise Feuchtigkeitskontrolle für gleichmäßige Erträge.",
          fr: "Contrôle strict de l'humidité pour des rendements réguliers.",
          es: "Control riguroso de humedad para rendimientos constantes.",
          it: "Controllo rigoroso dell'umidità per rese costanti.",
          ar: "تحكم دقيق في الرطوبة لضمان إنتاجية مستقرة.",
          ja: "安定した収量を得るための厳密な水分管理。"
        }
      },
      {
        icon: "factory",
        name: { en: "Food industry facilities", tr: "Gıda Endüstrisi", de: "Lebensmittelindustrie", fr: "Installations agroalimentaires", es: "Instalaciones de industria alimentaria", it: "Stabilimenti alimentari", ar: "منشآت الصناعات الغذائية", ja: "食品産業施設" },
        desc: {
          en: "Monitored growing conditions, auditable records.",
          tr: "İzlenen büyüme koşulları ve denetlenebilir kayıtlar.",
          de: "Überwachte Wachstumsbedingungen, prüfbare Aufzeichnungen.",
          fr: "Conditions de croissance surveillées, enregistrements auditables.",
          es: "Condiciones de cultivo monitoreadas y registros auditables.",
          it: "Condizioni di crescita monitorate, record verificabili.",
          ar: "مراقبة ظروف النمو وسجلات قابلة للتدقيق.",
          ja: "栽培条件の監視と監査可能な記録の保持。"
        }
      },
      {
        icon: "barn",
        name: { en: "Farms", tr: "Çiftlikler", de: "Bauernhöfe", fr: "Exploitations", es: "Campos", it: "Fattorie", ar: "المزارع", ja: "大規模農場" },
        desc: {
          en: "Field-scale coverage on a single LoRaWAN gateway.",
          tr: "Tek bir LoRaWAN ağ geçidi ile tarla ölçeğinde kapsama alanı.",
          de: "Feldweite Abdeckung mit einem einzigen LoRaWAN-Gateway.",
          fr: "Couverture à l'échelle des champs sur une seule passerelle LoRaWAN.",
          es: "Cobertura a gran escala con un solo gateway LoRaWAN.",
          it: "Copertura a livello di campo su un singolo gateway LoRaWAN.",
          ar: "تغطية على مستوى المزارع باستخدام بوابة LoRaWAN واحدة.",
          ja: "単一のLoRaWANゲートウェイによる圃場規模のカバレッジ。"
        }
      }
    ],
    applicationsNote: {
      en: "From a single greenhouse bed to field-scale smart farming — one gateway covers the whole site, and every probe reports to the same cloud dashboard.",
      tr: "Tek bir sera yatağından tarla ölçeğinde akıllı tarıma kadar; tek bir ağ geçidi tüm sahayı kapsar ve her prob aynı bulut paneline rapor verir.",
      de: "Vom einzelnen Gewächshausbeet bis zum intelligenten Bauernhof — ein Gateway deckt den gesamten Standort ab, und jede Sonde meldet an dasselbe Cloud-Dashboard.",
      fr: "D'un simple bac de serre à l'agriculture intelligente à l'échelle des champs — une seule passerelle couvre tout le site et chaque sonde transmet au même tableau de bord cloud.",
      es: "Desde un solo cantero de invernadero hasta la agricultura inteligente a gran escala: un solo gateway cubre todo el sitio y cada sonda informa al mismo panel en la nube.",
      it: "Da un singolo letto di serra all'agricoltura intelligente a livello di campo: un singolo gateway copre l'intero sito e ogni sonda invia dati alla stessa dashboard cloud.",
      ar: "من حوض دفيئة واحد إلى الزراعة الذكية على مستوى المزارع - تغطي بوابة واحدة الموقع بأكمله، ويبلغ كل مسبار إلى نفس لوحة التحكم السحابية.",
      ja: "温室内の単一ベンチから圃場規模のスマート農業まで — 1つのゲートウェイで敷地全体をカバーし、すべてのプローブが同一のクラウド画面へレポート。"
    }
  },
  "willowbee-lorawan-module": {
    parametersKicker: {
      en: "Developer ready",
      tr: "Geliştiriciye Hazır",
      de: "Entwicklerbereit",
      fr: "Prêt pour les développeurs",
      es: "Listo para desarrolladores",
      it: "Pronto per gli sviluppatori",
      ar: "جاهز للمطورين",
      ja: "開発者向け設計"
    },
    parametersTitle: {
      en: "Drop it in. Ship your device.",
      tr: "Doğrudan yerleştirin. Cihazınızı hemen sunun.",
      de: "Einfach einsetzen. Gerät ausliefern.",
      fr: "Intégrez-le. Livrez votre produit.",
      es: "Intégrelo y lance su dispositivo.",
      it: "Integralo. Lancia il tuo dispositivo.",
      ar: "قم بدمجه. واشحن جهازك.",
      ja: "組み込むだけで、デバイスの製品化へ。"
    },
    parameters: [
      {
        icon: "radio",
        name: { en: "LoRaWAN 1.1.0 stack", tr: "LoRaWAN 1.1.0 Protokolü", de: "LoRaWAN 1.1.0 Stack", fr: "Pile LoRaWAN 1.1.0", es: "Pila LoRaWAN 1.1.0", it: "Stack LoRaWAN 1.1.0", ar: "بروتوكول LoRaWAN 1.1.0", ja: "LoRaWAN 1.1.0 スタック" },
        desc: {
          en: "Certified-ready stack with downlink support across global frequency bands.",
          tr: "Küresel frekans bantlarında downlink desteğine sahip, sertifikasyona hazır protokol yığını.",
          de: "Zertifizierungsbereiter Stack mit Downlink-Unterstützung für globale Frequenzbänder.",
          fr: "Pile certifiée avec support downlink sur les bandes de fréquences mondiales.",
          es: "Pila certificada con soporte de downlink en bandas de frecuencia globales.",
          it: "Stack certificato con supporto downlink su bande di frequenza globali.",
          ar: "حزمة جاهزة ومعتمدة مع دعم الارتباط الهابط عبر نطاقات التردد العالمية.",
          ja: "世界中の周波数帯でダウンリンクをサポートする、認証済みの通信スタック。"
        }
      },
      {
        icon: "mount",
        name: { en: "Pin-compatible footprint", tr: "Pin Uyumlu Tasarım", de: "Pin-kompatibles Footprint", fr: "Empreinte compatible pin-à-pin", es: "Footprint compatible pin a pin", it: "Footprint pin-compatibile", ar: "تصميم متوافق مع الدبابيس", ja: "ピン互換のフットプリント" },
        desc: {
          en: "Swaps into existing designs built around popular wireless modules.",
          tr: "Popüler kablosuz modüller etrafında oluşturulmuş mevcut tasarımlarla kolayca değiştirilebilir.",
          de: "Austauschbar in bestehenden Designs, die auf gängigen Funkmodulen basieren.",
          fr: "Remplacer facilement les modules sans fil populaires dans les conceptions existantes.",
          es: "Reemplaza fácilmente módulos inalámbricos populares en diseños existentes.",
          it: "Sostituibile in progetti esistenti basati su moduli wireless popolari.",
          ar: "بديل في التصاميم الحالية المبنية حول الوحدات اللاسلكية الشهيرة.",
          ja: "主要な無線モジュールをベースにした既存設計からの置き換えが容易。"
        }
      },
      {
        icon: "battery",
        name: { en: "Battery or DC input", tr: "Batarya veya DC Girişi", de: "Batterie- oder DC-Eingang", fr: "Alimentation pile ou DC", es: "Entrada de batería o CC", it: "Ingresso batteria o DC", ar: "مدخل بطارية أو تيار مستمر", ja: "バッテリーまたはDC入力" },
        desc: {
          en: "Low-power STM32WL design for years of operation in the field.",
          tr: "Sahada yıllarca çalışma sağlayan düşük güç tüketimli STM32WL tasarımı.",
          de: "Stromsparendes STM32WL-Design für jahrelangen Betrieb im Feld.",
          fr: "Conception STM32WL basse consommation pour des années d'autonomie sur le terrain.",
          es: "Diseño de bajo consumo STM32WL para años de operación en campo.",
          it: "Design STM32WL a basso consumo per anni di funzionamento sul campo.",
          ar: "تصميم STM32WL منخفض الطاقة لسنوات من العمل الميداني.",
          ja: "現場での長期間稼働を実現する低消費電力のSTM32WL設計。"
        }
      },
      {
        icon: "check",
        name: { en: "Rich peripherals", tr: "Zengin Çevre Birimleri", de: "Reichhaltige Peripherie", fr: "Périphériques riches", es: "Periféricos ricos", it: "Periferiche ricche", ar: "طرفيات غنية", ja: "豊富な周辺インターフェース" },
        desc: {
          en: "ADC, DAC, GPIO, SPI, UART and I2C drivers out of the box — 15 GPIO pins.",
          tr: "Kutudan çıktığı haliyle ADC, DAC, GPIO, SPI, UART ve I2C sürücüleri — 15 adet GPIO pini.",
          de: "ADC-, DAC-, GPIO-, SPI-, UART- und I2C-Treiber direkt einsatzbereit — 15 GPIO-Pins.",
          fr: "Pilotes ADC, DAC, GPIO, SPI, UART et I2C prêts à l'emploi — 15 broches GPIO.",
          es: "Controladores ADC, DAC, GPIO, SPI, UART e I2C listos para usar — 15 pines GPIO.",
          it: "Driver ADC, DAC, GPIO, SPI, UART e I2C pronti all'uso — 15 pin GPIO.",
          ar: "برامج تشغيل ADC و DAC و GPIO و SPI و UART و I2C جاهزة للاستخدام - 15 دبوس GPIO.",
          ja: "ADC、DAC、GPIO、SPI、UART、およびI2Cドライバーを標準装備 — 15本のGPIOピン。"
        }
      }
    ],
    applications: [
      {
        icon: "mount",
        name: { en: "Smart metering", tr: "Akıllı Sayaçlar", de: "Smart Metering", fr: "Comptage intelligent", es: "Medición inteligente", it: "Misurazione intelligente", ar: "العدادات الذكية", ja: "スマートメーター" },
        desc: {
          en: "Utility meters reporting over kilometres, on battery.",
          tr: "Batarya üzerinden kilometrelerce mesafeden rapor veren kamu hizmeti sayaçları.",
          de: "Verbrauchszähler, die über Kilometer hinweg mit Batterie berichten.",
          fr: "Compteurs de services publics transmettant sur des kilomètres, sur batterie.",
          es: "Medidores de servicios públicos que reportan a kilómetros, a batería.",
          it: "Contatori di servizi pubblici che trasmettono a chilometri di distanza, a batteria.",
          ar: "عدادات المرافق التي ترسل تقاريرها عبر الكيلومترات، وتعمل بالبطارية.",
          ja: "バッテリー駆動で数キロ先へ計測値を送信するライフラインメーター。"
        }
      },
      {
        icon: "factory",
        name: { en: "Industrial monitoring", tr: "Endüstriyel İzleme", de: "Industrielle Überwachung", fr: "Surveillance industrielle", es: "Monitoreo industrial", it: "Monitoraggio industriale", ar: "المراقبة الصناعية", ja: "産業用モニタリング" },
        desc: {
          en: "Condition data from machines and facilities.",
          tr: "Makinelerden ve endüstriyel tesislerden gelen durum verileri.",
          de: "Zustandsdaten von Maschinen und Anlagen.",
          fr: "Données d'état provenant des machines et des installations.",
          es: "Datos de estado de máquinas e instalaciones.",
          it: "Dati sullo stato di macchinari e impianti.",
          ar: "بيانات الحالة من الآلات والمرافق.",
          ja: "機械や各種設備からの稼o稼働ステータスデータ。"
        }
      },
      {
        icon: "sprout",
        name: { en: "Smart agriculture", tr: "Akıllı Tarım", de: "Smart Agriculture", fr: "Agriculture intelligente", es: "Agricultura inteligente", it: "Agricoltura intelligente", ar: "الزراعة الذكية", ja: "スマート農業" },
        desc: {
          en: "The radio core of field sensors like WillowMos.",
          tr: "WillowMos gibi saha sensörlerinin kablosuz iletişim çekirdeği.",
          de: "Der Funkkern für Feldsensoren wie WillowMos.",
          fr: "Le cœur radio des capteurs de terrain comme WillowMos.",
          es: "El núcleo de radio de sensores de campo como WillowMos.",
          it: "Il cuore radio di sensori da campo come WillowMos.",
          ar: "النواة اللاسلكية للمستشعرات الميدانية مثل WillowMos.",
          ja: "WillowMos などの屋外センサーの無線通信部コアとして。"
        }
      },
      {
        icon: "radio",
        name: { en: "Asset tracking", tr: "Varlık Takibi", de: "Asset-Tracking", fr: "Suivi d'actifs", es: "Seguimiento de activos", it: "Tracciamento asset", ar: "تتبع الأصول", ja: "アセットトラッキング" },
        desc: {
          en: "Long-range, low-power location and status beacons.",
          tr: "Uzun menzilli, düşük güç tüketimli konum ve durum sinyalleri.",
          de: "Batteriesparende Ortungs- und Status-Beacons mit hoher Reichweite.",
          fr: "Balises de localisation et d'état basse consommation et longue portée.",
          es: "Balizas de ubicación y estado de bajo consumo y largo alcance.",
          it: "Beacon di localizzazione e stato a lungo raggio e basso consumo.",
          ar: "منارات تحديد الموقع والحالة منخفضة الطاقة وطويلة المدى.",
          ja: "長距離・低消費電力のロケーションおよびステータスビーコン。"
        }
      },
      {
        icon: "greenhouse",
        name: { en: "Smart cities", tr: "Akıllı Şehirler", de: "Smart Cities", fr: "Villes intelligentes", es: "Ciudades inteligentes", it: "Smart City", ar: "المدن الذكية", ja: "スマートシティ" },
        desc: {
          en: "Parking, lighting and environmental nodes.",
          tr: "Otopark, aydınlatma ve çevre izleme düğümleri.",
          de: "Knotenpunkte für Parken, Beleuchtung und Umwelt.",
          fr: "Nœuds de stationnement, d'éclairage et d'environnement.",
          es: "Nodos de estacionamiento, iluminación y medio ambiente.",
          it: "Nodi per parcheggi, illuminazione e ambiente.",
          ar: "عقد مواقف السيارات والإضاءة والبيئة.",
          ja: "駐車場、照明、および環境センサーの各端末ノード。"
        }
      }
    ],
    applicationsNote: {
      en: "One module, every vertical — the same WillowBee core powers metering, tracking and sensing products across all LoRaWAN regions.",
      tr: "Tek bir modül, her sektör; aynı WillowBee çekirdeği, tüm LoRaWAN bölgelerindeki sayaç, takip ve sensör ürünlerine güç sağlar.",
      de: "Ein Modul für jeden Bereich — derselbe WillowBee-Kern treibt Zähler-, Tracking- und Sensorprodukte in allen LoRaWAN-Regionen an.",
      fr: "Un seul module, toutes les applications — le même cœur WillowBee alimente les compteurs, les trackers et les capteurs dans toutes les régions LoRaWAN.",
      es: "Un solo módulo para cada sector: el mismo núcleo WillowBee alimenta productos de medición, seguimiento y sensores en todas las regiones LoRaWAN.",
      it: "Un singolo modulo, per ogni settore: lo stesso core WillowBee alimenta prodotti di misurazione, tracciamento e sensoristica in tutte le regioni LoRaWAN.",
      ar: "وحدة واحدة لجميع القطاعات - تعمل نواة WillowBee نفسها على تشغيل منتجات العدادات والتتبع والاستشعار في جميع مناطق LoRaWAN.",
      ja: "1つのモジュールで全用途へ — 同一の WillowBee コアが、すべての LoRaWAN 地域におけるメーター、トラッカー、センサー製品を駆動。"
    }
  }
};

export function getProductExtras(slug: string): ProductExtra | null {
  return PRODUCT_EXTRAS[slug] || null;
}
