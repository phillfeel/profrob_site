(() => {
  const I = window.i18n;
  if (!I || I.__profrobotRuntime) return;
  I.__profrobotRuntime = true;
  I.n = (x, digits) => new Intl.NumberFormat('ru-RU', digits === undefined ? { useGrouping: 'always' } : { useGrouping: 'always', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(x);
  I.t = () => undefined;
  I.done?.();
})();
