// Simple, clean scroll reveal animation
// NO modals, NO shortcuts, NO popups

const reveals = document.querySelectorAll(".section, .artifact-tile, .metric");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach(el => {
  el.classList.add("reveal");
  observer.observe(el);
});
