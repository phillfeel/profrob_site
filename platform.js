/* Страница «Платформа»: вкладки «Возможности» (клик, стрелки, автопереключение) и переход от «проблемы» к нужной вкладке.
   Появление блоков, счётчик разделов и форма живут в solutions.js, data-pick и счётчик над тёмной сценой — в products.js. */
(window.i18n ? window.i18n.ready : Promise.resolve()).then(() => {
  'use strict';

  const root = document.querySelector('[data-tabs]');
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEP_MS = 7000;
  let current = 0;
  let timer = 0;
  let stopped = reduce; // автопереключение выключаем навсегда после первого действия человека

  const select = (i, { focus = false, scroll = true } = {}) => {
    current = (i + tabs.length) % tabs.length;
    tabs.forEach((t, k) => {
      const on = k === current;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    if (focus) tabs[current].focus();
    // На узких экранах список — горизонтальная лента: держим выбранную вкладку в поле зрения
    if (scroll && tabs[current].offsetParent) {
      const list = tabs[current].parentElement;
      if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: tabs[current].offsetLeft - 20, behavior: reduce ? 'auto' : 'smooth' });
    }
    restart();
  };

  const stop = () => { stopped = true; clearTimeout(timer); root.classList.remove('is-auto'); };
  const restart = () => {
    clearTimeout(timer);
    root.classList.remove('is-auto');
    if (stopped || !inView) return;
    void root.offsetWidth; // перезапуск CSS-анимации полосы прогресса
    root.style.setProperty('--dur', `${STEP_MS}ms`);
    root.classList.add('is-auto');
    timer = setTimeout(() => select(current + 1, { scroll: false }), STEP_MS);
  };

  let inView = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; restart(); }, { threshold: 0.35 }).observe(root);
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => { stop(); select(i); }));
  root.addEventListener('keydown', (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) { e.preventDefault(); stop(); select(current + keys[e.key], { focus: true }); }
    else if (e.key === 'Home') { e.preventDefault(); stop(); select(0, { focus: true }); }
    else if (e.key === 'End') { e.preventDefault(); stop(); select(tabs.length - 1, { focus: true }); }
  });
  // Человек читает или навёл курсор: не переключаем из-под рук
  root.addEventListener('pointerenter', () => { if (!stopped) { clearTimeout(timer); root.classList.remove('is-auto'); } });
  root.addEventListener('pointerleave', restart);
  root.addEventListener('focusin', stop);

  // «Решает: …» в блоке проблем и любые ссылки с data-cap: открываем нужную вкладку, потом браузер прокручивает к блоку
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('[data-cap]');
    if (!a) return;
    const i = tabs.findIndex((t) => t.id === `t-${a.getAttribute('data-cap')}`);
    if (i >= 0) { stop(); select(i, { scroll: false }); }
  });

  // Панели без JS видны все подряд; с JS показываем одну
  select(0, { scroll: false });
});
