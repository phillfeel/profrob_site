/* @ds-bundle: {"format":4,"namespace":"Profrobot","components":[{"name":"Button"},{"name":"Icon"},{"name":"NavBar"},{"name":"SectionCounter"},{"name":"Tag"},{"name":"Badge"},{"name":"MetricsBar"},{"name":"Kpi"},{"name":"SectionHeader"},{"name":"Stage"},{"name":"ScanRing"},{"name":"PartnerStrip"},{"name":"RobotCard"},{"name":"IndustryCard"},{"name":"CaseCard"},{"name":"Field"},{"name":"Slider"},{"name":"Segmented"},{"name":"Accordion"},{"name":"Footer"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState;
  function cx() { return Array.prototype.slice.call(arguments).filter(Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }

  /* ---------- Icon: 24px grid, 1.75 stroke, round caps ---------- */
  var PATHS = {
    'arrow-right': ['M5 12h14', 'M13 6l6 6-6 6'],
    'arrow-up-right': ['M7 17L17 7', 'M8 7h9v9'],
    'plus': ['M12 5v14', 'M5 12h14'],
    'minus': ['M5 12h14'],
    'check': ['M5 12.5l4.5 4.5L19 7.5'],
    'menu': ['M4 8h16', 'M4 16h16'],
    'close': ['M6 6l12 12', 'M18 6L6 18'],
    'chevron-down': ['M6 9l6 6 6-6'],
    'play': ['M8 5.5v13l11-6.5z'],
    'phone': ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z'],
    'mail': ['M3.5 6.5h17v11h-17z', 'M4 7l8 6 8-6']
  };
  function Icon(p) {
    var size = p.size || 20, d = PATHS[p.name] || PATHS['arrow-right'];
    return h('svg', { className: cx('pr-icon', p.className), width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': p.label ? undefined : true, role: p.label ? 'img' : undefined, 'aria-label': p.label },
      d.map(function (x, i) { return h('path', { key: i, d: x }); }));
  }

  /* ---------- Button ---------- */
  function Button(p) {
    var variant = p.variant || 'primary', size = p.size || 'md';
    var rest = omit(p, ['variant', 'size', 'icon', 'iconOnly', 'className', 'children', 'href']);
    var content = [
      p.iconOnly ? null : h('span', { key: 't', className: 'pr-btn__label' }, p.children),
      p.icon ? h(Icon, { key: 'i', name: p.icon, size: size === 'sm' ? 16 : 18 }) : null
    ];
    var cls = cx('pr-btn', 'pr-btn--' + variant, 'pr-btn--' + size, p.iconOnly && 'pr-btn--icon', p.className);
    if (p.iconOnly) rest['aria-label'] = rest['aria-label'] || (typeof p.children === 'string' ? p.children : undefined);
    return p.href ? h('a', Object.assign({ href: p.href, className: cls }, rest), content)
                  : h('button', Object.assign({ type: 'button', className: cls }, rest), content);
  }

  /* ---------- Tag: [ • LABEL ] ---------- */
  function Tag(p) {
    return h('span', { className: cx('pr-tag', p.className) },
      h('span', { className: 'pr-tag__br', 'aria-hidden': true }, '['),
      p.dot === false ? null : h('span', { className: 'pr-tag__dot', 'aria-hidden': true }),
      h('span', null, p.children),
      h('span', { className: 'pr-tag__br', 'aria-hidden': true }, ']'));
  }

  /* ---------- Badge ---------- */
  function Badge(p) {
    var tone = p.tone || 'neutral';
    return h('span', { className: cx('pr-badge', 'pr-badge--' + tone, p.className) },
      p.dot === false ? null : h('span', { className: 'pr-badge__dot', 'aria-hidden': true }), p.children);
  }

  /* ---------- NavBar ---------- */
  var DEFAULT_LOGO = '/_blob/16484b9c88a696674b3ce459d15cc33c';
  function NavBar(p) {
    var links = p.links || ['Решения', 'Роботы', 'Отрасли', 'Платформа', 'Кейсы'];
    var s = useState(false), open = s[0], setOpen = s[1];
    return h('header', { className: cx('pr-nav', open && 'is-open', p.className) },
      h('a', { className: 'pr-nav__logo', href: p.homeHref || '#', 'aria-label': 'ПРОФРОБОТ — на главную' },
        p.logo || h('img', { src: p.logoSrc || DEFAULT_LOGO, alt: 'ПРОФРОБОТ', height: 24 })),
      h('nav', { className: 'pr-nav__links', 'aria-label': 'Основная навигация' },
        links.map(function (l, i) {
          var label = typeof l === 'string' ? l : l.label, href = typeof l === 'string' ? '#' : l.href;
          return h('a', { key: i, href: href, className: cx('pr-nav__link', p.active === label && 'is-active'), 'aria-current': p.active === label ? 'page' : undefined }, label);
        })),
      h('div', { className: 'pr-nav__cta' },
        h(Button, { variant: 'primary', size: 'md', onClick: p.onCta }, p.ctaLabel || 'Связаться'),
        h(Button, { variant: 'ghost', size: 'md', iconOnly: true, icon: open ? 'close' : 'menu', className: 'pr-nav__burger', 'aria-expanded': open, 'aria-label': open ? 'Закрыть меню' : 'Открыть меню', onClick: function () { setOpen(!open); } })));
  }

  /* ---------- SectionCounter: 01 | 09 ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function SectionCounter(p) {
    var cur = p.current || 1, total = p.total || 9, dir = p.orientation || 'vertical';
    return h('div', { className: cx('pr-counter', 'pr-counter--' + dir, p.className), 'aria-label': 'Раздел ' + cur + ' из ' + total },
      h('span', { className: 'pr-counter__cur' }, pad(cur)),
      h('span', { className: 'pr-counter__track', 'aria-hidden': true }, h('span', { className: 'pr-counter__fill', style: dir === 'vertical' ? { height: (cur / total * 100) + '%' } : { width: (cur / total * 100) + '%' } })),
      h('span', { className: 'pr-counter__total' }, pad(total)));
  }

  /* ---------- MetricsBar: glass card with live stats ---------- */
  function MetricsBar(p) {
    var items = p.items || [{ value: '142', label: 'устройства' }, { value: '14', label: 'объектов' }, { value: 'SLA 98,2%', label: '' }];
    var parts = [];
    items.forEach(function (it, i) {
      if (i) parts.push(h('span', { key: 'd' + i, className: 'pr-metrics__sep', 'aria-hidden': true }, '·'));
      parts.push(h('span', { key: 'i' + i, className: 'pr-metrics__item' }, h('b', null, it.value), it.label ? ' ' + it.label : null));
    });
    return h('div', { className: cx('pr-glass', 'pr-metrics', p.className) }, parts,
      p.status === false ? null : h(Badge, { tone: 'success' }, p.status || 'Система онлайн'));
  }

  /* ---------- Kpi ---------- */
  function Kpi(p) {
    return h('div', { className: cx('pr-kpi', p.className) },
      h('div', { className: 'pr-kpi__value' }, p.value, p.unit ? h('span', { className: 'pr-kpi__unit' }, p.unit) : null),
      h('div', { className: 'pr-kpi__label' }, p.label));
  }

  /* ---------- SectionHeader ---------- */
  function SectionHeader(p) {
    return h('div', { className: cx('pr-sechead', p.align === 'center' && 'pr-sechead--center', p.className) },
      (p.index || p.label) ? h('div', { className: 'pr-sechead__eyebrow' }, p.index ? h('span', { className: 'pr-sechead__idx' }, p.index) : null, p.label ? h('span', null, '— ' + p.label) : null) : null,
      h(p.as || 'h2', { className: 'pr-sechead__title' }, p.title),
      p.lead ? h('p', { className: 'pr-sechead__lead' }, p.lead) : null,
      p.children);
  }

  /* ---------- Stage: graphite podium, always dark ---------- */
  function Stage(p) {
    return h('section', { 'data-theme': 'dark', className: cx('pr-stage', p.glow === false ? null : 'pr-stage--glow', p.className), style: p.style }, p.children);
  }
  function ScanRing(p) {
    var w = p.width || 160;
    return h('span', { className: cx('pr-ring', p.className), 'aria-hidden': true, style: { width: w, height: Math.round(w * 0.22) } });
  }

  /* ---------- PartnerStrip ---------- */
  function PartnerStrip(p) {
    var items = p.partners || ['PUDU', 'GAUSIUM', 'KEENON', 'HIKROBOT', 'FORWARDX', 'UNITREE', 'ORIONSTAR'];
    return h('ul', { className: cx('pr-partners', p.className), 'aria-label': p.label || 'Производители' },
      items.map(function (it, i) {
        var isObj = typeof it === 'object';
        return h('li', { key: i, className: 'pr-partners__item' },
          isObj && it.src ? h('img', { src: it.src, alt: it.name, height: 24 }) : (isObj ? it.name : it));
      }));
  }

  /* ---------- RobotCard ---------- */
  function RobotCard(p) {
    return h('article', { className: cx('pr-card', 'pr-robot', p.className) },
      h('div', { className: 'pr-robot__media', 'data-theme': 'dark' },
        p.tag ? h(Tag, null, p.tag) : null,
        p.image ? h('img', { src: p.image, alt: p.imageAlt || p.name }) : h('div', { className: 'pr-robot__ph', 'aria-hidden': true }),
        h(ScanRing, { width: 140, className: 'pr-robot__ring' })),
      h('div', { className: 'pr-robot__body' },
        p.vendor ? h('div', { className: 'pr-robot__vendor' }, p.vendor) : null,
        h('h3', { className: 'pr-robot__name' }, p.name),
        p.text ? h('p', { className: 'pr-robot__text' }, p.text) : null,
        p.specs ? h('ul', { className: 'pr-robot__specs' }, p.specs.map(function (s, i) { return h('li', { key: i }, h('span', null, s.label), h('b', null, s.value)); })) : null,
        h('div', { className: 'pr-robot__foot' },
          p.price ? h('span', { className: 'pr-robot__price' }, p.price) : h('span'),
          h(Button, { variant: 'secondary', size: 'sm', icon: 'arrow-up-right', href: p.href }, p.cta || 'Подробнее'))));
  }

  /* ---------- IndustryCard ---------- */
  function IndustryCard(p) {
    return h('a', { href: p.href || '#', className: cx('pr-card', 'pr-industry', p.className) },
      h('div', { className: 'pr-industry__top' },
        h('span', { className: 'pr-industry__idx' }, p.index),
        h('span', { className: 'pr-industry__go', 'aria-hidden': true }, h(Icon, { name: 'arrow-up-right', size: 20 }))),
      h('h3', { className: 'pr-industry__title' }, p.title),
      p.text ? h('p', { className: 'pr-industry__text' }, p.text) : null,
      p.tags ? h('div', { className: 'pr-industry__tags' }, p.tags.map(function (t, i) { return h(Tag, { key: i }, t); })) : null);
  }

  /* ---------- CaseCard ---------- */
  function CaseCard(p) {
    return h('article', { className: cx('pr-card', 'pr-case', p.className) },
      h('div', { className: 'pr-case__head' },
        h('span', { className: 'pr-case__client' }, p.client),
        p.industry ? h(Tag, null, p.industry) : null),
      h('div', { className: 'pr-case__metric' }, p.metric),
      h('div', { className: 'pr-case__mlabel' }, p.metricLabel),
      p.text ? h('p', { className: 'pr-case__text' }, p.text) : null,
      p.robots ? h('div', { className: 'pr-case__robots' }, p.robots) : null);
  }

  /* ---------- Field ---------- */
  var fid = 0;
  function Field(p) {
    var idState = useState(function () { fid += 1; return 'pr-f-' + fid; }), id = p.id || idState[0];
    var rest = omit(p, ['label', 'hint', 'error', 'multiline', 'className', 'id']);
    var ctrl = h(p.multiline ? 'textarea' : 'input', Object.assign({ id: id, className: 'pr-field__ctrl', 'aria-invalid': p.error ? true : undefined, 'aria-describedby': (p.error || p.hint) ? id + '-d' : undefined }, rest));
    return h('div', { className: cx('pr-field', p.error && 'is-error', p.className) },
      p.label ? h('label', { htmlFor: id, className: 'pr-field__label' }, p.label) : null,
      ctrl,
      (p.error || p.hint) ? h('div', { id: id + '-d', className: 'pr-field__hint' }, p.error || p.hint) : null);
  }

  /* ---------- Slider ---------- */
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function Slider(p) {
    var min = p.min || 0, max = p.max == null ? 100 : p.max, step = p.step || 1;
    var s = useState(p.defaultValue == null ? min : p.defaultValue), v = p.value == null ? s[0] : p.value;
    var pct = (v - min) / (max - min) * 100;
    return h('div', { className: cx('pr-slider', p.className) },
      h('div', { className: 'pr-slider__row' },
        h('span', { className: 'pr-slider__label' }, p.label),
        h('span', { className: 'pr-slider__val' }, fmt(v), p.unit ? ' ' + p.unit : '')),
      h('input', { type: 'range', min: min, max: max, step: step, value: v, 'aria-label': p.label, style: { '--pr-fill': pct + '%' },
        onChange: function (e) { var n = Number(e.target.value); s[1](n); if (p.onChange) p.onChange(n); } }),
      h('div', { className: 'pr-slider__scale' }, h('span', null, fmt(min)), h('span', null, fmt(max))));
  }

  /* ---------- Segmented ---------- */
  function Segmented(p) {
    var opts = p.options || [];
    var s = useState(p.defaultValue || (opts[0] && (opts[0].value || opts[0])));
    var val = p.value == null ? s[0] : p.value;
    return h('div', { className: cx('pr-seg', p.size === 'sm' && 'pr-seg--sm', p.className), role: 'radiogroup', 'aria-label': p.label },
      opts.map(function (o) {
        var v = o.value || o, l = o.label || o, on = v === val;
        return h('button', { key: v, type: 'button', role: 'radio', 'aria-checked': on, className: cx('pr-seg__opt', on && 'is-on'),
          onClick: function () { s[1](v); if (p.onChange) p.onChange(v); } }, l);
      }));
  }

  /* ---------- Accordion ---------- */
  function Accordion(p) {
    var items = p.items || [];
    var s = useState(p.defaultOpen == null ? 0 : p.defaultOpen), open = s[0];
    return h('div', { className: cx('pr-acc', p.className) },
      items.map(function (it, i) {
        var on = open === i;
        return h('div', { key: i, className: cx('pr-acc__item', on && 'is-open') },
          h('button', { type: 'button', className: 'pr-acc__q', 'aria-expanded': on, onClick: function () { s[1](on ? -1 : i); } },
            h('span', { className: 'pr-acc__idx' }, pad(i + 1)),
            h('span', { className: 'pr-acc__qt' }, it.q),
            h('span', { className: 'pr-acc__ic', 'aria-hidden': true }, h(Icon, { name: on ? 'minus' : 'plus', size: 18 }))),
          h('div', { className: 'pr-acc__a', hidden: !on }, it.a));
      }));
  }

  /* ---------- Footer (always on stage) ---------- */
  var INVERSE_LOGO = '/_blob/5ebfd6818d972b557edd0b09a4835a0a';
  function Footer(p) {
    var cols = p.columns || [];
    return h('footer', { 'data-theme': 'dark', className: cx('pr-footer', p.className) },
      h('div', { className: 'pr-footer__top' },
        h('div', { className: 'pr-footer__brand' },
          p.logo || h('img', { src: p.logoSrc || INVERSE_LOGO, alt: 'ПРОФРОБОТ', height: 24 }),
          p.tagline ? h('p', null, p.tagline) : null),
        cols.map(function (c, i) {
          return h('div', { key: i, className: 'pr-footer__col' },
            h('div', { className: 'pr-footer__h' }, c.title),
            h('ul', null, c.links.map(function (l, j) { return h('li', { key: j }, h('a', { href: l.href || '#' }, l.label || l)); })));
        })),
      h('div', { className: 'pr-footer__legal' }, p.legal));
  }

  window.Profrobot = Object.assign(window.Profrobot || {}, {
    Button: Button, Icon: Icon, NavBar: NavBar, SectionCounter: SectionCounter, Tag: Tag, Badge: Badge,
    MetricsBar: MetricsBar, Kpi: Kpi, SectionHeader: SectionHeader, Stage: Stage, ScanRing: ScanRing,
    PartnerStrip: PartnerStrip, RobotCard: RobotCard, IndustryCard: IndustryCard, CaseCard: CaseCard,
    Field: Field, Slider: Slider, Segmented: Segmented, Accordion: Accordion, Footer: Footer
  });
})();
