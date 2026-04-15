/* ============================================================
   3D ORTHOTICS — Interactive Particle Background
   Soft floating dots that drift and respond to mouse movement.
   Inspired by antigravity.google's clean particle aesthetic.
   ============================================================ */

(function () {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('particles-bg');
  if (!canvas) return;

  // ── Config ────────────────────────────────────────────────
  const PARTICLE_COUNT = 480;
  const MOUSE_RADIUS   = 280;
  const MOUSE_STRENGTH = 0.07;
  const DRIFT_SPEED    = 0.10;
  const COLORS = [
    new THREE.Color(0x00aec7),  // cyan (brand)
    new THREE.Color(0x00549d),  // navy (brand)
    new THREE.Color(0x4aa8d8),  // mid blue
    new THREE.Color(0x7bb8e8),  // sky blue
    new THREE.Color(0x0090a8),  // deep cyan
  ];

  // ── Setup ─────────────────────────────────────────────────
  let W = window.innerWidth;
  let H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, W, 0, H, -1, 1);

  // ── Mouse ─────────────────────────────────────────────────
  const mouse = { x: -9999, y: -9999 };
  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // ── Particles ─────────────────────────────────────────────
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * DRIFT_SPEED,
      vy: (Math.random() - 0.5) * DRIFT_SPEED,
      r:  Math.random() * 2.5 + 1.0,        // radius 1–3.5px (small compact dots)
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: Math.random() * 0.45 + 0.45,  // 0.45–0.90
      phase: Math.random() * Math.PI * 2,     // for gentle pulsing
    });
  }

  // ── Geometry ──────────────────────────────────────────────
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);
  const alphas    = new Float32Array(PARTICLE_COUNT);

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alphas, 1));

  // ── Shader (soft glowing circles) ─────────────────────────
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute float aSize;
      attribute float aAlpha;
      attribute vec3 color;
      varying float vAlpha;
      varying vec3 vColor;
      void main() {
        vAlpha = aAlpha;
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * 3.0;
        gl_Position  = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying vec3  vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        // Soft radial falloff — bright center, gentle fade
        float glow = 1.0 - smoothstep(0.0, 0.5, d);
        glow = glow * glow;  // extra softness
        gl_FragColor = vec4(vColor, vAlpha * glow);
      }
    `,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ── Animation ─────────────────────────────────────────────
  let tick = 0;

  function animate() {
    requestAnimationFrame(animate);
    tick += 0.01;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];

      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Friction
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Gentle random drift
      p.vx += (Math.random() - 0.5) * 0.004;
      p.vy += (Math.random() - 0.5) * 0.004;

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -30) p.x = W + 30;
      if (p.x > W + 30) p.x = -30;
      if (p.y < -30) p.y = H + 30;
      if (p.y > H + 30) p.y = -30;

      // Gentle pulse
      const pulse = 1.0 + Math.sin(tick * 0.8 + p.phase) * 0.15;

      // Update buffers
      positions[i * 3]     = p.x;
      positions[i * 3 + 1] = H - p.y;
      positions[i * 3 + 2] = 0;
      colors[i * 3]        = p.color.r;
      colors[i * 3 + 1]    = p.color.g;
      colors[i * 3 + 2]    = p.color.b;
      sizes[i]             = p.r * pulse;
      alphas[i]            = p.opacity * pulse;
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate    = true;
    geo.attributes.aSize.needsUpdate    = true;
    geo.attributes.aAlpha.needsUpdate   = true;

    renderer.render(scene, camera);
  }
  animate();

  // ── Resize ────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    renderer.setSize(W, H);
    camera.right  = W;
    camera.bottom = H;
    camera.updateProjectionMatrix();
  });
})();
