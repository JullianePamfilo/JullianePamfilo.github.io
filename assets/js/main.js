/*
  I kept the JavaScript intentional:
  - Theme persistence
  - Active navigation state
  - Smooth UX polish
*/

const root = document.documentElement;
const toggle = document.getElementById("themeToggle");
const links = document.querySelectorAll(".nav-link");

/* Theme persistence */
const savedTheme = localStorage.getItem("theme");
if (savedTheme) root.setAttribute("data-theme", savedTheme);

toggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

/* Active nav tracking */
const sections = [...links].map(link =>
  document.querySelector(link.getAttribute("href"))
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove("active"));
        const active = document.querySelector(
          `.nav-link[href="#${entry.target.id}"]`
        );
        active?.classList.add("active");
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(section => section && observer.observe(section));
