/* ============ CONCEPT 02 — interactions ============ */
(function () {
  "use strict";

  /* ---- Scroll reveals (transform/opacity only, no blur) ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Hero cursor-tracking parallax (the hand-made touch) ---- */
  var hero = document.querySelector(".hero");
  var layers = document.querySelectorAll("[data-depth]");
  if (!hero || !layers.length) return;

  var fine = window.matchMedia("(pointer: fine)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduce) return;

  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

  /* Portrait keeps its centering translate; compose it in */
  var portrait = document.querySelector(".hero-portrait");
  var basePortrait = "translate(-50%,-50%)";

  function renderPortrait() {
    if (portrait) {
      portrait.style.transform =
        basePortrait + " translate3d(" + (cx * 40).toFixed(2) + "px," + (cy * 40).toFixed(2) + "px,0)";
    }
  }

  function loop() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    layers.forEach(function (el) {
      if (el === portrait) return;
      var d = parseFloat(el.getAttribute("data-depth")) || 20;
      el.style.transform =
        "translate3d(" + (cx * d).toFixed(2) + "px," + (cy * d).toFixed(2) + "px,0)";
    });
    renderPortrait();
    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  }

  hero.addEventListener("mousemove", function (e) {
    var r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(loop);
  });
  hero.addEventListener("mouseleave", function () {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(loop);
  });
})();
