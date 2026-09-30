// Sarthak Bhot portfolio — interactions

// 0. Theme: dark mode by default, toggle persisted in localStorage
const rootEl = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
function setTheme(theme) {
  rootEl.setAttribute('data-theme', theme);
  try { localStorage.setItem('sb-theme', theme); } catch (e) { /* private mode */ }
  if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#0a0b0e' : '#ffffff');
  if (themeToggle) themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}
let savedTheme = null;
try { savedTheme = localStorage.getItem('sb-theme'); } catch (e) { /* private mode */ }
setTheme(savedTheme === 'light' ? 'light' : 'dark');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    setTheme(rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
}

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
const progressBar = document.getElementById('progress');
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navAnchors
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 24);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? (window.scrollY / max).toFixed(3) : 0})`;

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

// 7. Hero terminal: types "$ whoami", prints the answer, leaves a live prompt
(function () {
  const typedEl = document.getElementById('typed');
  const outEl = document.getElementById('termOut');
  const termBody = document.querySelector('.term-body');
  if (!typedEl || !outEl || !termBody) return;
  const cmd = 'whoami';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finish = () => {
    typedEl.textContent = cmd;
    outEl.classList.add('show');
    const oldCaret = termBody.querySelector('.term-line .caret');
    if (oldCaret) oldCaret.remove();
    const next = document.createElement('div');
    next.className = 'term-line';
    next.innerHTML = '<span class="prompt">$</span><span class="caret"></span>';
    termBody.appendChild(next);
  };
  if (reduceMotion) { finish(); return; }
  let i = 0;
  setTimeout(function tick() {
    if (i <= cmd.length) {
      typedEl.textContent = cmd.slice(0, i);
      i++;
      setTimeout(tick, 55 + Math.random() * 70);
    } else {
      setTimeout(finish, 350);
    }
  }, 900);
})();

// 8. Hero particle network — drifting nodes + links, reacts to cursor (desktop only)
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('netCanvas');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, pts = [], running = false, inView = true;
  let accent = [212, 165, 106];
  const mouse = { x: -9999, y: -9999 };
  const LINK = 140, MOUSE_LINK = 175;

  const readAccent = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const m = v.match(/^#([0-9a-f]{6})$/i);
    if (m) {
      const n = parseInt(m[1], 16);
      accent = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
  };
  readAccent();
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) toggleBtn.addEventListener('click', () => setTimeout(readAccent, 0));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.offsetWidth; H = hero.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(85, Math.floor((W * H) / 15000));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8
    }));
  }

  function step() {
    ctx.clearRect(0, 0, W, H);
    const [ar, ag, ab] = accent;
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < 120 && md > 0.1) { p.x += (mdx / md) * 0.6; p.y += (mdy / md) * 0.6; }
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = 'rgba(' + ar + ',' + ag + ',' + ab + ',' + ((1 - d / LINK) * 0.32).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < MOUSE_LINK) {
        ctx.strokeStyle = 'rgba(' + ar + ',' + ag + ',' + ab + ',' + ((1 - md / MOUSE_LINK) * 0.5).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(' + ar + ',' + ag + ',' + ab + ',0.65)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    if (running) requestAnimationFrame(step);
  }

  const kick = () => { if (!running && inView && !document.hidden) { running = true; requestAnimationFrame(step); } };
  const halt = () => { running = false; };
  hero.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; inView ? kick() : halt(); }).observe(hero);
  document.addEventListener('visibilitychange', () => { document.hidden ? halt() : kick(); });
  window.addEventListener('resize', () => { resize(); kick(); });
  resize(); kick();
})();

// 9. Hacker decode effect: section headings scramble then lock in on scroll
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const titles = document.querySelectorAll('.section-title');
  if (!titles.length) return;
  const GLYPHS = '!<>-_\\/[]{}—=+*^?#';
  const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

  function decode(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue.trim()) nodes.push({ node: n, orig: n.nodeValue });
    }
    if (!nodes.length) return;
    const total = nodes.reduce((s, o) => s + o.orig.length, 0);
    const frames = Math.max(20, Math.round(total * 1.6));
    let f = 0;
    const iv = setInterval(() => {
      f++;
      const resolved = Math.floor((f / frames) * total);
      let idx = 0;
      for (const o of nodes) {
        o.node.nodeValue = o.orig.split('').map((c) => {
          const cur = idx++;
          if (c === ' ') return ' ';
          return cur < resolved ? c : pick();
        }).join('');
      }
      if (f >= frames) {
        clearInterval(iv);
        nodes.forEach((o) => { o.node.nodeValue = o.orig; });
      }
    }, 34);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { decode(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.35 });
  titles.forEach((t) => io.observe(t));
})();
