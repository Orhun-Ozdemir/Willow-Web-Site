export {};

const SHOW_MS = 5800;
const FADE_MS = 650;

function init() {
  const root = document.querySelector<HTMLElement>("[data-celebration]");
  if (!root) return;

  const dedupeKey = root.dataset.dedupeKey || "";
  const isPreview = root.dataset.preview === "true";
  const isEditorial = root.dataset.editorial === "true";
  let hideTimer: number | undefined;
  let fadeTimer: number | undefined;

  function play() {
    window.clearTimeout(hideTimer);
    window.clearTimeout(fadeTimer);
    root!.classList.remove("is-active", "is-leaving");
    root!.hidden = false;
    if (isEditorial) root!.classList.add("is-editorial");
    requestAnimationFrame(() => root!.classList.add("is-active"));

    hideTimer = window.setTimeout(() => {
      root!.classList.remove("is-active");
      root!.classList.add("is-leaving");
      fadeTimer = window.setTimeout(() => {
        root!.hidden = true;
        root!.classList.remove("is-leaving");
      }, FADE_MS);
    }, SHOW_MS);
  }

  // The badge in the header dispatches this to replay on demand, independent
  // of the once-per-day dedupe (see NationalDayBadge.astro).
  window.addEventListener("willow:replay-celebration", play);

  // In preview mode (triggered via Admin panel / URL parameter), always play immediately
  // and do NOT store seen status in localStorage.
  if (isPreview) {
    play();
    return;
  }

  // For live production users: play once per day per country event.
  const alreadySeenToday = !!dedupeKey && !!localStorage.getItem(dedupeKey);
  if (!dedupeKey || alreadySeenToday) return;

  try {
    localStorage.setItem(dedupeKey, "1");
  } catch (e) {
    // Graceful fallback if localStorage is disabled in private browsing
  }
  play();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
