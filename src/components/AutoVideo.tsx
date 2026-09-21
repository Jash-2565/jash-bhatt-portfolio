import { useEffect, useRef, useState } from 'react';
import manifest from '../data/videoManifest.json';
import { PUBLIC_URL } from '../utils/getBaseUrl';

interface AutoVideoProps {
  /** The original .gif path from projects data — the encoded siblings
   *  (.webm/.mp4/.poster.jpg produced by scripts/gif-to-video.sh) are derived automatically. */
  src: string;
  /** Describes the clip. Used as the accessible name only when nothing visible
   *  already does — see `captioned`. */
  alt?: string;
  /** True when the caller renders a visible caption beside this clip. The
   *  caption then carries the description and the element is marked decorative,
   *  rather than a screen reader announcing the same sentence twice. */
  captioned?: boolean;
  className?: string;
}

type VideoEntry = { w?: number; h?: number; mp4?: boolean; webm?: boolean; poster?: boolean };
const entries = manifest as Record<string, VideoEntry>;

// Swap a `.gif` reference for its encoded video/poster siblings.
const swap = (src: string, ext: string) => src.replace(/\.gif$/i, ext);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Drop-in replacement for the old animated GIFs: an autoplaying, muted, looping
 * video that behaves exactly like a GIF but is ~30× smaller. Plays only while in
 * view (saves CPU/battery), and for reduced-motion users shows a paused poster
 * with controls instead of autoplaying.
 *
 * Which encodings exist is read from the generated manifest rather than
 * assumed. `optimize-videos.mjs` deletes a VP9 file whenever it comes out
 * heavier than its H.264 sibling, so seven of the twelve clips are mp4-only —
 * and emitting a `<source>` for a webm that was never written meant a failed
 * request per clip before the browser fell through.
 */
const AutoVideo = ({ src, alt = '', captioned = false, className = '' }: AutoVideoProps) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const key = (PUBLIC_URL && src.startsWith(PUBLIC_URL) ? src.slice(PUBLIC_URL.length) : src)
    .replace(/\.gif$/i, '');
  const entry = entries[key];

  return (
    <video
      ref={ref}
      className={className}
      // Intrinsic dimensions so the element reserves its space before metadata
      // arrives. Without them a `h-auto` video is 0px tall until it loads and
      // then snaps, shoving everything below it down the page.
      {...(entry?.w && entry?.h ? { width: entry.w, height: entry.h } : {})}
      {...(entry?.poster !== false ? { poster: swap(src, '.poster.jpg') } : {})}
      // A visible caption already describes the clip; repeating it here made a
      // screen reader read every one of them twice.
      {...(captioned ? { 'aria-hidden': true } : alt ? { 'aria-label': alt } : {})}
      muted
      loop
      playsInline
      autoPlay={!reduced}
      controls={reduced}
      preload="metadata"
    >
      {entry?.webm && <source src={swap(src, '.webm')} type="video/webm" />}
      <source src={swap(src, '.mp4')} type="video/mp4" />
    </video>
  );
};

export default AutoVideo;
