#!/usr/bin/env node
/**
 * Re-encode the looping clips that AutoVideo autoplays on scroll.
 *
 * These started life as animated GIFs and were converted once with generous
 * settings, which left them wildly over-bitrate for their size: a 480×848,
 * 15fps clip has no business being 5.17MB. Because AutoVideo plays them
 * automatically when they scroll into view, that weight lands on a phone's data
 * plan without anyone asking for it.
 *
 * For each clip we emit BOTH a VP9 .webm and an H.264 .mp4 (AutoVideo offers
 * webm first, mp4 second, so Chrome/Firefox and Safari each get a small file),
 * plus the .poster.jpg first frame. Audio is stripped — every one of these is
 * muted by definition.
 *
 * Encodes are skipped when the result would be larger than what's already
 * there, and the whole thing is idempotent.
 *
 * Usage: npm run optimize:videos [-- --only=<substring>]
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { stat, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Long-edge cap. Two clips are 1080×1920; they render a few hundred px wide. */
const MAX_EDGE = 1280;
/** Constant-quality targets. Higher = smaller. Tuned for short, muted, looping UI clips. */
const H264_CRF = 28;
const VP9_CRF = 36;

/** The clips AutoVideo autoplays, keyed off the `.gif` paths in the project data. */
const CLIPS = [
  'Revela/distance-testing-2',
  'Revela/Low-Fidelity Prototype Testing',
  'Revela/distance-testing',
  'Revela/esp32-soldering',
  'Revela/tag-printing',
  'Revela/wand-creation',
  'Tinkering/final-countdown',
  'Tinkering/1-segment-countdown',
  'Tinkering/2-segment-countdown',
  'Lamborghini Jetski/jetski final',
  'Photoshop and Animation/Geometric-Design',
];

const only = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length);
const mb = (n) => `${(n / 1048576).toFixed(2)}MB`;
const sizeOf = async (p) => stat(p).then((s) => s.size).catch(() => 0);

// Scale to fit within MAX_EDGE on the long edge, and force even dimensions —
// H.264/VP9 chroma subsampling requires them.
const SCALE = `scale='if(gt(max(iw,ih),${MAX_EDGE}), if(gte(iw,ih), ${MAX_EDGE}, -2), iw)':'if(gt(max(iw,ih),${MAX_EDGE}), if(gt(ih,iw), ${MAX_EDGE}, -2), ih)':flags=lanczos,scale=trunc(iw/2)*2:trunc(ih/2)*2`;

/**
 * Encode `source` to `outPath`, keeping whatever is already at `outPath` if the
 * re-encode comes out bigger. `before` is passed in because the caller has
 * usually moved the original aside already.
 */
async function encode(source, outPath, args, label, before) {
  const tmp = `${outPath}.tmp${path.extname(outPath)}`;
  try {
    await run(ffmpegPath, ['-y', '-loglevel', 'error', '-i', source, ...args, tmp], {
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (err) {
    await unlink(tmp).catch(() => {});
    throw err;
  }
  const after = await sizeOf(tmp);
  if (before && after >= before) {
    await unlink(tmp).catch(() => {});
    console.log(`    ${label}: kept original (${mb(before)}; re-encode was ${mb(after)})`);
    return false;
  }
  await rename(tmp, outPath);
  console.log(`    ${label}: ${before ? mb(before) : '—'} → ${mb(after)}`);
  return true;
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const clip of CLIPS) {
    if (only && !clip.toLowerCase().includes(only.toLowerCase())) continue;
    const base = path.join(ROOT, 'public', 'images', clip);
    const mp4 = `${base}.mp4`;
    const webm = `${base}.webm`;
    const poster = `${base}.poster.jpg`;

    // The mp4 is the one clip that always exists, so it's the encode source.
    const source = (await sizeOf(mp4)) ? mp4 : webm;
    if (!(await sizeOf(source))) {
      console.log(`  !! no source for ${clip}`);
      continue;
    }

    console.log(`  ${clip}`);
    const mp4Before = await sizeOf(mp4);
    const webmBefore = await sizeOf(webm);
    totalBefore += mp4Before + webmBefore;

    // Encode both targets from the ORIGINAL source, never from each other —
    // chaining lossy encodes compounds the damage. The source is moved aside so
    // the encoder isn't reading and writing the same path.
    const srcCopy = `${source}.orig${path.extname(source)}`;
    await rename(source, srcCopy);
    let ok = false;
    try {
      await encode(srcCopy, mp4, [
        '-an', '-vf', SCALE,
        '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p',
        '-crf', String(H264_CRF), '-preset', 'slow',
        '-movflags', '+faststart',
      ], 'mp4 ', mp4Before);

      await encode(srcCopy, webm, [
        '-an', '-vf', SCALE,
        '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(VP9_CRF),
        '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
      ], 'webm', webmBefore);

      // AutoVideo offers <source webm> before <source mp4>, so a webm that is
      // larger than its mp4 sibling actively costs bytes. Drop it and let the
      // browser fall through — several clips already ship mp4-only.
      const mp4Now = await sizeOf(mp4);
      const webmNow = await sizeOf(webm);
      if (webmNow && mp4Now && webmNow >= mp4Now) {
        await unlink(webm).catch(() => {});
        console.log(`    webm: dropped (${mb(webmNow)} ≥ mp4 ${mb(mp4Now)})`);
      }

      await run(ffmpegPath, ['-y', '-loglevel', 'error', '-i', srcCopy, '-vf', SCALE, '-frames:v', '1', '-q:v', '4', poster], { maxBuffer: 32 * 1024 * 1024 });
      ok = true;
    } finally {
      if (ok) {
        // Everything succeeded — the moved-aside source is now redundant.
        await unlink(srcCopy).catch(() => {});
      } else {
        // Something blew up. Put the original back rather than losing it.
        await rename(srcCopy, source).catch(() => {});
        console.error(`    !! encode failed for ${clip} — original restored`);
      }
    }

    totalAfter += (await sizeOf(mp4)) + (await sizeOf(webm));
  }

  console.log(`\nvideo total: ${mb(totalBefore)} → ${mb(totalAfter)}`);
}

main().catch((err) => {
  console.error(err.stderr?.toString?.() ?? err);
  process.exit(1);
});
