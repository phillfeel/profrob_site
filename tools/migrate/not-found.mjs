#!/usr/bin/env node
// 404 contract (spec 3.3), checked on the server HTML without scripts: an address that is not a page of the site answers
// 404, with noindex, <html lang>, <title> and the text in the language of the address (/en/... English, the rest Russian).
//   node tools/migrate/not-found.mjs [http://127.0.0.1:3000]
import { readFile } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://127.0.0.1:3000';
const dict = Object.fromEntries(await Promise.all(['ru', 'en'].map(async (l) => [l, JSON.parse(await readFile(`site/src/messages/${l}.json`, 'utf8')).notFound])));
const cases = [['/nope/', 'ru'], ['/en/nope/', 'en'], ['/industries/nope/', 'ru'], ['/en/knowledge/zzz/', 'en'], ['/en/industries/nope/', 'en'], ['/knowledge/zzz/', 'ru']];
let bad = 0;
for (const [path, lang] of cases) {
  const res = await fetch(new URL(path, base), { redirect: 'manual' });
  const html = await res.text();
  const visible = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
  const d = dict[lang];
  const title = /<title>([^<]*)<\/title>/.exec(visible)?.[1];
  const errors = [];
  if (res.status !== 404) errors.push(`status ${res.status}`);
  if (!new RegExp(`<html lang="${lang}"`).test(visible)) errors.push(`html lang is not ${lang}`);
  if (title !== d.meta.title) errors.push(`title ${JSON.stringify(title)}`);
  if ((visible.match(/<meta name="robots" content="noindex"\/?>/g) ?? []).length !== 1) errors.push('robots noindex is not exactly once');
  if (!visible.includes(d.title)) errors.push(`no heading text "${d.title}"`);
  if (lang === 'en' && /[Ѐ-ӿ]/.test(visible)) errors.push('Cyrillic in the English 404');
  if (lang === 'ru' && visible.includes(dict.en.title)) errors.push('English heading in the Russian 404');
  console.log(`${errors.length ? 'FAIL' : 'ok  '} ${path} -> ${res.status} lang=${lang} title=${JSON.stringify(title)}${errors.length ? ` :: ${errors.join('; ')}` : ''}`);
  if (errors.length) bad++;
}
process.exit(bad ? 1 : 0);
