import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localizeItem, type Locale } from "@/lib/cms";
import { fetchContentSync } from "@/lib/cms-server";
import ProductGallery from "@/components/ProductGallery";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = fetchContentSync();
  const rawProduct = (content.products || []).find((p: any) => p.slug === slug || p.id === slug);
  if (!rawProduct) return {};

  const product = localizeItem(rawProduct, locale as Locale);
  return {
    title: `${product.title} | WillowSoft`,
    description: product.shortDescription || "WillowSoft products.",
    alternates: {
      canonical: `https://willowsoft.co/${locale}/products/${slug}`,
    },
    openGraph: {
      type: "website",
      url: `https://willowsoft.co/${locale}/products/${slug}`,
      title: product.title,
      description: product.shortDescription,
      images: product.image ? [`https://willowsoft.co/${product.image}`] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const content = fetchContentSync();
  const rawProduct = (content.products || []).find((p: any) => p.slug === slug || p.id === slug);

  if (!rawProduct) {
    notFound();
  }

  const product = localizeItem(rawProduct, locale as Locale);
  const titleLower = (product.title || "").toLowerCase();
  
  // Mappings
  const categoryMap: Record<string, string> = {
    modules: "Use this module as the embedded core of low-power connected devices where firmware, RF performance and long-term maintainability matter.",
    environment: "Use this sensor family for environmental telemetry, alerts and remote monitoring in industrial, utility and field conditions.",
    tracking: "Use this device family to detect movement, access, safety events and asset state changes across distributed sites.",
    industrial: "Use this product to connect industrial equipment, Modbus devices and telemetry workflows into a unified platform."
  };
  const fitText = categoryMap[product.category] || "Use this product as part of a reliable connected product ecosystem.";

  const snapshotMap: Record<string, string> = {
    modules: "Embedded core for low-power device builds.",
    environment: "Field telemetry for environmental monitoring.",
    tracking: "Event detection for distributed operations.",
    industrial: "Industrial bridge for machine-side data."
  };
  const snapshotText = snapshotMap[product.category] || "Built for field telemetry.";

  const byCategory: Record<string, any> = {
    modules: {
      useTitle: "Custom connected devices",
      use: "Use this module when you need a low-power LoRaWAN core for a custom sensor, controller or field device.",
      roleTitle: "Embedded core",
      role: "It sits at the device layer, where MCU logic, RF behavior, GPIO mapping and firmware maintainability decide product reliability.",
      delivered: ["Firmware architecture and low-power logic", "LoRaWAN payload design and RF validation", "Prototype-to-production embedded support"]
    },
    environment: {
      useTitle: "Environmental monitoring",
      use: "Use this sensor family for indoor, outdoor or field conditions where measurements must become alerts, dashboards and reports.",
      roleTitle: "Measurement node",
      role: "It captures field conditions and sends structured telemetry into the platform for monitoring, reporting and operator action.",
      delivered: ["Sensor configuration and reporting intervals", "Backend ingestion and PostgreSQL time-series model", "Dashboards, thresholds and mobile notifications"]
    },
    tracking: {
      useTitle: "Event and asset state tracking",
      use: "Use this device when movement, access, safety, tilt or route events need to be visible without manual site checks.",
      roleTitle: "Event trigger",
      role: "It becomes the field signal that turns physical state changes into operational alerts and history.",
      delivered: ["Event logic and payload design", "Alert routing and operator workflow", "Map, log or admin panel integration"]
    },
    industrial: {
      useTitle: "Industrial telemetry integration",
      use: "Use this product when existing meters, PLCs or field assets need to report operational data into a modern digital platform.",
      roleTitle: "Industrial bridge",
      role: "It connects machine-side data with APIs, PostgreSQL, web dashboards and mobile operational tools.",
      delivered: ["Register mapping and device configuration", "API ingestion and PostgreSQL schema", "Admin dashboard, reporting and integrations"]
    }
  };

  const decision = { ...(byCategory[product.category] || {
    useTitle: "Field monitoring",
    use: "Use this product where physical-world data must be measured, transmitted and turned into operational decisions.",
    roleTitle: "Telemetry source",
    role: "It feeds the digital layer with structured measurements, events and device state.",
    delivered: ["Firmware and connectivity configuration", "Backend ingestion and PostgreSQL model", "Dashboard, mobile and alerting workflow"]
  }) };

  if (titleLower.includes("panic")) {
    decision.useTitle = "Safety and emergency workflows";
    decision.use = "Use this device where operators need a physical emergency trigger connected to remote alerts and response workflows.";
  }
  if (titleLower.includes("modbus")) {
    decision.useTitle = "Legacy equipment integration";
    decision.roleTitle = "Modbus-to-platform bridge";
  }
  if (titleLower.includes("ultrasonic") || titleLower.includes("level")) {
    decision.useTitle = "Tank, manhole and level monitoring";
    decision.use = "Use this product where level, distance or fill state must be monitored remotely across distributed field assets.";
  }
  if (titleLower.includes("soil")) {
    decision.useTitle = "Agriculture and field research";
  }

  const galleryImages = Array.isArray(product.images) ? product.images.filter(Boolean) : (product.image ? [product.image] : []);

  // Technical sections
  const techBlocks = [
    { label: "Technical Summary", html: product.technicalSummary },
    { label: "Use Cases", html: product.useCases },
    { label: "Specifications", html: product.specifications }
  ].filter((block) => block.html && String(block.html).trim());

  // Schema.org Graph
  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://willowsoft.co/#org",
        "name": "WillowSoft",
        "url": "https://willowsoft.co",
        "logo": "https://willowsoft.co/assets/willow-mark-transparent.png"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `https://willowsoft.co/${locale}` },
          { "@type": "ListItem", "position": 2, "name": "Products", "item": `https://willowsoft.co/${locale}/products` },
          { "@type": "ListItem", "position": 3, "name": product.title }
        ]
      },
      {
        "@type": "Product",
        "name": product.title,
        "sku": product.slug || product.id,
        "image": product.image ? [`https://willowsoft.co/${product.image}`] : [],
        "description": product.shortDescription || "",
        "brand": { "@type": "Brand", "name": "WillowSoft" },
        "manufacturer": { "@id": "https://willowsoft.co/#org" },
        "category": product.category || "Product",
        "offers": {
          "@type": "Offer",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "seller": { "@id": "https://willowsoft.co/#org" },
          "url": `https://willowsoft.co/${locale}/products/${slug}`
        }
      }
    ]
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
      />
      
      <section className="hero compact">
        <div className="hero-media">
          <img src={product.image ? `/${product.image}`.replace("//", "/") : "/assets/hero-industrial-iot.png"} alt={product.title} loading="lazy" decoding="async" />
        </div>
        <canvas className="signal-canvas" data-density="36"></canvas>
        <div className="hero-inner">
          <p className="eyebrow reveal">{product.category || "Product"}</p>
          <h1 className="reveal delay-1">{product.title}</h1>
          <p className="reveal delay-2">{product.shortDescription}</p>
          <div className="hero-ctas reveal delay-3">
            <Link className="btn btn-primary" href={`/${locale}/contact?product=${encodeURIComponent(slug)}`}>Request Information</Link>
            <Link className="btn btn-secondary" href={`/${locale}/products`}>Back to Products</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner bento">
          <article className="card accent reveal">
            <p className="eyebrow">Technical Snapshot</p>
            <h2 className="page-title">{snapshotText}</h2>
            <div className="mini-spec-grid">
              {(product.chips || []).slice(0, 3).map((chip: string, idx: number) => (
                <div key={idx} className="mini-spec">
                  <strong>{chip}</strong>
                  <span>Capability</span>
                </div>
              ))}
            </div>
          </article>
          <article
            className="card visual-card reveal delay-1"
            style={product.image ? { backgroundImage: `url('/${product.image}')` } : {}}
          >
            <h3>Industrial deployment ready.</h3>
            <p>Use this product as part of a complete WillowSoft hardware, firmware, backend and dashboard stack.</p>
          </article>
        </div>
      </section>

      {/* Gallery Section */}
      {galleryImages.length > 1 && (
        <section className="section product-gallery-section">
          <div className="section-inner">
            <div className="section-head">
              <p className="eyebrow">Gallery</p>
              <h2 className="page-title">Product gallery.</h2>
            </div>
            <ProductGallery images={galleryImages} title={product.title} />
          </div>
        </section>
      )}

      {/* Tech sections */}
      {techBlocks.length > 0 && (
        <section className="section soft product-tech-section">
          <div className="section-inner">
            {techBlocks.map((block, idx) => (
              <article key={idx} className="product-tech-block" style={{ marginBottom: "40px" }}>
                <h2 className="page-title">{block.label}</h2>
                <div className="rich-content" dangerouslySetInnerHTML={{ __html: block.html }} />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Where it fits */}
      <section className="section soft">
        <div className="section-inner split">
          <div className="reveal">
            <p className="eyebrow">Where It Fits</p>
            <h2 className="page-title">From device data to operational decisions.</h2>
          </div>
          <div className="reveal delay-1">
            <p className="section-lead">{fitText}</p>
            <ul className="spec-list">
              <li>Can be evaluated as a standalone product or part of a complete connected system.</li>
              <li>Useful when field data must become dashboards, alerts, reports or integrations.</li>
              <li>Related firmware, backend, PostgreSQL, web/admin and mobile layers can be delivered by WillowSoft.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Buyer Checklist */}
      <section className="section product-decision-section">
        <div className="section-inner">
          <div className="section-head reveal product-headline">
            <div>
              <p className="eyebrow">Buyer Checklist</p>
              <h2>What this product helps you decide before deployment.</h2>
            </div>
            <Link className="btn btn-secondary btn-small" href={`/${locale}/start-project`}>Plan Deployment</Link>
          </div>
          <div className="product-decision-grid">
            <article className="product-decision-card reveal">
              <span>Use Case</span>
              <h3>{decision.useTitle}</h3>
              <p>{decision.use}</p>
            </article>
            <article className="product-decision-card reveal delay-1">
              <span>System Role</span>
              <h3>{decision.roleTitle}</h3>
              <p>{decision.role}</p>
            </article>
            <article className="product-decision-card reveal delay-2">
              <span>Delivered With</span>
              <h3>Hardware plus software path</h3>
              <ul>
                {decision.delivered.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="section soft product-system-section">
        <div className="section-inner split">
          <div className="reveal">
            <p className="eyebrow">System Architecture</p>
            <h2 className="page-title">A product page should show the whole operating path.</h2>
            <p className="section-lead">WillowSoft products are strongest when they are presented as part of a complete operational system: sensor, connectivity, backend, database, dashboard, mobile and alerting.</p>
          </div>
          <div className="tech-flow product-tech-flow reveal delay-1">
            <div className="flow-row">
              <div className="flow-node"><small>01</small><strong>Device</strong><span>Sensing, enclosure, battery and RF behavior.</span></div>
              <div className="flow-node"><small>02</small><strong>Network</strong><span>LoRaWAN payloads and gateway planning.</span></div>
              <div className="flow-node"><small>03</small><strong>Data</strong><span>API ingestion and PostgreSQL schema.</span></div>
              <div className="flow-node"><small>04</small><strong>Interface</strong><span>Dashboard, mobile app and admin panel.</span></div>
              <div className="flow-node"><small>05</small><strong>Action</strong><span>Alerts, reports, integrations and service workflows.</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote band */}
      <section className="section product-quote-band">
        <div className="section-inner product-quote-inner reveal">
          <div>
            <p className="eyebrow">Need this in a project?</p>
            <h2 className="page-title">Ask for product fit, integration path and deployment scope.</h2>
          </div>
          <div className="product-quote-actions">
            <Link className="btn btn-primary" href={`/${locale}/start-project?product=${encodeURIComponent(slug)}`}>Start Project</Link>
            <Link className="btn btn-secondary" href={`/${locale}/contact?product=${encodeURIComponent(slug)}`}>Contact Sales</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
