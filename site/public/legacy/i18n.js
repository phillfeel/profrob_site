/* Профессиональная Робототехника: runtime of the English version. Loaded by the inline boot (i18n/boot.js) only when English is chosen;
   Russian visitors never request this file. The Russian text stays in the markup, this script puts the English
   messages (i18n/en.json) in its place before the page scripts start (they wait for window.i18n.ready).

   Contract of the markup and the message format: i18n/README.md.
   - data-i18n="key"          text of the element
   - data-i18n-html="key"     text with tags; a tag takes the attributes of the n-th element with the same name that
                              was in the element before
   - data-i18n-attr="a:key;…" attributes
   - data-i18n-args='{…}'     values of the variables of the message
   A key missing in en.json leaves the Russian text of the markup in place (and is reported once in the console).
   window.i18n.t(key, vars) gives scripts a message as a string (undefined when there is none). */
(() => {
  'use strict';
  const I = window.i18n;
  if (!I || I.lang !== 'en') return;
  const LANG = 'en';

  // ───────── message format: the subset of ICU MessageFormat of tools/i18n/icu.mjs ─────────
  const parse = (s) => {
    let i = 0;
    const fail = (m) => { throw new Error(`${m} in «${s.slice(0, 80)}»`); };
    const ws = () => { while (i < s.length && ' \n\t\r'.includes(s[i])) i++; };
    const nodes = (ctx, inPlural, tag) => {
      const out = [];
      let buf = '';
      const flush = () => { if (buf) { out.push({ k: 'text', v: buf }); buf = ''; } };
      for (;;) {
        if (i >= s.length) { if (ctx !== 'top') fail('unclosed brace or tag'); flush(); return out; }
        const c = s[i];
        if (c === '{') { flush(); out.push(argument(inPlural)); continue; }
        if (c === '}') { if (ctx === 'option') { flush(); return out; } fail('unmatched }'); }
        if (c === '<') {
          if (s[i + 1] === '/') {
            const m = /^<\/([A-Za-z][A-Za-z0-9_.-]*)>/.exec(s.slice(i, i + 80));
            if (!m || ctx !== 'tag' || m[1] !== tag) fail('unexpected closing tag');
            flush(); i += m[0].length;
            return out;
          }
          const m = /^<([A-Za-z][A-Za-z0-9_.-]*)(\/?)>/.exec(s.slice(i, i + 80));
          if (m) {
            flush(); i += m[0].length;
            out.push(m[2] ? { k: 'void', n: m[1] } : { k: 'tag', n: m[1], c: nodes('tag', inPlural, m[1]) });
            continue;
          }
          buf += c; i++;
          continue;
        }
        if (c === '#' && inPlural) { flush(); out.push({ k: 'pound' }); i++; continue; }
        if (c === "'") {
          const nx = s[i + 1];
          if (nx === "'") { buf += "'"; i += 2; continue; }
          if (nx === '{' || nx === '}' || nx === '<' || nx === '>' || (nx === '#' && inPlural)) {
            i++;
            while (i < s.length) {
              if (s[i] === "'") { if (s[i + 1] === "'") { buf += "'"; i += 2; continue; } i++; break; }
              buf += s[i++];
            }
            continue;
          }
        }
        buf += c; i++;
      }
    };
    const argument = (inPlural) => {
      i++; ws();
      const nm = /^[^\s,{}]+/.exec(s.slice(i, i + 120));
      if (!nm) fail('argument name expected');
      const name = nm[0];
      i += name.length; ws();
      if (s[i] === '}') { i++; return { k: 'arg', n: name }; }
      if (s[i] !== ',') fail('"," or "}" expected');
      i++; ws();
      const type = (/^[a-z]+/.exec(s.slice(i, i + 20)) || [''])[0];
      i += type.length; ws();
      if (type === 'number') {
        let f = 'number';
        if (s[i] === ',') { i++; ws(); f = /^[^\s{}]+/.exec(s.slice(i))[0]; i += f.length; ws(); }
        if (s[i] !== '}') fail('"}" expected');
        i++;
        return { k: 'arg', n: name, f };
      }
      if (type !== 'plural' && type !== 'selectordinal' && type !== 'select') fail(`unsupported type "${type}"`);
      if (s[i] !== ',') fail('"," expected');
      i++; ws();
      let off = 0;
      if (type !== 'select' && s.startsWith('offset:', i)) { i += 7; ws(); const m = /^-?\d+/.exec(s.slice(i)); off = Number(m[0]); i += m[0].length; ws(); }
      const o = {};
      for (;;) {
        ws();
        if (s[i] === '}') { i++; break; }
        if (i >= s.length) fail('unclosed argument');
        const key = /^[^\s{}]+/.exec(s.slice(i))[0];
        i += key.length; ws();
        if (s[i] !== '{') fail('"{" expected');
        i++;
        o[key] = nodes('option', type !== 'select' ? true : inPlural);
        i++;
      }
      if (!('other' in o)) fail('"other" option expected');
      return type === 'select' ? { k: 'select', n: name, o } : { k: 'plural', n: name, ord: type === 'selectordinal', off, o };
    };
    return nodes('top', false);
  };

  const NF = new Intl.NumberFormat(LANG, { useGrouping: 'always' });
  const nfOf = (style) => {
    const m = /^::\.(0+)$/.exec(style);
    return m ? new Intl.NumberFormat(LANG, { useGrouping: 'always', minimumFractionDigits: m[1].length, maximumFractionDigits: m[1].length }) : NF;
  };
  const PR = { card: new Intl.PluralRules(LANG), ord: new Intl.PluralRules(LANG, { type: 'ordinal' }) };
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const need = (v, n) => { if (!v || !(n in v)) throw new Error(`no value for {${n}}`); return v[n]; };
  /** @param html escape text and values, the result is HTML */
  const format = (list, v, html, pound) => list.map((n) => {
    switch (n.k) {
      case 'text': return html ? esc(n.v) : n.v;
      case 'pound': return NF.format(pound);
      case 'arg': { const x = need(v, n.n); return n.f ? nfOf(n.f).format(x) : html ? esc(x) : String(x); }
      case 'plural': {
        const x = Number(need(v, n.n));
        return format(n.o[`=${x}`] || n.o[PR[n.ord ? 'ord' : 'card'].select(x - n.off)] || n.o.other, v, html, x - n.off);
      }
      case 'select': return format(n.o[String(need(v, n.n))] || n.o.other, v, html, pound);
      case 'tag': return `<${n.n}>${format(n.c, v, html, pound)}</${n.n}>`;
      default: return `<${n.n}/>`;
    }
  }).join('');
  const hasTags = (list) => list.some((n) => n.k === 'tag' || n.k === 'void' || (n.o && Object.values(n.o).some(hasTags)));

  /** A number as the site writes it (always grouped); digits fixes the fraction digits. For scripts that build a piece of text themselves. */
  I.n = (x, digits) => (digits === undefined ? NF : new Intl.NumberFormat(LANG, { useGrouping: 'always', minimumFractionDigits: digits, maximumFractionDigits: digits })).format(x);

  const cache = new Map();
  const ast = (m) => { let a = cache.get(m); if (!a) cache.set(m, (a = parse(m))); return a; };
  I.engine = { parse, format };

  // ───────── dictionary ─────────
  const D = new Map();
  const flatten = (o, p) => { for (const [k, v] of Object.entries(o)) (typeof v === 'string' ? D.set(p + k, v) : flatten(v, `${p}${k}.`)); };

  /** A message as a string for scripts: HTML if the message has tags (the values are escaped), else plain text. */
  I.t = (key, v) => {
    const m = D.get(key);
    if (m === undefined) return undefined;
    try { const a = ast(m); return format(a, v, hasTags(a)); } catch (e) { console.warn(`i18n: ${key}: ${e.message}`); return undefined; }
  };

  // ───────── the page ─────────
  const rich = (a, v, pool) => {
    const frag = document.createDocumentFragment();
    const emit = (list, parent) => {
      for (const n of list) {
        if (n.k === 'tag' || n.k === 'void') {
          const el = document.createElement(n.n);
          const old = (pool[n.n] || []).shift();
          if (old) for (const at of old.attributes) el.setAttribute(at.name, at.value);
          parent.append(el);
          if (n.k === 'tag') emit(n.c, el);
        } else if (n.k === 'plural' || n.k === 'select') {
          emit(ast(format([n], v, false)), parent); // the chosen option may carry tags: render it, read it again
        } else parent.append(format([n], v, false));
      }
    };
    emit(a, frag);
    return frag;
  };

  const apply = () => {
    const missing = new Set();
    for (const el of document.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-attr]')) {
      const args = el.hasAttribute('data-i18n-args') ? JSON.parse(el.getAttribute('data-i18n-args')) : null;
      const find = (key) => { const m = D.get(key); if (m === undefined) missing.add(key); return m; };
      try {
        if (el.hasAttribute('data-i18n')) {
          const m = find(el.getAttribute('data-i18n'));
          if (m !== undefined) el.textContent = format(ast(m), args, false);
        }
        if (el.hasAttribute('data-i18n-html')) {
          const m = find(el.getAttribute('data-i18n-html'));
          if (m !== undefined) {
            const pool = {};
            for (const c of el.children) (pool[c.tagName.toLowerCase()] || (pool[c.tagName.toLowerCase()] = [])).push(c.cloneNode(false));
            el.replaceChildren(rich(ast(m), args, pool));
          }
        }
        if (el.hasAttribute('data-i18n-attr')) {
          for (const pair of el.getAttribute('data-i18n-attr').split(';')) {
            const at = pair.indexOf(':');
            const m = find(pair.slice(at + 1));
            if (m !== undefined) { const attr = pair.slice(0, at); const value = format(ast(m), args, false); el.setAttribute(attr, attr === "src" && value.startsWith("/assets/") ? "/" + value : value); }
          }
        }
      } catch (e) { console.warn(`i18n: ${e.message}`); }
    }
    document.documentElement.lang = LANG;
    for (const b of document.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === LANG));
    if (missing.size) console.warn(`i18n: ${missing.size} key(s) are not in en.json, the Russian text stays: ${[...missing].slice(0, 8).join(', ')}${missing.size > 8 ? ', …' : ''}`);
  };

  fetch('/i18n/en.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((json) => { flatten(json, ''); apply(); I.done(); })
    .catch((e) => I.done(`i18n/en.json: ${e.message}`));
})();
