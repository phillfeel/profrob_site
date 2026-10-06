/**
 * Generate English versions of PROFROBOT logos (normal + inverse)
 * by compositing the extracted icon with rendered "PROFROBOT" text
 * in the Onest font (same as the site).
 *
 * Usage: node tools/playwright/gen-en-logos.mjs
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

async function generateLogo({ textColor, bgColor, outputName }) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Create an HTML page that renders the logo exactly as needed
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Onest:wght@700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 880px; height: 136px;
      background: ${bgColor};
      display: flex; align-items: center;
      overflow: hidden;
    }
    .icon {
      width: 130px; height: 136px;
      object-fit: contain; object-position: left center;
      flex-shrink: 0;
      margin-left: 8px;
    }
    .text {
      font-family: 'Onest', sans-serif;
      font-weight: 700;
      font-size: 72px;
      color: ${textColor};
      letter-spacing: 0.02em;
      margin-left: 16px;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <img class="icon" src="icon-data-uri">
  <span class="text">PROFROBOT</span>
</body>
</html>`;

  // Read the icon and embed as data URI
  const iconBuf = readFileSync(resolve(root, 'assets/profrobot-icon.png'));
  const iconDataUri = `data:image/png;base64,${iconBuf.toString('base64')}`;
  const finalHtml = html.replace('icon-data-uri', iconDataUri);

  await page.setViewportSize({ width: 880, height: 136 });
  await page.setContent(finalHtml, { waitUntil: 'networkidle' });

  // Wait for the font to load
  await page.waitForFunction(() => document.fonts.ready.then(() => document.fonts.check('700 72px Onest')), { timeout: 5000 }).catch(() => {
    console.warn('Font check timed out, proceeding anyway');
  });
  await page.waitForTimeout(500); // extra safety for font render

  const screenshot = await page.screenshot({
    type: 'png',
    omitBackground: bgColor === 'transparent',
  });

  const outPath = resolve(root, `assets/${outputName}`);
  writeFileSync(outPath, screenshot);
  console.log(`✓ ${outputName} (${screenshot.length} bytes)`);

  await browser.close();
}

// Normal logo (dark text on white/transparent background)
await generateLogo({
  textColor: '#16181c',
  bgColor: 'transparent',
  outputName: 'profrobot-logo-en.png',
});

// Inverse logo (light text on transparent background, for dark sections)
await generateLogo({
  textColor: '#e8e7e3',
  bgColor: 'transparent',
  outputName: 'profrobot-logo-en-inverse.png',
});

console.log('\\nDone! English logos generated.');
