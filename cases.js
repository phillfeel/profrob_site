/* Страница «Кейсы» (cases.html): фильтр по отрасли.
   Отрасль приходит в ?industry=<slug> (ссылки «Кейсы: …» с отраслевых лендингов) или кликом по фильтру.
   Есть кейсы этой отрасли — показываем только их. Кейсов нет, но отрасль известна — пустое состояние со ссылкой на её страницу.
   Неизвестный slug — все кейсы. Без JS видны все кейсы, фильтр работает как обычные ссылки. Текстов в скрипте нет. */
(() => {
  'use strict';
  const list = document.querySelector('.cs-list');
  const empty = document.querySelector('.cs-empty');
  if (!list || !empty) return;

  const items = [...list.querySelectorAll('.cs[data-industry]')];
  const chips = [...document.querySelectorAll('.cs-chip[data-filter]')];
  const withCases = new Set(items.map((el) => el.dataset.industry));
  const emptyParts = [...empty.querySelectorAll('[data-ind]')];
  const withoutCases = new Set(emptyParts.map((el) => el.dataset.ind));

  const apply = (slug) => {
    const filter = withCases.has(slug) ? slug : '';
    const none = !filter && withoutCases.has(slug) ? slug : '';
    items.forEach((el) => { el.hidden = Boolean(none) || (filter !== '' && el.dataset.industry !== filter); });
    chips.forEach((c) => {
      if (!none && c.dataset.filter === filter) c.setAttribute('aria-current', 'true');
      else c.removeAttribute('aria-current');
    });
    empty.hidden = !none;
    emptyParts.forEach((el) => { el.hidden = el.dataset.ind !== none; });
    return filter || none;
  };

  apply(new URLSearchParams(location.search).get('industry') || '');

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-filter]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    const slug = apply(a.dataset.filter);
    const url = new URL(location.href);
    if (slug) url.searchParams.set('industry', slug); else url.searchParams.delete('industry');
    url.hash = '';
    history.replaceState(null, '', url);
    // Из пустого состояния «Показать все» уводит вверх списка, иначе остаёмся на месте
    if (!a.classList.contains('cs-chip')) document.getElementById('list').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
})();
