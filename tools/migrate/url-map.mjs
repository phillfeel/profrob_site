#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
const inventory = JSON.parse(await readFile('tools/migrate/inventory.json', 'utf8'));
const map = Object.fromEntries(inventory.pages.filter((p) => p.url).map((p) => [p.file, p.url]));
await writeFile('tools/migrate/url-map.json', JSON.stringify(map, null, 2) + '\n');
console.log(`url-map: ${Object.keys(map).length} routes`);
