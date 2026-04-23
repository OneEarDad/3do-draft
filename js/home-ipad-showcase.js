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

  function getDuration(step) { return step === 0 ? 3000 : 5000; }

  function goTo(idx) {
    if (idx < 0 || idx >= total) return;

    slides.forEach(s => s.classList.remove('is-active'));

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
    slides[current].classList.add('is-active');

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
      if (vid) { i === current ? vid.play() : vid.pause(); }
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
