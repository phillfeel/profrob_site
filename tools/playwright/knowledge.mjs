// Interaction checks for the Knowledge base page (knowledge.html) and the link that leads to it.
//
//   node tools/playwright/knowledge.mjs
//
// - no console/page errors and no horizontal overflow at 1440 and 390, in Russian and English;
// - ?topic= and the topic cards / chips filter the materials; a topic without materials shows the empty state;
// - the search filters materials and FAQ, opens matching answers and closes them again when cleared;
// - first-screen question links and in-answer links land on existing blocks; FAQ markup matches the FAQPage JSON-LD;
// - the home footer «База знаний» opens knowledge.html.
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
const visible = (pg) => pg.locator('.kb-item:visible').count();

const browser = await chromium.launch();
try {
  for (const lang of ['ru', 'en']) {
    for (const width of [1440, 390]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await pg.goto(`${origin}knowledge.html?lang=${lang}`);
      await pg.waitForTimeout(500);
      const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(!errors.length && overflow === 0, `${lang} @${width}: errors ${errors.length ? JSON.stringify(errors) : 'none'}, overflow ${overflow}px`);
      if (lang === 'en') {
        // Open every answer: closed <details> content is not in innerText
        await pg.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true; }));
        const cyr = await pg.evaluate(() => /[А-Яа-яЁё]/.test(document.querySelector('main').innerText));
        check(!cyr, `en @${width}: no Cyrillic left in main`);
      }
      await pg.close();
    }
  }
  {
    const pg = await browser.newPage();
    await pg.goto(`${origin}knowledge.html?lang=ru`);
    await pg.close();
  }

  // Topic filter: URL, chips, cards, empty state
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}knowledge.html`);
    const total = await pg.locator('.kb-item').count();
    check(total === 14 && (await visible(pg)) === total, `all ${total} materials visible by default`);
    const chipSum = await pg.locator('.kb-chip[data-topic]:not([data-topic=""]) .kb-chip__n').evaluateAll((ns) => ns.reduce((s, n) => s + Number(n.textContent), 0));
    check(chipSum === total, `chip counts add up to the total (${chipSum})`);
    for (const a of await pg.locator('.kb-cat__go[data-topic]').evaluateAll((as) => as.map((x) => [x.dataset.topic, Number(x.closest('.kb-cat').querySelector('.kb-cat__n b').textContent)]))) {
      const n = await pg.locator(`.kb-item[data-topic="${a[0]}"]`).count();
      check(n === a[1], `card «${a[0]}» shows ${a[1]} materials, list has ${n}`);
    }

    await pg.goto(`${origin}knowledge.html?topic=agro`);
    check((await visible(pg)) === 2 && (await pg.locator('.kb-chip[data-topic="agro"]').getAttribute('aria-current')) === 'true', '?topic=agro: 2 materials, chip «Агро» current');
    await pg.locator('.kb-chip[data-topic="raas"]').click();
    check((await visible(pg)) === 2 && new URL(pg.url()).searchParams.get('topic') === 'raas', 'chip «Аренда»: 2 materials, URL updated');
    await pg.locator('.kb-cat__go[data-topic="cleaning"]').click();
    await pg.waitForTimeout(700);
    const top = await pg.locator('#materials').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    check((await visible(pg)) === 1 && top >= 0 && top < 200, `card «Клининг» filters to 1 and scrolls to the list (top ${top}px)`);
    check(await pg.locator('.kb-cat:has(.kb-cat__go[data-topic="cleaning"][aria-current])').count() === 1, 'chosen topic card is marked');

    await pg.goto(`${origin}knowledge.html?topic=news`);
    check((await visible(pg)) === 0 && await pg.locator('.kb-empty').isVisible() && await pg.locator('.kb-empty [data-kind="topic"]').isVisible(), '?topic=news: empty state for a topic');
    await pg.goto(`${origin}knowledge.html?topic=nonsense`);
    check((await visible(pg)) === 14 && await pg.locator('.kb-empty').isHidden(), 'unknown ?topic: all materials');
    await pg.close();
  }

  // Search: materials and FAQ
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}knowledge.html`);
    await pg.fill('#kb-q', 'AMR');
    const amr = await visible(pg);
    const faqHits = await pg.locator('.kb-q:visible').count();
    const opened = await pg.locator('.kb-q[open]').count();
    check(amr === 1 && faqHits === 1 && opened === 1, `«AMR»: 1 material, 1 question, opened (${amr}/${faqHits}/${opened})`);
    await pg.fill('#kb-q', 'ОКУПАЕТСЯ робот');
    check((await visible(pg)) >= 1, `case-insensitive multi-word search («ОКУПАЕТСЯ робот»: ${await visible(pg)})`);
    await pg.fill('#kb-q', 'ёлка');
    check((await visible(pg)) === 0 && await pg.locator('.kb-empty [data-kind="search"]').isVisible() && await pg.locator('.kb-qa__none').isVisible(), 'no matches: search empty state and FAQ note');
    await pg.locator('.kb-empty a[data-topic=""]').click();
    check((await pg.inputValue('#kb-q')) === '' && (await visible(pg)) === 14 && (await pg.locator('.kb-q[open]').count()) === 0, '«Показать все» clears the search, answers opened by search close');
    await pg.fill('#kb-q', 'аренд');
    await pg.press('#kb-q', 'Escape');
    check((await pg.inputValue('#kb-q')) === '' && (await visible(pg)) === 14, 'Escape clears the search');
    await pg.close();
  }

  // Anchors, links inside answers, JSON-LD
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}knowledge.html`);
    for (const h of await pg.locator('.kb-toc a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))) check((await pg.locator(h).count()) === 1, `question link ${h} points at an existing block`);
    const inner = await pg.locator('.kb-q p a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    for (const h of inner) {
      const [file, hash] = h.split('#');
      const p2 = await browser.newPage();
      const r = await p2.goto(`${origin}${file}`);
      check(r.ok() && (!hash || (await p2.locator(`#${hash}`).count()) === 1), `answer link ${h} lands on an existing page/block`);
      await p2.close();
    }
    const ld = await pg.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'].find((g) => g['@type'] === 'FAQPage').mainEntity);
    const dom = await pg.locator('.kb-q').evaluateAll((ds) => ds.map((d) => [d.querySelector('summary').textContent.trim(), d.querySelector('p').textContent.replace(/\s+/g, ' ').trim()]));
    check(ld.length === dom.length && ld.every((q, i) => q.name === dom[i][0] && q.acceptedAnswer.text === dom[i][1]), `FAQPage JSON-LD equals the ${dom.length} answers on the page`);
    await pg.locator('.kb-toc a[href="#faq-staff"]').click();
    await pg.waitForTimeout(300);
    check(await pg.locator('#faq-staff').evaluate((d) => d.open), 'question link opens the target answer');
    await pg.goto(`${origin}index.html`);
    await pg.locator('.foot-col a', { hasText: 'База знаний' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/knowledge.html', 'index.html: footer «База знаний» opens knowledge.html');
    await pg.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
