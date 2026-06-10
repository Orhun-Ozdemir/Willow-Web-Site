# Services Page Araştırması — 2026 (WillowSoft için derlendi)

Bu doküman, B2B mühendislik / IoT / gömülü sistemler hizmet sayfasının 2026'da nasıl olması gerektiğini araştırıp WillowSoft Services sayfasına uygulanacak somut paterni çıkarmak için hazırlanmıştır. Aralık 2025 / Haziran 2026 araştırma verisi üzerinde kurulu.

## 1. Temel rakamlar ve gerçek

- B2B sitelerin **medyan conversion oranı %2.9**. En iyi tasarlanmış siteler **%5-7**'ye ulaşıyor — fark sadece estetikten değil, **mesaj netliğinden** geliyor.
- 2026'nın iki belirleyici akımı: **AI personalization / GEO** (Generative Engine Optimization) ve **buyer clarity** (daha hızlı + daha temiz).
- Mühendis alıcı **marketing yağcılığını cezalandırıyor** — verifiable specs ve net teknik dil her şeyden önce geliyor.

## 2. Sayfanın cevaplaması gereken 9 soru (sırasıyla)

Bir mühendislik hizmet sayfası ziyaretçinin kafasındaki şu soruları **sırasıyla** cevaplamalı:

1. **Ne yapıyorsunuz?** → Hero (tek cümle, jargon yok)
2. **Bana mı?** → Eyebrow + lead paragraf, sektör/persona sinyali
3. **Güvenebilir miyim?** → Sosyal kanıt (logo, sayısal kanıt, sertifika) — **hero altına**
4. **Hangi parçayı?** → Capability listesi (3-5 net kategori, tıklanabilir)
5. **Gerçekten kanıt nerede?** → Görsel showcase, ürün/dashboard fotoğrafları, kod parçası, mimari diyagram
6. **Nasıl çalışıyorsunuz?** → Süreç (4-6 adım, atomic)
7. **Vaka çalışması nerede?** → Case study kartı veya canlı müşteri quote
8. **Ne sorabilirim?** → FAQ (objection handling)
9. **Şimdi ne yapacağım?** → CTA (iki seçenek: speak-to-sales + self-serve)

## 3. Premium mühendislik Services sayfa anatomisi (referans)

```
┌─ HERO ─────────────────────────────────────────────┐
│  • Net value-prop headline (10-15 kelime)          │
│  • Sub-paragraf (1-2 cümle)                        │
│  • Primary CTA + Secondary CTA                     │
│  • Proof bar (50+ customers · 80+ projects · 15+) │
└─────────────────────────────────────────────────────┘
┌─ TRUSTED BY ───────────────────────────────────────┐
│  Logo strip (5-8 brand) — Honeywell, SLB, Beko...  │
└─────────────────────────────────────────────────────┘
┌─ CAPABILITY MATRIX ────────────────────────────────┐
│  4-5 katman, numaralı, tech chip'leri              │
│  → bizde zaten var ✓                                │
└─────────────────────────────────────────────────────┘
┌─ BUILT IN PRODUCTION (görsel showcase) ────────────┐
│  Cihaz fotoğrafları + uygulama + dashboard + VR     │
│  → bizde zaten var ✓                                │
└─────────────────────────────────────────────────────┘
┌─ CASE STUDY (zorunlu — eksik) ─────────────────────┐
│  1-2 derin vaka: problem → WillowSoft yaklaşımı     │
│  → sayı sonuç (ROI, deployment süresi, uptime)      │
│  → müşteri quote                                    │
└─────────────────────────────────────────────────────┘
┌─ PROCESS TIMELINE ─────────────────────────────────┐
│  5 adım, hairline bağlantı, hover state              │
│  → bizde zaten var ✓                                │
└─────────────────────────────────────────────────────┘
┌─ FAQ (eksik) ──────────────────────────────────────┐
│  4-6 spesifik soru — objection handling             │
│  + FAQPage schema (AI extraction için)              │
│  → schema'da var, görünür HTML eksik               │
└─────────────────────────────────────────────────────┘
┌─ FINAL CTA ────────────────────────────────────────┐
│  Gradient bordered card, 2 CTA, contact info        │
│  → bizde zaten var ✓                                │
└─────────────────────────────────────────────────────┘
```

**WillowSoft Services'te eksik:** Trusted by strip + Case Study + görünür HTML FAQ.

## 4. İncelenecek 8 dünya markası

Mühendislik B2B / SaaS dünyasında 2026'da hâlâ standart belirleyen siteler:

### **Stripe** — stripe.com
- **Güçlü yanı:** Modüler bölümler iki kitleyi aynı anda servis ediyor (developer + CFO)
- **Pattern:** Custom illustrations + code samples + technical depth + CFO-friendly mesajlama
- **WillowSoft'a ders:** Engineering buyer (CTO/Lead Engineer) ve business buyer (operations director) farklı dil ister — capability matrix'in altına "Backend API spec" + "Business outcome" iki ayrı angle ekle

### **Vercel** — vercel.com
- **Güçlü yanı:** Documentation'dan gelen developer için optimize edilmiş typography + dark mode
- **Pattern:** Spec ön planda, ikna metni geri planda; pricing prioritized
- **WillowSoft'a ders:** Capability matrix chip'lerinin altında "View specs" / "Read docs" linkleri ekle — engineer evaluation'a doğrudan gider

### **Datadog** — datadog.com
- **Güçlü yanı:** "Verifiable specifics" — marketing dili yerine sayılar
- **Pattern:** Integration count, dashboard ekran görüntüleri, technical case studies (SRE/DevOps audience)
- **WillowSoft'a ders:** "60 billion monthly messages" tarzı sayısal proof — bizde "50+ customers" var ama daha derin sayılar lazım: "1.2M devices deployed · 99.6% uptime · 14 LoRaWAN regions"

### **Plaid** — plaid.com
- **Güçlü yanı:** Architecture illustration — sistem akışını gösteriyor, "people" stock photo değil
- **Pattern:** Veri akışı diyagramı, system connection görselleri (fintech audience)
- **WillowSoft'a ders:** Capability matrix yerine veya yanında bir **sistem mimarisi diyagramı** ekle: Device → Gateway → Backend → Dashboard → Mobile/VR. Bu zaten tech-flow olarak başka sayfada vardı, services'e taşı

### **Raycast** — raycast.com
- **Güçlü yanı:** Yoğun feature info elegant şekilde sunulmuş — tekrar eden card pattern
- **Pattern:** Uniform card components + generous spacing; power user kaydırmadan doğrulayabilir
- **WillowSoft'a ders:** Showcase card'larımızda zaten bu pattern var — Capability matrix'te de aynı uniform component kullanabiliriz

### **Linear** — linear.app
- **Güçlü yanı:** "Uncompromising minimalism" + gerçek product clips (placeholder animation değil)
- **Pattern:** Engineering team marketing fluff'a tahammül etmiyor — Linear bunu reddedip kazanıyor
- **WillowSoft'a ders:** Showcase card'larındaki phone mockups şu an placeholder. Gerçek ürün ekran kayıtları (screen recording GIF / video) olsa **çok daha** güçlü olur

### **GitHub** — github.com
- **Güçlü yanı:** Heterojen audience (CTO + individual contributor) tek sayfada
- **Pattern:** Use-case segmentation (job title değil), real product screenshots, technical case studies
- **WillowSoft'a ders:** Capability matrix sektör değil **kullanım senaryosu** ile segmentlenebilir — "Build an industrial sensor", "Add LoRaWAN to existing device", "Replace failing IoT vendor"

### **Anthropic** — anthropic.com
- **Güçlü yanı:** "Quiet design is the loudest move" — akademik, kağıt gibi estetik
- **Pattern:** Krem renkler, restrained illustration, safety + rigor positioning
- **WillowSoft'a ders:** Endüstriyel-engineering markası "calm + premium" hissetmeli — Anthropic'in restrain'i WillowSoft'a da uyar (motion-hero gibi flashy şeyler dengeyi bozabilir)

## 5. Particle.io vaka çalışması (en yakın rakip)

Particle, **bizim direct competitor'umuz** olan IoT platformu. Yapısı:

**Hero**
- Bold tek-cümle: *"Application infrastructure for intelligent devices"*
- **Live demo CTA** (önemli — sadece "Contact" değil)
- Hero imagery: Tachyon cihazı

**5-katmanlı capability cascade** (vertical, full-width)
Her katman:
- 15 kelimeyi geçmeyen headline
- 3-6 maddelik feature list
- Sağda product/technical imagery

5 katmanı: Application Development / Edge Infrastructure / Network / Cloud Infrastructure / Management — **kendi mimarileriyle birebir aynı isimler**. Bu önemli — capability adlandırması ürün mimarisini yansıtır.

**Sayısal sosyal kanıt**
- 60 billion monthly messages
- 12 million OTA updates monthly
- 240,000 active developers

Müşteri logosu **az**, sayı **çok**. Bu "Anthropic-style quiet credibility" yaklaşımı.

**Cihaz showcase**
- Inline product cards (Muon, Tachyon, Boron, Photon 2, Monitor One)
- Her birinin "In stock" indicator'ı + Store linki
- Hem mühendis hem procurement memnun

**3 CTA stratejisi**
1. Top: "Try demo" + "Contact sales" sticky nav
2. Mid: "Browse the store"
3. Bottom: Product cards + "In stock"

**Engineering credibility patternleri:**
- Code-adjacent language (`Particle.publish()` referansı)
- Minimal marketing fluff
- Abstraction-first framing: *"Connectivity shouldn't require a Ph.D in radios and protocols"* — karmaşıklığı çözülmüş olarak çerçeveliyor, mistify etmiyor
- Feature modularity — engineer kendine uygun parçayı bulup self-identify ediyor

## 6. 2026 motion ve görsel trendleri

- **3D visuals + interactive elements** B2B'de standart: machinery iç komponentlerini görselleştirme, real-world application simulation
- **Architecture diagrams > stock photos**: Plaid pattern'i
- **Real product clips > marketing animation**: Linear pattern'i
- **AI personalization**: Sektör/lokasyon bazlı dinamik content (gelişmiş; MVP'de gerek yok)
- **Outcome-focused messaging**: "Reduce maintenance cost by 32%" tarzı somut sonuç (case study gerek)

## 7. WillowSoft Services sayfası — somut yol haritası

Mevcut 5-bölümlü temizlenmiş sayfaya **3 yeni bölüm + 1 zenginleştirme** öneriyorum:

### Eklenecekler

**A. "Trusted by" logo strip** (Hero hemen altı)
- 6-8 müşteri logosu (Honeywell, SLB, Beko, AT&T, Coca-Cola, Aero Healthcare)
- Grayscale rest state, hover'da renk
- Plus küçük "+15 export countries" pill chip

**B. Case Study bölümü** (Built in Production showcase'ten sonra)
- 1-2 derin müşteri vakası
- Yapı: Problem → WillowSoft yaklaşımı → Sayısal sonuç → Müşteri quote
- Görsel: gerçek deploy görüntüsü veya dashboard ekran kaydı
- En yüksek conversion etkili eksik bölüm

**C. FAQ bölümü** (Process sonrası, CTA öncesi)
- Visible HTML — schema'da var ama görünmüyordu
- 5-7 spesifik soru: NDA, timeline, mid-project takeover, certification, ownership of IP
- Accordion açılır liste
- AI search citation bonus (Perplexity / ChatGPT FAQ schema'yı zaten okuyor ama visible content da olunca güç katlanır)

### Zenginleştirme

**D. Sayısal kanıtları derinleştir** (Hero metric strip)
- Mevcut: "50+ partner brands · 80+ projects · 15+ countries"
- Yeni: "1.2M+ devices deployed · 99.6% network uptime · 14 LoRaWAN regions · 8 industries"
- Daha somut, daha verifiable, Datadog tarzı

### Showcase güçlendirme (orta vadeli)

- **Phone frame mockup**'larını gerçek **screen recording / Lottie animation**'a çevir (Linear pattern)
- **Browser dashboard mockup**'unu gerçek bir customer portal kaydıyla değiştir
- **Architecture diagram** ekle: Device → Gateway → Backend → Dashboard (Plaid pattern, system flow)

## 8. Sayfa anti-pattern'leri (yapılmayacaklar)

- ❌ **Aynı içeriği farklı görsel formatta tekrar etme** (zaten temizledik)
- ❌ **Stock photo** — engineering brand'i stock photo'yla anlatamazsın, ya gerçek ürün/site fotoğrafı ya da architecture diagram
- ❌ **Hero'da pricing** — B2B engineering services pricing'i hero'ya koymak yanlış sinyal verir, ya "starts from" pricing-philosophy sayfası ya da contact-driven kalır
- ❌ **Tek CTA** — primary + secondary olmalı (sales call + self-serve)
- ❌ **Çok uzun süreç açıklaması** — 5 adım > 8 adım. Daha derin = daha az inandırıcı
- ❌ **Devasa hero (100vh)** — engineer scroll yapmadan capability'leri görmek ister, hero kısa olmalı
- ❌ **"Revolutionary", "Best-in-class", "Industry-leading"** — verifiable olmayan sıfat hapsi

## 9. Sıradaki uygulama önceliği

WillowSoft Services sayfasına **3 ek bölüm** uygulanırsa:

1. **#1 öncelik: Case Study** — conversion'a en direkt etki, eksik olduğu için ziyaretçi "bu adamlar gerçekten yapmış mı" sorusuyla ayrılıyor
2. **#2 öncelik: Trusted by logo strip** — hero altında ilk 5 saniyede güven sinyali
3. **#3 öncelik: FAQ visible HTML** — schema zaten var, görünür hâle getirince AI search + conversion ikisi de kazanıyor

Beğenirsen aynı struct'ı oluşturup uygularım — yarım sayfaya genişler ama her bölüm farklı soruya cevap verir, redundancy yok.

## 10. Diğer sayfa kategorileri için ders (Services → Solutions / Products / Company)

Bu pattern'i diğer sayfalara da yayarken **page personality token system'i** (zaten kurduğumuz) sayesinde:
- Solutions → green accent, sektör segmentasyonu (Smart Infrastructure / Industrial / Buildings / Logistics)
- Products → cyan accent, e-commerce-light catalog (filtreli grid + featured product)
- Company → warm accent, timeline + founder bio + export map

Her sayfanın CORE pattern'i aynı (hero + capability + showcase + proof + process + CTA) ama içerik ve accent farklı.

---

**Kaynaklar:**

- [Best B2B Services Page Design 2026 — Gridrebels Studio](https://www.gridrebels.studio/post/20-best-saas-website-designs-in-2026-examples-that-actually-convert)
- [B2B Web Design Trends 2026 — Axon Garside](https://www.axongarside.com/blog/b2b-website-design-trends-2026)
- [Particle.io IoT Platform Page Structure](https://www.particle.io/)
- [Top 10 B2B Website Designs of 2026 — Thunderclap](https://www.thethunderclap.com/blog/best-b2b-website-designs-increase-conversions)
- [B2B Web Design Best Practices — Intuitia](https://www.intuitia.tech/blog/b2b-website-design)
