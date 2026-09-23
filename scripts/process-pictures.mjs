// Ingest drop-folder photos into the site's image slots.
//
//   pnpm pictures                  # pictures/ → public/images/
//   SRC=... OUT=... pnpm pictures   # override folders
//
// Each source file maps to one or more slot outputs (aspect + width).
// Crop uses sharp's "attention" strategy so faces stay in frame.
// Run this on LICENSED (watermark-free) exports only.

import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = process.env.SRC ?? 'pictures';
const OUT = process.env.OUT ?? 'public/images';
const MAX_KB = 200; // per README budget

/** source filename → slot outputs */
const MAP = {
  'WhatsApp Image 2026-09-22 at 1.45.04 PM (4).jpeg': [
    { name: 'hero-pitch', aspect: [16, 10], width: 960 },
  ],
  'WhatsApp Image 2026-09-22 at 1.45.04 PM (3).jpeg': [
    { name: 'create-pitch', aspect: [16, 10], width: 880 },
  ],
  'WhatsApp Image 2026-09-22 at 1.45.04 PM (2).jpeg': [
    { name: 'feed-1', aspect: [16, 11], width: 720 },
  ],
  'WhatsApp Image 2026-09-22 at 1.45.04 PM.jpeg': [
    { name: 'feed-2', aspect: [16, 11], width: 720 },
  ],
  'WhatsApp Image 2026-09-22 at 1.45.04 PM (1).jpeg': [
    { name: 'profile-1', aspect: [4, 3], width: 560 },
  ],
  'WhatsApp Image 2026-09-22 at 1.45.05 PM (2).jpeg': [
    { name: 'profile-2', aspect: [4, 3], width: 560 },
    { name: 'feedback-avatar', aspect: [1, 1], width: 240 },
  ],
  'WhatsApp Image 2026-09-22 at 1.45.05 PM (1).jpeg': [
    { name: 'profile-3', aspect: [4, 3], width: 560 },
  ],
  'WhatsApp Image 2026-09-22 at 1.45.05 PM (3).jpeg': [
    { name: 'feed-3', aspect: [16, 11], width: 720 },
    { name: 'roles-testers', aspect: [16, 9], width: 960 },
  ],
  'WhatsApp Image 2026-09-22 at 1.45.05 PM.jpeg': [
    { name: 'roles-founders', aspect: [16, 9], width: 960 },
    { name: 'role-demo', aspect: [16, 10], width: 880 },
  ],
  'bayu-syaits-APkN840aeh4-unsplash.jpg': [
    { name: 'grilled-bowl', aspect: [1, 1], width: 160 },
  ],
};

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const present = new Set(files);
let written = 0;
let warned = 0;

await mkdir(OUT, { recursive: true });

for (const [file, slots] of Object.entries(MAP)) {
  if (!present.has(file)) {
    console.warn(`MISSING source: ${file}`);
    continue;
  }
  for (const slot of slots) {
    const [aw, ah] = slot.aspect;
    const height = Math.round((slot.width * ah) / aw);
    const dest = path.join(OUT, `${slot.name}.webp`);
    await sharp(path.join(SRC, file))
      .resize(slot.width, height, { fit: 'cover', position: 'attention' })
      .webp({ quality: 80 })
      .toFile(dest);
    const kb = Math.round((await stat(dest)).size / 1024);
    if (kb > MAX_KB) {
      warned++;
      console.warn(`OVER BUDGET ${slot.name}.webp — ${kb} KB (max ${MAX_KB})`);
    }
    console.log(`✓ ${slot.name}.webp  ${slot.width}×${height}  ${kb} KB`);
    written++;
  }
}

const unmapped = files.filter((f) => !(f in MAP));
if (unmapped.length) console.log(`note: unmapped in ${SRC}/ → ${unmapped.join(', ')}`);
console.log(`\n${written} slot image(s) → ${OUT}${warned ? ` (${warned} over budget)` : ''}`);
