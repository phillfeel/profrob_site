// Visual check for the static landing. Serves the project root itself, no extra server needed.
//
//   node tools/playwright/check.mjs --page index.html --selector "#tasks" --widths 1440,390
//   node tools/playwright/check.mjs --page index.html --pin tasks          # GSAP-pinned section: start / mid / end
//
// Prints: console/page errors, horizontal page overflow per width, and the screenshot paths.
// Options: --page (default index.html), --selector (element screenshot; default full viewport),
//          --widths (default 1440,390), --height (default 900; with --selector also prints block height vs viewport), --pin <section id> (scrub through pinned section),
//          --hover <selector> (move the mouse to this element's centre before the --selector screenshot),
//          --reduce (emulate prefers-reduced-motion),
//          --out (default tools/playwright/out, gitignored), --wait ms after load/scroll (default 1500).
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true']);
  return acc;
}, []));
const page = args.page ?? 'index.html';
const widths = (args.widths ?? '1440,390').split(',').map(Number);
const height = Number(args.height ?? 900);
const wait = Number(args.wait ?? 1500);
const out = args.out ?? join(here, 'out');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json' };

const server = createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const body = await readFile(join(root, rel));
    res.writeHead(200, { 'content-type': MIME[extname(rel)] ?? 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/${page}`;

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const tag = page.replace(/\W+/g, '_');
try {
  for (const width of widths) {
    const pg = await browser.newPage({ viewport: { width, height }, reducedMotion: args.reduce ? 'reduce' : 'no-preference' });
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await pg.goto(base);
    await pg.waitForTimeout(wait);

    const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(`[${width}px] horizontal overflow: ${overflow}px, errors: ${errors.length ? JSON.stringify(errors) : 'none'}`);

    if (args.pin) {
      // Scrub through a GSAP ScrollTrigger-pinned section (desktop only: mobile has no pin)
      const range = await pg.evaluate((id) => {
        const t = window.ScrollTrigger?.getAll().find((x) => x.trigger?.id === id);
        return t ? [t.start, t.end] : null;
      }, args.pin);
      if (!range) { console.log(`[${width}px] no ScrollTrigger for #${args.pin} (expected on mobile)`); }
      else for (const [name, f] of [['start', 0.02], ['mid', 0.5], ['end', 0.97]]) {
        await pg.evaluate((y) => window.scrollTo(0, y), range[0] + (range[1] - range[0]) * f);
        await pg.waitForTimeout(wait + 300);
        const file = join(out, `${tag}_${args.pin}_${width}_${name}.png`);
        await pg.screenshot({ path: file });
        console.log(`[${width}px] ${name}: ${file}`);
      }
    } else {
      const file = join(out, `${tag}_${(args.selector ?? 'viewport').replace(/\W+/g, '_')}_${width}.png`);
      if (args.selector) {
        const el = pg.locator(args.selector).first();
        await el.scrollIntoViewIfNeeded();
        await pg.waitForTimeout(800);
        if (args.hover) { const b = await pg.locator(args.hover).first().boundingBox(); await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await pg.waitForTimeout(500); } // centre of the element: works for moving targets
        await el.screenshot({ path: file });
        const h = await el.evaluate((n) => Math.round(n.getBoundingClientRect().height));
        console.log(`[${width}x${height}] ${args.selector} height: ${h}px, ${h <= height ? 'fits' : `overflows viewport by ${h - height}px`}`);
      } else await pg.screenshot({ path: file });
      console.log(`[${width}px] screenshot: ${file}`);
    }
    await pg.close();
  }
} finally {
  await browser.close();
  server.close();
}
