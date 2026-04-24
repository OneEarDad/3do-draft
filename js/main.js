/* ============================================================
   3D ORTHOTICS: Main JS
   Custom cursor, nav, scroll reveals, FAQ, carousels
   ============================================================ */

// ── Security baseline for static hosting ────────────────────
if (location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  location.replace('https://' + location.host + location.pathname + location.search + location.hash);
}

// ── Loader ────────────────────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('done'), 800);
  }
});

// ── Custom cursor ─────────────────────────────────────────
const cursorEl = document.querySelector('.cursor');
const dot = document.querySelector('.cursor__dot');
const ring = document.querySelector('.cursor__ring');

if (cursorEl && dot && ring) {
  let mx = 0, my = 0;
  let rx = 0, ry = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  function lerp(a, b, t) { return a + (b - a) * t; }
  function tick() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    raf = requestAnimationFrame(tick);
  }
  tick();

  document.addEventListener('mouseleave', () => { cursorEl.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursorEl.style.opacity = '1'; });
}

// ── Navigation ────────────────────────────────────────────
const nav = document.querySelector('.nav');
let lastScroll = 0;
let scrollTimer;

window.addEventListener('scroll', () => {
  const current = window.scrollY;

  if (current > 60) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');

  if (current > lastScroll + 5 && current > 200) {
    nav.classList.add('hidden');
  } else if (current < lastScroll - 5) {
    nav.classList.remove('hidden');
  }
  lastScroll = current;
}, { passive: true });

// Mark active nav link
const navLinks = document.querySelectorAll('.nav__link');
const currentPath = location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
    link.classList.add('active');
  }
});

// ── Mobile menu ───────────────────────────────────────────
const burger = document.querySelector('.nav__burger');
const mobileMenu = document.querySelector('.nav__mobile');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      // Close menu first so overflow lock is lifted before any scroll/navigation.
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';

      // If this link points to the page we're already on, navigating to the
      // same URL is a no-op that makes the tap feel broken ("I tapped Home
      // and nothing happened"). Scroll to top instead so the action is visible.
      const href = a.getAttribute('href') || '';
      const currentFile = location.pathname.split('/').pop() || 'index.html';
      const samePage = href === currentFile || (href === 'index.html' && currentFile === '');
      if (samePage) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

// ── Scroll reveal (IntersectionObserver) ─────────────────
const revealEls = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale, .stagger');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px 60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ── FAQ accordion ─────────────────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));

    // Toggle clicked
    if (!isOpen) item.classList.add('open');
  });
});


// ── Image carousels (portfolio items with multiple images) ─
document.querySelectorAll('.portfolio-item .carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel__track');
  const slides = carousel.querySelectorAll('.carousel__slide');
  const dots = carousel.querySelectorAll('.carousel__dot');
  if (!track || slides.length <= 1) return;

  let current = 0;
  let interval;

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
  }

  function startAuto() {
    interval = setInterval(() => goTo(current + 1), 3000);
  }

  function stopAuto() { clearInterval(interval); }

  const card = carousel.closest('.portfolio-card') || carousel.closest('.portfolio-item');
  card.addEventListener('mouseenter', () => { stopAuto(); startAuto(); });
  card.addEventListener('mouseleave', stopAuto);

  dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); }));
  goTo(0);
});

// ── Smooth anchor scroll ──────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Parallax subtle tilt on hero content ─────────────────
const heroContent = document.querySelector('.hero__content');
if (heroContent) {
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 8;
    const y = (e.clientY / window.innerHeight - 0.5) * 4;
    heroContent.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  }, { passive: true });
}

// ── Animated counter ──────────────────────────────────────
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    el.textContent = prefix + Math.floor(ease * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, +el.dataset.count, 1800);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat__num[data-count]').forEach(el => statObserver.observe(el));

// ── Live counter (e.g. "Veterans Served") ────────────────
// Computes the current count from (elapsed days since start) × rate, so the
// displayed base stays plausible across visits without manual updates. After
// the initial count-up animation, ticks +1 every `data-tick-ms` for a visible
// "always growing" feel. This is a demo counter, not a source of truth.
document.querySelectorAll('.stat__num[data-count-live]').forEach(el => {
  const startMs = new Date(el.dataset.startDate).getTime();
  const perDay  = parseFloat(el.dataset.perDay) || 0;
  const tickMs  = parseInt(el.dataset.tickMs, 10) || 60000;
  const suffix  = el.dataset.suffix || '';
  const prefix  = el.dataset.prefix || '';
  const elapsedDays = (Date.now() - startMs) / 86400000;
  let live = Math.max(0, Math.floor(elapsedDays * perDay));
  const format = (n) => prefix + n.toLocaleString() + suffix;

  const liveObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(el, live, 2400);
      setTimeout(() => {
        el.textContent = format(live);
        setInterval(() => {
          live += 1;
          el.textContent = format(live);
        }, tickMs);
      }, 2500);
      liveObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  liveObserver.observe(el);
});
