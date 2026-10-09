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

  // ---------- Отправка формы заявки ----------
  const form = document.getElementById('lead-form');
  if (!form) return;

  const statusEl = document.getElementById('f-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn?.querySelector('.btn__t');
  const spinEl = submitBtn?.querySelector('.spin');
  const okEl = form.querySelector('.form__ok');

  const i18n = window.i18n;
  const t = (key) => i18n?.t?.(key) || key;

  const setLoading = (loading) => {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (spinEl) spinEl.style.display = loading ? 'inline-block' : 'none';
    if (btnText) btnText.textContent = loading ? t('contacts.form.sending') || 'Отправка…' : t('contacts.form.submit') || 'Отправить заявку';
  };

  const showStatus = (msg, isError) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = isError ? '#c00' : '#080';
  };

  const showSuccess = () => {
    form.classList.add('is-sent');
    if (okEl) okEl.style.display = 'flex';
    setLoading(false);
    showStatus('', false);
  };

  const resetForm = () => {
    form.classList.remove('is-sent');
    if (okEl) okEl.style.display = 'none';
    form.reset();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn?.disabled) return;

    const endpoint = form.dataset.endpoint || '/api/lead';
    const source = form.dataset.source || 'contacts';

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.source = source;

    setLoading(true);
    showStatus('', false);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok) {
        showSuccess();
      } else {
        const msg = json.error || t('contacts.form.error') || 'Ошибка отправки. Попробуйте позже.';
        showStatus(msg, true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Form submit error:', err);
      showStatus(t('contacts.form.networkError') || 'Ошибка сети. Проверьте подключение.', true);
      setLoading(false);
    }
  });

  // Сброс формы при клике на «Назад» в браузере
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) resetForm();
  });
});
