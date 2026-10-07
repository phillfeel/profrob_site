// Checks for the knowledge base article page (knowledge-cleaning-robot-basics.html) and the link that leads to it.
//
//   node tools/playwright/knowledge-article.mjs
//
// - no console/page errors and no horizontal overflow at 1440 and 390, in Russian and English; no Cyrillic in EN body text;
// - the table of contents links hit existing sections and the current one is marked while scrolling;
// - every internal link of the article lands on an existing page/block; the FAQPage JSON-LD equals the answers on the page;
// - knowledge.html: the first material is a link to the article with the «Read» marker, the others keep «Upcoming».
// Exits with code 1 if any assertion failed.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize, dirname } from 'node:path';

const PAGE = 'knowledge-cleaning-robot-basics.html';
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
  for (const lang of ['ru', 'en']) for (const width of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addInitScript((l) => { try { localStorage.setItem('lang', l); } catch (e) { /* storage blocked */ } }, lang);
    const pg = await ctx.newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await pg.goto(`${origin}${PAGE}`);
    await pg.waitForTimeout(600);
    const over = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(errors.length === 0 && over <= 0, `${lang} ${width}px: no errors, no horizontal overflow (${over}px)${errors.length ? ' ' + errors[0] : ''}`);
    if (lang === 'en') {
      const cyr = await pg.evaluate(() => (document.querySelector('main').innerText.match(/[Ѐ-ӿ]+/g) || []).slice(0, 5));
      check(cyr.length === 0, `en ${width}px: no Cyrillic in the article (${cyr.join(', ')})`);
    }
    await ctx.close();
  }

  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pg.goto(`${origin}${PAGE}`);
  for (const h of await pg.locator('.ar-toc__list a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))) {
    check((await pg.locator(h).count()) === 1, `contents link ${h} points at an existing section`);
  }
  await pg.locator('.ar-toc__list a[href="#limits"]').click();
  await pg.waitForTimeout(900);
  check((await pg.locator('.ar-toc__list a[aria-current="true"]').getAttribute('href')) === '#limits', 'contents marks the current section after a jump to «limits»');

  const hrefs = await pg.locator('.ar-body a[href], .talk a[href], .crumbs a[href], .ar-spec a[href]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')).filter((h) => !h.startsWith('http')))]);
  for (const h of hrefs) {
    const [file, hash] = h.split('#');
    const p2 = await browser.newPage();
    const r = file ? await p2.goto(`${origin}${file}`) : await p2.goto(`${origin}${PAGE}`);
    check(r.ok() && (!hash || (await p2.locator(`#${hash}`).count()) === 1), `link ${h} lands on an existing page/block`);
    await p2.close();
  }
  const ld = await pg.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph']);
  const faq = ld.find((g) => g['@type'] === 'FAQPage').mainEntity;
  const dom = await pg.locator('.kb-q').evaluateAll((ds) => ds.map((d) => [d.querySelector('summary').textContent.trim(), d.querySelector('p').textContent.replace(/\s+/g, ' ').trim()]));
  check(faq.length === dom.length && faq.every((q, i) => q.name === dom[i][0] && q.acceptedAnswer.text === dom[i][1]), `FAQPage JSON-LD equals the ${dom.length} answers on the page`);
  check(ld.some((g) => g['@type'] === 'Article') && ld.find((g) => g['@type'] === 'BreadcrumbList').itemListElement.length === 3, 'Article and 3-level BreadcrumbList are present');
  await pg.close();

  const hub = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await hub.goto(`${origin}knowledge.html`);
  const live = await hub.locator('.kb-item--live').count();
  const soon = await hub.locator('.kb-item:not(.kb-item--live) .kb-item__st').count();
  check(live === 1 && soon === 13, `hub: 1 article is live, 13 are still «Upcoming» (${live}/${soon})`);
  await hub.locator('.kb-item--live .kb-item__go').click();
  await hub.waitForLoadState();
  check(new URL(hub.url()).pathname === `/${PAGE}`, 'hub: the first material opens the article');
  await hub.close();
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
