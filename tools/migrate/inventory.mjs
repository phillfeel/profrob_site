#!/usr/bin/env node
import { readFile, readdir, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, resolve, relative, dirname } from 'node:path';
import { parse, elements, attr, hasAttr, decode, lineOf } from '../i18n/html.mjs';

const argv = process.argv.slice(2);
const get = (name) => { const i = argv.indexOf(`--${name}`); return i === -1 ? undefined : argv[i + 1]; };
const root = resolve(get('root') ?? '.');
const out = resolve('tools/migrate/inventory.json');
const doc = resolve('docs/migration/INVENTORY.md');

const fixedUrls = new Map([
  ['index.html', '/'], ['roi.html', '/roi/'], ['privacy.html', '/privacy/'], ['consent.html', '/consent/'], ['404.html', null],
]);
const slugRules = [
  [/^industries-(.+)\.html$/, (m) => `/industries/${m[1]}/`],
  [/^solutions-(.+)\.html$/, (m) => `/solutions/${m[1]}/`],
  [/^knowledge-(.+)\.html$/, (m) => `/knowledge/${m[1]}/`],
];

function targetUrl(file, rootNode) {
  if (fixedUrls.has(file)) return fixedUrls.get(file);
  const canonical = [...elements(rootNode)].find((e) => e.tag === 'link' && attr(e, 'rel')?.split(/\s+/).includes('canonical'));
  const href = canonical && attr(canonical, 'href');
  if (href) return href;
  for (const [re, fn] of slugRules) { const m = re.exec(file); if (m) return fn(m); }
  return `/${file.replace(/\.html$/, '')}/`;
}

async function pageParams(scripts) {
  const params = new Set();
  for (const src of scripts) {
    if (!src || /^https?:\/\//i.test(src)) continue;
    try {
      const text = await requireText(src);
      for (const m of text.matchAll(/(?:URLSearchParams|searchParams|location\.search)[^\n]{0,180}/g)) {
        for (const q of m[0].matchAll(/[?&]([A-Za-z][A-Za-z0-9_-]*)=|\.get\(['"]([^'"]+)['"]\)/g)) params.add(q[1] ?? q[2]);
      }
    } catch {}
  }
  return [...params].sort();
}

const cache = new Map();
function requireText(src) {
  const key = join(root, src);
  if (!cache.has(key)) cache.set(key, requireFile(key));
  return cache.get(key);
}
async function requireFile(path) { return await readFile(path, 'utf8'); }

function attrMap(el) { return Object.fromEntries(el.attrs.map((a) => [a.name, a.value === null ? '' : decode(a.value)])); }
function inlineSummary(el, source) {
  const body = el.children?.filter((n) => n.type === 'text').map((n) => n.value).join(' ').replace(/\s+/g, ' ').trim() ?? '';
  return { line: lineOf(source, el.start), chars: body.length, hasDocumentWrite: /document\.write\s*\(/.test(source.slice(el.start, el.end)) };
}
function linksAndAnchors(rootNode) {
  const links = [], anchors = new Set();
  for (const el of elements(rootNode)) {
    if (el.tag === 'a') { const href = attr(el, 'href'); if (href) links.push(href); }
    const id = attr(el, 'id'); if (id) anchors.add(id);
  }
  return { links, anchors: [...anchors].sort() };
}
function normalizeInternal(href) {
  if (!href || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) return null;
  return href.split('#')[0].split('?')[0];
}

async function inventory() {
  const files = (await readdir(root)).filter((f) => f.endsWith('.html')).sort();
  const pages = [];
  const allTargets = new Map();
  const allAnchors = new Map();
  for (const file of files) {
    const source = await readFile(join(root, file), 'utf8');
    const tree = parse(source);
    const els = [...elements(tree)];
    const css = [], js = [], cdn = [], inline = [];
    for (const el of els) {
      if (el.tag === 'link' && /\bstylesheet\b/i.test(attr(el, 'rel') ?? '')) css.push(attr(el, 'href') ?? '');
      if (el.tag === 'script') {
        const src = attr(el, 'src');
        if (src) { ( /^https?:\/\//i.test(src) ? cdn : js).push(src); }
        else if ((el.end - el.openEnd) > 0) inline.push(inlineSummary(el, source));
      }
    }
    const forms = els.filter((e) => e.tag === 'form').map((e) => ({ id: attr(e, 'id') ?? null, source: attr(e, 'data-source') ?? null, endpoint: attr(e, 'data-endpoint') ?? null }));
    const attrs = els.filter((e) => hasAttr(e, 'data-i18n') || hasAttr(e, 'data-i18n-html') || hasAttr(e, 'data-i18n-attr') || hasAttr(e, 'data-i18n-args'));
    const la = linksAndAnchors(tree);
    const target = targetUrl(file, tree);
    allTargets.set(file, target);
    allAnchors.set(target, new Set(la.anchors));
    const assets = [...new Set(els.flatMap((e) => ['src', 'href'].map((n) => attr(e, n)).filter(Boolean)).filter((v) => /^(?:\.?\/?assets\/|assets\/)/.test(v)))].sort();
    pages.push({ file, url: target, generated: /^industries-(?!hub)/.test(file) || /^solutions-/.test(file), css, js, cdn, inlineScripts: inline, jsonLd: els.some((e) => e.tag === 'script' && attr(e, 'type') === 'application/ld+json'), robots: els.some((e) => e.tag === 'meta' && (attr(e, 'name') ?? '').toLowerCase() === 'robots'), forms, queryParams: await pageParams(js), assets, i18nAttributes: attrs.length, footNav: source.includes('<!-- foot-nav:start -->'), documentWrite: /document\.write\s*\(/.test(source), hasBase: els.some((e) => e.tag === 'base'), links: la.links, anchors: la.anchors });
  }
  const byFile = new Map(pages.map((p) => [p.file, p]));
  const broken = [], missing = [];
  for (const p of pages) for (const href of p.links) {
    const path = normalizeInternal(href);
    if (!path) continue;
    let file = path === '/' ? 'index.html' : path.replace(/^\//, '').replace(/\/$/, '') + '.html';
    if (path.endsWith('.html')) file = path.replace(/^\//, '');
    const targetPage = byFile.get(file);
    if (!targetPage) { broken.push({ from: p.file, href, reason: 'missing page' }); continue; }
    const hash = href.includes('#') ? href.split('#')[1] : null;
    if (hash && !targetPage.anchors.includes(hash)) broken.push({ from: p.file, href, reason: 'missing anchor' });
  }
  const knownAssets = new Set();
  for (const p of pages) for (const a of p.assets) knownAssets.add(a.replace(/^\.\//, ''));
  for (const a of knownAssets) { try { await readFile(join(root, a)); } catch { missing.push(a); } }
  return { root: '.', pages, brokenLinks: broken, missingFiles: missing, pageCount: pages.length };
}

const result = await inventory();
await mkdir(dirname(out), { recursive: true });
await mkdir(dirname(doc), { recursive: true });
await writeFile(out, JSON.stringify(result, null, 2) + '\n');
const lines = ['# Legacy inventory', '', `Pages: **${result.pageCount}**`, '', '| File | URL | CSS | JS | Generated | i18n attrs | Foot nav | JSON-LD | Robots | Forms | Params |', '|---|---|---:|---:|:---:|---:|:---:|:---:|:---:|---:|---|'];
for (const p of result.pages) lines.push(`| \`${p.file}\` | \`${p.url ?? '404 only'}\` | ${p.css.length} | ${p.js.length} | ${p.generated ? 'yes' : 'no'} | ${p.i18nAttributes} | ${p.footNav ? 'yes' : 'no'} | ${p.jsonLd ? 'yes' : 'no'} | ${p.robots ? 'yes' : 'no'} | ${p.forms.length} | ${p.queryParams.length ? p.queryParams.join(', ') : '—'} |`);
lines.push('', '## Validation', '', `- Broken internal links/anchors: **${result.brokenLinks.length}**`, `- Missing referenced assets/files: **${result.missingFiles.length}**`, '', '### Broken links', '');
if (result.brokenLinks.length) for (const x of result.brokenLinks) lines.push(`- \`${x.from}\` → \`${x.href}\` (${x.reason})`); else lines.push('- None.');
lines.push('', '### Missing files', '');
if (result.missingFiles.length) for (const x of result.missingFiles) lines.push(`- \`${x}\``); else lines.push('- None.');
await writeFile(doc, lines.join('\n') + '\n');
console.log(`inventory: ${result.pageCount} pages, ${result.brokenLinks.length} broken links, ${result.missingFiles.length} missing files`);

const diffTag = get('diff');
if (diffTag) {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  const changed = (await run('git', ['diff', '--name-status', `${diffTag}..HEAD`, '--', '*.html', 'styles.css', '*.css', '*.js', 'i18n/*.json', 'tools/industries', 'tools/site'])).stdout.trim();
  console.log(`\nDiff from ${diffTag}:`); console.log(changed || 'none');
}
