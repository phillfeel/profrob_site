/* Страница «Решения»: появление блоков, счётчик разделов, форма заявки.
   Без зависимостей: GSAP и Lenis на этой странице не нужны. */
(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Reveal ----------
  const revealEls = [...document.querySelectorAll('.reveal')];
  const show = (el) => { el.style.opacity = '1'; el.style.transform = 'none'; };
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(show);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach((el) => io.observe(el));
  }

  // ---------- Счётчик разделов ----------
  const counter = document.querySelector('.counter');
  const sections = [...document.querySelectorAll('[data-sec]')];
  if (counter && sections.length) {
    const cur = counter.querySelector('.cur');
    const lbl = counter.querySelector('.lbl');
    const bar = counter.querySelector('.bar i');
    let active = null;
    const sync = () => {
      const mid = window.innerHeight * 0.5;
      const sec = sections.reduce((acc, s) => (s.getBoundingClientRect().top <= mid ? s : acc), sections[0]);
      if (sec === active) return;
      active = sec;
      cur.textContent = sec.dataset.sec;
      lbl.textContent = sec.dataset.name;
      bar.style.transition = 'transform .6s var(--ease)';
      bar.style.transform = `scaleY(${+sec.dataset.sec / sections.length})`;
    };
    addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
  }

  // ---------- Форма ----------
  const form = document.getElementById('lead-form');
  if (!form) return;

  const els = {
    name: form.elements.namedItem('name'),
    phone: form.elements.namedItem('phone'),
    consent: form.elements.namedItem('consent'),
    website: form.elements.namedItem('website'),
    direction: form.elements.namedItem('direction'),
  };
  const status = document.getElementById('f-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Маска телефона: +7 (XXX) XXX-XX-XX
  const formatPhone = (raw) => {
    let d = raw.replace(/\D/g, '');
    if (d.startsWith('8') || d.startsWith('7')) d = d.slice(1);
    d = d.slice(0, 10);
    if (!d) return '';
    let out = '+7 (' + d.slice(0, 3);
    if (d.length >= 3) out += ')';
    if (d.length > 3) out += ' ' + d.slice(3, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 10);
    return out;
  };
  els.phone.addEventListener('input', (e) => {
    // Не трогаем ввод при удалении: иначе маска «залипает» на скобках
    if (e.inputType && e.inputType.startsWith('delete')) return;
    els.phone.value = formatPhone(els.phone.value);
  });

  const setError = (input, message) => {
    const fld = input.closest('.fld');
    const err = document.getElementById(input.getAttribute('aria-describedby'));
    if (message) {
      fld.setAttribute('data-invalid', '');
      input.setAttribute('aria-invalid', 'true');
      err.textContent = message;
    } else {
      fld.removeAttribute('data-invalid');
      input.removeAttribute('aria-invalid');
      err.textContent = '';
    }
  };

  const validate = () => {
    const name = els.name.value.trim();
    const phoneDigits = els.phone.value.replace(/\D/g, '');
    const errors = [];
    const nameErr = name.length < 2 ? 'Напишите, как к вам обращаться.' : '';
    const phoneErr = phoneDigits.length !== 11 ? 'Укажите телефон полностью: +7 и десять цифр.' : '';
    const consentErr = els.consent.checked ? '' : 'Нужно согласие на обработку данных.';
    setError(els.name, nameErr);
    setError(els.phone, phoneErr);
    setError(els.consent, consentErr);
    if (nameErr) errors.push(els.name);
    if (phoneErr) errors.push(els.phone);
    if (consentErr) errors.push(els.consent);
    return errors;
  };

  [els.name, els.phone].forEach((i) => i.addEventListener('input', () => { if (i.closest('.fld').hasAttribute('data-invalid')) validate(); }));
  els.consent.addEventListener('change', () => { if (els.consent.getAttribute('aria-invalid')) validate(); });

  const setStatus = (kind, html) => { status.dataset.kind = kind; status.innerHTML = html; };

  const send = async () => {
    const payload = {
      name: els.name.value.trim(),
      phone: '+' + els.phone.value.replace(/\D/g, ''),
      direction: els.direction.value || null,
      source: 'solutions',
    };
    const endpoint = form.dataset.endpoint;
    // Пока бэкенда нет, прототип имитирует ответ. Заявка никуда не уходит.
    if (!endpoint) {
      console.info('[solutions] заявка (прототип, не отправлена):', payload);
      await new Promise((r) => setTimeout(r, 700));
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: ctrl.signal,
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } finally {
      clearTimeout(timer);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.classList.contains('is-busy')) return;
    setStatus('', '');

    // Honeypot: бот заполнил скрытое поле. Делаем вид, что всё хорошо.
    if (els.website.value) { form.classList.add('is-done'); return; }

    const invalid = validate();
    if (invalid.length) { invalid[0].focus(); return; }

    if (!navigator.onLine) {
      setStatus('error', 'Нет соединения с интернетом. Проверьте сеть и <button type="button" data-retry>повторите</button>.');
      return;
    }

    form.classList.add('is-busy');
    submitBtn.disabled = true;
    try {
      await send();
      form.classList.add('is-done');
    } catch (err) {
      setStatus('error', 'Не удалось отправить заявку. <button type="button" data-retry>Повторить</button>');
    } finally {
      form.classList.remove('is-busy');
      submitBtn.disabled = false;
    }
  });

  status.addEventListener('click', (e) => {
    if (e.target.closest('[data-retry]')) form.requestSubmit();
  });
})();
