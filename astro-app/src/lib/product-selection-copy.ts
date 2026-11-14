export const productSelectionCopy: Record<string, { en: string; tr: string; de: string }> = {
  willowbee: {
    en: "Build battery-powered LoRaWAN sensor nodes with an STM32WL MCU module for embedded designs.",
    tr: "Pille çalışan LoRaWAN sensör düğümleri tasarlamak için STM32WL tabanlı MCU modülü.",
    de: "STM32WL-MCU-Modul zur Entwicklung batteriebetriebener LoRaWAN-Sensorknoten.",
  },
  willowsonic: {
    en: "Measure water tank and silo fill levels without touching the material. This IP67 ultrasonic LoRaWAN sensor measures distances from 28 cm to 7.5 m.",
    tr: "Su tankı ve silo doluluk seviyesini malzemeye temas etmeden ölçün. IP67 korumalı ultrasonik LoRaWAN sensörü 28 cm ile 7,5 m arasında mesafe ölçer.",
    de: "Füllstände in Wassertanks und Silos berührungslos messen. Der LoRaWAN-Ultraschallsensor mit IP67 misst Entfernungen von 28 cm bis 7,5 m.",
  },
  willowair: {
    en: "Monitor indoor air quality in offices and buildings with a LoRaWAN sensor for TVOC, equivalent CO₂ (eCO₂) and temperature.",
    tr: "Ofis ve binalarda TVOC, eşdeğer CO₂ (eCO₂) ve sıcaklık değerlerini LoRaWAN ile izleyin.",
    de: "Innenraumluft in Büros und Gebäuden überwachen. Der LoRaWAN-Sensor erfasst TVOC, CO₂-Äquivalent (eCO₂) und Temperatur.",
  },
  willowgps: {
    en: "Track equipment and fleet assets over LoRaWAN with GPS position, altitude and speed readings.",
    tr: "Ekipman ve filo varlıklarının GPS konumunu, rakımını ve hızını LoRaWAN üzerinden izleyin.",
    de: "Geräte und Flottenobjekte per LoRaWAN orten und GPS-Position, Höhe und Geschwindigkeit erfassen.",
  },
  willowpanic: {
    en: "Give lone workers a way to send a manual alert with an IP67 industrial LoRaWAN panic button.",
    tr: "Yalnız çalışanların manuel alarm göndermesi için IP67 korumalı endüstriyel LoRaWAN panik butonu.",
    de: "Industrieller LoRaWAN-Notruftaster mit IP67 für manuelle Alarme bei Alleinarbeit.",
  },
  willowsens: {
    en: "Monitor whether doors and access points are open or closed with a LoRaWAN door contact sensor.",
    tr: "Kapı ve erişim noktalarının açık veya kapalı durumunu LoRaWAN kapı kontak sensörüyle izleyin.",
    de: "Den Öffnungszustand von Türen und Zugängen mit einem LoRaWAN-Türkontaktsensor überwachen.",
  },
  willowtilt: {
    en: "Monitor changes in tilt and three-axis acceleration on outdoor structures and equipment over LoRaWAN.",
    tr: "Dış ortam yapılarında ve ekipmanda eğim değişimini ve üç eksenli ivmeyi LoRaWAN üzerinden izleyin.",
    de: "Neigungsänderungen und Beschleunigung auf drei Achsen an Außenanlagen und Geräten per LoRaWAN überwachen.",
  },
  willowtemp: {
    en: "Monitor temperature and relative humidity remotely with an IP67 LoRaWAN sensor for outdoor and storage environments.",
    tr: "Dış ortam ve depolama alanlarında sıcaklık ile bağıl nemi IP67 korumalı LoRaWAN sensörüyle uzaktan izleyin.",
    de: "Temperatur und relative Luftfeuchte im Freien und in Lagerbereichen mit einem LoRaWAN-Sensor der Schutzart IP67 überwachen.",
  },
  willowmod: {
    en: "Read RS485 Modbus RTU registers from energy meters and PLCs and transmit the readings over LoRaWAN.",
    tr: "Enerji sayaçları ve PLC’lerdeki RS485 Modbus RTU register’larını okuyup değerleri LoRaWAN üzerinden iletin.",
    de: "RS485-Modbus-RTU-Register von Energiezählern und SPS auslesen und die Messwerte per LoRaWAN übertragen.",
  },
  willowmos: {
    en: "Measure soil moisture and soil temperature over LoRaWAN for irrigation and field monitoring.",
    tr: "Sulama ve tarla takibi için toprak nemini ve sıcaklığını LoRaWAN üzerinden ölçün.",
    de: "Bodenfeuchte und Bodentemperatur für Bewässerung und Feldüberwachung per LoRaWAN messen.",
  },
  willowpre: {
    en: "Monitor liquid pressure in pipes, pumps and tanks with an IP67 LoRaWAN pressure sensor rated for 0–1500 PSI.",
    tr: "Boru, pompa ve tanklardaki sıvı basıncını 0–1500 PSI aralığında, IP67 korumalı LoRaWAN sensörüyle izleyin.",
    de: "Flüssigkeitsdruck in Rohrleitungen, Pumpen und Tanks mit einem IP67-LoRaWAN-Drucksensor für 0–1500 PSI überwachen.",
  },
  willowane: {
    en: "Measure outdoor wind speed and direction with an ultrasonic LoRaWAN anemometer.",
    tr: "Dış ortamda rüzgâr hızını ve yönünü ultrasonik LoRaWAN anemometreyle ölçün.",
    de: "Windgeschwindigkeit und Windrichtung im Freien mit einem LoRaWAN-Ultraschallanemometer messen.",
  },
  lumiosafe: {
    en: "Trigger spoken announcements and visual alerts with a LoRaWAN Class C voice and light beacon.",
    tr: "LoRaWAN Class C sesli ve ışıklı uyarı cihazıyla anons ve görsel uyarı tetikleyin.",
    de: "Sprachansagen und Lichtsignale mit einem LoRaWAN-Signalgeber der Klasse C auslösen.",
  },
};

type SelectionLanguage = "en" | "tr" | "de";

export const productSelectionQuestions: Record<string, Record<SelectionLanguage, [question: string, answer: string]>> = {
  willowbee: {
    en: ["Can I use WillowBee to build a battery-powered LoRaWAN sensor?", "Yes. WillowBee is an STM32WL MCU module for integrating LoRaWAN into a custom sensor node. Before designing the PCB, verify the supply voltage, GPIO needs, antenna layout and regional frequency plan for the chosen variant."],
    tr: ["WillowBee ile pilli bir LoRaWAN sensörü geliştirebilir miyim?", "Evet. WillowBee, özel sensör düğümlerine LoRaWAN eklemek için STM32WL tabanlı bir MCU modülüdür. PCB tasarımından önce seçilen modelin besleme gerilimini, GPIO ihtiyacını, anten yerleşimini ve bölgesel frekans planını doğrulayın."],
    de: ["Eignet sich WillowBee für einen batteriebetriebenen LoRaWAN-Sensor?", "Ja. Das STM32WL-MCU-Modul integriert LoRaWAN in eigene Sensorknoten. Prüfen Sie vor dem Platinenentwurf Versorgungsspannung, GPIO-Bedarf, Antennenlayout und Frequenzplan der gewählten Variante."],
  },
  willowsonic: {
    en: ["Will WillowSonic work in a 7 m water tank?", "BiPOM specifies a target distance of 28–750 cm for its outdoor ultrasonic sensor. At the actual mounting point, measure the distance to the surface when the tank is empty and at maximum fill. Both distances must fall within that range. Allow extra clearance and validate readings on site if foam or obstacles are present."],
    tr: ["WillowSonic 7 metrelik bir su tankında çalışır mı?", "BiPOM, dış ortam ultrasonik sensörü için 28–750 cm hedef mesafesi belirtiyor. Gerçek montaj noktasından tank boşken ve en dolu durumdayken yüzeye olan mesafeyi ölçün. İki mesafe de bu aralıkta kalmalı. Köpük veya engel varsa ek açıklık bırakın ve ölçümü sahada doğrulayın."],
    de: ["Eignet sich WillowSonic für einen 7 m tiefen Wassertank?", "BiPOM gibt für den Outdoor-Ultraschallsensor einen Zielabstand von 28–750 cm an. Messen Sie am tatsächlichen Montagepunkt den Abstand zur Oberfläche bei leerem Tank und bei maximaler Füllung. Beide Abstände müssen im Messbereich liegen. Planen Sie bei Schaum oder Hindernissen zusätzlichen Abstand ein und prüfen Sie die Messung vor Ort."],
  },
  willowair: {
    en: ["Does WillowAir measure CO₂ directly?", "WillowAir reports eCO₂, an equivalent CO₂ value, along with TVOC and temperature. If your specification requires direct CO₂ measurement, choose a sensor that explicitly supports it."],
    tr: ["WillowAir CO₂’yi doğrudan ölçer mi?", "WillowAir, TVOC ve sıcaklıkla birlikte eşdeğer CO₂ değeri olan eCO₂’yi raporlar. Şartnameniz doğrudan CO₂ ölçümü gerektiriyorsa bu özelliği açıkça destekleyen bir sensör seçin."],
    de: ["Misst WillowAir CO₂ direkt?", "WillowAir meldet eCO₂, einen CO₂-Äquivalentwert, sowie TVOC und Temperatur. Wenn Ihre Spezifikation eine direkte CO₂-Messung fordert, wählen Sie einen Sensor, der diese ausdrücklich unterstützt."],
  },
  willowgps: {
    en: ["What should I check before tracking equipment with WillowGPS?", "WillowGPS reports GPS position, altitude and speed over LoRaWAN. Test GPS reception and LoRaWAN coverage independently at the equipment’s mounting point and along its expected route."],
    tr: ["WillowGPS ile ekipman takibinden önce neyi kontrol etmeliyim?", "WillowGPS konum, rakım ve hız verisini LoRaWAN üzerinden iletir. Ekipmanın montaj noktasında ve öngörülen güzergâhta GPS alımını ve LoRaWAN kapsamasını ayrı ayrı test edin."],
    de: ["Was sollte ich vor der Geräteortung mit WillowGPS prüfen?", "WillowGPS überträgt Position, Höhe und Geschwindigkeit per LoRaWAN. Testen Sie GPS-Empfang und LoRaWAN-Abdeckung getrennt am Montageort und entlang der vorgesehenen Route."],
  },
  willowpanic: {
    en: ["What should I test before deploying WillowPanic for lone workers?", "WillowPanic sends a manually triggered alert. Test the complete path from the button through LoRaWAN to the person who responds, including how the team handles a missed or delayed alert."],
    tr: ["Yalnız çalışanlar için WillowPanic kurulumunda neyi test etmeliyim?", "WillowPanic manuel tetiklenen bir alarm gönderir. Butondan LoRaWAN üzerinden alarma müdahale edecek kişiye kadar tüm zinciri test edin. Geciken veya ulaşmayan alarm için izlenecek adımı da doğrulayın."],
    de: ["Was sollte ich vor dem Einsatz von WillowPanic bei Alleinarbeit testen?", "WillowPanic sendet einen manuell ausgelösten Alarm. Testen Sie die gesamte Meldekette vom Taster über LoRaWAN bis zur zuständigen Person, einschließlich des Ablaufs bei verspäteten oder ausgebliebenen Meldungen."],
  },
  willowsens: {
    en: ["Can WillowSens tell whether a door is open or closed?", "Yes. WillowSens reports door contact state over LoRaWAN. During commissioning, check both states and confirm that the receiving application interprets them correctly."],
    tr: ["WillowSens kapının açık veya kapalı olduğunu bildirir mi?", "Evet. WillowSens kapı kontak durumunu LoRaWAN üzerinden iletir. Devreye alırken iki durumu da test edin ve alıcı uygulamanın bunları doğru yorumladığını doğrulayın."],
    de: ["Meldet WillowSens, ob eine Tür offen oder geschlossen ist?", "Ja. WillowSens überträgt den Türkontaktstatus per LoRaWAN. Prüfen Sie bei der Inbetriebnahme beide Zustände und deren korrekte Zuordnung in der Anwendung."],
  },
  willowtilt: {
    en: ["How do I verify WillowTilt readings after installation?", "WillowTilt measures tilt and three-axis acceleration. Record the mounted orientation, establish a reference reading and verify which sensor axis corresponds to the movement you want to detect."],
    tr: ["WillowTilt ölçümlerini montaj sonrası nasıl doğrularım?", "WillowTilt eğimi ve üç eksenli ivmeyi ölçer. Montaj yönünü kaydedin, bir referans ölçümü alın ve takip etmek istediğiniz hareketin hangi sensör eksenine karşılık geldiğini doğrulayın."],
    de: ["Wie prüfe ich WillowTilt-Messwerte nach der Montage?", "WillowTilt misst Neigung und Beschleunigung auf drei Achsen. Dokumentieren Sie die Einbaulage, erfassen Sie einen Referenzwert und prüfen Sie die zur gewünschten Bewegung passende Sensorachse."],
  },
  willowtemp: {
    en: ["What temperature and humidity ranges does WillowTemp cover?", "The brochure lists −20 °C to +80 °C and 0–100% relative humidity. It specifies ±0.2 °C temperature accuracy. For an acceptance test, confirm accuracy requirements at your actual operating points."],
    tr: ["WillowTemp hangi sıcaklık ve nem aralıklarını ölçer?", "Broşürde −20 °C ile +80 °C ve %0–100 bağıl nem belirtiliyor. Sıcaklık doğruluğu ±0,2 °C olarak veriliyor. Kabul testinde gereken doğruluğu gerçek çalışma noktalarınızda doğrulayın."],
    de: ["Welche Temperatur- und Feuchtebereiche deckt WillowTemp ab?", "Die Broschüre nennt −20 °C bis +80 °C und 0–100 % relative Luftfeuchte. Die Temperaturgenauigkeit ist mit ±0,2 °C angegeben. Prüfen Sie die notwendige Genauigkeit für Ihre tatsächlichen Betriebspunkte."],
  },
  willowmod: {
    en: ["How do I read a meter register with WillowMod?", "Set the RS485 serial parameters and first register address to match the meter manual. In the documented WS-O-8-AE-MB-1 uplink example, bytes 2 and 3 are the high and low bytes of register 0. Apply the meter’s signedness, scale and unit before displaying the reading."],
    tr: ["WillowMod ile sayaç register’ı nasıl okunur?", "RS485 seri parametrelerini ve ilk register adresini sayaç kılavuzuyla eşleştirin. WS-O-8-AE-MB-1 kılavuzundaki uplink örneğinde 2. ve 3. indekslerde register 0’ın yüksek ve düşük baytları bulunur. Ölçümü gösterirken sayacın işaret, ölçek ve birim tanımını kullanın."],
    de: ["Wie lese ich ein Zählerregister mit WillowMod aus?", "Gleichen Sie RS485-Parameter und erste Registeradresse mit dem Zählerhandbuch ab. Im dokumentierten Uplink-Beispiel des WS-O-8-AE-MB-1 stehen an Byteposition 2 und 3 das High- und Low-Byte von Register 0. Berücksichtigen Sie Vorzeichen, Skalierung und Einheit des Zählers."],
  },
  willowmos: {
    en: ["Where should I place WillowMos for irrigation monitoring?", "WillowMos measures soil moisture and soil temperature. Place it at a depth representative of the crop’s root zone and compare readings before and after irrigation at that location."],
    tr: ["Sulama takibi için WillowMos nereye yerleştirilmeli?", "WillowMos toprak nemini ve sıcaklığını ölçer. Sensörü bitkinin kök bölgesini temsil eden derinliğe yerleştirin ve aynı noktada sulama öncesi ile sonrası ölçümlerini karşılaştırın."],
    de: ["Wo sollte WillowMos zur Bewässerungsüberwachung platziert werden?", "WillowMos misst Bodenfeuchte und Bodentemperatur. Platzieren Sie den Sensor in einer repräsentativen Tiefe der Wurzelzone und vergleichen Sie die Werte am selben Ort vor und nach der Bewässerung."],
  },
  willowpre: {
    en: ["Can I use WillowPre to measure pipe pressure outdoors?", "The catalog lists an IP67 enclosure and a 0–1500 PSI pressure range. Confirm that the operating pressure, process connection and wetted materials suit your installation before ordering."],
    tr: ["WillowPre dış ortamda boru basıncını ölçebilir mi?", "Katalogda IP67 muhafaza ve 0–1500 PSI basınç aralığı belirtiliyor. Siparişten önce çalışma basıncını, proses bağlantısını ve akışkanla temas eden malzemelerin uygunluğunu doğrulayın."],
    de: ["Kann WillowPre den Rohrleitungsdruck im Freien messen?", "Der Katalog nennt ein IP67-Gehäuse und einen Druckbereich von 0–1500 PSI. Prüfen Sie vor der Bestellung Betriebsdruck, Prozessanschluss und medienberührte Werkstoffe."],
  },
  willowane: {
    en: ["How do I choose a mounting point for WillowAne?", "WillowAne measures wind speed and direction. Select a representative point away from airflow disturbances caused by nearby structures and verify the direction reference after installation."],
    tr: ["WillowAne için montaj noktası nasıl seçilir?", "WillowAne rüzgâr hızını ve yönünü ölçer. Yakın yapıların hava akışını bozmadığı, sahayı temsil eden bir nokta seçin ve montajdan sonra yön referansını doğrulayın."],
    de: ["Wie wähle ich den Montageort für WillowAne?", "WillowAne misst Windgeschwindigkeit und Windrichtung. Wählen Sie einen repräsentativen Standort mit möglichst wenig Strömungsstörungen durch nahe Bauwerke und prüfen Sie nach der Montage den Richtungsbezug."],
  },
  lumiosafe: {
    en: ["Does LumioSafe support English or German voice announcements?", "The current catalog lists a Turkish voice fragment set. Confirm the available language set and firmware with Willow Software before specifying English or German announcements."],
    tr: ["LumioSafe İngilizce veya Almanca sesli anons yapabilir mi?", "Mevcut katalogda Türkçe ses parçaları belirtiliyor. İngilizce veya Almanca anons gereksinimi için kullanılabilir dil paketini ve firmware sürümünü Willow Software ile doğrulayın."],
    de: ["Unterstützt LumioSafe englische oder deutsche Sprachansagen?", "Der aktuelle Katalog nennt türkische Sprachbausteine. Klären Sie verfügbare Sprachpakete und Firmware mit Willow Software, bevor Sie englische oder deutsche Ansagen einplanen."],
  },
};

const additionalSelectionCopy = {
  willowbee: [
    ["Module MCU STM32WL pour intégrer LoRaWAN dans des capteurs sur batterie.", "Quels points vérifier avant de concevoir un capteur avec WillowBee ?", "Vérifiez la tension d’alimentation, les GPIO nécessaires, l’implantation de l’antenne et le plan de fréquences de la variante retenue."],
    ["Módulo MCU STM32WL para integrar LoRaWAN en sensores alimentados por batería.", "¿Qué debo verificar al diseñar un sensor con WillowBee?", "Comprueba la tensión de alimentación, los GPIO necesarios, el diseño de la antena y el plan de frecuencias de la variante elegida."],
    ["Modulo MCU STM32WL per integrare LoRaWAN in sensori alimentati a batteria.", "Cosa verificare prima di progettare un sensore con WillowBee?", "Verifica tensione di alimentazione, GPIO, disposizione dell’antenna e piano di frequenze della variante scelta."],
    ["وحدة STM32WL لدمج LoRaWAN في عقد استشعار تعمل بالبطارية.", "ما الذي يجب التحقق منه قبل تصميم مستشعر باستخدام WillowBee؟", "تحقق من جهد التغذية وأطراف GPIO وتصميم الهوائي وخطة الترددات للطراز المختار."],
    ["電池駆動のセンサーノードにLoRaWANを組み込むSTM32WL MCUモジュールです。", "WillowBeeでセンサーを設計する前に何を確認すべきですか？", "使用するモデルの電源電圧、必要なGPIO、アンテナ配置、地域別周波数プランを確認してください。"],
  ],
  willowsonic: [
    ["Mesurez sans contact le niveau des cuves et des silos avec ce capteur ultrasonique LoRaWAN IP67, de 28 cm à 7,5 m.", "WillowSonic convient-il à une cuve d’eau de 7 m ?", "Mesurez la distance entre le point de montage et la surface à vide et au remplissage maximal. Les deux distances doivent rester entre 28 et 750 cm. En cas de mousse ou d’obstacles, prévoyez une marge et validez la mesure sur site."],
    ["Mide sin contacto el nivel de depósitos y silos con este sensor ultrasónico LoRaWAN IP67, de 28 cm a 7,5 m.", "¿Sirve WillowSonic para un depósito de agua de 7 m?", "Mide desde el punto de montaje hasta la superficie con el depósito vacío y lleno al máximo. Ambas distancias deben quedar entre 28 y 750 cm. Si hay espuma u obstáculos, deja margen y valida la medición en campo."],
    ["Misura senza contatto il livello di serbatoi e silos con questo sensore a ultrasuoni LoRaWAN IP67, da 28 cm a 7,5 m.", "WillowSonic è adatto a un serbatoio d’acqua di 7 m?", "Misura la distanza dal punto di montaggio alla superficie con serbatoio vuoto e al massimo riempimento. Entrambe devono rientrare tra 28 e 750 cm. In presenza di schiuma o ostacoli, lascia un margine e verifica sul posto."],
    ["يقيس مستوى المياه في الخزانات والمواد في الصوامع دون تلامس، باستخدام الموجات فوق الصوتية وLoRaWAN، بحماية IP67 ومدى من 28 سم إلى 7.5 م.", "هل يناسب WillowSonic خزان مياه بعمق 7 أمتار؟", "قس المسافة من موضع التركيب إلى السطح عند فراغ الخزان وعند أقصى امتلاء. يجب أن تبقى المسافتان بين 28 و750 سم. اترك هامشًا إضافيًا واختبر القياس ميدانيًا عند وجود رغوة أو عوائق."],
    ["IP67対応のLoRaWAN超音波センサーで、タンクやサイロのレベルを28 cm～7.5 mの範囲で非接触測定します。", "WillowSonicは深さ7 mの水タンクに使えますか？", "設置位置から空のときと満水時の水面までの距離を確認してください。どちらも28～750 cmの範囲内に収めます。泡や障害物がある場合は余裕を取り、現地で測定を確認してください。"],
  ],
  willowair: [
    ["Surveillez les COV totaux, le CO₂ équivalent et la température de l’air intérieur via LoRaWAN.", "WillowAir mesure-t-il directement le CO₂ ?", "Il rapporte une valeur de CO₂ équivalent (eCO₂), ainsi que les TVOC et la température. Vérifiez que cette mesure répond à votre cahier des charges."],
    ["Supervisa los TVOC, el CO₂ equivalente y la temperatura del aire interior mediante LoRaWAN.", "¿WillowAir mide directamente el CO₂?", "Informa de CO₂ equivalente (eCO₂), TVOC y temperatura. Comprueba que esta medición cumple los requisitos de tu proyecto."],
    ["Monitora TVOC, CO₂ equivalente e temperatura dell’aria interna tramite LoRaWAN.", "WillowAir misura direttamente la CO₂?", "Riporta CO₂ equivalente (eCO₂), TVOC e temperatura. Verifica che questa misura soddisfi i requisiti del progetto."],
    ["يراقب المركبات العضوية المتطايرة الكلية وثاني أكسيد الكربون المكافئ ودرجة الحرارة في الأماكن الداخلية عبر LoRaWAN.", "هل يقيس WillowAir ثاني أكسيد الكربون مباشرة؟", "يبلغ عن قيمة ثاني أكسيد الكربون المكافئ eCO₂ إلى جانب TVOC ودرجة الحرارة. تحقق من أن هذا القياس يلبي متطلبات المشروع."],
    ["室内のTVOC、等価CO₂（eCO₂）、温度をLoRaWANで監視します。", "WillowAirはCO₂を直接測定しますか？", "TVOCと温度に加え、等価CO₂（eCO₂）を報告します。要求仕様に合う測定方式か確認してください。"],
  ],
  willowgps: [
    ["Suivez la position GPS, l’altitude et la vitesse des équipements via LoRaWAN.", "Que vérifier avant de déployer WillowGPS ?", "Testez séparément la réception GPS et la couverture LoRaWAN au point de montage et le long du trajet prévu."],
    ["Supervisa la posición GPS, la altitud y la velocidad de activos mediante LoRaWAN.", "¿Qué debo comprobar antes de instalar WillowGPS?", "Prueba por separado la recepción GPS y la cobertura LoRaWAN en el punto de montaje y a lo largo de la ruta prevista."],
    ["Traccia posizione GPS, altitudine e velocità delle attrezzature tramite LoRaWAN.", "Cosa verificare prima di installare WillowGPS?", "Verifica separatamente la ricezione GPS e la copertura LoRaWAN nel punto di montaggio e lungo il percorso previsto."],
    ["يتابع موقع المعدات وارتفاعها وسرعتها عبر GPS وLoRaWAN.", "ما الذي يجب اختباره قبل تركيب WillowGPS؟", "اختبر استقبال GPS وتغطية LoRaWAN بشكل منفصل في نقطة التركيب وعلى امتداد المسار المتوقع."],
    ["機器のGPS位置、高度、速度をLoRaWANで追跡します。", "WillowGPSの設置前に何を確認すべきですか？", "設置位置と予定経路で、GPS受信とLoRaWANのカバレッジを個別に確認してください。"],
  ],
  willowpanic: [
    ["Bouton d’alerte industriel LoRaWAN IP67 pour les travailleurs isolés.", "Que tester avant de déployer WillowPanic ?", "Vérifiez la chaîne d’alerte depuis le bouton jusqu’à la personne chargée d’intervenir, y compris la procédure en cas de notification retardée ou manquée."],
    ["Botón de pánico industrial LoRaWAN IP67 para trabajadores aislados.", "¿Qué debo probar antes de desplegar WillowPanic?", "Valida todo el recorrido de la alerta, desde el botón hasta la persona responsable de responder, y el procedimiento ante avisos tardíos o perdidos."],
    ["Pulsante di allarme industriale LoRaWAN IP67 per lavoratori isolati.", "Cosa testare prima di installare WillowPanic?", "Verifica la catena dell’allarme dal pulsante al responsabile dell’intervento, inclusa la procedura in caso di avviso ritardato o mancante."],
    ["زر إنذار صناعي يعمل عبر LoRaWAN بحماية IP67 للعاملين بمفردهم.", "ما الذي يجب اختباره قبل نشر WillowPanic؟", "اختبر مسار الإنذار من الزر إلى الشخص المسؤول عن الاستجابة، بما في ذلك الإجراء المتبع عند تأخر التنبيه أو عدم وصوله."],
    ["単独作業者向けのIP67対応LoRaWAN緊急ボタンです。", "WillowPanicの導入前に何をテストすべきですか？", "ボタンから対応担当者までの通知経路を確認し、通知が遅れた場合や届かない場合の手順も検証してください。"],
  ],
  willowsens: [
    ["Détectez l’ouverture et la fermeture des portes et accès via LoRaWAN.", "WillowSens distingue-t-il une porte ouverte d’une porte fermée ?", "Il transmet l’état du contact de porte. À la mise en service, vérifiez que l’application identifie correctement les deux états."],
    ["Detecta la apertura y el cierre de puertas y accesos mediante LoRaWAN.", "¿WillowSens distingue una puerta abierta de una cerrada?", "Transmite el estado del contacto. Durante la puesta en servicio, verifica que la aplicación interprete ambos estados correctamente."],
    ["Rileva l’apertura e la chiusura di porte e accessi tramite LoRaWAN.", "WillowSens distingue una porta aperta da una chiusa?", "Trasmette lo stato del contatto. In fase di collaudo, verifica che l’applicazione interpreti correttamente entrambi gli stati."],
    ["يراقب فتح الأبواب ونقاط الدخول وإغلاقها عبر LoRaWAN.", "هل يميز WillowSens بين الباب المفتوح والمغلق؟", "يرسل حالة تلامس الباب. عند التشغيل، تحقق من أن التطبيق يفسر الحالتين بشكل صحيح."],
    ["ドアや出入口の開閉状態をLoRaWANで監視します。", "WillowSensはドアの開閉を区別できますか？", "ドア接点の状態を送信します。導入時に、開と閉の両方をアプリが正しく解釈することを確認してください。"],
  ],
  willowtilt: [
    ["Surveillez l’inclinaison et l’accélération sur trois axes via LoRaWAN.", "Comment vérifier les mesures de WillowTilt après montage ?", "Relevez l’orientation de montage et une valeur de référence, puis identifiez l’axe correspondant au mouvement à surveiller."],
    ["Supervisa la inclinación y la aceleración en tres ejes mediante LoRaWAN.", "¿Cómo valido las lecturas de WillowTilt tras instalarlo?", "Registra la orientación de montaje y una lectura de referencia, e identifica el eje correspondiente al movimiento que quieres detectar."],
    ["Monitora inclinazione e accelerazione su tre assi tramite LoRaWAN.", "Come verifico le misure di WillowTilt dopo il montaggio?", "Registra l’orientamento e una lettura di riferimento, poi identifica l’asse corrispondente al movimento da rilevare."],
    ["يراقب تغير الميل والتسارع على ثلاثة محاور عبر LoRaWAN.", "كيف أتحقق من قياسات WillowTilt بعد التركيب؟", "سجّل اتجاه التركيب وقراءة مرجعية، ثم حدد محور المستشعر الموافق للحركة المطلوب رصدها."],
    ["傾きと3軸加速度をLoRaWANで監視します。", "設置後にWillowTiltの測定値をどう確認しますか？", "取り付け方向と基準値を記録し、検出したい動きに対応するセンサー軸を確認してください。"],
  ],
  willowtemp: [
    ["Surveillez à distance la température et l’humidité relative avec un capteur LoRaWAN IP67.", "Quelles plages WillowTemp couvre-t-il ?", "La brochure indique −20 à +80 °C et 0 à 100 % d’humidité relative. Elle indique une précision de température de ±0,2 °C. Vérifiez les points de fonctionnement nécessaires à votre application."],
    ["Supervisa a distancia la temperatura y la humedad relativa con un sensor LoRaWAN IP67.", "¿Qué rangos mide WillowTemp?", "El folleto indica de −20 a +80 °C y de 0 a 100 % de humedad relativa, con una precisión de temperatura de ±0,2 °C. Valida los puntos de trabajo de tu aplicación."],
    ["Monitora da remoto temperatura e umidità relativa con un sensore LoRaWAN IP67.", "Quali intervalli misura WillowTemp?", "La brochure indica da −20 a +80 °C e da 0 a 100% di umidità relativa, con accuratezza di temperatura di ±0,2 °C. Verifica i punti operativi richiesti."],
    ["يراقب درجة الحرارة والرطوبة النسبية عن بُعد عبر LoRaWAN بحماية IP67.", "ما نطاقات القياس التي يدعمها WillowTemp؟", "تذكر النشرة نطاقًا من ‎−20 إلى ‎+80 °م ومن 0 إلى 100٪ للرطوبة النسبية، ودقة حرارة ±0.2 °م. تحقق من نقاط التشغيل المطلوبة لتطبيقك."],
    ["IP67対応のLoRaWANセンサーで温度と相対湿度を遠隔監視します。", "WillowTempの測定範囲は？", "製品資料では温度−20～+80 °C、相対湿度0～100%、温度精度±0.2 °Cです。用途に応じて実際の使用条件で確認してください。"],
  ],
  willowmod: [
    ["Lisez les registres de compteurs et d’automates via RS485 Modbus RTU et transmettez les mesures sur LoRaWAN.", "Comment lire un registre de compteur avec WillowMod ?", "Configurez les paramètres RS485 et l’adresse du registre selon le compteur. Dans l’exemple du manuel, les octets d’indice 2 et 3 contiennent les octets fort et faible du registre 0. Appliquez ensuite le signe, l’échelle et l’unité du compteur."],
    ["Lee registros de contadores y PLC por RS485 Modbus RTU y envía las lecturas mediante LoRaWAN.", "¿Cómo leo un registro de un contador con WillowMod?", "Configura los parámetros RS485 y la dirección según el manual del contador. En el ejemplo del manual, los bytes con índice 2 y 3 son el alto y el bajo del registro 0. Aplica el signo, la escala y la unidad del contador."],
    ["Leggi i registri di contatori e PLC via RS485 Modbus RTU e invia le letture tramite LoRaWAN.", "Come leggo un registro di un contatore con WillowMod?", "Configura parametri RS485 e indirizzo secondo il manuale del contatore. Nell’esempio del manuale, i byte con indice 2 e 3 sono il byte alto e quello basso del registro 0. Applica segno, scala e unità del contatore."],
    ["يقرأ سجلات العدادات ووحدات PLC عبر RS485 Modbus RTU ويرسل القراءات عبر LoRaWAN.", "كيف أقرأ سجل عداد باستخدام WillowMod؟", "اضبط معلمات RS485 وعنوان السجل وفق دليل العداد. في مثال دليل الجهاز، يمثل البايتان عند الفهرسين 2 و3 الجزأين الأعلى والأدنى من السجل 0. طبّق تعريف الإشارة والمقياس والوحدة للعداد."],
    ["RS485 Modbus RTUでメーターやPLCのレジスターを読み取り、LoRaWANで送信します。", "WillowModでメーターのレジスターを読むには？", "メーターの取扱説明書に従いRS485設定とアドレスを合わせます。機器マニュアルの例では、インデックス2と3がレジスター0の上位・下位バイトです。メーターの符号、倍率、単位を適用してください。"],
  ],
  willowmos: [
    ["Mesurez l’humidité et la température du sol via LoRaWAN pour le suivi de l’irrigation.", "Où placer WillowMos pour le suivi de l’irrigation ?", "Choisissez une profondeur représentative de la zone racinaire et comparez les mesures au même endroit avant et après l’irrigation."],
    ["Mide la humedad y la temperatura del suelo mediante LoRaWAN para supervisar el riego.", "¿Dónde debo instalar WillowMos para controlar el riego?", "Elige una profundidad representativa de la zona radicular y compara las lecturas en el mismo punto antes y después del riego."],
    ["Misura umidità e temperatura del suolo via LoRaWAN per il monitoraggio dell’irrigazione.", "Dove installare WillowMos per monitorare l’irrigazione?", "Scegli una profondità rappresentativa della zona radicale e confronta le misure nello stesso punto prima e dopo l’irrigazione."],
    ["يقيس رطوبة التربة وحرارتها عبر LoRaWAN لمتابعة الري.", "أين أركب WillowMos لمراقبة الري؟", "اختر عمقًا يمثل منطقة الجذور، وقارن القراءات في الموقع نفسه قبل الري وبعده."],
    ["土壌水分と地温をLoRaWANで測定し、灌漑を監視します。", "灌漑監視用のWillowMosはどこに設置しますか？", "作物の根域を代表する深さに設置し、同じ場所で灌漑前後の測定値を比較してください。"],
  ],
  willowpre: [
    ["Surveillez la pression des liquides dans les conduites et les cuves avec un capteur LoRaWAN IP67 de 0 à 1500 PSI.", "WillowPre convient-il aux conduites extérieures ?", "Le catalogue indique un boîtier IP67 et une plage de 0 à 1500 PSI. Vérifiez la pression de service, le raccord et la compatibilité des matériaux en contact avec le fluide."],
    ["Supervisa la presión de líquidos en tuberías y depósitos con un sensor LoRaWAN IP67 de 0 a 1500 PSI.", "¿Puedo usar WillowPre en tuberías exteriores?", "El catálogo indica protección IP67 y un rango de 0 a 1500 PSI. Confirma la presión de servicio, la conexión y la compatibilidad de los materiales en contacto con el fluido."],
    ["Monitora la pressione dei liquidi in tubazioni e serbatoi con un sensore LoRaWAN IP67 da 0 a 1500 PSI.", "Posso usare WillowPre su tubazioni all’aperto?", "Il catalogo indica protezione IP67 e un intervallo di 0–1500 PSI. Verifica pressione di esercizio, raccordo e compatibilità dei materiali a contatto con il fluido."],
    ["يراقب ضغط السوائل في الأنابيب والخزانات عبر LoRaWAN بحماية IP67 ونطاق 0–1500 PSI.", "هل يناسب WillowPre الأنابيب الخارجية؟", "يحدد الكتالوج حماية IP67 ونطاقًا من 0 إلى 1500 PSI. تحقق من ضغط التشغيل ووصلة العملية وتوافق المواد الملامسة للسائل."],
    ["IP67対応のLoRaWANセンサーで配管やタンク内の液体圧力を0～1500 PSIの範囲で監視します。", "WillowPreは屋外配管の圧力測定に使えますか？", "カタログ仕様はIP67、0～1500 PSIです。使用圧力、プロセス接続、接液部材と流体の適合性を確認してください。"],
  ],
  willowane: [
    ["Mesurez la vitesse et la direction du vent avec un anémomètre ultrasonique LoRaWAN.", "Où installer WillowAne ?", "Choisissez un emplacement représentatif, éloigné des perturbations causées par les structures voisines, puis vérifiez le repère de direction après le montage."],
    ["Mide la velocidad y la dirección del viento con un anemómetro ultrasónico LoRaWAN.", "¿Dónde debo montar WillowAne?", "Elige un punto representativo sin turbulencias de estructuras próximas y verifica la referencia de dirección después del montaje."],
    ["Misura velocità e direzione del vento con un anemometro a ultrasuoni LoRaWAN.", "Dove va montato WillowAne?", "Scegli un punto rappresentativo al riparo dalle perturbazioni delle strutture vicine e verifica il riferimento di direzione dopo il montaggio."],
    ["يقيس سرعة الرياح واتجاهها بمقياس فوق صوتي يعمل عبر LoRaWAN.", "أين أركب WillowAne؟", "اختر نقطة تمثل الموقع بعيدًا عن اضطرابات الهواء التي تسببها المنشآت القريبة، وتحقق من مرجع الاتجاه بعد التركيب."],
    ["超音波式LoRaWAN風速計で風速と風向を測定します。", "WillowAneの設置場所はどう選びますか？", "周辺構造物による気流の乱れが少なく、現場を代表する位置を選び、取り付け後に方位の基準を確認してください。"],
  ],
  lumiosafe: [
    ["Déclenchez des annonces vocales et des signaux lumineux avec une balise LoRaWAN de classe C.", "Quelles langues LumioSafe prend-il en charge pour les annonces ?", "Le catalogue actuel mentionne des éléments vocaux en turc. Confirmez auprès de Willow Software les langues et la version du firmware disponibles pour votre projet."],
    ["Activa avisos por voz y señales luminosas con una baliza LoRaWAN de clase C.", "¿En qué idiomas puede emitir avisos LumioSafe?", "El catálogo actual indica un conjunto de mensajes en turco. Confirma con Willow Software los idiomas y la versión de firmware disponibles para tu proyecto."],
    ["Attiva annunci vocali e segnali luminosi con un dispositivo LoRaWAN di classe C.", "In quali lingue LumioSafe può riprodurre gli annunci?", "Il catalogo attuale indica un set vocale in turco. Verifica con Willow Software le lingue e la versione firmware disponibili per il progetto."],
    ["يطلق إعلانات صوتية وإشارات ضوئية باستخدام منبّه LoRaWAN من الفئة C.", "ما اللغات التي يدعمها LumioSafe في الإعلانات الصوتية؟", "يذكر الكتالوج الحالي مجموعة صوتية باللغة التركية. تحقق من اللغات المتاحة وإصدار البرنامج الثابت مع Willow Software قبل الاختيار."],
    ["LoRaWAN Class Cの通知装置で音声案内と光によるアラートを起動します。", "LumioSafeの音声案内は何語に対応していますか？", "現行カタログにはトルコ語の音声セットが記載されています。必要な言語と対応ファームウェアをWillow Softwareに確認してください。"],
  ],
} as const;

const additionalLanguages = ["fr", "es", "it", "ar", "ja"] as const;

export function localizedProductSelection(slug: string, locale: SelectionLanguage | typeof additionalLanguages[number]) {
  if (locale === "en" || locale === "tr" || locale === "de") {
    return { lead: productSelectionCopy[slug]?.[locale], question: productSelectionQuestions[slug]?.[locale] };
  }
  const entry = additionalSelectionCopy[slug as keyof typeof additionalSelectionCopy]?.[additionalLanguages.indexOf(locale)];
  return { lead: entry?.[0], question: entry ? [entry[1], entry[2]] : undefined };
}
