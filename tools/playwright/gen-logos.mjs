/**
 * Generate the Professional Robotics logos (RU + EN, normal + inverse):
 * the extracted mark (assets/profrobot-icon.png) plus an uppercase two-line wordmark
 * rendered in Onest 700 (the site font). The canvas is cropped to the content width.
 *
 * Usage: node tools/playwright/gen-logos.mjs
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const H = 136;
const LANGS = {
  ru: { lines: ['ПРОФЕССИОНАЛЬНАЯ', 'РОБОТОТЕХНИКА'], suffix: '' },
  en: { lines: ['PROFESSIONAL', 'ROBOTICS'], suffix: '-en' },
};
const VARIANTS = {
  normal: { textColor: '#16181c', suffix: '' },
  inverse: { textColor: '#e8e7e3', suffix: '-inverse' },
};

const iconDataUri = `data:image/png;base64,${readFileSync(resolve(root, 'assets/profrobot-icon.png')).toString('base64')}`;

const browser = await chromium.launch();
for (const lang of Object.values(LANGS)) {
  for (const variant of Object.values(VARIANTS)) {
    const page = await browser.newPage({ viewport: { width: 1200, height: H } });
    await page.setContent(`<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { height: ${H}px; background: transparent; }
  .logo { display: inline-flex; align-items: center; height: ${H}px; padding-left: 8px; }
  .icon { width: 130px; height: ${H}px; object-fit: contain; object-position: left center; flex-shrink: 0; }
  .text { font: 700 50px/1.14 'Onest', sans-serif; letter-spacing: 0.02em; color: ${variant.textColor}; margin-left: 40px; white-space: nowrap; }
</style></head>
<body><div class="logo" id="logo"><img class="icon" src="${iconDataUri}"><div class="text">${lang.lines.join('<br>')}</div></div></body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.load("700 50px Onest"));
    await page.evaluate(() => document.fonts.ready);
    if (!(await page.evaluate(() => document.fonts.check('700 50px Onest')))) throw new Error('Onest 700 did not load: the logo would fall back to a system font');
    const width = Math.ceil(await page.evaluate(() => document.getElementById('logo').getBoundingClientRect().width)) + 8;
    const name = `profrobot-logo${lang.suffix}${variant.suffix}.png`;
    const png = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width, height: H } });
    writeFileSync(resolve(root, 'assets', name), png);
    console.log(`✓ assets/${name} ${width}×${H}`);
    await page.close();
  }
}
await browser.close();
