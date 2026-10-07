// Interaction checks for the About page (about.html) and the links that lead to it.
//
//   node tools/playwright/about.mjs
//
// - no console/page errors and no horizontal overflow at 1440, 1024 and 390, in Russian and English;
// - the section counter total matches the number of sections; the form works without a direction list;
// - every internal link of the page lands on an existing file and, if it has an anchor, on an existing block;
// - the home footer link «О компании» opens about.html.
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

const browser = await chromium.launch();
try {
  for (const lang of ['ru', 'en']) {
    for (const width of [1440, 1024, 390]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await pg.goto(`${origin}about.html?lang=${lang}`);
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
    await pg.goto(`${origin}about.html?lang=ru`);
    await pg.close();
  }

  // Structure: one H1, counter total = number of sections, header row on one line at 1024
  {
    const pg = await browser.newPage({ viewport: { width: 1024, height: 700 } });
    await pg.goto(`${origin}about.html`);
    await pg.waitForTimeout(400);
    check((await pg.locator('h1').count()) === 1, 'one H1');
    const secs = await pg.locator('[data-sec]').count();
    const total = await pg.locator('.counter .tot').textContent();
    check(secs === +total, `section counter total ${total} = ${secs} sections`);
    const tall = await pg.locator('.nav-links a').evaluateAll((as) => as.filter((a) => a.getBoundingClientRect().height > 24).length);
    check(tall === 0, '@1024: header links stay on one line');
    await pg.close();
  }

  // Internal links: target file exists, anchor exists in it
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}about.html`);
    const hrefs = await pg.locator('a[href]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')).filter((h) => h && !/^(https?:|mailto:|tel:|#$)/.test(h)))]);
    for (const h of hrefs) {
      const url = h.startsWith('#') ? `about.html${h}` : h;
      await pg.goto('about:blank'); // a jump between anchors of one page is not a navigation
      const res = await pg.goto(`${origin}${url}`);
      const hash = url.includes('#') ? url.slice(url.indexOf('#')) : '';
      const ok = res.ok() && (!hash || (await pg.locator(hash).count()) === 1);
      check(ok, `link ${h} resolves`);
    }
    await pg.close();
  }

  // Form: validation, then success without a direction list
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    await pg.goto(`${origin}about.html`);
    await pg.locator('#lead-form button[type="submit"]').click();
    check((await pg.locator('#f-name-err').textContent()).length > 0, 'empty form shows the name error');
    await pg.fill('#f-name', 'Иван');
    await pg.fill('#f-phone', '9161234567');
    await pg.check('#f-consent');
    await pg.locator('#lead-form button[type="submit"]').click();
    await pg.waitForSelector('#lead-form.is-done', { timeout: 3000 }).catch(() => {});
    check((await pg.locator('#lead-form.is-done').count()) === 1 && !errors.length, `valid form is accepted ${errors.length ? JSON.stringify(errors) : ''}`);
    await pg.close();
  }

  // Header CTA and hero CTA go to the form
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}about.html`);
    await pg.locator('.sol-hero a[href="#talk"]').click();
    await pg.waitForTimeout(700);
    const top = await pg.locator('#talk').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    check(top >= -50 && top < 400, `hero CTA scrolls to the form (top ${top}px)`);
    await pg.close();
  }

  // Links that lead here
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}index.html`);
    await pg.locator('.foot-col a', { hasText: 'О компании' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/about.html', 'index.html: footer «О компании» opens about.html');
    await pg.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
