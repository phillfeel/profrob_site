/* Страница «База знаний» (knowledge.html): фильтр материалов по разделу и поиск.
   Раздел приходит в ?topic=<slug> или кликом по карточке раздела / чипу. Поиск фильтрует материалы и вопросы FAQ по тексту
   на текущем языке: все слова запроса должны встретиться (без учёта регистра, ё = е). Нет совпадений — пустое состояние.
   Без JS видны все материалы, фильтр работает как обычные ссылки. Текстов в скрипте нет. */
(window.i18n ? window.i18n.ready : Promise.resolve()).then(() => {
  'use strict';
  const list = document.getElementById('kb-list');
  const empty = document.querySelector('.kb-empty');
  const input = document.getElementById('kb-q');
  if (!list || !empty || !input) return;

  const items = [...list.querySelectorAll('.kb-item[data-topic]')];
  const chips = [...document.querySelectorAll('.kb-chip[data-topic]')];
  const cards = [...document.querySelectorAll('.kb-cat__go[data-topic]')];
  const known = new Set(cards.map((a) => a.dataset.topic));
  const questions = [...document.querySelectorAll('.kb-q')];
  const noQuestions = document.querySelector('.kb-qa__none');
  const titles = [...empty.querySelectorAll('[data-kind]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
  const matches = (el, words) => { const t = norm(el.textContent); return words.every((w) => t.includes(w)); };

  let topic = '';
  const apply = () => {
    const words = norm(input.value).split(' ').filter(Boolean);
    let shown = 0;
    items.forEach((el) => {
      const on = (!topic || el.dataset.topic === topic) && matches(el, words);
      el.hidden = !on;
      if (on) shown += 1;
    });
    empty.hidden = shown > 0;
    titles.forEach((h) => { h.hidden = h.dataset.kind !== (words.length ? 'search' : 'topic'); });
    chips.forEach((c) => { if (c.dataset.topic === topic) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current'); });
    cards.forEach((a) => { if (topic && a.dataset.topic === topic) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });

    // FAQ: поиск раскрывает подходящие ответы; открытые поиском закрываются, когда запрос стёрт
    let hits = 0;
    questions.forEach((q) => {
      const on = !words.length || matches(q, words);
      q.hidden = !on;
      if (on) hits += 1;
      if (words.length && on && !q.open) { q.open = true; q.dataset.auto = '1'; }
      if (!words.length && q.dataset.auto) { q.open = false; delete q.dataset.auto; }
    });
    if (noQuestions) noQuestions.hidden = hits > 0;
  };

  const setTopic = (slug) => { topic = known.has(slug) ? slug : ''; apply(); return topic; };
  setTopic(new URLSearchParams(location.search).get('topic') || '');

  // Переход по ссылке на вопрос (#faq-…) раскрывает ответ
  const openTarget = () => {
    const q = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (q && q.classList.contains('kb-q')) q.open = true;
  };
  openTarget();
  addEventListener('hashchange', openTarget);

  input.addEventListener('input', apply);
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape' && input.value) { input.value = ''; apply(); } });

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-topic]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    if (a.closest('.kb-empty')) input.value = ''; // «Показать все» сбрасывает и поиск
    const slug = setTopic(a.dataset.topic);
    const url = new URL(location.href);
    if (slug) url.searchParams.set('topic', slug); else url.searchParams.delete('topic');
    url.hash = '';
    history.replaceState(null, '', url);
    // Карточка раздела и «Показать все» уводят к списку, чип оставляет на месте
    if (!a.classList.contains('kb-chip')) document.getElementById('materials').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });
});
