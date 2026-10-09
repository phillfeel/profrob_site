// Interaction checks for the Industries hub (industries.html) and the links that lead to it.
//
//   node tools/playwright/industries-hub.mjs
//
// - no console/page errors and no horizontal overflow at 1440 and 390, in Russian and English; no Cyrillic left in EN;
// - every card and row leads to an existing landing, and every #anchor exists on that landing (read from the file);
// - the numbers in the hero (industries, manufacturers) match the landing data, the cards are the 11 landings;
// - the cases ribbon: the arrows scroll it and the counter follows;
// - the form: validation, submit, source = industries;
// - «Solutions» «See also» card leads here.
// Exits with code 1 if any assertion failed.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
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

// Landing data: how many industries and unique manufacturers the hero must show
const dataDir = pathToFileURL(join(root, 'tools', 'industries') + '/').href;
const { INDUSTRIES } = await import(dataDir + 'data.mjs');
const industries = [...INDUSTRIES];
for (const slug of ['business-centers', 'education', 'fitness-sports', 'municipal', 'public-spaces', 'retail']) {
  industries.push((await import(`${dataDir}pages/${slug}.mjs`)).default.industry);
}
const brands = new Set(industries.flatMap((i) => i.vendors.flatMap((g) => g.brands)));

const browser = await chromium.launch();
try {
  for (const lang of ['ru', 'en']) {
    for (const width of [1440, 390]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await pg.goto(`${origin}industries.html?lang=${lang}`);
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
  { const pg = await browser.newPage(); await pg.goto(`${origin}industries.html?lang=ru`); await pg.close(); }

  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const payloads = [];
  await pg.route('https://api.web3forms.com/**', (r) => { payloads.push(JSON.parse(r.request().postData() ?? '{}')); r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }); });
  await pg.goto(`${origin}industries.html`);

  // Cards: the 11 landings, each once
  const cards = await pg.locator('.ic').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  const slugs = industries.map((i) => i.slug).sort();
  check(JSON.stringify(cards.map((h) => h.replace(/^industries-|\.html$/g, '')).sort()) === JSON.stringify(slugs), `the ${slugs.length} cards are the ${slugs.length} landings, each once`);
  check((await pg.locator('.ind-row--obj').count()) === 15, '15 rows in «by site type»');

  // Links: landing file exists, #anchor exists in it
  const cache = new Map();
  const html = async (f) => cache.get(f) ?? (cache.set(f, await readFile(join(root, f), 'utf8').catch(() => null)), cache.get(f));
  const links = await pg.locator('main a[href]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
  const broken = [];
  for (const href of links) {
    if (/^(#|https?:|tel:|mailto:)/.test(href)) { if (href.startsWith('#') && href.length > 1 && !(await pg.locator(href).count())) broken.push(href); continue; }
    const [file, hash] = href.split('#');
    const src = await html(file);
    if (src === null) { broken.push(href); continue; }
    if (hash && !src.includes(`id="${hash}"`)) broken.push(href);
  }
  check(!broken.length, `${links.length} links in main lead to existing pages and anchors ${broken.length ? JSON.stringify(broken) : ''}`);

  // Hero numbers come from the data
  const facts = await pg.locator('.facts__row b').allInnerTexts();
  check(facts[0] === String(industries.length) && facts[1] === String(brands.size), `hero numbers ${facts.join(' / ')} = ${industries.length} industries / ${brands.size} manufacturers in the data`);
  check((await pg.locator('.nav-links a.on').getAttribute('href')) === 'industries.html', 'the nav marks «Industries» as the current page');

  // Cases ribbon
  const cur = () => pg.locator('.c-cur').innerText();
  check((await cur()) === '01' && (await pg.locator('.c-total').innerText()) === '05', 'ribbon starts at 01 / 05');
  check(await pg.locator('.slider-ctrl .round[data-dir="-1"]').isDisabled(), 'the «previous» arrow is disabled at the start');
  await pg.locator('.slider-ctrl .round[data-dir="1"]').click();
  await pg.waitForTimeout(900);
  check((await cur()) === '02', 'the «next» arrow moves the ribbon to case 02');
  for (let i = 0; i < 4; i++) { if (await pg.locator('.slider-ctrl .round[data-dir="1"]').isEnabled()) { await pg.locator('.slider-ctrl .round[data-dir="1"]').click(); await pg.waitForTimeout(700); } }
  check(await pg.locator('.slider-ctrl .round[data-dir="1"]').isDisabled(), 'the «next» arrow is disabled at the end');
  const caseLinks = await pg.locator('.case__ind').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  check(caseLinks.length === 5 && !caseLinks.some((h) => h === '#'), 'every case has a link to its industry landing');

  // Form
  await pg.locator('#talk').scrollIntoViewIfNeeded();
  await pg.locator('#lead-form button[type="submit"]').click();
  check((await pg.locator('#lead-form [data-invalid]').count()) >= 2, 'an empty form is not sent: name, phone and consent are flagged');
  const opts = await pg.locator('#f-dir option').evaluateAll((os) => os.map((o) => o.value));
  check(opts.length === industries.length + 2 && industries.every((i) => opts.includes(i.slug)) && opts.includes('other'), 'the industry list: «not sure», 11 landings, «other»');
  await pg.fill('#f-name', 'Тест');
  await pg.fill('#f-phone', '9990001122');
  await pg.selectOption('#f-dir', 'retail');
  await pg.check('#f-consent');
  await pg.locator('#lead-form button[type="submit"]').click();
  await pg.waitForSelector('#lead-form.is-done', { timeout: 4000 }).catch(() => {});
  check(await pg.locator('#lead-form.is-done').count() === 1, 'a valid form shows «request accepted»');
  await pg.waitForTimeout(200);
  check(payloads.length === 1 && payloads[0]['Источник'] === 'industries' && payloads[0]['Направление'] === 'retail', `the request carries source = industries and the chosen industry ${JSON.stringify(payloads[0])}`);
  await pg.close();

  // Entry point: «Solutions → See also» leads here
  {
    const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p2.goto(`${origin}solutions.html`);
    check((await p2.locator('a.see-card[href="industries.html"]').count()) === 1, 'Solutions «See also» card leads to industries.html (no /industries/ left)');
    check((await p2.locator('a[href="/industries/"]').count()) === 0, 'no link to the non-existent /industries/ on Solutions');
    await p2.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
