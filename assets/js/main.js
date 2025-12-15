/*
  I wrote this JS to keep the site “product-like”:
  - theme is persistent
  - modals are accessible (focus trap + Esc close)
  - artifact previews fetch README without page reload
  - resume preview supports arrows + Esc
  - keyboard shortcuts make reviewer navigation fast
  - a small performance panel shows timing metrics
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  theme: "dark",
  openModal: null, // "artifact" | "resume" | "shortcuts" | "perf"
  lastFocus: null,
  resumePage: 1,
  resumePages: 1,
  currentArtifact: null,
};

// I keep artifact config in one place so the UI stays consistent.
const ARTIFACTS = {
  swe: {
    title: "Software Design & Engineering",
    overview:
      "I enhanced a dashboard application by improving modularity, separation of concerns, and long-term maintainability. My goal was to make the system easier to extend and safer to change.",
    bullets: [
      "I improved component boundaries and clarified responsibilities",
      "I reduced coupling so changes don’t ripple across the codebase",
      "I tightened validation and error handling for predictable behavior",
      "I documented decisions so the project reads like professional work",
    ],
    // You can point this to the exact artifact README when you have it.
    // If it 404s, my UI shows a clean fallback instead of breaking.
    readmePath: "./README.md",
  },
  ads: {
    title: "Algorithms & Data Structures",
    overview:
      "I optimized the course planner by selecting data structures that match the workload (fast lookup + deterministic output). I focused on runtime reasoning and robustness.",
    bullets: [
      "I chose structures that improve lookup time and simplify logic",
      "I normalized inputs to reduce edge-case failures",
      "I justified complexity choices with real-world usage in mind",
      "I improved output clarity and user flow",
    ],
    readmePath: "./README.md",
  },
  db: {
    title: "Databases",
    overview:
      "I strengthened validation, error handling, and data integrity while keeping a clean separation between application logic and data access logic. I aimed for safe, predictable CRUD behavior.",
    bullets: [
      "I improved data validation and error responses",
      "I kept data access isolated for maintainability and testability",
      "I reduced failure modes with explicit checks and fallbacks",
      "I documented how the database layer is used correctly",
    ],
    readmePath: "./README.md",
  },
};

/* =========================
   Theme
========================= */
function loadTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") state.theme = saved;
  else {
    // I respect system preference the first time.
    state.theme = window.matchMedia?.("(prefers-color-scheme: light)")?.matches ? "light" : "dark";
  }
  setTheme(state.theme);
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  setTheme(state.theme === "dark" ? "light" : "dark");
  toast(`Theme: ${state.theme}`);
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
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 1800);
}

/* =========================
   Mobile Menu
========================= */
function setupMobileMenu() {
  const btn = $("#mobileMenuBtn");
  const menu = $("#mobileMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isHidden = menu.hidden;
    menu.hidden = !isHidden;
    btn.setAttribute("aria-label", isHidden ? "Close menu" : "Open menu");
  });

  $$(".mobile-link", menu).forEach((a) => {
    a.addEventListener("click", () => {
      menu.hidden = true;
      btn.setAttribute("aria-label", "Open menu");
    });
  });
}

/* =========================
   Active Nav Highlight
========================= */
function setupActiveNav() {
  const links = $$(".nav-link");
  const sections = ["work", "self", "review", "artifacts", "about"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      links.forEach((l) => l.classList.remove("is-active"));
      const active = links.find((l) => l.dataset.nav === visible.target.id);
      if (active) active.classList.add("is-active");
    },
    { root: null, threshold: [0.2, 0.35, 0.5] }
  );

  sections.forEach((s) => obs.observe(s));
}

/* =========================
   Modal Helpers (focus trap)
========================= */
function openModal(kind) {
  const map = {
    artifact: $("#artifactModal"),
    resume: $("#resumeModal"),
    shortcuts: $("#shortcutsModal"),
    perf: $("#perfModal"),
  };
  const el = map[kind];
  if (!el) return;

  state.lastFocus = document.activeElement;
  state.openModal = kind;

  el.hidden = false;
  document.body.style.overflow = "hidden";

  // I move focus into the modal to keep it accessible.
  const focusable = getFocusable(el);
  (focusable[0] || el).focus?.();
}

function closeModal(kind) {
  const map = {
    artifact: $("#artifactModal"),
    resume: $("#resumeModal"),
    shortcuts: $("#shortcutsModal"),
    perf: $("#perfModal"),
  };
  const el = map[kind];
  if (!el) return;

  el.hidden = true;

  // If no modals are open, I restore scroll.
  state.openModal = null;
  document.body.style.overflow = "";

  // I return focus to where the user was.
  state.lastFocus?.focus?.();
  state.lastFocus = null;
}

function getFocusable(root) {
  const sel = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return $$(sel, root).filter((el) => !el.hasAttribute("disabled"));
}

function trapFocus(e) {
  if (!state.openModal) return;

  const modal =
    state.openModal === "artifact" ? $("#artifactModal") :
    state.openModal === "resume" ? $("#resumeModal") :
    state.openModal === "shortcuts" ? $("#shortcutsModal") :
    $("#perfModal");

  if (!modal || modal.hidden) return;

  if (e.key !== "Tab") return;

  const focusable = getFocusable(modal);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/* =========================
   Artifact Modal
========================= */
function setupArtifactModal() {
  const buttons = $$("[data-artifact]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => openArtifact(btn.dataset.artifact));
  });

  // Close handlers
  $$("[data-close='artifact']").forEach((el) => el.addEventListener("click", () => closeModal("artifact")));

  // Tabs
  const tabs = $$(".tab", $("#artifactModal"));
  tabs.forEach((t) => {
    t.addEventListener("click", () => setArtifactTab(t.dataset.tab));
  });

  $("#reloadReadmeBtn")?.addEventListener("click", () => {
    if (state.currentArtifact) loadReadme(state.currentArtifact);
  });
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

  // README link button
  const openBtn = $("#openReadmeBtn");
  if (openBtn) openBtn.href = art.readmePath;

  setArtifactTab("overview");
  openModal("artifact");

  // I prefetch README so the modal feels instant.
  loadReadme(key);
}

function setArtifactTab(tabName) {
  const modal = $("#artifactModal");
  if (!modal) return;

  const tabs = $$(".tab", modal);
  const panels = $$(".tab-panel", modal);

  tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === tabName)));
  panels.forEach((p) => (p.hidden = p.dataset.panel !== tabName));
}

async function loadReadme(key) {
  const art = ARTIFACTS[key];
  const container = $("#readmeContainer");
  if (!container || !art) return;

  container.innerHTML = `<div class="skeleton">Loading README…</div>`;

  try {
    const res = await fetch(art.readmePath, { cache: "no-store" });
    if (!res.ok) throw new Error(`README fetch failed: ${res.status}`);
    const md = await res.text();

    // I render a small subset of Markdown. It’s not perfect, but it’s clean and dependency-free.
    container.innerHTML = renderMarkdown(md);
  } catch (err) {
    container.innerHTML = `
      <div class="readme">
        <h3>README not found</h3>
        <p class="muted">
          I couldn’t load <code>${escapeHtml(art.readmePath)}</code>.
          Make sure the path exists in your repo. You can still open it directly using the “Open file” button.
        </p>
      </div>
    `;
  }
}

/* =========================
   Markdown Rendering (small subset)
========================= */
function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let inCode = false;
  let codeLang = "";

  for (const line of lines) {
    // Code fences
    const fence = line.match(/^```(\w+)?/);
    if (fence) {
      if (!inCode) {
        inCode = true;
        codeLang = fence[1] || "";
        html += `<pre><code data-lang="${escapeHtml(codeLang)}">`;
      } else {
        inCode = false;
        html += `</code></pre>`;
      }
      continue;
    }

    if (inCode) {
      html += escapeHtml(line) + "\n";
      continue;
    }

    // Headings
    if (/^###\s+/.test(line)) { html += `<h3>${inlineMd(line.replace(/^###\s+/, ""))}</h3>`; continue; }
    if (/^##\s+/.test(line)) { html += `<h2>${inlineMd(line.replace(/^##\s+/, ""))}</h2>`; continue; }
    if (/^#\s+/.test(line))  { html += `<h1>${inlineMd(line.replace(/^#\s+/, ""))}</h1>`; continue; }

    // Lists
    if (/^\s*-\s+/.test(line)) {
      // I group contiguous list items.
      if (!html.endsWith("</li>")) html += `<ul>`;
      html += `<li>${inlineMd(line.replace(/^\s*-\s+/, ""))}</li>`;
      continue;
    } else {
      if (html.endsWith("</li>")) html += `</ul>`;
    }

    // Paragraphs
    if (line.trim() === "") {
      html += "";
    } else {
      html += `<p>${inlineMd(line.trim())}</p>`;
    }
  }

  // Close list if it’s still open
  if (html.endsWith("</li>")) html += `</ul>`;

  // Wrap in readme styling container
  return `<div class="readme">${html}</div>`;
}

function inlineMd(text) {
  let s = escapeHtml(text);

  // Bold **text**
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Inline code `code`
  s = s.replace(/`(.+?)`/g, "<code>$1</code>");

  // Links [label](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer">$1</a>`);

  return s;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   Resume Modal
========================= */
function setupResumeModal() {
  const openers = ["#resumeBtn", "#resumeBtn2"].map((id) => $(id)).filter(Boolean);
  openers.forEach((b) => b.addEventListener("click", () => openResume()));

  $$("[data-close='resume']").forEach((el) => el.addEventListener("click", () => closeModal("resume")));

  $("#prevResume")?.addEventListener("click", () => setResumePage(state.resumePage - 1));
  $("#nextResume")?.addEventListener("click", () => setResumePage(state.resumePage + 1));

  // I keep resume page count configurable in case you add more PNGs.
  state.resumePages = 2; // change this if you have more pages
  $("#resumePageTotal").textContent = String(state.resumePages);
}

function openResume() {
  setResumePage(1);
  openModal("resume");
}

function setResumePage(page) {
  if (page < 1) page = 1;
  if (page > state.resumePages) page = state.resumePages;

  state.resumePage = page;

  const img = $("#resumeImage");
  const now = $("#resumePageNow");
  if (now) now.textContent = String(page);

  // I assume your resume pages are exported as PNGs:
  // assets/resume-page-1.png, assets/resume-page-2.png, etc.
  if (img) img.src = `./assets/resume-page-${page}.png`;
}

/* =========================
   Shortcuts + Perf Modals
========================= */
function setupShortcutsModal() {
  const openers = ["#shortcutsBtn", "#shortcutsBtn2", "#openShortcutsInline"]
    .map((id) => $(id))
    .filter(Boolean);

  openers.forEach((b) => b.addEventListener("click", () => openModal("shortcuts")));
  $$("[data-close='shortcuts']").forEach((el) => el.addEventListener("click", () => closeModal("shortcuts")));
}

function setupPerfModal() {
  $("#perfBtn")?.addEventListener("click", () => {
    renderPerf();
    openModal("perf");
  });

  $$("[data-close='perf']").forEach((el) => el.addEventListener("click", () => closeModal("perf")));
}

function renderPerf() {
  const grid = $("#perfGrid");
  if (!grid) return;

  const timing = performance.getEntriesByType("navigation")[0];
  const paint = performance.getEntriesByType("paint");

  const fcp = paint.find((p) => p.name === "first-contentful-paint")?.startTime;
  const dom = timing?.domContentLoadedEventEnd;
  const load = timing?.loadEventEnd;

  const items = [
    ["Theme", state.theme],
    ["FCP (ms)", fcp ? Math.round(fcp) : "n/a"],
    ["DOM Ready (ms)", dom ? Math.round(dom) : "n/a"],
    ["Load (ms)", load ? Math.round(load) : "n/a"],
  ];

  grid.innerHTML = items
    .map(
      ([name, val]) => `
        <div class="perf-item">
          <div class="perf-name">${escapeHtml(name)}</div>
          <div class="perf-val">${escapeHtml(val)}</div>
        </div>
      `
    )
    .join("");
}

/* =========================
   Close modals by backdrop + Esc
========================= */
function setupCloseHandlers() {
  const closers = $$("[data-close]");
  closers.forEach((el) => {
    el.addEventListener("click", () => {
      const kind = el.getAttribute("data-close");
      if (kind === "artifact") closeModal("artifact");
      if (kind === "resume") closeModal("resume");
      if (kind === "shortcuts") closeModal("shortcuts");
      if (kind === "perf") closeModal("perf");
    });
  });

  document.addEventListener("keydown", (e) => {
    trapFocus(e);

    if (e.key === "Escape" && state.openModal) {
      closeModal(state.openModal);
      return;
    }

    // Global shortcuts
    if (!state.openModal) {
      if (e.key === "t" || e.key === "T") toggleTheme();
      if (e.key === "r" || e.key === "R") openResume();
      if (e.key === "?" ) openModal("shortcuts");

      if (e.key === "1") openArtifact("swe");
      if (e.key === "2") openArtifact("ads");
      if (e.key === "3") openArtifact("db");
    }

    // Resume navigation (only when resume is open)
    if (state.openModal === "resume") {
      if (e.key === "ArrowLeft") setResumePage(state.resumePage - 1);
      if (e.key === "ArrowRight") setResumePage(state.resumePage + 1);
    }
  });
}

/* =========================
   Misc helpers
========================= */
function setupYear() {
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function setupCopyRepo() {
  const btn = $("#copyRepoBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied");
    } catch {
      toast("Copy failed (browser blocked it)");
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
  setupActiveNav();

  setupArtifactModal();
  setupResumeModal();
  setupShortcutsModal();
  setupPerfModal();

  setupCloseHandlers();
  setupYear();
  setupCopyRepo();
}

document.addEventListener("DOMContentLoaded", boot);
