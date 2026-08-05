/* ============================================================
   Foot-scan lazy-loader
   Loads THREE.js r128 + OBJLoader + foot-3d.js (which pulls foot.obj,
   ~3.5MB) AFTER the page is interactive, so the WebGL foot scan does not
   block first paint, LCP, or main-thread work during initial load.

   Scripts are same-origin, so `script-src 'self'` permits dynamic
   injection. foot-3d.js itself is unchanged.
   ============================================================ */
(function () {
  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function boot() {
    load('js/vendor/three.min.js?v=r128')
      .then(function () { return load('js/vendor/OBJLoader.js?v=r128'); })
      .then(function () { return load('js/foot-3d.js?v=3'); })
      .catch(function (e) { console.error('Foot scan failed to load:', e); });
  }

  // Start once the DOM is ready, on the first idle slice after paint.
  function schedule() {
    if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 1500 });
    else setTimeout(boot, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
})();
