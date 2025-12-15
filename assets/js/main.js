/* =========================================================
   Julliane Pamfilo — CS 499 ePortfolio
   Main interaction + accessibility logic
   GitHub Pages friendly (no frameworks, no bundlers)
   ========================================================= */

/* ---------------------------------------------------------
   Utilities
--------------------------------------------------------- */

// I use small helpers to keep logic readable and predictable.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// I centralize modal open/close so behavior stays consistent.
function openModal(modal) {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

/* ---------------------------------------------------------
   HARD DISABLE SHORTCUTS MODAL (PER YOUR REQUEST)
--------------------------------------------------------- */

// I permanently remove the shortcuts modal so it can never appear.
const shortcutsModal = $("#shortcutsModal");
if (shortcutsModal) {
  shortcutsModal.remove();
}

// I also remove any leftover shortcut buttons defensively.
["shortcutsBtn", "shortcutsBtn2", "openShortcuts", "openShortcutsInline"].forEach(
  (id) => {
    const btn = document.getElementById(id);
    if (btn) btn.remove();
  }
);

/* ---------------------------------------------------------
   THEME TOGGLE
--------------------------------------------------------- */

const themeToggle = $("#themeToggle");
const root = document.documentElement;

// I store theme preference so reloads feel intentional.
function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

// Load saved theme or default to dark.
const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme =
      root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });
}

/* ---------------------------------------------------------
   RESUME MODAL
--------------------------------------------------------- */

const resumeModal = $("#resumeModal");
const resumeBtn = $("#resumeBtn");
const resumeBtn2 = $("#resumeBtn2");
const resumeImage = $("#resumeImage");

let resumePage = 1;
const resumeTotalPages = 1; // update if you add more images

function updateResume() {
  if (!resumeImage) return;
  resumeImage.src = `assets/img/resume/Julliane-Pamfilo-Resume-${resumePage}.png`;
}

// Open resume
[resumeBtn, resumeBtn2].forEach((btn) => {
  if (!btn) return;
  btn.addEventListener("click", () => openModal(resumeModal));
});

// Resume navigation
$("#resumePrev")?.addEventListener("click", () => {
  resumePage = Math.max(1, resumePage - 1);
  updateResume();
});

$("#resumeNext")?.addEventListener("click", () => {
  resumePage = Math.min(resumeTotalPages, resumePage + 1);
  updateResume();
});

/* ---------------------------------------------------------
   ARTIFACT MODAL
--------------------------------------------------------- */

const artifactModal = $("#artifactModal");
const artifactTitle = $("#artifactModalTitle");
const readmeBox = $("#readmeBox");
const artifactLinks = $("#artifactLinks");

// I attach behavior to every artifact card.
$$(".card-btn").forEach((card) => {
  card.addEventListener("click", async () => {
    const title = card.dataset.modalTitle;
    const readmePath = card.dataset.modalReadme;
    const files = JSON.parse(card.dataset.modalFiles || "[]");

    if (artifactTitle) artifactTitle.textContent = title;
    if (readmeBox) {
      readmeBox.innerHTML = "<p class='muted'>Loading README…</p>";
    }

    // Load README content safely
    try {
      const response = await fetch(readmePath);
      const text = await response.text();
      readmeBox.innerHTML = `<pre>${text}</pre>`;
    } catch {
      readmeBox.innerHTML =
        "<p class='muted'>Unable to load README.</p>";
    }

    // Populate file links
    if (artifactLinks) {
      artifactLinks.innerHTML = "";
      files.forEach((file) => {
        const link = document.createElement("a");
        link.href = file.href;
        link.textContent = file.label;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        artifactLinks.appendChild(link);
      });
    }

    openModal(artifactModal);
  });
});

/* ---------------------------------------------------------
   GLOBAL MODAL CLOSE HANDLING
--------------------------------------------------------- */

// This guarantees ALL close buttons and backdrops work.
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-close]")) {
    const modal = e.target.closest(".modal");
    closeModal(modal);
  }
});

// Escape key closes any open modal.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    $$(".modal.open").forEach(closeModal);
  }
});

/* ---------------------------------------------------------
   COPY VIDEO LINK
--------------------------------------------------------- */

const copyVideoBtn = $("#copyVideoLink");
if (copyVideoBtn) {
  copyVideoBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        "https://youtu.be/9Xwo-AlOMqo"
      );
      copyVideoBtn.textContent = "Copied!";
      setTimeout(() => (copyVideoBtn.textContent = "Copy Link"), 1500);
    } catch {
      alert("Unable to copy link.");
    }
  });
}

/* ---------------------------------------------------------
   YEAR FOOTER (OPTIONAL)
--------------------------------------------------------- */

const yearSpan = $("#year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
