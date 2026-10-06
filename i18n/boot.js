(function (w, d) {
  var q = /[?&]lang=(en|ru)(?=&|#|$)/.exec(location.search), s = null, l;
  try { if (q) localStorage.setItem('lang', q[1]); s = localStorage.getItem('lang'); } catch (e) {}
  l = q ? q[1] : s === 'en' ? 'en' : 'ru';
  var i = w.i18n = { lang: l, t: function () {}, ready: Promise.resolve() };
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lang]');
    if (!b || b.getAttribute('aria-pressed') === 'true') return;
    var n = b.getAttribute('data-lang'), u = new URL(location.href);
    u.searchParams.delete('lang');
    try { localStorage.setItem('lang', n); } catch (x) { u.searchParams.set('lang', n); }
    if (u.href === location.href) location.reload(); else location.replace(u.href);
  });
  if (l !== 'en') return;
  var st = d.createElement('style');
  st.textContent = 'html.i18n-wait body{visibility:hidden}';
  d.head.appendChild(st);
  d.documentElement.classList.add('i18n-wait');
  i.ready = new Promise(function (ok) {
    var tm = setTimeout(function () { i.done('the English text did not load in time'); }, 3000), over;
    i.done = function (why) {
      if (over) return;
      over = 1;
      clearTimeout(tm);
      if (why) { i.lang = 'ru'; console.warn('i18n: ' + why + ', the page stays in Russian'); }
      d.documentElement.classList.remove('i18n-wait');
      ok();
    };
    var sc = d.createElement('script');
    sc.src = 'i18n.js';
    sc.async = true;
    sc.onerror = function () { i.done('i18n.js did not load'); };
    d.head.appendChild(sc);
  });
})(window, document);
