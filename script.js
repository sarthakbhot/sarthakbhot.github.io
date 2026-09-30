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

// 8. Hero particle network — drifting nodes + links, reacts to cursor (all devices; lighter on touch)
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const canvas = document.getElementById('netCanvas');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, pts = [], running = false, inView = true;
  let accent = [212, 165, 106];
  const mouse = { x: -9999, y: -9999 };
  const LINK = coarse ? 110 : 140, MOUSE_LINK = 175;

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

  function seed() {
    const sp = coarse ? 0.45 : 1; // calmer drift on touch screens
    const count = coarse
      ? Math.min(36, Math.floor((W * H) / 28000))
      : Math.min(85, Math.floor((W * H) / 15000));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35 * sp, vy: (Math.random() - 0.5) * 0.35 * sp,
      r: Math.random() * 1.6 + 0.8
    }));
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nW = hero.offsetWidth, nH = hero.offsetHeight;
    // iOS fires resize when the URL bar shows/hides on scroll — don't reseed then
    const sizeChanged = Math.abs(nW - W) > 2 || Math.abs(nH - H) > 120;
    W = nW; H = nH;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!pts.length || sizeChanged) seed();
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
  if (!coarse) {
    hero.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });
  }
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

// 11. 3D tilt on project cards — cards lean toward the cursor (desktop only)
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;
  const MAX = 7; // max tilt in degrees
  cards.forEach((card) => {
    let raf = 0;
    card.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(900px) rotateX(' + (-py * MAX).toFixed(2) + 'deg)' +
          ' rotateY(' + (px * MAX).toFixed(2) + 'deg) translateY(-4px)';
      });
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      card.style.transform = '';
    });
  });
})();

// 12. DevTools console easter egg — a little hello for the curious
(function () {
  const art = String.raw` ____    _    ____ _____ _   _    _    _  __
/ ___|  / \  |  _ \_   _| | | |  / \  | |/ /
\___ \ / _ \ | |_) || | | |_| | / _ \ | ' /
 ___) / ___ \|  _ < | | |  _  |/ ___ \| . \
|____/_/   \_\_| \_\|_| |_| |_/_/   \_\_|\_\
`;
  console.log('%c' + art, 'color:#f59e0b;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.2;');
  console.log('%cCurious enough to open the console? I like that.\nLike what you see, say hi: sarthakbhot1@gmail.com',
    'color:#a1a1aa;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;');
})();

// 13. Custom cursor (desktop, fine pointers only)
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // custom cursor: amber dot + trailing ring
  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  document.documentElement.classList.add('has-custom-cursor');
  let mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    const t = e.target;
    ring.classList.toggle('is-hover', !!(t && t.closest && t.closest('a,button')));
  }, { passive: true });
  (function loop() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();
  document.documentElement.addEventListener('pointerleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });
  document.documentElement.addEventListener('pointerenter', () => {
    dot.style.opacity = ''; ring.style.opacity = '';
  });
})();

// 14. Fake terminal — press ~ to open, type commands (or tap >_ on mobile)
(function () {
  const overlay = document.getElementById('termOverlay');
  const bodyEl = document.getElementById('termBody');
  const bufEl = document.getElementById('termBuffer');
  const hidden = document.getElementById('termHidden');
  const fab = document.getElementById('termFab');
  const closeBtn = document.getElementById('termClose');
  if (!overlay || !bodyEl || !bufEl || !hidden) return;
  const PROMPT = 'sarthak:~$';
  let isOpen = false;
  const hist = []; let hIdx = -1;

  function line(text, cls) {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    bodyEl.appendChild(div);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }
  function echo(cmd) {
    const div = document.createElement('div');
    const p = document.createElement('span'); p.className = 'tx-tp'; p.textContent = PROMPT + ' ';
    div.append(p, document.createTextNode(cmd));
    bodyEl.appendChild(div);
  }
  const COMMANDS = {
    help: () => 'commands: about · skills · projects · experience · education · contact · resume · whoami · bb8 · clear · exit',
    whoami: () => 'sarthak-bhot: cs undergrad · army signals · builder of things',
    about: () => 'CS undergrad at Sheridan (AI specialization), Army Reserve Signal Operator. I build things for fun — currently a real-life BB-8 droid.',
    skills: () => 'Python · Java · C · Linux · Git · VS Code',
    projects: () => 'Wonderland — text adventure game (Java)\nBB-8 droid — in planning, Raspberry Pi + AI\nthis website — you are looking at it',
    experience: () => 'Signal Operator — Canadian Army Reserve, 2025–present\nTeam Member / Supervisor — Tim Hortons, 2024–2026',
    education: () => 'Honours BCS, AI specialization — Sheridan College, 2026–2030',
    contact: () => 'sarthakbhot1@gmail.com\nlinkedin.com/in/sarthakbhot',
    resume: () => { window.open('Sarthak-Bhot-Resume.pdf', '_blank', 'noopener'); return 'opening resume…'; },
    bb8: () => 'beep boop! build log coming soon.',
    sudo: () => 'nice try.',
    clear: () => { bodyEl.innerHTML = ''; },
    exit: () => { closeTx(); }
  };
  function run(raw) {
    echo(raw);
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    hist.push(raw); hIdx = hist.length;
    if (COMMANDS[cmd]) {
      const out = COMMANDS[cmd]();
      if (out) line(out);
    } else {
      line("command not found: " + cmd + " — try 'help'");
    }
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }
  function render() { bufEl.textContent = hidden.value; }
  function openTx() {
    isOpen = true;
    hidden.value = ''; render();
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
    if (!bodyEl.children.length) line("welcome. type 'help' to see what i can do.");
    setTimeout(() => hidden.focus(), 60);
  }
  function closeTx() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    hidden.blur();
    setTimeout(() => { overlay.hidden = true; }, 200);
  }
  hidden.addEventListener('input', render);
  hidden.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { run(hidden.value); hidden.value = ''; hIdx = hist.length; render(); }
    else if (e.key === 'Escape') { closeTx(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx > 0) { hIdx--; hidden.value = hist[hIdx]; render(); } }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIdx < hist.length - 1) { hIdx++; hidden.value = hist[hIdx]; }
      else { hIdx = hist.length; hidden.value = ''; }
      render();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (!isOpen && (e.key === '`' || e.key === '~')) { e.preventDefault(); openTx(); }
    else if (isOpen && e.key === 'Escape') { closeTx(); }
  });
  overlay.querySelector('.tx').addEventListener('click', () => hidden.focus());
  if (fab) fab.addEventListener('click', openTx);
  if (closeBtn) closeBtn.addEventListener('click', closeTx);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeTx(); });
})();


// 15. BB-8 key — press B and a droid rolls across the screen
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let rolling = false;
  document.addEventListener('keydown', (e) => {
    if (rolling) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key !== 'b' && e.key !== 'B') return;
    const term = document.getElementById('termOverlay');
    if (term && !term.hidden) return; // don't hijack typing in the terminal
    rolling = true;
    const d = document.createElement('div');
    d.className = 'bb8';
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<div class="bb8-shadow"></div><div class="bb8-body"></div><div class="bb8-head"></div>';
    document.body.appendChild(d);
    const done = () => { d.remove(); rolling = false; };
    d.addEventListener('animationend', (ev) => { if (ev.animationName === 'bb8-travel') done(); });
    setTimeout(() => { if (d.parentNode) done(); }, 6000);
  });
})();

// 16. Scramble-on-hover skill pills
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pills = document.querySelectorAll('.skill-card .pills span');
  if (!pills.length) return;
  const GLYPHS = '!<>-_\\/[]{}—=+*^?#';
  const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  pills.forEach((pill) => {
    const orig = pill.textContent;
    let busy = false;
    pill.addEventListener('pointerenter', () => {
      if (busy) return;
      busy = true;
      const chars = orig.split('');
      const frames = 10;
      let f = 0;
      const iv = setInterval(() => {
        f++;
        const resolved = Math.floor((f / frames) * chars.length);
        pill.textContent = chars.map((c, i) => (i < resolved ? c : pick())).join('');
        if (f >= frames) { clearInterval(iv); pill.textContent = orig; busy = false; }
      }, 30);
    });
  });
})();

// 17. Copy-email button with toast
(function () {
  const btn = document.getElementById('copyEmail');
  const toast = document.getElementById('toast');
  if (!btn || !toast) return;
  const EMAIL = 'sarthakbhot1@gmail.com';
  let t;
  function show(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(t);
    t = setTimeout(() => toast.classList.remove('show'), 2000);
  }
  btn.addEventListener('click', async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(EMAIL);
      ok = true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
    }
    show(ok ? 'Email copied to clipboard' : EMAIL);
    const orig = 'Copy email';
    btn.textContent = ok ? 'Copied!' : orig;
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
})();

// 18. Back-to-top button
(function () {
  const btn = document.getElementById('toTop');
  if (!btn) return;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onScroll = () => btn.classList.toggle('show', window.scrollY > 600);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
  });
})();
