import { useEffect, useState } from 'react';

/**
 * True only on devices driven by a precise pointer (mouse/trackpad) whose owner
 * hasn't asked for reduced motion.
 *
 * Every cursor-linked flourish on this site — the custom cursor, tilt cards,
 * magnetic buttons, the hero particle network, the case-study hero parallax —
 * is meaningless on a touchscreen and costs real frames there. Gating on this
 * hook lets those components opt out entirely rather than run a mouse-only
 * effect that a phone can never trigger.
 *
 * Re-evaluates on change, so plugging in a mouse (or toggling Reduce Motion)
 * takes effect without a reload.
 */
export function usePointerFine(): boolean {
  const [fine, setFine] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return (
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const pointer = window.matchMedia('(pointer: fine)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setFine(pointer.matches && !motion.matches);

    pointer.addEventListener('change', sync);
    motion.addEventListener('change', sync);
    sync();

    return () => {
      pointer.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  return fine;
}
