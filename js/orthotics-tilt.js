/* ============================================================
   3D ORTHOTICS: Gyroscope tilt on orthotic portfolio cards
   Subtle parallax/tilt that responds to how the phone is held.
   Only activates on touch devices with real orientation sensors;
   desktop hover still works untouched.

   iOS 13+ requires an explicit permission prompt triggered by
   a user gesture (tap). Android / other browsers attach directly.
   ============================================================ */

(function () {
  // ── Guards ────────────────────────────────────────────────
  if (typeof window === 'undefined') return;
  if (typeof DeviceOrientationEvent === 'undefined') return;

  // Skip users who asked the OS to reduce motion (WCAG 2.3.3).
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Only activate on coarse-pointer touch devices. Desktops with mouse
  // would have no sensor data anyway, and also don't benefit — the hover
  // interactions on portfolio cards already give them a richer cue.
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (!isTouchDevice) return;

  const items = Array.from(document.querySelectorAll('.portfolio-item'));
  if (items.length === 0) return;

  // ── Tuning ────────────────────────────────────────────────
  const MAX_TILT        = 6;     // degrees — keep subtle, not a wow that spins the card
  const BETA_DIVISOR    = 6;     // beta ±30° → ±5° tilt
  const GAMMA_DIVISOR   = 6;     // gamma ±30° → ±5° tilt
  const LERP_FACTOR     = 0.08;  // smoothing (0.08 = glides into place over ~12 frames)
  const LOCALSTORAGE_KEY = 'orthoTiltEnabled-v1';

  // ── State ─────────────────────────────────────────────────
  let targetTiltX = 0, targetTiltY = 0;
  let currentTiltX = 0, currentTiltY = 0;
  let rafId = null;
  let listenerAttached = false;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function onOrientation(e) {
    // beta  (−180..180): front-to-back tilt (phone leaning toward/away)
    // gamma (−90..90):  left-to-right tilt (phone leaning sideways)
    // Nullable on devices without a real IMU.
    if (e.beta == null || e.gamma == null) return;
    targetTiltX = clamp(-e.beta  / BETA_DIVISOR,  -MAX_TILT, MAX_TILT);
    targetTiltY = clamp( e.gamma / GAMMA_DIVISOR, -MAX_TILT, MAX_TILT);
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    // Lerp toward target each frame for buttery motion.
    currentTiltX += (targetTiltX - currentTiltX) * LERP_FACTOR;
    currentTiltY += (targetTiltY - currentTiltY) * LERP_FACTOR;
    // Bail if motion is too small to matter (saves layout work).
    if (Math.abs(targetTiltX - currentTiltX) < 0.01 &&
        Math.abs(targetTiltY - currentTiltY) < 0.01) {
      currentTiltX = targetTiltX;
      currentTiltY = targetTiltY;
    }
    const transform = 'rotateX(' + currentTiltX.toFixed(2) + 'deg) rotateY(' + currentTiltY.toFixed(2) + 'deg)';
    for (let i = 0; i < items.length; i++) {
      items[i].style.transform = transform;
    }
  }

  function attachListener() {
    if (listenerAttached) return;
    listenerAttached = true;
    window.addEventListener('deviceorientation', onOrientation, { passive: true });
    // Mark the body so CSS can set transform-style + perspective. Doing this
    // via a class rather than inline styles means the 3D context only exists
    // when tilt is actually running — no perspective layer for desktop.
    document.body.classList.add('ortho-tilt-active');
    tick();
  }

  function detachListener() {
    if (!listenerAttached) return;
    listenerAttached = false;
    window.removeEventListener('deviceorientation', onOrientation);
    cancelAnimationFrame(rafId);
    for (let i = 0; i < items.length; i++) {
      items[i].style.transform = '';
    }
    document.body.classList.remove('ortho-tilt-active');
  }

  // ── iOS 13+ permission flow ──────────────────────────────
  const needsPermission = typeof DeviceOrientationEvent.requestPermission === 'function';

  if (!needsPermission) {
    // Android/other: just attach. No UI needed.
    attachListener();
    return;
  }

  // iOS path: we need a user-gesture-driven call to requestPermission.
  // If user previously granted, try to reattach silently; browsers don't
  // persist permission across sessions (we still need the gesture once
  // per session), so stored state is advisory — it just hides the pill
  // for users who denied.
  const stored = (function () {
    try { return localStorage.getItem(LOCALSTORAGE_KEY); }
    catch (err) { return null; }
  })();
  if (stored === 'denied') return;

  // Build the enable pill.
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'ortho-tilt-pill';
  pill.setAttribute('aria-label', 'Enable motion-based tilt effect on orthotic cards');
  pill.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="5" y="2" width="14" height="20" rx="2"/>' +
      '<path d="M12 18h.01"/>' +
    '</svg>' +
    '<span>Enable tilt</span>';

  pill.addEventListener('click', function () {
    DeviceOrientationEvent.requestPermission()
      .then(function (state) {
        if (state === 'granted') {
          try { localStorage.setItem(LOCALSTORAGE_KEY, 'granted'); } catch (err) {}
          attachListener();
          pill.remove();
        } else {
          try { localStorage.setItem(LOCALSTORAGE_KEY, 'denied'); } catch (err) {}
          pill.remove();
        }
      })
      .catch(function () {
        pill.remove();
      });
  });

  // Append once DOM is ready enough to have a body.
  document.body.appendChild(pill);
})();
