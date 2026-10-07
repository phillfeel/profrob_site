// Interaction checks for the Platform page (platform.html) and the links that lead to it.
//
//   node tools/playwright/platform.mjs [--shots]     (--shots: also save a screenshot of every tab and section to tools/playwright/out/platform/)
//
// - no console/page errors and no horizontal overflow at 1440, 1024 and 390, in Russian and English (the offender is named when there is overflow);
// - the 11 feature tabs: one panel visible at a time, click, arrows/Home/End, «Решает:» links open the matching tab;
// - CTA buttons preselect the topic in the form;
// - header «Платформа» opens platform.html from every kind of page and is marked as current here.
// Exits with code 1 if any assertion failed.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize, dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const shots = process.argv.includes('--shots');
const outDir = join(root, 'tools', 'playwright', 'out', 'platform');
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
const TABS = ['center', 'fleet', 'monitoring', 'maps', 'dispatch', 'remote', 'analytics', 'agents', 'api', 'sla', 'custom'];
const SECTIONS = ['idea', 'problems', 'capabilities', 'trust', 'results', 'objects', 'see', 'talk'];

// Elements that stick out past the viewport and are not clipped by an ancestor with overflow hidden
const overflowOffenders = () => {
  const w = document.documentElement.clientWidth;
  const clipped = (e) => { for (let p = e.parentElement; p; p = p.parentElement) if (/hidden|clip|auto|scroll/.test(getComputedStyle(p).overflowX) && p !== document.documentElement && p !== document.body) return true; return false; };
  return [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > w + 1 && !clipped(e))
    .slice(0, 5).map((e) => `${e.tagName.toLowerCase()}.${String(e.className.baseVal ?? e.className).split(' ')[0]} (${getComputedStyle(e).position}) → ${Math.round(e.getBoundingClientRect().right)}px`);
};

const browser = await chromium.launch();
try {
  for (const lang of ['ru', 'en']) {
    for (const width of [1440, 1024, 390]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await pg.goto(`${origin}platform.html?lang=${lang}`);
      await pg.waitForTimeout(500);
      const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const who = overflow ? await pg.evaluate(overflowOffenders) : [];
      check(!errors.length && overflow === 0, `${lang} @${width}: errors ${errors.length ? JSON.stringify(errors) : 'none'}, overflow ${overflow}px ${who.length ? JSON.stringify(who) : ''}`);
      if (lang === 'en') {
        const cyr = await pg.evaluate(() => /[А-Яа-яЁё]/.test(document.querySelector('main').innerText));
        check(!cyr, `en @${width}: no Cyrillic left in main`);
      }
      await pg.close();
    }
  }
  { const pg = await browser.newPage(); await pg.goto(`${origin}platform.html?lang=ru`); await pg.close(); }

  // Tabs
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}platform.html`);
    await pg.waitForTimeout(400);
    const ids = await pg.locator('[role="tab"]').evaluateAll((ts) => ts.map((t) => t.id.replace('t-', '')));
    check(JSON.stringify(ids) === JSON.stringify(TABS), `11 tabs in order (${ids.length})`);
    const visible = async () => pg.locator('[role="tabpanel"]:not([hidden])').evaluateAll((ps) => ps.map((p) => p.id));
    check(JSON.stringify(await visible()) === '["p-center"]', 'only the first panel is visible at start');
    const labelled = await pg.locator('[role="tabpanel"]').evaluateAll((ps) => ps.every((p) => document.getElementById(p.getAttribute('aria-labelledby'))?.getAttribute('aria-controls') === p.id));
    check(labelled, 'every panel is labelled by its tab');
    await pg.locator('#capabilities').scrollIntoViewIfNeeded();
    for (const id of TABS) {
      await pg.locator(`#t-${id}`).click();
      const v = await visible();
      const sel = await pg.locator(`#t-${id}`).getAttribute('aria-selected');
      check(v.length === 1 && v[0] === `p-${id}` && sel === 'true', `click #t-${id} → panel p-${id}`);
      const bad = await pg.locator(`#p-${id} .pf-win`).evaluate((w) => w.scrollHeight - w.clientHeight);
      check(bad <= 1, `p-${id}: window content fits (${bad}px over)`);
      if (shots) { await mkdir(outDir, { recursive: true }); await pg.waitForTimeout(1800); await pg.locator('.pf-cap').screenshot({ path: join(outDir, `tab-${id}.png`) }); }
    }
    await pg.locator('#t-center').click();
    await pg.keyboard.press('ArrowDown');
    check((await visible())[0] === 'p-fleet', 'ArrowDown → next tab');
    await pg.keyboard.press('End');
    check((await visible())[0] === 'p-custom', 'End → last tab');
    await pg.keyboard.press('ArrowDown');
    check((await visible())[0] === 'p-center', 'ArrowDown on the last tab wraps to the first');
    await pg.keyboard.press('ArrowUp');
    check((await visible())[0] === 'p-custom', 'ArrowUp on the first tab wraps to the last');
    await pg.close();
  }

  // «Решает: …» links open the matching tab
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}platform.html`);
    const links = await pg.locator('.pf-prob__go').evaluateAll((as) => as.map((a) => a.getAttribute('data-cap')));
    check(links.length === 5 && links.every((c) => TABS.includes(c)), `5 problem links point at existing tabs ${JSON.stringify(links)}`);
    await pg.locator('.pf-prob__go[data-cap="analytics"]').click();
    await pg.waitForTimeout(500);
    check((await pg.locator('#t-analytics').getAttribute('aria-selected')) === 'true', 'problem link opens its tab');
    const top = await pg.locator('#capabilities').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    check(Math.abs(top) < 400, `…and scrolls to the features block (top ${top}px)`);
    await pg.close();
  }

  // Robot types strip: every tile and the «40+ manufacturers» caption lead somewhere real, anchors included
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}platform.html`);
    const hrefs = await pg.locator('.pf-any__row a, .pf-any__cap a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    check(hrefs.length === 10, `robot strip has 8 tiles + 2 caption links (${hrefs.length})`);
    for (const h of hrefs.filter((x) => !x.startsWith('#'))) {
      await pg.goto(`${origin}${h}`);
      const id = h.includes('#') ? h.slice(h.indexOf('#')) : null;
      check(!id || (await pg.locator(id).count()) === 1, `${h} points at an existing block`);
    }
    await pg.close();
  }

  // Auto-advance stops after the first manual action; does not run under reduced motion
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await pg.goto(`${origin}platform.html`);
    await pg.locator('#capabilities').scrollIntoViewIfNeeded();
    await pg.waitForTimeout(8000);
    check((await pg.locator('#t-center').getAttribute('aria-selected')) === 'true', 'reduced motion: tabs do not advance on their own');
    await pg.close();
  }
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}platform.html`);
    await pg.locator('.pf-cap').scrollIntoViewIfNeeded();
    await pg.mouse.move(5, 5);
    await pg.waitForTimeout(7600);
    check((await pg.locator('#t-fleet').getAttribute('aria-selected')) === 'true', 'tabs advance on their own while visible');
    await pg.locator('#t-agents').click();
    await pg.mouse.move(5, 5);
    await pg.waitForTimeout(7600);
    check((await pg.locator('#t-agents').getAttribute('aria-selected')) === 'true', 'after a click the tabs stop advancing');
    await pg.close();
  }

  // CTA → form
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}platform.html`);
    const opts = await pg.locator('#f-dir option').evaluateAll((os) => os.map((o) => o.value).filter(Boolean));
    check(JSON.stringify(opts) === '["demo","connect","custom","api"]', 'form topics: demo, connect, custom, api');
    await pg.locator('.sol-hero a[data-pick="demo"]').click();
    check((await pg.locator('#f-dir').inputValue()) === 'demo', 'hero CTA preselects «demo»');
    await pg.locator('#t-custom').click();
    await pg.locator('#p-custom a[data-pick="custom"]').click();
    check((await pg.locator('#f-dir').inputValue()) === 'custom', '«Discuss development» preselects «custom»');
    for (const id of SECTIONS) check((await pg.locator(`#${id}`).count()) === 1, `section #${id} exists`);
    const hrefs = await pg.locator('main a[href]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')).filter((h) => !h.startsWith('#') && !h.startsWith('tel:') && !h.startsWith('mailto:')))]);
    for (const h of hrefs) {
      const r = await pg.request.get(new URL(h, origin).href);
      check(r.ok(), `link ${h} resolves`);
    }
    await pg.close();
  }

  // Header link from every kind of page; current page marked
  for (const page of ['index.html', 'solutions.html', 'products.html', 'roi.html', 'services.html', 'cases.html', 'industries-retail.html']) {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}${page}`);
    await pg.locator('.nav-links a', { hasText: 'Платформа' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/platform.html', `${page}: header «Платформа» opens platform.html`);
    await pg.close();
  }
  for (const lang of ['ru', 'en']) {
    const pg = await browser.newPage({ viewport: { width: 1024, height: 700 } });
    await pg.goto(`${origin}platform.html?lang=${lang}`);
    await pg.waitForTimeout(400);
    const rows = await pg.locator('.nav-links a').evaluateAll((as) => as.map((a) => Math.round(a.getBoundingClientRect().height)));
    check(rows.every((h) => h <= 24) && rows.length === 7, `${lang} @1024: 7 header links on one line`);
    check((await pg.locator('.nav-links a[aria-current="page"]').getAttribute('href')) === 'platform.html', `${lang}: «Платформа» marked as the current page`);
    await pg.close();
  }
  { const pg = await browser.newPage(); await pg.goto(`${origin}platform.html?lang=ru`); await pg.close(); }

  // Other links that lead here
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}index.html`);
    await pg.locator('a', { hasText: 'Подробнее о платформе' }).click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/platform.html', 'index.html: «Подробнее о платформе» opens platform.html');
    await pg.goto(`${origin}products.html`);
    await pg.locator('#platform a.btn-ghost-dark').click();
    await pg.waitForLoadState();
    check(new URL(pg.url()).pathname === '/platform.html', 'products.html: «Подробнее о платформе» opens platform.html');
    const stale = [];
    for (const page of ['index.html', 'products.html', 'about.html', 'industries-retail.html']) {
      await pg.goto(`${origin}${page}`);
      stale.push(...(await pg.locator('a[href="index.html#platform"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).map((h) => `${page}: ${h}`));
    }
    check(!stale.length, `no header links to index.html#platform ${stale.length ? JSON.stringify(stale) : ''}`);
    await pg.close();
  }

  if (shots) {
    await mkdir(outDir, { recursive: true });
    for (const width of [1440, 390]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      await pg.goto(`${origin}platform.html`);
      await pg.waitForTimeout(400);
      await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } scrollTo(0, 0); });
      await pg.waitForTimeout(600);
      for (const id of ['idea', 'problems', 'capabilities', 'trust', 'results', 'objects', 'see', 'talk']) {
        await pg.locator(`#${id}`).screenshot({ path: join(outDir, `${id}-${width}.png`) });
      }
      await pg.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
