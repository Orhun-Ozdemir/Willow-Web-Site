(function () {
  const esc = (value) => window.WillowCMS.escapeHtml(value);
  const SITE = "https://willowsoft.co";

  function slugFromPath(prefix) {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const index = parts.indexOf(prefix);
    return index >= 0 ? parts[index + 1] : new URLSearchParams(location.search).get("slug");
  }

  function abs(url) {
    if (!url) return SITE;
    if (/^https?:\/\//i.test(url)) return url;
    return `${SITE}/${url.replace(/^\/+/, "")}`;
  }

  function injectSchema(extra) {
    const isAdminPreview = window.self !== window.top || location.pathname.includes("admin.html") || location.search.includes("preview=true");
    const existingSsr = document.querySelector('script[data-ssr="true"]');
    if (existingSsr && !isAdminPreview) {
      return; // Skip client-side injection to avoid duplicate schema tags on public/crawled views
    }

    // Remove any prior dynamic injection so re-renders stay clean
    document
      .querySelectorAll('script[data-dynamic-schema="true"]')
      .forEach((node) => node.remove());

    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE}/#org`,
          "name": "WillowSoft",
          "url": SITE,
          "logo": `${SITE}/assets/willow-mark-transparent.png`
        },
        ...extra
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.dynamicSchema = "true";
    script.textContent = JSON.stringify(graph);
    document.head.appendChild(script);
  }

  function setMeta(selector, attribute, value) {
    let node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement(selector.startsWith("link") ? "link" : "meta");
      const parts = selector.match(/\[([^=]+)="([^"]+)"\]/);
      if (parts) node.setAttribute(parts[1], parts[2]);
      document.head.appendChild(node);
    }
    node.setAttribute(attribute, value);
  }

  function injectMeta(opts) {
    setMeta('link[rel="canonical"]', "href", opts.canonical);
    setMeta('meta[property="og:type"]', "content", opts.type || "article");
    setMeta('meta[property="og:url"]', "content", opts.canonical);
    setMeta('meta[property="og:title"]', "content", opts.title);
    setMeta('meta[property="og:description"]', "content", opts.description || "");
    if (opts.image) setMeta('meta[property="og:image"]', "content", opts.image);
    setMeta('meta[property="og:site_name"]', "content", "WillowSoft");
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", opts.title);
    setMeta('meta[name="twitter:description"]', "content", opts.description || "");
    if (opts.image) setMeta('meta[name="twitter:image"]', "content", opts.image);
  }

  function productSchema(product) {
    return {
      "@type": "Product",
      "name": product.title,
      "sku": product.slug || product.id,
      "image": product.image ? [abs(product.image)] : [],
      "description": product.shortDescription || "",
      "brand": { "@type": "Brand", "name": "WillowSoft" },
      "manufacturer": { "@id": `${SITE}/#org` },
      "category": product.category || "Product",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "seller": { "@id": `${SITE}/#org` },
        "url": `${SITE}/en/products/${product.slug || product.id}`
      }
    };
  }

  function newsSchema(item) {
    return {
      "@type": "NewsArticle",
      "headline": item.title,
      "description": item.excerpt || "",
      "image": item.image ? [abs(item.image)] : [],
      "datePublished": item.date || undefined,
      "dateModified": item.date || undefined,
      "author": { "@id": `${SITE}/#org` },
      "publisher": { "@id": `${SITE}/#org` },
      "mainEntityOfPage": `${SITE}/en/news/${item.slug || item.id}`,
      "articleSection": item.category || "Company News"
    };
  }

  function productBreadcrumb(product) {
    return {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE}/en` },
        { "@type": "ListItem", "position": 2, "name": "Products", "item": `${SITE}/en/products` },
        { "@type": "ListItem", "position": 3, "name": product.title }
      ]
    };
  }

  function newsBreadcrumb(item) {
    return {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE}/en` },
        { "@type": "ListItem", "position": 2, "name": "News", "item": `${SITE}/en/news` },
        { "@type": "ListItem", "position": 3, "name": item.title }
      ]
    };
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value || "";
  }

  function setImage(selector, src, alt) {
    const img = document.querySelector(selector);
    if (!img) return;
    img.src = src ? `/${src}`.replace("//", "/") : "/assets/hero-industrial-iot.png";
    img.alt = alt || "";
  }

  function productFit(product) {
    const categoryMap = {
      modules: "Use this module as the embedded core of low-power connected devices where firmware, RF performance and long-term maintainability matter.",
      environment: "Use this sensor family for environmental telemetry, alerts and remote monitoring in industrial, utility and field conditions.",
      tracking: "Use this device family to detect movement, access, safety events and asset state changes across distributed sites.",
      industrial: "Use this product to connect industrial equipment, Modbus devices and telemetry workflows into a unified platform."
    };
    return categoryMap[product.category] || "Use this product as part of a reliable connected product ecosystem.";
  }

  function productSnapshotTitle(product) {
    const snapshotMap = {
      modules: "Embedded core for low-power device builds.",
      environment: "Field telemetry for environmental monitoring.",
      tracking: "Event detection for distributed operations.",
      industrial: "Industrial bridge for machine-side data."
    };
    return snapshotMap[product.category] || "Built for field telemetry.";
  }

  function productDecision(product) {
    const title = (product.title || "").toLowerCase();
    const byCategory = {
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

    const decision = byCategory[product.category] || {
      useTitle: "Field monitoring",
      use: "Use this product where physical-world data must be measured, transmitted and turned into operational decisions.",
      roleTitle: "Telemetry source",
      role: "It feeds the digital layer with structured measurements, events and device state.",
      delivered: ["Firmware and connectivity configuration", "Backend ingestion and PostgreSQL model", "Dashboard, mobile and alerting workflow"]
    };

    if (title.includes("panic")) {
      decision.useTitle = "Safety and emergency workflows";
      decision.use = "Use this device where operators need a physical emergency trigger connected to remote alerts and response workflows.";
    }
    if (title.includes("modbus")) {
      decision.useTitle = "Legacy equipment integration";
      decision.roleTitle = "Modbus-to-platform bridge";
    }
    if (title.includes("ultrasonic") || title.includes("level")) {
      decision.useTitle = "Tank, manhole and level monitoring";
      decision.use = "Use this product where level, distance or fill state must be monitored remotely across distributed field assets.";
    }
    if (title.includes("soil")) {
      decision.useTitle = "Agriculture and field research";
    }
    return decision;
  }

  function renderProduct(product) {
    product = window.WillowCMS.localizeItem(product);
    document.title = `${product.title} | WillowSoft`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = product.shortDescription || "";
    setText("[data-detail-category]", product.category || "Product");
    setText("[data-detail-title]", product.title);
    setText("[data-detail-summary]", product.shortDescription);
    setText("[data-detail-snapshot]", productSnapshotTitle(product));
    setText("[data-detail-fit]", productFit(product));
    setImage("[data-detail-image]", product.image, product.title);
    const visual = document.querySelector("[data-detail-visual]");
    if (visual && product.image) visual.style.backgroundImage = `url('/${product.image}')`;
    const cta = document.querySelector("[data-detail-cta]");
    if (cta) cta.href = `/contact.html?product=${encodeURIComponent(product.slug || product.id)}`;
    const projectCta = document.querySelector("[data-detail-project-cta]");
    if (projectCta) projectCta.href = `/start-project.html?product=${encodeURIComponent(product.slug || product.id)}`;
    const contactCta = document.querySelector("[data-detail-contact-cta]");
    if (contactCta) contactCta.href = `/contact.html?product=${encodeURIComponent(product.slug || product.id)}`;

    const chips = document.querySelector("[data-detail-chips]");
    if (chips) {
      chips.innerHTML = (product.chips || []).slice(0, 3).map((chip) => `
        <div class="mini-spec"><strong>${esc(chip)}</strong><span>Capability</span></div>
      `).join("");
    }

    const list = document.querySelector("[data-detail-list]");
    if (list) {
      list.innerHTML = [
        "Can be evaluated as a standalone product or part of a complete connected system.",
        "Useful when field data must become dashboards, alerts, reports or integrations.",
        "Related firmware, backend, PostgreSQL, web/admin and mobile layers can be delivered by WillowSoft."
      ].map((item) => `<li>${esc(item)}</li>`).join("");
    }

    const decision = productDecision(product);
    setText("[data-detail-use-case-title]", decision.useTitle);
    setText("[data-detail-use-case]", decision.use);
    setText("[data-detail-system-role-title]", decision.roleTitle);
    setText("[data-detail-system-role]", decision.role);
    const delivered = document.querySelector("[data-detail-delivered-with]");
    if (delivered) {
      delivered.innerHTML = decision.delivered.map((item) => `<li>${esc(item)}</li>`).join("");
    }

    // Multi-image gallery (shows only when there is more than one image)
    const gallerySection = document.querySelector("[data-detail-gallery-section]");
    const galleryRoot = document.querySelector("[data-detail-gallery]");
    if (galleryRoot) {
      const imgs = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
      const all = imgs.length ? imgs : (product.image ? [product.image] : []);
      if (all.length > 1) {
        galleryRoot.innerHTML = `
          <div class="product-gallery-main"><img src="/${esc(all[0])}" alt="${esc(product.title)}" data-gallery-main /></div>
          <div class="product-gallery-thumbs">
            ${all.map((src, i) => `<button type="button" class="product-gallery-thumb${i === 0 ? " active" : ""}" data-gallery-src="/${esc(src)}"><img src="/${esc(src)}" alt="" loading="lazy" decoding="async" /></button>`).join("")}
          </div>`;
        galleryRoot.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-gallery-src]");
          if (!btn) return;
          const main = galleryRoot.querySelector("[data-gallery-main]");
          if (main) main.src = btn.dataset.gallerySrc;
          galleryRoot.querySelectorAll(".product-gallery-thumb").forEach((t) => t.classList.toggle("active", t === btn));
        });
        if (gallerySection) gallerySection.hidden = false;
      } else if (gallerySection) {
        gallerySection.hidden = true;
      }
    }

    // Rich technical sections (admin-authored HTML via the rich-text editor)
    const techSection = document.querySelector("[data-detail-tech-section]");
    const techRoot = document.querySelector("[data-detail-tech-sections]");
    if (techRoot) {
      const blocks = [
        ["Technical Summary", product.technicalSummary],
        ["Use Cases", product.useCases],
        ["Specifications", product.specifications]
      ].filter(([, html]) => html && String(html).trim());
      if (blocks.length) {
        techRoot.innerHTML = blocks.map(([label, html]) => `
          <article class="product-tech-block">
            <h2 class="page-title">${esc(label)}</h2>
            <div class="rich-content">${html}</div>
          </article>`).join("");
        if (techSection) techSection.hidden = false;
      } else if (techSection) {
        techSection.hidden = true;
      }
    }

    // Schema.org JSON-LD — AI search engines and Google Rich Results
    injectSchema([productBreadcrumb(product), productSchema(product)]);

    // Canonical + Open Graph + Twitter meta for this specific product
    injectMeta({
      canonical: `${SITE}/en/products/${product.slug || product.id}`,
      title: `${product.title} | WillowSoft`,
      description: product.shortDescription || "",
      image: product.image ? abs(product.image) : `${SITE}/assets/hero-industrial-iot.png`,
      type: "product",
    });
  }

  function renderNews(item) {
    item = window.WillowCMS.localizeItem(item);
    document.title = `${item.title} | WillowSoft`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = item.excerpt || "";
    const date = item.date ? new Date(`${item.date}T00:00:00`).toLocaleDateString(window.WillowCMS.currentLocale(), {
      year: "numeric",
      month: "long",
      day: "numeric"
    }) : "";
    setText("[data-news-meta]", `${item.category || "News"}${date ? " • " + date : ""}`);
    setText("[data-news-title]", item.title);
    setText("[data-news-excerpt]", item.excerpt);
    setText("[data-news-body]", item.content || `${item.excerpt} This update should be used as a trust signal on the public site and can be expanded from the admin panel with full article content in the next CMS phase.`);
    setImage("[data-news-image]", item.image, item.title);

    // Schema.org JSON-LD — NewsArticle + breadcrumb for AI and Google
    injectSchema([newsBreadcrumb(item), newsSchema(item)]);

    // Canonical + Open Graph + Twitter meta for this specific news item
    injectMeta({
      canonical: `${SITE}/en/news/${item.slug || item.id}`,
      title: `${item.title} | WillowSoft`,
      description: item.excerpt || "",
      image: item.image ? abs(item.image) : `${SITE}/assets/hero-industrial-iot.png`,
      type: "article",
    });
  }

  async function init() {
    const content = await window.WillowCMS.fetchContent();
    const productRoot = document.querySelector("[data-product-detail]");
    const newsRoot = document.querySelector("[data-news-detail]");
    if (productRoot) {
      const slug = slugFromPath("products");
      const product = (content.products || []).find((item) => item.slug === slug || item.id === slug);
      if (product) renderProduct(product);
      else setText("[data-detail-title]", "Product not found.");
    }
    if (newsRoot) {
      const slug = slugFromPath("news");
      const item = (content.news || []).find((entry) => entry.slug === slug || entry.id === slug);
      if (item) renderNews(item);
      else setText("[data-news-title]", "News item not found.");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
