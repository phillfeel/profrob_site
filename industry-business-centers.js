/* Бизнес-центры: чек-лист «Здание, готовое к роботам» — считает отмеченные пункты и меняет вывод в штампе.
   Без JS чек-лист остаётся списком с исходным текстом вывода. */
(() => {
  'use strict';

  const list = document.querySelector('[data-ready]');
  if (!list) return;
  const boxes = [...list.querySelectorAll('input[type="checkbox"]')];
  const count = document.querySelector('[data-ready-n]');
  const verdict = document.querySelector('[data-ready-verdict]');
  const bars = [...document.querySelectorAll('.bcr__bar i')];
  const stamp = document.querySelector('.bcr__stamp');
  const intro = verdict.textContent;
  const title = (b) => b.closest('.bcr__i').querySelector('b').textContent.replace(/^\d+ · /, '').replace(/^./, (c) => c.toLowerCase());

  const text = (n, missing) => {
    const total = boxes.length;
    if (n === 0) return intro;
    if (n === total) return 'Здание готово по стандарту MR. Можно сразу планировать пилот на нескольких этажах и паркинге.';
    const what = missing.map(title).join(', ');
    if (n >= total - 1) return `Почти готово. Не хватает одного: ${what}. Пилот можно начинать, доработку планируем параллельно.`;
    if (n >= 2) return `Готово частично. Пилот начнём в зонах, где всё есть. Не хватает: ${what} — план доработок дадим после аудита.`;
    return 'Здание к роботам почти не готовили. Это обычная ситуация: начнём с одной зоны, например лобби или одного этажа, и составим план доработок на аудите.';
  };

  const render = () => {
    const missing = boxes.filter((b) => !b.checked);
    const n = boxes.length - missing.length;
    count.textContent = n;
    bars.forEach((b, i) => b.classList.toggle('on', i < n));
    stamp.dataset.level = n === boxes.length ? 'ready' : n >= 2 ? 'part' : n ? 'start' : '';
    verdict.textContent = text(n, missing);
  };

  list.addEventListener('change', render);
  render();
})();
