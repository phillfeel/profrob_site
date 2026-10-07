#!/usr/bin/env node
// Brings the server-rendered English bodies (site/src/content/*-body-en.html) to what the legacy English runtime
// (public/legacy/i18n.js + the page scripts) shows once it has run:
//   1. elements with data-i18n-args whose text is still a raw ICU message ("{n} {n, plural, one {area} other {areas}}")
//      are formatted with the same engine as the legacy runtime (tools/i18n/icu.mjs, locale en); tags of the message take
//      the attributes of the Russian element (<b> -> <b class="tnum">), as the runtime's "pool" does;
//   2. the language switcher says English is the pressed one (aria-pressed), and tags of the English text keep the class they
//      have in the Russian body (the runtime does the same through its "pool"): <b class="tnum">10–15 min</b>;
//   3. initial values of the industry mini-calculator and of the ROI headline, which the page scripts would otherwise
//      replace only after load, get the English units and number format.
// Idempotent: a body without raw ICU or Russian units is left untouched.
//   node tools/migrate/localize-en-bodies.mjs [--check]     (--check: exit 1 if any file would change, write nothing)
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse, format } from '../i18n/icu.mjs';

const check = process.argv.includes('--check');
const dir = 'site/src/content';
const dict = JSON.parse(await readFile('site/src/messages/en.json', 'utf8'));
const msg = (key) => key.split('.').reduce((o, k) => o?.[k], dict) ?? (() => { throw new Error(`en.json has no ${key}`); })();
const fmt = (key, args) => format(parse(msg(key)), args, 'en');
const ARGS_EL = /<(\w+)((?:\s[^>]*?)?\sdata-i18n-args='([^']*)'[^>]*)>([\s\S]*?)<\/\1>/g;

/** Opening tags of the Russian inner HTML, per tag name, in order. */
const pool = (html) => {
  const p = {};
  for (const m of html.matchAll(/<(\w+)((?:\s[^>]*)?)>/g)) (p[m[1]] ??= []).push(m[2]);
  return p;
};

const files = (await readdir(dir)).filter((f) => f.endsWith('-body-en.html')).sort();
let changed = 0;
for (const f of files) {
  const before = await readFile(join(dir, f), 'utf8');
  const ru = await readFile(join(dir, f.replace('-body-en.html', '-body.html')), 'utf8');
  const ruEls = [...ru.matchAll(ARGS_EL)];
  let i = -1;
  let s = before.replace(ARGS_EL, (all, tag, attrs, json, inner) => {
    i++;
    if (!/[{}]/.test(inner)) return all;
    const ruEl = ruEls[i];
    if (!ruEl || ruEl[3] !== json) throw new Error(`${f}: element #${i} (${tag}, ${json}) does not match the Russian body`);
    const attrsOf = pool(ruEl[4]);
    const text = format(parse(inner), JSON.parse(json), 'en').replace(/<(\w+)>/g, (_, name) => `<${name}${(attrsOf[name] ?? []).shift() ?? ''}>`);
    if (/[{}]|&(?!#?\w+;)/.test(text)) throw new Error(`${f}: element #${i} is still not plain after formatting: ${text}`);
    return `<${tag}${attrs}>${text}</${tag}>`;
  });
  // Language switcher: the English page has EN pressed.
  s = s.replace(/(data-lang="ru" aria-pressed=)"true"/g, '$1"false"').replace(/(data-lang="en" aria-pressed=)"false"/g, '$1"true"');
  // Classes of the Russian tags. Only when both bodies have the same sequence of tag names, so that the n-th tags correspond.
  const OPEN = /<([a-zA-Z][\w-]*)((?:\s[^>]*)?)>/g;
  const stripped = (h) => h.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (m) => ' '.repeat(m.length));
  const ruTags = [...stripped(ru).matchAll(OPEN)], enTags = [...stripped(s).matchAll(OPEN)];
  if (ruTags.length === enTags.length && ruTags.every((t, k) => t[1] === enTags[k][1])) {
    const cls = (attrs) => /\sclass="([^"]*)"/.exec(attrs)?.[1] ?? '';
    let out = '', last = 0;
    enTags.forEach((t, k) => {
      const want = cls(ruTags[k][2]);
      if (cls(t[2]) === want) return;
      const attrs = want ? (/\sclass="[^"]*"/.test(t[2]) ? t[2].replace(/\sclass="[^"]*"/, ` class="${want}"`) : `${t[2]} class="${want}"`) : t[2].replace(/\sclass="[^"]*"/, '');
      out += s.slice(last, t.index) + `<${t[1]}${attrs}>`;
      last = t.index + t[0].length;
    });
    s = out + s.slice(last);
  }
  // Mini-calculator initial values (industries): "6 000 м²", "≈ 15 мес", "≈ 1,8 млн ₽" -> English messages of js.industry.area etc.
  const num = (x) => Number(x.replace(/[\s ]/g, '').replace(',', '.'));
  s = s.replace(/(<input id="calc-area"[^>]*?) aria-valuetext="([\d\s\u00a0]+)[\s\u00a0]м²"([^>]*>)(<output[^>]*data-out="area">)[^<]*(<\/output>)/g,
    (_, a, n, b, o, c) => { const t = fmt('js.industry.area', { n: num(n) }); return `${a} aria-valuetext="${t}"${b}${o}${t}${c}`; });
  s = s.replace(/(data-out="payback">)≈[\s\u00a0](\d+)[\s\u00a0]мес(<)/g, (_, a, n, z) => `${a}${fmt('industries.common.calc.months', { n: Number(n) })}${z}`);
  s = s.replace(/(data-out="net">)≈[\s\u00a0]([\d,]+)[\s\u00a0]млн[\s\u00a0]₽(<)/g, (_, a, n, z) => `${a}${fmt('industries.common.calc.millions', { n: num(n) })}${z}`);
  // ROI headline: the page script writes the amount in #r-net and the words around it in a small "pre" label and #r-net-u.
  s = s.replace(/(<span id="r-net">[^<]*<\/span>)<small id="r-net-u">млн[\s\u00a0]₽<\/small>/g, (_, net) => {
    const [pre, post] = fmt('js.roi.money.mln', { sign: '', n: '\u0000' }).split('\u0000');
    return `${pre.trim() ? `<small id="r-net-p" class="pre">${pre.trim()}</small>` : ''}${net}<small id="r-net-u">${post.trim()}</small>`;
  });
  if (s !== before) {
    changed++;
    console.log(`${check ? 'would change' : 'fixed'} ${f}`);
    if (!check) await writeFile(join(dir, f), s);
  }
}
console.log(`${files.length} English bodies checked, ${changed} ${check ? 'need' : 'got'} changes`);
process.exit(check && changed ? 1 : 0);
