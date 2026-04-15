/* ============================================================
   3D ORTHOTICS — Product Bubbles
   Reusable component: wave / marquee / fall variants.
   Click any bubble → full-screen pop with catalog link.

   Usage:
     <div data-bubble-variant="wave"></div>
     <div data-bubble-variant="marquee" data-count="10"></div>
     <div data-bubble-variant="fall"></div>
   ============================================================ */

(function () {
  // ── Product catalog ──────────────────────────────────────
  const PRODUCTS = [
    { name: 'Comfort Soft',     img: 'Orthotics Pics/Comfort Soft 1.jpg',             slug: 'comfort-soft',    desc: 'Cushioned everyday comfort for sensitive feet.' },
    { name: 'Diabetic Medium',  img: 'Orthotics Pics/Diabetic Medium 1.jpg',          slug: 'diabetic-medium', desc: 'Medium-density support built for diabetic foot care.' },
    { name: 'Diabetic Soft',    img: 'Orthotics Pics/Diabetic Soft 1.jpg',            slug: 'diabetic-soft',   desc: 'Maximum cushioning for at-risk diabetic patients.' },
    { name: 'Dress Elite',      img: 'Orthotics Pics/Dress Elite 1.jpg',              slug: 'dress-elite',     desc: 'Low-profile support that fits inside dress shoes.' },
    { name: 'Dress High Heel',  img: 'Orthotics Pics/Dress High Heel 1.jpg',          slug: 'dress-heel',      desc: 'Engineered for high-heel shoes without compromise.' },
    { name: 'FM Functional',    img: 'Orthotics Pics/FM Fuctional 1.jpg',             slug: 'fm-functional',   desc: 'Full-motion functional orthotic for active patients.' },
    { name: 'FM Glider',        img: 'Orthotics Pics/FM Glider 1.jpg',                slug: 'fm-glider',       desc: 'Smooth, low-friction motion control.' },
    { name: 'FM Integrated',    img: 'Orthotics Pics/FM Integrated 1.jpg',            slug: 'fm-integrated',   desc: 'Integrated support with full-motion flex.' },
    { name: 'FM Sport',         img: 'Orthotics Pics/FM Sport 1.jpg',                 slug: 'fm-sport',        desc: 'High-performance support for athletes.' },
    { name: 'FM Support',       img: 'Orthotics Pics/FM Support 1.jpg',               slug: 'fm-support',      desc: 'Maximum-structure orthotic for demanding use.' },
    { name: 'FM Trainer',       img: 'Orthotics Pics/FM Trainer 1.jpg',               slug: 'fm-trainer',      desc: 'Training-specific support with flex zones.' },
    { name: 'Motion Soft',      img: 'Orthotics Pics/Motion Soft 1.jpg',              slug: 'motion-soft',     desc: 'Dynamic cushioning for everyday movement.' },
    { name: 'PT Controller',    img: 'Orthotics Pics/PT Controller 1.jpg',            slug: 'pt-controller',   desc: 'Motion-control orthotic for physical therapy.' },
    { name: 'Smart Basic',      img: 'Orthotics Pics/Smart Basic 1.jpg',              slug: 'smart-basic',     desc: 'Entry-level support with smart biomechanics.' },
  ];

  // Repeating size pattern — sm/md/lg gives visual rhythm
  const SIZE_PATTERN = ['md','lg','sm','md','lg','sm','md','lg','md','sm','lg','md','sm','md','lg'];

  // ── Bubble factory ───────────────────────────────────────
  function makeBubble(product, size, index) {
    const a = document.createElement('a');
    a.className = 'bubble bubble--' + size;
    a.href = 'orthotics.html#' + product.slug;
    a.dataset.product = product.slug;
    a.dataset.name    = product.name;
    a.dataset.img     = product.img;
    a.dataset.desc    = product.desc;
    a.setAttribute('aria-label', product.name);

    const img = document.createElement('img');
    img.src = product.img;
    img.alt = product.name;
    img.loading = 'lazy';
    img.draggable = false;
    a.appendChild(img);

    const label = document.createElement('span');
    label.className = 'bubble__name';
    label.textContent = product.name;
    a.appendChild(label);

    return a;
  }

  // ── Variant: WAVE ────────────────────────────────────────
  // 15 bubbles in a row, each with a staggered animation-delay
  // so the wave travels down the row smoothly.
  function buildWave(container) {
    container.innerHTML = '';
    const N = PRODUCTS.length;
    const period = 3.5; // matches @keyframes bubble-bob duration
    PRODUCTS.forEach((p, i) => {
      const size = SIZE_PATTERN[i % SIZE_PATTERN.length];
      const bubble = makeBubble(p, size, i);
      // negative delay so the wave is already in motion on load
      bubble.style.animationDelay = (-(i * period / N)).toFixed(3) + 's';
      container.appendChild(bubble);
    });
  }

  // ── Variant: MARQUEE ─────────────────────────────────────
  // Two rows: top drifts left, bottom drifts right.
  // Each row's content is duplicated 2x so `translateX(-50%)`
  // creates a seamless infinite loop.
  function buildMarquee(container, count) {
    container.innerHTML = '';
    const picks = PRODUCTS.slice(0, Math.min(count || 10, PRODUCTS.length));

    const row1 = document.createElement('div');
    row1.className = 'bubble-marquee__row bubble-marquee__row--right';
    const row2 = document.createElement('div');
    row2.className = 'bubble-marquee__row bubble-marquee__row--left';
    container.appendChild(row1);
    container.appendChild(row2);

    [row1, row2].forEach((row, rowIdx) => {
      // Bottom row uses reversed order so it feels like a different lineup
      const list = rowIdx === 1 ? [...picks].reverse() : picks;
      // Duplicate 2x for seamless loop
      for (let dup = 0; dup < 2; dup++) {
        list.forEach((p, i) => {
          const size = SIZE_PATTERN[(i + rowIdx * 3) % SIZE_PATTERN.length];
          const bubble = makeBubble(p, size, i);
          // Stagger bob phase per bubble
          bubble.style.animationDelay = ((i * 0.3) % 2).toFixed(2) + 's';
          row.appendChild(bubble);
        });
      }
    });
  }

  // ── Variant: ORBIT (ring around hero scan) ───────────────
  // Bubbles circle a central element (the foot scan). Slow
  // rotation via requestAnimationFrame. Pauses when the user
  // hovers any bubble so clicks land reliably.
  function buildOrbit(container) {
    container.innerHTML = '';
    const N = PRODUCTS.length;
    const bubbles = [];
    PRODUCTS.forEach((p, i) => {
      const bubble = makeBubble(p, 'md', i);
      container.appendChild(bubble);
      bubbles.push(bubble);
    });

    let paused = false;
    bubbles.forEach((b) => {
      b.addEventListener('mouseenter', () => { paused = true; });
      b.addEventListener('mouseleave', () => { paused = false; });
    });

    let t = Math.random() * Math.PI * 2; // random starting phase
    const speed = 0.00009; // radians per ms (slow, ~45s per cycle)
    let lastTime = 0;

    function tick(time) {
      const dt = lastTime ? time - lastTime : 16;
      lastTime = time;
      if (!paused) t += dt * speed;
      const rect = container.getBoundingClientRect();
      const radius = Math.min(rect.width, rect.height) * 0.42;
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 + t - Math.PI / 2; // start at top
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        bubbles[i].style.transform =
          'translate(calc(-50% + ' + x.toFixed(1) + 'px), calc(-50% + ' + y.toFixed(1) + 'px))';
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── Variant: FALL (scroll-linked) ────────────────────────
  // Bubbles are positioned absolutely inside a container. As
  // the container enters the viewport, scroll progress drives
  // their translateY from -120% (above) to 0% (settled).
  function buildFall(container) {
    container.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'bubble-fall';
    container.appendChild(inner);

    // 5-column grid; bubbles are placed in cells with jittered positions
    const COLS = 5;
    const ROWS = Math.ceil(PRODUCTS.length / COLS);
    PRODUCTS.forEach((p, i) => {
      const size = SIZE_PATTERN[i % SIZE_PATTERN.length];
      const bubble = makeBubble(p, size, i);
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      // Jitter ±5% so the grid doesn't look rigid
      const jitterX = (Math.sin(i * 7.3) * 5);
      const jitterY = (Math.cos(i * 4.1) * 8);
      const colPct = (col + 0.5) * (100 / COLS) + jitterX;
      const rowPct = (row + 0.5) * (100 / ROWS) + jitterY;
      bubble.style.setProperty('--col', colPct + '%');
      bubble.style.setProperty('--row', rowPct + '%');
      bubble.style.setProperty('--bob-delay', ((i * 0.2) % 3).toFixed(2) + 's');
      inner.appendChild(bubble);
    });

    // Scroll-linked fall progress
    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const vh   = window.innerHeight || document.documentElement.clientHeight;
      // progress goes 0 → 1 as the container's top enters from bottom of viewport
      // and reaches the middle of the viewport
      const start = vh;           // section top at bottom of viewport
      const end   = vh * 0.35;    // section top at 35% from top
      const y = rect.top;
      let t = (start - y) / (start - end);
      t = Math.max(0, Math.min(1, t));
      inner.querySelectorAll('.bubble').forEach((b, i) => {
        // Stagger per bubble so they fall in a wave, not all at once
        const N = PRODUCTS.length;
        const staggered = Math.max(0, Math.min(1, (t - (i / N) * 0.4) / 0.6));
        b.style.setProperty('--fall-progress', staggered.toFixed(3));
      });
      if (t >= 1) inner.classList.add('is-settled');
      else inner.classList.remove('is-settled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  // ── Click pop modal ──────────────────────────────────────
  let popEl = null;
  function ensurePop() {
    if (popEl) return popEl;
    popEl = document.createElement('div');
    popEl.className = 'bubble-pop';
    popEl.setAttribute('role', 'dialog');
    popEl.setAttribute('aria-modal', 'true');
    popEl.innerHTML =
      '<div class="bubble-pop__card">' +
        '<button class="bubble-pop__close" aria-label="Close">&times;</button>' +
        '<img class="bubble-pop__img" src="" alt="">' +
        '<h3 class="bubble-pop__name"></h3>' +
        '<p class="bubble-pop__desc"></p>' +
        '<a class="bubble-pop__cta" href="#">' +
          'View in catalog' +
          '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>' +
        '</a>' +
      '</div>';
    document.body.appendChild(popEl);

    popEl.addEventListener('click', (e) => {
      if (e.target === popEl) closePop();
    });
    popEl.querySelector('.bubble-pop__close').addEventListener('click', closePop);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePop();
    });
    return popEl;
  }

  function openPop(data) {
    const el = ensurePop();
    el.querySelector('.bubble-pop__img').src = data.img;
    el.querySelector('.bubble-pop__img').alt = data.name;
    el.querySelector('.bubble-pop__name').textContent = data.name;
    el.querySelector('.bubble-pop__desc').textContent = data.desc;
    el.querySelector('.bubble-pop__cta').href = 'orthotics.html#' + data.slug;
    requestAnimationFrame(() => el.classList.add('is-open'));
  }

  function closePop() {
    if (popEl) popEl.classList.remove('is-open');
  }

  // Delegated click handler
  document.addEventListener('click', (e) => {
    const bubble = e.target.closest('.bubble');
    if (!bubble) return;
    e.preventDefault();
    openPop({
      name: bubble.dataset.name,
      img:  bubble.dataset.img,
      desc: bubble.dataset.desc,
      slug: bubble.dataset.product,
    });
  });

  // ── Init ─────────────────────────────────────────────────
  function init() {
    document.querySelectorAll('[data-bubble-variant]').forEach((el) => {
      const variant = el.dataset.bubbleVariant;
      if (variant === 'wave')         buildWave(el);
      else if (variant === 'marquee') buildMarquee(el, parseInt(el.dataset.count || '10', 10));
      else if (variant === 'fall')    buildFall(el);
      else if (variant === 'orbit')   buildOrbit(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
