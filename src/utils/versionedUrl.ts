import imageManifest from '../data/imageManifest.json';
import videoManifest from '../data/videoManifest.json';
import { PUBLIC_URL } from './getBaseUrl';

/** `c` is stamped onto each entry at build time by stampAssetVersions in vite.config.ts. */
type Versioned = { c?: string };

const images = imageManifest as Record<string, Versioned>;
const videos = videoManifest as Record<string, Versioned>;

/**
 * Append `?v=<content hash>` to a public image or video URL.
 *
 * /images is cached for 30 days under a fixed name, so a file replaced in place
 * kept showing its old copy to anyone who had seen it. The hash changes only
 * when the file does: a swapped image is fetched at once, an unchanged one stays
 * cached across deploys. Anything not in a manifest is returned untouched.
 *
 * Every <img>, <video> and CSS background that points into /images should go
 * through this — ResponsiveImage, ImageWithFallback and AutoVideo already do.
 */
export function versionedUrl<T extends string | undefined>(src: T): T {
  if (!src) return src;

  const key = PUBLIC_URL && src.startsWith(PUBLIC_URL) ? src.slice(PUBLIC_URL.length) : src;
  const c =
    images[key]?.c ??
    // Video entries are keyed without an extension; the .gif is the name
    // projects data uses, the rest are its encoded siblings.
    videos[key.replace(/\.(gif|mp4|webm|poster\.jpg)$/i, '')]?.c;

  return (c ? `${src}?v=${c}` : src) as T;
}
