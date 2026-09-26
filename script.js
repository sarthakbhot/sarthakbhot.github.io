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
