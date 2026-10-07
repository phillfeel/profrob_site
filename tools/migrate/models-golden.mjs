#!/usr/bin/env node
import assert from 'node:assert/strict';
import legacyRoi from '../../roi-model.js';
import legacyFacade from '../../facade-model.js';
const { TYPES, MODES, calc: roi } = await import('../../site/src/lib/roi-model.ts');
const { SCENARIOS, calc: facade } = await import('../../site/src/lib/facade-model.ts');
const json=(v)=>JSON.stringify(v,(k,x)=>Number.isFinite(x)?x:x===Infinity?'__INF__':x);
let checks=0;
for(const [type,t] of Object.entries(TYPES)) for(const mode of Object.keys(MODES)) for(let i=0;i<10;i++){const area=t.area[0]+(t.area[1]-t.area[0])*i/9;const input={type,area,mode,staff:undefined,wage:undefined,contractor:i%2===0,lease:i%3===0};const a=legacyRoi.calc(input),b=roi(input);assert.equal(json(a),json(b),`ROI mismatch ${type}/${mode}/${i}`);checks++}
for(const [name,sc] of Object.entries(SCENARIOS)) for(let i=0;i<10;i++){const area=2000+(150000-2000)*i/9;const input={area,washes:Math.max(1,Math.min(6,sc.washes)),manualPrice:30+(150-30)*(i/9),wage:80000+(200000-80000)*(i/9)};const a=legacyFacade.calc(input),b=facade(input);assert.equal(json(a),json(b),`Facade mismatch ${name}/${i}`);checks++}
console.log(`models-golden: ${checks} cases OK`);
