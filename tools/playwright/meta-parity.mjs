// Head metadata parity: legacy pages (static copy, English through the real runtime) against the Next site
// (server HTML only, scripts off), for every route in tools/migrate/url-map.json, Russian and English.
//
//   node tools/playwright/meta-parity.mjs --legacy ../legacy-baseline-2 --base-url http://127.0.0.1:3000 [--map tools/migrate/url-map.json] [--show /roi/]
// --show <route> also prints the compared head of that route (legacy side) in both languages.
//
// Compared: <html lang>, <title>, every <meta> (name/property/http-equiv -> content), canonical, the Google Fonts
// <link> tags (preconnect + stylesheet, with crossorigin) and the JSON-LD blocks (parsed, order-independent).
// <link rel="icon"> is reported separately (legacy has none; the Next site has favicon.ico/icon/apple-icon): "extra".
// Canonical is compared by pathname: the Next site resolves the legacy relative canonical against metadataBase.
// Sanctioned SEO deviations of 2026-10-09 (DEVIATIONS.md) are tolerated: RU robots flip noindex -> "index, follow"
// and the og:*/twitter:* share tags the Next site adds everywhere. The legacy og copy (/roi) must still match.
// Exit code 1 if anything else differs.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i > -1 ? argv[i + 1] : d; };
const legacyRoot = resolve(opt('legacy', '../legacy-baseline-2'));
const baseUrl = opt('base-url', 'http://127.0.0.1:3000');
const routeMap = JSON.parse(await readFile(resolve(opt('map', 'tools/migrate/url-map.json')), 'utf8'));

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    res.writeHead(200, { 'content-type': MIME[extname(rel)] ?? 'application/octet-stream' }).end(await readFile(join(legacyRoot, rel)));
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const legacyBase = `http://127.0.0.1:${server.address().port}`;

// Runs inside a page: the head as a list of comparable strings.
const extract = () => {
  const out = [`lang=${document.documentElement.lang}`, `title=${document.title}`];
  const extra = [];
  for (const m of document.head.querySelectorAll('meta')) {
    if (m.hasAttribute('charset')) continue;
    const key = m.getAttribute('name') ?? m.getAttribute('property') ?? m.getAttribute('http-equiv');
    out.push(`meta ${m.hasAttribute('property') ? 'property' : 'name'}=${key} content=${m.getAttribute('content')}`);
  }
  for (const l of document.head.querySelectorAll('link')) {
    const rel = l.getAttribute('rel');
    if (rel === 'canonical') out.push(`canonical=${l.getAttribute('href').replace(/^https?:\/\/[^\/]+/, '')}`);
    else if (rel === 'preconnect' || (rel === 'stylesheet' && /fonts\.googleapis/.test(l.href))) out.push(`link rel=${rel} href=${l.getAttribute('href')} crossorigin=${l.getAttribute('crossorigin')}`);
    else if (/icon/.test(rel ?? '')) extra.push(`link rel=${rel} href=${l.getAttribute('href').replace(/\?.*/, '')}`);
  }
  for (const s of document.querySelectorAll('script[type="application/ld+json"]')) out.push(`jsonld=${JSON.stringify(JSON.parse(s.textContent))}`);
  return { head: out.sort(), extra };
};

const browser = await chromium.launch();
let bad = 0, total = 0;
const extras = new Set();
try {
  for (const lang of ['ru', 'en']) {
    const legacyCtx = await browser.newContext();
    await legacyCtx.addInitScript((l) => { try { localStorage.setItem('lang', l); } catch { /* private mode */ } }, lang);
    const nextCtx = await browser.newContext({ javaScriptEnabled: false });
    for (const [file, route] of Object.entries(routeMap)) {
      total++;
      const lp = await legacyCtx.newPage();
      await lp.goto(`${legacyBase}/${file}`, { waitUntil: 'domcontentloaded' });
      await lp.evaluate(() => (window.i18n ? window.i18n.ready : null));
      const want = await lp.evaluate(extract);
      await lp.close();
      const res = await nextCtx.request.get(new URL(lang === 'en' ? `/en${route}` : route, baseUrl).toString());
      const np = await nextCtx.newPage();
      await np.setContent(await res.text(), { waitUntil: 'commit' });
      const got = await np.evaluate(extract);
      await np.close();
      if (opt('show') === route) console.log(`${lang} ${route}\n  ${want.head.map((x) => x.slice(0, 110)).join('\n  ')}`);
      got.extra.forEach((e) => extras.add(e));
      const missing = want.head.filter((x) => !got.head.includes(x));
      const added = got.head.filter((x) => !want.head.includes(x))
        .filter((x) => !x.startsWith('meta property=og:') && !x.startsWith('meta name=twitter:') && x !== 'meta name=robots content=index, follow');
      if (res.status() !== 200 || missing.length || added.length) {
        bad++;
        console.log(`DIFF ${lang} ${route} (HTTP ${res.status()})`);
        missing.forEach((x) => console.log(`   legacy only: ${x.slice(0, 200)}`));
        added.forEach((x) => console.log(`   next only:   ${x.slice(0, 200)}`));
      }
    }
    await legacyCtx.close(); await nextCtx.close();
  }
} finally { await browser.close(); server.close(); }
for (const e of extras) console.log(`extra (not compared): ${e}`);
console.log(bad ? `${bad} of ${total} page/language pairs differ` : `all ${total} page/language pairs identical`);
process.exit(bad ? 1 : 0);
