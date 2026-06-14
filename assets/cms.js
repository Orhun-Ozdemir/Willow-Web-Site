(function () {
  const fallbackUrl = "data/site-data.json";
  const locales = ["en", "tr", "de", "fr", "es", "it", "ar", "ja"];
  const pageContentBindings = {
    home: {
      heroEyebrow: ".motion-hero .hero-copy .eyebrow",
      heroTitle: ".motion-hero .hero-copy h1",
      heroLead: ".motion-hero .hero-copy > p.reveal.delay-2",
      trustEyebrow: ".trust-copy .eyebrow",
      trustTitle: ".trust-copy h2",
      trustLead: ".trust-copy > p:not(.eyebrow)",
      problemEyebrow: ".section.soft .section-inner.split .eyebrow",
      problemTitle: ".section.soft .section-inner.split .page-title",
      problemLeadOne: ".section.soft .section-inner.split .section-lead:nth-of-type(1)",
      problemLeadTwo: ".section.soft .section-inner.split .section-lead:nth-of-type(2)",
      ownershipEyebrow: ".ownership-section .eyebrow",
      ownershipTitle: ".ownership-section .page-title",
      ecosystemEyebrow: ".ecosystem-section .section-head .eyebrow",
      ecosystemTitle: ".ecosystem-section .section-head h2",
      productsEyebrow: ".home-products .section-head .eyebrow",
      productsTitle: ".home-products .section-head h2",
      industriesEyebrow: ".industries-section .section-head .eyebrow",
      industriesTitle: ".industries-section .section-head h2",
      newsEyebrow: ".proof-section .section-head .eyebrow",
      newsTitle: ".proof-section .section-head h2",
      ctaEyebrow: ".final-cta .eyebrow",
      ctaTitle: ".final-cta .page-title",
      ctaLead: ".final-cta .section-lead"
    },
    products: {
      heroEyebrow: ".hero .eyebrow",
      heroTitle: ".hero h1",
      heroLead: ".hero p.reveal.delay-2",
      featuredEyebrow: ".bento .accent .eyebrow",
      featuredTitle: ".bento .accent .page-title",
      catalogEyebrow: ".section.soft .section-head .eyebrow",
      catalogTitle: ".section.soft .section-head h2"
    },
    news: {
      heroEyebrow: ".hero .eyebrow",
      heroTitle: ".hero h1",
      heroLead: ".hero p.reveal.delay-2",
      latestEyebrow: ".section:not(.dark) .section-head .eyebrow",
      latestTitle: ".section:not(.dark) .section-head h2",
      pipelineEyebrow: ".section.dark .eyebrow",
      pipelineTitle: ".section.dark .page-title",
      pipelineLead: ".section.dark .section-lead"
    },
    services: {
      heroEyebrow: ".hero .eyebrow",
      heroTitle: ".hero h1",
      heroLead: ".hero p.reveal.delay-2",
      processEyebrow: ".process-section .section-head .eyebrow",
      processTitle: ".process-section .section-head h2"
    },
    solutions: {
      heroEyebrow: ".hero .eyebrow",
      heroTitle: ".hero h1",
      heroLead: ".hero p.reveal.delay-2",
      useCasesEyebrow: ".solution-market-section .section-head .eyebrow",
      useCasesTitle: ".solution-market-section .section-head h2",
      howEyebrow: ".section.dark .eyebrow",
      howTitle: ".section.dark .page-title",
      howLead: ".section.dark .section-lead",
      whyEyebrow: ".solutions-why-section .section-head .eyebrow",
      whyTitle: ".solutions-why-section .section-head h2"
    },
    company: {
      introEyebrow: ".section:first-of-type .eyebrow",
      introTitle: ".section:first-of-type .page-title",
      introLead: ".section:first-of-type .card p",
      principlesEyebrow: ".section.soft .section-head .eyebrow",
      principlesTitle: ".section.soft .section-head h2",
      historyEyebrow: ".section:not(.soft):not(.dark) .section-head .eyebrow",
      historyTitle: ".section:not(.soft):not(.dark) .section-head h2",
      workWithEyebrow: ".section.soft:nth-of-type(4) .section-head .eyebrow",
      workWithTitle: ".section.soft:nth-of-type(4) .section-head h2",
      ctaEyebrow: ".section.dark .eyebrow",
      ctaTitle: ".section.dark .page-title",
      ctaLead: ".section.dark .section-lead"
    },
    contact: {
      heroEyebrow: ".section .eyebrow",
      heroTitle: ".section .page-title",
      heroLead: ".section .section-lead",
      directTitle: ".section .card h3",
      directLead: ".section .card p:last-child"
    },
    startProject: {
      heroEyebrow: ".hero .eyebrow",
      heroTitle: ".hero h1",
      pathsEyebrow: ".start-process-section .section-head .eyebrow",
      pathsTitle: ".start-process-section .section-head h2",
      formEyebrow: "#lead-form .eyebrow",
      formTitle: "#lead-form .page-title",
      formLead: "#lead-form .section-lead"
    },
    glossary: {
      heroEyebrow: "[data-cms-key='heroEyebrow']",
      heroTitle: "[data-cms-key='heroTitle']",
      heroLead: "[data-cms-key='heroLead']",
      connectivityEyebrow: "[data-cms-key='connectivityEyebrow']",
      connectivityTitle: "[data-cms-key='connectivityTitle']",
      devicesEyebrow: "[data-cms-key='devicesEyebrow']",
      devicesTitle: "[data-cms-key='devicesTitle']",
      softwareEyebrow: "[data-cms-key='softwareEyebrow']",
      softwareTitle: "[data-cms-key='softwareTitle']",
      ctaEyebrow: "[data-cms-key='ctaEyebrow']",
      ctaTitle: "[data-cms-key='ctaTitle']",
      ctaLead: "[data-cms-key='ctaLead']"
    }
  };

  function currentLocale() {
    const first = location.pathname.split("/").filter(Boolean)[0];
    return locales.includes(first) ? first : document.documentElement.lang || "en";
  }

  function activePageKey() {
    const page = document.body.dataset.page || "";
    if (page === "start-project") return "startProject";
    if (page && page !== "company") return page;
    const first = location.pathname.split("/").filter(Boolean).find((part) => !locales.includes(part)) || "home";
    if (first === "start-project") return "startProject";
    if (first === "index.html" || first === "home") return "home";
    if (first === "news") return "news";
    return first.replace(".html", "") || "home";
  }

  function localizedValue(map, locale = currentLocale()) {
    if (!map || typeof map === "string") return map || "";
    return map[locale] || map.en || "";
  }

  function normalizeLocalizedList(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
    return [];
  }

  function localizeItem(item, locale = currentLocale()) {
    const localized = item?.localized?.[locale] || {};
    const next = { ...item };
    Object.entries(localized).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null) return;
      next[key] = key === "chips" || key === "deliverables" ? normalizeLocalizedList(value) : value;
    });
    return next;
  }

  async function fetchContent() {
    const isAdminPreview = window.self !== window.top || location.pathname.includes("admin.html") || location.search.includes("preview=true");
    const cached = window.localStorage.getItem("willowsoft-content-draft");
    if (cached && isAdminPreview) {
      try {
        return JSON.parse(cached);
      } catch {
        window.localStorage.removeItem("willowsoft-content-draft");
      }
    }

    try {
      const api = await fetch("/api/content", { cache: "no-store" });
      if (api.ok) return api.json();
    } catch {
      // Static fallback below.
    }

    const response = await fetch(fallbackUrl, { cache: "no-store" });
    return response.json();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function productCard(product, index) {
    product = localizeItem(product);
    const delay = index % 4 ? ` delay-${index % 4}` : "";
    const chips = (product.chips || [])
      .slice(0, 3)
      .map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`)
      .join("");
    const locale = currentLocale();
    const productUrl = `/${locale}/products/${encodeURIComponent(product.slug || product.id)}`;
    const link = `<p style="margin-top:16px"><a class="btn btn-ghost btn-small" href="${productUrl}">View Details</a></p>`;
    const cutoutImage = product.cardImage || `assets/product-cutouts/${product.id}.png`;
    const originalImage = product.image || cutoutImage;

    return `
      <article class="card product-card reveal${delay}" data-category="${escapeHtml(product.category)}">
        <figure><img src="${escapeHtml(cutoutImage)}" data-original-image="${escapeHtml(originalImage)}" alt="${escapeHtml(product.title)}" onerror="this.onerror=null;this.src=this.dataset.originalImage" /></figure>
        <div class="product-body">
          <h3>${escapeHtml(product.title)}</h3>
          <p>${escapeHtml(product.shortDescription)}</p>
          <div class="chip-row">${chips}</div>
          ${link}
        </div>
      </article>
    `;
  }

  function newsCard(item, index) {
    item = localizeItem(item);
    const delay = index % 3 ? ` delay-${index % 3}` : "";
    const date = item.date ? new Date(`${item.date}T00:00:00`).toLocaleDateString(currentLocale(), {
      year: "numeric",
      month: "short",
      day: "numeric"
    }) : "";

    const locale = currentLocale();
    const newsUrl = `/${locale}/news/${encodeURIComponent(item.slug || item.id)}`;
    return `
      <article class="card news-card reveal${delay}">
        <figure><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" /></figure>
        <div class="product-body">
          <p class="eyebrow">${escapeHtml(item.category)} ${date ? "• " + escapeHtml(date) : ""}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.excerpt)}</p>
          <p style="margin-top:16px"><a class="btn btn-ghost btn-small" href="${newsUrl}">Read Update</a></p>
        </div>
      </article>
    `;
  }

  function clientTile(client, index) {
    client = localizeItem(client);
    const depths = [18, 54, 28, 42, 12, 66, 36, 24];
    const z = depths[index % depths.length];
    const delay = index * 130;
    const logo = client.logo
      ? `<img src="${escapeHtml(client.logo)}" alt="${escapeHtml(client.name)}" />`
      : `<strong>${escapeHtml(client.name)}</strong>`;
    return `<div class="logo-tile" style="--z:${z}px;--delay:${delay}ms" data-client="${escapeHtml(client.id)}" title="${escapeHtml(client.name)}">${logo}</div>`;
  }

  function solutionImageHtml(image, alt) {
    if (!image) return "";
    if (typeof image === "string") {
      return `<figure><img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" /></figure>`;
    }
    // image is an object with webp/png/srcset fields
    return `<figure>
      <picture>
        ${image.srcsetWebp ? `<source type="image/webp" srcset="${escapeHtml(image.srcsetWebp)}" sizes="(max-width:600px) 480px, (max-width:900px) 768px, 1200px" />` : ""}
        ${image.srcsetPng ? `<source type="image/png" srcset="${escapeHtml(image.srcsetPng)}" sizes="(max-width:600px) 480px, (max-width:900px) 768px, 1200px" />` : ""}
        <img src="${escapeHtml(image.png || image.webp)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
      </picture>
    </figure>`;
  }

  function solutionCard(solution, index, allProducts) {
    solution = localizeItem(solution);
    const delay = index % 4 ? ` delay-${index % 4}` : "";
    const headline = solution.headline || solution.title || "";
    const bullets = Array.isArray(solution.bullets)
      ? solution.bullets
      : String(solution.bullets || "").split(/\r?\n|,/).map((b) => b.trim()).filter(Boolean);
    const locale = currentLocale();

    // Use cases / bullets → chips (short labels) or list
    const useChips = bullets.every(b => b.split(" ").length <= 5);
    const bulletContent = useChips
      ? `<div class="solution-use-cases">${bullets.map(b => `<span>${escapeHtml(b)}</span>`).join("")}</div>`
      : `<ul>${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`;

    // Products used → link badges
    const productsUsed = Array.isArray(solution.productsUsed) ? solution.productsUsed : [];
    const productBadges = productsUsed.length && allProducts
      ? productsUsed.map(pid => {
          const prod = allProducts.find(p => (p.id || p.slug) === pid);
          if (!prod) return "";
          const url = `/${locale}/products/${encodeURIComponent(prod.slug || prod.id)}`;
          return `<a class="solution-product-badge" href="${escapeHtml(url)}" title="${escapeHtml(prod.title || pid)}">${escapeHtml(prod.title || pid)}</a>`;
        }).filter(Boolean).join("")
      : "";

    return `
      <article class="solution-case-card reveal${delay}" data-solution="${escapeHtml(solution.slug || solution.id)}" data-category="${escapeHtml(solution.category || "")}">
        ${solutionImageHtml(solution.image, solution.alt || headline)}
        <div class="solution-case-body">
          ${solution.category ? `<span>${escapeHtml(solution.category)}</span>` : ""}
          <h3>${escapeHtml(headline)}</h3>
          ${solution.summary ? `<p>${escapeHtml(solution.summary)}</p>` : ""}
          ${bulletContent}
          ${productBadges ? `<div class="solution-product-badges">${productBadges}</div>` : ""}
        </div>
      </article>
    `;
  }

  function renderSolutions(content) {
    const root = document.querySelector("[data-cms-solutions]");
    if (!root) return;
    const items = (content.solutions || [])
      .slice()
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const allProducts = content.products || [];
    root.innerHTML = items.map((s, i) => solutionCard(s, i, allProducts)).join("");
    renderSolutionFilter(root, items);
  }

  function renderProducts(content) {
    const root = document.querySelector("[data-cms-products]");
    if (!root) return;
    root.innerHTML = (content.products || []).map(productCard).join("");
  }

  function renderSolutionFilter(grid, items) {
    const filterBar = document.querySelector("[data-cms-solution-filter]");
    if (!filterBar) return;
    const categories = ["All", ...new Set(items.map(s => s.category).filter(Boolean))];
    filterBar.innerHTML = categories.map((cat, i) =>
      `<button class="sol-filter-btn${i === 0 ? " active" : ""}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`
    ).join("");
    filterBar.addEventListener("click", e => {
      const btn = e.target.closest(".sol-filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".sol-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.cat;
      grid.querySelectorAll(".solution-case-card").forEach(card => {
        const match = cat === "All" || card.dataset.category === cat;
        card.style.display = match ? "" : "none";
      });
    });
  }

  function renderArchitectureFlow(content) {
    const root = document.querySelector("[data-cms-architecture-flow]");
    if (!root) return;
    const steps = ((content.pageContent?.solutions?.howItWorksSteps) || [])
      .slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (!steps.length) return;
    root.innerHTML = `<div class="flow-row">${steps.map((step, i) => {
      const s = localizeItem(step);
      return `<div class="flow-node">
        <small>${String(i + 1).padStart(2, "0")}</small>
        <strong>${escapeHtml(s.title)}</strong>
        <span>${escapeHtml(s.body)}</span>
      </div>`;
    }).join("")}</div>`;
  }

  function renderWhyPrinciples(content) {
    const root = document.querySelector("[data-cms-why-principles]");
    if (!root) return;
    const cards = ((content.pageContent?.solutions?.whyCards) || [])
      .slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (!cards.length) return;
    const delays = ["", " delay-1", " delay-2", " delay-3"];
    root.innerHTML = cards.map((card, i) => {
      const c = localizeItem(card);
      return `<article class="solutions-principle-card reveal${delays[i] || ""}">
        <span>${String(i + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.body)}</p>
      </article>`;
    }).join("");
  }

  function glossaryCard(item, index) {
    item = localizeItem(item);
    const delay = index % 2 ? ` delay-${index % 2}` : "";
    const noteHtml = item.note ? `<p><strong>${escapeHtml(item.noteLabel || (currentLocale() === 'tr' ? 'WillowSoft kullanım alanları:' : 'WillowSoft uses it in:'))}</strong> ${escapeHtml(item.note)}</p>` : "";
    return `
      <article class="card reveal${delay}" id="${escapeHtml(item.id)}">
        <h3>${escapeHtml(item.term)}</h3>
        <p>${escapeHtml(item.definition)}</p>
        ${noteHtml}
      </article>
    `;
  }

  function renderGlossary(content) {
    const glossary = content.glossary || [];
    document.querySelectorAll("[data-cms-glossary]").forEach((root) => {
      const category = root.dataset.cmsGlossary;
      const items = glossary
        .filter((item) => item.category === category)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      root.innerHTML = items.map((item, idx) => glossaryCard(item, idx)).join("");
    });
  }

  function renderFeaturedProducts(content) {
    const root = document.querySelector("[data-cms-featured-products]");
    if (!root) return;
    const featured = (content.products || []).filter((product) => product.featured).slice(0, 4);
    root.innerHTML = featured.map(productCard).join("");
    root.className = `grid grid-${Math.min(4, featured.length || 4)}`;
  }

  function renderNews(content) {
    document.querySelectorAll("[data-cms-news]").forEach((root) => {
      const limit = Number(root.dataset.limit || 99);
      const newsItems = (content.news || []).slice(0, limit);
      root.innerHTML = newsItems.map(newsCard).join("");
      root.className = `grid grid-${Math.min(3, newsItems.length || 3)}`;
    });
    // Hide skeleton loader once real content is injected
    const skeleton = document.getElementById("news-skeleton");
    if (skeleton) skeleton.remove();
  }

  function renderClients(content) {
    const root = document.querySelector("[data-cms-clients]");
    if (!root) return;
    root.innerHTML = (content.clients || [])
      .filter((client) => client.featured)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(clientTile)
      .join("");
  }

  function renderFacts(content) {
    document.querySelectorAll("[data-company-fact]").forEach((node) => {
      const key = node.dataset.companyFact;
      if (content.companyFacts && content.companyFacts[key]) {
        node.textContent = content.companyFacts[key];
      }
    });
  }

  function faqItem(faq) {
    faq = localizeItem(faq);
    // Question and answer are stored as display-ready text (answers already
    // contain pre-escaped entities like "&amp;"), so insert them as-is —
    // matching the static FAQ markup in products.html. Only convert newlines.
    const question = String(faq.question || "");
    const answer = String(faq.answer || "").replace(/\r?\n/g, "<br>");
    return `
      <details class="faq-item">
        <summary><span class="faq-q">${question}</span><span class="faq-toggle" aria-hidden="true"></span></summary>
        <p>${answer}</p>
      </details>
    `;
  }

  function renderFaqs(content) {
    const faqs = content.faqs || [];
    document.querySelectorAll("[data-cms-faqs]").forEach((root) => {
      const page = root.dataset.page;
      const items = faqs
        .filter((faq) => !page || faq.page === page)
        .slice()
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      root.innerHTML = items.map(faqItem).join("");
    });
  }

  function renderPageContent(content) {
    const pageKey = activePageKey();
    const pageContent = content.pageContent?.[pageKey];
    const bindings = pageContentBindings[pageKey];
    if (!pageContent || !bindings) return;
    const locale = currentLocale();
    Object.entries(bindings).forEach(([key, selector]) => {
      const node = document.querySelector(selector);
      const value = localizedValue(pageContent[key], locale);
      if (node && value) {
        // Title fields may contain formatted HTML (hw-serif / hw-display markup).
        // Other fields (eyebrow, lead) are plain text and stay as textContent.
        if (key.toLowerCase().endsWith("title")) {
          node.innerHTML = value;
        } else {
          node.textContent = value;
        }
      }
    });
  }

  function revealDynamicContent() {
    const nodes = document.querySelectorAll("[data-cms-products] .reveal, [data-cms-featured-products] .reveal, [data-cms-news] .reveal, [data-cms-solutions] .reveal, [data-cms-glossary] .reveal, [data-cms-why-principles] .reveal, [data-cms-architecture-flow] .reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => {
        node.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    nodes.forEach((node) => observer.observe(node));
  }

  function renderPageSEOInjections(content) {
    const pageKey = activePageKey();
    const locale = currentLocale();
    const seoData = content.pageSeo?.[pageKey]?.[locale];
    if (!seoData) return;

    const isAdminPreview = window.self !== window.top || location.pathname.includes("admin.html") || location.search.includes("preview=true");

    // 1. Render AI Overview Box
    const existing = document.querySelector(".ai-overview-container");
    if (existing && existing.dataset.serverRendered === "true" && !isAdminPreview) {
      // Keep server-rendered version
    } else {
      if (existing) existing.remove();

      if (seoData.aiShortAnswer) {
        const aiContainer = document.createElement("div");
        aiContainer.className = "ai-overview-container";

        let eeatHtml = "";
        if (seoData.author || seoData.reviewedBy || seoData.expertiseNote || seoData.lastUpdated) {
          eeatHtml = `
            <div class="ai-overview-eeat">
              ${seoData.author ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">✍️</span><span class="ai-overview-eeat-label">Yazar:</span><span class="ai-overview-eeat-val">${escapeHtml(seoData.author)}</span></div>` : ""}
              ${seoData.reviewedBy ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">🛡️</span><span class="ai-overview-eeat-label">İnceleyen:</span><span class="ai-overview-eeat-val">${escapeHtml(seoData.reviewedBy)}</span></div>` : ""}
              ${seoData.expertiseNote ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">💡</span><span class="ai-overview-eeat-label">Uzmanlık:</span><span class="ai-overview-eeat-val">${escapeHtml(seoData.expertiseNote)}</span></div>` : ""}
              ${seoData.lastUpdated ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">📅</span><span class="ai-overview-eeat-label">Güncelleme:</span><span class="ai-overview-eeat-val">${escapeHtml(seoData.lastUpdated)}</span></div>` : ""}
            </div>
          `;
        }

        aiContainer.innerHTML = `
          <div class="ai-overview-header">
            <svg class="ai-overview-icon" viewBox="0 0 24 24">
              <path d="M12 2L14.8 8.6L22 9.2L16.5 14L18.2 21L12 17.2L5.8 21L7.5 14L2 9.2L9.2 8.6L12 2Z" />
            </svg>
            <span class="ai-overview-title">Google AI Overview (SGE) Özeti</span>
            <span class="ai-overview-badge">AI Doğrulanmış</span>
          </div>
          <p class="ai-overview-text">${escapeHtml(seoData.aiShortAnswer)}</p>
          ${eeatHtml}
        `;

        const hero = document.querySelector(".motion-hero, .hero");
        if (hero) {
          hero.parentNode.insertBefore(aiContainer, hero.nextSibling);
        } else {
          const main = document.querySelector("main") || document.body;
          main.insertBefore(aiContainer, main.firstChild);
        }
      }
    }

    // 2. Render Page-Specific AI FAQs Accordion
    const existingFaq = document.querySelector(".dynamic-faq-section");
    if (existingFaq && existingFaq.dataset.serverRendered === "true" && !isAdminPreview) {
      // Keep server-rendered version
    } else {
      if (existingFaq) existingFaq.remove();

      if (Array.isArray(seoData.aiFAQ) && seoData.aiFAQ.length > 0) {
        const faqSection = document.createElement("section");
        faqSection.className = "dynamic-faq-section services-faq-section";

        const faqItemsHtml = seoData.aiFAQ.map((qa) => `
          <details class="faq-item">
            <summary>
              <span class="faq-q">${escapeHtml(qa.question)}</span>
              <span class="faq-toggle" aria-hidden="true"></span>
            </summary>
            <p>${escapeHtml(qa.answer).replace(/\r?\n/g, "<br>")}</p>
          </details>
        `).join("");

        faqSection.innerHTML = `
          <div class="dynamic-faq-inner">
            <div class="section-head">
              <span class="eyebrow">Sıkça Sorulan Sorular</span>
              <h2>Yapay Zeka &amp; Detaylar</h2>
            </div>
            <div class="faq-list">
              ${faqItemsHtml}
            </div>
          </div>
        `;

        const footer = document.querySelector("footer, .footer, .final-cta");
        if (footer) {
          footer.parentNode.insertBefore(faqSection, footer);
        } else {
          document.body.appendChild(faqSection);
        }
      }
    }
  }

  window.WillowCMS = {
    fetchContent,
    escapeHtml,
    currentLocale,
    localizedValue,
    localizeItem,
    renderPageContent,
    renderProducts,
    renderFeaturedProducts,
    renderNews,
    renderClients,
    renderFacts,
    renderSolutions,
    renderFaqs,
    renderGlossary,
    renderPageSEOInjections,
    renderArchitectureFlow,
    renderWhyPrinciples
  };

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const content = await fetchContent();
      renderProducts(content);
      renderFeaturedProducts(content);
      renderNews(content);
      renderClients(content);
      renderFacts(content);
      renderSolutions(content);
      renderArchitectureFlow(content);
      renderWhyPrinciples(content);
      renderFaqs(content);
      renderGlossary(content);
      renderPageContent(content);
      renderPageSEOInjections(content);
      revealDynamicContent();
      document.dispatchEvent(new CustomEvent("willow:content-ready", { detail: content }));
    } catch (error) {
      console.warn("WillowCMS failed to load content", error);
    }
  });
})();
