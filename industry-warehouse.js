/* Склады и логистика: легенда плана и «Путь заказа» подсвечивают одну и ту же зону A–E на плане склада.
   Роботы на плане едут по SMIL; при prefers-reduced-motion анимацию ставим на паузу. Без библиотек. */
(window.i18n ? window.i18n.ready : Promise.resolve()).then(() => {
  'use strict';

  const plan = document.querySelector('.wh-plan');
  if (plan && window.matchMedia('(prefers-reduced-motion: reduce)').matches && plan.pauseAnimations) plan.pauseAnimations();

  const zones = new Map([...document.querySelectorAll('.wh-zone[data-zone]')].map((z) => [z.dataset.zone, z]));
  const stages = new Map([...document.querySelectorAll('.wh-stage[data-zone]')].map((s) => [s.dataset.zone, s]));
  const set = (letter, on) => {
    const z = zones.get(letter), s = stages.get(letter);
    if (z) z.classList.toggle('is-on', on);
    if (s) s.classList.toggle('is-on', on);
  };

  document.querySelectorAll('.wh-leg a[data-zone], .wh-stage[data-zone]').forEach((el) => {
    const letter = el.dataset.zone;
    el.addEventListener('mouseenter', () => set(letter, true));
    el.addEventListener('mouseleave', () => set(letter, false));
    el.addEventListener('focusin', () => set(letter, true));
    el.addEventListener('focusout', () => set(letter, false));
  });

  // Before/after bars grow once a card is on screen.
  const cases = [...document.querySelectorAll('.wh-case')];
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cases.forEach((c) => c.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.3 });
    cases.forEach((c) => io.observe(c));
  }
});
