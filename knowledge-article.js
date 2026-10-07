/* Статья базы знаний: подсветка текущего раздела в оглавлении и раскрытие вопроса по якорю (#faq-…).
   Без JS оглавление остаётся обычным списком ссылок. Текстов в скрипте нет. */
(window.i18n ? window.i18n.ready : Promise.resolve()).then(() => {
  'use strict';
  const links = [...document.querySelectorAll('.ar-toc__list a')];
  const targets = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);

  if (targets.length) {
    const update = () => {
      const line = innerHeight * 0.35;
      const cur = targets.filter((t) => t.getBoundingClientRect().top <= line).pop() || targets[0];
      links.forEach((a) => {
        if (a.getAttribute('href') === `#${cur.id}`) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
  }

  const openTarget = () => {
    const q = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (q && q.classList.contains('kb-q')) q.open = true;
  };
  openTarget();
  addEventListener('hashchange', openTarget);
});
