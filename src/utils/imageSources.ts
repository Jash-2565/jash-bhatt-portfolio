import manifest from '../data/imageManifest.json';
import { PUBLIC_URL } from './getBaseUrl';

type ManifestEntry = {
  /** Intrinsic width of the (capped) original. */
  w: number;
  /** Intrinsic height of the (capped) original. */
  h: number;
  /** Widths of the generated `-<w>.webp` siblings, if any. */
  v?: number[];
};

const entries = manifest as Record<string, ManifestEntry>;

/**
 * Default `sizes` hint. Page content is capped at 84rem with gutters, so an
 * image is at most ~1050px wide on a large screen and effectively full-bleed
 * on a phone. Components that render into a narrower slot (thumbnails, gallery
 * tiles) should pass their own.
 */
export const DEFAULT_SIZES = '(min-width: 1024px) 1050px, 100vw';

/**
 * Look up the srcset/dimension data for a public image path.
 *
 * `src` arrives as `${PUBLIC_URL}/images/...`; manifest keys are base-relative
 * (`/images/...`), so the deployment base is stripped before lookup. Anything
 * not in the manifest — SVGs, icons, remote URLs, images too small to be worth
 * splitting — returns null and the caller falls back to a plain <img>.
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

  const candidates = entry.v.map((w) => `${src.replace(/\.(webp|png|jpe?g)$/i, `-${w}.webp`)} ${w}w`);
  // The original is the widest candidate, so it stays in play for large screens.
  candidates.push(`${src} ${entry.w}w`);

  return { srcSet: candidates.join(', '), width: entry.w, height: entry.h };
}
