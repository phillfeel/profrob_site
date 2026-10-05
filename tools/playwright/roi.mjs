// Interaction checks for the ROI calculator (roi.html): facade washing and floor cleaning behind one switch.
//
//   node tools/playwright/roi.mjs
//
// - no console/page errors and no horizontal overflow at 1440 and 390;
// - facade calculator opens by default, the switch shows the floor one and back, the URL follows;
// - old links with ?t= (industry pages) open floor cleaning;
// - facade inputs recompute; «с рамами» swaps the plate for the audit warning; a small object shows «Не окупается».
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
const base = `http://127.0.0.1:${server.address().port}/roi.html`;

const fails = [];
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg); };
const visible = (pg, sel) => pg.locator(sel).isVisible();
const text = (pg, sel) => pg.locator(sel).textContent();
const query = (pg) => pg.evaluate(() => Object.fromEntries(new URLSearchParams(location.search)));

const browser = await chromium.launch();
try {
  for (const width of [1440, 390]) {
    const pg = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    pg.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await pg.goto(base);
    await pg.waitForTimeout(400);
    const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(!errors.length && overflow === 0, `@${width}: errors ${errors.length ? JSON.stringify(errors) : 'none'}, overflow ${overflow}px`);
    await pg.close();
  }

  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pg.goto(base);
  await pg.waitForTimeout(400);
  check(await visible(pg, '#facade-form') && !(await visible(pg, '#roi-form')), 'facade calculator opens by default');
  check(await pg.locator('.seg--calc [data-v="facade"]').getAttribute('aria-checked') === 'true', 'switch marks «Мойка фасадов»');
  check((await text(pg, '#ctx')).startsWith('Фасад'), `context line is facade: ${await text(pg, '#ctx')}`);

  // Ползунок цены пересчитывает экономию
  const net0 = await text(pg, '#r-net');
  await pg.locator('#fa-price').fill('90');
  await pg.locator('#fa-price').dispatchEvent('input');
  await pg.waitForTimeout(600);
  check(await text(pg, '#r-net') !== net0, `price 90 ₽ recomputes savings (${net0} → ${await text(pg, '#r-net')})`);
  await pg.waitForTimeout(400);
  check((await query(pg)).p === '90' && (await query(pg)).k === 'facade', `URL carries facade state: ${JSON.stringify(await query(pg))}`);

  // Рамы: вместо окупаемости предупреждение
  await pg.locator('.seg[data-name="glass"] [data-v="frames"]').click();
  check((await text(pg, '#r-plate-v')) === 'Нужен аудит фасада', 'frames show the audit warning');
  check(await pg.locator('#roi-out').evaluate((n) => n.classList.contains('is-unfit')), 'results are dimmed for frames');
  await pg.locator('.seg[data-name="glass"] [data-v="flat"]').click();

  // Клавиатура: стрелка вправо по числу моек
  await pg.locator('.seg[data-name="washes"] [aria-checked="true"]').focus();
  await pg.keyboard.press('ArrowRight');
  check(await pg.locator('.seg[data-name="washes"] [data-v="3"]').getAttribute('aria-checked') === 'true', 'ArrowRight moves washes 2 → 3');

  // Переключение на уборку и обратно
  await pg.locator('.seg--calc [data-v="floor"]').click();
  await pg.waitForTimeout(400);
  check(await visible(pg, '#roi-form') && !(await visible(pg, '#facade-form')) && await visible(pg, '.roi-crew'), 'switch shows floor calculator');
  check((await query(pg)).k === 'floor' && !!(await query(pg)).t, `URL switches to floor: ${JSON.stringify(await query(pg))}`);
  check((await text(pg, '#r-k2-l')) === 'Ставок уходит с полов', 'floor KPI label restored');
  await pg.locator('.seg--calc [data-v="facade"]').click();
  check((await pg.locator('#fa-price').inputValue()) === '90', 'facade inputs survive the round trip');
  await pg.close();

  // Старая ссылка с отраслевой страницы
  const old = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await old.goto(`${base}?t=hotel&a=10000&m=one`);
  await old.waitForTimeout(400);
  check(await visible(old, '#roi-form') && (await text(old, '#ctx')).startsWith('Отель'), 'old ?t=hotel link opens floor cleaning');
  await old.close();

  // Малый объект: не окупается
  const small = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await small.goto(`${base}?k=facade&ga=8000&n=2&p=60`);
  await small.waitForTimeout(400);
  check((await text(small, '#r-plate-v')) === 'Не окупается', `8 000 м² × 2 shows «Не окупается»: ${await text(small, '#r-plate-v')}`);
  await small.close();
} finally {
  await browser.close();
  server.close();
}
if (fails.length) { console.log(`\n${fails.length} failed`); process.exit(1); }
console.log('\nall passed');
