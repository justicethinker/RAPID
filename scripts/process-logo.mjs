// Brand asset ingest: logoimage/{Rlogo,rapid}.jpg → transparent PNGs + favicon/og embeds.
//
//   pnpm exec node scripts/process-logo.mjs
//
// Rlogo.jpg = official R mark on a dark navy background  → luminance-ramp key
// rapid.jpg = RAPID wordmark on a dark background        → luminance-ramp key, RGB forced white
//
// The wordmark PNG is consumed as a CSS mask + currentColor in Logo.tsx, so the
// wordmark always matches surrounding text colour (white on dark, ink on light).

import sharp from 'sharp';
import { mkdir, writeFile, stat } from 'node:fs/promises';

const OUT = 'public/images/brand';
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const luma = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
await mkdir(OUT, { recursive: true });

function trimBox(data, w, h, minAlpha) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > minAlpha) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const pad = 3;
  const ex = Math.max(0, x0 - pad), ey = Math.max(0, y0 - pad);
  return {
    left: ex,
    top: ey,
    width: Math.min(w - ex, x1 - x0 + 1 + pad * 2),
    height: Math.min(h - ey, y1 - y0 + 1 + pad * 2),
  };
}

// ---------- 1. R mark (dark bg → transparent) ----------
let markAspect;
{
  const { data, info } = await sharp('logoimage/Rlogo.jpg')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Separate mark (bright greens, G > 120) from background (incl. teal glow) by
  // measuring both populations, then ramp between them.
  let bgMaxL = 0, markMinL = 255;
  for (let i = 0; i < data.length; i += 4) {
    const L = luma(data[i], data[i + 1], data[i + 2]);
    if (data[i + 1] > 120) { if (L < markMinL) markMinL = L; }
    else if (data[i + 1] < 100) { if (L > bgMaxL) bgMaxL = L; }
  }
  const lo = bgMaxL + 8;
  const hi = Math.max(lo + 20, markMinL - 8);
  console.log(`mark key: bgMaxL=${bgMaxL} markMinL=${markMinL} → ramp ${lo}..${hi}`);

  for (let i = 0; i < data.length; i += 4) {
    const L = luma(data[i], data[i + 1], data[i + 2]);
    data[i + 3] = L <= lo ? 0 : L >= hi ? 255 : clamp(((L - lo) / (hi - lo)) * 255);
  }

  const box = trimBox(data, w, h, 10);
  const out = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract(box)
    .resize({ width: 900 })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/r-mark.png`);
  markAspect = box.width / box.height;
  if (out.size > 400 * 1024) {
    // Re-encode with palette if oversized (gradient still renders smoothly at logo sizes).
    await sharp(`${OUT}/r-mark.png`).png({ palette: true, colors: 256 }).toFile(`${OUT}/r-mark-p.png`);
    await (await import('node:fs/promises')).rename(`${OUT}/r-mark-p.png`, `${OUT}/r-mark.png`);
  }
}

// ---------- 2. RAPID wordmark (dark bg → transparent, RGB white) ----------
let _wordAspect;
{
  const { data, info } = await sharp('logoimage/rapid.jpg')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Bounding box from bright pixels only (dark backdrop excluded).
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const L = luma(data[(y * w + x) * 4], data[(y * w + x) * 4 + 1], data[(y * w + x) * 4 + 2]);
      if (L > 175) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }

  // Alpha = luminance ramp (keeps anti-aliasing); RGB = white so no bg bleed.
  for (let i = 0; i < data.length; i += 4) {
    const L = luma(data[i], data[i + 1], data[i + 2]);
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = clamp(((L - 105) / (195 - 105)) * 255);
  }

  const pad = 4;
  const ex = Math.max(0, x0 - pad), ey = Math.max(0, y0 - pad);
  const box = {
    left: ex,
    top: ey,
    width: Math.min(w - ex, x1 - x0 + 1 + pad * 2),
    height: Math.min(h - ey, y1 - y0 + 1 + pad * 2),
  };
  _wordAspect = box.width / box.height;

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract(box)
    .resize({ width: 1200 })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/rapid-wordmark.png`);
}

// ---------- 3. favicon.svg (navy square + real mark) ----------
{
  const buf = await sharp(`${OUT}/r-mark.png`).resize({ width: 192 }).png().toBuffer();
  const box = 40;
  const w = markAspect >= 1 ? box : box * markAspect;
  const h = markAspect >= 1 ? box / markAspect : box;
  const x = (48 - w) / 2, y = (48 - h) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="10" fill="#03121E"/>
  <image href="data:image/png;base64,${buf.toString('base64')}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}"/>
</svg>
`;
  await writeFile('public/favicon.svg', svg);
}

// ---------- 4. og-image.svg (navy card + real mark + headline) ----------
{
  const buf = await sharp(`${OUT}/r-mark.png`).resize({ width: 480 }).png().toBuffer();
  const mw = 300, mh = 300 / markAspect;
  const mx = 80, my = 315 - mh / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#03121E"/>
  <defs>
    <linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#22CFCB"/>
      <stop offset=".55" stop-color="#15E6A0"/>
      <stop offset="1" stop-color="#4AE86B"/>
    </linearGradient>
  </defs>
  <circle cx="900" cy="200" r="300" fill="rgba(18,201,214,0.15)"/>
  <circle cx="200" cy="500" r="250" fill="rgba(21,230,160,0.1)"/>
  <image href="data:image/png;base64,${buf.toString('base64')}" x="${mx}" y="${my.toFixed(2)}" width="${mw}" height="${mh.toFixed(2)}"/>
  <text x="440" y="280" font-family="system-ui,sans-serif" font-size="64" font-weight="800" fill="#F2F7FB">Good ideas need</text>
  <text x="440" y="360" font-family="system-ui,sans-serif" font-size="64" font-weight="800" fill="url(#g)">the right people.</text>
  <text x="440" y="420" font-family="system-ui,sans-serif" font-size="22" fill="#B7C7D5">RAPID — Test your idea with the right people</text>
</svg>
`;
  await writeFile('public/og-image.svg', svg);
}

for (const f of ['r-mark.png', 'rapid-wordmark.png']) {
  const m = await sharp(`${OUT}/${f}`).metadata();
  const { size } = await stat(`${OUT}/${f}`);
  console.log(`${f}: ${m.width}×${m.height}  aspect ${(m.width / m.height).toFixed(4)}  ${Math.round(size / 1024)} KB`);
}
console.log('favicon.svg + og-image.svg rewritten with the embedded mark');
