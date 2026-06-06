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
      { threshold: 0.18 }
    );

    items.forEach((item) => observer.observe(item));
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
      button.addEventListener("click", () => {
        const item = button.closest(".accordion-item");
        if (!item) return;
        item.classList.toggle("open");
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

        const data = Object.fromEntries(new FormData(form).entries());
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
          button.textContent = "Request Received";
          form.reset();
          setTimeout(() => {
            button.textContent = original;
            button.disabled = false;
          }, 1800);
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
