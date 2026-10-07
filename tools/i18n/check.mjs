// Checks for the message catalogue. Run: node --test tools/i18n/check.mjs   (or: node tools/i18n/check.mjs)
//
//   1. the pages are readable: every data-i18n* attribute is well formed, same key = same text, templates match the markup;
//   2. no Russian (or language-dependent) text on a page without a key;
//   3. i18n/ru.json and i18n/context.json equal what is extracted from the pages (no drift);
//   4. the industry pages equal the output of tools/industries/build.mjs (nobody edited a generated file);
//   5. every key used in the markup exists in ru.json and every key of ru.json is used (markup, or js-sites.md for js.*);
//   6. every message is valid ICU (interpolation, plural, select, tags) and uses only the allowed tags;
//   7. key names are well formed;
//   8. context.json: notes point at existing keys, UI elements and headlines have a note;
//   9. en.json, when it exists: same keys, same variables and tags as ru.json, valid ICU, no empty text, no Cyrillic;
//  10. the copies embedded in the files are up to date (inline boot in every <head>, Russian message tables of the scripts: node tools/i18n/embed.mjs);
//  11. the Russian tables of the scripts give the same text as the reference formatter (icu.mjs) for every message;
//  12. the runtime of the English version (i18n.js) gives the same text as the reference formatter for every message of en.json;
//  13. en.json renders every use of a key in the markup (with its data-i18n-args), without Cyrillic left;
//  14. every page has the language switcher and the boot, and nothing links to a language variant of a URL (no hreflang, no ?lang= links).
// Browser checks of the English version and of the switcher: tools/playwright/lang.mjs; whole pages: tools/playwright/snapshot.mjs --lang en.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { extractAll, flatten, buildContext, loadNotes, loadTemplates, ALLOWED_TAGS, I18N_DIR, root, listPages, toJson } from './extract.mjs';
import { findUncovered } from './coverage.mjs';
import { parse as parseIcu, collect as collectIcu, format as formatIcu } from './icu.mjs';
import { syncBoot, syncScripts, ruBlock, bootBlock } from './embed.mjs';

const { messages, nested, byKey, problems, pages } = await extractAll();
const readJson = async (f) => JSON.parse(await readFile(join(I18N_DIR, f), 'utf8'));
const list = (items, n = 15) => items.slice(0, n).join('\n  ') + (items.length > n ? `\n  ... and ${items.length - n} more` : '');
const FIX = 'Fix: node tools/i18n/extract.mjs --write';
const CYRILLIC = /[Ѐ-ӿ]/;
const CYRILLIC_OK = /^(common\.brand|common\.footer\.wordmark)/; // keys whose English text may keep Cyrillic (the wordmark)
const enFile = process.env.I18N_EN || join(I18N_DIR, 'en.json'); // (I18N_EN: check another file, e.g. a draft)

test('1. pages: markup is well formed, one key means one text, templates match', () => {
  assert.deepEqual(problems, [], `\n  ${list(problems)}`);
});

test('2. pages: no language-dependent text without a key', async () => {
  const gaps = [];
  for (const name of pages) gaps.push(...findUncovered(name, await readFile(join(root, name), 'utf8')));
  assert.equal(gaps.length, 0, `\n  ${list(gaps.map((g) => `${g.page}:${g.line} [${g.what}] ${g.text}`))}\n  Add data-i18n / data-i18n-html / data-i18n-attr (see i18n/README.md)`);
});

test('3. ru.json and context.json equal the extraction (no drift)', async () => {
  const onDisk = await readJson('ru.json');
  const a = flatten(onDisk), b = messages;
  const added = Object.keys(b).filter((k) => !(k in a));
  const removed = Object.keys(a).filter((k) => !(k in b));
  const changed = Object.keys(b).filter((k) => k in a && a[k] !== b[k]);
  assert.ok(!added.length && !removed.length && !changed.length,
    `\n  new in pages, missing in ru.json: ${list(added, 8)}\n  in ru.json, not in pages: ${list(removed, 8)}\n  text differs: ${list(changed.map((k) => `${k}: «${a[k]}» -> «${b[k]}»`), 8)}\n  ${FIX}`);
  assert.equal(await readFile(join(I18N_DIR, 'ru.json'), 'utf8'), toJson(nested), `ru.json differs in formatting or key order. ${FIX}`);
  assert.equal(await readFile(join(I18N_DIR, 'context.json'), 'utf8'), toJson(await buildContext(byKey)), `context.json is out of date. ${FIX}`);
});

test('4. generated industry pages equal the generator output', async () => {
  const { build } = await loadTemplates();
  const stale = [];
  for (const ind of build.INDUSTRIES) {
    const file = join(root, `industries-${ind.slug}.html`);
    const onDisk = existsSync(file) ? await readFile(file, 'utf8') : null;
    if (onDisk !== build.page(ind)) stale.push(`industries-${ind.slug}.html`);
  }
  assert.deepEqual(stale, [], `\n  ${list(stale)}\n  Generated files are never edited by hand. Fix: node tools/industries/build.mjs`);
});

test('5. keys: used in the markup = present in ru.json (js.* keys are listed in js-sites.md)', async () => {
  const catalogue = flatten(await readJson('ru.json'));
  const usedKeys = new Set(Object.entries(byKey).filter(([, rec]) => rec.uses.some((u) => u.kind !== 'js')).map(([k]) => k));
  const missing = [...usedKeys].filter((k) => !(k in catalogue));
  assert.deepEqual(missing, [], `\n  used in markup, not in ru.json:\n  ${list(missing)}\n  ${FIX}`);
  const sitesText = existsSync(join(I18N_DIR, 'js-sites.md')) ? await readFile(join(I18N_DIR, 'js-sites.md'), 'utf8') : '';
  const sited = new Set([...sitesText.matchAll(/^\| `([^`]+)`/gm)].map((m) => m[1]));
  const orphans = Object.keys(catalogue).filter((k) => !usedKeys.has(k) && !sited.has(k));
  assert.deepEqual(orphans, [], `\n  in ru.json, used neither in markup nor in js-sites.md:\n  ${list(orphans)}`);
  const unknownSites = [...sited].filter((k) => !(k in catalogue));
  assert.deepEqual(unknownSites, [], `\n  listed in js-sites.md, not in ru.json:\n  ${list(unknownSites)}`);
  const unlisted = Object.keys(catalogue).filter((k) => k.startsWith('js.') && !sited.has(k) && !usedKeys.has(k));
  assert.deepEqual(unlisted, [], `\n  js.* keys without a call site in js-sites.md:\n  ${list(unlisted)}`);
});

test('6. messages: valid ICU, only allowed tags', () => {
  const bad = [];
  for (const [k, m] of Object.entries(messages)) {
    try {
      const { tags } = collectIcu(parseIcu(m));
      for (const t of tags) if (!ALLOWED_TAGS.includes(t.replace(/\/$/, ''))) bad.push(`${k}: tag <${t}> is not allowed (allowed: ${ALLOWED_TAGS.join(', ')})`);
    } catch (e) { bad.push(`${k}: ${e.message}`); }
  }
  assert.deepEqual(bad, [], `\n  ${list(bad)}`);
});

test('7. key names: segments of letters, digits, _ and -, no dots inside', () => {
  const bad = Object.keys(messages).filter((k) => k.split('.').some((s) => !/^[A-Za-z0-9_-]+$/.test(s)));
  assert.deepEqual(bad, [], `\n  ${list(bad)}`);
});

test('8. context.json: notes match keys; buttons, nav links, labels, options and headlines have a note', async () => {
  const notes = await loadNotes();
  const keys = Object.keys(messages);
  const dead = notes.filter((n) => !keys.some((k) => n.re.test(k))).map((n) => n.pattern);
  assert.deepEqual(dead, [], `\n  notes in context.notes.json that match no key:\n  ${list(dead)}`);
  const ctx = (await readJson('context.json')).keys;
  const need = new Set(['button', 'nav', 'label', 'option', 'h1', 'section-label']);
  const bare = Object.entries(ctx).filter(([, v]) => need.has(v.role) && !v.note).map(([k, v]) => `${k} (${v.role})`);
  assert.deepEqual(bare, [], `\n  UI elements without a note:\n  ${list(bare)}\n  Add them (patterns with * allowed) to i18n/context.notes.json, then ${FIX}`);
  for (const k of Object.keys(ctx)) assert.ok(k in messages, `context.json has a stale key ${k}. ${FIX}`);
});

test('9. en.json: same keys, same variables and tags, valid ICU', async (t) => {
  const file = enFile;
  if (!existsSync(file)) { t.skip('i18n/en.json does not exist yet'); return; }
  const en = flatten(JSON.parse(await readFile(file, 'utf8')));
  const missing = Object.keys(messages).filter((k) => !(k in en));
  const extra = Object.keys(en).filter((k) => !(k in messages));
  assert.ok(!missing.length && !extra.length, `\n  missing in en.json: ${list(missing, 10)}\n  not in ru.json: ${list(extra, 10)}`);
  const bad = [];
  for (const [k, ru] of Object.entries(messages)) {
    let a, b;
    try { a = collectIcu(parseIcu(ru)); } catch { continue; } // reported by test 6
    try { b = collectIcu(parseIcu(en[k])); } catch (e) { bad.push(`${k}: ${e.message}`); continue; }
    const names = (c) => [...c.vars.keys()].sort().join(',');
    if (names(a) !== names(b)) bad.push(`${k}: variables {${names(b)}} differ from ru {${names(a)}}`);
    const tags = (c) => [...c.tags].sort().join(',');
    if (tags(a) !== tags(b)) bad.push(`${k}: tags <${tags(b)}> differ from ru <${tags(a)}>`);
    if (!en[k].trim()) bad.push(`${k}: empty text`);
    if (CYRILLIC.test(en[k]) && !CYRILLIC_OK.test(k)) bad.push(`${k}: Cyrillic left in the English text`);
  }
  assert.deepEqual(bad, [], `\n  ${list(bad, 40)}`);
});

test('10. embedded copies are up to date (node tools/i18n/embed.mjs)', async () => {
  const stale = [...await syncBoot(true), ...await syncScripts(true)];
  assert.deepEqual(stale, [], `\n  ${list(stale)}\n  Fix: node tools/i18n/embed.mjs`);
});

/** Value sets that reach every branch of a message: plural categories of Russian and English, exact matches, every select option. */
const NUMBERS = [0, 1, 2, 3, 4, 5, 11, 12, 21, 22, 25, 101, 1.5, 1234567];
function valueSets(ast) {
  const selects = new Map();
  const walk = (nodes) => { for (const n of nodes) { if (n.type === 'select') selects.set(n.name, Object.keys(n.options)); for (const o of Object.values(n.options || {})) walk(o); if (n.children) walk(n.children); } };
  walk(ast);
  const { vars } = collectIcu(ast);
  const width = Math.max(0, ...[...selects.values()].map((o) => o.length)) + 1; // (+1: a value that no option names)
  const sets = [];
  for (const num of NUMBERS) {
    for (let i = 0; i < (selects.size ? width : 1); i++) {
      const v = {};
      for (const [name, kind] of vars) v[name] = selects.has(name) ? (selects.get(name)[i] ?? 'zzz') : /plural|number|selectordinal/.test(kind) ? num : 'Ab';
      sets.push(v);
    }
  }
  return sets;
}

/** Constructs the catalogue may not use today but the embedded code has to handle (select, offset, exact matches, quoting, tags with values). */
const SYNTHETIC = {
  'syn.select': '{kind, select, a {Alpha <b>{n}</b>} b {Beta} other {Other}}',
  'syn.offset': '{n, plural, offset:1 =0 {nobody} =1 {only {who}} one {{who} and # other} other {{who} and # others}}',
  'syn.exact': '{n, plural, =0 {none} one {# item} few {# few} many {# many} other {# items}}',
  'syn.tags': 'Click <a>here</a> or <b>{name}</b><br/>done',
  'syn.quote': "It''s '{'not'}' a variable: {n, number} and {n, number, ::.00}",
};

test('11. Russian tables of the scripts give the same text as the reference formatter', async () => {
  const ru = { ...flatten(await readJson('ru.json')), ...SYNTHETIC };
  const block = ruBlock(Object.keys(ru), ru);
  const { RU } = vm.runInNewContext(`${block}\n({ RU })`, { Intl, i18n: { t() {} } });
  const bad = [];
  for (const [k, m] of Object.entries(ru)) {
    const ast = parseIcu(m);
    for (const v of valueSets(ast)) {
      const want = formatIcu(ast, v, 'ru');
      let got;
      try { got = RU.m[k](v); } catch (e) { got = `error: ${e.message}`; }
      if (got !== want) { bad.push(`${k} ${JSON.stringify(v)}: «${got}» instead of «${want}»`); break; }
    }
  }
  assert.deepEqual(bad, [], `\n  ${list(bad)}`);
  assert.equal(RU.n(1234.5, 1), new Intl.NumberFormat('ru', { useGrouping: 'always', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(1234.5));
});

test('12. runtime of the English version (i18n.js) gives the same text as the reference formatter', async () => {
  const nested = { ...JSON.parse(await readFile(enFile, 'utf8')), syn: Object.fromEntries(Object.entries(SYNTHETIC).map(([k, m]) => [k.slice(4), m])) };
  const en = flatten(nested);
  const source = await readFile(join(root, 'i18n.js'), 'utf8');
  let finish;
  const done = new Promise((r) => { finish = r; });
  const win = { i18n: { lang: 'en', done: (why) => finish(why) } };
  const doc = { documentElement: {}, querySelectorAll: () => [] };
  vm.runInNewContext(source, { window: win, document: doc, console, Intl, fetch: async () => ({ ok: true, json: async () => nested }) });
  assert.equal(await done, undefined, 'i18n.js did not apply the dictionary');
  assert.equal(doc.documentElement.lang, 'en');
  const bad = [];
  for (const [k, m] of Object.entries(en)) {
    let ast;
    try { ast = parseIcu(m); } catch { continue; } // reported by test 9
    for (const v of valueSets(ast)) {
      const want = formatIcu(ast, v, 'en');
      let got;
      try { got = win.i18n.t(k, v); } catch (e) { got = `error: ${e.message}`; }
      if (got !== want) { bad.push(`${k} ${JSON.stringify(v)}: «${got}» instead of «${want}»`); break; }
    }
  }
  assert.deepEqual(bad, [], `\n  ${list(bad)}`);
  assert.equal(win.i18n.n(1234.5, 1), '1,234.5');
  assert.equal(win.i18n.t('common.brand', {}), en['common.brand']);
  assert.equal(win.i18n.t('no.such.key'), undefined);
});

test('13. en.json renders every use of a key in the markup, no Cyrillic left', async (t) => {
  if (!existsSync(enFile)) { t.skip('i18n/en.json does not exist yet'); return; }
  const en = flatten(JSON.parse(await readFile(enFile, 'utf8')));
  const bad = [];
  for (const [key, rec] of Object.entries(byKey)) {
    if (key in en === false) { bad.push(`${key}: no English text`); continue; }
    for (const u of rec.uses) {
      if (u.kind === 'js') continue;
      let out;
      try { out = formatIcu(parseIcu(en[key]), u.args ?? {}, 'en'); } catch (e) { bad.push(`${u.page}:${u.line} ${key}: ${e.message}`); continue; }
      if (CYRILLIC.test(out) && !CYRILLIC_OK.test(key)) bad.push(`${u.page}:${u.line} ${key}: Cyrillic in «${out.slice(0, 60)}»`);
    }
  }
  assert.deepEqual(bad, [], `\n  ${list(bad, 30)}`);
});

test('14. every page has the switcher and the boot; no links to language variants of a URL', async () => {
  const bad = [];
  const boot = bootBlock(await readFile(join(root, 'i18n', 'boot.js'), 'utf8'));
  for (const name of pages) {
    const src = await readFile(join(root, name), 'utf8');
    const head = src.slice(0, src.indexOf('</head>'));
    const at = head.indexOf(boot);
    if (at < 0) bad.push(`${name}: the inline boot is not in <head>`);
    else if (/<script[^>]*\ssrc=/.test(head.slice(0, at)) || head.indexOf('document.documentElement.classList.add(\'js\')') > at) bad.push(`${name}: the boot must come right after the 'js' class script and before any script file`);
    if (!/<html lang="ru"/.test(src)) bad.push(`${name}: <html lang="ru"> expected (Russian is the language of the markup)`);
    const header = /<header[\s\S]*?<\/header>/.exec(src)?.[0] ?? '';
    for (const l of ['ru', 'en']) if (!new RegExp(`<button type="button" lang="${l}" data-lang="${l}" aria-pressed="${l === 'ru'}"`).test(header)) bad.push(`${name}: header has no <button data-lang="${l}"> (aria-pressed="${l === 'ru'}")`);
    if (/hreflang/.test(src)) bad.push(`${name}: hreflang: the site has no language URLs`);
    if (/href="[^"]*[?&]lang=/.test(src)) bad.push(`${name}: a link to a ?lang= variant: the language is chosen with the button`);
  }
  assert.deepEqual(bad, [], `\n  ${list(bad)}`);
});

test('pages found', async () => {
  assert.equal((await listPages()).length, 23);
});
