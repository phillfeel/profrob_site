/* Страница «Контакты»: выбор действия из мини-CTA подставляется в форму, счётчик разделов над тёмной сценой светлеет.
   Появление блоков, счётчик и сама форма живут в solutions.js. */
(window.i18n ? window.i18n.ready : Promise.resolve()).then(() => {
  'use strict';

  // ---------- Мини-CTA «Запросить КП» / «Заказать демо или пилот»: подставляем цель в форму ----------
  const select = document.getElementById('f-intent');
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('[data-intent]');
    if (!a || !select) return;
    select.value = a.getAttribute('data-intent');
    const fld = select.closest('.fld');
    fld.classList.remove('is-picked');
    void fld.offsetWidth; // перезапуск подсветки при повторном клике
    fld.classList.add('is-picked');
  });

  // ---------- Счётчик разделов: над тёмной сценой цифры светлые (как в products.js) ----------
  const counter = document.querySelector('.counter');
  const dark = [...document.querySelectorAll('[data-dark]')];
  if (counter && dark.length) {
    const sync = () => {
      const r = counter.getBoundingClientRect(), mid = r.top + r.height / 2;
      counter.classList.toggle('on-dark', dark.some((s) => { const b = s.getBoundingClientRect(); return b.top <= mid && b.bottom >= mid; }));
    };
    addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
  }
});
