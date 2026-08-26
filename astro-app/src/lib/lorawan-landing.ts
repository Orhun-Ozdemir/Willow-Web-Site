import type { Locale } from "./cms";

type LandingCopy = {
  eyebrow: string;
  seoTitle: string;
  title: string;
  description: string;
  intro: string;
  featuredTitle: string;
  featuredLead: string;
  familiesTitle: string;
  familiesLead: string;
  portfolioTitle: string;
  portfolioLead: string;
  integrationTitle: string;
  integrationText: string;
  evidenceNote: string;
  selectionEyebrow: string;
  selectionTitle: string;
  selectionIntro: string;
  selectionNote: string;
  selectionCriteria: Array<{ title: string; text: string }>;
  comparisonEyebrow: string;
  comparisonTitle: string;
  comparisonLead: string;
  comparisonNote: string;
  categoryBack: string;
  allProducts: string;
};

export const LORAWAN_LANDING_COPY: Record<Locale, LandingCopy> = {
  en: {
    eyebrow: "LoRaWAN hardware portfolio",
    seoTitle: "Industrial LoRaWAN Sensors and IoT Devices",
    title: "Industrial LoRaWAN Sensors for Remote Monitoring",
    description: "Compare WillowSoft LoRaWAN sensors for level, pressure, air quality, temperature, soil moisture, tracking and industrial data collection.",
    intro: "Select LoRaWAN hardware by measurement task and deployment environment. The portfolio covers environmental sensing, level and pressure monitoring, asset and safety events, industrial data collection and embedded product development.",
    featuredTitle: "Start with the measurement task",
    featuredLead: "Open the relevant product page to review its maintained description and technical specifications.",
    familiesTitle: "Browse by operational purpose",
    familiesLead: "Product families follow the work performed in the field. Open a family to compare the products and their current technical information.",
    portfolioTitle: "Current LoRaWAN product portfolio",
    portfolioLead: "Compare products by operational purpose, category and current technical specifications.",
    integrationTitle: "From device data to an operational interface",
    integrationText: "WillowSoft combines hardware, embedded firmware, backend services and web or mobile interfaces. The exact scope is defined for each product and project.",
    evidenceNote: "Frequency plan, enclosure, measurement range and battery information vary by product. Use the product specification and its current datasheet when making a technical selection.",
    selectionEyebrow: "Selection guide",
    selectionTitle: "Choose a LoRaWAN sensor by measurement task",
    selectionIntro: "Begin with what must be measured, then verify the installation, radio, power and data requirements before selecting a device.",
    selectionNote: "An IP rating describes ingress protection under defined test conditions. It does not by itself establish chemical compatibility, radio coverage or installation quality.",
    selectionCriteria: [
      { title: "Measurement", text: "Define the value, unit, expected range and required response time before comparing products." },
      { title: "Installation", text: "Check the enclosure, IP rating, mounting method, temperature exposure and the sensing element's placement." },
      { title: "Radio plan", text: "Confirm the deployment country, supported frequency plan, network type and gateway coverage." },
      { title: "Power and reporting", text: "Set the reporting interval, alert policy and retry behavior; battery life is configuration-dependent." },
      { title: "Data path", text: "Document payload fields, units, decoder version, target platform and operational alert flow." },
      { title: "Field validation", text: "Use the current product specification and datasheet, then validate the selected configuration at a representative site." },
    ],
    comparisonEyebrow: "Product comparison",
    comparisonTitle: "Compare the current LoRaWAN portfolio",
    comparisonLead: "Review every listed LoRaWAN product by purpose and the technical fields available in the maintained catalog.",
    comparisonNote: "Values come from the current catalog record. A dash means that no value is listed in this comparison; check the product page and current datasheet. Communication range and battery life vary with configuration and site conditions.",
    categoryBack: "LoRaWAN sensor portfolio",
    allProducts: "View all products",
  },
  tr: {
    eyebrow: "LoRaWAN donanım portföyü",
    seoTitle: "Endüstriyel LoRaWAN Sensörleri ve IoT Cihazları",
    title: "Uzaktan İzleme için Endüstriyel LoRaWAN Sensörleri",
    description: "Seviye, basınç, hava kalitesi, sıcaklık, toprak nemi, takip ve endüstriyel veri toplama için WillowSoft LoRaWAN sensörlerini karşılaştırın.",
    intro: "LoRaWAN donanımını ölçüm görevine ve kurulum ortamına göre seçin. Portföy; çevresel ölçüm, seviye ve basınç izleme, varlık ve güvenlik olayları, endüstriyel veri toplama ve gömülü ürün geliştirmeyi kapsar.",
    featuredTitle: "Ölçüm görevinden başlayın",
    featuredLead: "Güncel açıklamayı ve teknik özellikleri incelemek için ilgili ürün sayfasını açın.",
    familiesTitle: "Operasyonel amaca göre inceleyin",
    familiesLead: "Ürün aileleri sahada üstlendikleri göreve göre ayrılır. Ürünleri ve güncel teknik bilgilerini karşılaştırmak için bir aile seçin.",
    portfolioTitle: "Güncel LoRaWAN ürün portföyü",
    portfolioLead: "Ürünleri kullanım amacı, kategori ve güncel teknik özelliklerine göre karşılaştırın.",
    integrationTitle: "Cihaz verisinden operasyon arayüzüne",
    integrationText: "WillowSoft; donanım, gömülü yazılım, backend servisleri ile web veya mobil arayüzleri birlikte geliştirir. Kesin kapsam ürün ve projeye göre belirlenir.",
    evidenceNote: "Frekans planı, gövde, ölçüm aralığı ve batarya bilgileri ürüne göre değişir. Teknik seçimde ürün özelliklerini ve güncel datasheet'i esas alın.",
    selectionEyebrow: "Seçim rehberi",
    selectionTitle: "LoRaWAN sensörünü ölçüm görevine göre seçin",
    selectionIntro: "Önce neyin ölçüleceğini belirleyin; cihazı seçmeden önce kurulum, radyo, güç ve veri gereksinimlerini doğrulayın.",
    selectionNote: "IP koruma sınıfı, belirli test koşullarındaki toz ve su giriş korumasını açıklar. Tek başına kimyasal uyumluluğu, radyo kapsamasını veya kurulum kalitesini göstermez.",
    selectionCriteria: [
      { title: "Ölçüm", text: "Ürünleri karşılaştırmadan önce ölçülecek değeri, birimi, beklenen aralığı ve gerekli tepki süresini belirleyin." },
      { title: "Kurulum", text: "Gövdeyi, IP koruma sınıfını, montaj biçimini, sıcaklık etkisini ve algılama elemanının konumunu kontrol edin." },
      { title: "Radyo planı", text: "Kurulum ülkesini, desteklenen frekans planını, ağ türünü ve gateway kapsamasını doğrulayın." },
      { title: "Güç ve raporlama", text: "Raporlama aralığını, alarm politikasını ve retry davranışını belirleyin; batarya ömrü yapılandırmaya bağlıdır." },
      { title: "Veri yolu", text: "Payload alanlarını, birimleri, decoder sürümünü, hedef platformu ve operasyonel alarm akışını belgeleyin." },
      { title: "Saha doğrulaması", text: "Güncel ürün özelliklerini ve datasheet'i kullanın; seçilen yapılandırmayı temsili bir sahada doğrulayın." },
    ],
    comparisonEyebrow: "Ürün karşılaştırması",
    comparisonTitle: "Güncel LoRaWAN portföyünü karşılaştırın",
    comparisonLead: "Listelenen tüm LoRaWAN ürünlerini kullanım amacı ve güncel katalogda yer alan teknik alanlarla birlikte inceleyin.",
    comparisonNote: "Değerler güncel katalog kaydından alınır. Çizgi, bu karşılaştırmada bir değer bulunmadığını gösterir; ürün sayfasını ve güncel datasheet'i kontrol edin. İletişim menzili ve batarya ömrü yapılandırma ile saha koşullarına göre değişir.",
    categoryBack: "LoRaWAN sensör portföyü",
    allProducts: "Tüm ürünleri görüntüle",
  },
  de: {
    eyebrow: "LoRaWAN-Hardwareportfolio",
    seoTitle: "Industrielle LoRaWAN-Sensoren und IoT-Geräte",
    title: "Industrielle LoRaWAN-Sensoren für Fernüberwachung",
    description: "Vergleichen Sie WillowSoft LoRaWAN-Sensoren für Füllstand, Druck, Luftqualität, Temperatur, Bodenfeuchte, Tracking und industrielle Datenerfassung.",
    intro: "Wählen Sie LoRaWAN-Hardware nach Messaufgabe und Einsatzumgebung aus. Das Portfolio umfasst Umweltmessung, Füllstands- und Drucküberwachung, Asset- und Sicherheitsereignisse, industrielle Datenerfassung und Embedded-Produktentwicklung.",
    featuredTitle: "Mit der Messaufgabe beginnen",
    featuredLead: "Öffnen Sie die jeweilige Produktseite, um die aktuelle Beschreibung und die technischen Spezifikationen zu prüfen.",
    familiesTitle: "Nach Einsatzzweck auswählen",
    familiesLead: "Die Produktfamilien folgen ihrer Aufgabe im Feld. Öffnen Sie eine Familie, um Produkte und aktuelle technische Angaben zu vergleichen.",
    portfolioTitle: "Aktuelles LoRaWAN-Produktportfolio",
    portfolioLead: "Vergleichen Sie Produkte nach Einsatzzweck, Kategorie und aktuellen technischen Spezifikationen.",
    integrationTitle: "Von Gerätedaten zur Bedienoberfläche",
    integrationText: "WillowSoft verbindet Hardware, Embedded-Firmware, Backend-Dienste und Web- oder Mobile-Oberflächen. Der genaue Umfang wird je Produkt und Projekt festgelegt.",
    evidenceNote: "Frequenzplan, Gehäuse, Messbereich und Batterieangaben unterscheiden sich je Produkt. Maßgeblich sind Produktspezifikation und aktuelles Datenblatt.",
    selectionEyebrow: "Auswahlleitfaden",
    selectionTitle: "LoRaWAN-Sensor nach Messaufgabe auswählen",
    selectionIntro: "Beginnen Sie mit der Messgröße und prüfen Sie anschließend Einbau, Funk, Energieversorgung und Datenanforderungen, bevor Sie ein Gerät auswählen.",
    selectionNote: "Eine IP-Schutzart beschreibt den Schutz gegen das Eindringen von Staub und Wasser unter definierten Prüfbedingungen. Sie belegt allein weder chemische Beständigkeit noch Funkabdeckung oder Montagequalität.",
    selectionCriteria: [
      { title: "Messaufgabe", text: "Definieren Sie vor dem Vergleich Messgröße, Einheit, erwarteten Bereich und erforderliche Reaktionszeit." },
      { title: "Einbau", text: "Prüfen Sie Gehäuse, IP-Schutzart, Montageart, Temperatureinfluss und die Position des Sensorelements." },
      { title: "Funkplan", text: "Bestätigen Sie Einsatzland, unterstützten Frequenzplan, Netzwerktyp und Gateway-Abdeckung." },
      { title: "Energie und Meldung", text: "Legen Sie Meldeintervall, Alarmregeln und Wiederholungsverhalten fest; die Batterielaufzeit hängt von der Konfiguration ab." },
      { title: "Datenweg", text: "Dokumentieren Sie Payload-Felder, Einheiten, Decoder-Version, Zielplattform und operativen Alarmablauf." },
      { title: "Feldvalidierung", text: "Nutzen Sie aktuelle Produktspezifikation und Datenblatt und validieren Sie die gewählte Konfiguration an einem repräsentativen Standort." },
    ],
    comparisonEyebrow: "Produktvergleich",
    comparisonTitle: "Aktuelles LoRaWAN-Portfolio vergleichen",
    comparisonLead: "Vergleichen Sie alle gelisteten LoRaWAN-Produkte nach Einsatzzweck und den im gepflegten Katalog verfügbaren technischen Angaben.",
    comparisonNote: "Die Werte stammen aus dem aktuellen Katalogdatensatz. Ein Strich bedeutet, dass in diesem Vergleich kein Wert aufgeführt ist; prüfen Sie Produktseite und aktuelles Datenblatt. Reichweite und Batterielaufzeit hängen von Konfiguration und Standort ab.",
    categoryBack: "LoRaWAN-Sensorportfolio",
    allProducts: "Alle Produkte ansehen",
  },
  fr: {
    eyebrow: "Portefeuille matériel LoRaWAN",
    seoTitle: "Capteurs LoRaWAN industriels et appareils IoT",
    title: "Capteurs LoRaWAN industriels pour la télésurveillance",
    description: "Comparez les capteurs LoRaWAN WillowSoft pour le niveau, la pression, la qualité de l’air, la température, l’humidité du sol, le suivi et les données industrielles.",
    intro: "Choisissez le matériel LoRaWAN selon la mesure et l’environnement d’installation. Le portefeuille couvre les mesures environnementales, le niveau et la pression, le suivi des actifs et des alertes de sécurité, la collecte de données industrielles et le développement de produits embarqués.",
    featuredTitle: "Commencer par la mesure",
    featuredLead: "Ouvrez la page du produit concerné pour consulter sa description et ses spécifications techniques à jour.",
    familiesTitle: "Explorer par finalité opérationnelle",
    familiesLead: "Les familles correspondent au rôle assuré sur le terrain. Ouvrez une famille pour comparer les produits et leurs informations techniques actuelles.",
    portfolioTitle: "Portefeuille LoRaWAN actuel",
    portfolioLead: "Comparez les produits selon leur usage, leur catégorie et leurs spécifications techniques actuelles.",
    integrationTitle: "Des données terrain à l’interface opérationnelle",
    integrationText: "WillowSoft réunit matériel, firmware embarqué, services backend et interfaces web ou mobiles. Le périmètre exact est défini pour chaque produit et projet.",
    evidenceNote: "Le plan de fréquences, le boîtier, la plage de mesure et la batterie varient selon le produit. Consultez la spécification et la fiche technique à jour.",
    selectionEyebrow: "Guide de sélection",
    selectionTitle: "Choisir un capteur LoRaWAN selon la mesure",
    selectionIntro: "Commencez par la grandeur à mesurer, puis vérifiez l’installation, la radio, l’alimentation et le chemin des données avant de choisir l’appareil.",
    selectionNote: "Un indice IP décrit la protection contre la pénétration de poussière et d’eau dans des conditions d’essai définies. Il ne garantit pas, à lui seul, la compatibilité chimique, la couverture radio ni la qualité de l’installation.",
    selectionCriteria: [
      { title: "Mesure", text: "Définissez la grandeur, l’unité, la plage attendue et le délai de réaction requis avant de comparer les produits." },
      { title: "Installation", text: "Vérifiez le boîtier, l’indice IP, le montage, l’exposition à la température et la position de l’élément sensible." },
      { title: "Plan radio", text: "Confirmez le pays de déploiement, le plan de fréquences pris en charge, le type de réseau et la couverture des gateways." },
      { title: "Énergie et transmission", text: "Définissez l’intervalle d’envoi, les règles d’alerte et les répétitions ; l’autonomie dépend de la configuration." },
      { title: "Chemin des données", text: "Documentez les champs du payload, les unités, la version du decoder, la plateforme cible et le traitement des alertes." },
      { title: "Validation terrain", text: "Utilisez la spécification et la fiche technique à jour, puis validez la configuration choisie sur un site représentatif." },
    ],
    comparisonEyebrow: "Comparaison des produits",
    comparisonTitle: "Comparer le portefeuille LoRaWAN actuel",
    comparisonLead: "Comparez tous les produits LoRaWAN répertoriés selon leur usage et les données techniques disponibles dans le catalogue à jour.",
    comparisonNote: "Les valeurs proviennent du catalogue actuel. Un tiret signifie qu’aucune valeur n’est indiquée dans ce comparatif ; consultez la page produit et la fiche technique à jour. La portée et l’autonomie varient selon la configuration et le site.",
    categoryBack: "Portefeuille de capteurs LoRaWAN",
    allProducts: "Voir tous les produits",
  },
  es: {
    eyebrow: "Cartera de hardware LoRaWAN",
    seoTitle: "Sensores LoRaWAN industriales y dispositivos IoT",
    title: "Sensores LoRaWAN industriales para monitorización remota",
    description: "Compare sensores LoRaWAN WillowSoft para nivel, presión, calidad del aire, temperatura, humedad del suelo, seguimiento y captura de datos industriales.",
    intro: "Seleccione el hardware LoRaWAN según la tarea de medición y el entorno de instalación. La cartera cubre medición ambiental, nivel y presión, seguimiento de activos y seguridad, captura de datos industriales y desarrollo de productos embebidos.",
    featuredTitle: "Empiece por la tarea de medición",
    featuredLead: "Abra la página del producto correspondiente para consultar su descripción y sus especificaciones técnicas vigentes.",
    familiesTitle: "Explorar por finalidad operativa",
    familiesLead: "Las familias siguen el trabajo realizado en campo. Abra una familia para comparar productos y su información técnica actual.",
    portfolioTitle: "Cartera LoRaWAN actual",
    portfolioLead: "Compare los productos por finalidad, categoría y especificaciones técnicas vigentes.",
    integrationTitle: "De los datos del dispositivo a la interfaz operativa",
    integrationText: "WillowSoft integra hardware, firmware embebido, servicios backend e interfaces web o móviles. El alcance exacto se define para cada producto y proyecto.",
    evidenceNote: "El plan de frecuencia, la carcasa, el rango de medición y la batería varían según el producto. Consulte la especificación y la ficha técnica vigente.",
    selectionEyebrow: "Guía de selección",
    selectionTitle: "Elija un sensor LoRaWAN según la tarea de medición",
    selectionIntro: "Empiece por la magnitud que debe medirse y verifique después la instalación, la radio, la alimentación y los requisitos de datos.",
    selectionNote: "El grado IP describe la protección frente a la entrada de polvo y agua en condiciones de ensayo definidas. Por sí solo no acredita compatibilidad química, cobertura de radio ni calidad de instalación.",
    selectionCriteria: [
      { title: "Medición", text: "Defina la magnitud, la unidad, el rango previsto y el tiempo de respuesta requerido antes de comparar productos." },
      { title: "Instalación", text: "Compruebe la carcasa, el grado IP, el montaje, la exposición térmica y la posición del elemento sensor." },
      { title: "Plan de radio", text: "Confirme el país, el plan de frecuencias compatible, el tipo de red y la cobertura de gateways." },
      { title: "Alimentación y reportes", text: "Defina el intervalo de reporte, las reglas de alerta y los reintentos; la autonomía depende de la configuración." },
      { title: "Ruta de datos", text: "Documente los campos del payload, las unidades, la versión del decoder, la plataforma de destino y el flujo de alertas." },
      { title: "Validación en campo", text: "Use la especificación y la ficha técnica vigentes y valide la configuración elegida en un emplazamiento representativo." },
    ],
    comparisonEyebrow: "Comparación de productos",
    comparisonTitle: "Compare la cartera LoRaWAN actual",
    comparisonLead: "Revise todos los productos LoRaWAN por finalidad y por los campos técnicos disponibles en el catálogo vigente.",
    comparisonNote: "Los valores proceden del catálogo actual. Un guion indica que el dato no figura en esta comparación; consulte la página del producto y la ficha técnica vigente. El alcance y la autonomía varían según la configuración y el entorno.",
    categoryBack: "Cartera de sensores LoRaWAN",
    allProducts: "Ver todos los productos",
  },
  it: {
    eyebrow: "Portafoglio hardware LoRaWAN",
    seoTitle: "Sensori LoRaWAN industriali e dispositivi IoT",
    title: "Sensori LoRaWAN industriali per il monitoraggio remoto",
    description: "Confronta i sensori LoRaWAN WillowSoft per livello, pressione, qualità dell’aria, temperatura, umidità del suolo, tracking e raccolta dati industriali.",
    intro: "Seleziona l’hardware LoRaWAN in base alla misura e all’ambiente di installazione. Il portafoglio copre misure ambientali, livello e pressione, tracking e sicurezza, raccolta dati industriali e sviluppo di prodotti embedded.",
    featuredTitle: "Parti dalla misura",
    featuredLead: "Apri la pagina del prodotto interessato per consultarne la descrizione e le specifiche tecniche aggiornate.",
    familiesTitle: "Esplora per finalità operativa",
    familiesLead: "Le famiglie seguono il compito svolto sul campo. Apri una famiglia per confrontare prodotti e informazioni tecniche aggiornate.",
    portfolioTitle: "Portafoglio LoRaWAN attuale",
    portfolioLead: "Confronta i prodotti per finalità, categoria e specifiche tecniche aggiornate.",
    integrationTitle: "Dai dati del dispositivo all’interfaccia operativa",
    integrationText: "WillowSoft combina hardware, firmware embedded, servizi backend e interfacce web o mobile. L’ambito esatto viene definito per ogni prodotto e progetto.",
    evidenceNote: "Piano di frequenza, involucro, intervallo di misura e batteria variano per prodotto. Fai riferimento alle specifiche e al datasheet aggiornato.",
    selectionEyebrow: "Guida alla scelta",
    selectionTitle: "Scegli il sensore LoRaWAN in base alla misura",
    selectionIntro: "Parti dalla grandezza da misurare, quindi verifica installazione, radio, alimentazione e requisiti dei dati prima di scegliere il dispositivo.",
    selectionNote: "Il grado IP descrive la protezione dall’ingresso di polvere e acqua in condizioni di prova definite. Da solo non dimostra compatibilità chimica, copertura radio o qualità dell’installazione.",
    selectionCriteria: [
      { title: "Misura", text: "Definisci grandezza, unità, intervallo previsto e tempo di risposta richiesto prima di confrontare i prodotti." },
      { title: "Installazione", text: "Verifica involucro, grado IP, montaggio, esposizione termica e posizione dell’elemento sensibile." },
      { title: "Piano radio", text: "Conferma paese di installazione, piano di frequenza supportato, tipo di rete e copertura dei gateway." },
      { title: "Alimentazione e invio", text: "Definisci intervallo di invio, regole di allarme e tentativi; l’autonomia dipende dalla configurazione." },
      { title: "Percorso dati", text: "Documenta campi del payload, unità, versione del decoder, piattaforma di destinazione e flusso degli allarmi." },
      { title: "Validazione sul campo", text: "Usa specifiche e datasheet aggiornati e valida la configurazione scelta in un sito rappresentativo." },
    ],
    comparisonEyebrow: "Confronto prodotti",
    comparisonTitle: "Confronta il portafoglio LoRaWAN attuale",
    comparisonLead: "Esamina tutti i prodotti LoRaWAN per finalità e per i dati tecnici disponibili nel catalogo aggiornato.",
    comparisonNote: "I valori provengono dal catalogo attuale. Un trattino indica che il dato non è riportato in questo confronto; consulta la pagina prodotto e il datasheet aggiornato. Portata e autonomia variano in base a configurazione e sito.",
    categoryBack: "Portafoglio sensori LoRaWAN",
    allProducts: "Vedi tutti i prodotti",
  },
  ar: {
    eyebrow: "مجموعة عتاد LoRaWAN",
    seoTitle: "مستشعرات LoRaWAN الصناعية وأجهزة إنترنت الأشياء",
    title: "مستشعرات LoRaWAN صناعية للمراقبة عن بُعد",
    description: "قارن مستشعرات LoRaWAN من WillowSoft لقياس المستوى والضغط وجودة الهواء والحرارة ورطوبة التربة والتتبع وجمع البيانات الصناعية.",
    intro: "اختر عتاد LoRaWAN حسب مهمة القياس وبيئة التركيب. تشمل المجموعة القياسات البيئية ومراقبة المستوى والضغط وتتبع الأصول والسلامة وجمع البيانات الصناعية وتطوير المنتجات المدمجة.",
    featuredTitle: "ابدأ بمهمة القياس",
    featuredLead: "افتح صفحة المنتج المعني لمراجعة الوصف والمواصفات الفنية الحالية.",
    familiesTitle: "التصفح حسب الغرض التشغيلي",
    familiesLead: "تُصنف عائلات المنتجات وفق المهمة الميدانية. افتح إحدى العائلات لمقارنة المنتجات ومعلوماتها الفنية الحالية.",
    portfolioTitle: "مجموعة منتجات LoRaWAN الحالية",
    portfolioLead: "قارن المنتجات حسب الغرض التشغيلي والفئة والمواصفات الفنية الحالية.",
    integrationTitle: "من بيانات الجهاز إلى واجهة التشغيل",
    integrationText: "تجمع WillowSoft بين العتاد والبرامج الثابتة المدمجة وخدمات الخلفية وواجهات الويب أو الهاتف. يُحدد النطاق الدقيق لكل منتج ومشروع.",
    evidenceNote: "تختلف خطة التردد والغلاف ونطاق القياس والبطارية حسب المنتج. يُرجى الرجوع إلى مواصفات المنتج وورقة البيانات الحالية.",
    selectionEyebrow: "دليل الاختيار",
    selectionTitle: "اختر مستشعر LoRaWAN حسب مهمة القياس",
    selectionIntro: "ابدأ بتحديد ما يجب قياسه، ثم تحقق من متطلبات التركيب والاتصال والطاقة والبيانات قبل اختيار الجهاز.",
    selectionNote: "يصف تصنيف IP الحماية من دخول الغبار والماء ضمن شروط اختبار محددة. ولا يثبت وحده التوافق الكيميائي أو تغطية الاتصال أو جودة التركيب.",
    selectionCriteria: [
      { title: "القياس", text: "حدد القيمة والوحدة والنطاق المتوقع وزمن الاستجابة المطلوب قبل مقارنة المنتجات." },
      { title: "التركيب", text: "تحقق من الغلاف وتصنيف IP وطريقة التثبيت والتعرض للحرارة وموضع عنصر الاستشعار." },
      { title: "خطة الاتصال", text: "أكد بلد التركيب وخطة التردد المدعومة ونوع الشبكة وتغطية بوابات الاتصال." },
      { title: "الطاقة وإرسال البيانات", text: "حدد فترة الإرسال وقواعد التنبيه وسلوك إعادة المحاولة؛ فعمر البطارية يعتمد على الإعداد." },
      { title: "مسار البيانات", text: "وثّق حقول payload والوحدات وإصدار decoder والمنصة المستهدفة ومسار التنبيهات التشغيلية." },
      { title: "التحقق الميداني", text: "استخدم المواصفات وورقة البيانات الحالية، ثم اختبر الإعداد المختار في موقع ممثل لبيئة التشغيل." },
    ],
    comparisonEyebrow: "مقارنة المنتجات",
    comparisonTitle: "قارن مجموعة LoRaWAN الحالية",
    comparisonLead: "راجع جميع منتجات LoRaWAN حسب الغرض والحقول الفنية المتاحة في الكتالوج الحالي.",
    comparisonNote: "القيم مأخوذة من سجل الكتالوج الحالي. تشير الشرطة إلى عدم توفر قيمة في هذه المقارنة؛ راجع صفحة المنتج وورقة البيانات الحالية. يختلف مدى الاتصال وعمر البطارية حسب الإعداد وظروف الموقع.",
    categoryBack: "مجموعة مستشعرات LoRaWAN",
    allProducts: "عرض جميع المنتجات",
  },
  ja: {
    eyebrow: "LoRaWANハードウェア製品群",
    seoTitle: "産業用LoRaWANセンサーとIoTデバイス",
    title: "遠隔監視向け産業用LoRaWANセンサー",
    description: "レベル、圧力、空気質、温度、土壌水分、追跡、産業データ収集に対応するWillowSoftのLoRaWANセンサーを比較できます。",
    intro: "測定対象と設置環境からLoRaWANハードウェアを選定できます。環境計測、レベル・圧力監視、資産追跡・安全通知、産業データ収集、組み込み製品開発に対応します。",
    featuredTitle: "測定対象から選ぶ",
    featuredLead: "該当する製品ページで、最新の説明と技術仕様をご確認ください。",
    familiesTitle: "運用目的から選ぶ",
    familiesLead: "製品群は現場で担う役割ごとに分類されています。各分類から、製品と最新の技術情報を比較できます。",
    portfolioTitle: "現在のLoRaWAN製品ポートフォリオ",
    portfolioLead: "運用目的、カテゴリー、最新の技術仕様から製品を比較できます。",
    integrationTitle: "デバイスデータから運用画面まで",
    integrationText: "WillowSoftは、ハードウェア、組み込みファームウェア、バックエンド、Web・モバイル画面を統合します。正確な範囲は製品・案件ごとに定義します。",
    evidenceNote: "周波数プラン、筐体、測定範囲、電池情報は製品ごとに異なります。選定時は製品仕様と最新データシートをご確認ください。",
    selectionEyebrow: "選定ガイド",
    selectionTitle: "測定対象からLoRaWANセンサーを選ぶ",
    selectionIntro: "最初に測定対象を定義し、設置、無線、電源、データ要件を確認してから機器を選定します。",
    selectionNote: "IP等級は、規定の試験条件における防塵・防水性能を示します。耐薬品性、無線到達性、施工品質を単独で保証するものではありません。",
    selectionCriteria: [
      { title: "測定", text: "製品を比較する前に、測定項目、単位、想定範囲、必要な応答時間を定義します。" },
      { title: "設置", text: "筐体、IP等級、取付方法、温度条件、検出部の位置を確認します。" },
      { title: "無線プラン", text: "設置国、対応周波数プラン、ネットワーク方式、gatewayのカバレッジを確認します。" },
      { title: "電源と送信", text: "送信間隔、アラート条件、再送動作を決めます。電池寿命は設定によって変わります。" },
      { title: "データ経路", text: "payload項目、単位、decoderバージョン、接続先、運用アラートの流れを文書化します。" },
      { title: "現場検証", text: "最新の製品仕様とデータシートを使用し、代表的な設置場所で選定構成を検証します。" },
    ],
    comparisonEyebrow: "製品比較",
    comparisonTitle: "現在のLoRaWAN製品群を比較",
    comparisonLead: "掲載されている全LoRaWAN製品を、用途と現行カタログの技術項目から比較できます。",
    comparisonNote: "値は現行カタログの登録情報に基づきます。ダッシュは、この比較表に値がないことを示します。製品ページと最新データシートをご確認ください。通信距離と電池寿命は設定や現場条件によって変わります。",
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

export const COLLECTION_TABLE_LABELS: Record<Locale, { product: string; measures: string; enclosure: string; measurementRange: string; radio: string; battery: string }> = {
  en: { product: "Product", measures: "Measures / role", enclosure: "Enclosure / IP", measurementRange: "Measurement range", radio: "Radio", battery: "Battery life" },
  tr: { product: "Ürün", measures: "Ölçüm / görev", enclosure: "Gövde / IP", measurementRange: "Ölçüm aralığı", radio: "Radyo", battery: "Pil ömrü" },
  de: { product: "Produkt", measures: "Messaufgabe", enclosure: "Gehäuse / IP", measurementRange: "Messbereich", radio: "Funk", battery: "Batterielaufzeit" },
  fr: { product: "Produit", measures: "Mesure / fonction", enclosure: "Boîtier / IP", measurementRange: "Plage de mesure", radio: "Radio", battery: "Autonomie" },
  es: { product: "Producto", measures: "Medición / función", enclosure: "Carcasa / IP", measurementRange: "Rango de medición", radio: "Radio", battery: "Autonomía" },
  it: { product: "Prodotto", measures: "Misura / funzione", enclosure: "Involucro / IP", measurementRange: "Intervallo di misura", radio: "Radio", battery: "Autonomia" },
  ar: { product: "المنتج", measures: "القياس / الوظيفة", enclosure: "الغلاف / IP", measurementRange: "نطاق القياس", radio: "الاتصال اللاسلكي", battery: "عمر البطارية" },
  ja: { product: "製品", measures: "測定・役割", enclosure: "筐体・IP", measurementRange: "測定範囲", radio: "無線", battery: "電池寿命" },
};

const VALUE_PREFIXES: Record<Locale, { upTo: string; years: string; meters: string }> = {
  en: { upTo: "up to", years: "years", meters: "m" },
  tr: { upTo: "en fazla", years: "yıl", meters: "m" },
  de: { upTo: "bis zu", years: "Jahre", meters: "m" },
  fr: { upTo: "jusqu’à", years: "ans", meters: "m" },
  es: { upTo: "hasta", years: "años", meters: "m" },
  it: { upTo: "fino a", years: "anni", meters: "m" },
  ar: { upTo: "حتى", years: "سنوات", meters: "م" },
  ja: { upTo: "最大", years: "年", meters: "m" },
};

const CATALOG_VALUE_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  "wall-mountable": {
    en: "Wall-mountable", tr: "Duvara monte edilebilir", de: "Wandmontage möglich", fr: "Montage mural", es: "Montaje en pared", it: "Installabile a parete", ar: "قابل للتركيب على الحائط", ja: "壁面取付対応",
  },
  "ip67 wall-mountable": {
    en: "IP67, wall-mountable", tr: "IP67, duvara monte edilebilir", de: "IP67, Wandmontage möglich", fr: "IP67, montage mural", es: "IP67, montaje en pared", it: "IP67, installabile a parete", ar: "IP67، قابل للتركيب على الحائط", ja: "IP67、壁面取付対応",
  },
  "ip67 outdoor-rated": {
    en: "IP67 for outdoor use", tr: "Dış ortam için IP67", de: "IP67 für den Außenbereich", fr: "IP67 pour l’extérieur", es: "IP67 para exterior", it: "IP67 per esterni", ar: "IP67 للاستخدام الخارجي", ja: "屋外用IP67",
  },
  "ip67-rated": {
    en: "IP67", tr: "IP67", de: "IP67", fr: "IP67", es: "IP67", it: "IP67", ar: "IP67", ja: "IP67",
  },
  galvanized: {
    en: "Galvanized", tr: "Galvanizli", de: "Verzinkt", fr: "Galvanisé", es: "Galvanizado", it: "Zincato", ar: "مجلفن", ja: "亜鉛メッキ",
  },
};

/** Localizes the small amount of prose embedded in catalog specification values. */
export function localizeCatalogValue(value: unknown, locale: Locale): string {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) return value.map((item) => localizeCatalogValue(item, locale)).filter(Boolean).join(", ");

  const raw = String(value).trim();
  const direct = CATALOG_VALUE_TRANSLATIONS[raw.toLowerCase()]?.[locale];
  if (direct) return direct;

  const match = raw.match(/^(up to\s+)?([\d.,]+)\s*(years?|kilometers?|km|meters?|m)$/i);
  if (!match) return raw;

  const prefix = VALUE_PREFIXES[locale] || VALUE_PREFIXES.en;
  const hasUpTo = Boolean(match[1]);
  const number = ["tr", "de", "fr", "es", "it"].includes(locale) ? match[2].replace(".", ",") : match[2];
  const unit = match[3].toLowerCase();
  if (unit.startsWith("year")) {
    if (!hasUpTo) return locale === "ja" ? `${number}${prefix.years}` : `${number} ${prefix.years}`;
    return locale === "ja" ? `${prefix.upTo}${number}${prefix.years}` : `${prefix.upTo} ${number} ${prefix.years}`;
  }
  const distanceUnit = unit === "km" || unit.startsWith("kilometer") ? "km" : prefix.meters;
  if (!hasUpTo) return `${number} ${distanceUnit}`;
  return locale === "ja" ? `${prefix.upTo}${number} ${distanceUnit}` : `${prefix.upTo} ${number} ${distanceUnit}`;
}
