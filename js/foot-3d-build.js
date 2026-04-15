/* ============================================================
   3D ORTHOTICS — Foot Particle Cloud (BUILD-UP variant)

   No scan line. Particles materialize over ~10 seconds with a
   bottom-to-top bias: a few scattered first, then a wave fills
   in the rest. Each particle drifts in from a random offset
   and fades into place.

   Used by AccuScan DP. The original homepage variant lives in
   js/foot-3d.js and is intentionally untouched.

   Opt-in via canvas class `.foot-canvas-build`.
   ============================================================ */

(function () {
  function init() {
    if (typeof THREE === 'undefined' || typeof THREE.OBJLoader === 'undefined') {
      setTimeout(init, 100);
      return;
    }
    document.querySelectorAll('.foot-canvas-build').forEach(function (canvas) {
      if (canvas.dataset.foot3dReady === '1') return;
      canvas.dataset.foot3dReady = '1';
      startScene(canvas);
    });
  }

  function startScene(canvas) {
    const wrap = canvas.parentElement;
    const W = wrap.clientWidth  || 600;
    const H = wrap.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, -0.4, 7.5);
    camera.lookAt(0, 0.3, 0);

    // ── Soft grid ────────────────────────────────────────
    const grid = new THREE.GridHelper(6, 28, 0xbcd9ec, 0xd7e8f3);
    grid.material.transparent = true;
    grid.material.opacity = 0.45;
    grid.material.depthWrite = false;
    grid.position.y = -2.4;
    scene.add(grid);

    // ── Foot group ────────────────────────────────────────
    const footGroup = new THREE.Group();
    footGroup.rotation.x = 0.60;
    scene.add(footGroup);

    // ── Build-up state ────────────────────────────────────
    // Total time the build animation runs
    const BUILD_DURATION = 10.0;       // seconds, end-to-end
    const PARTICLE_FADE  = 1.4;        // seconds, per particle fly-in
    const POST_BUILD_HOLD = 4.0;       // seconds the foot stays built before rebuilds (only used if scroll re-trigger)

    let buildStartMs = 0;              // wall-clock ms when current build cycle started
    let pointsObj = null;
    let mat = null;
    let buildComplete = false;
    let postBuildTimer = 0;

    // ── Pointer rotation ──────────────────────────────────
    let autoRotate = true, rotY = 0;
    let tgtRotX = 0.60, tgtRotY = 0;

    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      tgtRotY = ((e.clientX - r.left) / r.width  - 0.5) *  1.6;
      tgtRotX = ((e.clientY - r.top)  / r.height - 0.5) * -0.70 + 0.60;
      autoRotate = false;
    });
    canvas.addEventListener('mouseleave', () => { autoRotate = true; });

    // ── Animate loop ──────────────────────────────────────
    function animate() {
      requestAnimationFrame(animate);
      // Wall-clock so the build still completes in ~10s of real time when
      // RAF is throttled (background tab, slow GPU, multiple WebGL contexts).
      const elapsed = (performance.now() - buildStartMs) / 1000;

      if (mat) {
        mat.uniforms.uTime.value = elapsed;
      }

      // Build complete check (one frame after the last particle finishes)
      if (mat && !buildComplete && elapsed > (BUILD_DURATION + PARTICLE_FADE)) {
        buildComplete = true;
        postBuildTimer = 0;
      }

      // Spin only after build completes (lets the build feel deliberate)
      if (buildComplete) {
        if (autoRotate) {
          rotY += 0.0030;
          footGroup.rotation.y = rotY;
          footGroup.rotation.x = 0.60;
        } else {
          footGroup.rotation.y += (tgtRotY - footGroup.rotation.y) * 0.055;
          footGroup.rotation.x += (tgtRotX - footGroup.rotation.x) * 0.055;
        }
      } else {
        footGroup.rotation.y = 0;
        footGroup.rotation.x = 0.60;
      }

      // Gentle float (always on)
      const fy = Math.sin(elapsed * 0.45) * 0.055;
      footGroup.position.y = fy;
      grid.position.y      = -2.4 + fy;

      renderer.render(scene, camera);
    }
    animate();

    // ── Restart build (called by Restart button or scroll re-entry) ──
    function restartBuild() {
      buildStartMs = performance.now();
      buildComplete = false;
      rotY = 0;
    }
    canvas.restartBuild = restartBuild; // expose so lab page can hook it

    // ── Resize ────────────────────────────────────────────
    let lastRW = 0, lastRH = 0;
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      if (w === lastRW && h === lastRH) return;
      lastRW = w; lastRH = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(wrap);

    // ── Load OBJ + build particle system ──────────────────
    const loader = new THREE.OBJLoader();
    loader.load(
      'foot.obj',
      function (obj) {
        const raw = [];
        obj.traverse(child => {
          if (!child.isMesh) return;
          const attr = child.geometry.getAttribute('position');
          if (!attr) return;
          for (let i = 0; i < attr.count; i++) {
            raw.push(attr.getX(i), attr.getY(i), attr.getZ(i));
          }
        });
        if (raw.length === 0) return;

        // Bounding box
        let minX=Infinity, maxX=-Infinity;
        let minY=Infinity, maxY=-Infinity;
        let minZ=Infinity, maxZ=-Infinity;
        for (let i = 0; i < raw.length; i += 3) {
          const x=raw[i], y=raw[i+1], z=raw[i+2];
          if (x<minX)minX=x; if (x>maxX)maxX=x;
          if (y<minY)minY=y; if (y>maxY)maxY=y;
          if (z<minZ)minZ=z; if (z>maxZ)maxZ=z;
        }
        const cx = (minX+maxX)*0.5;
        const cy = (minY+maxY)*0.5;
        const cz = (minZ+maxZ)*0.5;
        const scale = 3.2 / Math.max(maxX-minX, maxY-minY, maxZ-minZ);

        // Subsample to ~15 000 particles
        const totalVerts = raw.length / 3;
        const stride = Math.max(1, Math.floor(totalVerts / 15000));
        const N   = Math.ceil(totalVerts / stride);

        const positions  = new Float32Array(N * 3);
        const spawns     = new Float32Array(N * 3);
        const spawnTimes = new Float32Array(N);
        const colors     = new Float32Array(N * 3);

        // Color palette — matches the original foot-3d.js look
        // Mostly navy with a small fraction of cyan particles for accent
        const C_NAVY = { r: 0.000, g: 0.329, b: 0.616 }; // #00549d
        const C_CYAN = { r: 0.000, g: 0.682, b: 0.780 }; // #00aec7
        const C_MID  = { r: 0.000, g: 0.564, b: 0.846 }; // #0090d8 mid-blue

        // First pass: compute target positions to find scene-space Y range
        const targetPositions = [];
        for (let i = 0; i < totalVerts; i += stride) {
          const ox = raw[i*3]   - cx;
          const oy = raw[i*3+1] - cy;
          const oz = raw[i*3+2] - cz;

          // Same axis remap as foot-3d.js so the foot reads identically
          const px = -oz * scale;
          const py =  oy * scale;
          const pz =  ox * scale;
          targetPositions.push(px, py, pz);
        }

        // Find Y range for normalized timing + color gradient
        let tMinY = Infinity, tMaxY = -Infinity;
        for (let i = 1; i < targetPositions.length; i += 3) {
          const v = targetPositions[i];
          if (v < tMinY) tMinY = v;
          if (v > tMaxY) tMaxY = v;
        }
        const yRange = (tMaxY - tMinY) || 1;

        // Second pass: write attributes
        const ptCount = targetPositions.length / 3;
        for (let i = 0; i < ptCount; i++) {
          const px = targetPositions[i*3];
          const py = targetPositions[i*3 + 1];
          const pz = targetPositions[i*3 + 2];
          const jit = (Math.random() - 0.5) * scale * 0.004;

          positions[i*3]     = px + jit;
          positions[i*3 + 1] = py + jit;
          positions[i*3 + 2] = pz + jit;

          // Spawn position: drift in from a random direction ~0.4 units away
          // Bias slightly downward so it feels like rising into form
          const ang = Math.random() * Math.PI * 2;
          const rad = 0.35 + Math.random() * 0.35;
          spawns[i*3]     = px + Math.cos(ang) * rad;
          spawns[i*3 + 1] = py - Math.abs(Math.sin(ang)) * rad - 0.15;
          spawns[i*3 + 2] = pz + (Math.random() - 0.5) * rad;

          // Spawn time: 65% from Y-position (bottom first), 35% from random
          // Squared random gives a "few scattered early ones" effect
          const yNorm = (py - tMinY) / yRange;
          const rnd = Math.random();
          spawnTimes[i] = BUILD_DURATION * (0.65 * yNorm + 0.35 * Math.pow(rnd, 0.7));

          // Color: 70% navy, 25% mid-blue, 5% cyan accent — matches the
          // original "unscanned" palette so the foot reads the same.
          const r = Math.random();
          const c = (r < 0.70) ? C_NAVY : (r < 0.95) ? C_MID : C_CYAN;
          colors[i*3]     = c.r;
          colors[i*3 + 1] = c.g;
          colors[i*3 + 2] = c.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position',   new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSpawn',     new THREE.BufferAttribute(spawns, 3));
        geo.setAttribute('aSpawnTime', new THREE.BufferAttribute(spawnTimes, 1));
        geo.setAttribute('aColor',     new THREE.BufferAttribute(colors, 3));

        mat = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            // Matches PointsMaterial { size: 0.030, sizeAttenuation: true }
            uSize: { value: 0.030 },
            uFade: { value: PARTICLE_FADE },
            uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
          },
          vertexShader: `
            attribute vec3 aSpawn;
            attribute float aSpawnTime;
            attribute vec3 aColor;
            uniform float uTime;
            uniform float uSize;
            uniform float uFade;
            uniform float uPixelRatio;
            varying float vAlpha;
            varying vec3 vColor;

            float easeOutCubic(float x) {
              return 1.0 - pow(1.0 - x, 3.0);
            }

            void main() {
              float dt = uTime - aSpawnTime;
              float t = clamp(dt / uFade, 0.0, 1.0);
              float te = easeOutCubic(t);
              vec3 pos = mix(aSpawn, position, te);
              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_Position = projectionMatrix * mvPosition;
              // Replicate PointsMaterial sizeAttenuation formula
              gl_PointSize = uSize * (300.0 / -mvPosition.z) * uPixelRatio;
              vAlpha = t;
              vColor = aColor;
            }
          `,
          fragmentShader: `
            varying float vAlpha;
            varying vec3 vColor;
            void main() {
              // Square point sprite, matching original PointsMaterial look
              gl_FragColor = vec4(vColor, vAlpha * 0.88);
            }
          `,
          transparent: true,
          depthWrite: false,
        });

        pointsObj = new THREE.Points(geo, mat);
        footGroup.add(pointsObj);

        // Kick off the first build
        restartBuild();
      },
      undefined,
      err => console.error('foot.obj load error:', err)
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
