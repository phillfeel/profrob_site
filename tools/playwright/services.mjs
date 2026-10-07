// Interaction checks for the Services page (services.html) and the links that lead to it.
//
//   node tools/playwright/services.mjs
//
// - no console/page errors and no horizontal overflow at 1440 and 390, in Russian and English;
// - every link of the project route lands on an existing block, every service has its anchor;
// - CTA buttons preselect the service in the form;
// - home footer, products «See also» and industry service links lead to services.html and existing blocks.
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
const SERVICES = ['audit', 'selection', 'roi', 'pilot', 'design', 'supply', 'integration', 'training', 'maintenance', 'sla', 'monitoring', 'consulting'];

const browser = await chromium.launch();
try {
  for (const lang of ['ru', 'en']) {
    for (const width of [1440, 390]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await pg.goto(`${origin}services.html?lang=${lang}`);
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
    await pg.goto(`${origin}services.html?lang=ru`);
    await pg.close();
  }

  // Anchors and the project route
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}services.html`);
    for (const id of SERVICES) check((await pg.locator(`#${id}`).count()) === 1, `service block #${id} exists`);
    const opts = await pg.locator('#f-dir option').evaluateAll((os) => os.map((o) => o.value).filter(Boolean));
    check(JSON.stringify(opts) === JSON.stringify(SERVICES), `form list has the 12 services in route order`);
    const hrefs = await pg.locator('.route a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    check(hrefs.length === 15, `route has 3 stage links and 12 service links (${hrefs.length})`);
    for (const h of hrefs) check((await pg.locator(h).count()) === 1, `route link ${h} points at an existing block`);
    await pg.locator('.route a[href="#monitoring"]').click();
    await pg.waitForTimeout(600);
    const top = await pg.locator('#monitoring').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    check(top >= 0 && top < 400, `route scrolls to #monitoring (top ${top}px)`);
    await pg.close();
  }

  // CTA → form
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}services.html`);
    await pg.locator('.sol-hero a[data-pick="audit"]').click();
    check((await pg.locator('#f-dir').inputValue()) === 'audit', 'hero CTA preselects «audit» in the form');
    await pg.locator('#pilot a[data-pick]').click();
    check((await pg.locator('#f-dir').inputValue()) === 'pilot', 'pilot card link preselects «pilot»');
    await pg.close();
  }

  // Header link from every kind of page; the header row stays on one line at the narrowest desktop width
  for (const page of ['index.html', 'solutions.html', 'products.html', 'roi.html', 'industries-retail.html']) {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}${page}`);
    await pg.locator('.nav-links a', { hasText: 'Услуги' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/services.html', `${page}: header «Услуги» opens services.html`);
    await pg.close();
  }
  for (const lang of ['ru', 'en']) {
    const pg = await browser.newPage({ viewport: { width: 1024, height: 700 } });
    await pg.goto(`${origin}services.html?lang=${lang}`);
    await pg.waitForTimeout(400);
    const rows = await pg.locator('.nav-links a').evaluateAll((as) => as.map((a) => [a.textContent.trim(), Math.round(a.getBoundingClientRect().height)]));
    const tall = rows.filter(([, h]) => h > 24);
    check(!tall.length && rows.length === 7, `${lang} @1024: 7 header links on one line ${tall.length ? JSON.stringify(tall) : ''}`);
    check((await pg.locator('.nav-links a[aria-current="page"]').getAttribute('href')) === 'services.html', `${lang}: «Услуги» marked as the current page`);
    await pg.close();
  }
  {
    const pg = await browser.newPage();
    await pg.goto(`${origin}services.html?lang=ru`);
    await pg.close();
  }

  // Links that lead here
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}index.html`);
    await pg.locator('.foot-col a', { hasText: 'Услуги' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/services.html', 'index.html: footer «Услуги» opens services.html');
    await pg.goto(`${origin}products.html`);
    await pg.locator('.see-card', { hasText: 'Услуги' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/services.html', 'products.html: «Смотрите также → Услуги» opens services.html');
    for (const page of ['industries-business-centers.html', 'industries-agriculture.html', 'industries-medical-wellness.html', 'industries-municipal.html']) {
      await pg.goto(`${origin}${page}`);
      const links = await pg.locator('a[href^="services.html#"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
      check(links.length > 0, `${page}: has service links`);
      for (const h of links) {
        await pg.goto(`${origin}${h}`);
        check((await pg.locator(h.slice(h.indexOf('#'))).count()) === 1, `${page}: ${h} points at an existing block`);
      }
    }
    const stale = [];
    for (const page of ['index.html', 'products.html', 'solutions.html', 'industries-retail.html', 'industries-education.html', 'industries-fitness-sports.html', 'industries-construction.html', 'industries-public-spaces.html']) {
      await pg.goto(`${origin}${page}`);
      stale.push(...(await pg.locator('a[href^="/services/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).map((h) => `${page}: ${h}`));
    }
    check(!stale.length, `no links to the old /services/… paths ${stale.length ? JSON.stringify(stale) : ''}`);
    await pg.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
