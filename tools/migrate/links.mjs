#!/usr/bin/env node
import playwright from '../playwright/node_modules/playwright/index.js';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
const { chromium }=playwright; const base=process.argv[2]??'http://127.0.0.1:3000';
const map=JSON.parse(await readFile('tools/migrate/url-map.json','utf8')); const routes=[...new Set(Object.values(map).filter(Boolean))];
const browser=await chromium.launch(); const bad=[]; const targets=new Map();
const fetchText=(url)=>new Promise((resolve,reject)=>http.get(url,res=>{let s='';res.setEncoding('utf8');res.on('data',c=>s+=c);res.on('end',()=>resolve({status:res.statusCode??0,body:s}))}).on('error',reject));
try{
 for(const prefix of ['', '/en']) for(const route of routes){const url=base+prefix+(route==='/'?'':route);const p=await browser.newPage();const res=await p.goto(url,{waitUntil:'domcontentloaded'});if(!res||res.status()>=400){bad.push(`${url}: ${res?.status()??'no response'}`);await p.close();continue}for(const href of await p.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>h&&h.startsWith('/')&&!h.startsWith('//')))){const target=new URL(href,base);targets.set(target.pathname+target.search+target.hash,url)}await p.close()}
 for(const [href,from] of targets){const target=new URL(href,base);const rr=await fetchText(new URL(target.pathname+target.search,base).href);if(rr.status!==200&&rr.status!==308){bad.push(`${from} -> ${href}: ${rr.status}`);continue}if(target.hash){const id=target.hash.slice(1);const re=new RegExp(`(?:id|name)=["']${id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']`);if(!re.test(rr.body))bad.push(`${from} -> ${href}: missing anchor`)}}
}finally{await browser.close()}
console.log(bad.length?bad.join('\n'):`links: ${routes.length*2} pages checked, ${targets.size} unique targets, no broken internal links`);process.exitCode=bad.length?1:0;
