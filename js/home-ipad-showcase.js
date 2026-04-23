/* 3D Orthotics: homepage iPad pipeline showcase */
(function () {
  const device    = document.querySelector('.ipad-device');
  const slides    = document.querySelectorAll('.ipad-slide');
  const flags     = document.querySelectorAll('.pipeline-flag');
  const prevBtn   = document.querySelector('.ipad-nav--prev');
  const nextBtn   = document.querySelector('.ipad-nav--next');
  const descEl    = document.getElementById('pipeline-desc');
  if (!device || !slides.length) return;

  const descriptions = {
    1: 'A precision 3D scan captures the patient\u2019s foot in under 5 minutes.',
    2: 'Review the 3D model and verify scan accuracy before proceeding.',
    3: 'Select the orthotic device and configure to patient needs.',
    4: 'Submit the order securely to the lab.'
  };

  let current     = 0;
  const total     = slides.length;
  let autoTimer   = null;
  let isVisible   = false;

  // Step 0 (launch logo): 3s. Step 2 (Review — foot scan video): 7s so the
  // 2× sped-up video has room to show a full rotation. Everything else: 5s.
  function getDuration(step) {
    if (step === 0) return 3000;
    if (step === 2) return 7000;
    return 5000;
  }
  // Playback rate applied per-step to the <video> in that slide.
  // 2× on Review compresses the 31-second source video into the 7s window.
  function getPlaybackRate(step) { return step === 2 ? 2.0 : 1.0; }

  function goTo(idx) {
    if (idx < 0 || idx >= total) return;

    flags.forEach(flag => {
      flag.classList.remove('is-active', 'is-done', 'is-filling');
      const fill = flag.querySelector('.pipeline-flag__fill');
      if (fill) {
        fill.style.animation = 'none';
        void fill.offsetHeight;
        fill.style.animation = '';
      }
    });

    current = idx;

    // Position every slide relative to the current index so transitions
    // read as a left→right iPad swipe: `.is-past` = already-shown (parked
    // off-screen left), `.is-active` = on-screen, no class = upcoming
    // (parked off-screen right via default `translateX(100%)`).
    slides.forEach((s, i) => {
      s.classList.remove('is-active', 'is-past');
      if (i < current) s.classList.add('is-past');
      else if (i === current) s.classList.add('is-active');
    });

    flags.forEach(flag => {
      const flagStep = parseInt(flag.dataset.goto, 10);
      if (flagStep < current) {
        flag.classList.add('is-done');
      } else if (flagStep === current) {
        flag.classList.add('is-active', 'is-filling');
        flag.style.setProperty('--fill-duration', getDuration(current) + 'ms');
      }
    });

    if (descriptions[current]) {
      descEl.classList.remove('is-visible');
      setTimeout(() => {
        descEl.textContent = descriptions[current];
        descEl.classList.add('is-visible');
      }, 150);
    } else {
      descEl.classList.remove('is-visible');
    }

    slides.forEach((s, i) => {
      const vid = s.querySelector('video');
      if (!vid) return;
      if (i === current) {
        vid.playbackRate = getPlaybackRate(i);
        vid.currentTime = 0;          // always restart from the top
        vid.play();
      } else {
        vid.pause();
      }
    });

    prevBtn.classList.toggle('is-hidden', current === 0);
    nextBtn.classList.toggle('is-hidden', current === total - 1);

    startAuto();
  }

  function next() { if (current < total - 1) goTo(current + 1); else stopAuto(); }
  function prev() { if (current > 0) goTo(current - 1); }

  function startAuto() {
    stopAuto();
    if (current >= total - 1) return;
    autoTimer = setTimeout(next, getDuration(current));
  }
  function stopAuto() {
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); });

  flags.forEach(flag => {
    flag.addEventListener('click', () => {
      goTo(parseInt(flag.dataset.goto, 10));
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isVisible) {
        isVisible = true;
        device.classList.add('is-visible');
        setTimeout(() => { goTo(0); }, 600);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(device);

  prevBtn.classList.add('is-hidden');
})();
