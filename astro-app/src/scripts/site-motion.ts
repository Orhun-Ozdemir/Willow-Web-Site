/**
 * Site-wide motion system, powered by GSAP + ScrollTrigger.
 * - Hero entrance: kinetic char/line reveals on h1, eyebrow + lead + CTAs
 * - Scroll reveals for .reveal / .reveal-left / .reveal-right / .reveal-scale
 * - Animated counters ([data-count] / [data-company-fact])
 * - Ghost-word parallax, velocity-reactive marquees, pinned layers, cursor
 * Fully optimized with cleanups to support Astro 5.0+'s View Transitions lifecycle.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

let activeCleanup: (() => void) | null = null;
let cursorMoveHandler: ((e: PointerEvent) => void) | null = null;
let hoverElements: NodeListOf<Element> | null = null;
let growHandler: (() => void) | null = null;
let shrinkHandler: (() => void) | null = null;

export function initMotion(): void {
  // Execute cleanup on any existing motion setups first
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tell CSS that GSAP owns reveal states now (disables CSS transition fallback)
  document.documentElement.classList.add("gsap-on");

  if (reducedMotion) {
    gsap.set(".reveal, .reveal-left, .reveal-right, .reveal-scale", { clearProps: "all", opacity: 1 });
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((el) =>
      el.classList.add("visible")
    );
    initCounters(true);
    return;
  }

  initSmoothScroll();
  const introDelay = initIntro();
  initHeroEntrance(introDelay);
  initHeadingReveals();
  initScrollReveals();
  initCounters(false);
  initParallax();
  initProcessSteps();
  initMarquees();
  initLedgerRows();
  initHorizontalGallery();
  initStackPanels();
  initCursor();

  // Register unified cleanup handler
  activeCleanup = () => {
    // Kill ScrollSmoother
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.kill();
    }

    // Kill all active ScrollTriggers (prevent memory leak/ghost calculations)
    ScrollTrigger.getAll().forEach((trigger) => {
      trigger.kill();
    });

    // Remove custom cursor elements and listeners
    if (cursorMoveHandler) {
      window.removeEventListener("pointermove", cursorMoveHandler);
      cursorMoveHandler = null;
    }
    if (hoverElements && growHandler && shrinkHandler) {
      hoverElements.forEach((el) => {
        el.removeEventListener("pointerenter", growHandler!);
        el.removeEventListener("pointerleave", shrinkHandler!);
      });
      hoverElements = null;
      growHandler = null;
      shrinkHandler = null;
    }
    document.querySelectorAll(".cursor-dot, .cursor-ring").forEach((el) => el.remove());
    document.documentElement.classList.remove("has-cursor-fx", "cursor-grow", "gsap-on");
  };
}

/* ------------------------------------------------------------------ */
/* Smooth inertia scrolling (desktop pointers)                         */
/* ------------------------------------------------------------------ */
function initSmoothScroll(): void {
  if (!document.querySelector("#smooth-wrapper")) return;
  ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    effects: true,
    smoothTouch: false,
  });
}

/* ------------------------------------------------------------------ */
/* Intro curtain — once per browser session                            */
/* ------------------------------------------------------------------ */
function initIntro(): number {
  if (sessionStorage.getItem("ws-intro")) return 0;
  sessionStorage.setItem("ws-intro", "1");

  const curtain = document.createElement("div");
  curtain.className = "intro-curtain";
  curtain.setAttribute("aria-hidden", "true");
  curtain.innerHTML =
    '<span class="intro-mask"><span class="intro-mark">WILLOWSOFT<i>©</i></span></span>' +
    '<span class="intro-tag">EMBEDDED / IOT / PLATFORMS</span>';
  document.body.appendChild(curtain);

  gsap
    .timeline({ onComplete: () => curtain.remove() })
    .from(".intro-mark", { yPercent: 120, duration: 0.65, ease: "power3.out" }, 0.1)
    .from(".intro-tag", { autoAlpha: 0, duration: 0.5 }, 0.45)
    .to(".intro-mark", { yPercent: -130, duration: 0.5, ease: "power3.in" }, 1.05)
    .to(".intro-tag", { autoAlpha: 0, duration: 0.3 }, 1.05)
    .to(curtain, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, 1.3);

  return 1.45;
}

/* ------------------------------------------------------------------ */
/* Section heading reveals — masked lines rise on scroll               */
/* ------------------------------------------------------------------ */
function initHeadingReveals(): void {
  document.fonts.ready.then(() => {
    document
      .querySelectorAll<HTMLElement>(".section-head h2, .stack-head h2, .hgallery-head h2, .trust-copy h2")
      .forEach((h2) => {
        const split = SplitText.create(h2, { type: "lines", mask: "lines", linesClass: "split-line" });
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 0.95,
          stagger: 0.09,
          ease: "power4.out",
          scrollTrigger: { trigger: h2, start: "top 86%" },
        });
      });
  });
}

/* ------------------------------------------------------------------ */
/* Hero entrance                                                       */
/* ------------------------------------------------------------------ */
function initHeroEntrance(introDelay = 0): void {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const h1 = hero.querySelector("h1");
  const eyebrow = hero.querySelector(".eyebrow");
  const lead = hero.querySelector(".hero-lead, .hero-copy > p:not(.eyebrow), .hero-inner > p:not(.eyebrow)");
  const ctas = hero.querySelectorAll(".hero-ctas a, .hero-actions a");
  const stats = hero.querySelectorAll(".proof-item");
  const stage = hero.querySelector(".hero-product-stage");

  hero.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((el) => {
    el.classList.add("visible", "gsap-hero");
  });
  const pieces = [h1, eyebrow, lead, ...Array.from(ctas), ...Array.from(stats), stage].filter(Boolean) as Element[];
  pieces.forEach((el) => el.classList.add("visible", "gsap-hero"));

  gsap.set(pieces, { autoAlpha: 0 });

  document.fonts.ready.then(() => {
    const tl = gsap.timeline({ delay: introDelay, defaults: { ease: "power3.out" } });

    if (eyebrow) {
      tl.fromTo(eyebrow, { y: 24 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 0.1);
    }

    if (h1) {
      if (h1.classList.contains("kinetic-title")) {
        const split = SplitText.create(h1, {
          type: "lines,words,chars",
          mask: "lines",
          linesClass: "split-line",
          wordsClass: "split-word",
          charsClass: "split-char",
        });
        tl.set(h1, { autoAlpha: 1 }, 0.25).from(
          split.chars,
          { yPercent: 130, skewY: 5, duration: 0.9, stagger: { each: 0.012, from: "start" }, ease: "power4.out" },
          0.25
        );
      } else {
        const split = SplitText.create(h1, { type: "lines", mask: "lines", linesClass: "split-line" });
        tl.set(h1, { autoAlpha: 1 }, 0.25).from(
          split.lines,
          { yPercent: 110, duration: 1.0, stagger: 0.1, ease: "power4.out" },
          0.25
        );
      }
    }

    if (lead) {
      tl.fromTo(lead, { y: 28 }, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.75);
    }
    if (ctas.length) {
      tl.fromTo(ctas, { y: 22 }, { y: 0, autoAlpha: 1, duration: 0.65, stagger: 0.09 }, 0.95);
    }
    if (stats.length) {
      tl.fromTo(stats, { y: 26 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08 }, 1.1);
    }
    if (stage) {
      tl.fromTo(stage, { x: 48 }, { x: 0, autoAlpha: 1, duration: 1.1, ease: "power3.out" }, 0.6);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Scroll reveals                                                      */
/* ------------------------------------------------------------------ */
function initScrollReveals(): void {
  const items = gsap.utils.toArray<HTMLElement>(
    ".reveal:not(.gsap-hero), .reveal-left:not(.gsap-hero), .reveal-right:not(.gsap-hero), .reveal-scale:not(.gsap-hero)"
  );
  if (!items.length) return;

  items.forEach((el) => el.classList.add("visible"));

  const fromVars = (el: HTMLElement): gsap.TweenVars => {
    if (el.classList.contains("reveal-left")) return { x: -64, autoAlpha: 0 };
    if (el.classList.contains("reveal-right")) return { x: 64, autoAlpha: 0 };
    if (el.classList.contains("reveal-scale")) return { scale: 0.94, autoAlpha: 0 };
    return { y: 52, autoAlpha: 0 };
  };

  const delayOf = (el: HTMLElement): number => {
    for (let n = 1; n <= 6; n++) if (el.classList.contains(`delay-${n}`)) return n * 0.1;
    return 0;
  };

  items.forEach((el) => {
    gsap.from(el, {
      ...fromVars(el),
      duration: 1.0,
      delay: delayOf(el),
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Counters                                                            */
/* ------------------------------------------------------------------ */
function initCounters(instant: boolean): void {
  document.querySelectorAll<HTMLElement>("[data-count], [data-company-fact]").forEach((el) => {
    let target = 0;
    let suffix = "";
    if (el.dataset.count) {
      target = Number(el.dataset.count || 0);
      suffix = el.dataset.suffix || "";
    } else {
      const match = (el.textContent || "").trim().match(/^([\d.,]+)\s*(.*)$/);
      if (!match) return;
      target = parseFloat(match[1].replace(/,/g, ""));
      suffix = match[2];
    }

    if (instant) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }

    const counter = { value: 0 };
    gsap.to(counter, {
      value: target,
      duration: 1.4,
      ease: "power2.out",
      snap: { value: 1 },
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => {
        el.textContent = Math.round(counter.value).toLocaleString() + suffix;
      },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Parallax                                                            */
/* ------------------------------------------------------------------ */
function initParallax(): void {
  // Ghost backdrop words drift slower than scroll
  gsap.utils.toArray<HTMLElement>(".ghost-word").forEach((word) => {
    const section = word.closest("section") || word.parentElement;
    if (!section) return;
    gsap.fromTo(
      word,
      { yPercent: -18 },
      {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.2 },
      }
    );
  });

  // Floating product cards and asymmetrical visual layouts get key offsets
  gsap.utils.toArray<HTMLElement>(".floating-product, .product-card figure img, .asymmetric-offset").forEach((el) => {
    const shift = el.classList.contains("asymmetric-offset") ? 32 : 24;
    gsap.fromTo(
      el,
      { y: shift },
      {
        y: -shift,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.4 },
      }
    );
  });
}

/* ------------------------------------------------------------------ */
/* Marquees — infinite bands whose speed reacts to scroll velocity     */
/* ------------------------------------------------------------------ */
function initMarquees(): void {
  document.querySelectorAll<HTMLElement>(".marquee").forEach((marquee) => {
    const track = marquee.querySelector<HTMLElement>(".marquee-track");
    if (!track) return;

    const reverse = marquee.classList.contains("marquee-reverse");
    const tween = gsap.to(track, {
      xPercent: reverse ? 50 : -50,
      repeat: -1,
      ease: "none",
      duration: Number(marquee.dataset.speed || 28),
    });

    let speed = 1;
    ScrollTrigger.create({
      trigger: marquee,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        speed = gsap.utils.clamp(1, 4, 1 + Math.abs(self.getVelocity()) / 900);
        gsap.to(tween, { timeScale: speed, duration: 0.4, overwrite: true });
        gsap.to(tween, { timeScale: 1, duration: 1.2, delay: 0.45, overwrite: false });
      },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Ledger rows — editorial index rows with cursor-following media      */
/* ------------------------------------------------------------------ */
function initLedgerRows(): void {
  document.querySelectorAll<HTMLElement>(".ledger").forEach((ledger) => {
    const rows = ledger.querySelectorAll<HTMLElement>(".ledger-row");

    gsap.from(rows, {
      y: 54,
      autoAlpha: 0,
      duration: 0.85,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: ledger, start: "top 82%" },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Horizontal product gallery — pinned, scroll-scrubbed                */
/* ------------------------------------------------------------------ */
function initHorizontalGallery(): void {
  const section = document.querySelector<HTMLElement>(".hgallery");
  const track = section?.querySelector<HTMLElement>(".hgallery-track");
  if (!section || !track) return;

  if (window.innerWidth < 900) return;

  const getDistance = () => track.scrollWidth - section.clientWidth;

  gsap.to(track, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${getDistance()}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
}

/* ------------------------------------------------------------------ */
/* Stack panels — sticky full-width bands that pile up on scroll       */
/* ------------------------------------------------------------------ */
function initStackPanels(): void {
  if (window.innerWidth < 900) return;
  const panels = gsap.utils.toArray<HTMLElement>(".stack-panel");
  if (!panels.length) return;

  panels.forEach((panel) => {
    gsap.to(panel, {
      scale: 0.95,
      autoAlpha: 0.8,
      transformOrigin: "center top",
      ease: "none",
      scrollTrigger: {
        trigger: panel,
        start: "bottom bottom",
        end: "bottom top+=120",
        scrub: true,
      },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Custom cursor — navy dot + trailing ring, grows over interactives   */
/* ------------------------------------------------------------------ */
function initCursor(): void {
  // Remove existing cursor DOM nodes
  document.querySelectorAll(".cursor-dot, .cursor-ring").forEach((el) => el.remove());
  document.documentElement.classList.remove("has-cursor-fx", "cursor-grow");

  if (!window.matchMedia("(pointer: fine)").matches) return;

  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.append(dot, ring);
  document.documentElement.classList.add("has-cursor-fx");

  const setDotX = gsap.quickSetter(dot, "x", "px");
  const setDotY = gsap.quickSetter(dot, "y", "px");
  const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

  cursorMoveHandler = (e: PointerEvent) => {
    setDotX(e.clientX);
    setDotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
  };

  window.addEventListener("pointermove", cursorMoveHandler, { passive: true });

  growHandler = () => document.documentElement.classList.add("cursor-grow");
  shrinkHandler = () => document.documentElement.classList.remove("cursor-grow");

  hoverElements = document.querySelectorAll("a, button, [role='button'], .btn, input, select, textarea");
  hoverElements.forEach((el) => {
    el.addEventListener("pointerenter", growHandler!);
    el.addEventListener("pointerleave", shrinkHandler!);
  });
}

/* ------------------------------------------------------------------ */
/* Process steps                                                       */
/* ------------------------------------------------------------------ */
function initProcessSteps(): void {
  document.querySelectorAll(".process-step").forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: "top 70%",
      onEnter: () => step.classList.add("active"),
    });
  });
}
