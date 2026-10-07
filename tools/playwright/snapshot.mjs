// Page snapshot for before/after comparisons (i18n markup changes must not alter the Russian pages).
//
//   node tools/playwright/snapshot.mjs --out /path/to/dir [--pages index.html,roi.html?k=floor] [--widths 1440,390] [--root /path/to/site]
//                                       [--motion] [--ignore '.nav'] [--lang en [--dict file] [--dict-locale ru]]
//   node tools/playwright/snapshot.mjs --compare /path/to/before /path/to/after [--only index] [--kind box] [--text-only]
//
// A snapshot (one JSON per page and width) holds, in document order:
//   texts  — every word of every text node, in document order: the word, its rendered rect, computed font/colour of its
//            parent (so wrapping text in an extra element is invisible unless it changes how the text looks);
//   attrs  — values of text-bearing attributes (alt, title, aria-label, placeholder, meta content, data-name/-cat/-res, ...);
//   boxes  — border boxes of every element except class-less <span>/<bdi> (wrappers added by i18n markup are such elements).
// Motion is reduced (--motion: not reduced, then compare with --text-only) and the clock is fixed, so two runs of the same
// sources produce identical files.
// --ignore <selector> leaves a part of the page out (the language switcher is new in the header, say).
// --lang en takes the English version through the real runtime (see below); each snapshot also records the page's horizontal
// overflow, console errors and warnings.
// --compare [--only <name prefix>] prints every difference (positions are compared with a 0.5 px tolerance) and exits with code 1 if any.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize, dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf(`--${name}`); return i > -1 ? argv[i + 1] : undefined; };

const TOL = 0.5;

// ───────── compare mode ─────────
if (argv.includes('--compare')) {
  const [a, b] = argv.slice(argv.indexOf('--compare') + 1);
  const only = opt('only'); // compare just the snapshots whose file name starts with this
  const kind = opt('kind'); // print only differences of one kind: text, attr or box
  const textOnly = argv.includes('--text-only'); // compare words and attributes only: for snapshots taken with --motion
  const files = (await readdir(a)).filter((f) => f.endsWith('.json') && (!only || f.startsWith(only))).sort();
  let bad = 0;
  const summary = argv.includes('--summary'); // also print difference counts by type and the 10 worst snapshots
  const byType = {}, perFile = [], perTypeFile = {};
  const near = (x, y) => Math.abs(x - y) <= TOL;
  const rectsEq = (p, q) => p.length === q.length && p.every((r, i) => r.every((v, j) => near(v, q[i][j])));
  for (const f of files) {
    const A = JSON.parse(await readFile(join(a, f), 'utf8'));
    let B;
    try { B = JSON.parse(await readFile(join(b, f), 'utf8')); } catch { console.log(`${f}: missing in ${b}`); bad++; continue; }
    const out = [];
    if (A.title !== B.title) out.push(`title: ${JSON.stringify(A.title)} -> ${JSON.stringify(B.title)}`);
    if (A.lang !== B.lang) out.push(`lang: ${A.lang} -> ${B.lang}`);
    const diffSeq = (name, xs, ys, keyOf, same) => {
      // Longest common subsequence on keys keeps the report short when one node is inserted or lost.
      const n = xs.length, m = ys.length;
      const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = keyOf(xs[i]) === keyOf(ys[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      let i = 0, j = 0;
      while (i < n || j < m) {
        if (i < n && j < m && keyOf(xs[i]) === keyOf(ys[j])) {
          const why = same(xs[i], ys[j]);
          if (why) out.push(`${name} changed: ${keyOf(xs[i]).slice(0, 80)} (${why})`);
          i++; j++;
        } else if (j < m && (i === n || dp[i][j + 1] >= dp[i + 1][j])) { out.push(`${name} added: ${keyOf(ys[j]).slice(0, 100)}`); j++; }
        else { out.push(`${name} lost: ${keyOf(xs[i]).slice(0, 100)}`); i++; }
      }
    };
    diffSeq('text', A.texts, B.texts, (t) => t.t, (x, y) => (textOnly ? '' : rectsEq(x.r, y.r) ? (x.s === y.s ? '' : `style ${x.s} -> ${y.s}`) : `rect ${JSON.stringify(x.r)} -> ${JSON.stringify(y.r)}`));
    diffSeq('attr', A.attrs, B.attrs, (t) => `${t.n}[${t.a}]=${t.v}`, () => '');
    if (!textOnly) diffSeq('box', A.boxes, B.boxes, (t) => t.k, (x, y) => (x.r.every((v, i) => near(v, y.r[i])) ? '' : `${JSON.stringify(x.r)} -> ${JSON.stringify(y.r)}`));
    console.log(`${out.length ? 'DIFF' : 'same'} ${f} (texts ${A.texts.length}, attrs ${A.attrs.length}, boxes ${A.boxes.length})`);
    if (summary) {
      for (const l of out) { const key = l.startsWith('title') || l.startsWith('lang') ? l.split(':')[0] : l.replace(/^(\w+ \w+)(?::| \().*$/s, '$1').split(' ').slice(0, 2).join(' '); byType[key] = (byType[key] ?? 0) + 1; ((perTypeFile[key] ??= {})[f] = (perTypeFile[key][f] ?? 0) + 1); }
      perFile.push([f, out.length]);
    }
    const shown = out.filter((l) => !kind || l.startsWith(kind));
    for (const line of shown.slice(0, 40)) console.log(`     ${line}`);
    if (shown.length > 40) console.log(`     ... ${shown.length - 40} more`);
    if (out.length) bad++;
  }
  if (summary) {
    console.log('SUMMARY total', perFile.reduce((n, [, c]) => n + c, 0), JSON.stringify(byType));
    for (const [k, m] of Object.entries(perTypeFile)) console.log(`  ${k}: ${Object.entries(m).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([f, c]) => `${f.replace('.json', '')}=${c}`).join(' ')}`);
    console.log('TOP10', perFile.sort((x, y) => y[1] - x[1]).slice(0, 10).map(([f, c]) => `${f}=${c}`).join(' '));
  }
  console.log(bad ? `${bad} of ${files.length} snapshots differ` : `all ${files.length} snapshots identical`);
  process.exit(bad ? 1 : 0);
}

// ───────── capture mode ─────────
const outDir = opt('out');
if (!outDir) { console.error('usage: snapshot.mjs --out <dir> | --compare <dirA> <dirB>'); process.exit(2); }
const widths = (opt('widths') ?? '1440,390').split(',').map(Number);
const siteRoot = opt('root') ? resolve(opt('root')) : root; // another copy of the site, e.g. an export of the original commit
const baseUrl = opt('base-url');
const locale = opt('locale');
const mapFile = opt('map');
const routeMap = mapFile ? JSON.parse(await readFile(resolve(mapFile), 'utf8')) : null;
const pages = opt('pages') ? opt('pages').split(',') : routeMap ? Object.keys(routeMap) : (await readdir(siteRoot)).filter((f) => f.endsWith('.html')).sort();

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    res.writeHead(200, { 'content-type': MIME[extname(rel)] ?? 'application/octet-stream' }).end(await readFile(join(siteRoot, rel)));
  } catch { res.writeHead(404).end('not found'); }
});
let base = baseUrl;
if (!base) {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}/`;
}
await mkdir(outDir, { recursive: true });

// Runs inside the page.
const collect = (ignore) => {
  const skip = (el) => !!(ignore && el.closest(ignore)); // (--ignore: a part of the page that is allowed to differ)
  const ATTRS = ['alt', 'title', 'aria-label', 'placeholder', 'content', 'data-name', 'data-cat', 'data-res', 'label', 'value', 'aria-valuetext'];
  const MASK = '[id="foot-clock"], [data-ps-clock], [data-ps-now-t]';
  const r1 = (v) => Math.round(v * 10) / 10;
  const sy = scrollY, sx = scrollX;
  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const p = n.parentElement;
    if (!p || p.closest('script, style, noscript, template') || skip(p)) continue;
    const raw = n.nodeValue;
    if (!raw.trim()) continue;
    const masked = !!p.closest(MASK);
    const s = (() => { const cs = getComputedStyle(p); return [cs.color, cs.fontSize, cs.fontWeight, cs.fontFamily, cs.textTransform, cs.letterSpacing, cs.lineHeight, cs.visibility].join('|'); })();
    const range = document.createRange();
    for (const m of raw.matchAll(/\S+/g)) {
      let r = [];
      if (!masked) {
        range.setStart(n, m.index); range.setEnd(n, m.index + m[0].length);
        const q = range.getClientRects()[0];
        if (q) r = [[r1(q.left + sx), r1(q.top + sy), r1(q.width), r1(q.height)]];
      }
      texts.push({ t: masked ? '<masked>' : m[0], r, s });
    }
  }
  const attrs = [];
  const boxes = [];
  const counts = new Map();
  for (const el of document.querySelectorAll('*')) {
    if (el.closest('script, style, noscript, template') || skip(el)) continue;
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      if (a === 'value' && !/^(submit|button)$/.test(el.getAttribute('type') || '')) continue;
      if (a === 'content' && el.tagName !== 'META') continue;
      attrs.push({ n: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''), a, v: el.getAttribute(a) });
    }
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue; // svg internals: text is covered above, shapes don't move
    if ((el.tagName === 'SPAN' || el.tagName === 'BDI') && !el.getAttribute('class')) continue;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).sort().join('.') : '';
    const k0 = `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}${el.id ? `#${el.id}` : ''}`;
    const i = (counts.get(k0) || 0) + 1;
    counts.set(k0, i);
    const r = el.getBoundingClientRect();
    boxes.push({ k: `${k0}@${i}`, r: [r1(r.left + sx), r1(r.top + sy), r1(r.width), r1(r.height)] });
  }
  return { title: document.title, lang: document.documentElement.lang, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, texts, attrs, boxes };
};

// --lang en [--dict file]: the English version through the real runtime (i18n.js); --dict replaces i18n/en.json, for a
// draft or a pseudo-locale. --dict-locale ru runs the runtime in the Russian locale: with i18n/ru.json as the dictionary the
// page must come out as it is, which proves the dictionary and the markup agree.
const lang = opt('lang');
const dictFile = opt('dict');
const dictLocale = opt('dict-locale');
const ignore = opt('ignore');
const dict = dictFile ? await readFile(resolve(dictFile), 'utf8') : null;
const runtimeSource = dictLocale ? (await readFile(join(siteRoot, 'i18n.js'), 'utf8')).replace("const LANG = 'en';", `const LANG = '${dictLocale}';`) : null;

const browser = await chromium.launch();
try {
  for (const page of pages) {
    for (const width of widths) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: argv.includes('--motion') ? 'no-preference' : 'reduce' });
      await ctx.clock.setFixedTime(new Date('2026-06-15T09:30:00+03:00'));
      if (lang && !baseUrl) await ctx.addInitScript((l) => { try { localStorage.setItem('lang', l); } catch (e) { /* private mode */ } }, lang);
      if (dict) await ctx.route('**/i18n/en.json', (r) => r.fulfill({ contentType: 'application/json', body: dict }));
      if (runtimeSource) await ctx.route('**/i18n.js', (r) => r.fulfill({ contentType: 'text/javascript', body: runtimeSource }));
      const pg = await ctx.newPage();
      const errors = [], warnings = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); else if (m.type() === 'warning') warnings.push(m.text()); });
      const mapped = routeMap?.[page] ?? `/${page}`;
      const pathname = locale === 'en' && !mapped.startsWith('/en/') ? `/en${mapped}` : mapped;
      await pg.goto(new URL(pathname.replace(/^\/(?!\/)/, '/'), base).toString(), { waitUntil: 'domcontentloaded', timeout: 30000 });
      await pg.evaluate(() => (window.i18n ? window.i18n.ready : null));
      await pg.evaluate(() => document.fonts.ready);
      await pg.waitForTimeout(1200);
      const snap = await pg.evaluate(collect, ignore);
      snap.errors = errors;
      snap.warnings = warnings;
      const name = page.replace(/\.html/, '').replace(/[^\w-]+/g, '_');
      await writeFile(join(outDir, `${name}@${width}.json`), JSON.stringify(snap));
      console.log(`${page}@${width}: texts ${snap.texts.length}, attrs ${snap.attrs.length}, boxes ${snap.boxes.length}, overflow ${snap.overflow}px${errors.length ? `, errors ${JSON.stringify(errors)}` : ''}${warnings.length ? `, warnings ${warnings.length}` : ''}`);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
