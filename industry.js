/* Отраслевые лендинги (industries-*.html): то, чего нет в solutions.js.
   Появление блоков, счётчик разделов и форма — в solutions.js, он подключён раньше. */
(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Направление в форме по якорю ----------
  // Пришли по ссылке на направление (#delivery) — оно выбрано в форме, и в заявку уходит source с якорем.
  const form = document.getElementById('lead-form');
  const select = form && form.elements.namedItem('direction');
  if (form && select) {
    const base = form.dataset.source;
    const sync = () => {
      const anchor = decodeURIComponent(location.hash.slice(1));
      if (!anchor || ![...select.options].some((o) => o.value === anchor)) return;
      select.value = anchor;
      form.dataset.source = `${base}#${anchor}`;
    };
    sync();
    addEventListener('hashchange', sync);
    select.addEventListener('change', () => {
      form.dataset.source = select.value ? `${base}#${select.value}` : base;
    });
  }

  // ---------- Маршрут по клинике: без анимации при reduced motion ----------
  const route = document.querySelector('.route__svg');
  if (route && reduce && route.pauseAnimations) route.pauseAnimations();

  // ---------- Мини-калькулятор уборки (модель roi-model.js) ----------
  const calc = document.querySelector('[data-calc]');
  if (!calc || !window.ROI) return;
  const { TYPES, calc: compute } = window.ROI;
  const area = calc.querySelector('#calc-area');
  const out = (k) => calc.querySelector(`[data-out="${k}"]`);
  const nf = new Intl.NumberFormat('ru-RU');
  const radios = (name) => [...calc.querySelectorAll(`input[name="${name}"]`)];
  const checked = (name) => radios(name).find((r) => r.checked).value;

  // Склад не убирают в одну смену (как в модели): прячем недоступные режимы
  const syncModes = (type) => {
    const allowed = TYPES[type].modes;
    radios('calc-mode').forEach((r) => {
      const ok = !allowed || allowed.includes(r.value);
      r.disabled = !ok;
      r.closest('.seg__o').hidden = !ok;
    });
    if (radios('calc-mode').find((r) => r.checked).disabled) {
      radios('calc-mode').find((r) => r.value === TYPES[type].mode0).checked = true;
    }
  };

  const render = () => {
    const type = checked('calc-type');
    const a = Number(area.value);
    const r = compute({ type, area: a, mode: checked('calc-mode') });
    const areaText = `${nf.format(a)} м²`;
    out('area').textContent = areaText;
    area.setAttribute('aria-valuetext', areaText);
    out('payback').textContent = Number.isFinite(r.payback)
      ? `≈ ${Math.round(r.payback)} мес`
      : 'Не окупается при этих условиях, разберём на аудите';
    out('net').textContent = `≈ ${(r.net / 1e6).toFixed(1).replace('.', ',')} млн ₽`;
    out('link').href = `roi.html?t=${type}&a=${r.area}&m=${r.mode}`;
  };

  calc.addEventListener('change', (e) => {
    if (e.target.name === 'calc-type') {
      const t = TYPES[e.target.value];
      area.min = t.area[0];
      area.max = t.area[1];
      area.value = t.area0;
      radios('calc-mode').find((r) => r.value === t.mode0).checked = true;
      syncModes(e.target.value);
    }
    render();
  });
  area.addEventListener('input', render);
  calc.addEventListener('submit', (e) => e.preventDefault());
  syncModes(checked('calc-type'));
  render();
})();
