/* ============================================================
   3D ORTHOTICS: Interactive Particle Background (Canvas 2D)
   Soft floating dots that drift and respond to mouse movement.
   Inspired by antigravity.google's clean particle aesthetic.

   Canvas 2D port of the original Three.js version — visually
   identical, but no three.min.js dependency (~150 KB gzipped
   saved on any page where the foot-scan scenes aren't present).
   Uses pre-baked radial-gradient sprites + globalAlpha, which
   Chromium/Safari composite on the GPU — much lighter than
   per-frame gradients or WebGL shader dispatch for this count.

   Also:
   - Pauses on tab-hidden (visibilitychange)
   - Respects prefers-reduced-motion
   - Scales particle count to viewport (mobile gets ~40% fewer)
   ============================================================ */

(function () {
  var canvas = document.getElementById('particles-bg');
  if (!canvas) return;

  // Respect accessibility preference: users who opt out of animation at the OS
  // level (WCAG 2.3.3 — Animation from Interactions) shouldn't see the drifting
  // particles. The bubble CSS already honors this via @media (prefers-reduced-motion).
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // ── Config ────────────────────────────────────────────────
  var MOUSE_RADIUS   = 280;
  var MOUSE_STRENGTH = 0.07;
  var DRIFT_SPEED    = 0.10;
  var COLORS = [
    '#00aec7', // cyan (brand)
    '#00549d', // navy (brand)
    '#4aa8d8', // mid blue
    '#7bb8e8', // sky blue
    '#0090a8', // deep cyan
  ];

  // Viewport-scaled particle count. Keeps desktop at the original density
  // but thins mobile/tablet so small screens don't look overcrowded.
  function targetCount() {
    var w = window.innerWidth;
    if (w < 600)  return 200;  // phone
    if (w < 1024) return 340;  // tablet
    return 480;                // desktop (matches original)
  }

  // Pre-bake one glow sprite per color. drawImage is GPU-composited,
  // so this is dramatically cheaper than createRadialGradient each frame.
  var SPRITE_R = 24;           // source-sprite radius (px)
  var SPRITE_SIZE = SPRITE_R * 2;
  var sprites = COLORS.map(function (hex) {
    var s = document.createElement('canvas');
    s.width = s.height = SPRITE_SIZE;
    var sctx = s.getContext('2d');
    var g = sctx.createRadialGradient(SPRITE_R, SPRITE_R, 0, SPRITE_R, SPRITE_R, SPRITE_R);
    var rgb = hexToRgb(hex);
    g.addColorStop(0,    'rgba(' + rgb + ',1)');
    g.addColorStop(0.45, 'rgba(' + rgb + ',0.55)');
    g.addColorStop(1,    'rgba(' + rgb + ',0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    return s;
  });

  // ── Canvas sizing ─────────────────────────────────────────
  var W = 0, H = 0, dpr = 1;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ── Particles ─────────────────────────────────────────────
  var particles = [];

  function spawn() {
    var n = targetCount();
    particles.length = 0;
    for (var i = 0; i < n; i++) {
      var idx = Math.floor(Math.random() * COLORS.length);
      particles.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * DRIFT_SPEED,
        vy: (Math.random() - 0.5) * DRIFT_SPEED,
        r:  Math.random() * 2.5 + 1.0,        // 1–3.5px (matches original)
        sprite: sprites[idx],
        opacity: Math.random() * 0.45 + 0.45, // 0.45–0.90
        phase: Math.random() * Math.PI * 2,   // per-dot pulse offset
      });
    }
  }

  resize();
  spawn();

  // ── Mouse ─────────────────────────────────────────────────
  var mouse = { x: -9999, y: -9999 };
  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });
  document.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // ── Resize (debounced — respawning on every px is wasteful) ─
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var prevN = particles.length;
      resize();
      // Only respawn if the target count actually changed (e.g. crossing
      // a breakpoint); otherwise keep current particles mid-flight.
      if (targetCount() !== prevN) spawn();
    }, 200);
  });

  // ── Visibility (pause when tab hidden) ────────────────────
  // rAF throttles in hidden tabs anyway, but an explicit pause stops the
  // velocity/jitter accumulation so returning doesn't snap-jump.
  var running = true;
  document.addEventListener('visibilitychange', function () {
    var next = document.visibilityState === 'visible';
    if (!running && next) { running = true; loop(); return; }
    running = next;
  });

  // ── Animation ─────────────────────────────────────────────
  var tick = 0;

  function loop() {
    if (!running) return;
    tick += 0.01;

    ctx.clearRect(0, 0, W, H);
    // Normal alpha blend (matches the original shader, which used the default
    // source-over blend with a per-pixel soft-falloff alpha, NOT additive).
    var len = particles.length;
    for (var i = 0; i < len; i++) {
      var p = particles[i];

      // Mouse repulsion
      var dx = p.x - mouse.x;
      var dy = p.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        var force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Friction + gentle jitter
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vx += (Math.random() - 0.5) * 0.004;
      p.vy += (Math.random() - 0.5) * 0.004;

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -30)     p.x = W + 30;
      if (p.x > W + 30)  p.x = -30;
      if (p.y < -30)     p.y = H + 30;
      if (p.y > H + 30)  p.y = -30;

      // Gentle pulse
      var pulse = 1 + Math.sin(tick * 0.8 + p.phase) * 0.15;
      // Original shader: gl_PointSize = p.r * pulse * 3.0 → rendered radius
      // ~half that (≈ p.r * pulse * 1.5). Match that here so dots stay tight.
      var drawR = p.r * pulse * 1.5;
      var alpha = p.opacity * pulse;
      if (alpha > 1) alpha = 1;

      ctx.globalAlpha = alpha;
      ctx.drawImage(p.sprite, p.x - drawR, p.y - drawR, drawR * 2, drawR * 2);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }

  loop();

  // ── Utilities ─────────────────────────────────────────────
  function hexToRgb(hex) {
    var h = hex.charAt(0) === '#' ? hex.slice(1) : hex;
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return r + ',' + g + ',' + b;
  }
})();
