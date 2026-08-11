#!/usr/bin/env node
/**
 * Image optimisation pass for public/images.
 *
 * Two jobs, both idempotent:
 *
 *   1. Cap the originals. Several source exports are absurd for the web —
 *      11102×7103, 8704×6944, 7037×9923 — yet they never render wider than
 *      ~1050px. Oversized sources cost far more in decode memory than in
 *      transfer: an 11102×7103 image is ~315MB as a decoded bitmap, which is
 *      what actually janks (or kills) a phone browser. Anything longer than
 *      MAX_EDGE on its long side is re-encoded in place at MAX_EDGE.
 *
 *   2. Emit width variants next to each image (`foo-480.webp` and friends) and
 *      record them in a manifest, so ResponsiveImage can build a `srcset` and
 *      phones fetch ~40KB instead of ~1MB. The manifest also carries intrinsic
 *      dimensions, which the component uses for width/height attributes to
 *      reserve layout space and stop images shifting content as they load.
 *
 * Variants are only emitted where they'd actually be smaller than the capped
 * original, so icons and small UI shots stay single-file.
 *
 * Usage: npm run optimize:images  [-- --dry]
 */
import sharp from 'sharp';
import { readdir, stat, writeFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const MANIFEST = path.join(ROOT, 'src', 'data', 'imageManifest.json');

/** Long-edge cap for the originals that stay in the repo. */
const MAX_EDGE = 2400;
/** Widths emitted for srcset. */
const VARIANTS = [480, 960, 1440];
/** Quality for re-encodes. WebP at 80 is visually indistinguishable here. */
const QUALITY = 80;
/** Don't bother with variants below this width — no meaningful saving. */
const MIN_WIDTH_FOR_VARIANTS = 700;
/**
 * Bytes-per-pixel above which an image is re-encoded even if its dimensions are
 * already fine. Lossy WebP at q80 lands around 0.05–0.15 bpp; anything near 0.8
 * is a lossless export that slipped into the pipeline (the six wand-glow shots
 * were 1344×768 but ~800KB each — 6MB between them, for images that render a
 * few hundred pixels wide).
 */
const RECOMPRESS_BPP = 0.3;

const RASTER = new Set(['.webp', '.png', '.jpg', '.jpeg']);
const DRY = process.argv.includes('--dry');

// libvips caches decoded operations by file path. Because this script rewrites
// originals in place and then re-reads them, that cache hands back the *old*
// dimensions and the manifest records a size the file no longer has. Turn it
// off — throughput doesn't matter for a one-shot asset pass, correctness does.
sharp.cache(false);

/** Files this script generates — must never be treated as sources. */
const isGenerated = (name) => VARIANTS.some((w) => name.includes(`-${w}.webp`));
/** Video poster frames are produced by the video pipeline, leave them alone. */
const isPoster = (name) => name.includes('.poster.');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const mb = (n) => `${(n / 1048576).toFixed(2)}MB`;

async function main() {
  const files = (await walk(IMAGES_DIR)).filter((f) => {
    const base = path.basename(f);
    return RASTER.has(path.extname(f).toLowerCase()) && !isGenerated(base) && !isPoster(base);
  });

  const manifest = {};
  let beforeTotal = 0;
  let afterTotal = 0;
  let capped = 0;
  let variantsWritten = 0;

  for (const file of files.sort()) {
    const rel = path.relative(path.join(ROOT, 'public'), file).split(path.sep).join('/');
    const sizeBefore = (await stat(file)).size;
    beforeTotal += sizeBefore;

    let meta = await sharp(file).metadata();
    let { width, height } = meta;
    if (!width || !height) {
      console.warn(`  ?? skipping (no dimensions): ${rel}`);
      continue;
    }

    // --- 1. Cap the original, and/or recompress if it's absurdly heavy -------
    const overSized = Math.max(width, height) > MAX_EDGE;
    const overWeight = sizeBefore / (width * height) > RECOMPRESS_BPP;
    if (overSized || overWeight) {
      if (!DRY) {
        // Encode to a temp file first: sharp cannot safely read and write the
        // same path in one pipeline. Keep the source's own format so the file
        // extension never lies about its contents.
        const tmp = `${file}.tmp`;
        const ext = path.extname(file).toLowerCase();
        const format = ext === '.png' ? 'png' : ext === '.webp' ? 'webp' : 'jpeg';
        await sharp(file)
          // fit:'inside' with both bounds set caps the long edge whichever way
          // the image is oriented, and preserves aspect ratio.
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
          .toFormat(format, format === 'png' ? { compressionLevel: 9 } : { quality: QUALITY })
          .toFile(tmp);

        // A tightly-compressed source can come back *larger* after a re-encode.
        // Only take the new file when it's actually smaller.
        const tmpSize = (await stat(tmp)).size;
        if (tmpSize < sizeBefore) {
          await rename(tmp, file);
        } else {
          await unlink(tmp).catch(() => {});
          console.log(`  keep ${rel}  (re-encode was larger: ${mb(sizeBefore)} → ${mb(tmpSize)})`);
        }
        meta = await sharp(file).metadata();
        width = meta.width;
        height = meta.height;
        const tag = overSized ? 'cap ' : 'recomp';
        console.log(`  ${tag} ${rel}  → ${width}×${height}  ${mb(sizeBefore)} → ${mb((await stat(file)).size)}`);
      } else {
        if (overSized) {
          const scale = MAX_EDGE / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        console.log(`  ${overSized ? 'cap ' : 'recomp'} ${rel}  → ${width}×${height}  ${mb(sizeBefore)} → (dry)`);
      }
      capped += 1;
    }

    // --- 2. Emit srcset variants --------------------------------------------
    const widths = width >= MIN_WIDTH_FOR_VARIANTS
      ? VARIANTS.filter((w) => w < width)
      : [];

    const emitted = [];
    for (const w of widths) {
      const out = file.replace(/\.(webp|png|jpe?g)$/i, `-${w}.webp`);
      if (!DRY) {
        await sharp(file).resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(out);
        afterTotal += (await stat(out)).size;
      }
      emitted.push(w);
      variantsWritten += 1;
    }

    // Clean up variants left behind by an earlier run at a larger source size.
    for (const w of VARIANTS.filter((v) => !emitted.includes(v))) {
      const stale = file.replace(/\.(webp|png|jpe?g)$/i, `-${w}.webp`);
      if (!DRY) await unlink(stale).catch(() => {});
    }

    afterTotal += (await stat(file)).size;

    manifest[`/${rel}`] = {
      w: width,
      h: height,
      ...(emitted.length ? { v: emitted } : {}),
    };
  }

  if (!DRY) {
    await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  console.log(`\n${files.length} sources · ${capped} capped · ${variantsWritten} variants`);
  console.log(`originals before: ${mb(beforeTotal)}`);
  console.log(`originals+variants after: ${mb(afterTotal)}`);
  if (DRY) console.log('(dry run — nothing written)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
