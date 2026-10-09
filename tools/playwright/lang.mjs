// Checks of the language switcher and of the English version (see i18n/README.md).
//
//   node tools/playwright/lang.mjs                    # i18n/en.json
//   node tools/playwright/lang.mjs --dict file.json   # another dictionary: a draft or a pseudo-locale
//
// Switching (header button, localStorage, ?lang=):
// - Russian: no request for i18n.js or en.json, English is not chosen unless asked, the button says which language is on;
// - a click on EN reloads the page in English, the choice follows to other pages; a click on RU brings Russian back and
//   removes ?lang= from the address (other parameters and the hash stay);
// - ?lang=en works for the visit when localStorage is blocked;
// - the dictionary fails (HTTP 500, broken JSON, aborted, slower than 3 s): the page is visible, in Russian, with a console warning;
// - a key missing in the dictionary keeps the Russian text of the markup.
// English scripts: the calculators, form messages, mini calculators and the readiness checklist show no Cyrillic, no errors, no warnings.
// Exits with code 1 if any assertion failed.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize, dirname, resolve } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const dictFile = argv.includes('--dict') ? resolve(argv[argv.indexOf('--dict') + 1]) : join(root, 'i18n', 'en.json');
const dict = await readFile(dictFile, 'utf8');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    res.writeHead(200, { 'content-type': MIME[extname(rel)] ?? 'application/octet-stream' }).end(await readFile(join(root, rel)));
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const fails = [];
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg); };
const CYR = /[Ѐ-ӿ]/;

const browser = await chromium.launch();
/** A context with the dictionary served from `serveDict`; `lang` is the language chosen before the visit (null: no choice). */
const open = async ({ lang = null, serveDict = (r) => r.fulfill({ contentType: 'application/json', body: dict }), width = 1440, storage = true } = {}) => {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  await ctx.route('https://api.web3forms.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' })); // tests must never send real e-mail
  await ctx.clock.setFixedTime(new Date('2026-06-15T09:30:00+03:00'));
  if (!storage) await ctx.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }));
  else if (lang) await ctx.addInitScript((l) => { if (!sessionStorage.getItem('__seeded')) { sessionStorage.setItem('__seeded', '1'); localStorage.setItem('lang', l); } }, lang);
  await ctx.route('**/i18n/en.json', serveDict);
  const pg = await ctx.newPage();
  const log = { errors: [], warnings: [], requests: [] };
  pg.on('pageerror', (e) => log.errors.push(String(e)));
  pg.on('console', (m) => { if (m.type() === 'error') log.errors.push(m.text()); else if (m.type() === 'warning') log.warnings.push(m.text()); });
  pg.on('request', (r) => log.requests.push(new URL(r.url()).pathname));
  return { ctx, pg, log };
};
const ready = (pg) => pg.evaluate(() => (window.i18n ? window.i18n.ready : null));
const go = async (pg, url, wait = 'networkidle') => { await pg.goto(base + url, { waitUntil: wait }); await ready(pg); };
const state = (pg) => pg.evaluate(() => ({
  lang: document.documentElement.lang,
  stored: (() => { try { return localStorage.getItem('lang'); } catch { return 'blocked'; } })(),
  url: location.href.replace(/^http:\/\/[^/]+\//, ''),
  waiting: document.documentElement.classList.contains('i18n-wait'),
  pressed: [...document.querySelectorAll('[data-lang]')].map((b) => `${b.dataset.lang}=${b.getAttribute('aria-pressed')}`).join(','),
  h1: (document.querySelector('h1') || {}).textContent || '',
}));
/** Cyrillic words left in the page: text nodes and text-bearing attributes. */
const cyrillic = (pg) => pg.evaluate(() => {
  const found = new Set();
  const re = /[Ѐ-ӿ]+/g;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (!n.parentElement.closest('script, style, template')) for (const m of n.nodeValue.matchAll(re)) found.add(m[0]);
  for (const el of document.querySelectorAll('[alt],[title],[aria-label],[placeholder],[aria-valuetext],[data-name],[data-cat],[data-res]')) {
    for (const a of ['alt', 'title', 'aria-label', 'placeholder', 'aria-valuetext', 'data-name', 'data-cat', 'data-res']) for (const m of (el.getAttribute(a) || '').matchAll(re)) found.add(m[0]);
  }
  return [...found];
});
const waitReload = async (pg, click) => { await Promise.all([pg.waitForEvent('load'), click()]); await pg.waitForLoadState('networkidle'); await ready(pg); };

try {
  // ───────── switching ─────────
  {
    const { ctx, pg, log } = await open();
    await go(pg, 'index.html');
    check(!log.requests.some((u) => /i18n/.test(u)), `RU: no request for i18n.js or en.json (${log.requests.filter((u) => /i18n/.test(u)).join(', ') || 'none'})`);
    let s = await state(pg);
    check(s.lang === 'ru' && s.pressed === 'ru=true,en=false' && !s.waiting && s.stored === null, `RU by default: ${JSON.stringify({ ...s, h1: undefined })}`);
    await waitReload(pg, () => pg.click('[data-lang="en"]'));
    s = await state(pg);
    check(s.lang === 'en' && s.stored === 'en' && s.pressed === 'ru=false,en=true' && !s.waiting && !CYR.test(s.h1), `click EN: English, saved, button pressed: ${JSON.stringify(s)}`);
    check(log.requests.includes('/i18n.js') && log.requests.includes('/i18n/en.json'), 'EN: i18n.js and en.json were requested');
    await go(pg, 'solutions.html');
    s = await state(pg);
    check(s.lang === 'en' && !CYR.test(s.h1), 'the choice follows to another page');
    await waitReload(pg, () => pg.click('[data-lang="ru"]'));
    s = await state(pg);
    check(s.lang === 'ru' && s.stored === 'ru' && CYR.test(s.h1) && s.pressed === 'ru=true,en=false', `click RU: Russian again: ${JSON.stringify(s)}`);
    check(log.errors.length === 0, `no errors while switching (${JSON.stringify(log.errors)})`);
    await ctx.close();
  }
  {
    const { ctx, pg } = await open();
    await go(pg, 'solutions.html?x=1&lang=en#faq');
    let s = await state(pg);
    check(s.lang === 'en' && s.stored === 'en', `?lang=en gives English and is remembered: ${JSON.stringify({ ...s, h1: undefined })}`);
    await waitReload(pg, () => pg.click('[data-lang="ru"]'));
    s = await state(pg);
    check(s.lang === 'ru' && !/lang=/.test(s.url) && /x=1/.test(s.url) && /#faq/.test(s.url), `back to RU: ?lang= removed, x=1 and #faq kept (${s.url})`);
    await ctx.close();
  }
  {
    const { ctx, pg } = await open({ storage: false });
    await go(pg, 'index.html?lang=en');
    check((await state(pg)).lang === 'en', 'localStorage blocked: ?lang=en still gives English');
    await waitReload(pg, () => pg.click('[data-lang="ru"]'));
    check((await state(pg)).lang === 'ru', 'localStorage blocked: the switch back to RU works');
    await go(pg, 'roi.html?k=floor&lang=en');
    await pg.waitForTimeout(600); // the calculator rewrites the address bar after 300 ms
    const s = await state(pg);
    check(s.lang === 'en' && /lang=en/.test(s.url) && /k=floor/.test(s.url), `localStorage blocked: the calculator keeps ?lang=en in the address (${s.url})`);
    await ctx.close();
  }
  for (const [name, serveDict] of [['HTTP 500', (r) => r.fulfill({ status: 500, body: 'x' })], ['broken JSON', (r) => r.fulfill({ contentType: 'application/json', body: '{oops' })], ['aborted', (r) => r.abort()]]) {
    const { ctx, pg, log } = await open({ lang: 'en', serveDict });
    await go(pg, 'index.html');
    const s = await state(pg);
    check(s.lang === 'ru' && !s.waiting && CYR.test(s.h1) && log.warnings.some((w) => /^i18n:/.test(w)), `dictionary ${name}: visible, Russian, warning «${(log.warnings.find((w) => /^i18n:/.test(w)) || '').slice(0, 70)}»`);
    await ctx.close();
  }
  {
    const { ctx, pg } = await open({ lang: 'en', serveDict: async (r) => { await new Promise((res) => setTimeout(res, 6000)); r.fulfill({ contentType: 'application/json', body: dict }).catch(() => {}); } });
    const t0 = Date.now();
    await pg.goto(base + 'index.html', { waitUntil: 'domcontentloaded' });
    await ready(pg);
    const dt = Date.now() - t0, s = await state(pg);
    check(dt < 4500 && !s.waiting && s.lang === 'ru' && CYR.test(s.h1), `dictionary slower than 3 s: the page is visible after ${dt} ms, in Russian`);
    await ctx.close();
  }
  {
    const half = JSON.stringify({ common: { nav: { solutions: 'Solutions' } } });
    const { ctx, pg, log } = await open({ lang: 'en', serveDict: (r) => r.fulfill({ contentType: 'application/json', body: half }) });
    await go(pg, 'index.html');
    const nav = await pg.evaluate(() => [...document.querySelectorAll('.nav-links a')].map((a) => a.textContent.trim()).slice(0, 2).join('|'));
    check(/^Solutions\|[А-Я]/.test(nav) && log.warnings.some((w) => /not in en\.json/.test(w)), `key missing in the dictionary: Russian text stays («${nav}»), one warning`);
    await ctx.close();
  }

  // ───────── English scripts ─────────
  const sweep = async (label, pg, log) => {
    const left = await cyrillic(pg);
    check(!left.length, `${label}: no Cyrillic${left.length ? ` (${left.slice(0, 6).join(', ')})` : ''}`);
  };
  {
    const { ctx, pg, log } = await open({ lang: 'en' });
    const q = (o) => `roi.html?${new URLSearchParams(o)}`;
    const urls = [
      q({ k: 'facade', ga: 30000, n: 2, p: 60, fw: 125000, g: 'flat', f: 'buy' }), q({ k: 'facade', ga: 100000, n: 6, p: 150, fw: 200000, g: 'flat', f: 'lease' }),
      q({ k: 'facade', ga: 30000, n: 2, p: 60, fw: 125000, g: 'frames', f: 'buy' }), q({ k: 'facade', ga: 2000, n: 1, p: 30, fw: 80000, g: 'flat', f: 'buy' }),
      q({ k: 'floor', t: 'office', a: 3500, m: 'one', w: 67000, c: 'own', f: 'buy' }), q({ k: 'floor', t: 'mall', a: 50000, m: 'two', w: 100000, c: 'contractor', f: 'lease' }),
      q({ k: 'floor', t: 'warehouse', a: 100000, m: 'h24', w: 55000, c: 'own', f: 'buy', s: 9 }), q({ k: 'floor', t: 'hotel', a: 12000, m: 'one', w: 67000, c: 'own', f: 'lease' }),
    ];
    for (const u of urls) { await go(pg, u, 'load'); await pg.waitForTimeout(120); await sweep(u, pg, log); }
    await go(pg, 'roi.html?k=floor', 'load');
    for (const sel of ['[data-name="type"] [data-v="warehouse"]', '[data-name="mode"] [data-v="h24"]', '[data-name="fin"] [data-v="lease"]', '[data-name="who"] [data-v="contractor"]', '[data-name="calc"] [data-v="facade"]', '[data-name="glass"] [data-v="frames"]', '[data-name="washes"] [data-v="5"]']) {
      await pg.click(sel); await pg.waitForTimeout(80);
    }
    await sweep('roi.html after clicks on every control', pg, log);
    check(log.errors.length === 0 && log.warnings.length === 0, `roi.html (EN): no errors, no warnings (${JSON.stringify([...log.errors, ...log.warnings].slice(0, 3))})`);
    await ctx.close();
  }
  for (const page of ['solutions.html', 'industries-hotels.html']) {
    const { ctx, pg, log } = await open({ lang: 'en' });
    await go(pg, page);
    await pg.click('#lead-form button[type=submit]'); await pg.waitForTimeout(100);
    await sweep(`${page}: empty form`, pg, log);
    await pg.fill('#f-name', 'Anna'); await pg.fill('#f-phone', '+7 (495) 123-45-6'); await pg.check('#f-consent');
    await pg.click('#lead-form button[type=submit]'); await pg.waitForTimeout(100);
    await sweep(`${page}: bad phone`, pg, log);
    await pg.fill('#f-phone', '+7 (495) 123-45-67'); await ctx.setOffline(true);
    await pg.click('#lead-form button[type=submit]'); await pg.waitForTimeout(100);
    await sweep(`${page}: offline`, pg, log);
    await ctx.setOffline(false);
    await pg.evaluate(() => { document.querySelector('#lead-form').dataset.endpoint = '/nowhere'; });
    await ctx.route('**/nowhere', (r) => r.abort());
    await pg.click('#lead-form button[type=submit]'); await pg.waitForTimeout(300);
    await sweep(`${page}: send failed`, pg, log);
    check(log.errors.filter((e) => !/Failed to load resource|ERR_/.test(e)).length === 0, `${page} (EN): no script errors (${JSON.stringify(log.errors.slice(0, 2))})`);
    await ctx.close();
  }
  for (const page of ['industries-hotels.html', 'industries-retail.html', 'industries-business-centers.html']) {
    const { ctx, pg, log } = await open({ lang: 'en' });
    await go(pg, page);
    await pg.waitForTimeout(150);
    await sweep(`${page}: mini calculator at start`, pg, log);
    for (const area of [3500, 12000, 50000]) {
      await pg.evaluate((a) => { const r = document.querySelector('#calc-area'); r.value = a; r.dispatchEvent(new Event('input', { bubbles: true })); }, area);
      await sweep(`${page}: area ${area}`, pg, log);
    }
    for (const name of ['calc-type', 'calc-mode']) {
      for (const v of await pg.$$eval(`input[name="${name}"]`, (rs) => rs.map((r) => r.value))) {
        await pg.evaluate(([n, x]) => { const r = document.querySelector(`input[name="${n}"][value="${x}"]`); if (!r || r.disabled) return; r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }, [name, v]);
        await sweep(`${page}: ${name}=${v}`, pg, log);
      }
    }
    if (page === 'industries-business-centers.html') {
      const boxes = await pg.$$('[data-ready] input[type=checkbox]');
      for (let i = 0; i < boxes.length; i++) { await boxes[i].check(); await sweep(`${page}: checklist ${i + 1}/${boxes.length}`, pg, log); }
      const verdict = await pg.evaluate(() => document.querySelector('[data-ready-verdict]').textContent);
      check(/^[A-Z]/.test(verdict.trim()), `${page}: the verdict starts with a capital («${verdict.trim().slice(0, 50)}»)`);
    }
    check(log.errors.length === 0 && log.warnings.length === 0, `${page} (EN): no errors, no warnings (${JSON.stringify([...log.errors, ...log.warnings].slice(0, 3))})`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
process.exit(fails.length ? 1 : 0);
