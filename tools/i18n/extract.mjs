// Builds the Russian message catalogue from the site itself.
//
//   node tools/i18n/extract.mjs            # print a summary
//   node tools/i18n/extract.mjs --write    # write i18n/ru.json and i18n/context.json
//   node tools/i18n/extract.mjs --duplicates   # the same Russian text under several keys (translate them alike, or tell why not)
//
// Sources: every data-i18n / data-i18n-html / data-i18n-attr in the pages (hand-written and generated), the templates of
// messages with variables (tools/industries/build.mjs, TEMPLATES) and i18n/js.ru.json (strings that exist only in JS).
// The markup contract is described in i18n/README.md.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { parse as parseHtml, elements, attr, hasAttr, decode, lineOf, VOID } from './html.mjs';
import { parse as parseIcu, format as formatIcu, collect as collectIcu, quote } from './icu.mjs';
import { NEEDS } from './needs.mjs';
import { flatten, toJson } from './util.mjs';
export { flatten, toJson };

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const I18N_DIR = join(root, 'i18n');

/** Tags that may appear in a message with markup. Their attributes stay in the page; a message only says where they go. */
export const ALLOWED_TAGS = ['a', 'b', 'br', 'button', 'em', 'i', 'mark', 'small', 'span', 'strong', 'sub', 'sup', 'u'];
/** Attributes that carry text for people; they need a data-i18n-attr entry when the text is language-dependent. */
export const TEXT_ATTRS = ['alt', 'title', 'aria-label', 'placeholder', 'content', 'data-name', 'data-cat', 'data-res', 'label', 'aria-valuetext'];
export { NEEDS };
/** Order of the top-level namespaces in ru.json. */
export const NAMESPACES = ['common', 'home', 'solutions', 'roi', 'calc', 'industries', 'js'];

const SKIP = new Set(['script', 'style', 'noscript', 'template']);
// HTML white space only: String.trim() would also eat non-breaking spaces, which are content
const collapse = (s) => s.replace(/[ \t\r\n]+/g, ' ').replace(/^ | $/g, '');

export const listPages = async () => (await readdir(root)).filter((f) => f.endsWith('.html')).sort((a, b) => {
  const rank = (f) => (f === 'index.html' ? 0 : f === 'solutions.html' ? 1 : f === 'products.html' || f === 'roi.html' ? 2 : 3);
  return rank(a) - rank(b) || a.localeCompare(b);
});

/** The text of a plain-text element (no child elements allowed). */
const plainText = (el) => collapse(decode(el.children.filter((c) => c.type === 'text').map((c) => c.value).join('')));

/** The message of an element with inline tags: ICU text with attribute-less tags. Returns null and a reason if it can't be one. */
export function richMessage(el) {
  const bad = [];
  const walk = (node) => node.children.map((c) => {
    if (c.type === 'text') return quote(decode(c.value));
    if (c.type === 'comment') return '';
    if (!ALLOWED_TAGS.includes(c.tag)) { bad.push(`<${c.tag}>`); return ''; }
    if (c.tag === 'br' || (VOID.has(c.tag))) return `<${c.tag}/>`;
    const inner = walk(c);
    return inner === '' && !c.children.length ? `<${c.tag}/>` : `<${c.tag}>${inner}</${c.tag}>`;
  }).join('');
  const text = collapse(walk(el));
  return bad.length ? { error: `tag ${[...new Set(bad)].join(', ')} is not allowed in a message` } : { text };
}

/** Role of a message, from the element it sits on: it decides what the translator is told about width and tone. */
function roleOf(el, kind, attrName) {
  if (kind === 'attr') {
    if (attrName === 'alt') return 'alt';
    if (attrName === 'aria-label' || attrName === 'aria-valuetext') return 'aria';
    if (attrName === 'content') return 'meta';
    if (attrName === 'placeholder') return 'placeholder';
    if (attrName === 'data-name') return 'section-label';
    if (attrName === 'data-cat' || attrName === 'data-res') return 'caption';
    return 'attr';
  }
  const cls = (attr(el, 'class') || '').split(/\s+/);
  const chain = []; for (let n = el; n && n.type === 'el'; n = n.parent) chain.push(n);
  const inClass = (re) => chain.some((n) => re.test(attr(n, 'class') || ''));
  if (el.tag === 'title') return 'meta';
  const head = chain.find((n) => /^h[1-6]$/.test(n.tag) || (attr(n, 'class') || '').split(/\s+/).includes('whyn__h'));
  if (head) return head.tag === 'h1' ? 'h1' : 'heading'; // (the lines of a headline are spans inside it)
  if (el.tag === 'button' || cls.includes('btn') || cls.includes('btn__t') || inClass(/(^|\s)btn(\s|$)/)) return 'button';
  if (chain.some((n) => n.tag === 'a' && n.parent && n.parent.tag === 'nav')) return 'nav';
  if (cls.includes('idx') || chain.some((n) => (attr(n, 'class') || '').split(/\s+/).includes('idx')) || cls.includes('lbl')) return 'section-label';
  if (el.tag === 'legend' || el.tag === 'label') return 'label';
  if (el.tag === 'option') return 'option';
  if (el.tag === 'dt' || el.tag === 'figcaption' || el.tag === 'summary') return 'caption';
  if (cls.includes('mono') || cls.includes('tag') || cls.includes('badge-roi') || cls.includes('badge-online') || cls.includes('pill') || el.tag === 'small' || el.tag === 'text') return 'tag';
  if (el.tag === 'a') return 'link';
  if (el.tag === 'li' || el.tag === 'span' || el.tag === 'b' || el.tag === 'dd') return 'short';
  return 'paragraph';
}

/** Nearest section: id of the closest ancestor <section>/<header>/<footer>/<nav>, for the translator's orientation. */
const whereOf = (el) => {
  for (let n = el; n && n.type === 'el'; n = n.parent) {
    if (n.tag === 'section') return `#${attr(n, 'id') || attr(n, 'data-name') || 'section'}`;
    if (n.tag === 'header') return 'header';
    if (n.tag === 'footer') return 'footer';
    if (n.tag === 'head') return 'head';
  }
  return 'page';
};

/**
 * Reads one page.
 * @returns {{ uses: {key:string, message:string|null, kind:string, role:string, where:string, line:number, args?:any, tag:string}[], problems: string[] }}
 */
export function readPage(name, src, templates) {
  const tree = parseHtml(src);
  const uses = [];
  const problems = [];
  const at = (el) => `${name}:${lineOf(src, el.start)}`;
  for (const el of elements(tree)) {
    if (SKIP.has(el.tag) && !el.attrs.some((a) => a.name.startsWith('data-i18n'))) continue;
    const args = hasAttr(el, 'data-i18n-args') ? (() => { try { return JSON.parse(attr(el, 'data-i18n-args')); } catch { problems.push(`${at(el)}: data-i18n-args is not valid JSON`); return null; } })() : undefined;
    const add = (key, message, kind, role, extra = {}) => uses.push({ key, message, kind, role, where: whereOf(el), line: lineOf(src, el.start), tag: el.tag, page: name, args, ...extra });
    if (hasAttr(el, 'data-i18n')) {
      const key = attr(el, 'data-i18n');
      // (with data-i18n-args the content is a rendering of the template: it may contain layout elements)
      if (args === undefined && el.children.some((c) => c.type === 'el')) problems.push(`${at(el)}: data-i18n="${key}" on an element with child elements (use data-i18n-html or a wrapper)`);
      add(key, plainText(el) === '' ? '' : quote(plainText(el)), 'text', roleOf(el, 'text'));
    }
    if (hasAttr(el, 'data-i18n-html')) {
      const key = attr(el, 'data-i18n-html');
      const m = richMessage(el);
      if (m.error) problems.push(`${at(el)}: ${key}: ${m.error}`);
      else add(key, m.text, 'html', roleOf(el, 'html'));
    }
    if (hasAttr(el, 'data-i18n-attr')) {
      for (const pair of attr(el, 'data-i18n-attr').split(';')) {
        const i = pair.indexOf(':');
        if (i < 1) { problems.push(`${at(el)}: malformed data-i18n-attr "${pair}"`); continue; }
        const a = pair.slice(0, i), key = pair.slice(i + 1);
        if (!hasAttr(el, a)) { problems.push(`${at(el)}: data-i18n-attr names ${a} but the element has no such attribute`); continue; }
        add(key, quote(collapse(attr(el, a))), 'attr', roleOf(el, 'attr', a), { attrName: a });
      }
    }
  }
  // Messages with variables: the template is the source, the markup must be its rendering.
  for (const u of uses) {
    if (u.args === undefined) continue;
    const tpl = templates[u.key];
    if (tpl === undefined) { problems.push(`${u.page}:${u.line}: ${u.key} has data-i18n-args but no template (tools/industries/build.mjs, TEMPLATES)`); continue; }
    let rendered;
    try { rendered = formatIcu(parseIcu(tpl), u.args, 'ru'); } catch (e) { problems.push(`${u.page}:${u.line}: ${u.key}: ${e.message}`); continue; }
    const strip = (s) => s.replace(/[\s\u00a0 ]+/g, '');
    if (strip(rendered) !== strip(u.message ?? '')) problems.push(`${u.page}:${u.line}: ${u.key}: the markup says «${u.message}» but the template renders «${rendered}»`);
    u.message = tpl;
  }
  return { uses, problems, tree };
}

const setDeep = (obj, key, value, problems) => {
  const parts = key.split('.');
  let node = obj;
  parts.forEach((p, i) => {
    if (p === '') { problems.push(`key "${key}" has an empty segment`); return; }
    if (i === parts.length - 1) {
      if (typeof node[p] === 'object') problems.push(`key "${key}" is also a prefix of other keys`);
      node[p] = value;
    } else {
      if (typeof node[p] === 'string') problems.push(`key "${parts.slice(0, i + 1).join('.')}" is both a message and a prefix of "${key}"`);
      if (typeof node[p] !== 'object') node[p] = {};
      node = node[p];
    }
  });
};

/** The templates of messages with variables, from the generator. */
export async function loadTemplates() {
  const build = await import(pathToFileURL(join(root, 'tools', 'industries', 'build.mjs')).href);
  return { templates: build.TEMPLATES, build };
}

/** Everything the tools need: messages (flat), where each key is used, problems found while reading. */
export async function extractAll() {
  const { templates } = await loadTemplates();
  const pages = await listPages();
  const problems = [];
  /** @type {Record<string, string>} */
  const messages = {};
  /** @type {Record<string, {message:string, uses:any[]}>} */
  const byKey = {};
  for (const name of pages) {
    const src = await readFile(join(root, name), 'utf8');
    const r = readPage(name, src, templates);
    problems.push(...r.problems);
    for (const u of r.uses) {
      if (u.message === null) continue;
      const rec = byKey[u.key] || (byKey[u.key] = { message: u.message, uses: [] });
      if (rec.message !== u.message) problems.push(`${u.page}:${u.line}: ${u.key} says «${u.message}» but ${rec.uses[0].page}:${rec.uses[0].line} says «${rec.message}» (one key, one text: use another key if the meaning differs)`);
      rec.uses.push(u);
    }
  }
  // Strings that exist only in JS
  const jsFile = join(I18N_DIR, 'js.ru.json');
  const jsSource = existsSync(jsFile) ? JSON.parse(await readFile(jsFile, 'utf8')) : {};
  const jsFlat = flatten(jsSource);
  for (const [k, v] of Object.entries(jsFlat)) {
    if (!k.startsWith('js.')) problems.push(`i18n/js.ru.json: key "${k}" is outside the js namespace`);
    if (byKey[k] && byKey[k].message !== v) problems.push(`i18n/js.ru.json: ${k} says «${v}» but the markup (${byKey[k].uses[0].page}:${byKey[k].uses[0].line}) says «${byKey[k].message}»`);
    else if (!byKey[k]) byKey[k] = { message: v, uses: [{ page: 'js', line: 0, role: 'js', where: 'script', kind: 'js', tag: '' }] };
  }
  const keys = Object.keys(byKey).sort((a, b) => {
    const ra = NAMESPACES.indexOf(a.split('.')[0]), rb = NAMESPACES.indexOf(b.split('.')[0]);
    return (ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb);
  }); // stable sort: inside a namespace the order of first use (page order, then document order) is kept
  const nested = {};
  for (const k of keys) { messages[k] = byKey[k].message; setDeep(nested, k, byKey[k].message, problems); }
  return { messages, nested, byKey, problems, pages };
}

/** What the translator is told about the room a message has, by role. */
export const ROLE_LIMITS = {
  h1: 'headline; EN at most +15% of the RU length, each line separately',
  heading: 'heading; EN at most +15% of the RU length',
  button: 'button or call to action; at most +15% and 28 characters, starts with a verb',
  nav: 'navigation link; shorter than the RU, one line',
  'section-label': 'section label in capitals; not longer than the RU',
  tag: 'small tag or label (often capitals, mono font); not longer than the RU',
  label: 'form label or legend; EN at most +15%',
  caption: 'caption under a figure or number; EN at most +15%',
  short: 'short line; EN at most +15%',
  option: 'option of a drop-down list; EN at most +15%',
  link: 'link text; EN at most +15%',
  meta: 'browser tab title (up to 60 characters) or page description (up to 160)',
  alt: 'image description for screen readers; no length limit',
  aria: 'label read by screen readers; no length limit',
  placeholder: 'input placeholder; shorter than the field',
  paragraph: 'running text; EN within +-20% of the RU',
  js: 'text assembled in JS; keep the variables and tags',
};

/** A pattern with * for one key segment and ** for any number of segments → RegExp. */
export const notePattern = (pat) => new RegExp(`^${pat.split('.').map((s) => (s === '**' ? '.+' : s === '*' ? '[^.]+' : s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('\\.')}$`);

/** Hand-written notes (i18n/context.notes.json: key or key pattern → note) matched against a key. */
export async function loadNotes() {
  const file = join(I18N_DIR, 'context.notes.json');
  const raw = existsSync(file) ? JSON.parse(await readFile(file, 'utf8')) : {};
  return Object.entries(raw).map(([pattern, note]) => ({ pattern, note, re: notePattern(pattern) }));
}

const pageName = (p) => (p === 'index.html' ? 'home' : p.replace(/^industries-/, '').replace(/\.html$/, ''));

/** Per-key information for translators: role, where it stands, variables, and the hand-written notes. */
export async function buildContext(byKey) {
  const notes = await loadNotes();
  const keys = {};
  for (const [key, rec] of Object.entries(byKey)) {
    const first = rec.uses[0];
    const pages = [...new Set(rec.uses.map((u) => pageName(u.page)))];
    const info = collectVars(rec.message);
    const hand = notes.filter((n) => n.re.test(key)).map((n) => n.note);
    keys[key] = {
      role: first.role,
      where: pages.length > 3 ? `${pages.length} pages` : pages.map((p) => `${p}${p === 'js' ? '' : ` ${first.where}`}`.trim()).join(', '),
      ...(info ? { variables: info } : {}),
      ...(hand.length ? { note: hand.join(' ') } : {}),
    };
  }
  return { roles: ROLE_LIMITS, keys };
}

/** Variables and tags of a message, in words, for the translator. */
export function collectVars(message) {
  const { vars, tags } = collectIcu(parseIcu(message));
  const parts = [...vars].map(([n, k]) => `{${n}}${k === 'arg' ? '' : ` (${k})`}`);
  if (tags.size) parts.push(`tags: ${[...tags].map((t) => (t.endsWith('/') ? `<${t}>` : `<${t}>…</${t}>`)).join(' ')}`);
  return parts.length ? parts.join('; ') : null;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const { messages, nested, byKey, problems, pages } = await extractAll();
  if (problems.length) {
    console.error(`${problems.length} problem(s):`);
    for (const p of problems) console.error(`  ${p}`);
    process.exitCode = 1;
  }
  const perNs = {};
  for (const k of Object.keys(messages)) perNs[k.split('.')[0]] = (perNs[k.split('.')[0]] || 0) + 1;
  console.log(`${Object.keys(messages).length} messages from ${pages.length} pages:`, JSON.stringify(perNs));
  if (process.argv.includes('--duplicates')) {
    const byText = {};
    for (const [k, m] of Object.entries(messages)) (byText[m] ||= []).push(k);
    const dup = Object.entries(byText).filter(([m, ks]) => ks.length > 1 && /[А-Яа-яЁё]/.test(m));
    for (const [m, ks] of dup) console.log(`${ks.length}x «${m.length > 70 ? `${m.slice(0, 70)}…` : m}»\n     ${ks.join('\n     ')}`);
    console.log(`${dup.length} texts with more than one key`);
  }
  if (process.argv.includes('--write')) {
    if (problems.length) { console.error('not writing: fix the problems first'); process.exit(1); }
    await writeFile(join(I18N_DIR, 'ru.json'), toJson(nested));
    await writeFile(join(I18N_DIR, 'context.json'), toJson(await buildContext(byKey)));
    console.log('wrote i18n/ru.json and i18n/context.json');
  }
}
