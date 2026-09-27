// Sarthak Bhot portfolio — interactions

// 1. Scroll-reveal: fade/slide sections in as they enter the viewport
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // slight stagger for siblings revealed together
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(idx, 4) * 70}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// 2. Nav: solid background after scrolling + active section highlight
const nav = document.getElementById('nav');
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navAnchors
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 24);

  let current = null;
  sections.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navAnchors.forEach((a) =>
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`)
  );
}, { passive: true });

// 3. Mobile menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// 4. Subtle hero glow follows the cursor (desktop only)
const glow = document.querySelector('.hero-glow');
if (window.matchMedia('(pointer: fine)').matches && glow) {
  document.querySelector('.hero').addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    glow.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// 5. Lightbox: gallery photos open in an on-page popup
const photoLinks = [...document.querySelectorAll('.cert-photos a, .tl-photos a')];
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbPrev = document.getElementById('lightbox-prev');
const lbNext = document.getElementById('lightbox-next');
let lbGroup = [];
let lbIndex = 0;

function lbShow() {
  const link = lbGroup[lbIndex];
  const thumb = link.querySelector('img');
  lbImg.src = link.href;
  lbImg.alt = thumb.alt;
  const multi = lbGroup.length > 1;
  lbPrev.style.display = multi ? '' : 'none';
  lbNext.style.display = multi ? '' : 'none';
}

function lbOpen(link) {
  const container = link.closest('.cert-photos, .tl-photos');
  lbGroup = [...container.querySelectorAll('a')];
  lbIndex = lbGroup.indexOf(link);
  lbShow();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function lbClose() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function lbStep(dir) {
  lbIndex = (lbIndex + dir + lbGroup.length) % lbGroup.length;
  lbShow();
}

photoLinks.forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    lbOpen(a);
  })
);
lbPrev.addEventListener('click', () => lbStep(-1));
lbNext.addEventListener('click', () => lbStep(1));
lightbox.querySelectorAll('[data-lb-close]').forEach((el) =>
  el.addEventListener('click', lbClose)
);
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') lbClose();
  if (e.key === 'ArrowLeft') lbStep(-1);
  if (e.key === 'ArrowRight') lbStep(1);
});

// 6. Apple-style hero parallax: content drifts up, shrinks and fades as you scroll away
const heroInner = document.querySelector('.hero-inner');
const heroSection = document.querySelector('.hero');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let heroTicking = false;

function heroParallax() {
  const y = window.scrollY;
  const h = heroSection.offsetHeight;
  if (y <= h) {
    const p = Math.min(Math.max(y / h, 0), 1);
    // gentle drift + shrink only — no fading
    heroInner.style.transform = `translateY(${(y * 0.25).toFixed(1)}px) scale(${(1 - p * 0.05).toFixed(3)})`;
  }
  heroTicking = false;
}

// clear any faded state left over from older versions
heroInner.style.opacity = '';

if (!reduceMotion && heroInner && heroSection) {
  window.addEventListener(
    'scroll',
    () => {
      if (!heroTicking) {
        window.requestAnimationFrame(heroParallax);
        heroTicking = true;
      }
    },
    { passive: true }
  );
}
