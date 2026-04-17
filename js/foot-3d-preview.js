/* ============================================================
   3D ORTHOTICS: Foot Particle Cloud (Progressive Reveal)
   Pass 1 (bottom → top):  reveals ~15 000 particles
   Pass 2 (top → bottom):  adds    ~10 000 more particles
   Total: ~25 000 particles
   ============================================================ */

(function () {
  function init() {
    if (typeof THREE === 'undefined' || typeof THREE.OBJLoader === 'undefined') {
      setTimeout(init, 100);
      return;
    }
    startScene();
  }

  function startScene() {
    const canvas = document.getElementById('foot-canvas');
    if (!canvas) return;

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

    // ── Grid ─────────────────────────────────────────────
    const grid = new THREE.GridHelper(6, 28, 0x00549d, 0x4aa8d8);
    grid.position.y = -2.4;
    scene.add(grid);

    // ── Scan plane (visible bar, same as home page) ───────
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x00aec7, transparent: true, opacity: 0.90, side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.007), scanMat);
    scene.add(scanPlane);

    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00aec7, transparent: true, opacity: 0.18, side: THREE.DoubleSide,
    });
    const scanGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.22), glowMat);
    scene.add(scanGlow);

    // ── Foot group ────────────────────────────────────────
    const footGroup = new THREE.Group();
    footGroup.rotation.x = 0.60;
    scene.add(footGroup);

    // ── Shader: per-vertex reveal + size + colour ─────────
    const vertexShader = `
      attribute float aReveal;
      attribute float aSize;
      attribute vec3  aColor;
      varying   float vReveal;
      varying   vec3  vColor;
      void main() {
        vReveal  = aReveal;
        vColor   = aColor;
        vec4 mv  = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (380.0 / -mv.z);
        gl_Position  = projectionMatrix * mv;
      }
    `;
    const fragmentShader = `
      varying float vReveal;
      varying vec3  vColor;
      void main() {
        if (vReveal < 0.01) discard;
        float r    = length(gl_PointCoord - 0.5);
        if (r > 0.5) discard;
        float edge = 1.0 - smoothstep(0.30, 0.50, r);
        gl_FragColor = vec4(vColor, vReveal * edge);
      }
    `;

    // ── Colour palette ────────────────────────────────────
    const C_SETTLED = [0.000, 0.329, 0.616]; // dim #00549d (settled particles)
    const C_TEAL    = [0.000, 0.682, 0.780]; // #00aec7
    const C_HOT     = [0.600, 0.920, 1.000]; // bright flash at scan line

    const BASE_SIZE   = 0.030;
    const FLASH_SIZE  = 0.070;
    const FLASH_BAND  = 0.10;
    const REVEAL_BAND = 0.22;
    const SCAN_TOP    =  2.2;
    const SCAN_BOT    = -2.2;
    const SCAN_SPEED  =  0.0055;
    const HOLD_FRAMES =  110;

    function lerp(a, b, t) { return a + (b - a) * t; }

    // ── Animation state ───────────────────────────────────
    let tick       = 0;
    let autoRotate = true;
    let rotY       = 0;
    let tgtRotX    = 0.60;
    let tgtRotY    = 0;

    let scanY      = SCAN_BOT;   // start at bottom
    let scanDir    = +1;         // first sweep goes upward
    let scanPass   = 0;
    let holdFrames = 0;

    let posArr   = null;
    let permArr  = null;
    let groupArr = null;
    let ptCount  = 0;

    let attrReveal = null;
    let attrSize   = null;
    let attrColor  = null;

    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      tgtRotY = ((e.clientX - r.left) / r.width - 0.5) * 1.6;
      tgtRotX = ((e.clientY - r.top) / r.height - 0.5) * -0.70 + 0.60;
      autoRotate = false;
    });
    canvas.addEventListener('mouseleave', () => { autoRotate = true; });

    function updateParticles() {
      if (!posArr) return;
      const rev = attrReveal.array;
      const sz  = attrSize.array;
      const col = attrColor.array;

      for (let i = 0; i < ptCount; i++) {
        const py       = posArr[i * 3 + 1];
        const perm     = permArr[i];
        const myGroup  = groupArr[i];
        const isActive = (myGroup === scanPass);

        if (perm) {
          // Already revealed: subtle glow when the scan re-passes
          const dY  = Math.abs(py - scanY);
          const fls = Math.max(0, 1.0 - dY / (FLASH_BAND * 1.5));
          rev[i]     = 1.0;
          sz[i]      = lerp(BASE_SIZE, FLASH_SIZE * 0.65, fls);
          col[i*3]   = lerp(C_SETTLED[0], C_HOT[0], fls * 0.7);
          col[i*3+1] = lerp(C_SETTLED[1], C_HOT[1], fls * 0.7);
          col[i*3+2] = lerp(C_SETTLED[2], C_HOT[2], fls * 0.7);

        } else if (isActive) {
          // dY > 0 means scan hasn't reached this particle yet
          const dY = scanDir > 0 ? scanY - py : py - scanY;

          if (dY > REVEAL_BAND) {
            // Hidden ahead of scan
            rev[i] = 0.0; sz[i] = 0.0;

          } else if (dY > -FLASH_BAND) {
            // Materialising at scan front
            const t   = 1.0 - (dY + FLASH_BAND) / (REVEAL_BAND + FLASH_BAND);
            const fls = Math.max(0, 1.0 - Math.abs(dY) / FLASH_BAND);
            rev[i]   = Math.min(1.0, t * 3.0);
            sz[i]    = lerp(FLASH_SIZE, BASE_SIZE, Math.max(0, -dY / FLASH_BAND));
            col[i*3]   = lerp(C_TEAL[0], C_HOT[0], fls);
            col[i*3+1] = lerp(C_TEAL[1], C_HOT[1], fls);
            col[i*3+2] = lerp(C_TEAL[2], C_HOT[2], fls);
            if (dY <= 0) permArr[i] = 1;

          } else {
            // Settled behind scan
            permArr[i] = 1;
            rev[i] = 1.0; sz[i] = BASE_SIZE;
            col[i*3]   = C_SETTLED[0];
            col[i*3+1] = C_SETTLED[1];
            col[i*3+2] = C_SETTLED[2];
          }

        } else {
          // Not in this pass: keep hidden
          rev[i] = 0.0; sz[i] = 0.0;
        }
      }

      attrReveal.needsUpdate = true;
      attrSize.needsUpdate   = true;
      attrColor.needsUpdate  = true;
    }

    function animate() {
      requestAnimationFrame(animate);
      tick += 0.01;

      if (autoRotate) {
        rotY += 0.0030;
        footGroup.rotation.y = rotY;
        footGroup.rotation.x = 0.60;
      } else {
        footGroup.rotation.y += (tgtRotY - footGroup.rotation.y) * 0.055;
        footGroup.rotation.x += (tgtRotX - footGroup.rotation.x) * 0.055;
      }

      // Scan state machine
      if (holdFrames > 0) {
        holdFrames--;
        if (holdFrames === 0) {
          if (permArr) permArr.fill(0);
          scanPass = 0;
          scanDir  = +1;
          scanY    = SCAN_BOT;
        }
      } else {
        scanY += SCAN_SPEED * scanDir;

        if (scanDir > 0 && scanY >= SCAN_TOP) {
          // Pass 0 (upward, 15k) done → start pass 1 (downward, 10k)
          scanY = SCAN_TOP; scanDir = -1; scanPass = 1;
        } else if (scanDir < 0 && scanY <= SCAN_BOT) {
          // Pass 1 (downward, 10k) done → hold then reset
          scanY = SCAN_BOT; holdFrames = HOLD_FRAMES;
        }
      }

      scanPlane.position.y = scanY;
      scanGlow.position.y  = scanY;
      scanMat.opacity = 0.80 + Math.sin(tick * 4.2) * 0.16;
      glowMat.opacity = 0.13 + Math.sin(tick * 4.2) * 0.05;

      updateParticles();

      const fy = Math.sin(tick * 0.45) * 0.055;
      footGroup.position.y = fy;
      grid.position.y      = -2.4 + fy;

      renderer.render(scene, camera);
    }
    animate();

    // ── Resize ────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      if (!w || !h) return;
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
          for (let i = 0; i < attr.count; i++) raw.push(attr.getX(i), attr.getY(i), attr.getZ(i));
        });
        if (!raw.length) return;

        // Bounding box
        let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
        for (let i=0;i<raw.length;i+=3) {
          const x=raw[i],y=raw[i+1],z=raw[i+2];
          if(x<minX)minX=x;if(x>maxX)maxX=x;
          if(y<minY)minY=y;if(y>maxY)maxY=y;
          if(z<minZ)minZ=z;if(z>maxZ)maxZ=z;
        }
        const cx=(minX+maxX)*.5, cy=(minY+maxY)*.5, cz=(minZ+maxZ)*.5;
        const scale = 4.0 / Math.max(maxX-minX, maxY-minY, maxZ-minZ);

        // Group 0: ~15 000 particles (every 4th vertex)
        // Group 1: ~10 000 particles (every 6th vertex, offset 3, no overlap)
        const totalVerts = raw.length / 3;
        const p0Indices = [], p1Indices = [];
        for (let i = 0; i < totalVerts; i++) {
          if      (i % 4 === 0) p0Indices.push(i);
          else if (i % 6 === 3) p1Indices.push(i);
        }

        const N = p0Indices.length + p1Indices.length;
        posArr   = new Float32Array(N * 3);
        permArr  = new Uint8Array(N);
        groupArr = new Uint8Array(N);

        const revData = new Float32Array(N);
        const szData  = new Float32Array(N);
        const colData = new Float32Array(N * 3);

        let p = 0;
        const addVert = (vi, group) => {
          const ox = raw[vi*3]   - cx;
          const oy = raw[vi*3+1] - cy;
          const oz = raw[vi*3+2] - cz;
          const jit = (Math.random() - 0.5) * scale * 0.004;
          posArr[p*3]   = -oz * scale + jit; // X ← -OBJ_Z (width)
          posArr[p*3+1] =  oy * scale + jit; // Y ←  OBJ_Y (plantar at −Y)
          posArr[p*3+2] =  ox * scale + jit; // Z ←  OBJ_X (length)
          groupArr[p]   = group;
          p++;
        };
        p0Indices.forEach(vi => addVert(vi, 0));
        p1Indices.forEach(vi => addVert(vi, 1));
        ptCount = p;

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(posArr.subarray(0, ptCount*3), 3));

        attrReveal = new THREE.BufferAttribute(revData.subarray(0, ptCount),    1);
        attrSize   = new THREE.BufferAttribute(szData.subarray(0, ptCount),     1);
        attrColor  = new THREE.BufferAttribute(colData.subarray(0, ptCount*3),  3);
        attrReveal.setUsage(THREE.DynamicDrawUsage);
        attrSize.setUsage(THREE.DynamicDrawUsage);
        attrColor.setUsage(THREE.DynamicDrawUsage);

        geo.setAttribute('aReveal', attrReveal);
        geo.setAttribute('aSize',   attrSize);
        geo.setAttribute('aColor',  attrColor);

        footGroup.add(new THREE.Points(geo, new THREE.ShaderMaterial({
          vertexShader, fragmentShader, transparent: true, depthWrite: false,
        })));
      },
      undefined,
      err => console.error('OBJ error:', err)
    );
  }

  init();
})();
