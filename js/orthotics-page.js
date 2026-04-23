const ORTHO_DATA = {
  'comfort-soft': {
    name: 'Comfort Soft',
    imgs: ['Orthotics Pics/Comfort Soft 1.jpg','Orthotics Pics/Comfort Soft 2.jpg','Orthotics Pics/Comfort Soft 3.jpg'],
    materials: 'Cushioned fabric top cover · Flexible EVA foam base · Polyurethane heel cup',
    tags: ['Everyday wear', 'Foot fatigue', 'Mild overpronation', 'Plantar fasciitis'],
    feature: 'Dual-density construction provides all-day cushioning while maintaining just enough biomechanical support to reduce fatigue on long shifts or active days.'
  },
  'diabetic-medium': {
    name: 'Diabetic Medium',
    imgs: ['Orthotics Pics/Diabetic Medium 1.jpg','Orthotics Pics/Diabetic Medium 2.jpg','Orthotics Pics/Diabetic Medium 3.jpg'],
    materials: 'Plastazote® top cover · PPT® medium-density base · Seamless bonded edges',
    tags: ['Diabetic neuropathy', 'Pressure offloading', 'VA / DOD standard', 'Moderate risk'],
    feature: 'Pressure-mapped design reduces peak plantar pressures to protect sensory-impaired feet while maintaining functional support throughout the day.'
  },
  'diabetic-soft': {
    name: 'Diabetic Soft',
    imgs: ['Orthotics Pics/Diabetic Soft 1.jpg','Orthotics Pics/Diabetic Soft 2.jpg','Orthotics Pics/Diabetic Soft 3.jpg'],
    materials: 'Soft Plastazote® top cover · Extra-soft PPT® base · Total contact construction',
    tags: ['High ulcer risk', 'Severe neuropathy', 'Charcot foot', 'Post-wound care'],
    feature: 'Extra-soft total contact fit minimizes shear and friction at every contact point. The highest level of pressure protection in our diabetic line.'
  },
  'dress-elite': {
    name: 'Dress Elite',
    imgs: ['Orthotics Pics/Dress Elite 1.jpg','Orthotics Pics/Dress Elite 2.jpg','Orthotics Pics/Dress Elite 3.jpg'],
    materials: 'Microfiber top cover · Slim carbon-composite shell · Low-profile foam base',
    tags: ['Dress shoes', 'Professional wear', 'Mild correction', 'Low-volume footwear'],
    feature: 'Ultra-slim 3mm profile delivers full custom biomechanical correction without modifying fit. Designed to disappear inside standard dress and uniform footwear.'
  },
  'dress-high-heel': {
    name: 'Dress High Heel',
    imgs: ['Orthotics Pics/Dress High Heel 1.jpg','Orthotics Pics/Dress High Heel 2.jpg','Orthotics Pics/Dress High Heel 3.jpg'],
    materials: 'Satin top cover · Forefoot metatarsal pad · Contoured heel platform',
    tags: ['High heels', 'Forefoot pain', 'Metatarsalgia', "Morton's neuroma"],
    feature: 'Contoured specifically for heel elevation. Shifts load rearward and offloads the metatarsal heads without altering the shoe\'s profile.'
  },
  'fm-functional': {
    name: 'FM Functional',
    imgs: ['Orthotics Pics/FM Fuctional 1.jpg','Orthotics Pics/FM Functional 2.jpg','Orthotics Pics/FM Functional 3.jpg'],
    materials: 'Leather top cover · Rigid polypropylene shell · Extrinsic rear-foot & forefoot post',
    tags: ['Overpronation', 'Supination', 'Plantar fasciitis', 'Achilles tendinopathy'],
    feature: 'Full rear-foot and forefoot posting capability gives clinicians precise control over biomechanical correction. The most versatile functional orthotic in the FM line.'
  },
  'fm-glider': {
    name: 'FM Glider',
    imgs: ['Orthotics Pics/FM Glider 1.jpg','Orthotics Pics/FM Glider 2.jpg','Orthotics Pics/FM Glider 3.jpg'],
    materials: 'Synthetic top cover · Semi-flexible polypropylene shell · Low-profile EVA base',
    tags: ['Athletic casual', 'Mild pronation', 'Everyday active', 'Low-volume shoes'],
    feature: 'Low-profile shell fits casual and athletic footwear without heel elevation. Full custom correction without the bulk of a traditional functional device.'
  },
  'fm-integrated': {
    name: 'FM Integrated',
    imgs: ['Orthotics Pics/FM Integrated 1.jpg','Orthotics Pics/FM Integrated 2.jpg','Orthotics Pics/FM Integrated 3.jpg'],
    materials: 'Cushioned top cover · Multi-density polypropylene shell · Strategically placed PPT® pads',
    tags: ['Mixed activity', 'Combined needs', 'Cushion + control', 'General population'],
    feature: 'Multi-density zones target high-pressure areas with cushioning while the firm shell maintains structural correction. One device for patients with mixed biomechanical and comfort needs.'
  },
  'fm-sport': {
    name: 'FM Sport',
    imgs: ['Orthotics Pics/FM Sport 1.jpg','Orthotics Pics/FM Sport 2.jpg','Orthotics Pics/FM Sport 3.jpg'],
    materials: 'Moisture-wicking top cover · Rigid carbon fiber shell · Deep heel cup',
    tags: ['Running', 'High-impact sport', 'IT band syndrome', 'Overpronation'],
    feature: 'Carbon fiber shell returns energy with each stride while the deep heel cup locks the rearfoot. Built for repetitive high-impact loading without fatigue or breakdown.'
  },
  'fm-support': {
    name: 'FM Support',
    imgs: ['Orthotics Pics/FM Support 1.jpg','Orthotics Pics/FM Support 2.jpg','Orthotics Pics/FM Support 3.jpg'],
    materials: 'Firm EVA top cover · Extra-rigid polypropylene shell · Extended heel counter',
    tags: ['Severe pronation', 'PTTD', 'Heavy-duty use', 'Maximum control'],
    feature: 'Extended heel counter and extra-rigid shell deliver maximum rearfoot stability. The highest level of motion control in the FM line for demanding clinical presentations.'
  },
  'fm-trainer': {
    name: 'FM Trainer',
    imgs: ['Orthotics Pics/FM Trainer 1.jpg','Orthotics Pics/FM Trainer 2.jpg','Orthotics Pics/FM Trainer 3.jpg'],
    materials: 'Shock-absorbing top cover · Semi-rigid shell · Dual-density forefoot pad',
    tags: ['Gym & training', 'Shin splints', 'Repetitive impact', 'Cross-training'],
    feature: 'Dual-density forefoot pad absorbs ground reaction forces during high-repetition training while the semi-rigid shell maintains alignment across varied movement planes.'
  },
  'motion-soft': {
    name: 'Motion Soft',
    imgs: ['Orthotics Pics/Motion Soft 1.jpg','Orthotics Pics/Motion Soft 2.jpg','Orthotics Pics/Motion Soft 3.jpg'],
    materials: 'Soft fabric top cover · Flexible motion-control shell · Cushioned heel pad',
    tags: ['Overpronation', 'Active daily use', 'Mild–moderate control', 'Comfort-focused'],
    feature: 'Motion-control shell paired with a soft top cover bridges the gap between comfort and correction. Ideal for patients who need guidance without a rigid device.'
  },
  'pt-controller': {
    name: 'PT Controller',
    imgs: ['Orthotics Pics/PT Controller 1.jpg','Orthotics Pics/PT Controller 2.jpg','Orthotics Pics/PT Controller 3.jpg'],
    materials: 'Medical-grade top cover · Firm control shell · Clinician-adjustable posting system',
    tags: ['Post-surgical rehab', 'Gait retraining', 'Tendon recovery', 'Ligament rehab'],
    feature: 'The adjustable posting system lets the treating clinician modify the degree of correction at each appointment. Designed to evolve with the patient through the rehabilitation process.'
  },
  'smart-basic': {
    name: 'Smart Basic',
    imgs: ['Orthotics Pics/Smart Basic 1.jpg','Orthotics Pics/Smart Basic 2.jpg','Orthotics Pics/Smart Basic 3.jpg'],
    materials: 'Breathable top cover · Flexible polypropylene shell · Standard cushion base',
    tags: ['Mild correction', 'General support', 'Entry-level custom', 'Wide population'],
    feature: 'Every Smart Basic is fully custom-fabricated from a precision 3D scan. No off-the-shelf sizing, no compromises. Full custom fit at the most accessible tier in our catalog.'
  }
};

(function initOrthoticsHeroSkyfall() {
  const field = document.getElementById('orthotics-hero-skyfall');
  if (!field) return;
  const sizeClasses = ['bubble--sm', 'bubble--md', 'bubble--lg'];
  let resizeTimer = null;

  function makeBubble(product, sizeClass) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + sizeClass;
    const img = document.createElement('img');
    img.src = product.img;
    img.alt = product.name + ' custom orthotic';
    img.loading = 'lazy';
    img.draggable = false;
    bubble.appendChild(img);
    const label = document.createElement('span');
    label.className = 'bubble__name';
    label.textContent = product.name;
    bubble.appendChild(label);
    return bubble;
  }

  function render() {
    field.innerHTML = '';
    const products = Object.values(ORTHO_DATA).map((d) => ({ name: d.name, img: d.imgs[0] }));
    if (!products.length) return;

    const isMobile = window.matchMedia('(max-width: 860px)').matches;
    const count = isMobile ? 14 : 26;
    const laneCount = isMobile ? 6 : 9;
    const fallDistance = Math.max(field.clientHeight + 220, 560);
    field.style.setProperty('--fall-distance', fallDistance + 'px');

    for (let i = 0; i < count; i++) {
      const p = products[i % products.length];
      const bubble = makeBubble(p, isMobile ? sizeClasses[i % 2] : sizeClasses[i % sizeClasses.length]);
      const lane = i % laneCount;
      const laneWidth = 100 / laneCount;
      const jitter = ((i * 17) % 12) - 6;
      bubble.style.setProperty('--x', Math.max(4, Math.min(96, laneWidth * lane + laneWidth * 0.5 + jitter * 0.24)).toFixed(2) + '%');
      bubble.style.setProperty('--dur', (8.9 + (i % 7) * 1.05).toFixed(2) + 's');
      bubble.style.setProperty('--delay', (-i * 0.9).toFixed(2) + 's');
      bubble.style.setProperty('--sway', (10 + (i % 5) * 1.8).toFixed(1) + 'px');
      field.appendChild(bubble);
    }
  }

  render();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 180);
  });
})();

(function sortOrthoticTypeSectionsAlphabetically() {
  const portfolioRoot = document.querySelector('.section.section--flush-top .container');
  if (!portfolioRoot) return;
  const sections = Array.from(portfolioRoot.querySelectorAll(':scope > .portfolio-section'));
  if (!sections.length) return;

  sections
    .sort((a, b) => {
      const aTitle = a.querySelector('.portfolio-section__title')?.textContent?.trim() || '';
      const bTitle = b.querySelector('.portfolio-section__title')?.textContent?.trim() || '';
      return aTitle.localeCompare(bTitle);
    })
    .forEach((section) => portfolioRoot.appendChild(section));
})();

(function () {
  const backdrop = document.getElementById('orthoModal');
  const closeBtn = document.getElementById('orthoModalClose');
  const photo    = document.getElementById('orthoModalPhoto');
  const nameEl   = document.getElementById('orthoModalName');
  const matsEl   = document.getElementById('orthoModalMaterials');
  const tagsEl   = document.getElementById('orthoModalTags');
  const featEl   = document.getElementById('orthoModalFeature');
  const prevBtn  = document.getElementById('orthoModalPrev');
  const nextBtn  = document.getElementById('orthoModalNext');
  const dotsEl   = document.getElementById('orthoModalDots');

  let currentImgs = [];
  let currentIdx  = 0;

  function setImage(idx) {
    currentIdx = idx;
    photo.src  = currentImgs[idx];
    // Update dots
    dotsEl.querySelectorAll('.ortho-modal__dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === idx);
    });
    // Show/hide arrows
    prevBtn.classList.toggle('is-hidden', currentImgs.length <= 1);
    nextBtn.classList.toggle('is-hidden', currentImgs.length <= 1);
  }

  function openModal(key) {
    const d = ORTHO_DATA[key];
    if (!d) return;
    currentImgs = d.imgs;
    nameEl.textContent = d.name;
    matsEl.innerHTML   = d.materials.split(' · ').map(m => `<div class="ortho-modal__mat-item">${m}</div>`).join('');
    tagsEl.innerHTML   = d.tags.map(t => `<span class="ortho-modal__tag">${t}</span>`).join('');
    featEl.textContent = d.feature;
    photo.alt          = d.name;
    // Build dots
    dotsEl.innerHTML   = d.imgs.map(() => `<div class="ortho-modal__dot"></div>`).join('');
    setImage(0);
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  prevBtn.addEventListener('click', e => {
    e.stopPropagation();
    setImage((currentIdx - 1 + currentImgs.length) % currentImgs.length);
  });
  nextBtn.addEventListener('click', e => {
    e.stopPropagation();
    setImage((currentIdx + 1) % currentImgs.length);
  });

  // Open on card click (but not on carousel dot clicks)
  document.querySelectorAll('.portfolio-card[data-key]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.carousel__dots')) return;
      openModal(card.dataset.key);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', e => {
    if (!backdrop.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft')  setImage((currentIdx - 1 + currentImgs.length) % currentImgs.length);
    if (e.key === 'ArrowRight') setImage((currentIdx + 1) % currentImgs.length);
  });
})();
