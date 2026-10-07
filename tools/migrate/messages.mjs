#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { parse, collect } from '../i18n/icu.mjs';
const ru=JSON.parse(await readFile('site/src/messages/ru.json','utf8'));const en=JSON.parse(await readFile('site/src/messages/en.json','utf8'));
const flat=(o,p='',r={})=>{for(const[k,v]of Object.entries(o)){const q=p?p+'.'+k:k;if(v&&typeof v==='object')flat(v,q,r);else r[q]=String(v)}return r};
const R=flat(ru),E=flat(en);const missing=Object.keys(R).filter(k=>!(k in E)),extra=Object.keys(E).filter(k=>!(k in R));const cyr=Object.entries(E).filter(([,v])=>/[Ѐ-ӿ]/.test(v));const mismatch=[];
for(const k of Object.keys(R)){if(!(k in E))continue;try{const a=collect(parse(R[k])),b=collect(parse(E[k]));const av=[...a.vars.keys()].sort().join(',');const bv=[...b.vars.keys()].sort().join(',');const at=[...a.tags].sort().join(',');const bt=[...b.tags].sort().join(',');if(av!==bv||at!==bt)mismatch.push(`${k}: vars ${av}/${bv}, tags ${at}/${bt}`)}catch(e){mismatch.push(`${k}: ${e.message}`)}}
const bad=[...missing.map(k=>`missing EN: ${k}`),...extra.map(k=>`extra EN: ${k}`),...cyr.map(([k])=>`Cyrillic in EN: ${k}`),...mismatch.map(x=>`variables/tags differ: ${x}`)];
console.log(`messages: ${Object.keys(R).length} RU / ${Object.keys(E).length} EN`);if(bad.length){console.error(bad.join('\n'));process.exit(1)}console.log('messages: key parity, ICU variables/tags, and EN Cyrillic checks OK');

// Rendered English pages (after `next build`): no raw ICU left in the visible HTML, no Russian words outside the legal
// pages (their Russian text is a legacy fact: only the Russian version of those documents is legally valid).
// <script> (RSC payload with the whole dictionary, JSON-LD) and <style> are not part of the check.
const renderedDir = 'site/.next/server/app/en';
const walk = async (d) => (await Promise.all((await readdir(d, { withFileTypes: true })).map((e) => (e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith('.html') ? [join(d, e.name)] : [])))).flat();
if (await stat(renderedDir).then(() => true, () => false)) {
  const LEGAL = /\/(privacy|consent)\.html$/;
  const problems = [];
  const pages = [...(await walk(renderedDir)), 'site/.next/server/app/en.html']; // en.html is the English home page
  for (const f of pages) {
    const visible = (await readFile(f, 'utf8')).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
    const raw = visible.match(/\{[a-z]+[,}][^<>]{0,60}|plural,|selectordinal,/gi);
    if (raw) problems.push(`${f}: raw ICU in rendered English HTML: ${raw.slice(0, 3).join(' | ')}`);
    const cyr = visible.match(/[Ѐ-ӿ]+/g);
    if (cyr && !LEGAL.test(f)) problems.push(`${f}: ${cyr.length} Cyrillic words in rendered English HTML, e.g. ${cyr.slice(0, 3).join(' ')}`);
  }
  if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
  console.log(`rendered English HTML: ${pages.length} files, no raw ICU, no Cyrillic outside privacy/consent`);
} else console.log('rendered English HTML: skipped (no site/.next build)');
