(function () {
  const state = {
    content: null,
    leads: [],
    analytics: null,
    editLocale: "tr",
    editingProduct: null, // index of the product being edited (null = grid view)
    editingPage: null     // key of the page being edited (null = grid view)
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

  const PIPELINE_COLUMNS = [
    { id: "new",       label: "Yeni",          statuses: ["new"] },
    { id: "contacted", label: "Görüşülüyor",   statuses: ["contacted", "reviewed"] },
    { id: "qualified", label: "Süreçte",        statuses: ["qualified", "proposal_sent"] },
    { id: "won",       label: "Kazanıldı",      statuses: ["won"] },
    { id: "lost",      label: "Kapandı",        statuses: ["lost", "spam"] }
  ];

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
    renderLeadsKanban();
    renderOverview();
  }

  function setSaveState(mode) {
    const el = qs("[data-save-state]");
    if (!el) return;
    const text = el.querySelector(".admin-save-text");
    el.dataset.state = mode;
    if (text) {
      text.textContent = mode === "dirty"
        ? "Kaydedilmemiş değişiklikler"
        : mode === "saving"
          ? "Kaydediliyor…"
          : "Tüm değişiklikler kaydedildi";
    }
  }

  function markDirty() {
    setSaveState("dirty");
  }

  async function saveContent() {
    state.content.meta = {
      ...(state.content.meta || {}),
      updatedAt: new Date().toISOString()
    };
    setSaveState("saving");

    let ok = true;
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.content)
      });
      if (response.status === 401) {
        showLogin("Please sign in to save content.");
        setSaveState("dirty");
        return;
      }
      if (!response.ok) throw new Error("API save failed");
    } catch {
      window.localStorage.setItem("willowsoft-content-draft", JSON.stringify(state.content));
      ok = false;
    }

    setSaveState("saved");
    const button = qs("[data-save-content]");
    const original = button.textContent;
    button.textContent = ok ? "Kaydedildi ✓" : "Taslak kaydedildi";
    setTimeout(() => { button.textContent = original; }, 1400);
  }

  function activateTab(tabName) {
    qsa("[data-admin-tab]").forEach((button) => button.classList.toggle("active", button.dataset.adminTab === tabName));
    qsa("[data-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tabName));

    const switcher = qs("[data-admin-locale-switcher]");
    if (switcher) {
      const showSwitcher = ["pages", "products", "solutions", "faqs", "news", "clients", "settings"].includes(tabName);
      switcher.style.display = showSwitcher ? "flex" : "none";
    }

    if (tabName === "translation-health") {
      renderTranslationHealth();
    } else if (tabName === "leads-kanban") {
      renderLeadsKanban();
    } else if (tabName === "system-backups") {
      renderSystemBackups();
    } else if (tabName === "seo-center") {
      renderSEOCenter();
    }
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

  const COLLECTION_STATE_KEY = {
    product: "products",
    news: "news",
    solution: "solutions",
    faq: "faqs",
    client: "clients"
  };

  function translationEditor(collection, index, item, fields) {
    const allLocales = locales().filter(l => l !== "en");
    const stateKey = COLLECTION_STATE_KEY[collection] || collection;
    const totalFields = fields.length * allLocales.length;

    return `
      <details class="admin-translation-accordion" data-trans-collection="${collection}" data-trans-index="${index}">
        <summary class="admin-translation-accordion-trigger">
          <span class="admin-translation-accordion-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Çeviriler — ${allLocales.length} dil, ${fields.length} alan
          </span>
          <svg class="admin-translation-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </summary>
        <div class="admin-translation-accordion-body">
          <div class="admin-trans-locale-tabs" data-trans-locale-tabs>
            ${allLocales.map((locale, i) => {
              const langName = localeNames[locale] || locale.toUpperCase();
              const filledCount = fields.filter(f => (item.localized?.[locale]?.[f.key] || "").toString().trim()).length;
              return `<button type="button" class="admin-trans-locale-tab${i === 0 ? " active" : ""}" data-trans-tab-locale="${esc(locale)}">${esc(langName)} <span class="admin-trans-count">${filledCount}/${fields.length}</span></button>`;
            }).join("")}
          </div>
          ${allLocales.map((locale, i) => {
            const editLangName = localeNames[locale] || locale.toUpperCase();
            return `
            <div class="admin-trans-locale-panel${i === 0 ? " active" : ""}" data-trans-panel-locale="${esc(locale)}">
              ${fields.map((field) => {
                const englishVal = item[field.key] || "";
                const transVal = item.localized?.[locale]?.[field.key] || "";
                const isTextarea = field.type === "textarea";
                const isRich = field.type === "rich";

                const sourceInner = isRich
                  ? (englishVal || `<span class="admin-source-empty">(boş)</span>`)
                  : esc(englishVal || "(boş)");

                const transControl = isRich
                  ? richTextField({ collection: stateKey, index, field: field.key, locale, value: transVal })
                  : (isTextarea
                      ? `<label>${esc(editLangName)} Çevirisi<textarea data-localized-field="${esc(field.key)}" data-locale="${esc(locale)}" rows="3">${esc(transVal)}</textarea></label>`
                      : `<label>${esc(editLangName)} Çevirisi<input data-localized-field="${esc(field.key)}" data-locale="${esc(locale)}" value="${esc(transVal)}" /></label>`);

                return `
                  <div class="admin-translation-editor-row${isRich ? " is-rich" : ""}" data-field-key="${esc(field.key)}">
                    <div class="admin-source-box">
                      <h5>${esc(field.label)}</h5>
                      <div class="admin-source-text">${sourceInner}</div>
                    </div>
                    <div class="admin-trans-input">
                      ${transControl}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>`;
          }).join("")}
        </div>
      </details>
    `;
  }


  function toImgUrl(path) {
    if (!path) return "";
    return path.startsWith("http") ? path : "/" + path.replace(/^\/+/, "");
  }

  const IMG_PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" class="admin-thumb-placeholder"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;

  function galleryRow(img, productIndex, galleryIndex) {
    const url = toImgUrl(img);
    return `
      <div class="admin-gallery-row" data-gallery-row="${galleryIndex}">
        <span class="admin-gallery-thumb">
          ${url ? `<img src="${esc(url)}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />` : ""}
          <span style="display:${url ? "none" : "block"}">${IMG_PLACEHOLDER_SVG}</span>
        </span>
        <input class="admin-gallery-input" data-gallery-input data-product-index="${productIndex}" value="${esc(img)}" placeholder="pdf-assets/p07_01_X17.jpg" />
        <span class="admin-gallery-row-actions">
          <button type="button" class="admin-icon-btn" data-gallery-move="up" data-product-index="${productIndex}" data-gallery-index="${galleryIndex}" title="Yukarı taşı" aria-label="Yukarı taşı">↑</button>
          <button type="button" class="admin-icon-btn" data-gallery-move="down" data-product-index="${productIndex}" data-gallery-index="${galleryIndex}" title="Aşağı taşı" aria-label="Aşağı taşı">↓</button>
          <button type="button" class="admin-icon-btn admin-icon-btn-danger" data-gallery-remove data-product-index="${productIndex}" data-gallery-index="${galleryIndex}" title="Kaldır" aria-label="Kaldır">✕</button>
        </span>
      </div>
    `;
  }

  function galleryEditor(product, index) {
    const images = Array.isArray(product.images) ? product.images : [];
    return `
      <div class="admin-gallery-editor span-2" data-gallery-editor data-product-index="${index}">
        <div class="admin-gallery-head">
          <span class="admin-gallery-title">Ürün Galerisi (Çoklu Görsel)</span>
          <button type="button" class="btn btn-secondary btn-small" data-gallery-add="${index}">+ Görsel Ekle</button>
        </div>
        <div class="admin-gallery-rows">
          ${images.length ? images.map((img, gi) => galleryRow(img, index, gi)).join("") : `<p class="admin-gallery-empty">Henüz galeri görseli yok. Ürün detay sayfasında birden çok görsel göstermek için "+ Görsel Ekle"ye tıklayın.</p>`}
        </div>
        <span class="field-helper">Ürün detay sayfasında büyük görsel + küçük resim şeridi olarak gösterilir. İlk görsel kapak olur.</span>
      </div>
    `;
  }

  // Lightweight rich-text field (no dependency). Outputs HTML into state via handleInput.
  function richTextField({ collection, index, field, locale = "", value = "", label = "", helper = "" }) {
    return `
      <div class="admin-rte-field span-2">
        ${label ? `<span class="admin-rte-label">${esc(label)}</span>` : ""}
        ${helper ? `<span class="field-helper">${esc(helper)}</span>` : ""}
        <div class="admin-rte-toolbar" data-rte-toolbar>
          <button type="button" class="admin-rte-btn" data-cmd="formatBlock" data-val="h3" title="Alt Başlık">H</button>
          <button type="button" class="admin-rte-btn" data-cmd="bold" title="Kalın"><strong>B</strong></button>
          <button type="button" class="admin-rte-btn" data-cmd="italic" title="İtalik"><em>I</em></button>
          <button type="button" class="admin-rte-btn" data-cmd="insertUnorderedList" title="Madde Listesi">&#8226;</button>
          <button type="button" class="admin-rte-btn" data-cmd="insertOrderedList" title="Numaralı Liste">1.</button>
          <button type="button" class="admin-rte-btn" data-cmd="createLink" title="Bağlantı Ekle">&#128279;</button>
          <button type="button" class="admin-rte-btn" data-cmd="removeFormat" title="Biçimi Temizle">&#10006;</button>
        </div>
        <div class="admin-rte" contenteditable="true" data-rte data-rte-collection="${esc(collection)}" data-rte-index="${index}" data-rte-field="${esc(field)}" data-rte-locale="${esc(locale)}">${value || ""}</div>
      </div>
    `;
  }

  /* ---- Product grid card (compact view) ---- */
  function productGridCard(product, index) {
    const imgUrl = product.image ? (product.image.startsWith("http") ? product.image : "/" + product.image) : "";
    const chips = Array.isArray(product.chips) ? product.chips.slice(0, 3) : [];
    const transCount = locales().filter(l => l !== "en").filter(l => (product.localized?.[l]?.title || "").trim()).length;
    const totalLangs = locales().filter(l => l !== "en").length;
    return `
      <article class="admin-product-grid-card" data-product-grid-card="${index}">
        <div class="admin-product-grid-img">
          ${imgUrl ? `<img src="${esc(imgUrl)}" alt="${esc(product.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" loading="lazy" />` : ""}
          <span class="admin-product-grid-placeholder" style="display:${imgUrl ? "none" : "flex"}">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--admin-muted)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          </span>
        </div>
        <div class="admin-product-grid-info">
          <strong class="admin-product-grid-title">${esc(product.title || "Yeni Ürün")}</strong>
          <span class="admin-product-grid-cat">${esc(product.category || "—")}</span>
          ${chips.length ? `<div class="admin-product-grid-chips">${chips.map(c => `<span class="admin-product-grid-chip">${esc(c)}</span>`).join("")}</div>` : ""}
          <span class="admin-product-grid-lang" title="Çeviri durumu">${transCount}/${totalLangs} dil</span>
        </div>
      </article>
    `;
  }

  /* ---- Full product editor (shown after click) ---- */
  function productEditor(product, index) {
    const imgUrl = product.image ? (product.image.startsWith("http") ? product.image : "/" + product.image) : "";
    return `
      <div class="admin-product-edit-view" data-product-index="${index}">
        <div class="admin-product-edit-header">
          <button type="button" class="btn btn-secondary btn-small" data-product-back>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Ürün Listesi
          </button>
          <strong class="admin-product-edit-name">${esc(product.title || "Yeni Ürün")}</strong>
          <button class="btn btn-danger btn-small" type="button" data-remove-product="${index}">Ürünü Sil</button>
        </div>

        <div class="admin-product-edit-body">
          <!-- Left: image + gallery -->
          <div class="admin-product-edit-media">
            <div class="admin-product-edit-hero-img">
              ${imgUrl ? `<img src="${esc(imgUrl)}" alt="${esc(product.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />` : ""}
              <span class="admin-product-grid-placeholder" style="display:${imgUrl ? "none" : "flex"};min-height:220px">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--admin-muted)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              </span>
            </div>
            <label class="admin-product-edit-img-input">Kapak Görseli
              <span class="field-helper">Dosya yolu. Örn: pdf-assets/p06_01_X13.jpg</span>
              <input data-field="image" value="${esc(product.image)}" />
            </label>
            ${galleryEditor(product, index)}
          </div>

          <!-- Right: form fields -->
          <div class="admin-product-edit-fields">
            <div class="admin-form-grid">
              <label>Ürün Adı
                <span class="field-helper">Web sitesinde gösterilecek ürün ismi.</span>
                <input data-field="title" value="${esc(product.title)}" />
              </label>
              <label>Sayfa Linki
                <span class="field-helper">Ürün sayfasının link uzantısı. Örn: willowair</span>
                <input data-field="slug" value="${esc(product.slug)}" />
              </label>
              <label>Kategori
                <span class="field-helper">Ürünün sektörel kategorisi.</span>
                <input data-field="category" value="${esc(product.category)}" />
              </label>
              <label>Özellik Etiketleri (Tagler)
                <span class="field-helper">Ürünü kategorize etmek için virgülle ayırarak birden fazla tag girebilirsiniz.</span>
                <input data-field="chips" value="${esc(chipsToString(product.chips))}" />
              </label>
              <label class="span-2">Kısa Açıklama
                <span class="field-helper">Ürün listesinde kart üstünde görünecek özet metin.</span>
                <textarea data-field="shortDescription">${esc(product.shortDescription)}</textarea>
              </label>
            </div>

            ${richTextField({ collection: "products", index, field: "technicalSummary", value: product.technicalSummary, label: "Teknik Özet", helper: "Ürün detay sayfasında gösterilir. Başlık ve liste için araç çubuğunu kullanın." })}
            ${richTextField({ collection: "products", index, field: "useCases", value: product.useCases, label: "Kullanım Alanları" })}
            ${richTextField({ collection: "products", index, field: "specifications", value: product.specifications, label: "Teknik Özellikler" })}
          </div>
        </div>

        ${translationEditor("product", index, product, [
          { key: "title", label: "Ürün Adı" },
          { key: "category", label: "Kategori" },
          { key: "shortDescription", label: "Kısa Açıklama", type: "textarea" },
          { key: "chips", label: "Etiketler (Virgülle ayrılmış)" },
          { key: "technicalSummary", label: "Teknik Özet", type: "rich" },
          { key: "useCases", label: "Kullanım Alanları", type: "rich" },
          { key: "specifications", label: "Teknik Özellikler", type: "rich" }
        ])}
      </div>
    `;
  }

  function newsEditor(item, index) {
    const imgUrl = item.image ? (item.image.startsWith("http") ? item.image : "/" + item.image) : "";
    return `
      <details class="admin-card admin-editor-card" data-news-index="${index}">
        <summary class="admin-card-top">
          <strong>${esc(item.title || "Yeni Haber")}</strong>
          <button class="btn btn-danger btn-small" type="button" data-remove-news="${index}">Kaldır</button>
        </summary>
        <div class="admin-form-grid">
          <label>Haber Başlığı
            <span class="field-helper">Haberin ana başlığı.</span>
            <input data-field="title" value="${esc(item.title)}" />
          </label>
          <label>Haber Linki
            <span class="field-helper">Sayfa link uzantısı. Örn: yeni-yatirim</span>
            <input data-field="slug" value="${esc(item.slug)}" />
          </label>
          <label>Tarih
            <span class="field-helper">Yayınlanma tarihi.</span>
            <input data-field="date" type="date" value="${esc(item.date)}" />
          </label>
          <label>Kategori
            <span class="field-helper">Haber kategorisi. Örn: Şirket, Teknoloji</span>
            <input data-field="category" value="${esc(item.category)}" />
          </label>
          
          <div class="admin-image-preview-wrapper" style="grid-column: span 2;">
            <div class="admin-image-preview-thumbnail">
              ${imgUrl ? `<img src="${esc(imgUrl)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />` : ""}
              <svg style="width: 24px; height: 24px; fill: var(--admin-muted); display: ${imgUrl ? 'none' : 'block'};" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            </div>
            <label style="flex: 1; margin: 0;">Haber Görseli
              <span class="field-helper">Örn: pdf-assets/p29_06_X111.jpg</span>
              <input data-field="image" value="${esc(item.image)}" style="margin-top: 4px;" />
            </label>
          </div>

          <label class="span-2">Özet Giriş Metni
            <span class="field-helper">Haber listesinde gösterilecek özet cümle.</span>
            <textarea data-field="excerpt">${esc(item.excerpt)}</textarea>
          </label>
        </div>
        ${translationEditor("news", index, item, [
          { key: "title", label: "Haber Başlığı" },
          { key: "category", label: "Kategori" },
          { key: "excerpt", label: "Özet Giriş Metni", type: "textarea" },
          { key: "content", label: "Haber Detay İçeriği", type: "textarea" }
        ])}
      </details>
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
    const imgUrl = solution.image ? (solution.image.startsWith("http") ? solution.image : "/" + solution.image) : "";

    return `
      <details class="admin-card admin-editor-card" data-solution-index="${index}">
        <summary class="admin-card-top">
          <strong>${esc(solution.title || solution.headline || "Yeni Çözüm")}</strong>
          <button class="btn btn-danger btn-small" type="button" data-remove-solution="${index}">Kaldır</button>
        </summary>
        <div class="admin-form-grid">
          <label>Çözüm Adı
            <span class="field-helper">Kısa başlık, örn: Akıllı Tarım</span>
            <input data-field="title" value="${esc(solution.title)}" />
          </label>
          <label>Çözüm Linki
            <span class="field-helper">Sayfa link uzantısı. Örn: akilli-tarim</span>
            <input data-field="slug" value="${esc(solution.slug)}" />
          </label>
          <label>Kategori
            <span class="field-helper">Sektör kategorisi.</span>
            <input data-field="category" value="${esc(solution.category)}" />
          </label>
          <label>Sıralama
            <span class="field-helper">Küçük sayılar daha önce gösterilir.</span>
            <input data-field="sortOrder" type="number" value="${esc(solution.sortOrder)}" />
          </label>
          <label>Öne Çıkarılan
            <span class="field-helper">Çözümler sayfasında öne çıkarılsın mı?</span>
            <select data-field="featured"><option value="true"${solution.featured ? " selected" : ""}>Evet</option><option value="false"${!solution.featured ? " selected" : ""}>Hayır</option></select>
          </label>
          
          <div class="admin-image-preview-wrapper" style="grid-column: span 1;">
            <div class="admin-image-preview-thumbnail">
              ${imgUrl ? `<img src="${esc(imgUrl)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />` : ""}
              <svg style="width: 24px; height: 24px; fill: var(--admin-muted); display: ${imgUrl ? 'none' : 'block'};" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            </div>
            <label style="flex: 1; margin: 0;">Çözüm Görseli
              <input data-field="image" value="${esc(solution.image)}" style="margin-top: 4px;" />
            </label>
          </div>

          <label class="span-2">Çözüm Manşeti
            <span class="field-helper">Sayfa başında büyük harflerle görünecek manşet cümlesi.</span>
            <input data-field="headline" value="${esc(solution.headline)}" />
          </label>
          <label class="span-2">Detaylı Açıklama
            <span class="field-helper">Çözüm detaylarını açıklayan ana paragraf.</span>
            <textarea data-field="summary">${esc(solution.summary)}</textarea>
          </label>
          <label class="span-2">Madde Noktaları (Her satıra bir tane)
            <span class="field-helper">Çözümün sunduğu fayda veya aşamalar.</span>
            <textarea data-field="bullets" rows="3">${esc(bulletsText)}</textarea>
          </label>
          <label>Kullanılan Ürünler
            <span class="field-helper">Ürünlerin slug değerleri (virgülle ayırın). Örn: willowair</span>
            <input data-field="productsUsed" value="${esc(productsText)}" />
          </label>
          <label>İlişkili Hizmetler
            <span class="field-helper">Hizmetlerin slug değerleri (virgülle ayırın).</span>
            <input data-field="servicesUsed" value="${esc(servicesText)}" />
          </label>
        </div>
        ${translationEditor("solution", index, solution, [
          { key: "title", label: "Çözüm Adı" },
          { key: "category", label: "Kategori" },
          { key: "headline", label: "Çözüm Manşeti" },
          { key: "summary", label: "Açıklama Detayı", type: "textarea" },
          { key: "bullets", label: "Madde Noktaları (Satır satır)", type: "textarea" }
        ])}
      </details>
    `;
  }

  function clientEditor(client, index) {
    const imgUrl = client.logo ? (client.logo.startsWith("http") ? client.logo : "/" + client.logo) : "";
    return `
      <div class="admin-client-grid-card" data-client-index="${index}">
        <div class="admin-client-grid-img">
          ${imgUrl ? `<img src="${esc(imgUrl)}" />` : `<svg style="width: 32px; height: 32px; fill: var(--admin-muted);" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`}
        </div>
        <div class="admin-client-grid-inputs">
          <label>Marka Adı
            <input data-field="name" value="${esc(client.name)}" />
          </label>
          <label>Sektör
            <input data-field="industry" value="${esc(client.industry)}" />
          </label>
          <label>Logo Görsel Yolu
            <input data-field="logo" value="${esc(client.logo)}" />
          </label>
          <button class="btn btn-danger btn-small" type="button" data-remove-client="${index}" style="margin-top: 8px;">Kaldır</button>
        </div>
      </div>
    `;
  }

  function faqEditor(faq, index) {
    const pageOptions = [
      { id: "services",      label: "Hizmetler" },
      { id: "solutions",     label: "Çözümler" },
      { id: "contact",       label: "İletişim" },
      { id: "start-project", label: "Projeye Başla" }
    ];
    return `
      <details class="admin-card admin-editor-card" data-faq-index="${index}">
        <summary class="admin-card-top">
          <strong>${esc(faq.question || "Yeni Soru")}</strong>
          <button class="btn btn-danger btn-small" type="button" data-remove-faq="${index}">Kaldır</button>
        </summary>
        <div class="admin-form-grid">
          <label>Gösterileceği Sayfa
            <select data-field="page">${pageOptions.map((opt) => `<option value="${opt.id}"${faq.page === opt.id ? " selected" : ""}>${opt.label}</option>`).join("")}</select>
          </label>
          <label>Sıralama
            <input data-field="sortOrder" type="number" value="${esc(faq.sortOrder)}" />
          </label>
          <label class="span-2">Soru
            <input data-field="question" value="${esc(faq.question)}" />
          </label>
          <label class="span-2">Cevap
            <textarea data-field="answer" rows="3">${esc(faq.answer)}</textarea>
          </label>
        </div>
        ${translationEditor("faq", index, faq, [
          { key: "question", label: "Soru" },
          { key: "answer", label: "Cevap", type: "textarea" }
        ])}
      </details>
    `;
  }

  function renderProducts() {
    const root = qs("[data-admin-products]");
    if (!root) return;
    const products = state.content.products || [];

    if (state.editingProduct !== null && state.editingProduct !== undefined && products[state.editingProduct]) {
      // Single-product edit view
      root.innerHTML = productEditor(products[state.editingProduct], state.editingProduct);
    } else {
      // Grid view
      root.innerHTML = products.length
        ? `<div class="admin-product-grid">${products.map(productGridCard).join("")}</div>`
        : `<p style="color:var(--admin-muted);padding:24px;">Henüz ürün eklenmemiş.</p>`;
    }
  }

  function openProductEdit(index) {
    state.editingProduct = index;
    renderProducts();
    const root = qs("[data-admin-products]");
    if (root) root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeProductEdit() {
    state.editingProduct = null;
    renderProducts();
  }

  function renderFaqs() {
    const root = qs("[data-admin-faqs]");
    if (root) root.innerHTML = (state.content.faqs || []).map(faqEditor).join("");
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
    const root = document.getElementById("admin-client-grid");
    if (root) root.innerHTML = (state.content.clients || []).map(clientEditor).join("");
  }

  function getPageIcon(key) {
    const icons = {
      home: `<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
      contact: `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
      about: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
      services: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`
    };
    const defaultIcon = `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
    const lkey = key.toLowerCase();
    for (const [k, v] of Object.entries(icons)) {
      if (lkey.includes(k)) return v;
    }
    return defaultIcon;
  }

  function openPageEdit(key, targetTab = 'content') {
    state.editingPage = key;
    renderPageContent();
    const root = qs("[data-admin-page-content]");
    if (root) {
      root.scrollIntoView({ behavior: "smooth", block: "start" });
      if (targetTab !== 'content') {
        const tabBtn = root.querySelector(`[data-outer-tab-target="${targetTab}"]`);
        if (tabBtn) tabBtn.click();
      }
    }
  }

  function closePageEdit() {
    state.editingPage = null;
    renderPageContent();
  }

  function renderPageContent() {
    const root = qs("[data-admin-page-content]");
    if (!root) return;
    const pages = state.content.pageContent || {};
    const SUPPORTED_LOCALES = ["en", "tr", "de", "fr", "it", "es", "ar", "ja"];

    // Editor View
    if (state.editingPage) {
      const pageKey = state.editingPage;
      const page = pages[pageKey] || {};
      const seoData = (state.content.pageSeo || {})[pageKey] || {};
      const groups = { seo: [], media: [], content: [] };
      Object.keys(page).forEach(k => {
        const lk = k.toLowerCase();
        if (lk.includes("meta") || lk.includes("seo")) groups.seo.push(k);
        else if (lk.includes("alt") || lk.includes("image")) groups.media.push(k);
        else groups.content.push(k);
      });

      const renderFieldGroup = (title, keys, locale) => {
        if (!keys.length) return "";
        return `
            <div style="margin-bottom: 24px;">
              <h4 style="font-size: 0.9rem; color: var(--admin-ink); margin-bottom: 12px; padding-bottom: 4px; border-bottom: 1px solid var(--admin-border);">${esc(title)}</h4>
              <div class="admin-form-grid" style="grid-template-columns: 1fr;">
                ${keys.map(fieldKey => {
                  const englishVal = page[fieldKey]?.["en"] || "";
                  const transVal = page[fieldKey]?.[locale] || "";
                  const isRtl = locale === "ar";
                  return `
                    <div data-page-content="${esc(pageKey)}" data-page-field="${esc(fieldKey)}">
                      <div class="admin-translation-editor-row" style="margin: 0; padding: 0; border: none;">
                        <div class="admin-trans-input" style="flex: 1;">
                          <label style="color: var(--admin-muted);">Source (EN) &mdash; ${esc(fieldKey)}
                            <textarea data-page-locale="en" rows="3" style="background: #f8fafc; border-color: #cbd5e1; color: var(--admin-ink); resize: vertical;" readonly>${esc(englishVal)}</textarea>
                          </label>
                        </div>
                        <div class="admin-trans-input" style="flex: 1;">
                          <label style="color: var(--admin-ink); font-weight: 600;">${esc(localeNames[locale] || locale.toUpperCase())} Translation
                            <div class="admin-textarea-wrapper" style="margin-top: 8px;">
                              <div class="admin-textarea-toolbar" data-textarea-toolbar>
                                <button type="button" class="admin-textarea-btn" data-textarea-cmd="wrap" data-tag="strong" data-class="hw-display" title="Vurgulu Yazı (Display)"><strong style="font-family: 'Space Grotesk', sans-serif;">B</strong></button>
                                <button type="button" class="admin-textarea-btn" data-textarea-cmd="wrap" data-tag="em" data-class="hw-serif" title="İtalik Serif"><em style="font-family: 'Space Grotesk', sans-serif;">I</em></button>
                                <button type="button" class="admin-textarea-btn" data-textarea-cmd="insert" data-tag="br" title="Alt Satıra Geç">&lt;br&gt;</button>
                                <input type="color" class="admin-textarea-btn admin-color-picker" data-textarea-cmd="color" title="Renk Seç" style="padding: 0; width: 24px; height: 24px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer;">
                              </div>
                              <textarea data-page-locale="${esc(locale)}" rows="3" dir="${isRtl ? 'rtl' : 'ltr'}" style="resize: vertical;">${esc(transVal)}</textarea>
                              <div class="admin-textarea-preview" data-live-preview>${transVal || ""}</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `;
      };

      const activeLocale = state.editLocale || "tr";
      const activeSeo = seoData[activeLocale] || seoData["en"] || {};
      const seoScore = calcSEOScore(activeSeo, activeLocale, seoData);

      root.innerHTML = `
        <div class="admin-product-edit-view">
          <div class="admin-product-edit-top">
            <button class="btn btn-secondary btn-small" type="button" data-page-back>
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg> Sayfalara Dön
            </button>
            <h3 class="admin-product-edit-name" style="margin-left: 16px;">${esc(pageKey)} — Sayfa Yönetimi</h3>
            <div style="margin-left: auto; display:flex; gap: 8px; align-items: center;">
              <span class="admin-seo-score-badge admin-seo-score-${seoScore.level}" data-seo-score-badge>
                ${seoScore.level === 'good' ? '🟢' : seoScore.level === 'ok' ? '🟡' : '🔴'} SEO: ${seoScore.score}/100
              </span>
            </div>
          </div>

          <div class="admin-page-outer-tabs">
            <button class="admin-page-outer-tab active" data-outer-tab-target="content">📝 İçerik Çevirileri</button>
            <button class="admin-page-outer-tab" data-outer-tab-target="seo">🔍 SEO &amp; Meta</button>
            <button class="admin-page-outer-tab" data-outer-tab-target="social">📱 Sosyal Medya</button>
            <button class="admin-page-outer-tab" data-outer-tab-target="indexing">⚙️ İndexleme</button>
          </div>

          <!-- İçerik Sekmesi -->
          <div class="admin-page-outer-panel active" data-outer-panel-id="content">
            <div class="admin-card admin-translation-accordion" data-page-content="${esc(pageKey)}" style="padding: 0; overflow: hidden; border: 1px solid var(--admin-border); margin-bottom: 16px;">
              <div class="admin-trans-locale-tabs" style="border-bottom: 1px solid var(--admin-border); background: var(--admin-surface); padding: 12px 20px 0 20px; overflow-x: auto;">
                ${SUPPORTED_LOCALES.map((locale) => {
                  const filledCount = Object.values(page).filter(v => v[locale]?.trim()).length;
                  const totalCount = Object.keys(page).length;
                  const isActive = locale === activeLocale;
                  return `
                    <button type="button" class="admin-trans-locale-tab ${isActive ? 'active' : ''}" data-trans-tab-locale="${esc(locale)}">
                      ${esc(locale.toUpperCase())} <span class="admin-trans-count">${filledCount}/${totalCount}</span>
                    </button>
                  `;
                }).join("")}
              </div>
              <div style="padding: 24px; background: #fff;">
                ${SUPPORTED_LOCALES.map(locale => {
                  const isActive = locale === activeLocale;
                  return `
                    <div class="admin-trans-locale-panel ${isActive ? 'active' : ''}" data-trans-panel-locale="${esc(locale)}">
                       ${renderFieldGroup("İçerik", groups.content, locale)}
                       ${renderFieldGroup("Medya", groups.media, locale)}
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>

          <!-- SEO Sekmesi -->
          <div class="admin-page-outer-panel" data-outer-panel-id="seo">
            <div class="admin-seo-locale-bar">
              <span class="admin-seo-locale-label">Dil:</span>
              ${SUPPORTED_LOCALES.map(loc => {
                const locSeo = seoData[loc] || {};
                const locScore = calcSEOScore(locSeo, loc, seoData);
                const badge = locScore.level === 'good' ? '🟢' : locScore.level === 'ok' ? '🟡' : '🔴';
                return `<button type="button" class="admin-seo-locale-btn ${loc === activeLocale ? 'active' : ''}" data-seo-locale-switch="${esc(loc)}">${esc(localeNames[loc] || loc.toUpperCase())} ${badge}</button>`;
              }).join("")}
            </div>

            ${SUPPORTED_LOCALES.map(loc => {
              const locSeo = seoData[loc] || {};
              const locScore = calcSEOScore(locSeo, loc, seoData);
              const isRtl = loc === 'ar';
              const titleLen = (locSeo.seoTitle || '').length;
              const descLen = (locSeo.metaDescription || '').length;
              const titleColor = titleLen >= 50 && titleLen <= 60 ? '#10b981' : titleLen >= 40 && titleLen <= 70 ? '#f59e0b' : '#ef4444';
              const descColor = descLen >= 150 && descLen <= 160 ? '#10b981' : descLen >= 130 && descLen <= 175 ? '#f59e0b' : '#ef4444';

              return `
              <div class="admin-seo-locale-panel ${loc === activeLocale ? 'active' : ''}" data-seo-panel-locale="${esc(loc)}" dir="${isRtl ? 'rtl' : 'ltr'}">

                <!-- SERP Önizleme -->
                <div class="admin-serp-preview" data-serp-preview-${esc(loc)}>
                  <div class="admin-serp-label">🔍 Google Arama Sonucu Önizlemesi</div>
                  <div class="admin-serp-box">
                    <div class="admin-serp-url">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                      willowsoft.co › ${esc((locSeo.slug || '/').replace(/^\//, '') || 'en')}
                    </div>
                    <div class="admin-serp-title" data-serp-title-${esc(loc)}>${esc(locSeo.seoTitle || 'SEO Başlığı Belirlenmedi...')}</div>
                    <div class="admin-serp-desc" data-serp-desc-${esc(loc)}>${esc(locSeo.metaDescription || 'Meta açıklaması henüz girilmedi. Bu alan Google arama sonuçlarında görünür.')}</div>
                  </div>
                </div>

                <!-- SEO Skor Paneli -->
                <div class="admin-seo-score-panel">
                  <div class="admin-seo-score-header">
                    <span class="admin-seo-score-circle admin-seo-score-circle-${locScore.level}">${locScore.score}</span>
                    <div>
                      <div class="admin-seo-score-title">${locScore.level === 'good' ? 'SEO İyi Durumda' : locScore.level === 'ok' ? 'İyileştirilebilir' : 'Dikkat Gerekiyor'}</div>
                      <div class="admin-seo-score-sub">${locScore.checks.filter(c => c.ok).length}/${locScore.checks.length} kontrol geçildi</div>
                    </div>
                  </div>
                  <div class="admin-seo-checklist">
                    ${locScore.checks.map(c => `
                      <div class="admin-seo-check-item">
                        <span class="admin-seo-check-dot" style="background: ${c.ok ? '#10b981' : c.warn ? '#f59e0b' : '#ef4444'}"></span>
                        <span>${c.label}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Form Alanları -->
                <div class="admin-seo-fields">
                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">
                      🎯 Odak Anahtar Kelime
                      <span class="admin-seo-field-hint">Bu sayfanın ana konusu nedir? Google'da hangi kelimede üst sırada çıkmak istiyorsunuz?</span>
                    </label>
                    <input class="admin-seo-input" type="text" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="focusKeyword" value="${esc(locSeo.focusKeyword || '')}" placeholder="örn: embedded IoT engineering" />
                  </div>

                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">
                      📌 SEO Başlığı (Title Tag)
                      <span class="admin-seo-field-hint">Tarayıcı sekmesinde ve Google'da görünen başlık. İdeal: 50-60 karakter.</span>
                    </label>
                    <div class="admin-seo-input-wrap">
                      <input class="admin-seo-input" type="text" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="seoTitle" value="${esc(locSeo.seoTitle || '')}" placeholder="Sayfa Başlığı | WillowSoft" maxlength="70" data-serp-target="title" />
                      <span class="admin-seo-char-count" style="color: ${titleColor}" data-char-count="seoTitle-${esc(loc)}">${titleLen}/60</span>
                    </div>
                    <div class="admin-seo-char-bar"><div class="admin-seo-char-fill" style="width: ${Math.min(100, (titleLen/60)*100)}%; background: ${titleColor}"></div></div>
                    <span class="admin-seo-range-hint">50–60 karakter ideal • ${titleLen < 50 ? (50 - titleLen) + ' karakter daha ekle' : titleLen > 60 ? (titleLen - 60) + ' karakter fazla' : '✓ Mükemmel'}</span>
                  </div>

                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">
                      📝 Meta Açıklama
                      <span class="admin-seo-field-hint">Google arama sonucunda başlığın altında görünür. İdeal: 150-160 karakter.</span>
                    </label>
                    <div class="admin-seo-input-wrap">
                      <textarea class="admin-seo-input" rows="3" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="metaDescription" placeholder="Bu sayfa hakkında kısa ve ilgi çekici bir açıklama yazın..." maxlength="175" data-serp-target="desc">${esc(locSeo.metaDescription || '')}</textarea>
                      <span class="admin-seo-char-count" style="color: ${descColor}" data-char-count="metaDescription-${esc(loc)}">${descLen}/160</span>
                    </div>
                    <div class="admin-seo-char-bar"><div class="admin-seo-char-fill" style="width: ${Math.min(100, (descLen/160)*100)}%; background: ${descColor}"></div></div>
                    <span class="admin-seo-range-hint">150–160 karakter ideal • ${descLen < 150 ? (150 - descLen) + ' karakter daha ekle' : descLen > 160 ? (descLen - 160) + ' karakter fazla' : '✓ Mükemmel'}</span>
                  </div>

                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">
                      🔗 Sayfa URL'i (Slug)
                      <span class="admin-seo-field-hint">Bu sayfanın adresi. Örn: /en veya /tr/urunler</span>
                    </label>
                    <input class="admin-seo-input" type="text" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="slug" value="${esc(locSeo.slug || '')}" placeholder="/en" />
                  </div>

                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">
                      🌐 Canonical URL
                      <span class="admin-seo-field-hint">Bu sayfanın tek doğru adresi. Genelde https://willowsoft.co${locSeo.slug || ''}</span>
                    </label>
                    <input class="admin-seo-input" type="url" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="canonical" value="${esc(locSeo.canonical || '')}" placeholder="https://willowsoft.co/en" />
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>

          <!-- Sosyal Medya Sekmesi -->
          <div class="admin-page-outer-panel" data-outer-panel-id="social">
            <div class="admin-seo-locale-bar">
              <span class="admin-seo-locale-label">Dil:</span>
              ${SUPPORTED_LOCALES.map(loc => `<button type="button" class="admin-seo-locale-btn ${loc === activeLocale ? 'active' : ''}" data-seo-locale-switch="${esc(loc)}">${esc(localeNames[loc] || loc.toUpperCase())}</button>`).join("")}
            </div>

            ${SUPPORTED_LOCALES.map(loc => {
              const locSeo = seoData[loc] || {};
              return `
              <div class="admin-seo-locale-panel ${loc === activeLocale ? 'active' : ''}" data-seo-panel-locale="${esc(loc)}">
                <!-- LinkedIn/OG Önizleme -->
                <div class="admin-og-preview-wrap">
                  <div class="admin-og-preview-label">LinkedIn / Open Graph Kart Önizlemesi</div>
                  <div class="admin-og-card">
                    <div class="admin-og-image" style="${locSeo.ogImage ? 'background-image: url(' + esc(locSeo.ogImage) + ')' : ''}">
                      ${!locSeo.ogImage ? '<span class="admin-og-no-image">📷 OG Görseli Yok</span>' : ''}
                    </div>
                    <div class="admin-og-body">
                      <div class="admin-og-domain">willowsoft.co</div>
                      <div class="admin-og-title">${esc(locSeo.ogTitle || locSeo.seoTitle || 'Başlık belirlenmedi')}</div>
                      <div class="admin-og-desc">${esc(locSeo.ogDescription || locSeo.metaDescription || 'Açıklama belirlenmedi')}</div>
                    </div>
                  </div>
                </div>

                <div class="admin-seo-fields">
                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">📌 OG Başlık <span class="admin-seo-field-hint">Sosyal medyada paylaşılınca görünen başlık. Boş bırakırsanız SEO başlığı kullanılır.</span></label>
                    <input class="admin-seo-input" type="text" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="ogTitle" value="${esc(locSeo.ogTitle || '')}" placeholder="SEO başlığı ile aynı bırakabilirsiniz" />
                  </div>
                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">📝 OG Açıklama <span class="admin-seo-field-hint">Sosyal medyada paylaşılınca başlığın altında görünen açıklama.</span></label>
                    <textarea class="admin-seo-input" rows="2" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="ogDescription" placeholder="Meta açıklama ile aynı bırakabilirsiniz">${esc(locSeo.ogDescription || '')}</textarea>
                  </div>
                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">🖼️ OG Görsel URL'i <span class="admin-seo-field-hint">1200×630 piksel önerilir. LinkedIn, Facebook, WhatsApp'ta gösterilir.</span></label>
                    <input class="admin-seo-input" type="url" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="ogImage" value="${esc(locSeo.ogImage || '')}" placeholder="https://willowsoft.co/assets/og-image.png" />
                  </div>
                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">🐦 Twitter Kart Türü <span class="admin-seo-field-hint">summary_large_image: Büyük resimli kart (önerilen). summary: Küçük kart.</span></label>
                    <select class="admin-seo-input" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="twitterCard">
                      <option value="summary_large_image" ${locSeo.twitterCard !== 'summary' ? 'selected' : ''}>Büyük Görsel Kart (summary_large_image)</option>
                      <option value="summary" ${locSeo.twitterCard === 'summary' ? 'selected' : ''}>Küçük Kart (summary)</option>
                    </select>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>

          <!-- İndexleme Sekmesi -->
          <div class="admin-page-outer-panel" data-outer-panel-id="indexing">
            <div class="admin-seo-locale-bar">
              <span class="admin-seo-locale-label">Dil:</span>
              ${SUPPORTED_LOCALES.map(loc => `<button type="button" class="admin-seo-locale-btn ${loc === activeLocale ? 'active' : ''}" data-seo-locale-switch="${esc(loc)}">${esc(localeNames[loc] || loc.toUpperCase())}</button>`).join("")}
            </div>

            ${SUPPORTED_LOCALES.map(loc => {
              const locSeo = seoData[loc] || {};
              return `
              <div class="admin-seo-locale-panel ${loc === activeLocale ? 'active' : ''}" data-seo-panel-locale="${esc(loc)}">
                <div class="admin-seo-fields">
                  <div class="admin-seo-indexing-toggles">
                    <div class="admin-seo-toggle-card ${locSeo.noindex ? 'danger' : 'safe'}">
                      <div class="admin-seo-toggle-info">
                        <strong>Arama Motorlarında Gösterilmesin (noindex)</strong>
                        <span>Açık ise bu sayfa Google'da listelenMEZ. Normalde kapalı olmalı.</span>
                      </div>
                      <label class="admin-seo-switch">
                        <input type="checkbox" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="noindex" ${locSeo.noindex ? 'checked' : ''} />
                        <span class="admin-seo-switch-slider"></span>
                      </label>
                    </div>
                    <div class="admin-seo-toggle-card ${locSeo.nofollow ? 'warn' : 'safe'}">
                      <div class="admin-seo-toggle-info">
                        <strong>Linkleri Takip Etme (nofollow)</strong>
                        <span>Açık ise sayfadaki linklerin SEO değeri aktarılmaz.</span>
                      </div>
                      <label class="admin-seo-switch">
                        <input type="checkbox" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="nofollow" ${locSeo.nofollow ? 'checked' : ''} />
                        <span class="admin-seo-switch-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">📊 Sitemap Önceliği <span class="admin-seo-field-hint">0.1 (düşük) – 1.0 (çok önemli). Ana sayfa genelde 1.0</span></label>
                    <select class="admin-seo-input" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="priority">
                      ${['1.0','0.9','0.8','0.7','0.6','0.5','0.4','0.3','0.2','0.1'].map(v => `<option value="${v}" ${(locSeo.priority || '0.5') === v ? 'selected' : ''}>${v}</option>`).join('')}
                    </select>
                  </div>

                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">🔄 Güncelleme Sıklığı <span class="admin-seo-field-hint">Google'a bu sayfanın ne sıklıkla güncellendiğini söyler.</span></label>
                    <select class="admin-seo-input" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="changefreq">
                      ${['always','hourly','daily','weekly','monthly','yearly','never'].map(v => `<option value="${v}" ${(locSeo.changefreq || 'weekly') === v ? 'selected' : ''}>${v}</option>`).join('')}
                    </select>
                  </div>

                  <div class="admin-seo-field-group">
                    <label class="admin-seo-field-label">🏗️ Sayfa Schema Türü <span class="admin-seo-field-hint">Google'ın sayfanızı doğru kategoriye koyması için. Zengin sonuçlar için önemli.</span></label>
                    <select class="admin-seo-input" data-seo-page="${esc(pageKey)}" data-seo-locale="${esc(loc)}" data-seo-field="schemaType">
                      ${['WebPage','AboutPage','ContactPage','CollectionPage','Blog','Article','FAQPage','ProductPage','ServicePage'].map(v => `<option value="${v}" ${(locSeo.schemaType || 'WebPage') === v ? 'selected' : ''}>${v}</option>`).join('')}
                    </select>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      `;
      return;
    }


    // Grid View
    const gridHtml = `
      <div class="admin-page-grid">
        ${Object.entries(pages).map(([pageKey, page]) => {
          const totalFields = Object.keys(page).length;
          
          const progressHtml = SUPPORTED_LOCALES.filter(l => l !== "en").map(loc => {
            const filled = Object.values(page).filter(v => v[loc]?.trim()).length;
            const pct = Math.round((filled / totalFields) * 100) || 0;
            const color = pct === 100 ? "#10b981" : pct > 0 ? "#f59e0b" : "#ef4444";
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span style="text-transform: uppercase; font-weight: 600; color: var(--admin-muted);">${loc}</span>
                <span style="color: ${color}; font-weight: 600;">%${pct}</span>
              </div>
            `;
          }).join("");

          return `
            <div class="admin-page-grid-card" data-page-grid-card="${esc(pageKey)}" style="align-items: stretch; text-align: left; justify-content: flex-start;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div class="admin-page-grid-icon">${getPageIcon(pageKey)}</div>
                <div>
                  <div class="admin-page-grid-title">${esc(pageKey)}</div>
                  <div class="admin-page-grid-meta">${totalFields} Fields</div>
                </div>
              </div>
              <div style="border-top: 1px solid var(--admin-border); padding-top: 12px;">
                <div style="font-size: 0.75rem; color: var(--admin-ink); font-weight: 600; margin-bottom: 8px;">Translation Progress</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px;">
                  ${progressHtml}
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
    root.innerHTML = gridHtml;
  }
  // ===== SEO SCORE ENGINE =====
  function calcSEOScore(seoData, locale, allLocalesData) {
    const checks = [];
    const title = (seoData.seoTitle || '').trim();
    const desc = (seoData.metaDescription || '').trim();
    const keyword = (seoData.focusKeyword || '').trim().toLowerCase();
    const slug = (seoData.slug || '').trim();
    const ogImage = (seoData.ogImage || '').trim();

    // Title
    if (title.length === 0) checks.push({ label: 'SEO başlığı eksik', ok: false, warn: false });
    else if (title.length >= 50 && title.length <= 60) checks.push({ label: `SEO başlığı ideal uzunlukta (${title.length} karakter)`, ok: true });
    else if (title.length >= 40 && title.length <= 70) checks.push({ label: `SEO başlığı biraz ${title.length < 50 ? 'kısa' : 'uzun'} (${title.length} karakter, ideal 50-60)`, ok: false, warn: true });
    else checks.push({ label: `SEO başlığı çok ${title.length < 40 ? 'kısa' : 'uzun'} (${title.length} karakter, ideal 50-60)`, ok: false, warn: false });

    // Meta desc
    if (desc.length === 0) checks.push({ label: 'Meta açıklama eksik', ok: false, warn: false });
    else if (desc.length >= 150 && desc.length <= 160) checks.push({ label: `Meta açıklama ideal uzunlukta (${desc.length} karakter)`, ok: true });
    else if (desc.length >= 130 && desc.length <= 175) checks.push({ label: `Meta açıklama biraz ${desc.length < 150 ? 'kısa' : 'uzun'} (${desc.length} karakter, ideal 150-160)`, ok: false, warn: true });
    else checks.push({ label: `Meta açıklama çok ${desc.length < 130 ? 'kısa' : 'uzun'} (${desc.length} karakter, ideal 150-160)`, ok: false, warn: false });

    // Keyword in title
    if (keyword) {
      if (title.toLowerCase().includes(keyword)) checks.push({ label: 'Anahtar kelime başlıkta geçiyor ✓', ok: true });
      else checks.push({ label: 'Anahtar kelime başlıkta geçmiyor', ok: false, warn: true });
      if (desc.toLowerCase().includes(keyword)) checks.push({ label: 'Anahtar kelime açıklamada geçiyor ✓', ok: true });
      else checks.push({ label: 'Anahtar kelime açıklamada geçmiyor', ok: false, warn: true });
    } else {
      checks.push({ label: 'Odak anahtar kelime belirlenmemiş', ok: false, warn: false });
    }

    // Slug
    if (!slug) checks.push({ label: 'URL slug eksik', ok: false, warn: false });
    else if (slug.length > 75) checks.push({ label: 'URL çok uzun (75 karakterden kısa tutun)', ok: false, warn: true });
    else checks.push({ label: 'URL slug mevcut ✓', ok: true });

    // OG Image
    if (!ogImage) checks.push({ label: 'OG Görseli ayarlanmamış (sosyal paylaşım için önemli)', ok: false, warn: true });
    else checks.push({ label: 'OG Görseli ayarlı ✓', ok: true });

    // All locales filled
    if (allLocalesData) {
      const filledLocales = Object.keys(allLocalesData).filter(l => (allLocalesData[l].seoTitle || '').trim());
      if (filledLocales.length === 8) checks.push({ label: 'Tüm 8 dilde SEO başlığı dolu ✓', ok: true });
      else checks.push({ label: `SEO başlığı sadece ${filledLocales.length}/8 dilde dolu`, ok: false, warn: filledLocales.length >= 4 });
    }

    const passed = checks.filter(c => c.ok).length;
    const total = checks.length;
    const score = Math.round((passed / total) * 100);
    const level = score >= 80 ? 'good' : score >= 50 ? 'ok' : 'bad';
    return { score, level, checks };
  }

  // ===== SEO CENTER DASHBOARD =====
  function renderSEOCenter() {
    const root = qs('[data-admin-seo-center]');
    if (!root || !state.content) return;
    const pageSeo = state.content.pageSeo || {};
    const pageLabels = { home: 'Ana Sayfa', products: 'Ürün Kataloğu', news: 'Haberler', services: 'Hizmetler', solutions: 'Çözümler', company: 'Şirket', contact: 'İletişim', startProject: 'Projeye Başla' };
    const LOCALES = ['en','tr','de','fr','it','es','ar','ja'];
    const locale = state.editLocale || "tr";
    const locName = localeNames[locale] || locale.toUpperCase();

    const totalPages = Object.keys(pageSeo).length;
    const totalLocales = totalPages * LOCALES.length;
    const filledCount = Object.values(pageSeo).reduce((sum, page) => sum + Object.values(page).filter(loc => loc.seoTitle && loc.metaDescription).length, 0);
    const healthPct = totalLocales > 0 ? Math.round((filledCount / totalLocales) * 100) : 0;
    const totalIssues = totalLocales - filledCount;

    root.innerHTML = `
      <div class="admin-card-top" style="margin-bottom: 24px;">
        <div>
          <h2>Toplu SEO Yönetimi (Bulk Editor)</h2>
          <p style="color: var(--admin-muted); margin-top: 4px;">Şu anki dil: <strong>${esc(locName)}</strong>. Diğer dilleri düzenlemek için üst barda dili değiştirin.</p>
        </div>
      </div>

      <!-- Özet Kartlar -->
      <div class="admin-seo-summary-row">
        <div class="admin-seo-summary-card">
          <div class="admin-seo-summary-num" style="color: ${healthPct >= 80 ? '#10b981' : healthPct >= 50 ? '#f59e0b' : '#ef4444'}">${healthPct}%</div>
          <div class="admin-seo-summary-label">SEO Sağlık Skoru</div>
        </div>
        <div class="admin-seo-summary-card">
          <div class="admin-seo-summary-num">${filledCount} / ${totalLocales}</div>
          <div class="admin-seo-summary-label">Tamamlanan (Tüm Diller)</div>
        </div>
        <div class="admin-seo-summary-card">
          <div class="admin-seo-summary-num" style="color: ${totalIssues > 0 ? '#ef4444' : '#10b981'}">${totalIssues}</div>
          <div class="admin-seo-summary-label">Eksik Alan (Tüm Diller)</div>
        </div>
        <div class="admin-seo-summary-card">
          <div class="admin-seo-summary-num">${totalPages}</div>
          <div class="admin-seo-summary-label">İndekslenen Sayfa</div>
        </div>
      </div>

      <!-- Bulk Editor List -->
      <div class="admin-seo-bulk-list">
        ${Object.entries(pageSeo).map(([pgKey, pgData]) => {
          const locData = pgData[locale] || {};
          const isComplete = locData.seoTitle && locData.metaDescription;
          const statusColor = isComplete ? '#10b981' : '#f59e0b';
          const statusText = isComplete ? 'Tamamlandı' : 'Eksik Veri';
          
          return `
            <details class="admin-seo-bulk-row">
              <summary class="admin-seo-bulk-header">
                <div class="admin-seo-bulk-title">
                  <span style="font-size: 1.25rem;">📄</span>
                  ${esc(pageLabels[pgKey] || pgKey)}
                  <span style="font-size: 0.85rem; color: var(--admin-muted); font-weight: 400; font-family: monospace;">/${esc(pgKey)}</span>
                </div>
                <div class="admin-seo-bulk-badges">
                  <div class="admin-seo-bulk-badge" style="background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}44;">
                    ${statusText}
                  </div>
                </div>
              </summary>
              <div class="admin-seo-bulk-body">
                <div class="admin-seo-bulk-editor-grid">
                  <div class="admin-seo-bulk-fields">
                    <label>
                      <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--admin-ink);">SEO Başlığı (Title)</strong>
                      <input type="text" class="admin-input admin-seo-input" 
                        data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="seoTitle" 
                        value="${esc(locData.seoTitle || '')}" placeholder="Google'da görünecek başlık" />
                      <div style="font-size: 0.75rem; text-align: right; margin-top: 4px; color: var(--admin-muted);" data-char-count="seoTitle-${esc(locale)}-${esc(pgKey)}">
                        ${(locData.seoTitle || '').length}/60
                      </div>
                    </label>
                    <label>
                      <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--admin-ink);">Meta Açıklama (Description)</strong>
                      <textarea class="admin-textarea admin-seo-input" rows="3"
                        data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="metaDescription" 
                        placeholder="Sayfa hakkında özet bilgi...">${esc(locData.metaDescription || '')}</textarea>
                      <div style="font-size: 0.75rem; text-align: right; margin-top: 4px; color: var(--admin-muted);" data-char-count="metaDescription-${esc(locale)}-${esc(pgKey)}">
                        ${(locData.metaDescription || '').length}/160
                      </div>
                    </label>
                    <label>
                      <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--admin-ink);">Odak Anahtar Kelime (Focus Keyword)</strong>
                      <input type="text" class="admin-input admin-seo-input" 
                        data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="focusKeyword" 
                        value="${esc(locData.focusKeyword || '')}" placeholder="Örn: endüstriyel sensör" />
                    </label>
                  </div>
                  <div class="admin-seo-bulk-preview">
                    <strong style="display: block; margin-bottom: 12px; font-size: 0.85rem; color: var(--admin-ink);">SERP Önizlemesi (Google)</strong>
                    <div style="font-family: Arial, sans-serif; max-width: 600px;">
                      <div style="color: #202124; font-size: 14px; margin-bottom: 2px;">willowbee.com › ${esc(locale)} › ${esc(pgKey)}</div>
                      <div style="color: #1a0dab; font-size: 20px; text-decoration: none; margin-bottom: 3px; line-height: 1.3;" data-serp-title="${esc(locale)}-${esc(pgKey)}">
                        ${esc(locData.seoTitle || 'SEO Başlığı Belirlenmedi...')}
                      </div>
                      <div style="color: #4d5156; font-size: 14px; line-height: 1.58;" data-serp-desc="${esc(locale)}-${esc(pgKey)}">
                        ${esc(locData.metaDescription || 'Meta açıklaması henüz girilmedi.')}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="admin-seo-bulk-actions">
                  <button type="button" class="btn btn-secondary btn-small" data-goto-page-seo="${esc(pgKey)}">
                    İçerik Düzenleyiciyi Aç
                  </button>
                </div>
              </div>
            </details>
          `;
        }).join('')}
      </div>
    `;
  }


  function renderSettings() {
    const root = qs("[data-admin-settings]");
    if (!root) return;
    const facts = state.content.companyFacts || {};
    const translationKeys = Array.from(new Set(Object.values(state.content.translations || {}).flatMap((messages) => Object.keys(messages || {})))).sort();
    const locale = state.editLocale || "tr";
    const editLangName = localeNames[locale] || locale.toUpperCase();

    root.innerHTML = `
      <article class="admin-card">
        <div class="admin-card-top"><strong>Şirket Hakkında Bilgiler & İstatistikler</strong></div>
        <div class="admin-form-grid" data-company-facts-editor>
          <label>Kuruluş Yılı<input data-field="founded" value="${esc(facts.founded)}" /></label>
          <label>Aktif Müşteriler<input data-field="customers" value="${esc(facts.customers)}" /></label>
          <label>Mutlu Müşteriler<input data-field="happyClients" value="${esc(facts.happyClients)}" /></label>
          <label>Piyasadaki Ürünler<input data-field="productsOnMarket" value="${esc(facts.productsOnMarket)}" /></label>
          <label>Tamamlanan Projeler<input data-field="projects" value="${esc(facts.projects)}" /></label>
          <label>Aktif Ülkeler<input data-field="countries" value="${esc(facts.countries)}" /></label>
          <label>Dünya Ofis Sayısı<input data-field="officesWorldwide" value="${esc(facts.officesWorldwide)}" /></label>
          <label>E-posta Adresi<input data-field="email" value="${esc(facts.email)}" /></label>
          <label>Türkiye Telefon<input data-field="turkeyPhone" value="${esc(facts.turkeyPhone)}" /></label>
          <label>İhracat Oranı<input data-field="exports" value="${esc(facts.exports)}" /></label>
          <label class="span-2">Türkiye Ofis Adresi<textarea data-field="turkeyOfficeAddress">${esc(facts.turkeyOfficeAddress)}</textarea></label>
          <label class="span-2">İngiltere Ofis Adresi<textarea data-field="ukOfficeAddress">${esc(facts.ukOfficeAddress)}</textarea></label>
          <label class="span-2">Açılış Notu<textarea data-field="note">${esc(facts.note)}</textarea></label>
        </div>
      </article>
      <article class="admin-card">
        <div class="admin-card-top"><strong>Aktif Diller</strong></div>
        <p>${esc((state.content.meta?.locales || []).join(", "))}</p>
        <p class="admin-note" style="color: var(--admin-muted); border-top: none; padding-top: 0;">Desteklenen 8 dil rotası aktiftir: /en, /tr, /de, /fr, /es, /it, /ar, /ja. Sayfa metinlerini, ürün kataloglarını ve sistem yazılarını diğer dillerde de doldurmayı unutmayın.</p>
      </article>
      <article class="admin-card">
        <div class="admin-card-top"><strong>Sistem Arayüz Etiketleri</strong><span>Butonlar, Navigasyon ve CTA başlıkları</span></div>
        <div class="admin-page-copy-grid" data-ui-translations-editor>
          ${translationKeys.map((key) => {
            const englishVal = state.content.translations?.["en"]?.[key] || "";
            const transVal = state.content.translations?.[locale]?.[key] || "";
            return `
              <div class="admin-copy-field" data-ui-key="${esc(key)}">
                <div class="admin-card-top" style="border-bottom: none; margin-bottom: 10px; padding-bottom: 0;">
                  <strong>Etiket: ${esc(key)}</strong>
                </div>
                <div class="admin-translation-editor-row" style="margin-top: 0; padding-top: 0; border-top: none;">
                  <div class="admin-trans-input">
                    <label>İngilizce Orijinal
                      <input data-ui-locale="en" value="${esc(englishVal)}" />
                    </label>
                  </div>
                  <div class="admin-trans-input">
                    <label>${esc(editLangName)} Çevirisi
                      <input data-ui-locale="${esc(locale)}" value="${esc(transVal)}" />
                    </label>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </article>
    `;
  }

  function renderLeads() {
    const root = qs("[data-admin-leads]");
    if (!root) return;
    if (!state.leads.length) {
      root.innerHTML = `<article class="admin-card"><p>Henüz gelen mesaj yok.</p></article>`;
      return;
    }

    root.innerHTML = `<div class="admin-leads-list">` + state.leads.map((lead) => {
      const statusClass = `status-${lead.status || 'new'}`;
      return `
        <article class="admin-lead-card" data-lead-id="${esc(lead.id)}">
          <div class="admin-lead-card-header">
            <div class="admin-lead-title-row">
              <strong>${esc(lead.name || "İsimsiz Talep")}</strong>
              <span class="admin-lead-badge ${statusClass}">${esc(lead.status || "new")}</span>
            </div>
            <span class="admin-lead-time">${esc(new Date(lead.createdAt).toLocaleString())}</span>
          </div>
          <div class="admin-lead-info">
            <span><strong>E-posta:</strong> ${esc(lead.email)}</span>
            <span><strong>Firma:</strong> ${esc(lead.company || "N/A")}</span>
            <span><strong>İlgi Alanı:</strong> ${esc(lead.interestType || lead.projectType || "Genel Sorular")}</span>
          </div>
          <div class="admin-lead-message">${esc(lead.message || "(Mesaj boş)")}</div>
          <div class="admin-form-grid" style="margin-top: 10px;">
            <label>Durum Güncelle
              <select data-lead-status>
                ${["new", "reviewed", "contacted", "qualified", "proposal_sent", "won", "lost", "spam"].map((status) => `<option value="${status}"${lead.status === status ? " selected" : ""}>${status}</option>`).join("")}
              </select>
            </label>
            <label class="span-2">Dahili Yönetici Notu
              <textarea data-lead-note rows="2" style="min-height: 50px;">${esc(lead.internalNote || "")}</textarea>
            </label>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <button class="btn btn-primary btn-small" type="button" data-update-lead="${esc(lead.id)}">Güncelle</button>
          </div>
        </article>
      `;
    }).join("") + `</div>`;
  }

  async function loadAnalytics() {
    try {
      const response = await fetch("/api/events", { cache: "no-store" });
      if (response.status === 401) {
        showLogin("Giriş yapınız.");
        state.analytics = null;
      } else {
        state.analytics = response.ok ? await response.json() : null;
      }
    } catch {
      state.analytics = null;
    }
    renderAnalytics();
    renderTranslationHealth();
    renderOverview();
  }

  function formatDuration(ms) {
    if (!ms) return "0sn";
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}sn`;
    return `${Math.floor(seconds / 60)}dk ${seconds % 60}sn`;
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
      root.innerHTML = `<article class="admin-card"><p>Henüz veri toplanmadı. Sitede gezinerek veri üretilmesini sağlayabilirsiniz.</p></article>`;
      return;
    }

    const typeItems = Object.entries(summary.byType || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => ({ label, count }));
    const latest = summary.latest || [];

    const maxCount = Math.max(...(summary.topPages || []).map(p => p.count), 1);
    const chartBars = (summary.topPages || []).map(p => {
      const percentage = Math.round((p.count / maxCount) * 100);
      return `
        <div class="admin-chart-bar" style="height: ${percentage}%" data-tooltip="${esc(p.path)}: ${p.count} gösterim"></div>
      `;
    }).join("");

    const eventsList = state.analytics?.events || [];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().slice(0, 10);
      last7Days.push({ date: dateString, label: d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' }), count: 0 });
    }
    
    eventsList.forEach(event => {
      if (!event.createdAt) return;
      const dateString = event.createdAt.slice(0, 10);
      const match = last7Days.find(day => day.date === dateString);
      if (match) {
        match.count++;
      }
    });
    
    const maxDayCount = Math.max(...last7Days.map(d => d.count), 5);
    const width = 600;
    const height = 150;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = last7Days.map((day, idx) => {
      const x = padding + (idx / (last7Days.length - 1)) * chartWidth;
      const y = padding + chartHeight - (day.count / maxDayCount) * chartHeight;
      return { x, y, label: day.label, count: day.count };
    });
    
    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");
    const areaPoints = `${points[0].x},${height - padding} ${polylinePoints} ${points[points.length - 1].x},${height - padding}`;

    root.innerHTML = `
      <div class="admin-grid">
        <article class="admin-stat"><strong>${esc(summary.totalEvents)}</strong><span>Toplam Olay</span></article>
        <article class="admin-stat"><strong>${esc(summary.uniqueVisitors)}</strong><span>Tekil Ziyaretçi</span></article>
        <article class="admin-stat"><strong>${esc(formatDuration(summary.averageDurationMs))}</strong><span>Ort. Oturum Süresi</span></article>
        <article class="admin-stat"><strong>${esc((summary.topCountries || []).length || 0)}</strong><span>Farklı Ülke</span></article>
      </div>
      
      <div class="admin-analytics-grid">
        <article class="admin-card">
          <h3>En Popüler Sayfalar</h3>
          <div class="admin-chart-box">
            ${chartBars || '<p style="margin: auto; color: var(--admin-muted);">Henüz veri yok.</p>'}
          </div>
        </article>
        
        <article class="admin-card" style="grid-column: span 2;">
          <h3>7 Günlük Ziyaretçi Trafiği</h3>
          <div style="margin-top: 10px; position: relative;">
            <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block; overflow: visible;">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#1aa3c4" stop-opacity="0.3"></stop>
                  <stop offset="100%" stop-color="#132175" stop-opacity="0.0"></stop>
                </linearGradient>
              </defs>
              
              ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
                const y = padding + pct * chartHeight;
                const val = Math.round(maxDayCount * (1 - pct));
                return `
                  <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--admin-border)" stroke-width="1" stroke-dasharray="4 4"></line>
                  <text x="${padding - 5}" y="${y + 4}" fill="var(--admin-muted)" font-size="8" font-family="Space Grotesk" text-anchor="end">${val}</text>
                `;
              }).join("")}
              
              <polygon points="${areaPoints}" fill="url(#chartGrad)"></polygon>
              <polyline points="${polylinePoints}" fill="none" stroke="#132175" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(19,33,117,0.15))"></polyline>
              
              ${points.map(p => `
                <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#ffffff" stroke="#1aa3c4" stroke-width="2.5" style="cursor: pointer;"></circle>
                <text x="${p.x}" y="${height - 2}" fill="var(--admin-muted)" font-size="8" font-family="Space Grotesk" text-anchor="middle">${esc(p.label)}</text>
              `).join("")}
            </svg>
          </div>
        </article>
      </div>

      <div class="admin-analytics-grid" style="margin-top: 16px;">
        ${renderEventBreakdown("Ziyaretçi Ülkeleri", summary.topCountries, "Ülke tespiti için sunucunun canlı ortamda olması gerekir.")}
        ${renderEventBreakdown("Olay Türleri", typeItems, "Henüz log toplanmadı.")}
      </div>

      <article class="admin-card" style="margin-top: 16px;">
        <h3>Güncel Ziyaretçi Log Kaydı</h3>
        <div class="admin-event-table">
          <div class="admin-event-table-header">
            <span>Zaman</span>
            <span>İşlem Türü</span>
            <span>Sayfa Yolu</span>
            <span>Sinyal/Dil</span>
          </div>
          ${latest.map((event) => `
            <div class="admin-event-table-row">
              <span>${esc(new Date(event.createdAt).toLocaleString())}</span>
              <strong>${esc(event.eventType)}</strong>
              <span>${esc(event.path || "/")}</span>
              <span>${esc(event.country || event.timezone || event.language || "-")}</span>
            </div>
          `).join("") || "<p style='padding: 20px;'>Kayıt bulunamadı.</p>"}
        </div>
      </article>
    `;
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

  async function moveLead(id, newStatus) {
    await fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
    await loadLeads();
  }

  function renderLeadsKanban() {
    const root = qs("[data-admin-leads-kanban]");
    if (!root) return;

    if (!state.leads.length) {
      root.innerHTML = `<article class="admin-card"><p>Henüz gelen talep yok.</p></article>`;
      return;
    }

    const columnsHtml = PIPELINE_COLUMNS.map(col => {
      const colLeads = state.leads.filter(l => col.statuses.includes(l.status || "new"));
      
      return `
        <div class="admin-kanban-column" data-kanban-column="${col.id}">
          <div class="admin-kanban-column-header">
            <h4>${esc(col.label)}</h4>
            <span class="count">${colLeads.length}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; max-height: 500px;">
            ${colLeads.map(l => {
              let actionButtons = "";
              if (col.id === "new") {
                actionButtons = `<button class="btn btn-secondary btn-small" style="font-size: 0.7rem; padding: 2px 6px; min-height: 22px;" type="button" data-move-lead-id="${esc(l.id)}" data-move-to="contacted">Görüşülüyor →</button>`;
              } else if (col.id === "contacted") {
                actionButtons = `
                  <button class="btn btn-secondary btn-small" style="font-size: 0.7rem; padding: 2px 6px; min-height: 22px;" type="button" data-move-lead-id="${esc(l.id)}" data-move-to="new">← Geri Al</button>
                  <button class="btn btn-primary btn-small" style="font-size: 0.7rem; padding: 2px 6px; min-height: 22px;" type="button" data-move-lead-id="${esc(l.id)}" data-move-to="qualified">Aşama Atlat →</button>
                `;
              } else if (col.id === "qualified") {
                actionButtons = `
                  <button class="btn btn-secondary btn-small" style="font-size: 0.7rem; padding: 2px 6px; min-height: 22px;" type="button" data-move-lead-id="${esc(l.id)}" data-move-to="contacted">← Geri Al</button>
                  <button class="btn btn-primary btn-small" style="font-size: 0.7rem; padding: 2px 6px; min-height: 22px; background: var(--admin-success); border-color: var(--admin-success);" type="button" data-move-lead-id="${esc(l.id)}" data-move-to="won">Kazanıldı ✓</button>
                  <button class="btn btn-danger btn-small" style="font-size: 0.7rem; padding: 2px 6px; min-height: 22px;" type="button" data-move-lead-id="${esc(l.id)}" data-move-to="lost">Kaybedildi ✗</button>
                `;
              } else {
                actionButtons = `<button class="btn btn-secondary btn-small" style="font-size: 0.7rem; padding: 2px 6px; min-height: 22px;" type="button" data-move-lead-id="${esc(l.id)}" data-move-to="new">Yeniden Aç ↺</button>`;
              }

              return `
                <div class="admin-kanban-card" data-lead-card-id="${esc(l.id)}">
                  <div class="admin-kanban-card-title">${esc(l.name || "İsimsiz Talep")}</div>
                  <div class="admin-kanban-card-meta">
                    <span><strong>E-posta:</strong> ${esc(l.email)}</span>
                    <span><strong>Firma:</strong> ${esc(l.company || "N/A")}</span>
                    <span><strong>İlgi:</strong> ${esc(l.interestType || l.projectType || "Genel")}</span>
                  </div>
                  <div class="admin-kanban-card-actions">
                    ${actionButtons}
                  </div>
                </div>
              `;
            }).join("") || `<p style="text-align: center; color: var(--admin-muted); font-size: 0.78rem; margin: 15px 0;">Talep bulunmuyor</p>`}
          </div>
        </div>
      `;
    }).join("");

    root.innerHTML = columnsHtml;
  }

  function calculateTranslationCoverage() {
    const list = locales().filter(l => l !== "en");
    const components = {
      pages: { label: "Sayfa Yazıları (Pages)", total: 0, localized: {} },
      products: { label: "Ürünler Kataloğu (Products)", total: 0, localized: {} },
      news: { label: "Haberler & Duyurular (News)", total: 0, localized: {} },
      solutions: { label: "Sektörel Çözümler (Solutions)", total: 0, localized: {} },
      faqs: { label: "Sıkça Sorulanlar (FAQs)", total: 0, localized: {} },
      clients: { label: "Referans Markalar (Clients)", total: 0, localized: {} },
      ui: { label: "Sistem Etiketleri (UI)", total: 0, localized: {} }
    };

    list.forEach(l => {
      components.pages.localized[l] = 0;
      components.products.localized[l] = 0;
      components.news.localized[l] = 0;
      components.solutions.localized[l] = 0;
      components.faqs.localized[l] = 0;
      components.clients.localized[l] = 0;
      components.ui.localized[l] = 0;
    });

    const pageContent = state.content.pageContent || {};
    Object.values(pageContent).forEach(page => {
      Object.entries(page).forEach(([fieldKey, vals]) => {
        components.pages.total++;
        list.forEach(l => {
          if (vals?.[l]?.trim()) {
            components.pages.localized[l]++;
          }
        });
      });
    });

    const products = state.content.products || [];
    const productKeys = ["title", "category", "shortDescription", "chips", "technicalSummary", "useCases", "specifications"];
    products.forEach(p => {
      productKeys.forEach(k => {
        components.products.total++;
        list.forEach(l => {
          if (p.localized?.[l]?.[k]?.trim()) {
            components.products.localized[l]++;
          }
        });
      });
    });

    const news = state.content.news || [];
    const newsKeys = ["title", "category", "excerpt", "content"];
    news.forEach(n => {
      newsKeys.forEach(k => {
        components.news.total++;
        list.forEach(l => {
          if (n.localized?.[l]?.[k]?.trim()) {
            components.news.localized[l]++;
          }
        });
      });
    });

    const solutions = state.content.solutions || [];
    const solKeys = ["title", "category", "headline", "summary", "bullets"];
    solutions.forEach(s => {
      solKeys.forEach(k => {
        components.solutions.total++;
        list.forEach(l => {
          if (s.localized?.[l]?.[k]?.trim() || (k === "bullets" && s.localized?.[l]?.bullets?.length)) {
            components.solutions.localized[l]++;
          }
        });
      });
    });

    const faqs = state.content.faqs || [];
    const faqKeys = ["question", "answer"];
    faqs.forEach(f => {
      faqKeys.forEach(k => {
        components.faqs.total++;
        list.forEach(l => {
          if (f.localized?.[l]?.[k]?.trim()) {
            components.faqs.localized[l]++;
          }
        });
      });
    });

    const clients = state.content.clients || [];
    const clientKeys = ["name", "industry", "country"];
    clients.forEach(c => {
      clientKeys.forEach(k => {
        components.clients.total++;
        list.forEach(l => {
          if (c.localized?.[l]?.[k]?.trim()) {
            components.clients.localized[l]++;
          }
        });
      });
    });

    const uiTranslations = state.content.translations || {};
    const uiKeys = Array.from(new Set(Object.values(uiTranslations).flatMap(m => Object.keys(m || {}))));
    uiKeys.forEach(k => {
      components.ui.total++;
      list.forEach(l => {
        if (uiTranslations[l]?.[k]?.trim()) {
          components.ui.localized[l]++;
        }
      });
    });

    return { list, components };
  }

  function renderTranslationHealth() {
    const root = qs("[data-admin-translation-health]");
    if (!root || !state.content) return;

    const { list, components } = calculateTranslationCoverage();
    
    const langStats = list.map(l => {
      let totalFields = 0;
      let localizedFields = 0;
      Object.values(components).forEach(c => {
        totalFields += c.total;
        localizedFields += c.localized[l] || 0;
      });
      const pct = totalFields > 0 ? Math.round((localizedFields / totalFields) * 100) : 0;
      return { locale: l, pct, total: totalFields, current: localizedFields };
    });

    root.innerHTML = `
      <article class="admin-card">
        <div class="admin-card-top">
          <strong>Dil Çeviri Durum Özetleri</strong>
          <span>Hedef 7 yabancı dilin doluluk oranları</span>
        </div>
        <div style="display: grid; gap: 14px;">
          ${langStats.map(s => `
            <div class="admin-health-row">
              <span class="admin-health-lang">${esc(localeNames[s.locale])} (${esc(s.locale.toUpperCase())})</span>
              <div class="admin-health-bar-container">
                <div class="admin-health-bar-fill" style="width: ${s.pct}%"></div>
              </div>
              <span class="admin-health-percent">%${s.pct} <span style="font-size: 0.72rem; color: var(--admin-muted); font-weight: normal;">(${s.current}/${s.total})</span></span>
            </div>
          `).join("")}
        </div>
      </article>

      <article class="admin-card" style="margin-top: 16px;">
        <div class="admin-card-top">
          <strong>Bileşen Bazlı Çeviri Dağılım Matrisi</strong>
        </div>
        <div style="overflow-x: auto;">
          <table class="admin-health-grid-table">
            <thead>
              <tr>
                <th>Bileşen (Component)</th>
                <th>Toplam Alan</th>
                ${list.map(l => `<th>${esc(l.toUpperCase())}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${Object.values(components).map(c => `
                <tr>
                  <td style="font-weight: 700; color: var(--admin-ink);">${esc(c.label)}</td>
                  <td><strong>${c.total}</strong></td>
                  ${list.map(l => {
                    const count = c.localized[l] || 0;
                    const pct = c.total > 0 ? Math.round((count / c.total) * 100) : 100;
                    const isComplete = pct === 100;
                    const badgeClass = isComplete ? "complete" : "incomplete";
                    return `
                      <td>
                        <span class="admin-health-status-badge ${badgeClass}">
                          ${count}/${c.total}
                        </span>
                      </td>
                    `;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </article>
      
      <article class="admin-card" style="margin-top: 16px;">
        <div class="admin-card-top"><strong>Çeviri Kılavuzu</strong></div>
        <p class="admin-note" style="margin-top: 0; padding-top: 0; border: none; color: var(--admin-muted);">Buradaki istatistikler sitenizdeki alanların doluluğunu temsil eder. Çevirisi eksik olan alanları tamamlamak için yukarıdaki dil seçici barından ilgili dili seçip ürün, haber veya sayfa metinlerini düzenleyebilirsiniz.</p>
      </article>
    `;
  }

  function exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.content, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `willowsoft-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function handleImportFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.products || !parsed.pageContent) {
          alert("Geçersiz yedek dosyası: products veya pageContent alanı bulunamadı.");
          return;
        }
        state.content = parsed;
        await saveContent();
        
        renderProducts();
        renderNews();
        renderClients();
        renderSolutions();
        renderFaqs();
        renderPageContent();
        renderSettings();
        renderTranslationHealth();
        renderSystemBackups();
        alert("Yedek başarıyla geri yüklendi!");
      } catch (err) {
        alert("Dosya okunamadı: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function recoverLocalDraft() {
    const draft = localStorage.getItem("willowsoft-content-draft");
    if (!draft) return;
    state.content = JSON.parse(draft);
    saveContent();
    renderProducts();
    renderNews();
    renderClients();
    renderSolutions();
    renderFaqs();
    renderPageContent();
    renderSettings();
    renderTranslationHealth();
    renderSystemBackups();
    alert("Taslak başarıyla geri yüklendi!");
  }

  function discardLocalDraft() {
    localStorage.removeItem("willowsoft-content-draft");
    renderSystemBackups();
    alert("Yerel taslak silindi.");
  }

  function renderSystemBackups() {
    const root = qs("[data-admin-backups]");
    if (!root) return;

    const hasDraft = !!localStorage.getItem("willowsoft-content-draft");
    
    root.innerHTML = `
      <article class="admin-card">
        <div class="admin-card-top"><strong>Yedek Al (Download)</strong></div>
        <p>Web sitesinin tüm veritabanını tek bir JSON dosyası olarak bilgisayarınıza indirin. Veri kaybı yaşamamak için düzenli olarak yedek alabilirsiniz.</p>
        <button class="btn btn-primary" type="button" data-export-db>Veritabanı Yedeğini İndir</button>
      </article>

      <article class="admin-card">
        <div class="admin-card-top"><strong>Yedeği Yükle (Import)</strong></div>
        <p>Bilgisayarınızdaki bir JSON yedek dosyasını yükleyerek siteyi eski haline getirebilirsiniz.</p>
        <label class="admin-backup-zone" id="backup-dropzone">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#132175" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p>Yedek JSON dosyasını buraya sürükleyin veya <strong>tıklayıp seçin</strong></p>
          <input type="file" id="backup-file-input" accept=".json" />
        </label>
      </article>

      <article class="admin-card" style="grid-column: span 2;">
        <div class="admin-card-top"><strong>Kaydedilmemiş Taslak Kurtarma</strong></div>
        ${hasDraft ? `
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--admin-accent-soft); padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(26, 163, 196, 0.2);">
            <div>
              <strong style="color: var(--admin-ink);">Yayınlanmamış yerel bir taslak tespit edildi!</strong>
              <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--admin-muted);">İnternet bağlantısı koptuğunda tarayıcı hafızasına alınan taslağı yükleyebilir veya silebilirsiniz.</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary btn-small" type="button" data-recover-draft>Geri Yükle</button>
              <button class="btn btn-secondary btn-small btn-danger" type="button" data-clear-draft style="background: rgba(207, 79, 69, 0.1); border-color: rgba(207, 79, 69, 0.2); color: var(--admin-danger);">Taslağı Sil</button>
            </div>
          </div>
        ` : `
          <p style="color: var(--admin-muted);">Kurtarılacak yerel taslak bulunmuyor. Tüm veriler sunucuyla eşitlenmiştir.</p>
        `}
      </article>
    `;

    const fileInput = qs("#backup-file-input");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files?.length) {
          handleImportFile(e.target.files[0]);
        }
      });
    }

    const dropzone = qs("#backup-dropzone");
    if (dropzone) {
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "#132175";
        dropzone.style.background = "#f1f5f9";
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.style.borderColor = "#cbd5e1";
        dropzone.style.background = "#ffffff";
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "#cbd5e1";
        dropzone.style.background = "#ffffff";
        if (e.dataTransfer?.files?.length) {
          handleImportFile(e.dataTransfer.files[0]);
        }
      });
    }
  }

  function openEditorCard(containerSel, which) {
    const cards = qsa(`${containerSel} .admin-editor-card`);
    const el = which === "last" ? cards[cards.length - 1] : cards[0];
    if (el) {
      el.open = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function addProduct() {
    if (!state.content.products) state.content.products = [];
    state.content.products.unshift({
      id: `product-${Date.now()}`,
      title: "Yeni Ürün Başlığı",
      slug: "yeni-urun-linki",
      category: "environment",
      image: "pdf-assets/p06_01_X13.jpg",
      images: [],
      shortDescription: "Yeni ürün açıklaması yazın.",
      technicalSummary: "",
      useCases: "",
      specifications: "",
      chips: ["LoRaWAN"],
      featured: false,
      detailUrl: "",
      localized: Object.fromEntries(locales().filter((locale) => locale !== "en").map((locale) => [locale, {
        title: "",
        category: "",
        shortDescription: "",
        chips: "",
        technicalSummary: "",
        useCases: "",
        specifications: ""
      }]))
    });
    markDirty();
    openProductEdit(0); // new product is unshifted to index 0
  }

  function addNews() {
    if (!state.content.news) state.content.news = [];
    state.content.news.unshift({
      id: `news-${Date.now()}`,
      title: "Yeni Haber Başlığı",
      slug: "yeni-haber-linki",
      date: new Date().toISOString().slice(0, 10),
      category: "Şirket",
      excerpt: "Haber giriş özeti girin.",
      image: "pdf-assets/p29_06_X111.jpg",
      featured: false,
      localized: Object.fromEntries(locales().filter((locale) => locale !== "en").map((locale) => [locale, {
        title: "",
        category: "",
        excerpt: "",
        content: ""
      }]))
    });
    renderNews();
    markDirty();
    openEditorCard("[data-admin-news]");
  }

  function addSolution() {
    if (!state.content.solutions) state.content.solutions = [];
    state.content.solutions.unshift({
      id: `solution-${Date.now()}`,
      title: "Yeni Çözüm",
      slug: "yeni-cozum-linki",
      category: "Kullanım Alanı",
      headline: "Çözümün ana manşetini yazın.",
      summary: "Çözüm detaylarını anlatan özet paragraf.",
      image: "",
      bullets: ["Gözlemleme sensörleri", "Kablosuz bağlantı altyapısı", "Yönetim ekranı"],
      productsUsed: [],
      servicesUsed: [],
      featured: true,
      sortOrder: 100,
      localized: Object.fromEntries(locales().filter((locale) => locale !== "en").map((locale) => [locale, {
        title: "",
        category: "",
        headline: "",
        summary: "",
        bullets: ""
      }]))
    });
    renderSolutions();
    markDirty();
    openEditorCard("[data-admin-solutions]");
  }

  function addFaq() {
    if (!state.content.faqs) state.content.faqs = [];
    state.content.faqs.unshift({
      id: `faq-${Date.now()}`,
      page: "services",
      question: "Yeni soru?",
      answer: "Lütfen sorunun cevabını yazın.",
      sortOrder: 100,
      localized: Object.fromEntries(locales().filter((locale) => locale !== "en").map((locale) => [locale, {
        question: "",
        answer: ""
      }]))
    });
    renderFaqs();
    markDirty();
    openEditorCard("[data-admin-faqs]");
  }

  function addClient() {
    if (!state.content.clients) state.content.clients = [];
    state.content.clients.push({
      id: `client-${Date.now()}`,
      name: "Yeni Referans",
      industry: "Sektör",
      country: "Ülke",
      logo: "",
      featured: true,
      sortOrder: 100,
      localized: Object.fromEntries(locales().filter((locale) => locale !== "en").map((locale) => [locale, {
        name: "",
        industry: "",
        country: ""
      }]))
    });
    renderClients();
    markDirty();
    openEditorCard("[data-admin-clients]", "last");
  }

  function handleInput(event) {
    const target = event.target;
    if (!state.content) return;

    // 0a. Rich-text editors (contenteditable) — self-routing via data attrs
    if (target.matches && target.matches("[data-rte]")) {
      const coll = target.dataset.rteCollection;
      const i = Number(target.dataset.rteIndex);
      const f = target.dataset.rteField;
      const loc = target.dataset.rteLocale;
      const arr = state.content[coll];
      if (arr && arr[i] && f) {
        if (loc) {
          if (!arr[i].localized) arr[i].localized = {};
          if (!arr[i].localized[loc]) arr[i].localized[loc] = {};
          arr[i].localized[loc][f] = target.innerHTML;
        } else {
          arr[i][f] = target.innerHTML;
        }
      }
      return;
    }

    // 0b. Product gallery path inputs — rebuild images[] from all rows in the card
    if (target.matches && target.matches("[data-gallery-input]")) {
      const pi = Number(target.dataset.productIndex);
      const editorRoot = target.closest("[data-gallery-editor]");
      if (editorRoot && state.content.products && state.content.products[pi]) {
        const inputs = Array.from(editorRoot.querySelectorAll("[data-gallery-input]"));
        state.content.products[pi].images = inputs.map((el) => el.value.trim()).filter(Boolean);
      }
      return;
    }

    // 1. Products
    const productCard = target.closest("[data-product-index]");
    if (productCard) {
      const index = Number(productCard.dataset.productIndex);
      const field = target.dataset.field;
      const localizedField = target.dataset.localizedField;
      if (field) {
        let value = target.value;
        if (field === "chips") {
          value = value.split(",").map((chip) => chip.trim()).filter(Boolean);
        }
        state.content.products[index][field] = value;
        
        if (field === "title") {
          const titleEl = productCard.querySelector(".admin-card-top strong");
          if (titleEl) titleEl.textContent = value || "Yeni Ürün";
        }
        if (field === "image") {
          const imgEl = productCard.querySelector(".admin-image-preview-thumbnail img");
          const placeholderSvg = productCard.querySelector(".admin-image-preview-thumbnail svg");
          const url = value ? (value.startsWith("http") ? value : "/" + value) : "";
          if (imgEl) {
            imgEl.src = url;
            imgEl.style.display = "block";
            if (placeholderSvg) placeholderSvg.style.display = "none";
          } else if (url) {
            const thumb = productCard.querySelector(".admin-image-preview-thumbnail");
            if (thumb) {
              thumb.innerHTML = `<img src="${esc(url)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <svg style="width: 24px; height: 24px; fill: var(--admin-muted); display: none;" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
            }
          }
        }
        const refText = productCard.querySelector(`.admin-translation-editor-row[data-field-key="${field}"] .admin-source-text`);
        if (refText) {
          refText.textContent = target.value || "(boş)";
        }
      } else if (localizedField) {
        const locale = target.dataset.locale || state.editLocale || "tr";
        if (!state.content.products[index].localized) state.content.products[index].localized = {};
        if (!state.content.products[index].localized[locale]) state.content.products[index].localized[locale] = {};
        state.content.products[index].localized[locale][localizedField] = target.value;
      }
      return;
    }

    // 2. News
    const newsCard = target.closest("[data-news-index]");
    if (newsCard) {
      const index = Number(newsCard.dataset.newsIndex);
      const field = target.dataset.field;
      const localizedField = target.dataset.localizedField;
      if (field) {
        state.content.news[index][field] = target.value;
        if (field === "title") {
          const titleEl = newsCard.querySelector(".admin-card-top strong");
          if (titleEl) titleEl.textContent = target.value || "Yeni Haber";
        }
        if (field === "image") {
          const imgEl = newsCard.querySelector(".admin-image-preview-thumbnail img");
          const placeholderSvg = newsCard.querySelector(".admin-image-preview-thumbnail svg");
          const url = target.value ? (target.value.startsWith("http") ? target.value : "/" + target.value) : "";
          if (imgEl) {
            imgEl.src = url;
            imgEl.style.display = "block";
            if (placeholderSvg) placeholderSvg.style.display = "none";
          } else if (url) {
            const thumb = newsCard.querySelector(".admin-image-preview-thumbnail");
            if (thumb) {
              thumb.innerHTML = `<img src="${esc(url)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <svg style="width: 24px; height: 24px; fill: var(--admin-muted); display: none;" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
            }
          }
        }
        const refText = newsCard.querySelector(`.admin-translation-editor-row[data-field-key="${field}"] .admin-source-text`);
        if (refText) {
          refText.textContent = target.value || "(boş)";
        }
      } else if (localizedField) {
        const locale = target.dataset.locale || state.editLocale || "tr";
        if (!state.content.news[index].localized) state.content.news[index].localized = {};
        if (!state.content.news[index].localized[locale]) state.content.news[index].localized[locale] = {};
        state.content.news[index].localized[locale][localizedField] = target.value;
      }
      return;
    }

    // 3. Solutions
    const solutionCard = target.closest("[data-solution-index]");
    if (solutionCard) {
      const index = Number(solutionCard.dataset.solutionIndex);
      const field = target.dataset.field;
      const localizedField = target.dataset.localizedField;
      if (field) {
        let value = target.value;
        if (field === "bullets") {
          value = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        } else if (field === "productsUsed" || field === "servicesUsed") {
          value = value.split(",").map((slug) => slug.trim()).filter(Boolean);
        } else if (field === "sortOrder") {
          value = Number(value || 0);
        } else if (field === "featured") {
          value = value === "true";
        }
        state.content.solutions[index][field] = value;
        if (field === "title" || field === "headline") {
          const titleEl = solutionCard.querySelector(".admin-card-top strong");
          if (titleEl) titleEl.textContent = value || "Yeni Çözüm";
        }
        if (field === "image") {
          const imgEl = solutionCard.querySelector(".admin-image-preview-thumbnail img");
          const placeholderSvg = solutionCard.querySelector(".admin-image-preview-thumbnail svg");
          const url = target.value ? (target.value.startsWith("http") ? target.value : "/" + target.value) : "";
          if (imgEl) {
            imgEl.src = url;
            imgEl.style.display = "block";
            if (placeholderSvg) placeholderSvg.style.display = "none";
          } else if (url) {
            const thumb = solutionCard.querySelector(".admin-image-preview-thumbnail");
            if (thumb) {
              thumb.innerHTML = `<img src="${esc(url)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <svg style="width: 24px; height: 24px; fill: var(--admin-muted); display: none;" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
            }
          }
        }
        const refText = solutionCard.querySelector(`.admin-translation-editor-row[data-field-key="${field}"] .admin-source-text`);
        if (refText) {
          refText.textContent = target.value || "(boş)";
        }
      } else if (localizedField) {
        const locale = target.dataset.locale || state.editLocale || "tr";
        if (!state.content.solutions[index].localized) state.content.solutions[index].localized = {};
        if (!state.content.solutions[index].localized[locale]) state.content.solutions[index].localized[locale] = {};
        state.content.solutions[index].localized[locale][localizedField] = target.value;
      }
      return;
    }

    // 4. Clients
    const clientCard = target.closest("[data-client-index]");
    if (clientCard) {
      const index = Number(clientCard.dataset.clientIndex);
      const field = target.dataset.field;
      const localizedField = target.dataset.localizedField;
      if (field) {
        let value = target.value;
        if (field === "sortOrder") {
          value = Number(value || 0);
        } else if (field === "featured") {
          value = value === "true";
        }
        state.content.clients[index][field] = value;
        if (field === "name") {
          const titleEl = clientCard.querySelector(".admin-card-top strong");
          if (titleEl) titleEl.textContent = value || "Yeni Referans";
        }
        if (field === "logo") {
          const imgEl = clientCard.querySelector(".admin-image-preview-thumbnail img");
          const placeholderSvg = clientCard.querySelector(".admin-image-preview-thumbnail svg");
          const url = target.value ? (target.value.startsWith("http") ? target.value : "/" + target.value) : "";
          if (imgEl) {
            imgEl.src = url;
            imgEl.style.display = "block";
            if (placeholderSvg) placeholderSvg.style.display = "none";
          } else if (url) {
            const thumb = clientCard.querySelector(".admin-image-preview-thumbnail");
            if (thumb) {
              thumb.innerHTML = `<img src="${esc(url)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <svg style="width: 24px; height: 24px; fill: var(--admin-muted); display: none;" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
            }
          }
        }
        const refText = clientCard.querySelector(`.admin-translation-editor-row[data-field-key="${field}"] .admin-source-text`);
        if (refText) {
          refText.textContent = target.value || "(boş)";
        }
      } else if (localizedField) {
        const locale = target.dataset.locale || state.editLocale || "tr";
        if (!state.content.clients[index].localized) state.content.clients[index].localized = {};
        if (!state.content.clients[index].localized[locale]) state.content.clients[index].localized[locale] = {};
        state.content.clients[index].localized[locale][localizedField] = target.value;
      }
      return;
    }

    // 5. FAQs
    const faqCard = target.closest("[data-faq-index]");
    if (faqCard) {
      const index = Number(faqCard.dataset.faqIndex);
      const field = target.dataset.field;
      const localizedField = target.dataset.localizedField;
      if (field) {
        let value = target.value;
        if (field === "sortOrder") {
          value = Number(value || 0);
        }
        state.content.faqs[index][field] = value;
        if (field === "question") {
          const titleEl = faqCard.querySelector(".admin-card-top strong");
          if (titleEl) titleEl.textContent = value || "Yeni Soru";
        }
        const refText = faqCard.querySelector(`.admin-translation-editor-row[data-field-key="${field}"] .admin-source-text`);
        if (refText) {
          refText.textContent = target.value || "(boş)";
        }
      } else if (localizedField) {
        const locale = target.dataset.locale || state.editLocale || "tr";
        if (!state.content.faqs[index].localized) state.content.faqs[index].localized = {};
        if (!state.content.faqs[index].localized[locale]) state.content.faqs[index].localized[locale] = {};
        state.content.faqs[index].localized[locale][localizedField] = target.value;
      }
      return;
    }

    // 6. Page Texts (pageContent)
    const pageCard = target.closest("[data-page-content]");
    const fieldRoot = target.closest("[data-page-field]");
    if (pageCard && fieldRoot) {
      const pageKey = pageCard.dataset.pageContent;
      const fieldKey = fieldRoot.dataset.pageField;
      const locale = target.dataset.pageLocale;
      if (locale) {
        if (!state.content.pageContent[pageKey]) state.content.pageContent[pageKey] = {};
        if (!state.content.pageContent[pageKey][fieldKey]) state.content.pageContent[pageKey][fieldKey] = {};
        state.content.pageContent[pageKey][fieldKey][locale] = target.type === "checkbox" ? (target.checked ? "true" : "false") : target.value;
      }
      return;
    }

    // 7. Company Facts
    const factsEditor = target.closest("[data-company-facts-editor]");
    if (factsEditor) {
      const field = target.dataset.field;
      if (field) {
        state.content.companyFacts[field] = target.value;
      }
      return;
    }

    // 8. UI Labels
    const uiKeyRoot = target.closest("[data-ui-key]");
    if (uiKeyRoot) {
      const key = uiKeyRoot.dataset.uiKey;
      const locale = target.dataset.uiLocale;
      if (locale) {
        if (!state.content.translations) state.content.translations = {};
        if (!state.content.translations[locale]) state.content.translations[locale] = {};
        state.content.translations[locale][key] = target.value;
      }
      return;
    }
  }

  function renderLocaleSwitcher() {
    const root = qs("[data-admin-locale-switcher]");
    if (!root) return;
    const allLocales = locales().filter(l => l !== "en");
    root.innerHTML = `
      <span class="label">Çeviri Hedef Dili:</span>
      ${allLocales.map(locale => `
        <button type="button" class="admin-locale-btn ${state.editLocale === locale ? "active" : ""}" data-switch-locale="${esc(locale)}">
          ${esc(localeNames[locale] || locale.toUpperCase())}
        </button>
      `).join("")}
    `;
  }

  /* ===== Live Preview ===== */
  let previewTimer = null;

  function previewIsOpen() {
    return document.body.classList.contains("admin-preview-open");
  }

  function syncPreviewNow() {
    const iframe = qs("[data-admin-preview-iframe]");
    if (!iframe || !state.content) return;
    try {
      localStorage.setItem("willowsoft-content-draft", JSON.stringify(state.content));
    } catch {
      /* storage full / disabled — preview just won't update */
    }
    try {
      const win = iframe.contentWindow;
      const sx = win ? win.scrollX : 0;
      const sy = win ? win.scrollY : 0;
      iframe.addEventListener("load", function restore() {
        try { iframe.contentWindow.scrollTo(sx, sy); } catch { /* cross-state */ }
        iframe.removeEventListener("load", restore);
      });
      win.location.reload();
    } catch {
      // Fallback: hard reset src
      iframe.src = iframe.getAttribute("src");
    }
  }

  function syncPreviewDebounced() {
    if (!previewIsOpen()) return;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(syncPreviewNow, 350);
  }

  function setPreviewPage(page) {
    const iframe = qs("[data-admin-preview-iframe]");
    if (!iframe) return;
    // Write current draft first so the freshly loaded page reflects edits.
    try { localStorage.setItem("willowsoft-content-draft", JSON.stringify(state.content)); } catch { /* noop */ }
    iframe.src = page;
    iframe.dataset.init = "1";
  }

  function togglePreview() {
    const open = document.body.classList.toggle("admin-preview-open");
    const btn = qs("[data-toggle-preview]");
    if (btn) btn.classList.toggle("active", open);
    if (open) {
      const iframe = qs("[data-admin-preview-iframe]");
      const sel = qs("[data-preview-page-select]");
      if (iframe && iframe.dataset.init !== "1") {
        setPreviewPage((sel && sel.value) || "index.html");
      } else {
        syncPreviewNow();
      }
    }
  }

  function bindEvents() {
    qsa("[data-admin-tab]").forEach((button) => {
      button.addEventListener("click", () => activateTab(button.dataset.adminTab));
    });
    qs("[data-save-content]").addEventListener("click", saveContent);
    qs("[data-admin-logout]").addEventListener("click", logout);
    qs("[data-admin-login-form]").addEventListener("submit", login);
    const addProductBtn = qs("[data-add-product]");
    if (addProductBtn) addProductBtn.addEventListener("click", addProduct);
    const addNewsBtn = qs("[data-add-news]");
    if (addNewsBtn) addNewsBtn.addEventListener("click", addNews);
    const addClientBtn = qs("[data-add-client]") || qs("[data-admin-action='new-client']");
    if (addClientBtn) addClientBtn.addEventListener("click", addClient);
    
    const addSolutionBtn = qs("[data-add-solution]");
    if (addSolutionBtn) addSolutionBtn.addEventListener("click", addSolution);
    const addFaqBtn = qs("[data-add-faq]");
    if (addFaqBtn) addFaqBtn.addEventListener("click", addFaq);
    
    qs("[data-refresh-leads]").addEventListener("click", loadLeads);
    qs("[data-refresh-analytics]").addEventListener("click", loadAnalytics);

    document.addEventListener("input", handleInput);
    document.addEventListener("change", handleInput);

    // Live preview wiring (state updates above run first, then we sync the draft)
    const togglePreviewBtn = qs("[data-toggle-preview]");
    if (togglePreviewBtn) togglePreviewBtn.addEventListener("click", togglePreview);
    const previewSelect = qs("[data-preview-page-select]");
    if (previewSelect) previewSelect.addEventListener("change", () => setPreviewPage(previewSelect.value));
    const previewClose = qs("[data-close-preview]");
    if (previewClose) previewClose.addEventListener("click", togglePreview);
    document.addEventListener("input", syncPreviewDebounced);
    document.addEventListener("change", syncPreviewDebounced);

    // Unsaved-changes (dirty) indicator & live reactive counters
    const onAdminEdit = (e) => {
      const target = e.target;
      
      // Live Preview Sync for Page Content Textareas
      if (target.matches("textarea[data-page-locale]")) {
        const preview = target.parentElement.querySelector("[data-live-preview]");
        if (preview) preview.innerHTML = target.value;
      }
      
      // Color Picker logic
      if (target.matches(".admin-color-picker") && target.dataset.textareaCmd === "color") {
        const toolbar = target.closest("[data-textarea-toolbar]");
        const textarea = toolbar.parentElement.querySelector("textarea");
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          const selectedText = text.substring(start, end);
          if (selectedText) {
            const hex = target.value;
            const replacement = `<span style="color: ${hex}">${selectedText}</span>`;
            textarea.value = text.substring(0, start) + replacement + text.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + replacement.length;
            const preview = toolbar.parentElement.querySelector("[data-live-preview]");
            if (preview) preview.innerHTML = textarea.value;
            textarea.focus();
            markDirty();
          }
        }
      }

      // SEO Live Sync
      if (target.dataset.seoField) {
        const pageKey = target.dataset.seoPage;
        const loc = target.dataset.seoLocale;
        const field = target.dataset.seoField;
        const val = target.type === "checkbox" ? target.checked : target.value;
        
        if (!state.content.pageSeo) state.content.pageSeo = {};
        if (!state.content.pageSeo[pageKey]) state.content.pageSeo[pageKey] = {};
        if (!state.content.pageSeo[pageKey][loc]) state.content.pageSeo[pageKey][loc] = {};
        
        state.content.pageSeo[pageKey][loc][field] = val;
        markDirty();

        // SERP Güncellemesi
        if (field === "seoTitle") {
          const pvTitle = document.querySelector(`[data-serp-title-${CSS.escape(loc)}-${CSS.escape(pageKey)}]`);
          const count = document.querySelector(`[data-char-count="seoTitle-${CSS.escape(loc)}-${CSS.escape(pageKey)}"]`);
          if (pvTitle) pvTitle.textContent = val || 'SEO Başlığı Belirlenmedi...';
          if (count) {
             const len = val.length;
             count.textContent = len + "/60";
             count.style.color = len >= 50 && len <= 60 ? '#10b981' : len >= 40 && len <= 70 ? '#f59e0b' : '#ef4444';
          }
        }
        if (field === "metaDescription") {
          const pvDesc = document.querySelector(`[data-serp-desc-${CSS.escape(loc)}-${CSS.escape(pageKey)}]`);
          const count = document.querySelector(`[data-char-count="metaDescription-${CSS.escape(loc)}-${CSS.escape(pageKey)}"]`);
          if (pvDesc) pvDesc.textContent = val || 'Meta açıklaması henüz girilmedi.';
          if (count) {
             const len = val.length;
             count.textContent = len + "/160";
             count.style.color = len >= 150 && len <= 160 ? '#10b981' : len >= 130 && len <= 175 ? '#f59e0b' : '#ef4444';
          }
        }
      }

      if (state.content && target.closest && target.closest(".admin-main")) {
        markDirty();
        
        // Reactive translation tab counter update
        const target = e.target;
        const localizedField = target.dataset.localizedField || target.dataset.rteLocale;
        if (localizedField || target.dataset.rteField) {
          const accordion = target.closest(".admin-translation-accordion");
          if (accordion) {
            const locale = target.dataset.locale || target.dataset.rteLocale;
            if (locale) {
              const tabCount = accordion.querySelector(`[data-trans-tab-locale="${locale}"] .admin-trans-count`);
              const panel = accordion.querySelector(`[data-trans-panel-locale="${locale}"]`);
              if (tabCount && panel) {
                const inputs = Array.from(panel.querySelectorAll("[data-localized-field], [data-rte-field]"));
                const filled = inputs.filter(i => {
                  if (i.matches("[data-rte-field]")) return i.textContent.trim() !== "";
                  return i.value.trim() !== "";
                }).length;
                tabCount.textContent = `${filled}/${inputs.length}`;
              }
            }
          }
        }
      }
    };
    document.addEventListener("input", onAdminEdit);
    document.addEventListener("change", (e) => {
      if (e.target.id === "admin-json-upload") {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target.result);
            state.content.pageContent = json;
            markDirty();
            renderPageContent();
            alert("JSON başarıyla yüklendi! Değişiklikleri kaydetmek için sağ üstteki 'Değişiklikleri Kaydet' butonuna basmayı unutmayın.");
          } catch (err) {
            alert("JSON formatı hatalı!");
          }
        };
        reader.readAsText(file);
        e.target.value = "";
        return;
      }
      onAdminEdit(e);
    });

    document.addEventListener("click", (event) => {

      // --- Bulk Editor Accordion ---
      const bulkHeader = event.target.closest(".admin-seo-bulk-header");
      if (bulkHeader) {
        const row = bulkHeader.parentElement;
        if (row.hasAttribute("open")) {
          row.removeAttribute("open");
        } else {
          row.setAttribute("open", "");
        }
        event.preventDefault();
        return;
      }
      
      // --- Bulk Editor Goto Page ---
      const gotoBtn = event.target.closest("[data-goto-page-seo]");
      if (gotoBtn) {
        const pageKey = gotoBtn.dataset.gotoPageSeo;
        // Switch to pages tab first
        activateTab('pages');
        openPageEdit(pageKey, 'seo');
        return;
      }
      // --- JSON Download ---
      if (event.target.closest("#admin-json-download")) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.content.pageContent, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "willow_page_translations.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        return;
      }
      // --- Product grid card click → open editor ---
      const gridCard = event.target.closest("[data-product-grid-card]");
      if (gridCard && !event.target.closest("button")) {
        openProductEdit(Number(gridCard.dataset.productGridCard));
        return;
      }

      // --- Product editor back button ---
      if (event.target.closest("[data-product-back]")) {
        closeProductEdit();
        return;
      }

      // --- Page grid card click → open editor ---
      const pageGridCard = event.target.closest("[data-page-grid-card]");
      if (pageGridCard && !event.target.closest("button")) {
        openPageEdit(pageGridCard.dataset.pageGridCard);
        return;
      }

      // --- Page editor back button ---
      if (event.target.closest("[data-page-back]")) {
        closePageEdit();
        return;
      }

      // --- Translation locale tabs ---
      const transTab = event.target.closest("[data-trans-tab-locale]");
      if (transTab) {
        const accordion = transTab.closest(".admin-translation-accordion");
        if (accordion) {
          const locale = transTab.dataset.transTabLocale;
          accordion.querySelectorAll(".admin-trans-locale-tab").forEach(t => t.classList.toggle("active", t.dataset.transTabLocale === locale));
          accordion.querySelectorAll(".admin-trans-locale-panel").forEach(p => p.classList.toggle("active", p.dataset.transPanelLocale === locale));
        }
        return;
      }

      // --- Rich-text toolbar commands ---
      const rteBtn = event.target.closest("[data-cmd]");
      if (rteBtn && rteBtn.closest("[data-rte-toolbar]")) {
        event.preventDefault();
        const toolbar = rteBtn.closest("[data-rte-toolbar]");
        const editor = toolbar.parentElement.querySelector("[data-rte]");
        if (editor) {
          editor.focus();
          const cmd = rteBtn.dataset.cmd;
          if (cmd === "createLink") {
            const url = prompt("Bağlantı adresi (https://...)");
            if (url) document.execCommand("createLink", false, url);
          } else if (cmd === "formatBlock") {
            document.execCommand("formatBlock", false, rteBtn.dataset.val || "h3");
          } else {
            document.execCommand(cmd, false, null);
          }
          editor.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return;
      }

      // --- Textarea HTML toolbar commands ---
      const taBtn = event.target.closest(".admin-textarea-btn");
      if (taBtn && taBtn.tagName !== "INPUT") {
        event.preventDefault();
        const toolbar = taBtn.closest("[data-textarea-toolbar]");
        const textarea = toolbar.parentElement.querySelector("textarea");
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          const selectedText = text.substring(start, end);
          
          const cmd = taBtn.dataset.textareaCmd;
          const tag = taBtn.dataset.tag;
          const className = taBtn.dataset.class;
          
          let replacement = "";
          if (cmd === "wrap") {
            const classAttr = className ? ` class="${className}"` : "";
            replacement = `<${tag}${classAttr}>${selectedText}</${tag}>`;
          } else if (cmd === "insert") {
            replacement = `<${tag}>`;
          }
          
          textarea.value = text.substring(0, start) + replacement + text.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + replacement.length;
          
          const preview = toolbar.parentElement.querySelector("[data-live-preview]");
          if (preview) preview.innerHTML = textarea.value;

          textarea.focus();
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return;
      }
      
      // --- Page Editor Outer Tabs ---
      const outerTabBtn = event.target.closest("[data-outer-tab-target]");
      if (outerTabBtn) {
        const targetId = outerTabBtn.dataset.outerTabTarget;
        const outerTabs = outerTabBtn.parentElement.querySelectorAll(".admin-page-outer-tab");
        const outerPanels = outerTabBtn.parentElement.parentElement.querySelectorAll(".admin-page-outer-panel");
        outerTabs.forEach(t => t.classList.toggle("active", t === outerTabBtn));
        outerPanels.forEach(p => p.classList.toggle("active", p.dataset.outerPanelId === targetId));
        return;
      }

      // --- Product gallery add / remove / reorder ---
      const galleryAdd = event.target.closest("[data-gallery-add]");
      const galleryRemove = event.target.closest("[data-gallery-remove]");
      const galleryMove = event.target.closest("[data-gallery-move]");
      if (galleryAdd || galleryRemove || galleryMove) {
        const y = window.scrollY;
        if (galleryAdd) {
          const p = state.content.products[Number(galleryAdd.dataset.galleryAdd)];
          if (p) { p.images = Array.isArray(p.images) ? p.images : []; p.images.push(""); }
        } else if (galleryRemove) {
          const p = state.content.products[Number(galleryRemove.dataset.productIndex)];
          if (p && Array.isArray(p.images)) p.images.splice(Number(galleryRemove.dataset.galleryIndex), 1);
        } else if (galleryMove) {
          const p = state.content.products[Number(galleryMove.dataset.productIndex)];
          const gi = Number(galleryMove.dataset.galleryIndex);
          const ni = gi + (galleryMove.dataset.galleryMove === "up" ? -1 : 1);
          if (p && Array.isArray(p.images) && ni >= 0 && ni < p.images.length) {
            const t = p.images[gi]; p.images[gi] = p.images[ni]; p.images[ni] = t;
          }
        }
        renderProducts();
        window.scrollTo(0, y);
        markDirty();
        return;
      }

      const removeProduct = event.target.closest("[data-remove-product]");
      const removeNews = event.target.closest("[data-remove-news]");
      const removeClient = event.target.closest("[data-remove-client]");
      const removeSolution = event.target.closest("[data-remove-solution]");
      const removeFaq = event.target.closest("[data-remove-faq]");
      const updateLeadButton = event.target.closest("[data-update-lead]");
      const switchLocaleBtn = event.target.closest("[data-switch-locale]");
      
      const moveLeadBtn = event.target.closest("[data-move-lead-id]");
      const exportBtn = event.target.closest("[data-export-db]");
      const recoverDraftBtn = event.target.closest("[data-recover-draft]");
      const clearDraftBtn = event.target.closest("[data-clear-draft]");

      if (switchLocaleBtn) {
        state.editLocale = switchLocaleBtn.dataset.switchLocale;
        renderLocaleSwitcher();
        renderProducts();
        renderNews();
        renderClients();
        renderSolutions();
        renderFaqs();
        renderPageContent();
        renderSettings();
      }
      if (removeProduct) {
        state.content.products.splice(Number(removeProduct.dataset.removeProduct), 1);
        renderProducts();
      }
      if (removeNews) {
        state.content.news.splice(Number(removeNews.dataset.removeNews), 1);
        renderNews();
      }
      if (removeClient) {
        state.content.clients.splice(Number(removeClient.dataset.removeClient), 1);
        renderClients();
      }
      if (removeSolution) {
        state.content.solutions.splice(Number(removeSolution.dataset.removeSolution), 1);
        renderSolutions();
      }
      if (removeFaq) {
        state.content.faqs.splice(Number(removeFaq.dataset.removeFaq), 1);
        renderFaqs();
      }
      if (removeProduct || removeNews || removeClient || removeSolution || removeFaq) { event.preventDefault(); markDirty(); }
      if (updateLeadButton) updateLead(updateLeadButton.dataset.updateLead);

      if (moveLeadBtn) {
        moveLead(moveLeadBtn.dataset.moveLeadId, moveLeadBtn.dataset.moveTo);
      }
      if (exportBtn) {
        exportBackup();
      }
      if (recoverDraftBtn) {
        recoverLocalDraft();
      }
      if (clearDraftBtn) {
        discardLocalDraft();
      }
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
    
    if (!state.editLocale) {
      const nonEn = locales().filter(l => l !== "en");
      state.editLocale = nonEn[0] || "tr";
    }

    renderLocaleSwitcher();
    const switcher = qs("[data-admin-locale-switcher]");
    if (switcher) switcher.style.display = "none";

    renderOverview();
    renderProducts();
    renderNews();
    renderClients();
    renderSolutions();
    renderFaqs();
    renderPageContent();
    renderSettings();
    
    renderLeadsKanban();
    renderTranslationHealth();
    renderSystemBackups();

    await loadLeads();
    await loadAnalytics();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
