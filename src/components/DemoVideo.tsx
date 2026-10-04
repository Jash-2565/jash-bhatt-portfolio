import manifest from '../data/videoManifest.json';
import { PUBLIC_URL } from '../utils/getBaseUrl';
import { versionedUrl } from '../utils/versionedUrl';

interface DemoVideoProps {
  /** The .mp4 path; the .webm and .poster.jpg siblings are derived from it. */
  src: string;
  /** Visible caption under the player, which also names it for screen readers. */
  caption: string;
}

type VideoEntry = { w?: number; h?: number; webm?: boolean; poster?: boolean };
const entries = manifest as Record<string, VideoEntry>;

const swap = (src: string, ext: string) => versionedUrl(src.replace(/\.mp4$/i, ext));

/**
 * A watch-on-purpose video, unlike AutoVideo's silent loops: it has a start,
 * on-screen text and an ending, so it waits on its poster for a click rather
 * than autoplaying mid-way through as it scrolls into view. Nothing is fetched
 * until then (`preload="none"`), so a reader who skips it costs only the poster.
 */
const DemoVideo = ({ src, caption }: DemoVideoProps) => {
  const key = (PUBLIC_URL && src.startsWith(PUBLIC_URL) ? src.slice(PUBLIC_URL.length) : src).replace(/\.mp4$/i, '');
  const entry = entries[key];

  return (
    <figure className="mt-10 m-0 flex flex-col gap-3">
      <div className="rounded-2xl overflow-hidden bg-[var(--surface-1)] shadow-lg">
        <video
          className="block w-full h-auto"
          // Reserve the 16:9 box before metadata loads, so nothing below jumps.
          {...(entry?.w && entry?.h ? { width: entry.w, height: entry.h } : {})}
          {...(entry?.poster !== false ? { poster: swap(src, '.poster.jpg') } : {})}
          aria-label={caption}
          controls
          playsInline
          preload="none"
        >
          {entry?.webm && <source src={swap(src, '.webm')} type="video/webm" />}
          <source src={versionedUrl(src)} type="video/mp4" />
        </video>
      </div>
      <figcaption className="text-sm text-ink-muted text-center">{caption}</figcaption>
    </figure>
  );
};

export default DemoVideo;
