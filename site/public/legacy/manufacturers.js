/* Страница «Производители» (manufacturers.html): прожектор под курсором на карточках ключевых брендов (--mx/--my).
   Появление блоков, счётчик разделов и форма — в solutions.js, выбор направления и тёмный счётчик — в products.js. Текстов в скрипте нет. */
(() => {
  'use strict';
  if (!matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.mf-key').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  });
})();
