#!/usr/bin/env node
/**
 * Record what encodings actually exist for each looping clip, and how big they
 * are.
 *
 * `AutoVideo` used to emit `<source src="…webm">` followed by
 * `<source src="…mp4">` unconditionally. That is wrong twice over:
 *
 *   1. `optimize-videos.mjs` *deliberately* deletes a VP9 file that comes out
 *      heavier than its H.264 sibling — offering webm first would then cost
 *      bytes rather than save them. Seven of the eleven clips have no .webm at
 *      all, so seven requests per affected page 404ed (or, behind an SPA
 *      rewrite, downloaded the HTML shell and handed it to a video decoder)
 *      before the browser fell through to the mp4.
 *
 *   2. A <video> with no intrinsic dimensions occupies 0px until its metadata
 *      arrives, then snaps to size. Recording width/height here lets the
 *      element reserve its space up front.
 *
 * Usage: npm run manifest:videos
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const MANIFEST = path.join(ROOT, 'src', 'data', 'videoManifest.json');

const exists = (p) => stat(p).then(() => true).catch(() => false);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/**
 * ffprobe ships alongside ffmpeg in ffmpeg-static's package, but only ffmpeg is
 * exported. Reading the dimensions off ffmpeg's own stderr banner avoids adding
 * a second dependency for one number.
 */
async function dimensions(file) {
  // ffmpeg prints the stream banner on stderr and exits 0 with `-f null -`, so
  // the size comes off the resolved value, not off a thrown error.
  let stderr = '';
  try {
    ({ stderr } = await run(ffmpegPath, ['-i', file, '-f', 'null', '-'], {
      maxBuffer: 8 * 1024 * 1024,
    }));
  } catch (err) {
    stderr = err.stderr ?? '';
  }
  const match = /Video:.*?,\s*(\d{2,5})x(\d{2,5})/.exec(stderr);
  if (!match) return null;
  return { w: Number(match[1]), h: Number(match[2]) };
}

async function main() {
  // Keyed off the .mp4, which is the one encoding every clip always has.
  const mp4s = (await walk(IMAGES_DIR)).filter((f) => f.toLowerCase().endsWith('.mp4'));
  const manifest = {};

  for (const mp4 of mp4s.sort()) {
    const base = mp4.replace(/\.mp4$/i, '');
    const rel = path.relative(path.join(ROOT, 'public'), base).split(path.sep).join('/');
    const dims = await dimensions(mp4);
    const entry = {
      ...(dims ?? {}),
      mp4: true,
      webm: await exists(`${base}.webm`),
      poster: await exists(`${base}.poster.jpg`),
    };
    manifest[`/${rel}`] = entry;
    const missing = [!entry.webm && 'webm', !entry.poster && 'poster'].filter(Boolean);
    console.log(
      `  ${rel}  ${dims ? `${dims.w}×${dims.h}` : '(no dimensions)'}` +
        (missing.length ? `  — no ${missing.join(', ')}` : '')
    );
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  const withWebm = Object.values(manifest).filter((e) => e.webm).length;
  console.log(
    `\n${Object.keys(manifest).length} clips · ${withWebm} with webm · ` +
      `${Object.keys(manifest).length - withWebm} mp4-only`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
