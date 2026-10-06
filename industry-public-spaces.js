/* Общественные пространства: часы на табло в Hero, отметка «сейчас» на условном графике потока
   и появление окон уборки, когда график попал в кадр. Без библиотек; анимацию выключает prefers-reduced-motion (в CSS). */
(window.i18n ? window.i18n.ready : Promise.resolve()).then(() => {
  'use strict';

  const pad = (n) => String(n).padStart(2, '0');
  const clock = document.querySelector('[data-ps-clock]');
  const now = document.querySelector('[data-ps-now]');
  const nowT = now && now.querySelector('[data-ps-now-t]');

  // Local time of the visitor: the board and the chart show where "now" falls in the day.
  const tick = () => {
    const d = new Date();
    const hh = pad(d.getHours()), mm = pad(d.getMinutes());
    if (clock) clock.innerHTML = `${hh}<i>:</i>${mm}`;
    if (now && nowT) {
      const share = (d.getHours() * 60 + d.getMinutes()) / 1440;
      now.style.setProperty('--now', share.toFixed(4));
      now.classList.toggle('is-flip', share > 0.8);
      nowT.textContent = `${hh}:${mm}`;
      now.hidden = false;
    }
  };
  tick();
  setInterval(tick, 30000);

  // Cleaning windows grow from the axis once the chart is on screen.
  const fig = document.querySelector('[data-ps-flow]');
  if (!fig) return;
  if (!('IntersectionObserver' in window)) { fig.classList.add('is-on'); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { fig.classList.add('is-on'); io.disconnect(); } });
  }, { threshold: 0.3 });
  io.observe(fig);
});
