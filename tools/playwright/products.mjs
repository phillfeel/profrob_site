// Interaction checks for the Products page (products.html) and the links that lead to it.
//
//   node tools/playwright/products.mjs
//
// - no console/page errors and no horizontal overflow at 1440 and 390;
// - «Продукты» in the header of the home, solutions, ROI and an industry page opens products.html;
// - the buy-or-rent example recomputes: default break-even 31 months, a cheap rent removes it, sliders move the numbers;
// - CTA buttons preselect the product in the form; the contents list jumps to its block;
// - industry product links land on existing blocks of the page.
// Exits with code 1 if any assertion failed.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize, dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
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
const setRange = (pg, id, v) => pg.locator(id).evaluate((el, x) => { el.value = x; el.dispatchEvent(new Event('input', { bubbles: true })); }, v);
const text = (pg, sel) => pg.locator(sel).textContent().then((s) => s.replace(/\s+/g, ' ').trim());

const browser = await chromium.launch();
try {
  for (const width of [1440, 390]) {
    const pg = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await pg.goto(`${origin}products.html`);
    await pg.waitForTimeout(400);
    const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(!errors.length && overflow === 0, `@${width}: errors ${errors.length ? JSON.stringify(errors) : 'none'}, overflow ${overflow}px`);
    await pg.close();
  }

  // Header link from every kind of page (links are in the header at desktop width)
  for (const page of ['index.html', 'solutions.html', 'roi.html', 'industries-retail.html']) {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}${page}`);
    await pg.locator('.nav-links a', { hasText: 'Продукты' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/products.html', `${page}: header «Продукты» opens products.html`);
    await pg.close();
  }
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}index.html`);
    await pg.locator('.foot-col a', { hasText: 'Продукты' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/products.html', 'index.html: footer «Продукты» opens products.html');
    await pg.goto(`${origin}solutions.html`);
    await pg.locator('.see-card', { hasText: 'Продукты' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/products.html', 'solutions.html: «Смотрите также → Продукты» opens products.html');
    await pg.close();
  }

  // Buy-or-rent example
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}products.html`);
    await pg.waitForTimeout(300);
    check(/31/.test(await text(pg, '#out-verdict')), `default break-even is 31 months: «${await text(pg, '#out-verdict')}»`);
    check(/2,6/.test(await text(pg, '#out-buy')) && /1,2/.test(await text(pg, '#out-rentsum')), `12 months: buy ${await text(pg, '#out-buy')}, rent ${await text(pg, '#out-rentsum')}`);
    await setRange(pg, '#in-term', '48');
    check(/Покупка выгоднее/.test(await text(pg, '#out-verdict')), `48 months: buying wins: «${await text(pg, '#out-verdict')}»`);
    await setRange(pg, '#in-rent', '60');
    check(/на любом сроке/.test(await text(pg, '#out-verdict')), 'rent 60 k/month: rent cheaper for the whole horizon');
    check((await pg.locator('#raas-chart .cross').count()) === 0, 'no break-even marker when there is no break-even');
    await setRange(pg, '#in-rent', '250');
    await setRange(pg, '#in-price', '1.5');
    check(/Покупка выгоднее/.test(await text(pg, '#out-verdict')) || /Аренда дешевле/.test(await text(pg, '#out-verdict')), `extreme inputs still give a verdict: «${await text(pg, '#out-verdict')}»`);
    check((await pg.locator('#raas-chart path').count()) === 2, 'chart draws both lines');
    await pg.close();
  }

  // CTA → form
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}products.html`);
    await pg.locator('#raas .btns a[data-pick]').click();
    check((await pg.locator('#f-dir').inputValue()) === 'raas', 'rental CTA preselects «raas» in the form');
    await pg.locator('#retrofit a[data-pick]').click();
    check((await pg.locator('#f-dir').inputValue()) === 'retrofit', 'retrofit CTA preselects «retrofit»');
    await pg.locator('.cat__row[href="#fleet"]').click();
    await pg.waitForTimeout(500);
    const top = await pg.locator('#fleet').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    check(top >= 0 && top < 300, `contents list scrolls to #fleet (top ${top}px)`);
    await pg.close();
  }

  // Industry product links land on existing blocks
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    for (const page of ['industries-retail.html', 'industries-manufacturing.html', 'industries-hotels.html']) {
      await pg.goto(`${origin}${page}`);
      const hrefs = await pg.locator('a[href^="products.html#"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
      for (const h of hrefs) {
        await pg.goto(`${origin}${h}`);
        const ok = await pg.locator(h.slice(h.indexOf('#'))).count();
        check(ok === 1, `${page}: ${h} points at an existing block`);
      }
    }
    await pg.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
