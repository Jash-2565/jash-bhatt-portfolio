import { useEffect, useRef, useState } from 'react';

interface AutoVideoProps {
  /** The original .gif path from projects data — the encoded siblings
   *  (.webm/.mp4/.poster.jpg produced by scripts/gif-to-video.sh) are derived automatically. */
  src: string;
  alt?: string;
  className?: string;
}

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
 */
const AutoVideo = ({ src, alt = '', className = '' }: AutoVideoProps) => {
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

  return (
    <video
      ref={ref}
      className={className}
      poster={swap(src, '.poster.jpg')}
      aria-label={alt}
      muted
      loop
      playsInline
      autoPlay={!reduced}
      controls={reduced}
      preload="metadata"
    >
      <source src={swap(src, '.webm')} type="video/webm" />
      <source src={swap(src, '.mp4')} type="video/mp4" />
    </video>
  );
};

export default AutoVideo;
