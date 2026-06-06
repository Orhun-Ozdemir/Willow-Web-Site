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

  function renderProduct(product) {
    product = window.WillowCMS.localizeItem(product);
    document.title = `${product.title} | WillowSoft`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = product.shortDescription || "";
    setText("[data-detail-category]", product.category || "Product");
    setText("[data-detail-title]", product.title);
    setText("[data-detail-summary]", product.shortDescription);
    setText("[data-detail-snapshot]", product.title);
    setText("[data-detail-fit]", productFit(product));
    setImage("[data-detail-image]", product.image, product.title);
    const visual = document.querySelector("[data-detail-visual]");
    if (visual && product.image) visual.style.backgroundImage = `url('/${product.image}')`;
    const cta = document.querySelector("[data-detail-cta]");
    if (cta) cta.href = `/contact.html?product=${encodeURIComponent(product.slug || product.id)}`;

    const chips = document.querySelector("[data-detail-chips]");
    if (chips) {
      chips.innerHTML = (product.chips || []).slice(0, 3).map((chip) => `
        <div class="mini-spec"><strong>${esc(chip)}</strong><span>Capability</span></div>
      `).join("");
    }

    const list = document.querySelector("[data-detail-list]");
    if (list) {
      list.innerHTML = [
        "Inquiry / quote focused product page.",
        "Can be delivered alone or as part of a complete platform.",
        "Related firmware, backend, PostgreSQL, web/admin and mobile layers can be added by WillowSoft."
      ].map((item) => `<li>${esc(item)}</li>`).join("");
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
