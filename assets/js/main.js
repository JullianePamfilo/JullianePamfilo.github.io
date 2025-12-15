/*
  I wrote this JS to keep the site clean, intentional, and professional:
  - theme is persistent
  - artifact previews load README without page reload
  - modals open only when explicitly clicked
  - no hidden keyboard popups
  - no preloaded resume behavior
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  theme: "dark",
  openModal: null,
  lastFocus: null,
  currentArtifact: null,
};

/* =========================
   Artifact Config
========================= */
const ARTIFACTS = {
  swe: {
    title: "Software Design & Engineering",
    overview:
      "I enhanced a dashboard application by improving modularity, separation of concerns, and long-term maintainability.",
    bullets: [
      "I clarified component responsibilities",
      "I reduced coupling across the system",
      "I improved validation and error handling",
      "I documented architectural decisions",
    ],
    readmePath: "./README.md",
  },
  ads: {
    title: "Algorithms & Data Structures",
    overview:
      "I optimized the course planner using data structures aligned with lookup and output requirements.",
    bullets: [
      "I selected structures with better runtime characteristics",
      "I reduced edge-case failures",
      "I justified complexity decisions",
      "I improved output clarity",
    ],
    readmePath: "./README.md",
  },
  db: {
    title: "Databases",
    overview:
      "I improved validation and data integrity while maintaining a clean separation between logic and data access.",
    bullets: [
      "I strengthened validation",
      "I isolated database access logic",
      "I reduced failure modes",
      "I documented correct usage patterns",
    ],
    readmePath: "./README.md",
  },
};

/* =========================
   Theme
========================= */
function loadTheme() {
  const saved = localStorage.getItem("theme");
  state.theme =
    saved === "light" || saved === "dark"
      ? saved
      : window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  setTheme(state.theme);
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  setTheme(state.theme === "dark" ? "light" : "dark");
}

/* =========================
   Toast
========================= */
let toastTimer = null;
function toast(message) {
  const el = $("#toast");
  if (!el) return;

  el.textContent = message;
  el.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 1800);
}

/* =========================
   Modal Helpers
========================= */
function openModal(id) {
  const modal = $(id);
  if (!modal) return;

  state.lastFocus = document.activeElement;
  state.openModal = id;

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!state.openModal) return;

  const modal = $(state.openModal);
  if (modal) modal.hidden = true;

  document.body.style.overflow = "";
  state.lastFocus?.focus?.();
  state.lastFocus = null;
  state.openModal = null;
}

/* =========================
   Artifact Modal
========================= */
function setupArtifactModal() {
  $$("[data-artifact]").forEach((btn) => {
    btn.addEventListener("click", () => openArtifact(btn.dataset.artifact));
  });

  $$("[data-close='artifact']").forEach((el) =>
    el.addEventListener("click", closeModal)
  );
}

function openArtifact(key) {
  const art = ARTIFACTS[key];
  if (!art) return;

  state.currentArtifact = key;

  $("#artifactModalTitle").textContent = art.title;
  $("#artifactOverview").textContent = art.overview;

  const ul = $("#artifactBullets");
  ul.innerHTML = "";
  art.bullets.forEach((b) => {
    const li = document.createElement("li");
    li.textContent = b;
    ul.appendChild(li);
  });

  openModal("#artifactModal");
  loadReadme(key);
}

async function loadReadme(key) {
  const art = ARTIFACTS[key];
  const container = $("#readmeContainer");
  if (!container) return;

  container.innerHTML = "<p class='muted'>Loading…</p>";

  try {
    const res = await fetch(art.readmePath, { cache: "no-store" });
    if (!res.ok) throw new Error();
    container.innerHTML = renderMarkdown(await res.text());
  } catch {
    container.innerHTML = "<p class='muted'>README not available.</p>";
  }
}

/* =========================
   Markdown Rendering
========================= */
function renderMarkdown(md) {
  return `<div class="readme">${escapeHtml(md)}</div>`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* =========================
   Misc
========================= */
function setupYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

/* =========================
   Boot
========================= */
function boot() {
  loadTheme();

  $("#themeToggle")?.addEventListener("click", toggleTheme);

  setupArtifactModal();
  setupYear();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.openModal) closeModal();
  });
}

document.addEventListener("DOMContentLoaded", boot);
