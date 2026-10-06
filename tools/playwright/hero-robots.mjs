// Click-through checks for the robots in the home hero (#track in index.html).
//
//   node tools/playwright/hero-robots.mjs
//
// - every robot is a link to an existing industry page, and the #anchor in it exists;
// - desktop: hovering a robot shows the caption, a click opens the industry page;
// - tablet (caption panel visible): the first tap only shows the caption, the second tap opens the page;
// - phone (no caption panel): one tap opens the page.
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

const robot = (pg, key) => pg.locator(`#track .robot[data-robot="${key}"]:not([data-clone])`);
const center = async (loc) => { const b = await loc.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height * 0.45 }; };

const browser = await chromium.launch();
try {
  // 1. Links: href → existing page + existing anchor
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await pg.goto(`${origin}index.html`);
    await pg.waitForTimeout(600);
    const links = await pg.$$eval('#track .robot:not([data-clone])', (els) => els.map((el) => [el.dataset.robot, el.tagName, el.getAttribute('href')]));
    check(links.length === 8, `8 robots in the track (got ${links.length})`);
    for (const [key, tag, href] of links) {
      if (tag !== 'A' || !href) { check(false, `${key}: expected <a href>, got <${tag.toLowerCase()}> href=${href}`); continue; }
      const [path, hash] = href.split('#');
      const html = await (await fetch(origin + path)).text().catch(() => '');
      check(html.length > 0 && (!hash || html.includes(`id="${hash}"`)), `${key} → ${href}`);
    }
    check(!errors.length, `index.html console errors: ${errors.length ? JSON.stringify(errors) : 'none'}`);
    await pg.close();
  }

  // 2. Desktop: hover shows the caption, click navigates
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${origin}index.html`);
    await pg.waitForTimeout(600);
    // Belt keeps moving until the pointer sits on a robot: park the pointer, wait for the brake, then aim again.
    const el = robot(pg, 'agro');
    await el.scrollIntoViewIfNeeded();
    let { x, y } = await center(el);
    await pg.mouse.move(x, y);
    await pg.waitForTimeout(900);
    ({ x, y } = await center(el));
    await pg.mouse.move(x, y);
    await pg.waitForTimeout(500);
    const cat = await pg.locator('#caption-cat').textContent();
    check(cat.trim() === 'Агро', `hover: caption shows «${cat.trim()}»`);
    await Promise.all([pg.waitForURL(/industries-agriculture\.html/), pg.mouse.click(x, y)]);
    check(new URL(pg.url()).pathname === '/industries-agriculture.html', `click: opens ${new URL(pg.url()).pathname}`);
    await pg.close();
  }

  // 3a. Phone: no caption panel, so a single tap navigates
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const pg = await ctx.newPage();
    await pg.goto(`${origin}index.html`);
    await pg.waitForTimeout(600);
    const el = robot(pg, 'agro');
    await el.scrollIntoViewIfNeeded();
    const { x, y } = await center(el);
    await Promise.all([pg.waitForURL(/industries-agriculture\.html/), pg.touchscreen.tap(x, y)]);
    check(new URL(pg.url()).pathname === '/industries-agriculture.html', 'phone: one tap opens the industry page');
    await ctx.close();
  }

  // 3b. Tablet (caption visible): first tap arms, second tap navigates
  {
    const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
    const pg = await ctx.newPage();
    await pg.goto(`${origin}index.html`);
    await pg.waitForTimeout(600);
    const el = robot(pg, 'agro');
    await el.scrollIntoViewIfNeeded();
    let { x, y } = await center(el);
    await pg.touchscreen.tap(x, y);
    await pg.waitForTimeout(500);
    check(new URL(pg.url()).pathname === '/index.html', 'touch: first tap stays on the home page');
    check(await pg.locator('#caption-cat').textContent().then((s) => s.trim() === 'Агро'), 'touch: first tap shows the caption');
    ({ x, y } = await center(el));
    await Promise.all([pg.waitForURL(/industries-agriculture\.html/), pg.touchscreen.tap(x, y)]);
    check(new URL(pg.url()).pathname === '/industries-agriculture.html', 'touch: second tap opens the industry page');
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.error(`\n${fails.length} check(s) failed`); process.exit(1); }
console.log('\nall checks passed');
