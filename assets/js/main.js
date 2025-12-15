/*
  Cleaned JS (Shortcuts popup fully removed)
  - theme persistence
  - accessible modals (artifact + resume + perf)
  - README fetch without reload
  - resume navigation
  - performance panel
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  theme: "dark",
  openModal: null, // "artifact" | "resume" | "perf"
  lastFocus: null,
  resumePage: 1,
  resumePages: 2,
  currentArtifact: null,
};

const ARTIFACTS = {
  swe: {
    title: "Software Design & Engineering",
    overview:
      "Enhanced modularity, separation of concerns, and maintainability.",
    bullets: [
      "Clarified responsibilities",
      "Reduced coupling",
      "Improved validation",
      "Professional documentation",
    ],
    readmePath: "./README.md",
  },
  ads: {
    title: "Algorithms & Data Structures",
    overview:
      "Optimized performance through correct data structure selection.",
    bullets: [
      "Efficient lookup",
      "Deterministic output",
      "Runtime justification",
      "Cleaner user flow",
    ],
    readmePath: "./README.md",
  },
  db: {
    title: "Databases",
    overview:
      "Improved validation, integrity, and predictable CRUD behavior.",
    bullets: [
      "Stronger validation",
      "Isolated data access",
      "Reduced failure modes",
      "Clear usage documentation",
    ],
    readmePath: "./README.md",
  },
};

/* =========================
   Theme
========================= */
function loadTheme() {
  const saved = localStorage.getItem("theme");
  state.theme = saved || "dark";
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
   Mobile Menu
========================= */
function setupMobileMenu() {
  const btn = $("#mobileMenuBtn");
  const menu = $("#mobileMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
  });
}

/* =========================
   Modal Helpers
========================= */
function openModal(kind) {
  const map = {
    artifact: $("#artifactModal"),
    resume: $("#resumeModal"),
    perf: $("#perfModal"),
  };
  const el = map[kind];
  if (!el) return;

  state.lastFocus = document.activeElement;
  state.openModal = kind;
  el.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal(kind) {
  const map = {
    artifact: $("#artifactModal"),
    resume: $("#resumeModal"),
    perf: $("#perfModal"),
  };
  const el = map[kind];
  if (!el) return;

  el.hidden = true;
  state.openModal = null;
  document.body.style.overflow = "";
  state.lastFocus?.focus?.();
}

/* =========================
   Artifact Modal
========================= */
function setupArtifactModal() {
  $$("[data-artifact]").forEach((btn) => {
    btn.addEventListener("click", () => openArtifact(btn.dataset.artifact));
  });

  $$("[data-close='artifact']").forEach((el) =>
    el.addEventListener("click", () => closeModal("artifact"))
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

  openModal("artifact");
}

/* =========================
   Resume Modal
========================= */
function setupResumeModal() {
  ["#resumeBtn", "#resumeBtn2"]
    .map((id) => $(id))
    .filter(Boolean)
    .forEach((btn) => btn.addEventListener("click", openResume));

  $$("[data-close='resume']").forEach((el) =>
    el.addEventListener("click", () => closeModal("resume"))
  );

  $("#prevResume")?.addEventListener("click", () =>
    setResumePage(state.resumePage - 1)
  );
  $("#nextResume")?.addEventListener("click", () =>
    setResumePage(state.resumePage + 1)
  );
}

function openResume() {
  setResumePage(1);
  openModal("resume");
}

function setResumePage(page) {
  page = Math.max(1, Math.min(state.resumePages, page));
  state.resumePage = page;

  const img = $("#resumeImage");
  if (img) img.src = `./assets/resume-page-${page}.png`;
}

/* =========================
   Performance Modal
========================= */
function setupPerfModal() {
  $("#perfBtn")?.addEventListener("click", () => {
    renderPerf();
    openModal("perf");
  });

  $$("[data-close='perf']").forEach((el) =>
    el.addEventListener("click", () => closeModal("perf"))
  );
}

function renderPerf() {
  const grid = $("#perfGrid");
  if (!grid) return;

  const nav = performance.getEntriesByType("navigation")[0];
  grid.innerHTML = `
    <div>Theme: ${state.theme}</div>
    <div>DOM Ready: ${Math.round(nav.domContentLoadedEventEnd)}ms</div>
    <div>Load: ${Math.round(nav.loadEventEnd)}ms</div>
  `;
}

/* =========================
   Global Close + Keys
========================= */
function setupGlobalKeys() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.openModal) {
      closeModal(state.openModal);
    }

    if (!state.openModal) {
      if (e.key === "t" || e.key === "T") toggleTheme();
      if (e.key === "r" || e.key === "R") openResume();
    }

    if (state.openModal === "resume") {
      if (e.key === "ArrowLeft") setResumePage(state.resumePage - 1);
      if (e.key === "ArrowRight") setResumePage(state.resumePage + 1);
    }
  });
}

/* =========================
   Boot
========================= */
function boot() {
  loadTheme();
  $("#themeBtn")?.addEventListener("click", toggleTheme);
  setupMobileMenu();
  setupArtifactModal();
  setupResumeModal();
  setupPerfModal();
  setupGlobalKeys();
}

document.addEventListener("DOMContentLoaded", boot);
