// Minimal ICU MessageFormat (the subset the site uses) and rich-text tags, the same message syntax as next-intl:
//   {name}                                   interpolation
//   {n, number}  {n, number, ::.0}           number in the locale's format; ::.0 / ::.00 fix the fraction digits (ICU skeleton)
//   {n, plural, =0 {…} one {…} few {…} other {…}}   (# inside an option is the number; `offset:N` supported)
//   {n, selectordinal, …}                    same as plural, ordinal rules
//   {kind, select, a {…} other {…}}
//   <b>…</b>   <br/>                         tags without attributes (rich text); which tags are allowed is decided by check.mjs
// Quoting follows ICU/formatjs: '' is an apostrophe; an apostrophe before { } < > (and # inside plural) starts quoted text.
// The module is plain ES, no Node APIs: the future runtime can reuse it as is.

/** @typedef {{type:'text', value:string}|{type:'arg', name:string, format?:string}|{type:'pound'}
 *   |{type:'plural', name:string, ordinal:boolean, offset:number, options:Record<string, Ast>}
 *   |{type:'select', name:string, options:Record<string, Ast>}
 *   |{type:'tag', name:string, children:Ast}|{type:'void', name:string}} Item
 * @typedef {Item[]} Ast */

export class IcuError extends Error {
  constructor(message, pos, source) {
    super(`${message} at ${pos} in «${source.length > 120 ? `${source.slice(0, 120)}…` : source}»`);
    this.name = 'IcuError';
    this.pos = pos;
  }
}

const PLURAL_KEYS = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
const isWs = (c) => c === ' ' || c === '\n' || c === '\t' || c === '\r';

/** @returns {Ast} */
export function parse(source) {
  let i = 0;
  const s = source;
  const fail = (msg, at = i) => { throw new IcuError(msg, at, s); };
  const skipWs = () => { while (i < s.length && isWs(s[i])) i++; };

  /**
   * @param {'top'|'option'|'tag'} ctx where the list ends: end of string, a closing brace, or the closing tag
   * @param {boolean} inPlural whether # is a placeholder here
   * @param {string} [tagName]
   */
  function nodes(ctx, inPlural, tagName) {
    /** @type {Ast} */
    const out = [];
    let buf = '';
    const flush = () => { if (buf) { out.push({ type: 'text', value: buf }); buf = ''; } };
    for (;;) {
      if (i >= s.length) {
        if (ctx !== 'top') fail(ctx === 'tag' ? `unclosed tag <${tagName}>` : 'unclosed "{"');
        flush();
        return out;
      }
      const c = s[i];
      if (c === '{') { flush(); out.push(argument(inPlural)); continue; }
      if (c === '}') {
        if (ctx === 'option') { flush(); return out; }
        fail('unmatched "}"');
      }
      if (c === '<') {
        if (s[i + 1] === '/') {
          const m = /^<\/([A-Za-z][A-Za-z0-9_.-]*)>/.exec(s.slice(i, i + 80));
          if (!m) fail('malformed closing tag');
          if (ctx !== 'tag' || m[1] !== tagName) fail(`unexpected closing tag </${m[1]}>`);
          flush();
          i += m[0].length;
          return out;
        }
        const m = /^<([A-Za-z][A-Za-z0-9_.-]*)(\/?)>/.exec(s.slice(i, i + 80));
        if (m) {
          flush();
          i += m[0].length;
          if (m[2]) out.push({ type: 'void', name: m[1] });
          else out.push({ type: 'tag', name: m[1], children: nodes('tag', inPlural, m[1]) });
          continue;
        }
        if (/^<[A-Za-z]/.test(s.slice(i, i + 2))) fail('malformed tag (tags take no attributes)');
        buf += c; i++;
        continue;
      }
      if (c === '#' && inPlural) { flush(); out.push({ type: 'pound' }); i++; continue; }
      if (c === "'") {
        const nx = s[i + 1];
        if (nx === "'") { buf += "'"; i += 2; continue; }
        if (nx === '{' || nx === '}' || nx === '<' || nx === '>' || (nx === '#' && inPlural)) {
          i++; // quoted text up to the closing apostrophe; '' inside is a literal apostrophe
          for (;;) {
            if (i >= s.length) break;
            if (s[i] === "'") { if (s[i + 1] === "'") { buf += "'"; i += 2; continue; } i++; break; }
            buf += s[i++];
          }
          continue;
        }
        buf += c; i++;
        continue;
      }
      buf += c; i++;
    }
  }

  function argument(inPlural) {
    const open = i;
    i++; // {
    skipWs();
    const nm = /^[^\s,{}]+/.exec(s.slice(i, i + 120));
    if (!nm) fail('argument name expected');
    const name = nm[0];
    i += name.length;
    skipWs();
    if (s[i] === '}') { i++; return { type: 'arg', name }; }
    if (s[i] !== ',') fail(`"," or "}" expected after argument "${name}"`);
    i++;
    skipWs();
    const tm = /^[a-z]+/.exec(s.slice(i, i + 20));
    if (!tm) fail(`argument type expected for "${name}"`);
    const type = tm[0];
    i += type.length;
    skipWs();
    if (type === 'number') {
      let format;
      if (s[i] === ',') { i++; skipWs(); const fm = /^[^\s{}]+/.exec(s.slice(i)); if (!fm) fail('number style expected'); format = fm[0]; i += format.length; skipWs(); }
      if (s[i] !== '}') fail('"}" expected');
      i++;
      return { type: 'arg', name, format: format ?? 'number' };
    }
    if (type !== 'plural' && type !== 'selectordinal' && type !== 'select') fail(`unsupported argument type "${type}" (use number, plural, selectordinal, select)`, open);
    if (s[i] !== ',') fail(`"," expected after "${type}"`);
    i++;
    skipWs();
    let offset = 0;
    if (type !== 'select' && s.startsWith('offset:', i)) {
      i += 7; skipWs();
      const om = /^-?\d+/.exec(s.slice(i));
      if (!om) fail('offset number expected');
      offset = Number(om[0]); i += om[0].length; skipWs();
    }
    /** @type {Record<string, Ast>} */
    const options = {};
    for (;;) {
      skipWs();
      if (s[i] === '}') { i++; break; }
      if (i >= s.length) fail(`unclosed "{" of "${name}"`, open);
      const km = /^[^\s{}]+/.exec(s.slice(i));
      if (!km) fail('option key expected');
      const key = km[0];
      if (type === 'select' ? false : !(PLURAL_KEYS.has(key) || /^=\d+$/.test(key))) fail(`invalid plural key "${key}"`);
      if (key in options) fail(`duplicate option "${key}" in "${name}"`);
      i += key.length;
      skipWs();
      if (s[i] !== '{') fail(`"{" expected after option "${key}"`);
      i++;
      options[key] = nodes('option', type !== 'select' ? true : inPlural);
      i++; // the option's closing brace
    }
    if (!('other' in options)) fail(`"${name}" needs an "other" option`, open);
    return type === 'select' ? { type: 'select', name, options } : { type: 'plural', name, ordinal: type === 'selectordinal', offset, options };
  }

  return nodes('top', false);
}

/** Variables and tags used by a message: what en.json must keep identical to ru.json. */
export function collect(ast, acc = { vars: new Map(), tags: new Set() }) {
  const addVar = (name, kind) => {
    const prev = acc.vars.get(name);
    if (!prev) acc.vars.set(name, kind);
    else if (prev !== kind && prev !== 'arg' && kind !== 'arg') acc.vars.set(name, `${prev}+${kind}`);
    else if (prev === 'arg') acc.vars.set(name, kind);
  };
  for (const n of ast) {
    if (n.type === 'arg') addVar(n.name, n.format ? 'number' : 'arg');
    else if (n.type === 'plural') { addVar(n.name, n.ordinal ? 'selectordinal' : 'plural'); for (const o of Object.values(n.options)) collect(o, acc); }
    else if (n.type === 'select') { addVar(n.name, 'select'); for (const o of Object.values(n.options)) collect(o, acc); }
    else if (n.type === 'tag') { acc.tags.add(n.name); collect(n.children, acc); }
    else if (n.type === 'void') acc.tags.add(`${n.name}/`);
  }
  return acc;
}

/**
 * Renders a message to a string. Tags are written back as <b>…</b> / <br/>, so the result has the same shape as the
 * message extracted from markup.
 * @param {Ast} ast
 * @param {Record<string, any>} [args]
 * @param {string} [locale]
 */
export function format(ast, args = {}, locale = 'ru') {
  const need = (name) => {
    if (!(name in args)) throw new Error(`missing value for "{${name}}"`);
    return args[name];
  };
  // numbers are always grouped (1 500, 1,500): a rule of the site, also for four-digit numbers
  const nf = new Intl.NumberFormat(locale, { useGrouping: 'always' });
  const numberFormat = (style) => {
    const m = /^::\.(0+)$/.exec(style);
    if (style !== 'number' && !m) throw new Error(`unsupported number style "${style}" (use ::.0 or ::.00)`);
    return m ? new Intl.NumberFormat(locale, { useGrouping: 'always', minimumFractionDigits: m[1].length, maximumFractionDigits: m[1].length }) : nf;
  };
  const run = (list, pound) => list.map((n) => {
    switch (n.type) {
      case 'text': return n.value;
      case 'pound': return pound === undefined ? '#' : nf.format(pound);
      case 'arg': { const v = need(n.name); return n.format ? numberFormat(n.format).format(v) : String(v); }
      case 'plural': {
        const v = Number(need(n.name));
        const exact = n.options[`=${v}`];
        const cat = new Intl.PluralRules(locale, { type: n.ordinal ? 'ordinal' : 'cardinal' }).select(v - n.offset);
        return run(exact ?? n.options[cat] ?? n.options.other, v - n.offset);
      }
      case 'select': { const v = String(need(n.name)); return run(n.options[v] ?? n.options.other, pound); }
      case 'tag': return `<${n.name}>${run(n.children, pound)}</${n.name}>`;
      case 'void': return `<${n.name}/>`;
      default: throw new Error(`unknown node ${n.type}`);
    }
  }).join('');
  return run(ast, undefined);
}

/** Escapes plain text so that parse() reads it back literally. */
export const quote = (text) => text.replace(/'/g, "''").replace(/[{}<>]/g, (c) => `'${c}'`);
