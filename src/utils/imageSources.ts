import manifest from '../data/imageManifest.json';
import { PUBLIC_URL } from './getBaseUrl';

type ManifestEntry = {
  /** Intrinsic width of the (capped) original. */
  w: number;
  /** Intrinsic height of the (capped) original. */
  h: number;
  /** Widths of the generated `-<w>.webp` siblings, if any. */
  v?: number[];
  /** Content hash, stamped at build time — see versionedUrl. */
  c?: string;
};

const entries = manifest as Record<string, ManifestEntry>;

/**
 * Default `sizes` hint. Page content is capped at 84rem with gutters, so an
 * image is at most ~1050px wide on a large screen and effectively full-bleed
 * on a phone. Components that render into a narrower slot (thumbnails, gallery
 * tiles) should pass their own.
 */
export const DEFAULT_SIZES =
  '(min-width: 1360px) 1250px, (min-width: 1024px) calc(100vw - 6rem), 100vw';

/**
 * Look up the srcset/dimension data for a public image path.
 *
 * `src` arrives as `${PUBLIC_URL}/images/...`; manifest keys are base-relative
 * (`/images/...`), so the deployment base is stripped before lookup. Anything
 * not in the manifest — SVGs, icons, remote URLs, images too small to be worth
 * splitting — returns null and the caller falls back to a plain <img>.
 *
 * Every candidate is percent-encoded. A srcset is parsed by splitting on
 * whitespace, so a raw space in a path (`/images/Dino Spread/...`) makes the
 * URL end at the space and the next word parse as a descriptor. The browser
 * drops the candidate — and since every candidate for that image contains the
 * same space, the whole srcset is discarded and the full-size original is
 * served. `src` itself is fine unencoded; only the srcset needs this.
 */
export function getImageSources(src: unknown): {
  srcSet?: string;
  width: number;
  height: number;
} | null {
  if (typeof src !== 'string') return null;

  const key = PUBLIC_URL && src.startsWith(PUBLIC_URL) ? src.slice(PUBLIC_URL.length) : src;
  const entry = entries[key];
  if (!entry) return null;

  if (!entry.v?.length) {
    // No variants, but the intrinsic size still lets the browser reserve
    // layout space and avoid a content shift when the image lands.
    return { width: entry.w, height: entry.h };
  }

  // The hash covers the original and its variants, so one value versions all.
  const version = entry.c ? `?v=${entry.c}` : '';
  const candidates = entry.v.map(
    (w) => `${encodeURI(src.replace(/\.(webp|png|jpe?g)$/i, `-${w}.webp`))}${version} ${w}w`
  );
  // The original is the widest candidate, so it stays in play for large screens.
  candidates.push(`${encodeURI(src)}${version} ${entry.w}w`);

  return { srcSet: candidates.join(', '), width: entry.w, height: entry.h };
}
