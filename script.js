document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===================================
     ANNÉE AUTOMATIQUE (FOOTER)
  =================================== */

  const yearElement = document.querySelector("#year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ===================================
     BARRE DE PROGRESSION DU SCROLL
  =================================== */

  let progressTicking = false;

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    document.documentElement.style.setProperty("--progress", ratio.toFixed(4));
    progressTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!progressTicking) {
        progressTicking = true;
        requestAnimationFrame(updateProgress);
      }
    },
    { passive: true }
  );
  updateProgress();

  /* ===================================
     MENU MOBILE
  =================================== */

  const header = document.querySelector(".header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".navigation");
  const navigationLinks = document.querySelectorAll(".navigation a");

  function setMenu(open) {
    if (!navigation || !menuToggle) return;
    navigation.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(!navigation.classList.contains("open"));
  });

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  document.addEventListener("click", (event) => {
    if (header && !header.contains(event.target)) setMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 650) setMenu(false);
  });

  /* ===================================
     APPARITION PROGRESSIVE
  =================================== */

  const revealElements = document.querySelectorAll(
    ".section-heading, .about-content, .fact, .skills-intro, .skill-group, .projects-intro, .project-card, .contact-content"
  );

  if ("IntersectionObserver" in window && !reducedMotion) {
    revealElements.forEach((element) => {
      element.classList.add("reveal");

      // Décalage en cascade pour les éléments d'une même grille
      if (element.matches(".fact, .skill-group")) {
        const index = Array.from(element.parentElement.children).indexOf(element);
        element.style.transitionDelay = `${index * 90}ms`;
      }
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          element.classList.add("visible");
          observer.unobserve(element);

          // On retire le délai pour ne pas ralentir les effets de survol
          if (element.style.transitionDelay) {
            setTimeout(() => {
              element.style.transitionDelay = "";
            }, 1400);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /* ===================================
     LIEN DE NAVIGATION ACTIF
  =================================== */

  const sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navigationLinks.forEach((link) => {
            const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
            if (isCurrent) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ===================================
     INCLINAISON DU VISUEL (SOURIS)
  =================================== */

  const heroSide = document.querySelector(".hero-side");
  const heroVisual = document.querySelector(".hero-visual");
  const canTilt = window.matchMedia("(pointer: fine)").matches && !reducedMotion;

  if (heroSide && heroVisual && canTilt) {
    heroSide.addEventListener("mousemove", (event) => {
      const rect = heroSide.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.transform =
        `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });

    heroSide.addEventListener("mouseleave", () => {
      heroVisual.style.transform = "";
    });
  }

  /* ===================================
     CARTE DE CODE : EFFET « MACHINE À ÉCRIRE »
  =================================== */

  const typedCode = document.querySelector("#typed-code");

  if (typedCode && !reducedMotion) {
    const fullText = typedCode.textContent;
    typedCode.textContent = "";

    let index = 0;

    setTimeout(() => {
      const timer = setInterval(() => {
        index += 1;
        typedCode.textContent = fullText.slice(0, index);
        if (index >= fullText.length) clearInterval(timer);
      }, 45);
    }, 900);
  }

  /* ===================================
     COPIER L'EMAIL
  =================================== */

  const copyButton = document.querySelector(".copy-btn");
  const copyStatus = document.querySelector("#copy-status");

  copyButton?.addEventListener("click", async () => {
    const email = copyButton.dataset.copy;
    const label = copyButton.querySelector(".copy-label");
    const originalLabel = label.textContent;

    try {
      await navigator.clipboard.writeText(email);
      label.textContent = "Email copié !";
      if (copyStatus) copyStatus.textContent = "Adresse email copiée dans le presse-papiers.";
    } catch {
      label.textContent = email;
      if (copyStatus) copyStatus.textContent = "Copie impossible, l'adresse est affichée sur le bouton.";
    }

    setTimeout(() => {
      label.textContent = originalLabel;
      if (copyStatus) copyStatus.textContent = "";
    }, 2200);
  });
});

/* ===================================
   ANIMATION : PLUIE DE CODE
=================================== */

(() => {
  const canvas = document.querySelector("#code-rain");
  if (!canvas) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    canvas.hidden = true;
    return;
  }

  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");
  if (!ctx || !hero) return;

  const characters = Array.from("01アイウエオ{}[]<>/+=;");
  const fontSize = 15;
  const speed = 0.35;
  const frameInterval = 1000 / 30; // ~30 images par seconde

  let width = 0;
  let height = 0;
  let drops = [];
  let animationId = null;
  let lastFrame = 0;
  let heroVisible = true;

  function resizeCanvas() {
    width = hero.clientWidth;
    height = hero.clientHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const columns = Math.ceil(width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -30);
  }

  function draw(timestamp) {
    animationId = requestAnimationFrame(draw);

    if (timestamp - lastFrame < frameInterval) return;
    lastFrame = timestamp;

    // Effet de traînée (même couleur que le fond du hero)
    ctx.fillStyle = "rgba(243, 240, 232, 0.12)";
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const character = characters[Math.floor(Math.random() * characters.length)];

      // Palette du portfolio : bleu ou noir
      ctx.fillStyle = Math.random() > 0.7 ? "#315bff" : "#111111";
      ctx.globalAlpha = Math.random() * 0.6 + 0.2;
      ctx.fillText(character, i * fontSize, drops[i] * fontSize);
      ctx.globalAlpha = 1;

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i] += speed * (frameInterval / 16.67);
    }
  }

  function start() {
    if (animationId === null && heroVisible && !document.hidden) {
      lastFrame = 0;
      animationId = requestAnimationFrame(draw);
    }
  }

  function stop() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // Pause quand le hero n'est plus visible à l'écran
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      heroVisible ? start() : stop();
    }).observe(hero);
  }

  // Pause quand l'onglet est caché
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  // Redimensionnement (avec léger délai pour éviter les recalculs en rafale)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      stop();
      resizeCanvas();
      start();
    }, 150);
  });

  resizeCanvas();
  start();
})();