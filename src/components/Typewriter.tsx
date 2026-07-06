import { useEffect, useMemo, useState } from 'react';

type TypewriterProps = {
  phrases: string[];
  typingSpeed?: number; // ms per character typed
  deletingSpeed?: number; // ms per character deleted
  pauseMs?: number; // hold time once a phrase is fully typed
  className?: string;
};

// Cycles through phrases with a type/delete effect and a blinking caret.
// Falls back to a static first phrase when the user prefers reduced motion.
export default function Typewriter({
  phrases,
  typingSpeed = 55,
  deletingSpeed = 28,
  pauseMs = 2100,
  className = '',
}: TypewriterProps) {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    if (reduceMotion || phrases.length === 0) return;
    const current = phrases[phraseIndex % phrases.length];
    let timeout: number;

    if (!deleting) {
      if (text.length < current.length) {
        timeout = window.setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
      } else {
        timeout = window.setTimeout(() => setDeleting(true), pauseMs);
      }
    } else if (text.length > 0) {
      timeout = window.setTimeout(() => setText(current.slice(0, text.length - 1)), deletingSpeed);
    } else {
      timeout = window.setTimeout(() => {
        setDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }, deletingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseMs, reduceMotion]);

  if (reduceMotion) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span className={className} aria-label={phrases[phraseIndex % phrases.length]}>
      {text}
      <span className="typewriter-caret" aria-hidden="true" />
    </span>
  );
}
