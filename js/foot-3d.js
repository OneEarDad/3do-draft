/* ============================================================
   3D ORTHOTICS — Foot Particle Cloud (OBJ-based)
   Foot stands upright, tilted back to show plantar surface,
   spinning horizontally around Y axis.

   Each particle materializes from a nearby offset position with
   a bottom-to-top bias (~10s build), then the foot rotates and
   the cyan scan line continues sweeping plantar→dorsal.
   Color logic and spawn animation both live in the vertex shader.

   The lab page uses the experimental js/foot-3d-build.js variant
   (canvas class .foot-canvas-build) — left untouched here.
   ============================================================ */

(function () {
  function init() {
    if (typeof THREE === 'undefined' || typeof THREE.OBJLoader === 'undefined') {
      setTimeout(init, 100);
      return;
    }
    document.querySelectorAll('.foot-canvas').forEach(function (canvas) {
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
    // Positioned slightly low and back so the tilted plantar surface is in view
    camera.position.set(0, -0.4, 7.5);
    camera.lookAt(0, 0.3, 0);

    // ── Grid ─────────────────────────────────────────────
    // Soft brand-tinted grid: low opacity + light hues so it blends
    // with the white page rather than hard-edging against the particles.
    const grid = new THREE.GridHelper(6, 28, 0xbcd9ec, 0xd7e8f3);
    grid.material.transparent = true;
    grid.material.opacity = 0.45;
    grid.material.depthWrite = false;
    grid.position.y = -2.4;
    scene.add(grid);

    // ── Scan plane: horizontal band sweeping bottom → top ─
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x00aec7, transparent: true, opacity: 0.90, side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 0.007), scanMat);
    scene.add(scanPlane);

    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00aec7, transparent: true, opacity: 0.18, side: THREE.DoubleSide,
    });
    const scanGlow = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 0.22), glowMat);
    scene.add(scanGlow);

    // ── Foot group ────────────────────────────────────────
    const footGroup = new THREE.Group();
    // Tilt back ~35° so the plantar (sole) surface faces partly toward camera
    footGroup.rotation.x = 0.60;
    scene.add(footGroup);

    // ── Build-up timing ───────────────────────────────────
    const BUILD_DURATION  = 10.0; // seconds end-to-end
    const PARTICLE_FADE   = 1.4;  // seconds per-particle fly-in
    let buildStartMs      = performance.now(); // wall-clock start (reset on first OBJ load)
    let buildElapsed      = 0;    // seconds since current build started (wall-clock)
    let buildComplete     = false;
    let mat               = null; // ShaderMaterial — set after OBJ loads

    // ── Animation state ───────────────────────────────────
    let scanY = -2.2, scanDir = 1, tick = 0;
    let autoRotate = true, rotY = 0;
    let tgtRotX = 0.60, tgtRotY = 0;

    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      tgtRotY = ((e.clientX - r.left) / r.width  - 0.5) *  1.6;
      tgtRotX = ((e.clientY - r.top)  / r.height - 0.5) * -0.70 + 0.60;
      autoRotate = false;
    });
    canvas.addEventListener('mouseleave', () => { autoRotate = true; });

    function animate() {
      requestAnimationFrame(animate);
      tick += 0.01;
      // Wall-clock timing so the build completes in ~10s of real time even
      // when RAF is throttled (background tab, slow GPU, multiple WebGL ctx).
      buildElapsed = (performance.now() - buildStartMs) / 1000;

      // Push the build clock + scan position into the shader uniforms
      if (mat) {
        mat.uniforms.uTime.value = buildElapsed;
        mat.uniforms.uScanY.value = scanY;
      }

      // Mark build complete one frame after the last particle finishes
      if (!buildComplete && buildElapsed > (BUILD_DURATION + PARTICLE_FADE)) {
        buildComplete = true;
      }

      // Rotation only kicks in once the build finishes — gives the
      // materialize-then-rotate sequence the lab page validated.
      if (buildComplete) {
        if (autoRotate) {
          rotY += 0.0030;
          footGroup.rotation.y = rotY;
          footGroup.rotation.x = 0.60;
        } else {
          footGroup.rotation.y += (tgtRotY - footGroup.rotation.y) * 0.055;
          footGroup.rotation.x += (tgtRotX  - footGroup.rotation.x) * 0.055;
        }
      } else {
        footGroup.rotation.y = 0;
        footGroup.rotation.x = 0.60;
      }

      // Scan sweeps plantar → dorsal (bottom to top)
      scanY += 0.0055 * scanDir;
      if (scanY >  2.2) scanDir = -1;
      if (scanY < -2.2) scanDir =  1;

      scanPlane.position.y = scanY;
      scanGlow.position.y  = scanY;
      scanMat.opacity = 0.80 + Math.sin(tick * 4.2) * 0.16;
      glowMat.opacity = 0.13 + Math.sin(tick * 4.2) * 0.05;

      // Gentle float
      const fy = Math.sin(tick * 0.45) * 0.055;
      footGroup.position.y = fy;
      grid.position.y      = -2.4 + fy;

      renderer.render(scene, camera);
    }
    animate();

    // ── Resize (guard identical dims to avoid layout ↔ observer churn) ──
    let lastRW = 0;
    let lastRH = 0;
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      if (w === lastRW && h === lastRH) return;
      lastRW = w;
      lastRH = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(wrap);

    // ── Load OBJ ──────────────────────────────────────────
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

        // Subsample to ~19 500 particles (30% denser than the original 15k)
        const totalVerts = raw.length / 3;
        const stride = Math.max(1, Math.floor(totalVerts / 19500));

        // ── Axis remap ────────────────────────────────────
        // OBJ X (0.016–0.213): foot length  → scene Z (heel back, toe front)
        // OBJ Y (−0.183–−0.001): height     → scene Y (plantar at −Y, dorsal at +Y)
        // OBJ Z (−0.141–−0.024): width      → scene X (lateral)
        //
        // With footGroup.rotation.x = 0.60 the plantar side tilts toward camera.
        const targets = [];
        for (let i = 0; i < totalVerts; i += stride) {
          const ox = raw[i*3]   - cx;
          const oy = raw[i*3+1] - cy;
          const oz = raw[i*3+2] - cz;
          const jit = (Math.random() - 0.5) * scale * 0.004;
          targets.push(
            -oz * scale + jit,  // X
             oy * scale + jit,  // Y
             ox * scale + jit   // Z
          );
        }
        const ptCount = targets.length / 3;

        // Find Y range for bottom-to-top spawn ordering
        let tMinY =  Infinity, tMaxY = -Infinity;
        for (let i = 1; i < targets.length; i += 3) {
          const v = targets[i];
          if (v < tMinY) tMinY = v;
          if (v > tMaxY) tMaxY = v;
        }
        const yRange = (tMaxY - tMinY) || 1;

        const positions  = new Float32Array(ptCount * 3); // target = final
        const spawns     = new Float32Array(ptCount * 3); // start  = drift-in
        const spawnTimes = new Float32Array(ptCount);

        for (let i = 0; i < ptCount; i++) {
          const px = targets[i*3];
          const py = targets[i*3 + 1];
          const pz = targets[i*3 + 2];

          positions[i*3]     = px;
          positions[i*3 + 1] = py;
          positions[i*3 + 2] = pz;

          // Spawn position: random direction ~0.35–0.7 units from target,
          // biased slightly downward so the foot rises into form.
          const ang = Math.random() * Math.PI * 2;
          const rad = 0.35 + Math.random() * 0.35;
          spawns[i*3]     = px + Math.cos(ang) * rad;
          spawns[i*3 + 1] = py - Math.abs(Math.sin(ang)) * rad - 0.15;
          spawns[i*3 + 2] = pz + (Math.random() - 0.5) * rad;

          // Spawn time: 65% from Y (bottom first) + 35% randomized.
          // Math.pow(rnd, 0.7) skews early so a few scattered particles
          // appear quickly, then the wave fills in.
          const yNorm = (py - tMinY) / yRange;
          spawnTimes[i] = BUILD_DURATION * (0.65 * yNorm + 0.35 * Math.pow(Math.random(), 0.7));
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position',   new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSpawn',     new THREE.BufferAttribute(spawns, 3));
        geo.setAttribute('aSpawnTime', new THREE.BufferAttribute(spawnTimes, 1));

        // ShaderMaterial: handles both build-up animation AND the scan-line
        // color update on the GPU. Replaces the old PointsMaterial + the
        // CPU-side updateColors() loop that ran 15k particles per frame.
        mat = new THREE.ShaderMaterial({
          uniforms: {
            uTime:       { value: 0 },
            uFade:       { value: PARTICLE_FADE },
            uScanY:      { value: -2.2 },
            uSize:       { value: 0.030 }, // matches old PointsMaterial
            uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
          },
          vertexShader: `
            attribute vec3  aSpawn;
            attribute float aSpawnTime;
            uniform float uTime;
            uniform float uFade;
            uniform float uScanY;
            uniform float uSize;
            uniform float uPixelRatio;
            varying float vAlpha;
            varying vec3  vColor;

            float easeOutCubic(float x) { return 1.0 - pow(1.0 - x, 3.0); }

            void main() {
              // Build-up: ease from spawn position to target
              float dt = uTime - aSpawnTime;
              float t  = clamp(dt / uFade, 0.0, 1.0);
              float te = easeOutCubic(t);
              vec3  pos = mix(aSpawn, position, te);

              // Scan-line color (replicates old updateColors())
              vec3 cDark = vec3(0.000, 0.329, 0.616); // navy
              vec3 cTeal = vec3(0.000, 0.682, 0.780); // cyan
              vec3 cHot  = vec3(0.600, 0.920, 1.000); // bright flash
              float py  = pos.y;
              float dY  = abs(py - uScanY);
              vec3  color;
              if (dY < 0.07) {
                float f = 1.0 - dY / 0.07;
                color = mix(cTeal, cHot, f);
              } else if (dY < 0.55) {
                float f = pow(1.0 - (dY - 0.07) / 0.48, 2.0);
                color = mix(cDark, cTeal, f);
              } else if (py < uScanY) {
                color = cTeal * 0.48; // already scanned
              } else {
                color = cDark; // not yet scanned
              }
              vColor = color;
              vAlpha = t;

              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_Position  = projectionMatrix * mvPosition;
              gl_PointSize = uSize * (300.0 / -mvPosition.z) * uPixelRatio;
            }
          `,
          fragmentShader: `
            varying float vAlpha;
            varying vec3  vColor;
            void main() {
              gl_FragColor = vec4(vColor, vAlpha * 0.88);
            }
          `,
          transparent: true,
          depthWrite: false,
        });

        footGroup.add(new THREE.Points(geo, mat));
        // Reset build clock so animation starts the moment the foot is ready,
        // not when the script first ran.
        buildStartMs  = performance.now();
        buildComplete = false;
      },
      undefined,
      err => console.error('foot.obj load error:', err)
    );
  }

  init();
})();
