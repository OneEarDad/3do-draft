/* ============================================================
   3D ORTHOTICS: Homepage handoff section flare
   - Icon SVG stroke-draw setup (measures each path for clean draw-in)
   - Casting card count-down (30 → 5) timed with reveal
   - Subtle 3D mouse tilt on cards (skipped on touch / reduced-motion)
   ============================================================ */

(function () {
  // 1) Stroke-draw setup: measure each icon path and set --l for a clean draw-in.
  document.querySelectorAll('.handoff-card__icon svg').forEach(svg => {
    svg.querySelectorAll('path, circle, line, polyline').forEach(el => {
      try {
        const len = Math.ceil(el.getTotalLength());
        el.style.setProperty('--l', len);
      } catch (e) {
        // Older browsers: CSS fallback dasharray of 120 already set.
      }
    });
  });

  // 1b) Node alignment: position each SVG node at the center of its card.
  // The track spans the full grid width (1100px), and the SVG viewBox is
  // 0..1000 with preserveAspectRatio="none", so cx = fraction * 1000 maps
  // directly to a fraction of the rendered track width.
  const alignHandoffNodes = () => {
    const track = document.querySelector('.handoff-flow__track');
    const nodes = document.querySelectorAll('.handoff-flow__svg .handoff-flow__node');
    const cards = document.querySelectorAll('.handoff-card');
    if (!track || nodes.length === 0 || nodes.length !== cards.length) return;
    const tr = track.getBoundingClientRect();
    if (tr.width === 0) return; // flow hidden (e.g. mobile)
    cards.forEach((card, i) => {
      const cr = card.getBoundingClientRect();
      const centerX = cr.left + cr.width / 2;
      const fraction = (centerX - tr.left) / tr.width;
      const cx = Math.max(0, Math.min(1000, fraction * 1000));
      nodes[i].setAttribute('cx', cx.toFixed(1));
    });
  };
  alignHandoffNodes();
  window.addEventListener('load', alignHandoffNodes);
  let _handoffResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_handoffResizeTimer);
    _handoffResizeTimer = setTimeout(alignHandoffNodes, 100);
  });

  // 2) Casting card count-down. Animates "30" -> "5" during the reveal window.
  const countEl = document.querySelector('.handoff-count');
  const grid = document.querySelector('.handoff-grid');
  if (countEl && grid) {
    const from = parseInt(countEl.dataset.from, 10);
    const to = parseInt(countEl.dataset.to, 10);
    // After the AFTER text slides in (~2.3s), count its number down from 30 → 5.
    const startDelay = 2400;
    const dur = 1500;

    const run = () => {
      let startedAt = null;
      const tick = (ts) => {
        if (!startedAt) startedAt = ts;
        const p = Math.min((ts - startedAt) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        countEl.textContent = Math.round(from + (to - from) * ease);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        setTimeout(run, startDelay);
        obs.unobserve(grid);
      });
    }, { threshold: 0.2 });
    obs.observe(grid);
  }

  // 3) Subtle 3D tilt on mouse (skip touch + reduced motion).
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none)').matches;
  if (!reduce && !touch) {
    document.querySelectorAll('.handoff-card').forEach(card => {
      let raf;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * 6;   // tilt X up to 6deg
        const ry = (px - 0.5) * 6;   // tilt Y up to 6deg
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `translateY(-4px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    });
  }
})();
