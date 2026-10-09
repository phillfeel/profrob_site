#!/usr/bin/env node
// Generates the SEO/share assets of the Next.js site from the brand sources in /assets (owner decision, 2026-10-09):
//   site/src/app/favicon.ico                        - 16/32/48 px BMP entries (universal browser support)
//   site/src/app/(localized)/[locale]/icon.png      - 32x32 tab icon (Next file convention)
//   site/src/app/(localized)/[locale]/apple-icon.png- 180x180, mark on the light surface color (iOS fills transparency)
//   site/public/assets/og-ru.png / og-en.png        - 1200x630 share card: inverse wordmark on the dark stage color
// Sources: assets/profrobot-icon.png (favicon mark), profrobot-logo{,-en}-inverse.png (og cards).
// Run from the repo root: node tools/migrate/seo-assets.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../site/package.json', import.meta.url));
const sharp = require('sharp');
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SITE = join(ROOT, 'site');
const STAGE = { r: 0x1c, g: 0x1e, b: 0x22 }; // --stage, dark brand background
const SURFACE = { r: 0xf3, g: 0xf2, b: 0xef }; // --surface, light brand background

/** Content bounding box (alpha > 8) of an RGBA image. */
async function contentBox(file) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** The favicon mark cropped from its transparent padding, centered on a square canvas of `size` px.
 * extract -> extend -> resize are separate sharp stages: chained in one pipeline they misbehave on sharp 0.35. */
async function squareIcon(size, background) {
  const box = await contentBox(join(ROOT, 'assets/profrobot-icon.png'));
  const side = Math.ceil(Math.max(box.width, box.height) * 1.06); // ~3% breathing room
  const pad = (a, b) => [Math.floor((a - b) / 2), Math.ceil((a - b) / 2)];
  const [top, bottom] = pad(side, box.height), [left, right] = pad(side, box.width);
  const extracted = await sharp(join(ROOT, 'assets/profrobot-icon.png')).extract(box).png().toBuffer();
  const extended = await sharp(extracted).extend({ top, bottom, left, right, background }).png().toBuffer();
  return sharp(extended).resize(size, size, { fit: 'contain', background }).png({ compressionLevel: 9 }).toBuffer();
}

/** One 32-bpp BMP entry (BITMAPINFOHEADER + bottom-up BGRA pixels + empty AND mask) for favicon.ico. */
async function bmpEntry(size) {
  const { data } = await sharp(await squareIcon(size, { r: 0, g: 0, b: 0, alpha: 0 }))
    .raw().toBuffer({ resolveWithObject: true });
  const pixels = [];
  for (let y = size - 1; y >= 0; y--) { // bottom-up
    const row = Buffer.alloc(size * 4);
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      row[x * 4] = data[i + 2]; row[x * 4 + 1] = data[i + 1]; row[x * 4 + 2] = data[i]; row[x * 4 + 3] = data[i + 3]; // BGRA
    }
    pixels.push(row);
  }
  const maskRow = Buffer.alloc(Math.ceil(size / 32) * 4); // 1-bpp AND mask, zero: alpha decides
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0); header.writeInt32LE(size, 4); header.writeInt32LE(size * 2, 8); // biHeight = XOR + AND
  header.writeUInt16LE(1, 12); header.writeUInt16LE(32, 14); // planes, bit count
  header.writeUInt32LE(size * size * 4 + maskRow.length * size, 20); // biSizeImage
  return Buffer.concat([header, ...pixels, ...Array(size).fill(maskRow)]);
}

/** favicon.ico with BMP entries of the given sizes (libvips cannot write ICO). */
async function favicon(sizes) {
  const images = [];
  for (const size of sizes) images.push(await bmpEntry(size));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4); // type icon, entry count
  let offset = header.length + sizes.length * 16;
  const entries = images.map((body, i) => {
    const e = Buffer.alloc(16);
    e[0] = sizes[i] >= 256 ? 0 : sizes[i]; e[1] = sizes[i] >= 256 ? 0 : sizes[i]; // 0 means 256
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); // planes, bpp
    e.writeUInt32LE(body.length, 8); e.writeUInt32LE(offset, 12);
    offset += body.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images]);
}

/** 1200x630 share card: the inverse wordmark centered on the dark stage color. */
async function ogCard(logo, logoWidth) {
  const mark = await sharp(join(ROOT, 'assets', logo)).resize({ width: logoWidth }).png().toBuffer();
  return sharp({ create: { width: 1200, height: 630, channels: 4, background: { ...STAGE, alpha: 1 } } })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const outputs = [
  [join(SITE, 'src/app/favicon.ico'), await favicon([16, 32, 48])],
  [join(SITE, 'src/app/(localized)/[locale]/icon.png'), await squareIcon(32, { r: 0, g: 0, b: 0, alpha: 0 })],
  [join(SITE, 'src/app/(localized)/[locale]/apple-icon.png'), await squareIcon(180, { ...SURFACE, alpha: 1 })],
  [join(SITE, 'public/assets/og-ru.png'), await ogCard('profrobot-logo-inverse.png', 760)],
  [join(SITE, 'public/assets/og-en.png'), await ogCard('profrobot-logo-en-inverse.png', 590)],
];
for (const [file, buf] of outputs) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, buf);
  const meta = file.endsWith('.ico') ? { format: 'ico', width: 48 } : await sharp(buf).metadata();
  console.log(`${meta.format} ${meta.width}x${meta.height} ${buf.length} B  ${file.replace(ROOT, '')}`);
}
