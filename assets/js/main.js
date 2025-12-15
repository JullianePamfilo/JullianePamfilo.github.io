/**
 * main.js
 *
 * I use this file to handle all interactive behavior for the portfolio.
 * My goal here is to keep JavaScript concerns separate from HTML structure
 * and CSS presentation, while improving usability and visual feedback.
 */

document.addEventListener("DOMContentLoaded", () => {

  /* ================================
     Smooth scrolling for internal links
     ================================ */
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href");
      const targetEl = document.querySelector(targetId);

      // I guard against broken anchors to avoid runtime errors
      if (!targetEl) return;

      event.preventDefault();
      targetEl.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });


  /* ================================
     Reveal animations on scroll
     ================================ */
  const revealSections = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // Once revealed, I stop observing for performance
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealSections.forEach(section => {
    revealObserver.observe(section);
  });


  /* ================================
     Active navigation state tracking
     ================================ */
  const navLinks = document.querySelectorAll(".nav a");
  const sections = document.querySelectorAll("section[id]");

  const setActiveNav = () => {
    let currentSection = "";

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  };

  window.addEventListener("scroll", setActiveNav);


  /* ================================
     Scroll progress indicator
     ================================ */
  const progressBar = document.createElement("div");
  progressBar.style.position = "fixed";
  progressBar.style.top = "0";
  progressBar.style.left = "0";
  progressBar.style.height = "3px";
  progressBar.style.width = "0%";
  progressBar.style.background = "linear-gradient(90deg, #7c9cff, #a78bfa)";
  progressBar.style.zIndex = "9999";
  document.body.appendChild(progressBar);

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  };

  window.addEventListener("scroll", updateProgress);


  /* ================================
     Accessibility & reduced motion
     ================================ */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (prefersReducedMotion.matches) {
    // If the user prefers reduced motion, I disable animations
    revealSections.forEach(section => {
      section.classList.add("active");
    });
    progressBar.style.display = "none";
  }

});

