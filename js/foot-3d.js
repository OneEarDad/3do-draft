/* ============================================================
   3D ORTHOTICS — Foot Particle Cloud (OBJ-based)
   Foot stands upright, tilted back to show plantar surface,
   spinning horizontally around Y axis.
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
    const grid = new THREE.GridHelper(6, 28, 0x00549d, 0x4aa8d8);
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

    // ── Color palette ─────────────────────────────────────
    const C_DARK = { r: 0.000, g: 0.329, b: 0.616 }; // #00549d
    const C_TEAL = { r: 0.000, g: 0.682, b: 0.780 }; // #00aec7
    const C_HOT  = { r: 0.600, g: 0.920, b: 1.000 }; // bright flash

    function lerp(a, b, t) { return a + (b - a) * t; }

    // ── Animation state ───────────────────────────────────
    let scanY = -2.2, scanDir = 1, tick = 0;
    let autoRotate = true, rotY = 0;
    let tgtRotX = 0.60, tgtRotY = 0;
    let posAttr = null, colAttr = null, ptCount = 0;

    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      tgtRotY = ((e.clientX - r.left) / r.width  - 0.5) *  1.6;
      tgtRotX = ((e.clientY - r.top)  / r.height - 0.5) * -0.70 + 0.60;
      autoRotate = false;
    });
    canvas.addEventListener('mouseleave', () => { autoRotate = true; });

    function updateColors(scanY) {
      if (!colAttr) return;
      const pos = posAttr.array;
      const col = colAttr.array;
      for (let i = 0; i < ptCount; i++) {
        const py = pos[i * 3 + 1];
        const dY = Math.abs(py - scanY);
        let r, g, b;
        if (dY < 0.07) {
          const f = 1 - dY / 0.07;
          r = lerp(C_TEAL.r, C_HOT.r, f);
          g = lerp(C_TEAL.g, C_HOT.g, f);
          b = lerp(C_TEAL.b, C_HOT.b, f);
        } else if (dY < 0.55) {
          const f = Math.pow(1 - (dY - 0.07) / 0.48, 2);
          r = lerp(C_DARK.r, C_TEAL.r, f);
          g = lerp(C_DARK.g, C_TEAL.g, f);
          b = lerp(C_DARK.b, C_TEAL.b, f);
        } else if (py < scanY) {
          // Already scanned — dim teal
          r = C_TEAL.r * 0.48; g = C_TEAL.g * 0.48; b = C_TEAL.b * 0.48;
        } else {
          // Not yet scanned — dark navy
          r = C_DARK.r; g = C_DARK.g; b = C_DARK.b;
        }
        col[i * 3]     = r;
        col[i * 3 + 1] = g;
        col[i * 3 + 2] = b;
      }
      colAttr.needsUpdate = true;
    }

    function animate() {
      requestAnimationFrame(animate);
      tick += 0.01;

      if (autoRotate) {
        // Spin horizontally around Y, keep tilt fixed
        rotY += 0.0030;
        footGroup.rotation.y = rotY;
        footGroup.rotation.x = 0.60;
      } else {
        footGroup.rotation.y += (tgtRotY - footGroup.rotation.y) * 0.055;
        footGroup.rotation.x += (tgtRotX  - footGroup.rotation.x) * 0.055;
      }

      // Scan sweeps plantar → dorsal (bottom to top)
      scanY += 0.0055 * scanDir;
      if (scanY >  2.2) scanDir = -1;
      if (scanY < -2.2) scanDir =  1;

      scanPlane.position.y = scanY;
      scanGlow.position.y  = scanY;
      scanMat.opacity = 0.80 + Math.sin(tick * 4.2) * 0.16;
      glowMat.opacity = 0.13 + Math.sin(tick * 4.2) * 0.05;

      updateColors(scanY);

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

        // Subsample to ~15 000 particles
        const totalVerts = raw.length / 3;
        const stride = Math.max(1, Math.floor(totalVerts / 15000));
        const N   = Math.ceil(totalVerts / stride);
        const pos = new Float32Array(N * 3);
        const col = new Float32Array(N * 3);

        // ── Axis remap ────────────────────────────────────
        // OBJ X (0.016–0.213): foot length  → scene Z (heel back, toe front)
        // OBJ Y (−0.183–−0.001): height     → scene Y (plantar at bottom: no flip)
        // OBJ Z (−0.141–−0.024): width      → scene X (lateral)
        //
        // OBJ Y is all-negative; centering keeps plantar at −Y, dorsal at +Y.
        // With footGroup.rotation.x = 0.60 the plantar side tilts toward camera.
        let p = 0;
        for (let i = 0; i < totalVerts; i += stride) {
          const ox = raw[i*3]   - cx;
          const oy = raw[i*3+1] - cy;
          const oz = raw[i*3+2] - cz;
          const jit = (Math.random() - 0.5) * scale * 0.004;

          pos[p*3]     = -oz * scale + jit; // X ← -OBJ_Z  (width, right-foot)
          pos[p*3+1]   =  oy * scale + jit; // Y ←  OBJ_Y  (plantar at −Y, dorsal at +Y)
          pos[p*3+2]   =  ox * scale + jit; // Z ←  OBJ_X  (length)
          p++;
        }

        ptCount = p;
        const geo = new THREE.BufferGeometry();
        posAttr = new THREE.BufferAttribute(pos.subarray(0, ptCount*3), 3);
        colAttr = new THREE.BufferAttribute(col.subarray(0, ptCount*3), 3);
        geo.setAttribute('position', posAttr);
        geo.setAttribute('color',    colAttr);

        const mat = new THREE.PointsMaterial({
          size: 0.030,
          vertexColors: true,
          transparent: true,
          opacity: 0.88,
          sizeAttenuation: true,
        });

        footGroup.add(new THREE.Points(geo, mat));
      },
      undefined,
      err => console.error('foot.obj load error:', err)
    );
  }

  init();
})();
