export {};

const SHOW_MS = 5800;
const FADE_MS = 650;

function init() {
  const root = document.querySelector<HTMLElement>("[data-celebration]");
  if (!root) return;

  const dedupeKey = root.dataset.dedupeKey || "";
  const isPreview = root.dataset.preview === "true";
  if (!dedupeKey || (!isPreview && localStorage.getItem(dedupeKey))) return;
  if (!isPreview) localStorage.setItem(dedupeKey, "1");

  root.hidden = false;
  const isEditorial = root.dataset.editorial === "true";
  if (isEditorial) root.classList.add("is-editorial");
  requestAnimationFrame(() => root.classList.add("is-active"));

  window.setTimeout(() => {
    root.classList.remove("is-active");
    root.classList.add("is-leaving");
    window.setTimeout(() => {
      root.hidden = true;
      root.classList.remove("is-leaving");
    }, FADE_MS);
  }, SHOW_MS);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
