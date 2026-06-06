(function () {
  const locales = ["en", "tr", "de", "fr", "es", "it", "ar", "ja"];
  const labels = {
    en: "EN",
    tr: "TR",
    de: "DE",
    fr: "FR",
    es: "ES",
    it: "IT",
    ar: "AR",
    ja: "JA"
  };

  const defaultMessages = {
    en: {
      "nav.solutions": "Solutions",
      "nav.services": "Services",
      "nav.products": "Products",
      "nav.news": "News",
      "nav.company": "Company",
      "nav.contact": "Contact",
      "cta.start": "Start Project",
      "cta.viewDetails": "View Details",
      "cta.readUpdate": "Read Update",
      "cta.backProducts": "Back to Products",
      "cta.backNews": "Back to News",
      "language.label": "Language"
    }
  };

  function getLocale() {
    const first = location.pathname.split("/").filter(Boolean)[0];
    return locales.includes(first) ? first : "en";
  }

  function stripLocale(pathname) {
    const parts = pathname.split("/").filter(Boolean);
    if (locales.includes(parts[0])) parts.shift();
    return `/${parts.join("/")}`.replace(/\/$/, "") || "/";
  }

  function localizePath(pathname, locale) {
    const clean = stripLocale(pathname);
    if (locale === "en") return clean === "/" ? "/en" : `/en${clean}`;
    return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
  }

  function isLocalPageHref(href) {
    return href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("http") && !href.startsWith("/api/") && !href.startsWith("/assets/") && !href.startsWith("/pdf-assets/") && !href.includes("admin");
  }

  function canonicalPathFromHref(href) {
    const url = new URL(href, location.origin);
    let path = url.pathname;
    if (path.endsWith(".html")) path = path.replace(/\/?index\.html$/, "/").replace(/\.html$/, "");
    if (!path.startsWith("/")) path = `/${path}`;
    return `${path}${url.search}${url.hash}`;
  }

  function t(messages, key) {
    return messages[key] || defaultMessages.en[key] || key;
  }

  function navKeyForHref(href) {
    if (href.includes("solutions")) return "nav.solutions";
    if (href.includes("services")) return "nav.services";
    if (href.includes("products")) return "nav.products";
    if (href.includes("news")) return "nav.news";
    if (href.includes("company")) return "nav.company";
    if (href.includes("contact")) return "nav.contact";
    return "";
  }

  function addLanguageSwitcher(locale) {
    const navActions = document.querySelector(".nav-actions");
    if (!navActions || navActions.querySelector("[data-language-switcher]")) return;
    const menuToggle = document.querySelector(".menu-toggle");
    const wrapper = document.createElement("label");
    wrapper.className = "language-switcher";
    wrapper.dataset.languageSwitcher = "";
    wrapper.innerHTML = `
      <span class="sr-only">Language</span>
      <select aria-label="Language">
        ${locales.map((item) => `<option value="${item}"${item === locale ? " selected" : ""}>${labels[item]}</option>`).join("")}
      </select>
    `;
    navActions.prepend(wrapper);
    if (menuToggle && menuToggle.parentElement !== navActions) navActions.appendChild(menuToggle);
    wrapper.querySelector("select").addEventListener("change", (event) => {
      location.href = localizePath(location.pathname, event.target.value) + location.search + location.hash;
    });
  }

  function applyLocaleLinks(locale) {
    document.querySelectorAll("a[href]").forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (!isLocalPageHref(href)) return;
      const canonical = canonicalPathFromHref(href);
      const hashIndex = canonical.indexOf("#");
      const queryIndex = canonical.indexOf("?");
      const splitIndex = [hashIndex, queryIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0];
      const pathname = splitIndex >= 0 ? canonical.slice(0, splitIndex) : canonical;
      const suffix = splitIndex >= 0 ? canonical.slice(splitIndex) : "";
      anchor.setAttribute("href", `${localizePath(pathname, locale)}${suffix}`);
    });
  }

  function applyTranslations(messages) {
    document.querySelectorAll(".nav-links a[href]").forEach((anchor) => {
      const key = navKeyForHref(anchor.getAttribute("href") || "");
      if (key) anchor.textContent = t(messages, key);
    });
    document.querySelectorAll(".nav-actions .btn-primary, a[href*='start-project']").forEach((node) => {
      if (node.textContent.trim().toLowerCase().includes("start")) node.textContent = t(messages, "cta.start");
    });
    document.querySelectorAll("a").forEach((anchor) => {
      const text = anchor.textContent.trim();
      if (text === "View Details") anchor.textContent = t(messages, "cta.viewDetails");
      if (text === "Read Update") anchor.textContent = t(messages, "cta.readUpdate");
      if (text === "Back to Products") anchor.textContent = t(messages, "cta.backProducts");
      if (text === "Back to News") anchor.textContent = t(messages, "cta.backNews");
    });
  }

  async function init() {
    const locale = getLocale();
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.body.dataset.locale = locale;
    let content = null;
    try {
      content = await window.WillowCMS?.fetchContent?.();
    } catch {
      content = null;
    }
    const messages = {
      ...defaultMessages.en,
      ...(content?.translations?.[locale] || {})
    };
    addLanguageSwitcher(locale);
    applyTranslations(messages);
    applyLocaleLinks(locale);
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("willow:content-ready", () => init());
})();
