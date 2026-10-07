#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import routeMap from './url-map.json' with { type: 'json' };

const argv=process.argv.slice(2); const get=(n)=>{const i=argv.indexOf(`--${n}`);return i<0?undefined:argv[i+1]};
const input=get('input')??argv[0]; const output=get('output');
if(!input){console.error('usage: html-to-jsx.mjs --input page.html [--output page.tsx]');process.exit(2)}
let s=await readFile(resolve(input),'utf8'); s=s.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]??s;
s=s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<!--[\s\S]*?-->/g,'');
s=s.replace(/(?<![\w/:])assets\//g,'/assets/');
s=s.replace(/(href=["'])([^"']+)(["'])/g,(m,a,v,z)=>{if(!routeMap[v]){const b=v.split(/[?#]/)[0];const dest=routeMap[b];if(dest)return a+dest+v.slice(b.length)+z;return m}return a+routeMap[v]+z});
s=s.replace(/\bclass=/g,'className=').replace(/\bfor=/g,'htmlFor=').replace(/\btabindex=/g,'tabIndex=');
s=s.replace(/\bdisabled(?![=])/g,'disabled={true}').replace(/\bchecked(?![=])/g,'checked={true}');
s=s.replace(/<!-- foot-nav:start -->[\s\S]*?<!-- foot-nav:end -->/g,'<FooterNav />');
s=s.replace(/\bdata-i18n-attr="([^"]+)"/g,(_,spec)=>spec.split(';').map((x)=>x.split(':')[0]+'={t("'+x.split(':')[1]+'")}').join(' '));
s=s.replace(/\bdata-i18n="([^"]+)"/g,'data-i18n-key="$1"');
const out=`import type { ReactNode } from "react";\n\nexport default function ${basename(input,'.html').replace(/[^A-Za-z0-9]/g,'_')}Body({ t }: { t: (key: string) => string }): ReactNode {\n  return (\n    <>\n${s.split('\n').map((x)=>'      '+x).join('\n')}\n    </>\n  );\n}\n`;
if(output) await writeFile(resolve(output),out); else process.stdout.write(out);
