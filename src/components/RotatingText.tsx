import { useEffect, useMemo, useState } from 'react';

type RotatingTextProps = {
  phrases: string[];
  /** Hold time on each phrase before it swaps. */
  holdMs?: number;
  /** Length of the fade between phrases; must match the duration class below. */
  fadeMs?: number;
  className?: string;
};

/**
 * Cycles a list of phrases with a short fade-and-lift between them.
 *
 * This replaced a character-by-character typewriter. The typing effect only
 * reads as intentional when a blinking caret trails it, and the caret plus the
 * mono face it needed were the two things making the hero look like a console.
 * A crossfade keeps the rotation without borrowing the terminal idiom.
 *
 * Falls back to a static first phrase under prefers-reduced-motion.
 */
export default function RotatingText({
  phrases,
  holdMs = 2600,
  fadeMs = 320,
  className = '',
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(true);

  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    if (reduceMotion || phrases.length < 2) return;

    // Fade out, swap the text while it is invisible, then fade back in.
    const out = window.setTimeout(() => setShown(false), holdMs);
    const swap = window.setTimeout(() => {
      setIndex((i) => (i + 1) % phrases.length);
      setShown(true);
    }, holdMs + fadeMs);

    return () => {
      clearTimeout(out);
      clearTimeout(swap);
    };
  }, [index, phrases, holdMs, fadeMs, reduceMotion]);

  if (reduceMotion) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span
      className={`inline-block transition-all duration-300 ease-out ${
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      } ${className}`}
      aria-live="polite"
    >
      {phrases[index % phrases.length]}
    </span>
  );
}
