// Copies of shared code that have to sit inside the files themselves (Russian visitors may not make a new request).
//
//   node tools/i18n/embed.mjs           # refresh the copies
//   node tools/i18n/embed.mjs --check   # only report copies that are out of date (check.mjs runs this)
//
// 1. i18n/boot.js is inlined in <head> of the hand-written pages (the industry pages get it from the generator).
// 2. The Russian messages that a script shows (string literals that are message keys, mostly t('key')) are compiled into a table inside that script
//    (see compileRu below): no ICU engine and no dictionary for Russian.
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse as parseIcu, collect as collectIcu } from './icu.mjs';
import { flatten } from './util.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** The inline boot script as it appears in a page. */
export const bootBlock = (boot) => `<script>\n${boot.trim()}\n</script>`;
const BOOT_RE = /<script>\n\(function \(w, d\) \{\n  var q = [\s\S]*?\n\}\)\(window, document\);\n<\/script>/;
export const HAND_PAGES = ['index.html', 'solutions.html', 'products.html', 'roi.html'];
const HEAD_ANCHOR = "  <script>document.documentElement.classList.add('js');</script>\n";

export async function syncBoot(check) {
  const boot = await readFile(join(root, 'i18n', 'boot.js'), 'utf8');
  const stale = [];
  for (const name of HAND_PAGES) {
    const file = join(root, name);
    const src = await readFile(file, 'utf8');
    const has = BOOT_RE.exec(src);
    const next = has ? src.replace(BOOT_RE, () => bootBlock(boot)) : src.replace(HEAD_ANCHOR, () => `${HEAD_ANCHOR}${bootBlock(boot)}\n`);
    if (next === src) continue;
    stale.push(name);
    if (!check) await writeFile(file, next);
  }
  return stale;
}

// ───────── Russian messages of the scripts ─────────
/** Scripts that show messages (t('key') calls) and carry their Russian table. */
export const SCRIPTS = ['roi.js', 'solutions.js', 'products.js', 'industry.js', 'industry-business-centers.js'];
const BLOCK_RE = /(  \/\* i18n:ru begin[^\n]*\*\/\n)[\s\S]*?(  \/\* i18n:ru end \*\/\n)/;
const LIT = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${').replace(/\u00a0/g, '\\u00a0').replace(/\u202f/g, '\\u202f');
const hasTags = (ast) => ast.some((n) => n.type === 'tag' || n.type === 'void' || (n.options && Object.values(n.options).some(hasTags)));

/**
 * The Russian message as a JS function of its values: same text as format(parse(message), values, 'ru') of icu.mjs.
 * `used` collects the helpers the function needs (n: number, p: plural, e: HTML escape).
 */
export function compileRu(message, used = new Set()) {
  const ast = parseIcu(message);
  const html = hasTags(ast);
  const body = (list, pound) => list.map((n) => {
    switch (n.type) {
      case 'text': return LIT(n.value);
      case 'pound': used.add('n'); return `\${n(${pound})}`;
      case 'arg':
        if (n.format) { used.add('n'); const m = /^::\.(0+)$/.exec(n.format); return `\${n(v.${n.name}${m ? `, ${m[1].length}` : ''})}`; }
        if (html) { used.add('e'); return `\${e(v.${n.name})}`; }
        return `\${v.${n.name}}`;
      case 'plural': {
        used.add('p');
        const x = `v.${n.name}`, off = n.offset ? ` - ${n.offset}` : '';
        const inner = (o) => body(o, `${x}${off}`);
        const cats = Object.entries(n.options).filter(([k]) => !k.startsWith('=')).map(([k, o]) => `${k}: \`${inner(o)}\``).join(', ');
        let expr = `p(${x}${off}, { ${cats} })`;
        for (const [k, o] of Object.entries(n.options).filter(([k]) => k.startsWith('=')).reverse()) expr = `${x} === ${k.slice(1)} ? \`${inner(o)}\` : ${expr}`;
        return `\${${expr}}`;
      }
      case 'select': {
        const o = Object.entries(n.options).map(([k, b]) => `${/^\w+$/.test(k) ? k : JSON.stringify(k)}: \`${body(b, pound)}\``).join(', ');
        return `\${((o) => o[String(v.${n.name})] ?? o.other)({ ${o} })}`;
      }
      case 'tag': return `<${n.name}>${body(n.children, pound)}</${n.name}>`;
      default: return `<${n.name}/>`;
    }
  }).join('');
  const code = body(ast, 'v.n');
  const dynamic = /\$\{/.test(code);
  return dynamic ? `(v) => \`${code}\`` : `() => '${code.replace(/\\`/g, '`').replace(/'/g, "\\'")}'`;
}

/** The messages a script shows: every string literal in it that is a key of the catalogue (t('key'), a function that returns a key…). */
const keysOf = (src, catalogue) => [...new Set([...src.matchAll(/'([A-Za-z][A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+)+)'/g)].map((m) => m[1]).filter((k) => k in catalogue))];

/** The generated block of one script. */
export function ruBlock(keys, catalogue) {
  const used = new Set();
  const lines = keys.map((k) => {
    if (!(k in catalogue)) throw new Error(`t('${k}'): no such message in i18n/ru.json`);
    return `      ${JSON.stringify(k).replace(/"/g, "'")}: ${compileRu(catalogue[k], used)},`;
  });
  const helpers = [
    "    const nf = new Intl.NumberFormat('ru', { useGrouping: 'always' });",
    "    const n = (x, d) => (d === undefined ? nf : new Intl.NumberFormat('ru', { useGrouping: 'always', minimumFractionDigits: d, maximumFractionDigits: d })).format(x);",
    ...(used.has('p') ? ["    const pr = new Intl.PluralRules('ru');", '    const p = (x, o) => o[pr.select(x)] || o.other;'] : []),
    ...(used.has('e') ? ["    const e = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');"] : []),
  ];
  return [
    '  /* i18n:ru begin (generated by tools/i18n/embed.mjs from i18n/ru.json: the Russian text of the messages this script shows; do not edit) */',
    '  const RU = (() => {',
    ...helpers,
    '    return {',
    '      n,',
    '      m: {',
    ...lines.map((l) => `  ${l}`),
    '      },',
    '    };',
    '  })();',
    '  // N: a number as the site writes it in the current language; t: a message, English from the dictionary, else Russian from RU',
    '  const N = (x, d) => (i18n.n || RU.n)(x, d);',
    "  const t = (key, v) => { const s = i18n.t(key, v); return s === undefined ? RU.m[key](v) : s; };",
    '  /* i18n:ru end */',
    '',
  ].join('\n');
}

export async function syncScripts(check) {
  const catalogue = flatten(JSON.parse(await readFile(join(root, 'i18n', 'ru.json'), 'utf8')));
  const stale = [];
  for (const name of SCRIPTS) {
    const file = join(root, name);
    const src = await readFile(file, 'utf8');
    if (!BLOCK_RE.test(src)) throw new Error(`${name}: no "i18n:ru begin/end" markers`);
    const block = ruBlock(keysOf(src.replace(BLOCK_RE, ''), catalogue), catalogue);
    const next = src.replace(BLOCK_RE, () => block);
    if (next === src) continue;
    stale.push(name);
    if (!check) await writeFile(file, next);
  }
  return stale;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const check = process.argv.includes('--check');
  const stale = [...await syncBoot(check), ...await syncScripts(check)];
  console.log(stale.length ? `${check ? 'out of date' : 'updated'}: ${stale.join(', ')}` : 'embedded copies are up to date');
  if (check && stale.length) process.exitCode = 1;
}
