(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", links.classList.contains("open") ? "true" : "false");
    });
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reducedMotion) {
      items.forEach((item) => item.classList.add("visible"));
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
      // Fire as soon as ANY pixel enters viewport (was 0.18 — caused ghost
      // text when small elements like eyebrows never reached 18% visibility
      // in the upper viewport). Extra rootMargin pre-triggers items about
      // to scroll in, so reveal animation runs before user sees it.
      { threshold: 0.01, rootMargin: "120px 0px 120px 0px" }
    );

    items.forEach((item) => observer.observe(item));

    // Belt-and-suspenders: any .reveal item that's already in the viewport
    // on initial page load gets visible immediately (no opacity-0 flash).
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          item.classList.add("visible");
          observer.unobserve(item);
        }
      });
    });
  }

  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    const animate = (el) => {
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || "";
      const duration = reducedMotion ? 1 : 1000;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function initSignalCanvas() {
    if (reducedMotion) return;
    document.querySelectorAll(".signal-canvas").forEach((canvas) => {
      const ctx = canvas.getContext("2d");
      let width = 0;
      let height = 0;
      let points = [];
      let pulses = [];
      let raf = 0;
      const density = Number(canvas.dataset.density || 36);
      const color = canvas.dataset.color || "35, 168, 216";

      function resize() {
        const rect = canvas.getBoundingClientRect();
        const scale = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.max(1, Math.floor(rect.width));
        height = Math.max(1, Math.floor(rect.height));
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        build();
      }

      function build() {
        points = [];
        pulses = [];
        for (let i = 0; i < density; i += 1) {
          points.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
          });
        }
        for (let i = 0; i < Math.max(7, density / 5); i += 1) {
          pulses.push({
            from: Math.floor(Math.random() * points.length),
            to: Math.floor(Math.random() * points.length),
            t: Math.random(),
            speed: 0.003 + Math.random() * 0.006,
          });
        }
      }

      function draw() {
        ctx.clearRect(0, 0, width, height);
        points.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        });

        for (let i = 0; i < points.length; i += 1) {
          for (let j = i + 1; j < points.length; j += 1) {
            const a = points[i];
            const b = points[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 170) {
              const alpha = (1 - dist / 170) * 0.18;
              ctx.strokeStyle = `rgba(${color}, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        points.forEach((p) => {
          ctx.fillStyle = `rgba(${color}, 0.55)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });

        pulses.forEach((pulse) => {
          const a = points[pulse.from];
          const b = points[pulse.to];
          if (!a || !b || pulse.from === pulse.to) return;
          pulse.t += pulse.speed;
          if (pulse.t > 1) {
            pulse.from = Math.floor(Math.random() * points.length);
            pulse.to = Math.floor(Math.random() * points.length);
            pulse.t = 0;
          }
          const x = a.x + (b.x - a.x) * pulse.t;
          const y = a.y + (b.y - a.y) * pulse.t;
          ctx.fillStyle = `rgba(255, 255, 255, 0.82)`;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        raf = requestAnimationFrame(draw);
      }

      resize();
      draw();
      window.addEventListener("resize", resize);
      canvas.addEventListener("remove", () => cancelAnimationFrame(raf));
    });
  }

  function initFilters() {
    const filters = document.querySelectorAll("[data-filter]");
    if (!filters.length) return;

    filters.forEach((button) => {
      button.addEventListener("click", () => {
        const category = button.dataset.filter;
        const products = document.querySelectorAll("[data-category]");
        filters.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        products.forEach((product) => {
          const match = category === "all" || product.dataset.category === category;
          product.classList.toggle("hidden-product", !match);
        });
      });
    });
  }

  function initAccordion() {
    document.querySelectorAll(".accordion-item button").forEach((button) => {
      const item = button.closest(".accordion-item");
      if (item) {
        button.setAttribute("aria-expanded", item.classList.contains("open") ? "true" : "false");
      }
      button.addEventListener("click", () => {
        const item = button.closest(".accordion-item");
        if (!item) return;
        const isOpen = item.classList.toggle("open");
        button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    });
  }

  function initProcessActive() {
    const steps = document.querySelectorAll(".process-step");
    if (!steps.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.35 }
    );
    steps.forEach((step) => observer.observe(step));
  }

  function initForms() {
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector("button[type='submit']");
        if (!button) return;
        const original = button.textContent;
        button.textContent = "Sending...";
        button.disabled = true;

        const data = {};
        const formData = new FormData(form);
        formData.forEach((value, key) => {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
            return;
          }
          data[key] = value;
        });
        const unnamedFields = form.querySelectorAll("input[id], select[id], textarea[id]");
        unnamedFields.forEach((field) => {
          if (!field.name && field.id && field.value && !data[field.id]) data[field.id] = field.value;
        });

        try {
          await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              sourcePage: window.location.pathname,
              locale: document.documentElement.lang || "en"
            })
          });
        } catch {
          const localLeads = JSON.parse(window.localStorage.getItem("willowsoft-leads-offline") || "[]");
          localLeads.unshift({
            id: `offline-${Date.now()}`,
            status: "new",
            createdAt: new Date().toISOString(),
            sourcePage: window.location.pathname,
            ...data
          });
          window.localStorage.setItem("willowsoft-leads-offline", JSON.stringify(localLeads));
        }

        setTimeout(() => {
          form.reset();
          const lang = document.documentElement.lang || "en";
          const successTitles = {
            en: "Submission Received!",
            tr: "Talebiniz Alındı!",
            ar: "تم استلام طلبك!",
            de: "Anfrage Erhalten!",
            fr: "Demande Reçue!",
            es: "¡Solicitud Recibida!",
            it: "Richiesta Ricevuta!",
            ja: "送信が完了しました！"
          };
          const successTexts = {
            en: "Thank you for reaching out. Our engineering team will review your details and contact you shortly.",
            tr: "Bizimle iletişime geçtiğiniz için teşekkürler. Mühendislik ekibimiz detayları inceleyip en kısa sürede sizinle iletişime geçecektir.",
            ar: "نشكرك على التواصل معنا. سيقوم فريق الهندسة لدينا بمراجعة التفاصيل والاتصال بك قريباً.",
            de: "Vielen Dank für Ihre Kontaktaufnahme. Unser Engineering-Team wird Ihre Angaben prüfen und sich in Kürze mit Ihnen in Verbindung setzen.",
            fr: "Merci de nous avoir contactés. Notre équipe d'ingénierie examinera vos détails et vous contactera sous peu.",
            es: "Gracias por ponerse en contacto. Nuestro equipo de ingeniería revisará sus detalles y se comunicará con usted en breve.",
            it: "Grazie per averci contattato. Il nostro team di ingegneria esaminerà i tuoi dettagli e ti contatterà al più presto.",
            ja: "お問い合わせいただきありがとうございます。エンジニアリングチームが内容を確認し、追ってご連絡いたします。"
          };
          const successButtons = {
            en: "Send another message",
            tr: "Yeni mesaj gönder",
            ar: "إرسال رسالة أخرى",
            de: "Weitere Nachricht senden",
            fr: "Envoyer un autre message",
            es: "Enviar otro mensaje",
            it: "Invia un altro messaggio",
            ja: "別のメッセージを送る"
          };

          form.innerHTML = `
            <div class="form-success-state" style="text-align: center; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; animation: fadeIn 0.4s ease;">
              <div class="success-icon" style="width: 56px; height: 56px; border-radius: 50%; background: var(--accent-soft); display: grid; place-items: center; color: var(--accent); font-size: 1.8rem; font-weight: bold;">✓</div>
              <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--ink); margin: 0;">${successTitles[lang] || successTitles.en}</h3>
              <p style="color: var(--muted); font-size: 0.96rem; margin: 0; line-height: 1.5; max-width: 320px;">${successTexts[lang] || successTexts.en}</p>
              <button type="button" class="btn btn-secondary btn-small" onclick="window.location.reload()" style="margin-top: 10px;">${successButtons[lang] || successButtons.en}</button>
            </div>
          `;
        }, 700);
      });
    });
  }

  initMenu();
  initReveal();
  initCounters();
  initSignalCanvas();
  initFilters();
  initAccordion();
  initProcessActive();
  initForms();
})();
