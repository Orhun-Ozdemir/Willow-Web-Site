(function () {
  const state = {
    content: null,
    leads: [],
    analytics: null
  };

  const qs = (selector) => document.querySelector(selector);
  const qsa = (selector) => Array.from(document.querySelectorAll(selector));
  const esc = (value) => window.WillowCMS.escapeHtml(value);
  const localeNames = {
    en: "English",
    tr: "Turkish",
    de: "German",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    ar: "Arabic",
    ja: "Japanese"
  };

  function showLogin(message = "") {
    qs("[data-admin-login]")?.classList.remove("hidden");
    const error = qs("[data-admin-login-error]");
    if (error) error.textContent = message;
  }

  function hideLogin() {
    qs("[data-admin-login]")?.classList.add("hidden");
  }

  async function checkSession() {
    try {
      const response = await fetch("/api/session", { cache: "no-store" });
      const session = response.ok ? await response.json() : null;
      if (session?.authenticated) {
        hideLogin();
        return true;
      }
    } catch {
      // Login form remains visible.
    }
    showLogin();
    return false;
  }

  async function login(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const error = qs("[data-admin-login-error]");
    if (error) error.textContent = "";
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => null);
    if (!response?.ok) {
      showLogin("Invalid admin credentials.");
      return;
    }
    hideLogin();
    await loadAdminData();
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    showLogin("Signed out.");
  }

  async function loadLeads() {
    try {
      const response = await fetch("/api/leads", { cache: "no-store" });
      if (response.status === 401) {
        showLogin("Please sign in to view messages.");
        state.leads = [];
      } else {
        state.leads = response.ok ? await response.json() : [];
      }
    } catch {
      state.leads = JSON.parse(window.localStorage.getItem("willowsoft-leads-offline") || "[]");
    }
    renderLeads();
    renderOverview();
  }

  async function saveContent() {
    collectContentFromDom();
    state.content.meta = {
      ...(state.content.meta || {}),
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.content)
      });
      if (response.status === 401) {
        showLogin("Please sign in to save content.");
        return;
      }
      if (!response.ok) throw new Error("API save failed");
    } catch {
      window.localStorage.setItem("willowsoft-content-draft", JSON.stringify(state.content));
    }

    const button = qs("[data-save-content]");
    const original = button.textContent;
    button.textContent = "Saved";
    setTimeout(() => {
      button.textContent = original;
    }, 1200);
  }

  function activateTab(tabName) {
    qsa("[data-admin-tab]").forEach((button) => button.classList.toggle("active", button.dataset.adminTab === tabName));
    qsa("[data-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tabName));
  }

  function renderOverview() {
    const root = qs("[data-admin-overview]");
    if (!root || !state.content) return;
    const summary = state.analytics?.summary || {};
    const stats = [
      ["Products", state.content.products?.length || 0],
      ["News", state.content.news?.length || 0],
      ["Client Logos", state.content.clients?.length || 0],
      ["Messages", state.leads.length],
      ["Visitors", summary.uniqueVisitors || 0],
      ["Tracked Events", summary.totalEvents || 0],
      ["Locales", state.content.meta?.locales?.length || 0],
      ["Services", state.content.services?.length || 0]
    ];
    root.innerHTML = stats.map(([label, value]) => `
      <article class="admin-stat">
        <strong>${esc(value)}</strong>
        <span>${esc(label)}</span>
      </article>
    `).join("");
  }

  function chipsToString(chips) {
    return Array.isArray(chips) ? chips.join(", ") : "";
  }

  function locales() {
    return state.content?.meta?.locales || ["en", "tr", "de", "fr", "es", "it", "ar", "ja"];
  }

  function translationEditor(collection, index, item, fields) {
    const editableLocales = locales().filter((locale) => locale !== "en");
    if (!editableLocales.length) return "";
    return `
      <details class="admin-translation-block">
        <summary>Translations</summary>
        <div class="admin-translation-grid">
          ${editableLocales.map((locale) => `
            <section class="admin-locale-card" data-${collection}-locale="${esc(locale)}">
              <h4>${esc(localeNames[locale] || locale.toUpperCase())}</h4>
              ${fields.map((field) => {
                const value = item.localized?.[locale]?.[field.key] || "";
                const tag = field.type === "textarea" ? "textarea" : "input";
                return `<label>${esc(field.label)}${tag === "textarea" ? `<textarea data-localized-field="${esc(field.key)}">${esc(value)}</textarea>` : `<input data-localized-field="${esc(field.key)}" value="${esc(value)}" />`}</label>`;
              }).join("")}
            </section>
          `).join("")}
        </div>
      </details>
    `;
  }

  function productEditor(product, index) {
    return `
      <article class="admin-card" data-product-index="${index}">
        <div class="admin-card-top">
          <strong>${esc(product.title || "New Product")}</strong>
          <button type="button" data-remove-product="${index}">Remove</button>
        </div>
        <div class="admin-form-grid">
          <label>Title<input data-field="title" value="${esc(product.title)}" /></label>
          <label>Slug<input data-field="slug" value="${esc(product.slug)}" /></label>
          <label>Category<input data-field="category" value="${esc(product.category)}" /></label>
          <label>Image<input data-field="image" value="${esc(product.image)}" /></label>
          <label>Chips<input data-field="chips" value="${esc(chipsToString(product.chips))}" /></label>
          <label class="span-2">Description<textarea data-field="shortDescription">${esc(product.shortDescription)}</textarea></label>
        </div>
        ${translationEditor("product", index, product, [
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "shortDescription", label: "Description", type: "textarea" },
          { key: "chips", label: "Chips comma-separated" },
          { key: "technicalSummary", label: "Technical Summary", type: "textarea" },
          { key: "useCases", label: "Use Cases", type: "textarea" },
          { key: "specifications", label: "Specifications", type: "textarea" }
        ])}
      </article>
    `;
  }

  function newsEditor(item, index) {
    return `
      <article class="admin-card" data-news-index="${index}">
        <div class="admin-card-top">
          <strong>${esc(item.title || "New News")}</strong>
          <button type="button" data-remove-news="${index}">Remove</button>
        </div>
        <div class="admin-form-grid">
          <label>Title<input data-field="title" value="${esc(item.title)}" /></label>
          <label>Slug<input data-field="slug" value="${esc(item.slug)}" /></label>
          <label>Date<input data-field="date" type="date" value="${esc(item.date)}" /></label>
          <label>Category<input data-field="category" value="${esc(item.category)}" /></label>
          <label class="span-2">Image<input data-field="image" value="${esc(item.image)}" /></label>
          <label class="span-2">Excerpt<textarea data-field="excerpt">${esc(item.excerpt)}</textarea></label>
        </div>
        ${translationEditor("news", index, item, [
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "excerpt", label: "Excerpt", type: "textarea" },
          { key: "content", label: "Full Content", type: "textarea" }
        ])}
      </article>
    `;
  }

  function solutionEditor(solution, index) {
    const bulletsText = Array.isArray(solution.bullets)
      ? solution.bullets.join("\n")
      : String(solution.bullets || "");
    const productsText = Array.isArray(solution.productsUsed)
      ? solution.productsUsed.join(", ")
      : String(solution.productsUsed || "");
    const servicesText = Array.isArray(solution.servicesUsed)
      ? solution.servicesUsed.join(", ")
      : String(solution.servicesUsed || "");
    return `
      <article class="admin-card" data-solution-index="${index}">
        <div class="admin-card-top">
          <strong>${esc(solution.title || solution.headline || "New Solution")}</strong>
          <button type="button" data-remove-solution="${index}">Remove</button>
        </div>
        <div class="admin-form-grid">
          <label>Title<input data-field="title" value="${esc(solution.title)}" /></label>
          <label>Slug<input data-field="slug" value="${esc(solution.slug)}" /></label>
          <label>Category<input data-field="category" value="${esc(solution.category)}" /></label>
          <label>Image<input data-field="image" value="${esc(solution.image)}" /></label>
          <label>Sort Order<input data-field="sortOrder" type="number" value="${esc(solution.sortOrder)}" /></label>
          <label>Featured<select data-field="featured"><option value="true"${solution.featured ? " selected" : ""}>Yes</option><option value="false"${!solution.featured ? " selected" : ""}>No</option></select></label>
          <label class="span-2">Headline<input data-field="headline" value="${esc(solution.headline)}" /></label>
          <label class="span-2">Summary<textarea data-field="summary">${esc(solution.summary)}</textarea></label>
          <label class="span-2">Bullet points (one per line)<textarea data-field="bullets" rows="4">${esc(bulletsText)}</textarea></label>
          <label>Products used (comma-separated slugs)<input data-field="productsUsed" value="${esc(productsText)}" /></label>
          <label>Services used (comma-separated slugs)<input data-field="servicesUsed" value="${esc(servicesText)}" /></label>
        </div>
        ${translationEditor("solution", index, solution, [
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "headline", label: "Headline" },
          { key: "summary", label: "Summary", type: "textarea" },
          { key: "bullets", label: "Bullet points (one per line)", type: "textarea" }
        ])}
      </article>
    `;
  }

  function clientEditor(client, index) {
    return `
      <article class="admin-card" data-client-index="${index}">
        <div class="admin-card-top">
          <strong>${esc(client.name || "New Client")}</strong>
          <button type="button" data-remove-client="${index}">Remove</button>
        </div>
        <div class="admin-form-grid">
          <label>Name<input data-field="name" value="${esc(client.name)}" /></label>
          <label>Industry<input data-field="industry" value="${esc(client.industry)}" /></label>
          <label>Country<input data-field="country" value="${esc(client.country)}" /></label>
          <label>Logo<input data-field="logo" value="${esc(client.logo)}" /></label>
          <label>Sort Order<input data-field="sortOrder" type="number" value="${esc(client.sortOrder)}" /></label>
          <label>Featured<select data-field="featured"><option value="true"${client.featured ? " selected" : ""}>Yes</option><option value="false"${!client.featured ? " selected" : ""}>No</option></select></label>
        </div>
        ${translationEditor("client", index, client, [
          { key: "name", label: "Name" },
          { key: "industry", label: "Industry" },
          { key: "country", label: "Country" }
        ])}
      </article>
    `;
  }

  function renderProducts() {
    const root = qs("[data-admin-products]");
    if (root) root.innerHTML = (state.content.products || []).map(productEditor).join("");
  }

  function renderSolutions() {
    const root = qs("[data-admin-solutions]");
    if (root) root.innerHTML = (state.content.solutions || []).map(solutionEditor).join("");
  }

  function renderNews() {
    const root = qs("[data-admin-news]");
    if (root) root.innerHTML = (state.content.news || []).map(newsEditor).join("");
  }

  function renderClients() {
    const root = qs("[data-admin-clients]");
    if (root) root.innerHTML = (state.content.clients || []).map(clientEditor).join("");
  }

  function renderPageContent() {
    const root = qs("[data-admin-page-content]");
    if (!root) return;
    const pages = state.content.pageContent || {};
    root.innerHTML = Object.entries(pages).map(([pageKey, page]) => `
      <article class="admin-card" data-page-content="${esc(pageKey)}">
        <div class="admin-card-top">
          <strong>${esc(pageKey)}</strong>
          <span>${esc(Object.keys(page).length)} text fields</span>
        </div>
        <div class="admin-page-copy-grid">
          ${Object.entries(page).map(([fieldKey, values]) => `
            <details class="admin-copy-field" data-page-field="${esc(fieldKey)}">
              <summary>${esc(fieldKey)}</summary>
              <div class="admin-translation-grid">
                ${locales().map((locale) => `
                  <label class="admin-locale-card">
                    <span>${esc(localeNames[locale] || locale.toUpperCase())}</span>
                    <textarea data-page-locale="${esc(locale)}">${esc(values?.[locale] || "")}</textarea>
                  </label>
                `).join("")}
              </div>
            </details>
          `).join("")}
        </div>
      </article>
    `).join("");
  }

  function renderSettings() {
    const root = qs("[data-admin-settings]");
    if (!root) return;
    const facts = state.content.companyFacts || {};
    const translationKeys = Array.from(new Set(Object.values(state.content.translations || {}).flatMap((messages) => Object.keys(messages || {})))).sort();
    root.innerHTML = `
      <article class="admin-card">
        <div class="admin-card-top"><strong>Company Facts</strong></div>
        <div class="admin-form-grid" data-company-facts-editor>
          <label>Founded<input data-field="founded" value="${esc(facts.founded)}" /></label>
          <label>Customers<input data-field="customers" value="${esc(facts.customers)}" /></label>
          <label>Happy Clients<input data-field="happyClients" value="${esc(facts.happyClients)}" /></label>
          <label>Products on Market<input data-field="productsOnMarket" value="${esc(facts.productsOnMarket)}" /></label>
          <label>Projects<input data-field="projects" value="${esc(facts.projects)}" /></label>
          <label>Countries<input data-field="countries" value="${esc(facts.countries)}" /></label>
          <label>Offices Worldwide<input data-field="officesWorldwide" value="${esc(facts.officesWorldwide)}" /></label>
          <label>Email<input data-field="email" value="${esc(facts.email)}" /></label>
          <label>Turkey Phone<input data-field="turkeyPhone" value="${esc(facts.turkeyPhone)}" /></label>
          <label>Exports<input data-field="exports" value="${esc(facts.exports)}" /></label>
          <label class="span-2">Turkey Office Address<textarea data-field="turkeyOfficeAddress">${esc(facts.turkeyOfficeAddress)}</textarea></label>
          <label class="span-2">UK Office Address<textarea data-field="ukOfficeAddress">${esc(facts.ukOfficeAddress)}</textarea></label>
          <label class="span-2">Launch Note<textarea data-field="note">${esc(facts.note)}</textarea></label>
        </div>
      </article>
      <article class="admin-card">
        <div class="admin-card-top"><strong>Locales</strong></div>
        <p>${esc((state.content.meta?.locales || []).join(", "))}</p>
        <p class="admin-note">These 8 locale routes are enabled: /en, /tr, /de, /fr, /es, /it, /ar, /ja. Add translated copy in Page Texts, Products, News and UI Labels.</p>
      </article>
      <article class="admin-card">
        <div class="admin-card-top"><strong>UI Labels</strong><span>Navigation, CTA and system text</span></div>
        <div class="admin-page-copy-grid" data-ui-translations-editor>
          ${translationKeys.map((key) => `
            <details class="admin-copy-field" data-ui-key="${esc(key)}">
              <summary>${esc(key)}</summary>
              <div class="admin-translation-grid">
                ${locales().map((locale) => `
                  <label class="admin-locale-card">
                    <span>${esc(localeNames[locale] || locale.toUpperCase())}</span>
                    <input data-ui-locale="${esc(locale)}" value="${esc(state.content.translations?.[locale]?.[key] || "")}" />
                  </label>
                `).join("")}
              </div>
            </details>
          `).join("")}
        </div>
      </article>
    `;
  }

  function renderLeads() {
    const root = qs("[data-admin-leads]");
    if (!root) return;
    if (!state.leads.length) {
      root.innerHTML = `<article class="admin-card"><p>No messages yet.</p></article>`;
      return;
    }

    root.innerHTML = state.leads.map((lead) => `
      <article class="admin-card" data-lead-id="${esc(lead.id)}">
        <div class="admin-card-top">
          <strong>${esc(lead.name || "Unnamed lead")}</strong>
          <span>${esc(new Date(lead.createdAt).toLocaleString())}</span>
        </div>
        <p><strong>Email:</strong> ${esc(lead.email)} ${lead.company ? "• " + esc(lead.company) : ""}</p>
        <p><strong>Interest:</strong> ${esc(lead.interestType || lead.projectType || "Not specified")}</p>
        <p>${esc(lead.message)}</p>
        <div class="admin-form-grid">
          <label>Status
            <select data-lead-status>
              ${["new", "reviewed", "contacted", "qualified", "proposal_sent", "won", "lost", "spam"].map((status) => `<option value="${status}"${lead.status === status ? " selected" : ""}>${status}</option>`).join("")}
            </select>
          </label>
          <label class="span-2">Internal Note<textarea data-lead-note>${esc(lead.internalNote)}</textarea></label>
        </div>
        <button class="btn btn-secondary btn-small" type="button" data-update-lead="${esc(lead.id)}">Update Lead</button>
      </article>
    `).join("");
  }

  async function loadAnalytics() {
    try {
      const response = await fetch("/api/events", { cache: "no-store" });
      if (response.status === 401) {
        showLogin("Please sign in to view analytics.");
        state.analytics = null;
      } else {
        state.analytics = response.ok ? await response.json() : null;
      }
    } catch {
      state.analytics = null;
    }
    renderAnalytics();
    renderOverview();
  }

  function formatDuration(ms) {
    if (!ms) return "0s";
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }

  function renderEventBreakdown(title, items, emptyLabel) {
    if (!items?.length) return `<article class="admin-card"><h3>${esc(title)}</h3><p>${esc(emptyLabel)}</p></article>`;
    return `
      <article class="admin-card">
        <h3>${esc(title)}</h3>
        <div class="admin-metric-list">
          ${items.map((item) => `
            <div>
              <span>${esc(item.path || item.country || item.label)}</span>
              <strong>${esc(item.count)}</strong>
            </div>
          `).join("")}
        </div>
      </article>
    `;
  }

  function renderAnalytics() {
    const root = qs("[data-admin-analytics]");
    if (!root) return;
    const summary = state.analytics?.summary;
    if (!summary) {
      root.innerHTML = `<article class="admin-card"><p>No analytics data yet. Open the public site and interact with it to start collecting events.</p></article>`;
      return;
    }

    const typeItems = Object.entries(summary.byType || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => ({ label, count }));
    const latest = summary.latest || [];

    root.innerHTML = `
      <div class="admin-grid">
        <article class="admin-stat"><strong>${esc(summary.totalEvents)}</strong><span>Total events</span></article>
        <article class="admin-stat"><strong>${esc(summary.uniqueVisitors)}</strong><span>Unique visitors</span></article>
        <article class="admin-stat"><strong>${esc(formatDuration(summary.averageDurationMs))}</strong><span>Avg. page time</span></article>
        <article class="admin-stat"><strong>${esc((summary.topCountries || []).length || "N/A")}</strong><span>Country signals</span></article>
      </div>
      <div class="admin-analytics-grid">
        ${renderEventBreakdown("Top Pages", summary.topPages, "No page data yet.")}
        ${renderEventBreakdown("Top Countries", summary.topCountries, "Country data appears after hosting behind Cloudflare/Vercel country headers.")}
        ${renderEventBreakdown("Event Types", typeItems, "No event data yet.")}
      </div>
      <article class="admin-card">
        <h3>Recent Activity</h3>
        <div class="admin-event-table">
          ${latest.map((event) => `
            <div>
              <span>${esc(new Date(event.createdAt).toLocaleString())}</span>
              <strong>${esc(event.eventType)}</strong>
              <span>${esc(event.path)}</span>
              <span>${esc(event.country || event.timezone || event.language || "-")}</span>
            </div>
          `).join("") || "<p>No recent events.</p>"}
        </div>
      </article>
    `;
  }

  function collectCollection(selector, collection, mapper) {
    state.content[collection] = qsa(selector).map((card) => mapper(card));
  }

  function collectContentFromDom() {
    collectCollection("[data-product-index]", "products", (card) => ({
      ...state.content.products[Number(card.dataset.productIndex)],
      title: card.querySelector('[data-field="title"]').value,
      slug: card.querySelector('[data-field="slug"]').value,
      category: card.querySelector('[data-field="category"]').value,
      image: card.querySelector('[data-field="image"]').value,
      detailUrl: "",
      chips: card.querySelector('[data-field="chips"]').value.split(",").map((chip) => chip.trim()).filter(Boolean),
      shortDescription: card.querySelector('[data-field="shortDescription"]').value,
      localized: collectLocalized(card, "product")
    }));

    collectCollection("[data-news-index]", "news", (card) => ({
      ...state.content.news[Number(card.dataset.newsIndex)],
      title: card.querySelector('[data-field="title"]').value,
      slug: card.querySelector('[data-field="slug"]').value,
      date: card.querySelector('[data-field="date"]').value,
      category: card.querySelector('[data-field="category"]').value,
      image: card.querySelector('[data-field="image"]').value,
      excerpt: card.querySelector('[data-field="excerpt"]').value,
      localized: collectLocalized(card, "news")
    }));

    collectCollection("[data-client-index]", "clients", (card) => ({
      ...state.content.clients[Number(card.dataset.clientIndex)],
      name: card.querySelector('[data-field="name"]').value,
      industry: card.querySelector('[data-field="industry"]').value,
      country: card.querySelector('[data-field="country"]').value,
      logo: card.querySelector('[data-field="logo"]').value,
      sortOrder: Number(card.querySelector('[data-field="sortOrder"]').value || 0),
      featured: card.querySelector('[data-field="featured"]').value === "true",
      localized: collectLocalized(card, "client")
    }));

    collectPageContentFromDom();

    const facts = qs("[data-company-facts-editor]");
    if (facts) {
      state.content.companyFacts = {
        ...state.content.companyFacts,
        founded: facts.querySelector('[data-field="founded"]').value,
        customers: facts.querySelector('[data-field="customers"]').value,
        happyClients: facts.querySelector('[data-field="happyClients"]').value,
        productsOnMarket: facts.querySelector('[data-field="productsOnMarket"]').value,
        projects: facts.querySelector('[data-field="projects"]').value,
        countries: facts.querySelector('[data-field="countries"]').value,
        officesWorldwide: facts.querySelector('[data-field="officesWorldwide"]').value,
        email: facts.querySelector('[data-field="email"]').value,
        turkeyPhone: facts.querySelector('[data-field="turkeyPhone"]').value,
        exports: facts.querySelector('[data-field="exports"]').value,
        turkeyOfficeAddress: facts.querySelector('[data-field="turkeyOfficeAddress"]').value,
        ukOfficeAddress: facts.querySelector('[data-field="ukOfficeAddress"]').value,
        note: facts.querySelector('[data-field="note"]').value
      };
    }

    const uiTranslations = qs("[data-ui-translations-editor]");
    if (uiTranslations) {
      state.content.translations = state.content.translations || {};
      locales().forEach((locale) => {
        state.content.translations[locale] = state.content.translations[locale] || {};
      });
      uiTranslations.querySelectorAll("[data-ui-key]").forEach((fieldRoot) => {
        const key = fieldRoot.dataset.uiKey;
        fieldRoot.querySelectorAll("[data-ui-locale]").forEach((input) => {
          state.content.translations[input.dataset.uiLocale][key] = input.value;
        });
      });
    }
  }

  function collectLocalized(card, collection) {
    const localized = {};
    qsa(`[data-${collection}-locale]`).forEach((localeRoot) => {
      if (!card.contains(localeRoot)) return;
      const locale = localeRoot.dataset[`${collection}Locale`];
      localized[locale] = {};
      localeRoot.querySelectorAll("[data-localized-field]").forEach((field) => {
        localized[locale][field.dataset.localizedField] = field.value;
      });
    });
    return localized;
  }

  function collectPageContentFromDom() {
    const next = {};
    qsa("[data-page-content]").forEach((pageCard) => {
      const pageKey = pageCard.dataset.pageContent;
      next[pageKey] = {};
      pageCard.querySelectorAll("[data-page-field]").forEach((fieldRoot) => {
        const fieldKey = fieldRoot.dataset.pageField;
        next[pageKey][fieldKey] = {};
        fieldRoot.querySelectorAll("[data-page-locale]").forEach((input) => {
          next[pageKey][fieldKey][input.dataset.pageLocale] = input.value;
        });
      });
    });
    state.content.pageContent = {
      ...(state.content.pageContent || {}),
      ...next
    };
  }

  async function updateLead(id) {
    const card = qs(`[data-lead-id="${CSS.escape(id)}"]`);
    const payload = {
      status: card.querySelector("[data-lead-status]").value,
      internalNote: card.querySelector("[data-lead-note]").value
    };
    await fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {});
    await loadLeads();
  }

  function addProduct() {
    collectContentFromDom();
    state.content.products.unshift({
      id: `product-${Date.now()}`,
      title: "New Product",
      slug: "new-product",
      category: "environment",
      image: "pdf-assets/p06_01_X13.jpg",
      shortDescription: "Add product description.",
      chips: ["LoRaWAN"],
      featured: false,
      detailUrl: ""
    });
    state.content.products[0].localized = Object.fromEntries(locales().filter((locale) => locale !== "en").map((locale) => [locale, {
      title: "",
      category: "",
      shortDescription: "",
      chips: "",
      technicalSummary: "",
      useCases: "",
      specifications: ""
    }]));
    renderProducts();
  }

  function addNews() {
    collectContentFromDom();
    state.content.news.unshift({
      id: `news-${Date.now()}`,
      title: "New News",
      slug: "new-news",
      date: new Date().toISOString().slice(0, 10),
      category: "Company",
      excerpt: "Add news excerpt.",
      image: "pdf-assets/p29_06_X111.jpg",
      featured: false
    });
    state.content.news[0].localized = Object.fromEntries(locales().filter((locale) => locale !== "en").map((locale) => [locale, {
      title: "",
      category: "",
      excerpt: "",
      content: ""
    }]));
    renderNews();
  }

  function addSolution() {
    collectContentFromDom();
    if (!state.content.solutions) state.content.solutions = [];
    state.content.solutions.unshift({
      id: `solution-${Date.now()}`,
      title: "New Solution",
      slug: "new-solution",
      category: "Use case",
      headline: "What this solution does, in one line.",
      summary: "Short paragraph describing the operational problem and what WillowSoft delivers.",
      image: "",
      bullets: ["Product or sensor", "Connectivity / backend", "Operator interface"],
      productsUsed: [],
      servicesUsed: [],
      featured: true,
      sortOrder: 100
    });
    state.content.solutions[0].localized = Object.fromEntries(locales().filter((locale) => locale !== "en").map((locale) => [locale, {
      title: "",
      category: "",
      headline: "",
      summary: "",
      bullets: ""
    }]));
    renderSolutions();
  }

  function addClient() {
    collectContentFromDom();
    state.content.clients.push({
      id: `client-${Date.now()}`,
      name: "New Client",
      industry: "Industry",
      country: "Country",
      logo: "",
      featured: true,
      sortOrder: 100
    });
    state.content.clients[state.content.clients.length - 1].localized = Object.fromEntries(locales().filter((locale) => locale !== "en").map((locale) => [locale, {
      name: "",
      industry: "",
      country: ""
    }]));
    renderClients();
  }

  function bindEvents() {
    qsa("[data-admin-tab]").forEach((button) => {
      button.addEventListener("click", () => activateTab(button.dataset.adminTab));
    });
    qs("[data-save-content]").addEventListener("click", saveContent);
    qs("[data-admin-logout]").addEventListener("click", logout);
    qs("[data-admin-login-form]").addEventListener("submit", login);
    qs("[data-add-product]").addEventListener("click", addProduct);
    qs("[data-add-news]").addEventListener("click", addNews);
    qs("[data-add-client]").addEventListener("click", addClient);
    const addSolutionBtn = qs("[data-add-solution]");
    if (addSolutionBtn) addSolutionBtn.addEventListener("click", addSolution);
    qs("[data-refresh-leads]").addEventListener("click", loadLeads);
    qs("[data-refresh-analytics]").addEventListener("click", loadAnalytics);

    document.addEventListener("click", (event) => {
      const removeProduct = event.target.closest("[data-remove-product]");
      const removeNews = event.target.closest("[data-remove-news]");
      const removeClient = event.target.closest("[data-remove-client]");
      const removeSolution = event.target.closest("[data-remove-solution]");
      const updateLeadButton = event.target.closest("[data-update-lead]");
      if (removeProduct) {
        collectContentFromDom();
        state.content.products.splice(Number(removeProduct.dataset.removeProduct), 1);
        renderProducts();
      }
      if (removeNews) {
        collectContentFromDom();
        state.content.news.splice(Number(removeNews.dataset.removeNews), 1);
        renderNews();
      }
      if (removeClient) {
        collectContentFromDom();
        state.content.clients.splice(Number(removeClient.dataset.removeClient), 1);
        renderClients();
      }
      if (removeSolution) {
        collectContentFromDom();
        state.content.solutions.splice(Number(removeSolution.dataset.removeSolution), 1);
        renderSolutions();
      }
      if (updateLeadButton) updateLead(updateLeadButton.dataset.updateLead);
    });
  }

  async function init() {
    const authenticated = await checkSession();
    bindEvents();
    if (!authenticated) return;
    await loadAdminData();
  }

  async function loadAdminData() {
    state.content = await window.WillowCMS.fetchContent();
    renderOverview();
    renderProducts();
    renderNews();
    renderClients();
    renderSolutions();
    renderPageContent();
    renderSettings();
    await loadLeads();
    await loadAnalytics();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
