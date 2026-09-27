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

  /* ---- Hero 3D: cursor tilt on desktop, scroll-driven on touch ----
     The portrait sits in front of the giant type and moves in 3D —
     tilting toward the cursor, and drifting/tilting as you scroll. */
  var hero = document.querySelector(".hero");
  var portrait = document.querySelector(".hero-portrait");
  var typeLines = document.querySelectorAll(".hero-type [data-depth]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!hero || !portrait || reduceMotion) return;

  var tx = 0, ty = 0, cx = 0, cy = 0;   // cursor target / smoothed (-0.5..0.5)
  var tsy = 0, sy = 0;                  // scroll target / smoothed (0..1)
  var raf = null;

  function apply() {
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    sy += (tsy - sy) * 0.1;

    // Portrait — hero layer: big shift + true 3D tilt + slight grow on scroll
    var px = cx * 60 + sy * 30;
    var py = cy * 40 - sy * 130;
    var rY = cx * 14 + sy * 6;
    var rX = -cy * 12 + sy * 10;
    var sc = 1 + sy * 0.07;
    portrait.style.transform =
      "translate(-50%,-50%)" +
      " translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px,0)" +
      " rotateY(" + rY.toFixed(2) + "deg)" +
      " rotateX(" + rX.toFixed(2) + "deg)" +
      " scale(" + sc.toFixed(3) + ")";

    // Type — background layer, drifts least
    typeLines.forEach(function (el) {
      var d = parseFloat(el.getAttribute("data-depth")) || 12;
      el.style.transform =
        "translate3d(" + (cx * d).toFixed(1) + "px," +
        (cy * d - sy * 34).toFixed(1) + "px,0)";
    });

    if (Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005 || Math.abs(tsy - sy) > 0.0005) {
      raf = requestAnimationFrame(apply);
    } else {
      raf = null;
    }
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(apply);
  }

  // Cursor tilt (desktop / trackpads)
  if (window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      kick();
    });
    hero.addEventListener("mouseleave", function () {
      tx = 0; ty = 0;
      kick();
    });
  }

  // Scroll-driven 3D (works everywhere, incl. touch phones)
  function onScroll() {
    var r = hero.getBoundingClientRect();
    var h = r.height || 1;
    tsy = Math.min(1, Math.max(0, -r.top / h));
    kick();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
