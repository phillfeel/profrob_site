/* Торговые центры и ритейл: фирменный блок «Сколько раз в день убирают».
   Ячейки шкал и полосы сравнения заполняются, когда блок попал в экран. Без анимации при reduced motion. */
(() => {
  'use strict';

  const block = document.querySelector('[data-freq]');
  if (!block) return;
  const on = () => block.classList.add('is-on');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { on(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { on(); io.disconnect(); }
  }, { threshold: 0.25 });
  io.observe(block);
})();
