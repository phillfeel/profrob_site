// Minimal HTML reader for the i18n tools. No dependencies: the project's pages are hand-written or generated and
// well-formed enough for a small tolerant tokenizer (unclosed tags are closed by the nearest matching end tag, the way
// browsers do it). Nodes keep source offsets, so callers can read innerHTML and point to a line.

export const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title']);

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…', copy: '©', times: '×', minus: '−' };

/** Decodes the character references that occur in the project; an unknown name is an error, not silently kept. */
export const decode = (s) => s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, ref) => {
  if (ref[0] === '#') return String.fromCodePoint(ref[1] === 'x' || ref[1] === 'X' ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10));
  if (!(ref in NAMED)) throw new Error(`unknown character reference ${m}`);
  return NAMED[ref];
});

/** Escapes text for an HTML text node or a double-quoted attribute value. */
export const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * @typedef {{type:'el', tag:string, attrs:{name:string, value:string|null, start:number, end:number}[], children:Node[], parent:Node|null,
 *   start:number, openEnd:number, closeStart:number|null, end:number}} El
 * @typedef {{type:'text', value:string, start:number, end:number, parent:Node|null}} Text
 * @typedef {{type:'comment', value:string, start:number, end:number, parent:Node|null}} Comment
 * @typedef {El|Text|Comment|{type:'root', children:Node[], parent:null}} Node
 */

/** @returns {{type:'root', children:Node[], parent:null, src:string}} */
export function parse(src) {
  const root = { type: 'root', children: [], parent: null, src };
  /** @type {any[]} */
  const stack = [root];
  const top = () => stack[stack.length - 1];
  const addText = (start, end) => {
    if (end > start) top().children.push({ type: 'text', value: src.slice(start, end), start, end, parent: top() });
  };
  let i = 0;
  while (i < src.length) {
    const lt = src.indexOf('<', i);
    if (lt === -1) { addText(i, src.length); break; }
    addText(i, lt);
    if (src.startsWith('<!--', lt)) {
      const e = src.indexOf('-->', lt + 4);
      if (e === -1) throw new Error(`unterminated comment at offset ${lt}`);
      top().children.push({ type: 'comment', value: src.slice(lt + 4, e), start: lt, end: e + 3, parent: top() });
      i = e + 3;
      continue;
    }
    if (src.startsWith('<!', lt)) { i = src.indexOf('>', lt) + 1; continue; } // doctype
    if (src[lt + 1] === '/') {
      const e = src.indexOf('>', lt);
      const tag = src.slice(lt + 2, e).trim().toLowerCase();
      let k = stack.length - 1;
      while (k > 0 && stack[k].tag !== tag) k--;
      if (k > 0) {
        stack[k].closeStart = lt;
        stack[k].end = e + 1;
        // Elements closed implicitly by this end tag end where it starts.
        for (let j = stack.length - 1; j > k; j--) { stack[j].closeStart = null; stack[j].end = lt; }
        stack.length = k;
      }
      i = e + 1;
      continue;
    }
    const m = /^<([a-zA-Z][^\s/>]*)/.exec(src.slice(lt, lt + 80));
    if (!m) { addText(lt, lt + 1); i = lt + 1; continue; } // a lone "<" is text
    const tag = m[1].toLowerCase();
    let p = lt + m[0].length;
    const attrs = [];
    let selfClose = false;
    for (;;) {
      while (/\s/.test(src[p])) p++;
      if (src[p] === '>') { p++; break; }
      if (src[p] === '/' && src[p + 1] === '>') { selfClose = true; p += 2; break; }
      if (p >= src.length) throw new Error(`unterminated tag <${tag}> at offset ${lt}`);
      const nm = /^[^\s=/>]+/.exec(src.slice(p, p + 200));
      const aStart = p;
      p += nm[0].length;
      let value = null;
      let q = p;
      while (/\s/.test(src[q])) q++;
      if (src[q] === '=') {
        q++;
        while (/\s/.test(src[q])) q++;
        if (src[q] === '"' || src[q] === "'") {
          const e = src.indexOf(src[q], q + 1);
          if (e === -1) throw new Error(`unterminated attribute value in <${tag}> at offset ${lt}`);
          value = src.slice(q + 1, e);
          p = e + 1;
        } else {
          const um = /^[^\s>]+/.exec(src.slice(q));
          value = um ? um[0] : '';
          p = q + value.length;
        }
      }
      attrs.push({ name: nm[0].toLowerCase(), value, start: aStart, end: p });
    }
    /** @type {El} */
    const el = { type: 'el', tag, attrs, children: [], parent: top(), start: lt, openEnd: p, closeStart: null, end: p };
    top().children.push(el);
    i = p;
    if (VOID.has(tag) || selfClose) continue;
    if (RAW_TEXT.has(tag)) {
      const re = new RegExp(`</${tag}\\s*>`, 'i');
      const rest = src.slice(p);
      const mm = re.exec(rest);
      if (!mm) throw new Error(`unterminated <${tag}> at offset ${lt}`);
      if (mm.index > 0) el.children.push({ type: 'text', value: rest.slice(0, mm.index), start: p, end: p + mm.index, parent: el });
      el.closeStart = p + mm.index;
      el.end = p + mm.index + mm[0].length;
      i = el.end;
      continue;
    }
    stack.push(el);
  }
  for (let j = stack.length - 1; j > 0; j--) { stack[j].closeStart = null; stack[j].end = src.length; }
  return root;
}

export function* elements(node) {
  for (const c of node.children || []) {
    if (c.type === 'el') { yield c; yield* elements(c); }
  }
}

export const attr = (el, name) => {
  const a = el.attrs.find((x) => x.name === name);
  return a ? (a.value === null ? '' : decode(a.value)) : undefined;
};
export const hasAttr = (el, name) => el.attrs.some((x) => x.name === name);

/** Source line (1-based) of an offset. */
export const lineOf = (src, offset) => src.slice(0, offset).split('\n').length;

/** True if the element is `<svg>` or sits inside one. */
export const inSvg = (el) => { for (let n = el; n && n.type === 'el'; n = n.parent) if (n.tag === 'svg') return true; return false; };
