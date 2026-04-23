// ── "From Scan → Perfect Orthotic" iPad beam-wipe animation ──
// Alternates `.is-animating` / `.is-reversing` on the scan element so the CSS
// beam sweeps top→bottom and swaps the words below. Starts when scrolled in.
(function () {
  'use strict';
  var LOOP_DELAY = 2800;

  document.querySelectorAll('[data-ipad-variant="beam"]').forEach(function (el) {
    var showing = 0;
    var started = false;
    function cycle() {
      if (showing === 0) {
        el.classList.remove('is-reversing');
        el.classList.add('is-animating');
        showing = 1;
      } else {
        el.classList.remove('is-animating');
        el.classList.add('is-reversing');
        showing = 0;
      }
      setTimeout(cycle, LOOP_DELAY + 2500);
    }
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !started) {
        started = true;
        setTimeout(cycle, LOOP_DELAY);
      }
    }, { threshold: 0.3 }).observe(el);
  });
})();
