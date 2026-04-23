/* 3D Orthotics: awards page overlay dialogs */
function openAwardOverlay(type) {
  document.getElementById('overlay-quitt').style.display      = type === 'quitt'      ? '' : 'none';
  document.getElementById('overlay-timeliness').style.display = type === 'timeliness' ? '' : 'none';
  document.getElementById('award-overlay-backdrop').classList.add('is-open');
  document.body.style.overflow = 'hidden';
  const dialog = document.getElementById('award-overlay-inner');
  if (dialog) dialog.focus();
}
function closeAwardOverlay() {
  document.getElementById('award-overlay-backdrop').classList.remove('is-open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAwardOverlay(); });
document.querySelectorAll('[data-award-overlay]').forEach((btn) => {
  btn.addEventListener('click', () => openAwardOverlay(btn.getAttribute('data-award-overlay')));
});
document.querySelectorAll('.js-award-overlay-close').forEach((btn) => {
  btn.addEventListener('click', closeAwardOverlay);
});
document.getElementById('award-overlay-backdrop').addEventListener('click', closeAwardOverlay);
document.getElementById('award-overlay-inner').addEventListener('click', (event) => event.stopPropagation());
