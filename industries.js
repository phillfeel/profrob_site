/* Страница «Отрасли»: стрелки и счётчик ленты кейсов (то же, что main.js делает на главной, но без GSAP).
   Появление блоков, счётчик разделов и форма — в solutions.js. Без стрелок лента всё равно листается пальцем и колесом. */
(window.i18n ? window.i18n.ready : Promise.resolve()).then(() => {
  'use strict';
  const cases = document.querySelector('.cases');
  if (!cases || !cases.children.length) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...cases.children];
  const cur = document.querySelector('.c-cur');
  const total = document.querySelector('.c-total');
  const [prev, next] = document.querySelectorAll('.slider-ctrl .round');
  const pad2 = (n) => String(n).padStart(2, '0');
  // Шаг ленты — ширина карточки плюс gap, как в CSS (.cases { gap: 24px })
  const step = () => cards[0].offsetWidth + parseFloat(getComputedStyle(cases).columnGap || 24);
  const index = () => Math.min(cards.length - 1, Math.round(cases.scrollLeft / step()));

  total.textContent = pad2(cards.length);
  const sync = () => {
    cur.textContent = pad2(index() + 1);
    prev.disabled = cases.scrollLeft < 4;
    next.disabled = cases.scrollLeft + cases.clientWidth >= cases.scrollWidth - 4;
  };
  cases.addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  document.querySelectorAll('.slider-ctrl .round').forEach((b) => b.addEventListener('click', () => {
    const i = Math.max(0, Math.min(cards.length - 1, index() + Number(b.dataset.dir)));
    cases.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  }));
  sync();
});
