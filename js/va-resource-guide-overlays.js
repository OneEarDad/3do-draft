/* 3D Orthotics: VA resource guide overlay dialogs */
function openOverlay(type) {
  document.getElementById('overlay-deid').style.display   = type === 'deid'    ? '' : 'none';
  document.getElementById('overlay-consult').style.display = type === 'consult' ? '' : 'none';
  document.getElementById('overlay-po').style.display     = type === 'po'      ? '' : 'none';
  document.getElementById('overlay-lcodes').style.display = type === 'lcodes'  ? '' : 'none';
  document.getElementById('va-overlay-backdrop').classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
function closeOverlay() {
  document.getElementById('va-overlay-backdrop').classList.remove('is-open');
  document.body.style.overflow = '';
}
function closeOverlayOnBackdrop(e) {
  if (e.target === document.getElementById('va-overlay-backdrop')) closeOverlay();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });
document.querySelectorAll('.js-open-overlay').forEach((btn) => {
  btn.addEventListener('click', () => openOverlay(btn.getAttribute('data-overlay-type')));
});
document.querySelectorAll('.js-close-overlay').forEach((btn) => {
  btn.addEventListener('click', closeOverlay);
});
document.getElementById('va-overlay-backdrop').addEventListener('click', closeOverlayOnBackdrop);
