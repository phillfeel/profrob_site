// Interaction checks for the Manufacturers page (manufacturers.html) and the links that lead to it.
//
//   node tools/playwright/manufacturers.mjs
//
// - no console/page errors and no horizontal overflow at 1440 and 390, in Russian and English;
// - 40 brands in 5 groups; every group has as many dots in the hero map as logos below; every logo file loads;
// - hero map links land on the groups; the form list has the five groups in catalog order;
// - the home logo bar («И другие») and the home footer lead here; the header stays on one line at 1024.
// Exits with code 1 if any assertion failed.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize, dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    res.writeHead(200, { 'content-type': MIME[extname(rel)] ?? 'application/octet-stream' }).end(await readFile(join(root, rel)));
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}/`;

const fails = [];
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg); };
const GROUPS = ['service', 'construction', 'wellness', 'industry', 'agro'];
const COUNTS = { service: 7, construction: 9, wellness: 3, industry: 13, agro: 8 };

const browser = await chromium.launch();
try {
  for (const lang of ['ru', 'en']) {
    for (const width of [1440, 390]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await pg.goto(`${origin}manufacturers.html?lang=${lang}`);
      await pg.waitForTimeout(500);
      const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(!errors.length && overflow === 0, `${lang} @${width}: errors ${errors.length ? JSON.stringify(errors) : 'none'}, overflow ${overflow}px`);
      if (lang === 'en') {
        const cyr = await pg.evaluate(() => /[А-Яа-яЁё]/.test(document.querySelector('main').innerText));
        check(!cyr, `en @${width}: no Cyrillic left in main`);
      }
      await pg.close();
    }
  }
  // Reset the language the previous pages stored
  {
    const pg = await browser.newPage();
    await pg.goto(`${origin}manufacturers.html?lang=ru`);
    await pg.close();
  }

  // Catalog structure
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}manufacturers.html`);
    await pg.waitForTimeout(400);
    check((await pg.locator('.mf-grp').count()) === 5, 'catalog has 5 groups');
    const tiles = await pg.locator('.mf-tile:not(.mf-tile--more)').count();
    check(tiles === 40, `catalog has 40 brands (${tiles})`);
    check((await pg.locator('.mf-map__total b').innerText()) === '40', 'hero map total reads 40');
    for (const id of GROUPS) {
      const n = await pg.locator(`#grp-${id} .mf-tile:not(.mf-tile--more)`).count();
      const dots = await pg.locator(`.mf-map__row[href="#grp-${id}"] .mf-map__dots i`).count();
      const label = await pg.locator(`.mf-map__row[href="#grp-${id}"] .mf-map__n`).innerText();
      check(n === COUNTS[id] && dots === n && +label === n, `group ${id}: ${n} logos, ${dots} dots, label ${label}`);
    }
    // Every logo file loads (the page is served as static files; a typo in a name shows up here)
    await pg.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; }));
    await pg.waitForTimeout(800);
    const broken = await pg.locator('main img').evaluateAll((imgs) => imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')));
    check(!broken.length, `all logos load ${broken.length ? JSON.stringify(broken) : ''}`);
    // Logos without a file are plain wordmarks, not broken images
    const words = await pg.locator('.mf-word').allInnerTexts();
    check(words.length === 7, `7 brands shown as wordmarks (${words.join(', ')})`);
    const opts = await pg.locator('#f-dir option').evaluateAll((os) => os.map((o) => o.value).filter(Boolean));
    check(JSON.stringify(opts) === JSON.stringify(GROUPS), 'form list has the five groups in catalog order');
    // Key cards: nine, each with a logo, a country and a task
    check((await pg.locator('.mf-key').count()) === 9, '9 key brand cards');
    const bare = await pg.locator('.mf-key').evaluateAll((cs) => cs.filter((c) => !c.querySelector('img') || !c.querySelector('.mf-key__cn') || !c.querySelector('.mf-key__text')).length);
    check(bare === 0, 'every key card has logo, country and tasks');
    // Hero map link scrolls to the group
    await pg.locator('.mf-map__row[href="#grp-agro"]').click();
    await pg.waitForTimeout(700);
    const top = await pg.locator('#grp-agro').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    check(top >= 0 && top < 400, `hero map scrolls to #grp-agro (top ${top}px)`);
    await pg.close();
  }

  // Header: one line at 1024 in both languages, nothing is marked as current (the page is not in the menu)
  for (const lang of ['ru', 'en']) {
    const pg = await browser.newPage({ viewport: { width: 1024, height: 700 } });
    await pg.goto(`${origin}manufacturers.html?lang=${lang}`);
    await pg.waitForTimeout(400);
    const rows = await pg.locator('.nav-links a').evaluateAll((as) => as.map((a) => [a.textContent.trim(), Math.round(a.getBoundingClientRect().height)]));
    const tall = rows.filter(([, h]) => h > 24);
    check(!tall.length && rows.length === 7, `${lang} @1024: 7 header links on one line ${tall.length ? JSON.stringify(tall) : ''}`);
    await pg.close();
  }
  {
    const pg = await browser.newPage();
    await pg.goto(`${origin}manufacturers.html?lang=ru`);
    await pg.close();
  }

  // Links that lead here
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}index.html`);
    await pg.locator('.brands-more').click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/manufacturers.html', 'index.html: logo bar «И другие» opens manufacturers.html');
    await pg.goto(`${origin}index.html`);
    await pg.locator('.foot-col a', { hasText: 'Производители' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/manufacturers.html', 'index.html: footer «Производители» opens manufacturers.html');
    for (const href of ['solutions.html#directions', 'products.html#raas']) {
      await pg.goto(`${origin}manufacturers.html`);
      await pg.locator(`.see-card[href="${href}"]`).click();
      await pg.waitForLoadState();
      const anchor = href.split('#')[1];
      check((await pg.locator(`#${anchor}`).count()) === 1, `«See also» ${href} points at an existing block`);
    }
    await pg.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
