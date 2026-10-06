// Runtime cost of a page: what the main thread does while the page sits idle and while it is scrolled.
//
//   node tools/playwright/perf.mjs --page index.html
//   node tools/playwright/perf.mjs --pages index.html,solutions.html --lang en --widths 1440,390
//   node tools/playwright/perf.mjs --page index.html --root /path/to/older/checkout   # compare with another version
//
// Prints per phase (idle, scroll): main-thread busy time, script time, style recalcs, layouts, long tasks (>50 ms).
// An idle page should be near zero; a steady stream of recalcs/layouts while idle means an endless animation loop.
// Options: --page / --pages, --widths (default 1440), --height (default 900), --lang ru|en (default ru),
//          --idle ms (default 4000), --root (project root to serve, default this checkout),
//          --browser chromium|webkit (default chromium; webkit = Safari engine, frame stats only),
//          --cpu n (chromium: slow the CPU down n times, 4 ≈ a mid-range phone),
//          --layers [n] (chromium: the n biggest composited layers and why they exist).
import { chromium, webkit } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true']);
  return acc;
}, []));
const root = args.root ?? join(here, '..', '..');
const pages = (args.pages ?? args.page ?? 'index.html').split(',');
const widths = (args.widths ?? '1440').split(',').map(Number);
const height = Number(args.height ?? 900);
const idle = Number(args.idle ?? 4000);
const lang = args.lang ?? 'ru';
const engine = args.browser === 'webkit' ? webkit : chromium;
const cdpOn = engine === chromium;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.json': 'application/json', '.mp4': 'video/mp4', '.webm': 'video/webm' };

const server = createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const body = await readFile(join(root, rel));
    res.writeHead(200, { 'content-type': MIME[extname(rel)] ?? 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const METRICS = ['TaskDuration', 'ScriptDuration', 'RecalcStyleCount', 'RecalcStyleDuration', 'LayoutCount', 'LayoutDuration'];
const snapshot = async (cdp) => {
  if (!cdp) return {};
  const { metrics } = await cdp.send('Performance.getMetrics');
  return Object.fromEntries(metrics.filter((m) => METRICS.includes(m.name)).map((m) => [m.name, m.value]));
};
const longTasks = (pg) => pg.evaluate(() => { const l = window.__long.splice(0); return [l.length, Math.round(l.reduce((s, d) => s + d, 0))]; });
// Frame gaps from requestAnimationFrame: works in every engine, shows jank as the user sees it
const frames = (pg) => pg.evaluate(() => { const f = window.__frames.splice(0); return { n: f.length, slow: f.filter((d) => d > 50).length, max: Math.round(Math.max(0, ...f)) }; });
const report = async (label, a, b, ms, pg) => {
  const [n, total] = await longTasks(pg);
  const f = await frames(pg);
  const fr = `frames ${f.n} (${Math.round(f.n * 1000 / ms)} fps), >50 ms: ${f.slow}, worst ${f.max} ms`;
  if (!cdpOn) { console.log(`  ${label.padEnd(6)} ${fr}`); return; }
  const d = (k) => b[k] - a[k];
  console.log(`  ${label.padEnd(6)} ${fr}`);
  console.log(`  ${label.padEnd(6)} busy ${(d('TaskDuration') * 1000 / ms * 100).toFixed(0).padStart(3)}% of ${ms} ms` +
    ` | script ${Math.round(d('ScriptDuration') * 1000)} ms | style recalcs ${d('RecalcStyleCount')} (${Math.round(d('RecalcStyleDuration') * 1000)} ms)` +
    ` | layouts ${d('LayoutCount')} (${Math.round(d('LayoutDuration') * 1000)} ms) | long tasks ${n} (${total} ms)`);
};

const browser = await engine.launch();
try {
  for (const page of pages) for (const width of widths) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    await ctx.addInitScript((l) => {
      try { localStorage.setItem('lang', l); localStorage.setItem('profrobot-lang', l); } catch {}
      window.__long = [];
      try { new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__long.push(e.duration); }).observe({ type: 'longtask', buffered: true }); } catch {}
      window.__frames = [];
      let last = 0;
      const tick = (t) => { if (last) window.__frames.push(t - last); last = t; requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, lang);
    const pg = await ctx.newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    const cdp = cdpOn ? await ctx.newCDPSession(pg) : null;
    await cdp?.send('Performance.enable');
    if (cdp && args.cpu) await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(args.cpu) });
    await pg.goto(`${origin}/${page}${lang === 'en' ? '?lang=en' : ''}`, { waitUntil: 'load' });
    await pg.waitForTimeout(1500);
    console.log(`${page} @ ${width}px, lang ${await pg.evaluate(() => document.documentElement.lang)}${errors.length ? `, errors: ${errors.join(' | ')}` : ''}`);
    await longTasks(pg); await frames(pg); // drop the load-time ones

    // GPU side, which the main-thread metrics below do not show: composited layers and endless animations
    if (cdpOn) {
    let layers = [];
    cdp.on('LayerTree.layerTreeDidChange', (e) => { if (e.layers) layers = e.layers; });
    await cdp.send('LayerTree.enable');
    await pg.waitForTimeout(500);
    const mpx = layers.reduce((s, l) => s + (l.drawsContent ? l.width * l.height : 0), 0) / 1e6;
    const anims = await pg.evaluate(() => {
      const run = document.getAnimations().filter((a) => a.playState === 'running');
      const off = run.filter((a) => { const t = a.effect?.target; const r = t?.getBoundingClientRect?.(); return r && (r.bottom < 0 || r.top > innerHeight); });
      const names = {};
      for (const a of run) { const k = a.animationName || a.constructor.name; names[k] = (names[k] || 0) + 1; }
      return { running: run.length, offscreen: off.length, names };
    });
    console.log(`  layers ${layers.length}, painted ${mpx.toFixed(1)} Mpx (~${Math.round(mpx * 4)} MB GPU)` +
      ` | running animations ${anims.running} (${anims.offscreen} off-screen): ${JSON.stringify(anims.names)}`);
    if (args.layers) { // the biggest layers with the reason Chrome composited them
      const big = layers.filter((l) => l.drawsContent).sort((x, y) => y.width * y.height - x.width * x.height).slice(0, Number(args.layers) || 8);
      for (const l of big) {
        const why = await cdp.send('LayerTree.compositingReasons', { layerId: l.layerId }).catch(() => ({}));
        let node = '';
        if (l.backendNodeId) {
          const { object } = await cdp.send('DOM.resolveNode', { backendNodeId: l.backendNodeId }).catch(() => ({}));
          if (object) node = (await cdp.send('Runtime.callFunctionOn', { objectId: object.objectId, returnByValue: true,
            functionDeclaration: 'function(){const e=this.nodeType===1?this:this.parentElement;return e?e.tagName.toLowerCase()+(e.id?"#"+e.id:"")+(e.className&&typeof e.className==="string"?"."+e.className.trim().split(/\\s+/).join("."):""):""}' })).result.value;
        }
        console.log(`    ${l.width}x${l.height} ${node || '(no node)'} — ${(why.compositingReasonIds || why.compositingReasons || []).join(', ')}`);
      }
    }
    await cdp.send('LayerTree.disable');
    }
    await longTasks(pg); await frames(pg);

    let a = await snapshot(cdp);
    await pg.waitForTimeout(idle);
    await report('idle', a, await snapshot(cdp), idle, pg);

    a = await snapshot(cdp);
    const t0 = Date.now();
    const total = await pg.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 120) { await pg.mouse.wheel(0, 120); await pg.waitForTimeout(16); }
    await report('scroll', a, await snapshot(cdp), Date.now() - t0, pg);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
