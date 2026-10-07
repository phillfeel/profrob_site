// Interaction checks for the Contacts page (contacts.html) and the links that lead to it.
//
//   node tools/playwright/contacts.mjs
//
// - no console/page errors and no horizontal overflow at 1440 and 390, in Russian and English;
// - the form needs a name and one contact: a phone or an e-mail; a bad e-mail and a missing consent are reported;
// - «Get a proposal» / «demo or pilot» buttons preselect the goal in the form;
// - the header «Контакты» is marked as the current page; screenshots of the three sections go to tools/playwright/out/.
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
const out = join(root, 'tools', 'playwright', 'out');
const scrollThrough = async (pg) => {
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
  await pg.waitForTimeout(900);
};

const browser = await chromium.launch();
try {
  for (const lang of ['ru', 'en']) {
    for (const width of [1440, 390]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await pg.goto(`${origin}contacts.html?lang=${lang}`);
      await pg.waitForTimeout(500);
      await scrollThrough(pg);
      const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(!errors.length && overflow === 0, `${lang} @${width}: errors ${errors.length ? JSON.stringify(errors) : 'none'}, overflow ${overflow}px`);
      if (lang === 'en') {
        const cyr = await pg.evaluate(() => /[А-Яа-яЁё]/.test(document.querySelector('main').innerText));
        check(!cyr, `en @${width}: no Cyrillic left in main`);
      }
      for (const [name, sel] of [['hero', '.ct-hero'], ['channels', '#channels'], ['office', '#office']]) {
        await pg.locator(sel).screenshot({ path: join(out, `contacts_${name}_${lang}_${width}.png`) });
      }
      // The three channel values and the form must fit their boxes
      const clipped = await pg.evaluate(() => [...document.querySelectorAll('.ct-row__value, .ct-pick__body b, .btn, .ct-net__tag')].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent.trim()));
      check(!clipped.length, `${lang} @${width}: no clipped text ${clipped.length ? JSON.stringify(clipped) : ''}`);
      await pg.close();
    }
  }
  { const pg = await browser.newPage(); await pg.goto(`${origin}contacts.html?lang=ru`); await pg.close(); }

  // Form rules
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}contacts.html`);
    await pg.waitForTimeout(400);
    const err = (id) => pg.locator(`#${id}`).innerText();
    const submit = () => pg.locator('#lead-form button[type=submit]').click();

    await submit();
    check((await err('f-name-err')).length > 0, 'empty form: the name is required');
    check((await err('f-phone-err')).includes('телефон или e-mail'), `empty form: asks for a phone or an e-mail («${await err('f-phone-err')}»)`);
    check((await err('f-consent-err')).length > 0, 'empty form: the consent is required');

    await pg.fill('#f-name', 'Анна');
    await pg.fill('#f-email', 'anna@company.ru');
    check((await err('f-phone-err')) === '', 'typing an e-mail clears «phone or e-mail»');
    await pg.fill('#f-email', 'anna@company');
    await submit();
    check((await err('f-email-err')).length > 0, 'bad e-mail is reported');

    await pg.fill('#f-email', '');
    await pg.fill('#f-phone', '8999123');
    await submit();
    check((await err('f-phone-err')).includes('полностью'), 'half-typed phone is reported even without an e-mail');

    await pg.fill('#f-phone', '');
    await pg.type('#f-phone', '9991234567');
    check((await pg.inputValue('#f-phone')) === '+7 (999) 123-45-67', 'phone mask works');
    await pg.fill('#f-email', 'anna@company.ru');
    await pg.fill('#f-task', 'Ночная уборка холла');
    await submit();
    check((await err('f-consent-err')).length > 0 && (await err('f-phone-err')) === '' && (await err('f-email-err')) === '', 'valid phone + e-mail: only the consent is missing');

    const logged = [];
    pg.on('console', async (m) => { if (m.type() === 'info' && m.args()[1]) logged.push(JSON.stringify(await m.args()[1].jsonValue())); });
    await pg.check('#f-consent');
    await pg.selectOption('#f-intent', 'audit');
    await pg.selectOption('#f-object', 'hotels');
    await submit();
    await pg.waitForSelector('#lead-form.is-done', { timeout: 3000 }).catch(() => {});
    check(await pg.locator('#lead-form.is-done').count() === 1, 'valid form: «Заявка принята»');
    await pg.waitForTimeout(200);
    const payload = logged.join(' ');
    check(['anna@company.ru', '+79991234567', 'audit', 'hotels', 'contacts', 'Ночная'].every((x) => payload.includes(x)), `payload carries phone, e-mail, intent, object, source, task (${payload.slice(0, 160)}…)`);
    await pg.close();
  }

  // E-mail only is enough
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}contacts.html`);
    await pg.waitForTimeout(400);
    await pg.fill('#f-name', 'Анна');
    await pg.fill('#f-email', 'anna@company.ru');
    await pg.check('#f-consent');
    await pg.locator('#lead-form button[type=submit]').click();
    await pg.waitForSelector('#lead-form.is-done', { timeout: 3000 }).catch(() => {});
    check(await pg.locator('#lead-form.is-done').count() === 1, 'name + e-mail without a phone is accepted');
    await pg.close();
  }

  // Mini-CTA → form
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}contacts.html`);
    await pg.waitForTimeout(400);
    await pg.locator('[data-intent="pilot"]').click();
    check((await pg.locator('#f-intent').inputValue()) === 'pilot', '«Заказать демо или пилот» preselects «pilot»');
    await pg.locator('[data-intent="quote"]').click();
    check((await pg.locator('#f-intent').inputValue()) === 'quote', '«Запросить КП» preselects «quote»');
    check((await pg.locator('a.ct-pick__item--roi').getAttribute('href')) === 'roi.html', '«Рассчитать ROI» leads to the calculator');
    await pg.close();
  }

  // Header
  for (const lang of ['ru', 'en']) {
    const pg = await browser.newPage({ viewport: { width: 1024, height: 700 } });
    await pg.goto(`${origin}contacts.html?lang=${lang}`);
    await pg.waitForTimeout(400);
    const rows = await pg.locator('.nav-links a').evaluateAll((as) => as.map((a) => Math.round(a.getBoundingClientRect().height)));
    check(rows.every((h) => h <= 24) && rows.length === 7, `${lang} @1024: 7 header links on one line`);
    check((await pg.locator('.nav-links a[aria-current="page"]').getAttribute('href')) === 'contacts.html', `${lang}: «Контакты» marked as the current page`);
    await pg.close();
  }
  { const pg = await browser.newPage(); await pg.goto(`${origin}contacts.html?lang=ru`); await pg.close(); }

  // Header «Контакты» from every kind of page, and the home footer
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    for (const page of ['index.html', 'solutions.html', 'products.html', 'roi.html', 'services.html', 'cases.html', 'industries-retail.html']) {
      await pg.goto(`${origin}${page}`);
      await pg.locator('.nav-links a', { hasText: 'Контакты' }).click();
      await pg.waitForLoadState();
      check(new URL(pg.url()).pathname === '/contacts.html', `${page}: header «Контакты» opens contacts.html`);
    }
    await pg.goto(`${origin}index.html`);
    await pg.locator('.foot-col a', { hasText: 'Контакты' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/contacts.html', 'index.html: footer «Контакты» opens contacts.html');
    await pg.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
