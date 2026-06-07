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
      ownershipEyebrow: "main > section:nth-of-type(4) .eyebrow",
      ownershipTitle: "main > section:nth-of-type(4) .page-title",
      ecosystemEyebrow: "main > section:nth-of-type(5) .section-head .eyebrow",
      ecosystemTitle: "main > section:nth-of-type(5) .section-head h2",
      productsEyebrow: "main > section:nth-of-type(6) .section-head .eyebrow",
      productsTitle: "main > section:nth-of-type(6) .section-head h2",
      industriesEyebrow: "main > section:nth-of-type(7) .section-head .eyebrow",
      industriesTitle: "main > section:nth-of-type(7) .section-head h2",
      newsEyebrow: "main > section:nth-of-type(8) .section-head .eyebrow",
      newsTitle: "main > section:nth-of-type(8) .section-head h2",
      ctaEyebrow: ".section.dark:last-of-type .eyebrow",
      ctaTitle: ".section.dark:last-of-type .page-title",
      ctaLead: ".section.dark:last-of-type .section-lead"
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
      processTitle: ".process-section .section-head h2",
      stackEyebrow: "[data-unused-services-stack-eyebrow]",
      stackTitle: "[data-unused-services-stack-title]",
      stackLead: "[data-unused-services-stack-lead]",
      digitalEyebrow: "[data-unused-services-digital-eyebrow]",
      digitalTitle: "[data-unused-services-digital-title]",
      vrEyebrow: "[data-unused-services-vr-eyebrow]",
      vrTitle: "[data-unused-services-vr-title]",
      vrLead: "[data-unused-services-vr-lead]"
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
      realityEyebrow: "[data-unused-start-project-reality-eyebrow]",
      realityTitle: "[data-unused-start-project-reality-title]",
      pathsEyebrow: ".start-process-section .section-head .eyebrow",
      pathsTitle: ".start-process-section .section-head h2",
      formEyebrow: "#lead-form .eyebrow",
      formTitle: "#lead-form .page-title",
      formLead: "#lead-form .section-lead"
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
    const cached = window.localStorage.getItem("willowsoft-content-draft");
    if (cached && !location.pathname.includes("admin")) {
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
    const productUrl = `/products/${encodeURIComponent(product.slug || product.id)}`;
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

    return `
      <article class="card news-card reveal${delay}">
        <figure><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" /></figure>
        <div class="product-body">
          <p class="eyebrow">${escapeHtml(item.category)} ${date ? "• " + escapeHtml(date) : ""}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.excerpt)}</p>
          <p style="margin-top:16px"><a class="btn btn-ghost btn-small" href="/news/${encodeURIComponent(item.slug || item.id)}">Read Update</a></p>
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

  function solutionCard(solution, index) {
    solution = localizeItem(solution);
    const delay = index % 4 ? ` delay-${index % 4}` : "";
    const bullets = Array.isArray(solution.bullets)
      ? solution.bullets
      : String(solution.bullets || "").split(/\r?\n|,/).map((b) => b.trim()).filter(Boolean);
    const bulletsHtml = bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");
    const headline = solution.headline || solution.title || "";

    return `
      <article class="solution-case-card reveal${delay}" data-solution="${escapeHtml(solution.slug || solution.id)}">
        ${solution.image ? `<figure><img src="${escapeHtml(solution.image)}" alt="${escapeHtml(headline)}" loading="lazy" decoding="async" /></figure>` : ""}
        <div class="solution-case-body">
          ${solution.category ? `<span>${escapeHtml(solution.category)}</span>` : ""}
          <h3>${escapeHtml(headline)}</h3>
          ${solution.summary ? `<p>${escapeHtml(solution.summary)}</p>` : ""}
          ${bulletsHtml ? `<ul>${bulletsHtml}</ul>` : ""}
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
    root.innerHTML = items.map(solutionCard).join("");
  }

  function renderProducts(content) {
    const root = document.querySelector("[data-cms-products]");
    if (!root) return;
    root.innerHTML = (content.products || []).map(productCard).join("");
  }

  function renderFeaturedProducts(content) {
    const root = document.querySelector("[data-cms-featured-products]");
    if (!root) return;
    root.innerHTML = (content.products || []).filter((product) => product.featured).slice(0, 4).map(productCard).join("");
  }

  function renderNews(content) {
    document.querySelectorAll("[data-cms-news]").forEach((root) => {
      const limit = Number(root.dataset.limit || 99);
      root.innerHTML = (content.news || []).slice(0, limit).map(newsCard).join("");
    });
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

  function renderPageContent(content) {
    const pageKey = activePageKey();
    const pageContent = content.pageContent?.[pageKey];
    const bindings = pageContentBindings[pageKey];
    if (!pageContent || !bindings) return;
    const locale = currentLocale();
    Object.entries(bindings).forEach(([key, selector]) => {
      const node = document.querySelector(selector);
      const value = localizedValue(pageContent[key], locale);
      if (node && value) node.textContent = value;
    });
  }

  function revealDynamicContent() {
    const nodes = document.querySelectorAll("[data-cms-products] .reveal, [data-cms-featured-products] .reveal, [data-cms-news] .reveal, [data-cms-solutions] .reveal");
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
    renderSolutions
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
      renderPageContent(content);
      revealDynamicContent();
      document.dispatchEvent(new CustomEvent("willow:content-ready", { detail: content }));
    } catch (error) {
      console.warn("WillowCMS failed to load content", error);
    }
  });
})();
