// ===================== CARROUSEL INFINI =====================
(function () {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const track   = root.querySelector("[data-track]");
  const prevBtn = root.querySelector("[data-prev]");
  const nextBtn = root.querySelector("[data-next]");
  const dotsBox = root.querySelector("[data-dots]");

  let index = 0;
  let step = 0;
  let animating = false;


  function getGapPx() {
    const cs = getComputedStyle(track);
    const g = cs.gap || cs.columnGap || "0";
    return parseFloat(g) || 0;
  }
  function measureStep() {
    const first = track.querySelector(".slide");
    if (!first) return 0;
    return first.getBoundingClientRect().width + getGapPx();
  }

  // ---- Dots ----
  function buildDots() {
    const slides = track.querySelectorAll(".slide");
    dotsBox.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Aller au projet ${i + 1}`);
      b.addEventListener("click", () => jumpTo(i));
      dotsBox.appendChild(b);
    });
    updateDots();
  }
  function updateDots() {
    const buttons = dotsBox.querySelectorAll("button");
    const total = buttons.length;
    buttons.forEach((b, i) => {
      b.setAttribute("aria-current", i === (index % total) ? "true" : "false");
    });
  }

  // ---- Animations ----
  function next() {
    if (animating) return;
    animating = true;

    // Se décale à gauche
    track.style.transition = "transform .35s ease-in-out";
    track.style.transform = `translateX(${-step}px)`;

    const onEnd = () => {
      track.removeEventListener("transitionend", onEnd);
      // réordonne : 1ère slide -> fin, puis reset transform
      const first = track.querySelector(".slide");
      if (first) track.appendChild(first);
      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      // force reflow pour nettoyer
      track.offsetHeight;

      index = (index + 1) % track.querySelectorAll(".slide").length;
      updateDots();
      animating = false;
    };
    track.addEventListener("transitionend", onEnd);
  }

  function prev() {
    if (animating) return;
    animating = true;

    // réordonne d'abord : dernière slide -> début
    const slides = track.querySelectorAll(".slide");
    const last = slides[slides.length - 1];
    if (last) track.insertBefore(last, slides[0]);

    track.style.transition = "none";
    track.style.transform = `translateX(${-step}px)`;

    track.offsetHeight;

    track.style.transition = "transform .35s ease-in-out";
    track.style.transform = "translateX(0)";

    const onEnd = () => {
      track.removeEventListener("transitionend", onEnd);
      index = (index - 1 + track.querySelectorAll(".slide").length) %
              track.querySelectorAll(".slide").length;
      updateDots();
      animating = false;
    };
    track.addEventListener("transitionend", onEnd);
  }

  // Navigation avec les dots
  function jumpTo(target) {
    const current = index;
    if (target === current || animating) return;

    // distance minimale
    const total = track.querySelectorAll(".slide").length;
    let diff = (target - current + total) % total;
    if (diff > total / 2) diff -= total;

    if (diff > 0) {
      // avance diff fois
      const run = () => { if (diff-- > 0) { next(); setTimeout(run, 380); } };
      run();
    } else {
      // recule -diff fois
      diff = -diff;
      const run = () => { if (diff-- > 0) { prev(); setTimeout(run, 380); } };
      run();
    }
  }

  // ---- Événements ----
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  window.addEventListener("resize", () => {
    step = measureStep();
  });

  // ---- Init ----
  step = measureStep();
  buildDots();
  updateDots();
})();
