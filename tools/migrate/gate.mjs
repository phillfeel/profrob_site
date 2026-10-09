#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';
const argv=process.argv.slice(2);const only=argv.includes('--only')?argv[argv.indexOf('--only')+1]:null;const site=resolve('site');const run=(cmd,args,cwd='.')=>{console.log(`\n$ ${cmd} ${args.join(' ')}`);const r=spawnSync(cmd,args,{cwd,stdio:'inherit'});return r.status??1};
const results=[];const step=(name,cmd,args,cwd='.')=>{const code=run(cmd,args,cwd);results.push([name,code]);return code===0};
step('tsc','npx',['tsc','--noEmit'],site);step('eslint','npm',['run','lint'],site);step('unit','node',['--test','roi-model.test.js','facade-model.test.js','tools/i18n/icu.test.mjs']);step('models-golden','node',['tools/migrate/models-golden.mjs']);step('en-bodies','node',['tools/migrate/localize-en-bodies.mjs','--check']);
if(!step('build','npm',['run','build'],site)){console.table(results);process.exit(1)}
await cp(resolve('site/public'),resolve('site/.next/standalone/public'),{recursive:true});
await cp(resolve('site/.next/static'),resolve('site/.next/standalone/.next/static'),{recursive:true});
const server=spawn('node',['server.js'],{cwd:resolve('site/.next/standalone'),stdio:'ignore'});await new Promise(r=>setTimeout(r,1200));
try{step('links','node',['tools/migrate/links.mjs','http://127.0.0.1:3000']);step('messages+rendered-en','node',['tools/migrate/messages.mjs']);step('not-found','node',['tools/migrate/not-found.mjs','http://127.0.0.1:3000']);step('lang-switch','node',['tools/playwright/lang-next.mjs','--base-url','http://127.0.0.1:3000']);step('meta-parity','node',['tools/playwright/meta-parity.mjs','--base-url','http://127.0.0.1:3000']);const map=resolve('tools/migrate/url-map.json');step('snapshot-ru','node',['tools/playwright/snapshot.mjs','--base-url','http://127.0.0.1:3000','--map',map,'--out','.migrate/next-ru']);step('snapshot-en','node',['tools/playwright/snapshot.mjs','--base-url','http://127.0.0.1:3000','--map',map,'--locale','en','--out','.migrate/next-en']);
const probes=['/','/en/','/products/','/en/products/','/about/','/en/about/','/nope/','/en/nope/'];for(const p of probes){const r=spawnSync('node',['-e',`require('http').get({hostname:'127.0.0.1',port:3000,path:${JSON.stringify(p)}},r=>{process.exit(r.statusCode>=400&&${p.includes('nope')}?0:(r.statusCode===200&&!${p.includes('nope')}?0:1))}).on('error',()=>process.exit(1))`]);results.push([`http ${p}`,r.status??1])}}
finally{server.kill('SIGTERM')}
console.log('\nGATE');console.table(results.map(([name,code])=>({step:name,status:code===0?'OK':`FAIL ${code}`})));process.exit(results.some(([,c])=>c!==0)?1:0)
