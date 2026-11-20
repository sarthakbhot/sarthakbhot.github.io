// Sarthak Bhot portfolio

const rootEl = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  rootEl.setAttribute('data-theme', theme);
  if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#000000' : '#fbfbfd');
  if (themeToggle) themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

let savedTheme = null;
try { savedTheme = localStorage.getItem('sb-theme'); } catch (e) { /* private mode */ }
applyTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : systemTheme());

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('sb-theme', next); } catch (e) { /* private mode */ }
    savedTheme = next;
  });
}

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  if (savedTheme === 'light' || savedTheme === 'dark') return;
  applyTheme(e.matches ? 'light' : 'dark');
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.querySelectorAll(':scope > .reveal:not(.visible)')];
      const idx = Math.max(0, siblings.indexOf(entry.target));
      entry.target.style.transitionDelay = reduceMotion ? '0ms' : `${Math.min(idx, 5) * 70}ms`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const nav = document.getElementById('nav');
const progressBar = document.getElementById('progress');
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navAnchors
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }
    let current = null;
    sections.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  }, { passive: true });
}

const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
  const setOpen = (open) => {
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  menuBtn.addEventListener('click', () => setOpen(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

const photoLinks = [...document.querySelectorAll('.cert-photos a, .tl-photos a, .zoom-gallery a, .device a')];
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbPrev = document.getElementById('lightbox-prev');
const lbNext = document.getElementById('lightbox-next');
if (lightbox && lbImg && lbPrev && lbNext) {
  let lbGroup = [];
  let lbIndex = 0;

  function lbShow() {
    const link = lbGroup[lbIndex];
    const thumb = link.querySelector('img');
    lbImg.src = link.href;
    lbImg.alt = thumb ? thumb.alt : '';
    const multi = lbGroup.length > 1;
    lbPrev.hidden = !multi;
    lbNext.hidden = !multi;
  }
  function lbOpen(link) {
    const container = link.closest('.cert-photos, .tl-photos, .zoom-gallery, .product-stage');
    lbGroup = [...container.querySelectorAll('a')];
    lbIndex = Math.max(0, lbGroup.indexOf(link));
    lbShow();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  }
  function lbClose() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function lbStep(dir) {
    if (lbGroup.length < 2) return;
    lbIndex = (lbIndex + dir + lbGroup.length) % lbGroup.length;
    lbShow();
  }
  photoLinks.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); lbOpen(a); }));
  lbPrev.addEventListener('click', () => lbStep(-1));
  lbNext.addEventListener('click', () => lbStep(1));
  lightbox.querySelectorAll('[data-lb-close]').forEach((el) => el.addEventListener('click', lbClose));
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbStep(-1);
    if (e.key === 'ArrowRight') lbStep(1);
  });
}

const heroInner = document.querySelector('.hero-inner');
const heroSection = document.querySelector('.hero');
if (!reduceMotion && heroInner && heroSection && window.matchMedia('(pointer: fine)').matches) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const h = heroSection.offsetHeight;
      if (y <= h) {
        const p = Math.min(Math.max(y / h, 0), 1);
        heroInner.style.transform = `translateY(${(y * 0.18).toFixed(1)}px) scale(${(1 - p * 0.03).toFixed(3)})`;
      }
      ticking = false;
    });
  }, { passive: true });
}

(function () {
  const art = String.raw` ____    _    ____ _____ _   _    _    _  __
/ ___|  / \  |  _ \_   _| | | |  / \  | |/ /
\___ \ / _ \ | |_) || | | |_| | / _ \ | ' /
 ___) / ___ \|  _ < | | |  _  |/ ___ \| . \
|____/_/   \_\_| \_\|_| |_| |_/_/   \_\_|\_\
`;
  console.log('%c' + art, 'color:#2997ff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.15;');
  console.log('%cSoftware and AI. Say hi: sarthakbhot1@gmail.com', 'color:#a1a1a6;font-size:12px;');
})();

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
  const hist = [];
  let hIdx = -1;

  function line(text, cls) {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    bodyEl.appendChild(div);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }
  function echo(cmd) {
    const div = document.createElement('div');
    const p = document.createElement('span');
    p.className = 'tx-tp';
    p.textContent = PROMPT + ' ';
    div.append(p, document.createTextNode(cmd));
    bodyEl.appendChild(div);
  }
  const COMMANDS = {
    help: () => 'commands: about · skills · projects · experience · education · contact · resume · whoami · folio · clear · exit',
    whoami: () => 'sarthak-bhot: software and AI builder',
    about: () => 'Software and AI builder. CS (AI) at Sheridan College, Army Reserve Signals Operator. I build things — Folio, and a real-life BB-8.',
    skills: () => 'Python · Java · C · JavaScript · Next.js · Git · Linux',
    projects: () => 'Folio — expense tracker and budget copilot\nWonderland — text adventure (Java)\nBB-8 — in planning\nthis website',
    folio: () => { window.location.href = '/projects/folio/'; return 'opening folio…'; },
    experience: () => 'Signals Operator — Canadian Army Reserve, 2025–present\nSupervisor — Tim Hortons, 2024–2026',
    education: () => 'Honours BCS, AI — Sheridan College, 2026–2030',
    contact: () => 'sarthakbhot1@gmail.com\nlinkedin.com/in/sarthakbhot',
    resume: () => { window.open('/Sarthak-Bhot-Resume.pdf?v=3', '_blank', 'noopener'); return 'opening resume…'; },
    bb8: () => 'beep boop. build log coming soon.',
    sudo: () => 'sarthak is not in the sudoers file. this incident will be reported.',
    clear: () => { bodyEl.textContent = ''; },
    exit: () => { closeTx(); }
  };
  function run(raw) {
    echo(raw);
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    hist.push(raw);
    hIdx = hist.length;
    if (COMMANDS[cmd]) {
      const out = COMMANDS[cmd]();
      if (out) line(out);
    } else line("command not found: " + cmd + " — try 'help'");
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }
  function render() { bufEl.textContent = hidden.value; }
  function openTx() {
    isOpen = true;
    hidden.value = '';
    render();
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
    setTimeout(() => { overlay.hidden = true; }, 180);
  }
  hidden.addEventListener('input', render);
  hidden.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { run(hidden.value); hidden.value = ''; hIdx = hist.length; render(); }
    else if (e.key === 'Escape') closeTx();
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx > 0) { hIdx--; hidden.value = hist[hIdx]; render(); } }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIdx < hist.length - 1) { hIdx++; hidden.value = hist[hIdx]; }
      else { hIdx = hist.length; hidden.value = ''; }
      render();
    }
  });
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (!isOpen && (e.key === '`' || e.key === '~') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      openTx();
    } else if (isOpen && e.key === 'Escape') closeTx();
  });
  const panel = overlay.querySelector('.tx');
  if (panel) panel.addEventListener('click', () => hidden.focus());
  if (fab) fab.addEventListener('click', openTx);
  document.querySelectorAll('[data-open-terminal]').forEach((el) => el.addEventListener('click', openTx));
  if (closeBtn) closeBtn.addEventListener('click', closeTx);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeTx(); });
})();

(function () {
  if (reduceMotion) return;
  let rolling = false;
  document.addEventListener('keydown', (e) => {
    if (rolling || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key !== 'b' && e.key !== 'B') return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const term = document.getElementById('termOverlay');
    if (term && !term.hidden) return;
    rolling = true;
    const d = document.createElement('div');
    d.className = 'bb8';
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<div class="bb8-shadow"></div><div class="bb8-body"></div><div class="bb8-head"></div>';
    document.body.appendChild(d);
    const done = () => { d.remove(); rolling = false; };
    d.addEventListener('animationend', (ev) => { if (ev.animationName === 'bb8-travel') done(); });
    setTimeout(() => { if (d.isConnected) done(); }, 6000);
  });
})();

(function () {
  const btn = document.getElementById('copyEmail');
  const toast = document.getElementById('toast');
  if (!btn || !toast) return;
  const EMAIL = 'sarthakbhot1@gmail.com';
  let timer;
  function show(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 2000);
  }
  btn.addEventListener('click', async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(EMAIL);
      ok = true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-999px';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
    }
    show(ok ? 'Email copied' : EMAIL);
    btn.textContent = ok ? 'Copied' : 'Copy email';
    setTimeout(() => { btn.textContent = 'Copy email'; }, 2000);
  });
})();

(function () {
  const btn = document.getElementById('toTop');
  if (!btn) return;
  const fab = document.getElementById('termFab');
  const onScroll = () => {
    const down = window.scrollY > 640;
    btn.classList.toggle('show', down);
    if (fab) fab.classList.toggle('show', down);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
})();

(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const subject = encodeURIComponent('Note from ' + name);
    const body = encodeURIComponent(message + '\n\n— ' + name + '\n' + email);
    window.location.href = 'mailto:sarthakbhot1@gmail.com?subject=' + subject + '&body=' + body;
  });
})();

(function () {
  const root = document.getElementById('ghActivity');
  if (!root) return;
  const fallback = root.innerHTML;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4500);
  fetch('https://api.github.com/users/sarthakbhot/repos?sort=updated&per_page=12', {
    headers: { Accept: 'application/vnd.github+json' },
    signal: ctrl.signal
  }).then((res) => {
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  }).then((repos) => {
    clearTimeout(timer);
    if (!Array.isArray(repos)) throw new Error('bad');
    const list = repos.filter((r) => r && !r.fork).slice(0, 4);
    if (!list.length) return;
    root.replaceChildren();
    const grid = document.createElement('div');
    grid.className = 'gh-list';
    list.forEach((repo) => {
      const a = document.createElement('a');
      a.className = 'gh-card';
      a.href = repo.html_url;
      a.target = '_blank';
      a.rel = 'noopener';
      const h = document.createElement('h3');
      h.textContent = repo.name;
      const p = document.createElement('p');
      p.textContent = repo.description || 'Public repository';
      const meta = document.createElement('p');
      meta.className = 'gh-meta';
      const when = repo.pushed_at ? new Date(repo.pushed_at).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '';
      meta.textContent = [repo.language, when].filter(Boolean).join(' · ');
      a.append(h, p, meta);
      grid.append(a);
    });
    root.append(grid);
  }).catch(() => {
    clearTimeout(timer);
    root.innerHTML = fallback;
  });
})();
