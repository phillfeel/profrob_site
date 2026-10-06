// Finds text that a visitor reads, differs between languages (see NEEDS) and has no message key.
//
//   node tools/i18n/coverage.mjs        # list the gaps in every page
//
// A text node is covered if it sits inside an element with data-i18n or data-i18n-html; an attribute is covered if it is
// named in the element's data-i18n-attr. Text that scripts write by themselves is exempt (JS_OWNED): its messages live in
// the js namespace and are wired up in M2 (see i18n/js-sites.md).
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { parse as parseHtml, elements, attr, hasAttr, decode, lineOf } from './html.mjs';
import { NEEDS, TEXT_ATTRS, listPages, root } from './extract.mjs';

const SKIP = new Set(['script', 'style', 'noscript', 'template']);

/** Elements whose text or attribute is rewritten by scripts on load. */
const JS_OWNED = [
  (el) => hasAttr(el, 'data-count'), // count-up numbers (main.js)
  (el) => hasAttr(el, 'data-out'), // mini calculator results (industry.js)
  (el) => attr(el, 'id') === 'foot-clock' || hasAttr(el, 'data-ps-clock') || hasAttr(el, 'data-ps-now-t') || hasAttr(el, 'data-ready-n'),
  (el) => attr(el, 'id') === 'calc-area' || el.tag === 'output', // slider and its value (industry.js, roi.js)
  (el) => attr(el, 'type') === 'range', // aria-valuetext is set by scripts
  (el) => /^(out-|r-|cmp-|dock-v|crew|lead-sum|ctx|chart|fa-|in-|area-|staff-hint)/.test(attr(el, 'id') || '') && !hasAttr(el, 'data-i18n') && !hasAttr(el, 'data-i18n-html'),
];
const jsOwned = (el) => { for (let n = el; n && n.type === 'el'; n = n.parent) if (JS_OWNED.some((f) => f(n))) return true; return false; };

export function findUncovered(name, src) {
  const tree = parseHtml(src);
  const gaps = [];
  const covered = (el) => { for (let n = el; n && n.type === 'el'; n = n.parent) if (hasAttr(n, 'data-i18n') || hasAttr(n, 'data-i18n-html')) return true; return false; };
  const visit = (node) => {
    for (const c of node.children) {
      if (c.type === 'text') {
        const t = decode(c.value);
        if (node.type === 'el' && NEEDS.test(t) && !covered(node) && !jsOwned(node)) {
          gaps.push({ page: name, line: lineOf(src, c.start), what: 'text', text: t.replace(/\s+/g, ' ').trim().slice(0, 70) });
        }
      } else if (c.type === 'el') {
        if (SKIP.has(c.tag)) continue;
        const declared = new Set((attr(c, 'data-i18n-attr') || '').split(';').map((p) => p.split(':')[0]).filter(Boolean));
        for (const a of TEXT_ATTRS) {
          const v = attr(c, a);
          if (v === undefined || !NEEDS.test(v) || declared.has(a)) continue;
          if (a === 'content' && c.tag !== 'meta') continue;
          if (a === 'label' && c.tag !== 'option' && c.tag !== 'optgroup' && c.tag !== 'track') continue;
          if (jsOwned(c)) continue;
          gaps.push({ page: name, line: lineOf(src, c.start), what: a, text: v.slice(0, 70) });
        }
        visit(c);
      }
    }
  };
  visit(tree);
  return gaps;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  let total = 0;
  for (const name of await listPages()) {
    const gaps = findUncovered(name, await readFile(join(root, name), 'utf8'));
    total += gaps.length;
    for (const g of gaps) console.log(`${g.page}:${g.line} [${g.what}] ${g.text}`);
  }
  console.log(`${total} uncovered`);
  process.exitCode = total ? 1 : 0;
}
