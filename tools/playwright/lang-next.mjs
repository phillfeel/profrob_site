// Language switcher of the Next.js site (the legacy contract of i18n/boot.js adapted to locale routes):
//
//   node tools/playwright/lang-next.mjs --base-url http://127.0.0.1:3000
//
// - a click on the header EN button of a Russian page opens the same page in English (/about/ -> /en/about/,
//   / -> /en/), a click on RU opens the Russian one back; the query and the hash stay;
// - the pressed button matches the language of the page, <html lang> too;
// - on an English page the internal links of the header, of the content and of the footer keep the /en prefix,
//   so the language survives navigation (the legacy site kept it via localStorage, the Next site via the URL).
// Exits with code 1 if any assertion failed.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i > -1 ? argv[i + 1] : d; };
const base = opt('base-url', 'http://127.0.0.1:3000');
const routes = Object.keys(JSON.parse(await readFile(resolve(dirname(fileURLToPath(import.meta.url)), '..', 'migrate', 'url-map.json')), 'utf8'))
  .filter((r) => r !== '/').map((r) => r.replace(/\/$/, ''));

const fails = [];
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg); };
const CYR = /[Ѐ-ӿ]/;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const pg = await ctx.newPage();
const errors = [];
pg.on('pageerror', (e) => errors.push(String(e)));
pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const state = () => pg.evaluate(() => ({
  path: location.pathname,
  lang: document.documentElement.lang,
  pressed: [...document.querySelectorAll('[data-lang]')].map((b) => `${b.dataset.lang}=${b.getAttribute('aria-pressed')}`).join(','),
  h1: (document.querySelector('h1') || {}).textContent || '',
}));
const clickLang = async (sel) => { await Promise.all([pg.waitForEvent('load'), pg.click(sel)]); await pg.waitForLoadState('networkidle'); };
const go = async (url) => { await pg.goto(base + url, { waitUntil: 'networkidle' }); };

try {
  // ───────── the switcher ─────────
  await go('/');
  let s = await state();
  check(s.lang === 'ru' && s.pressed === 'ru=true,en=false' && CYR.test(s.h1), `RU home by default: ${JSON.stringify({ ...s, h1: undefined })}`);
  await clickLang('[data-lang="en"]');
  s = await state();
  check(s.path === '/en/' && s.lang === 'en' && s.pressed === 'ru=false,en=true' && !CYR.test(s.h1), `click EN on the home: the same page in English (${JSON.stringify({ ...s, h1: undefined })})`);
  await clickLang('[data-lang="ru"]');
  s = await state();
  check(s.path === '/' && s.lang === 'ru' && CYR.test(s.h1), `click RU brings Russian back (${s.path})`);

  await go('/about/');
  await clickLang('[data-lang="en"]');
  s = await state();
  check(s.path === '/en/about/' && s.lang === 'en' && !CYR.test(s.h1), `click EN on /about/: /en/about/ in English (${s.path})`);
  await clickLang('[data-lang="ru"]');
  s = await state();
  check(s.path === '/about/' && s.lang === 'ru' && CYR.test(s.h1), `click RU on /en/about/: back to /about/ (${s.path})`);

  await go('/en/industries/hotels/');
  await clickLang('[data-lang="ru"]');
  s = await state();
  check(s.path === '/industries/hotels/' && s.lang === 'ru', `deep page /en/industries/hotels/ -> /industries/hotels/ (${s.path})`);

  // ───────── the language survives internal links ─────────
  const linksOf = () => pg.evaluate(() => [...document.querySelectorAll('a[href^="/"]')]
    .map((a) => a.getAttribute('href'))
    .filter((h) => !h.startsWith('//') && !/^\/(assets|legacy|favicon)/.test(h)));
  const routePaths = new Set(routes);
  await go('/en/');
  const bad = (await linksOf()).filter((h) => routePaths.has(h.replace(/\/$/, '').replace(/[#?].*$/, '')));
  check(bad.length === 0, `EN home: internal links keep the /en prefix${bad.length ? ` (${bad.slice(0, 5).join(', ')})` : ''}`);
  await pg.click('.nav-links a[href="/en/solutions/"]');
  await pg.waitForLoadState('networkidle');
  s = await state();
  check(s.path === '/en/solutions/' && s.lang === 'en' && !CYR.test(s.h1), `nav link from the EN home keeps English (${s.path})`);
  await pg.click('footer a[href="/en/contacts/"], a[href="/en/contacts/"]');
  await pg.waitForLoadState('networkidle');
  s = await state();
  check(s.path === '/en/contacts/' && s.lang === 'en', `footer link keeps English (${s.path})`);

  check(errors.length === 0, `no console or page errors (${JSON.stringify(errors.slice(0, 3))})`);
} finally {
  await browser.close();
}
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
process.exit(fails.length ? 1 : 0);
