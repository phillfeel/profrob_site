/* ПРОФРОБОТ — страница ROI-калькулятора. Модель расчёта — roi-model.js (window.ROI). */
(() => {
  'use strict';
  const { TYPES, MODES, K, calc, autoStaff, staffRange } = window.ROI;
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NB = ' ';

  // ---------- Формат чисел по правилам бренда: неразрывные пробелы, десятичная запятая ----------
  const group = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  const dec1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',').replace(',0', '');
  /** Деньги крупно: «1,8» + «млн ₽» или «860» + «тыс. ₽». */
  const money = (v) => {
    const a = Math.abs(v), s = v < 0 ? '−' : '';
    if (a >= 1e6) return { n: s + dec1(a / 1e6), u: `млн${NB}₽` };
    return { n: s + group(a / 1e3), u: `тыс.${NB}₽` };
  };
  const moneyStr = (v) => { const m = money(v); return `${m.n}${NB}${m.u}`; };
  /** Со знаком: «+1,8 млн ₽» или «−27 тыс. ₽». */
  const signed = (v) => `${v >= 0 ? '+' : ''}${moneyStr(v)}`;
  const plural = (n, one, few, many) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  };

  // ---------- Цели Метрики: вызываются, только если счётчик подключён ----------
  const goal = (name, params) => {
    try { if (typeof window.ym === 'function' && window.YM_ID) window.ym(window.YM_ID, 'reachGoal', name, params); } catch (_) { /* метрика не должна ломать страницу */ }
  };

  // ---------- Состояние: из ссылки или по умолчанию ----------
  const FIN = ['buy', 'lease'], WHO = ['own', 'contractor'];
  const state = { type: 'office', area: TYPES.office.area0, mode: 'one', staff: null, wage: K.wage0, who: 'own', fin: 'buy' };
  (() => {
    const q = new URLSearchParams(location.search);
    if (TYPES[q.get('t')]) { state.type = q.get('t'); state.area = TYPES[state.type].area0; state.mode = TYPES[state.type].mode0; }
    if (MODES[q.get('m')]) state.mode = q.get('m');
    const a = parseInt(q.get('a'), 10); if (Number.isFinite(a)) state.area = a;
    const s = parseInt(q.get('s'), 10); if (Number.isFinite(s)) state.staff = s;
    const w = parseInt(q.get('w'), 10); if (Number.isFinite(w)) state.wage = w;
    if (WHO.includes(q.get('c'))) state.who = q.get('c');
    if (FIN.includes(q.get('f'))) state.fin = q.get('f');
  })();

  const el = {
    area: $('#in-area'), staff: $('#in-staff'), wage: $('#in-wage'),
    outArea: $('#out-area'), outStaff: $('#out-staff'), outWage: $('#out-wage'),
    areaMin: $('#area-min'), areaMax: $('#area-max'), hint: $('#staff-hint'),
    net: $('#r-net'), netU: $('#r-net-u'), plateV: $('#r-plate-v'), plateL: $('#r-plate-l'),
    fy: $('#r-5y'), freed: $('#r-freed'), robots: $('#r-robots'), ctx: $('#ctx'),
    chart: $('#chart'), crew: $('#crew'), crewL: $('#crew-l'), sum: $('#lead-sum'),
    dock: $('#dock'), dockV: $('#dock-v'), out: $('#roi-out'),
  };

  // ---------- Сегмент-контролы (радиогруппы с клавиатурой) ----------
  const segs = [...document.querySelectorAll('.seg[data-name]')];
  const segKey = { type: 'type', mode: 'mode', who: 'who', fin: 'fin' };
  segs.forEach((seg) => {
    const key = segKey[seg.dataset.name];
    seg.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]');
      if (!b || b.hidden) return;
      setSeg(key, b.dataset.v);
    });
    seg.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const bs = [...seg.querySelectorAll('button:not([hidden])')];
      const i = bs.findIndex((b) => b.getAttribute('aria-checked') === 'true');
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
      const nb = bs[(i + d + bs.length) % bs.length];
      setSeg(key, nb.dataset.v);
      nb.focus();
    });
  });

  function setSeg(key, v) {
    if (state[key] === v) return;
    state[key] = v;
    if (key === 'type') {
      const t = TYPES[v];
      state.staff = null;
      if (state.area < t.area[0] || state.area > t.area[1]) state.area = t.area0;
      if (t.modes && !t.modes.includes(state.mode)) state.mode = t.mode0;
    }
    touched();
    render();
  }

  // ---------- Ползунки ----------
  const setP = (input) => {
    const p = (input.value - input.min) / ((input.max - input.min) || 1) * 100;
    input.style.setProperty('--p', `${p}%`);
  };
  el.area.addEventListener('input', () => { state.area = +el.area.value; touched(); render(); });
  el.wage.addEventListener('input', () => { state.wage = +el.wage.value; touched(); render(); });
  el.staff.addEventListener('input', () => { state.staff = +el.staff.value; touched(); render(); });
  el.hint.addEventListener('click', (e) => {
    if (e.target.closest('button')) { state.staff = null; render(); el.staff.focus(); }
  });

  let started = false, changeTimer = 0;
  function touched() {
    if (!started) { started = true; goal('calc_start'); }
    clearTimeout(changeTimer);
    changeTimer = setTimeout(() => goal('calc_change', snapshot()), 1500);
  }

  // ---------- Плавная смена крупной цифры ----------
  let shownNet = 0, rafId = 0;
  function tweenNet(to) {
    cancelAnimationFrame(rafId);
    const from = shownNet, t0 = performance.now(), dur = reduce ? 0 : 420;
    const step = (now) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      const e = 1 - Math.pow(1 - k, 3);
      shownNet = from + (to - from) * e;
      const m = money(shownNet);
      el.net.textContent = m.n; el.netU.textContent = m.u;
      if (k < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }

  // ---------- График накопленной выгоды ----------
  const SVGNS = 'http://www.w3.org/2000/svg';
  function node(tag, attrs, text) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  function series(r) {
    const pts = [];
    for (let m = 0; m <= 60; m++) {
      let v;
      if (state.fin === 'buy') v = -r.invest + r.net / 12 * m;
      else v = -r.leaseAdvance + r.net / 12 * m - r.leaseMonthly * Math.min(m, K.leaseMonths);
      pts.push(v);
    }
    return pts;
  }
  function drawChart(r) {
    const svg = el.chart, W = 520, H = 170, L = 4, R = 4, T = 26, B = 22;
    const pts = series(r);
    const lo = Math.min(0, ...pts), hi = Math.max(0, ...pts);
    const X = (m) => L + (W - L - R) * m / 60;
    const Y = (v) => T + (H - T - B) * (1 - (v - lo) / ((hi - lo) || 1));
    svg.replaceChildren();
    [12, 24, 36, 48].forEach((m) => svg.append(node('line', { class: 'ax', x1: X(m), x2: X(m), y1: T, y2: H - B })));
    svg.append(node('line', { class: 'zero', x1: L, x2: W - R, y1: Y(0), y2: Y(0) }));
    const d = pts.map((v, m) => `${m ? 'L' : 'M'}${X(m).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
    svg.append(node('path', { class: 'area', d: `${d}L${X(60)} ${Y(lo)}L${X(0)} ${Y(lo)}Z` }));
    svg.append(node('path', { class: 'ln', d }));
    [['0', 0, 'start'], ['1 год', 12, 'middle'], ['2', 24, 'middle'], ['3', 36, 'middle'], ['4', 48, 'middle'], ['5 лет', 60, 'end']]
      .forEach(([t, m, a]) => svg.append(node('text', { x: X(m), y: H - 4, 'text-anchor': a }, t)));
    // Точка окупаемости: первый месяц, где накопленная выгода ≥ 0
    const pm = pts.findIndex((v) => v >= 0);
    if (pm > 0) {
      const x = X(pm), y = Y(0);
      svg.append(node('circle', { class: 'pt', cx: x, cy: y, r: 7 }));
      const right = x < W - 190;
      svg.append(node('text', { class: 'hl', x: right ? x + 14 : x - 14, y: y + 22, 'text-anchor': right ? 'start' : 'end' }, `окупился на ${pm}-м мес.`));
    }
    const end = pts[60];
    svg.append(node('text', { class: 'hl', x: W - R, y: Math.max(14, Y(end) - 10), 'text-anchor': 'end' }, signed(end)));
  }

  // ---------- Бригада: роботы + люди, высвобожденные ставки подсвечены ----------
  function drawCrew(r) {
    const MAX = 36, shown = Math.min(r.staff, MAX);
    const free = Math.max(1, Math.round(r.freed));
    const frag = document.createDocumentFragment();
    for (let i = 0; i < r.robots && i < 6; i++) frag.append(Object.assign(document.createElement('i'), { className: 'bot' }));
    for (let i = 0; i < shown; i++) frag.append(Object.assign(document.createElement('i'), { className: i < free ? 'free' : '' }));
    if (r.staff > MAX) frag.append(Object.assign(document.createElement('em'), { textContent: `+${r.staff - MAX}` }));
    el.crew.replaceChildren(frag);
    el.crewL.innerHTML = `<b>${free} из ${r.staff}</b> ${plural(r.staff, 'ставки', 'ставок', 'ставок')} переходят с полов на другие задачи`;
  }

  // ---------- Главный рендер ----------
  let lastResult = null, urlTimer = 0;
  function render() {
    const t = TYPES[state.type];
    const input = { type: state.type, area: state.area, mode: state.mode, staff: state.staff ?? undefined, wage: state.wage, contractor: state.who === 'contractor' };
    const r = calc(input);
    state.area = r.area; state.mode = r.mode; state.wage = r.wage;
    if (state.staff != null) state.staff = r.staff;
    lastResult = r;

    // Сегменты
    segs.forEach((seg) => {
      const key = segKey[seg.dataset.name];
      seg.querySelectorAll('button[data-v]').forEach((b) => {
        if (key === 'mode') b.hidden = !!(t.modes && !t.modes.includes(b.dataset.v));
        const on = b.dataset.v === state[key];
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
      });
    });

    // Ползунки
    Object.assign(el.area, { min: t.area[0], max: t.area[1] }); el.area.value = r.area;
    Object.assign(el.staff, { min: r.staffRange[0], max: r.staffRange[1] }); el.staff.value = r.staff;
    Object.assign(el.wage, { min: K.wage[0], max: K.wage[1] }); el.wage.value = r.wage;
    [el.area, el.staff, el.wage].forEach(setP);
    el.outArea.innerHTML = `${group(r.area)}<small>м²</small>`;
    el.outStaff.innerHTML = `${r.staff}<small>${plural(r.staff, 'человек', 'человека', 'человек')}</small>`;
    el.outWage.innerHTML = `${group(r.wage)}<small>₽/мес</small>`;
    el.area.setAttribute('aria-valuetext', `${group(r.area)} квадратных метров`);
    el.staff.setAttribute('aria-valuetext', `${r.staff} ${plural(r.staff, 'человек', 'человека', 'человек')}`);
    el.wage.setAttribute('aria-valuetext', `${group(r.wage)} рублей в месяц`);
    el.areaMin.textContent = `${group(t.area[0])} м²`; el.areaMax.textContent = `${group(t.area[1])} м²`;
    el.hint.innerHTML = state.staff == null
      ? 'Подставили по норме для такой площади. Можно поправить.'
      : `Ваше значение. Норма для площади — ${autoStaff(state.type, r.area, r.mode)}. <button type="button">Вернуть норму</button>`;

    // Результат
    tweenNet(r.net);
    el.ctx.textContent = `${t.name} · ${group(r.area)} м² · ${MODES[r.mode].name}`;
    if (state.fin === 'buy') {
      el.plateV.textContent = `${Math.max(1, Math.round(r.payback))}${NB}${plural(Math.round(r.payback), 'месяц', 'месяца', 'месяцев')}`;
      el.plateL.textContent = 'окупаемость покупки';
    } else {
      el.plateV.textContent = signed(r.leasePlus);
      el.plateL.textContent = r.leasePlus >= 0
        ? 'в месяц после платежа по лизингу — с первого месяца'
        : 'в месяц, пока идёт лизинг; после — экономия целиком ваша';
    }
    el.fy.innerHTML = `${money(r.fiveYears).n}<small>${money(r.fiveYears).u}</small>`;
    el.freed.textContent = dec1(r.freed);
    el.robots.textContent = String(r.robots);
    el.dockV.textContent = moneyStr(r.net);
    drawChart(r);
    drawCrew(r);
    el.sum.innerHTML = `${t.name} · ${group(r.area)}${NB}м² · ${MODES[r.mode].name} · ${r.staff} ${plural(r.staff, 'уборщик', 'уборщика', 'уборщиков')}<br>Экономия <b>${moneyStr(r.net)}</b> в год · ${state.fin === 'buy' ? `окупаемость ${Math.round(r.payback)} мес.` : `лизинг ${signed(r.leasePlus)}/мес`}`;

    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => history.replaceState(null, '', shareUrl()), 300);
  }

  function snapshot() {
    const r = lastResult;
    return {
      type: state.type, area: r.area, mode: r.mode, staff: r.staff, wage: r.wage, who: state.who, fin: state.fin,
      net: Math.round(r.net), payback: Math.round(r.payback), fiveYears: Math.round(r.fiveYears), robots: r.robots, freed: +r.freed.toFixed(1),
    };
  }
  function shareUrl() {
    const r = lastResult, q = new URLSearchParams({ t: state.type, a: r.area, m: r.mode, w: r.wage, c: state.who, f: state.fin });
    if (state.staff != null) q.set('s', r.staff);
    return `${location.origin}${location.pathname}?${q}`;
  }

  // ---------- Тост ----------
  let toastT = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2400);
  }

  // ---------- Поделиться ----------
  $('#share').addEventListener('click', async () => {
    const url = shareUrl();
    const text = `Робот сэкономит ${moneyStr(lastResult.net)} в год на нашем объекте — расчёт ПРОФРОБОТ`;
    goal('calc_share');
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: 'ROI-калькулятор ПРОФРОБОТ', text, url }); return; }
      await navigator.clipboard.writeText(url);
      toast('Ссылка на расчёт скопирована');
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      window.prompt('Скопируйте ссылку на расчёт:', url);
    }
  });

  // ---------- Картинка для соцсетей и мессенджеров (1200×630) ----------
  const logo = new Image(); logo.src = 'assets/profrobot-logo-inverse.png';
  $('#card').addEventListener('click', async () => {
    goal('calc_card');
    try {
      await document.fonts.ready;
      const r = lastResult, t = TYPES[state.type], W = 1200, H = 630;
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d');
      g.fillStyle = '#1c1e22'; g.fillRect(0, 0, W, H);
      const glow = g.createRadialGradient(W / 2, 0, 0, W / 2, 0, 700);
      glow.addColorStop(0, 'rgba(255,255,255,.08)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = glow; g.fillRect(0, 0, W, H);
      g.fillStyle = '#2f3bff'; g.fillRect(0, H - 6, W, 6);
      if (logo.complete && logo.naturalWidth) g.drawImage(logo, 72, 64, 176, 176 * logo.naturalHeight / logo.naturalWidth);
      g.fillStyle = '#a3a8b1'; g.font = '500 20px "JetBrains Mono", monospace';
      g.fillText(`${t.name} · ${group(r.area)} м² · ${MODES[r.mode].name}`.toUpperCase(), 72, 176);
      g.fillStyle = '#f3f2ef'; g.font = '600 40px Onest, sans-serif';
      g.fillText('Робот сэкономит в год', 72, 250);
      const m = money(r.net);
      g.font = '700 150px Onest, sans-serif'; g.fillText(m.n, 66, 400);
      const nw = g.measureText(m.n).width;
      g.fillStyle = '#9ba2ff'; g.font = '700 58px Onest, sans-serif'; g.fillText(m.u, 66 + nw + 20, 400);
      const plate = state.fin === 'buy' ? `Окупаемость ${Math.round(r.payback)} мес.` : `${signed(r.leasePlus)} в месяц в лизинге`;
      g.font = '700 32px Onest, sans-serif';
      const pw = g.measureText(plate).width + 48;
      g.fillStyle = '#c8ff3c'; roundRect(g, 72, 446, pw, 64, 16); g.fill();
      g.fillStyle = '#16181c'; g.fillText(plate, 96, 489);
      g.fillStyle = '#a3a8b1'; g.font = '500 20px "JetBrains Mono", monospace';
      g.fillText(`ЗА 5 ЛЕТ: ${signed(r.fiveYears).toUpperCase()}`, 72, 566);
      g.textAlign = 'right'; g.fillStyle = '#f3f2ef'; g.fillText('PROFROBOT.RU/ROI', W - 72, 566);
      const blob = await new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'));
      const file = new File([blob], 'profrobot-roi.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ files: [file], title: 'Расчёт ПРОФРОБОТ', url: shareUrl() });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'profrobot-roi.png'; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast('Картинка с расчётом сохранена');
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      toast('Не получилось собрать картинку. Попробуйте «Поделиться»');
    }
  });
  function roundRect(g, x, y, w, h, rr) {
    g.beginPath(); g.moveTo(x + rr, y); g.arcTo(x + w, y, x + w, y + h, rr); g.arcTo(x + w, y + h, x, y + h, rr);
    g.arcTo(x, y + h, x, y, rr); g.arcTo(x, y, x + w, y, rr); g.closePath();
  }

  // ---------- Мобильная плашка: видна, пока результат вне экрана, а форма ещё не видна ----------
  if ('IntersectionObserver' in window) {
    const vis = { out: true, lead: false, calc: true };
    const upd = () => {
      const on = !vis.out && !vis.lead && vis.calc;
      el.dock.classList.toggle('on', on);
      el.dock.setAttribute('aria-hidden', String(!on));
      el.dock.tabIndex = on ? 0 : -1;
    };
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { vis[e.target.dataset.io] = e.isIntersecting; });
      upd();
    }, { threshold: 0.08 });
    el.out.dataset.io = 'out'; $('#lead').dataset.io = 'lead'; $('#calc').dataset.io = 'calc';
    [el.out, $('#lead'), $('#calc')].forEach((n) => io.observe(n));
  }
  $('#to-lead').addEventListener('click', () => goal('calc_to_lead'));

  // ---------- Заявка ----------
  const form = $('#lead-form');
  const phone = $('#f-phone');
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d.startsWith('8') || d.startsWith('7')) d = d.slice(1);
    d = d.slice(0, 10);
    const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)];
    phone.value = d ? `+7 ${p[0]}${p[1] ? ' ' + p[1] : ''}${p[2] ? '-' + p[2] : ''}${p[3] ? '-' + p[3] : ''}` : '';
  });

  const rules = {
    name: () => $('#f-name').value.trim().length >= 2,
    phone: () => phone.value.replace(/\D/g, '').length === 11,
    email: () => { const v = $('#f-email').value.trim(); return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
    consent: () => $('#f-consent').checked,
  };
  const inputs = { name: $('#f-name'), phone, email: $('#f-email'), consent: $('#f-consent') };
  const check = (k) => {
    const ok = rules[k]();
    $(`#e-${k}`).classList.toggle('on', !ok);
    inputs[k].setAttribute('aria-invalid', String(!ok));
    inputs[k].setAttribute('aria-describedby', `e-${k}`);
    return ok;
  };
  Object.keys(inputs).forEach((k) => inputs[k].addEventListener(k === 'consent' ? 'change' : 'blur', () => {
    if (inputs[k].getAttribute('aria-invalid') != null || inputs[k].value) check(k);
  }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#e-form').classList.remove('on');
    const bad = Object.keys(rules).filter((k) => !check(k));
    if (bad.length) { inputs[bad[0]].focus(); return; }
    const btn = $('#f-submit');
    btn.disabled = true;
    const payload = {
      name: $('#f-name').value.trim(), phone: phone.value, company: $('#f-company').value.trim(), email: $('#f-email').value.trim(),
      calc: snapshot(), url: shareUrl(), source: 'roi-calculator',
    };
    try {
      const endpoint = form.dataset.endpoint;
      if (endpoint) {
        const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 10000);
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal });
        clearTimeout(to);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // Прототип: бэкенда ещё нет, заявку показываем в консоли
        console.info('[ROI] заявка', payload);
        await new Promise((r) => setTimeout(r, 500));
      }
      goal('lead_calc', payload.calc);
      form.hidden = true;
      const done = $('#lead-done'); done.hidden = false; done.focus();
    } catch (err) {
      $('#e-form').classList.add('on');
    } finally {
      btn.disabled = false;
    }
  });

  render();
})();
