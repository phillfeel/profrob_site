// Calculator output parity, legacy against the Next site, in both languages, initially and after the sliders move.
//
//   node tools/playwright/calc-parity.mjs --legacy ../legacy-baseline-2 --base-url http://127.0.0.1:3000
//
// For every page that has a calculator: load it in ru and en, record the outputs (output, [data-out], #out-*, #r-*, aria-valuetext),
// move every range input to 25 % and 75 % of its span (input event), record again, and compare with the same steps on the legacy page.
// Also: after the scripts have run no English page may show a Cyrillic word (privacy/consent excepted) or raw ICU ("{n", "plural,"),
// on any of the 29 pages. Exit code 1 on any difference.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i > -1 ? argv[i + 1] : d; };
const legacyRoot = resolve(opt('legacy', '../legacy-baseline-2'));
const baseUrl = opt('base-url', 'http://127.0.0.1:3000');
const routeMap = JSON.parse(await readFile(resolve(opt('map', 'tools/migrate/url-map.json')), 'utf8'));
const CALC_PAGES = ['roi.html', 'products.html', 'industries-business-centers.html', 'industries-hotels.html', 'industries-retail.html'];

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    res.writeHead(200, { 'content-type': MIME[extname(rel)] ?? 'application/octet-stream' }).end(await readFile(join(legacyRoot, rel)));
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const legacyBase = `http://127.0.0.1:${server.address().port}`;

// Runs inside the page.
const outputs = () => [...document.querySelectorAll('output, [data-out], [id^="out-"], [id^="r-"], [aria-valuetext]')]
  .map((e) => `${e.id || e.getAttribute('data-out') || e.tagName}=${e.textContent.replace(/\s+/g, ' ').trim()}|${e.getAttribute('aria-valuetext') ?? ''}`);
const move = (frac) => {
  for (const r of document.querySelectorAll('input[type="range"]')) {
    const min = Number(r.min || 0), max = Number(r.max || 100), step = Number(r.step || 1);
    r.value = String(Math.round((min + (max - min) * frac) / step) * step);
    r.dispatchEvent(new Event('input', { bubbles: true }));
  }
};

const browser = await chromium.launch();
let bad = 0;
const report = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) bad++; };
try {
  for (const lang of ['ru', 'en']) {
    const ctxL = await browser.newContext({ reducedMotion: 'reduce' });
    await ctxL.addInitScript((l) => { try { localStorage.setItem('lang', l); } catch { /* private mode */ } }, lang);
    const ctxN = await browser.newContext({ reducedMotion: 'reduce' });
    for (const [file, route] of Object.entries(routeMap)) {
      const url = new URL(lang === 'en' ? `/en${route}` : route, baseUrl).toString();
      const page = await ctxN.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(url, { waitUntil: 'load' });
      await page.evaluate(() => (window.i18n ? window.i18n.ready : null));
      await page.waitForTimeout(700);
      const body = await page.evaluate(() => document.body.innerText + '\n' + [...document.querySelectorAll('[aria-valuetext],[placeholder],[alt],[aria-label]')].map((e) => ['aria-valuetext', 'placeholder', 'alt', 'aria-label'].map((a) => e.getAttribute(a) ?? '').join(' ')).join('\n'));
      const raw = body.match(/\{[a-z]+[,}]|plural,/g);
      report(!raw, `${lang} ${route} no raw ICU after scripts${raw ? `: ${raw.slice(0, 3)}` : ''}`);
      if (lang === 'en' && !/^\/(privacy|consent)\//.test(route)) {
        const cyr = body.match(/[Ѐ-ӿ]+/g);
        report(!cyr, `${lang} ${route} no Cyrillic after scripts${cyr ? `: ${cyr.slice(0, 5)}` : ''}`);
      }
      if (errors.length) report(false, `${lang} ${route} page errors ${JSON.stringify(errors)}`);
      if (CALC_PAGES.includes(file)) {
        const lp = await ctxL.newPage();
        await lp.goto(`${legacyBase}/${file}`, { waitUntil: 'load' });
        await lp.evaluate(() => (window.i18n ? window.i18n.ready : null));
        await lp.waitForTimeout(700);
        for (const [label, frac] of [['initial', null], ['25%', 0.25], ['75%', 0.75]]) {
          if (frac !== null) { await lp.evaluate(move, frac); await page.evaluate(move, frac); await lp.waitForTimeout(150); await page.waitForTimeout(150); }
          const want = await lp.evaluate(outputs), got = await page.evaluate(outputs);
          const diff = want.map((w, i) => (w === got[i] ? null : `legacy ${w} / next ${got[i]}`)).filter(Boolean);
          report(want.length > 0 && want.length === got.length && !diff.length, `${lang} ${route} calculator ${label} (${want.length} outputs)${diff.length ? `: ${diff.slice(0, 4).join(' ; ')}` : ''}`);
        }
        await lp.close();
      }
      await page.close();
    }
    await ctxL.close(); await ctxN.close();
  }
} finally { await browser.close(); server.close(); }
console.log(bad ? `${bad} checks failed` : 'all checks passed');
process.exit(bad ? 1 : 0);
