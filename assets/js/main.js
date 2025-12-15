// I use this file to handle all interactive behavior
// so my HTML stays clean and semantic.

document.addEventListener("DOMContentLoaded", () => {

  // Smooth scroll for internal navigation
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      document.querySelector(link.getAttribute("href"))
        .scrollIntoView({ behavior: "smooth" });
    });
  });

  // Fade-in sections as they enter the viewport
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".section").forEach(section => {
    observer.observe(section);
  });

});

