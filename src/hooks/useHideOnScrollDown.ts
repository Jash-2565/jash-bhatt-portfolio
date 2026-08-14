import { useEffect, useRef, useState } from 'react';

/** Ignore sub-pixel and rubber-band jitter, so the bar doesn't flicker. */
const DELTA = 6;
/** Above this the bar is always shown — the top of a page is a resting state. */
const TOP_ZONE = 24;
/** Show again near the bottom, so navigation is reachable at the end of a page. */
const BOTTOM_ZONE = 80;

/**
 * True while the reader is scrolling down, so a fixed bottom bar can get out of
 * the way. On iOS the browser's own toolbar hides on the same gesture, which is
 * the point: the two stop competing for the bottom of the screen.
 *
 * `resetKey` re-shows the bar whenever it changes — pass the current page so a
 * navigation never lands on a hidden bar.
 */
export function useHideOnScrollDown(resetKey?: unknown) {
  const [hidden, setHidden] = useState(false);
  const [seenKey, setSeenKey] = useState(resetKey);
  const lastY = useRef(0);
  const frame = useRef(0);

  // Reset during render rather than in an effect — React's documented pattern for
  // adjusting state when an input changes. An effect here would show the bar one
  // paint after the new page had already rendered without it.
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setHidden(false);
  }

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      if (frame.current) return;
      // Everything that reads layout happens inside the frame, never in the
      // event handler — scrollHeight forces a reflow, and doing that on every
      // scroll event is the most expensive thing possible mid-swipe.
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const y = window.scrollY;
        const delta = y - lastY.current;
        lastY.current = y;

        if (y <= TOP_ZONE) {
          setHidden(false);
          return;
        }
        if (window.innerHeight + y >= document.documentElement.scrollHeight - BOTTOM_ZONE) {
          setHidden(false);
          return;
        }
        if (delta > DELTA) setHidden(true);
        else if (delta < -DELTA) setHidden(false);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return hidden;
}
