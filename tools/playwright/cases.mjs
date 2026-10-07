// Interaction checks for the Case studies page (cases.html) and the links that lead to it.
//
//   node tools/playwright/cases.mjs
//
// - no console/page errors and no horizontal overflow at 1440 and 390, in Russian and English;
// - the results card and «How it was calculated» links land on existing blocks;
// - the industry filter: chips, ?industry= from the industry pages, the empty state for industries without a case study;
// - «I want the same» preselects the industry in the form;
// - header, home cards, services «See also» and industry pages lead to cases.html; no links to the old /cases/ paths.
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
const CASES = ['business-center', 'agro', 'warehouse', 'manufacturing', 'construction'];
const visible = (pg) => pg.locator('.cs').evaluateAll((els) => els.filter((e) => !e.hidden).map((e) => e.id));

const browser = await chromium.launch();
try {
  for (const lang of ['ru', 'en']) {
    for (const width of [1440, 390]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await pg.goto(`${origin}cases.html?lang=${lang}`);
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
    await pg.goto(`${origin}cases.html?lang=ru`);
    await pg.close();
  }

  // Anchors: results card, «How it was calculated»
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}cases.html`);
    check(JSON.stringify(await visible(pg)) === JSON.stringify(CASES), 'all five case studies visible without a filter');
    const hrefs = await pg.locator('.cs-sum a, .cs__how').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
    for (const h of hrefs) check((await pg.locator(h).count()) === 1, `link ${h} points at an existing block`);
    await pg.locator('#manufacturing .cs__how').click();
    await pg.waitForTimeout(400);
    check(await pg.locator('#method-staff').evaluate((el) => el.matches(':target')), '«How it was calculated» on the CNC case opens the staff formula');
    await pg.close();
  }

  // Filter
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}cases.html`);
    await pg.locator('.cs-chip[data-filter="manufacturing"]').click();
    check(JSON.stringify(await visible(pg)) === '["warehouse","manufacturing"]', 'chip «manufacturing» shows the warehouse and CNC cases');
    check(new URL(pg.url()).searchParams.get('industry') === 'manufacturing', 'chip writes ?industry=manufacturing to the address');
    check((await pg.locator('.cs-chip[aria-current="true"]').getAttribute('data-filter')) === 'manufacturing', 'chip marked as current');
    await pg.locator('.cs-chip[data-filter=""]').click();
    check((await visible(pg)).length === 5 && !new URL(pg.url()).searchParams.has('industry'), 'chip «All» shows all and clears the parameter');

    await pg.goto(`${origin}cases.html?industry=construction`);
    check(JSON.stringify(await visible(pg)) === '["construction"]', '?industry=construction shows one case');

    await pg.goto(`${origin}cases.html?industry=hotels`);
    const emptyShown = await pg.locator('.cs-empty').isVisible();
    const ind = await pg.locator('.cs-empty [data-ind]:not([hidden])').evaluateAll((els) => els.map((e) => e.getAttribute('href') || e.textContent.trim()));
    check(emptyShown && (await visible(pg)).length === 0, '?industry=hotels: empty state, no cards');
    check(JSON.stringify(ind) === '["Отели и HoReCa","industries-hotels.html"]', `empty state names the industry and links to its page ${JSON.stringify(ind)}`);
    check((await pg.locator('.cs-chip[aria-current]').count()) === 0, 'no chip is current in the empty state');
    await pg.locator('.cs-empty a[data-filter=""]').click();
    check((await visible(pg)).length === 5 && !(await pg.locator('.cs-empty').isVisible()), '«Show all» from the empty state brings back all cases');

    await pg.goto(`${origin}cases.html?industry=unknown`);
    check((await visible(pg)).length === 5 && !(await pg.locator('.cs-empty').isVisible()), 'unknown industry: all cases, no empty state');
    await pg.close();
  }

  // «I want the same» → form
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}cases.html`);
    await pg.locator('#warehouse .cs__same').click();
    check((await pg.locator('#f-dir').inputValue()) === 'logistics', 'warehouse «I want the same» preselects logistics');
    await pg.close();
  }

  // Links that lead here
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    for (const page of ['index.html', 'solutions.html', 'products.html', 'roi.html', 'services.html', 'industries-retail.html']) {
      await pg.goto(`${origin}${page}`);
      await pg.locator('.nav-links a', { hasText: 'Кейсы' }).click();
      await pg.waitForLoadState();
      check(new URL(pg.url()).pathname === '/cases.html', `${page}: header «Кейсы» opens cases.html`);
    }
    await pg.goto(`${origin}index.html`);
    const more = await pg.locator('#cases a.more').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    check(JSON.stringify(more) === JSON.stringify(CASES.map((c) => `cases.html#${c}`)), `home «View case study» links ${JSON.stringify(more)}`);
    check((await pg.locator('#cases .cases-foot a').getAttribute('href')) === 'cases.html', 'home «All case studies» → cases.html');
    await pg.goto(`${origin}services.html`);
    await pg.locator('.see-card', { hasText: 'Кейсы' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/cases.html', 'services.html: «See also → Case studies» opens cases.html');

    const stale = [];
    const pages = ['index.html', 'solutions.html', 'products.html', 'roi.html', 'services.html', 'industries-agriculture.html', 'industries-business-centers.html',
      'industries-construction.html', 'industries-education.html', 'industries-fitness-sports.html', 'industries-hotels.html', 'industries-manufacturing.html',
      'industries-medical-wellness.html', 'industries-municipal.html', 'industries-public-spaces.html', 'industries-retail.html'];
    for (const page of pages) {
      await pg.goto(`${origin}${page}`);
      stale.push(...(await pg.locator('a[href^="/cases"], a[href="index.html#cases"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).map((h) => `${page}: ${h}`));
      // Every industry link must end either in cards or in the empty state with this industry
      for (const h of await pg.locator('a[href^="cases.html?industry="]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))])) {
        const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        await p2.goto(`${origin}${h}`);
        const cards = (await visible(p2)).length, empty = await p2.locator('.cs-empty [data-ind]:not([hidden])').count();
        check((cards > 0 && cards < 5) || (cards === 0 && empty === 2), `${page}: ${h} → ${cards ? `${cards} case(s)` : 'empty state'}`);
        await p2.close();
      }
    }
    check(!stale.length, `no links to /cases/… or index.html#cases ${stale.length ? JSON.stringify(stale) : ''}`);
    await pg.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
