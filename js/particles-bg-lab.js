/* ============================================================
   3D ORTHOTICS: Lab Particle Background
   LAB-ONLY variant of particles-bg.js. Identical resting state
   plus a "flow into foot" mode used by lab.html. The production
   particles-bg.js is intentionally untouched.

   Behavior:
     • Idle: particles drift like the live site
     • startLabBuild(): particles flow toward the foot canvas
       region and fade as they enter the convergence zone
   ============================================================ */

(function () {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('particles-bg');
  if (!canvas) return;

  // ── Config (matches particles-bg.js) ──────────────────────
  const PARTICLE_COUNT = 480;
  const MOUSE_RADIUS   = 280;
  const MOUSE_STRENGTH = 0.07;
  const DRIFT_SPEED    = 0.10;
  const COLORS = [
    new THREE.Color(0x00aec7),
    new THREE.Color(0x00549d),
    new THREE.Color(0x4aa8d8),
    new THREE.Color(0x7bb8e8),
    new THREE.Color(0x0090a8),
  ];

  // ── Lab build config ──────────────────────────────────────
  const FLOW_DURATION  = 4.5;   // seconds: ramp from 0 → max attraction
  const FLOW_STRENGTH  = 0.025; // per-frame lerp toward target
  const CONVERGE_RAD   = 180;   // px: fade-out radius around foot center

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
  function spawnParticle() {
    const baseOp = Math.random() * 0.45 + 0.45;
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * DRIFT_SPEED,
      vy: (Math.random() - 0.5) * DRIFT_SPEED,
      r:  Math.random() * 2.5 + 1.0,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      baseOpacity: baseOp,
      opacity: baseOp,
      phase: Math.random() * Math.PI * 2,
    };
  }
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(spawnParticle());

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
        float glow = 1.0 - smoothstep(0.0, 0.5, d);
        glow = glow * glow;
        gl_FragColor = vec4(vColor, vAlpha * glow);
      }
    `,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ── Lab build state ───────────────────────────────────────
  let labPhase = 'idle';   // 'idle' | 'flowing'
  let labStart = 0;        // seconds (perf.now / 1000)

  function getFootCenter() {
    const fc = document.querySelector('.foot-canvas-build');
    if (!fc) return null;
    const r = fc.getBoundingClientRect();
    return {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      r: Math.min(r.width, r.height) * 0.5,
    };
  }

  function startLabBuild() {
    // Reset every particle: random position, full base opacity
    for (const p of particles) {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
      p.vx = (Math.random() - 0.5) * DRIFT_SPEED;
      p.vy = (Math.random() - 0.5) * DRIFT_SPEED;
      p.opacity = p.baseOpacity;
    }
    labPhase = 'flowing';
    labStart = performance.now() / 1000;
  }
  // Expose for lab page restart button + auto-start on load
  window.__startLabBuild = startLabBuild;

  // ── Animation ─────────────────────────────────────────────
  let tick = 0;

  function animate() {
    requestAnimationFrame(animate);
    tick += 0.01;

    // Lab flow phase: compute target + ramp
    let foot = null;
    let flowRamp = 0;
    if (labPhase === 'flowing') {
      foot = getFootCenter();
      const elapsed = (performance.now() / 1000) - labStart;
      flowRamp = Math.min(elapsed / FLOW_DURATION, 1);
      if (elapsed > FLOW_DURATION + 2) labPhase = 'idle'; // release; foot has built
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];

      // Mouse repulsion when idle (flow mode takes priority)
      if (labPhase !== 'flowing') {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Friction
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Random drift
      p.vx += (Math.random() - 0.5) * 0.004;
      p.vy += (Math.random() - 0.5) * 0.004;

      // ── Lab flow: lerp toward foot center, ramping up ──
      if (labPhase === 'flowing' && foot) {
        const dx = foot.x - p.x;
        const dy = foot.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Ramp the flow strength so it builds gradually
        const pull = FLOW_STRENGTH * flowRamp;
        p.x += dx * pull;
        p.y += dy * pull;

        // Fade as the particle enters the convergence zone
        if (dist < CONVERGE_RAD) {
          const f = dist / CONVERGE_RAD;
          p.opacity = p.baseOpacity * f * f;
        } else {
          // Slight global dim during flow so the foot reads cleanly
          p.opacity = p.baseOpacity * (1 - flowRamp * 0.2);
        }
      } else {
        // Idle: ease back to base opacity
        p.opacity += (p.baseOpacity - p.opacity) * 0.02;
      }

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges except during flow; particles converge at center instead
      if (labPhase !== 'flowing') {
        if (p.x < -30) p.x = W + 30;
        if (p.x > W + 30) p.x = -30;
        if (p.y < -30) p.y = H + 30;
        if (p.y > H + 30) p.y = -30;
      }

      // Pulse
      const pulse = 1.0 + Math.sin(tick * 0.8 + p.phase) * 0.15;

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
