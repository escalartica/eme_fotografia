import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const MANIFEST = [
  { id: '1519741497674-611481863552', out: 'trabajos/clara-y-manuel/placeholder-cover' },
  { id: '1519225421980-715cb0215aed', out: 'trabajos/clara-y-manuel/placeholder-01' },
  { id: '1511285560929-80b456fea0bc', out: 'trabajos/clara-y-manuel/placeholder-02' },
  { id: '1465495976277-4387d4b0b4c6', out: 'trabajos/clara-y-manuel/placeholder-03' },
  { id: '1550005809-91ad75fb315f', out: 'trabajos/lucia-y-jorge/placeholder-cover' },
  { id: '1478720568477-152d9b164e26', out: 'trabajos/lucia-y-jorge/placeholder-01' },
  { id: '1606216794074-735e91aa2c92', out: 'trabajos/lucia-y-jorge/placeholder-02' },
  { id: '1583939003579-730e3918a45a', out: 'trabajos/lucia-y-jorge/placeholder-03' },
  { id: '1520854221256-17451cc331bf', out: 'trabajos/boda-elena-y-pablo-video/placeholder-01' },
  { id: '1699730185428-d11054059c7f', out: 'trabajos/gala-empresa-fotomaton-360/placeholder-cover' },
  { id: '1492684223066-81342ee5ff30', out: 'trabajos/gala-empresa-fotomaton-360/placeholder-01' },
  { id: '1470309864661-68328b2cd0a5', out: 'hero/placeholder-hero-01' },
  { id: '1521572163474-6864f9cf17ab', out: 'hero/placeholder-hero-02' },
  { id: '1494790108377-be9c29b29330', out: 'sobre-nosotros/placeholder-team' },
];

async function downloadAndConvert({ id, out }) {
  const url = `https://images.unsplash.com/photo-${id}?q=80&w=2000&auto=format`;
  const destPath = path.join('public/images', `${out}.webp`);
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`SKIP ${id}: HTTP ${res.status}`);
    return false;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await sharp(buffer).webp({ quality: 82 }).toFile(destPath);
  console.log(`OK ${destPath}`);
  return true;
}

const results = await Promise.all(MANIFEST.map(downloadAndConvert));
const okCount = results.filter(Boolean).length;
console.log(`\n${okCount}/${MANIFEST.length} images downloaded.`);
if (okCount < MANIFEST.length * 0.7) {
  console.error('Too many failures — refresh the photo IDs in MANIFEST (search unsplash.com for replacements) and re-run.');
  process.exit(1);
}
