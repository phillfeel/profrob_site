// Interaction checks for the industry landings (industries-*.html): what check.mjs screenshots can't show.
//
//   node tools/playwright/industries.mjs                  # all pages, incl. tools/industries/pages/*.mjs
//   node tools/playwright/industries.mjs --only retail    # one page
//
// - every page: no console/page errors, no horizontal overflow at 1440 and 390, direction anchors exist;
// - direction preselected in the form when the page is opened with #anchor, source carries the anchor;
// - hotels: the mini calculator recomputes on input and builds the roi.html link; warehouse hides «1 смена».
// Exits with code 1 on the first failed assertion list.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
const base = `http://127.0.0.1:${server.address().port}/`;

const PAGES = { hotels: 'delivery', construction: 'finishing', 'medical-wellness': 'disinfection', manufacturing: 'cobots', agriculture: 'grounds' };
// Pages from tools/industries/pages/*.mjs: checked with their second direction (or the first, if only one).
const pagesDir = join(root, 'tools', 'industries', 'pages');
for (const f of existsSync(pagesDir) ? await readdir(pagesDir) : []) {
  if (!f.endsWith('.mjs')) continue;
  const { industry } = (await import(pathToFileURL(join(pagesDir, f)).href)).default;
  PAGES[industry.slug] = (industry.directions[1] || industry.directions[0]).anchor;
}
// --only <slug>: check a single page.
const onlyArg = process.argv.indexOf('--only');
if (onlyArg > -1) for (const k of Object.keys(PAGES)) if (k !== process.argv[onlyArg + 1]) delete PAGES[k];
const fails = [];
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg); };

const browser = await chromium.launch();
try {
  for (const [slug, anchor] of Object.entries(PAGES)) {
    for (const width of [1440, 390]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      pg.on('pageerror', (e) => errors.push(String(e)));
      pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await pg.goto(`${base}industries-${slug}.html#${anchor}`);
      await pg.waitForTimeout(400);
      const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(!errors.length && overflow === 0, `${slug} @${width}: errors ${errors.length ? JSON.stringify(errors) : 'none'}, overflow ${overflow}px`);
      if (width !== 1440) { await pg.close(); continue; }

      const form = await pg.evaluate(() => ({
        dir: document.getElementById('f-dir').value, source: document.getElementById('lead-form').dataset.source,
        anchors: [...document.querySelectorAll('#f-dir option')].filter((o) => o.value).every((o) => document.getElementById(o.value)),
      }));
      check(form.dir === anchor && form.source === `industries/${slug}#${anchor}`, `${slug}: form preselects #${anchor} (dir=${form.dir}, source=${form.source})`);
      check(form.anchors, `${slug}: every direction in the form has an anchor on the page`);

      if (slug === 'hotels') {
        const read = () => pg.evaluate(() => ({
          payback: document.querySelector('[data-out="payback"]').textContent,
          net: document.querySelector('[data-out="net"]').textContent,
          link: document.querySelector('[data-out="link"]').getAttribute('href'),
        }));
        const before = await read();
        await pg.locator('#calc-area').fill('30000');
        await pg.locator('#calc-area').dispatchEvent('input');
        const after = await read();
        check(before.net !== after.net && after.link.includes('a=30000'), `hotels calc: area 30 000 → ${after.payback}, ${after.net}, ${after.link}`);
        await pg.locator('.seg__o', { hasText: 'Склад' }).click();
        const wh = await pg.evaluate(() => ({
          oneHidden: document.querySelector('input[name="calc-mode"][value="one"]').closest('.seg__o').hidden,
          link: document.querySelector('[data-out="link"]').getAttribute('href'),
        }));
        check(wh.oneHidden && /t=warehouse&a=20000&m=two/.test(wh.link), `hotels calc: warehouse hides «1 смена», link ${wh.link}`);
      }
      if (slug === 'business-centers') {
        const read = () => pg.evaluate(() => ({
          n: document.querySelector('[data-ready-n]').textContent,
          verdict: document.querySelector('[data-ready-verdict]').textContent,
        }));
        const before = await read();
        const boxes = pg.locator('[data-ready] input[type="checkbox"]');
        await boxes.nth(1).check();
        await boxes.nth(4).check();
        const two = await read();
        check(before.n === '0' && two.n === '2' && two.verdict !== before.verdict && two.verdict.startsWith('Готово частично'),
          `business-centers checklist: 2 of 5 → «${two.verdict.slice(0, 40)}…»`);
        for (const i of [0, 2, 3]) await boxes.nth(i).check();
        const all = await read();
        check(all.n === '5' && all.verdict.startsWith('Здание готово'), `business-centers checklist: 5 of 5 → «${all.verdict.slice(0, 40)}…»`);
      }
      await pg.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.error(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
