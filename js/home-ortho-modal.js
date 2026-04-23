/* 3D Orthotics: homepage orthotic detail modal (static product data) */
const HOME_ORTHO_DATA = {
  'comfort-soft': {
    name: 'Comfort Soft',
    imgs: ['Orthotics Pics/Comfort Soft 1.jpg','Orthotics Pics/Comfort Soft 2.jpg','Orthotics Pics/Comfort Soft 3.jpg'],
    materials: 'Cushioned fabric top cover · Flexible EVA foam base · Polyurethane heel cup',
    tags: ['Everyday wear', 'Foot fatigue', 'Mild overpronation', 'Plantar fasciitis'],
    feature: 'Dual-density construction provides all-day cushioning while maintaining just enough biomechanical support to reduce fatigue on long shifts or active days.'
  },
  'diabetic-soft': {
    name: 'Diabetic Soft',
    imgs: ['Orthotics Pics/Diabetic Soft 1.jpg','Orthotics Pics/Diabetic Soft 2.jpg','Orthotics Pics/Diabetic Soft 3.jpg'],
    materials: 'Soft Plastazote® top cover · Extra-soft PPT® base · Total contact construction',
    tags: ['High ulcer risk', 'Severe neuropathy', 'Charcot foot', 'Post-wound care'],
    feature: 'Extra-soft total contact fit minimizes shear and friction at every contact point. The highest level of pressure protection in our diabetic line.'
  },
  'fm-sport': {
    name: 'FM Sport',
    imgs: ['Orthotics Pics/FM Sport 1.jpg','Orthotics Pics/FM Sport 2.jpg','Orthotics Pics/FM Sport 3.jpg'],
    materials: 'Moisture-wicking top cover · Rigid carbon fiber shell · Deep heel cup',
    tags: ['Running', 'High-impact sport', 'IT band syndrome', 'Overpronation'],
    feature: 'Carbon fiber shell returns energy with each stride while the deep heel cup locks the rearfoot. Built for repetitive high-impact loading without fatigue or breakdown.'
  }
};

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
    photo.alt  = nameEl.textContent;
    dotsEl.querySelectorAll('.ortho-modal__dot').forEach((d, i) => d.classList.toggle('is-active', i === idx));
    prevBtn.classList.toggle('is-hidden', idx === 0);
    nextBtn.classList.toggle('is-hidden', idx === currentImgs.length - 1);
  }

  function openModal(key) {
    const d = HOME_ORTHO_DATA[key];
    if (!d) return;
    nameEl.textContent   = d.name;
    matsEl.innerHTML     = d.materials.split(' · ').map(m => `<div class="ortho-modal__mat-item">${m}</div>`).join('');
    featEl.textContent   = d.feature;
    tagsEl.innerHTML     = d.tags.map(t => `<span class="ortho-modal__tag">${t}</span>`).join('');
    dotsEl.innerHTML     = d.imgs.map(() => `<div class="ortho-modal__dot"></div>`).join('');
    currentImgs = d.imgs;
    setImage(0);
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.portfolio-grid .portfolio-card[data-key]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.carousel__dots')) return;
      openModal(card.dataset.key);
    });
  });

  prevBtn.addEventListener('click', e => { e.stopPropagation(); setImage(currentIdx - 1); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); setImage(currentIdx + 1); });
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', e => {
    if (!backdrop.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft')  setImage(Math.max(0, currentIdx - 1));
    if (e.key === 'ArrowRight') setImage(Math.min(currentImgs.length - 1, currentIdx + 1));
  });
})();
