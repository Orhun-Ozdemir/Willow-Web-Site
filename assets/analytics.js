(function () {
  if (location.pathname.includes("/admin")) return;

  const endpoint = "/api/events";
  const storageKey = "willowsoft-visitor-id";
  const sessionKey = "willowsoft-session-id";
  const start = Date.now();
  let durationSent = false;

  function id(prefix) {
    if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function getStoredId(key, prefix, store) {
    try {
      const existing = store.getItem(key);
      if (existing) return existing;
      const next = id(prefix);
      store.setItem(key, next);
      return next;
    } catch {
      return id(prefix);
    }
  }

  const visitorId = getStoredId(storageKey, "visitor", window.localStorage);
  const sessionId = getStoredId(sessionKey, "session", window.sessionStorage);

  function basePayload(eventType, metadata = {}) {
    return {
      eventType,
      visitorId,
      sessionId,
      path: location.pathname,
      title: document.title,
      locale: document.documentElement.lang || "en",
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: window.screen?.width || 0,
        height: window.screen?.height || 0
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      language: navigator.language || "",
      metadata
    };
  }

  function send(eventType, metadata = {}, options = {}) {
    const payload = {
      ...basePayload(eventType, metadata),
      durationMs: options.durationMs || 0
    };
    const body = JSON.stringify(payload);
    if (options.beacon && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
      return;
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: !!options.keepalive
    }).catch(() => {});
  }

  function closestTrackedLink(target) {
    return target.closest?.("a[href], button, [data-filter], .logo-tile");
  }

  function classifyInteraction(node) {
    if (node.matches?.(".logo-tile")) {
      return ["client_logo_interaction", { client: node.dataset.client || node.title || "" }];
    }
    if (node.matches?.("[data-filter]")) {
      return ["product_filter_click", { filter: node.dataset.filter || "" }];
    }
    if (node.matches?.("button")) {
      return ["button_click", { label: node.textContent.trim().slice(0, 120) }];
    }

    const href = node.getAttribute("href") || "";
    const label = node.textContent.trim().slice(0, 120);
    const card = node.closest(".product-card, .news-card");
    if (href.includes("/products/") || card?.classList.contains("product-card")) {
      return ["product_card_click", { href, label }];
    }
    if (href.includes("/news/") || card?.classList.contains("news-card")) {
      return ["news_card_click", { href, label }];
    }
    if (href.includes("start-project")) return ["cta_click", { href, label, cta: "start_project" }];
    if (node.closest(".nav-links, .nav-actions")) return ["nav_click", { href, label }];
    return ["link_click", { href, label }];
  }

  document.addEventListener("click", (event) => {
    const node = closestTrackedLink(event.target);
    if (!node) return;
    const [eventType, metadata] = classifyInteraction(node);
    send(eventType, metadata);
  });

  document.addEventListener("change", (event) => {
    if (event.target.closest?.("[data-language-switcher]")) {
      send("language_switch", { locale: event.target.value });
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    send("form_submit", {
      formId: form.id || "",
      action: form.getAttribute("action") || "",
      sourcePage: location.pathname
    });
  }, true);

  function sendDuration() {
    if (durationSent) return;
    durationSent = true;
    send("page_duration", {}, {
      durationMs: Date.now() - start,
      beacon: true,
      keepalive: true
    });
  }

  window.WillowAnalytics = { track: send };

  send("page_view", {
    type: location.pathname.includes("/products/") ? "product_detail" : location.pathname.includes("/news/") ? "news_detail" : "page"
  });
  window.addEventListener("pagehide", sendDuration);
  window.addEventListener("beforeunload", sendDuration);
})();
