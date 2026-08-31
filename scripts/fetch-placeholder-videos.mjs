import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

// Source: Pexels (CC0 / free for commercial + personal use, no attribution required).
// URLs are the direct video-file URLs exposed by each video's Pexels "download" endpoint
// (https://www.pexels.com/download/video/<id>/), which redirects to a stable
// videos.pexels.com/video-files/... CDN URL.
const MANIFEST = [
  {
    // "A Couple Kissing On The Mountain Top" — https://www.pexels.com/video/a-couple-kissing-on-the-mountain-top-5667131/
    url: 'https://videos.pexels.com/video-files/5667131/5667131-uhd_4096_2160_30fps.mp4',
    out: 'placeholder-elena-pablo-preview',
  },
  {
    // "The bride dances with the groom at the wedding reception" — https://www.pexels.com/video/the-bride-dances-with-the-groom-at-the-wedding-reception-19366395/
    url: 'https://videos.pexels.com/video-files/19366395/19366395-hd_1920_1080_25fps.mp4',
    out: 'placeholder-elena-pablo-full',
  },
  {
    // "A Group Of People Socializing In A Party" — https://www.pexels.com/video/a-group-of-people-socializing-in-a-party-3188893/
    url: 'https://videos.pexels.com/video-files/3188893/3188893-hd_1920_1080_25fps.mp4',
    out: 'placeholder-gala-360-preview',
  },
];

async function downloadAndPoster({ url, out }) {
  await fs.mkdir('public/videos/previews', { recursive: true });
  await fs.mkdir('public/videos/posters', { recursive: true });
  const mp4Path = path.join('public/videos/previews', `${out}.mp4`);
  // Only the "-preview" suffix is stripped for the poster basename — the
  // "-full" variant's poster keeps its full name (see content/projects.ts,
  // which expects placeholder-elena-pablo-full.webp, not placeholder-elena-pablo.webp).
  const posterBase = out.endsWith('-preview') ? out.slice(0, -'-preview'.length) : out;
  const posterPath = path.join('public/videos/posters', `${posterBase}.webp`);

  const exists = await fs.access(mp4Path).then(() => true).catch(() => false);
  if (!exists) {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
    await fs.writeFile(mp4Path, Buffer.from(await res.arrayBuffer()));
  }

  const pngPath = posterPath.replace('.webp', '.png');
  await run('ffmpeg', ['-y', '-i', mp4Path, '-frames:v', '1', '-vf', 'scale=1600:-1', pngPath]);
  // The Homebrew ffmpeg bottle ships without a libwebp encoder, so use cwebp
  // (from the `webp` package) to do the png -> webp conversion instead.
  await run('cwebp', ['-q', '82', pngPath, '-o', posterPath]);
  await fs.unlink(pngPath);

  console.log(`OK ${mp4Path} + ${posterPath}`);
}

for (const entry of MANIFEST) {
  if (entry.url.startsWith('REPLACE_WITH')) {
    console.error(`Fill in the real URL for "${entry.out}" from Step 1 before running.`);
    process.exit(1);
  }
}

await Promise.all(MANIFEST.map(downloadAndPoster));
