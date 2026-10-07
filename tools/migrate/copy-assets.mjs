#!/usr/bin/env node
import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
const inv=JSON.parse(await readFile(resolve('tools/migrate/inventory.json'),'utf8')); const root=resolve('.'); const dest=resolve('site/public'); const used=new Set(inv.pages.flatMap(p=>p.assets)); let missing=0;
for(const ref of [...used].sort()){const rel=ref.replace(/^\.\//,'');const src=join(root,rel);const out=join(dest,rel);try{await mkdir(dirname(out),{recursive:true});await copyFile(src,out);console.log(`copied ${rel}`)}catch{console.error(`missing ${rel}`);missing++}}
console.log(`assets: ${used.size} used, ${missing} missing`);process.exitCode=missing?1:0;
