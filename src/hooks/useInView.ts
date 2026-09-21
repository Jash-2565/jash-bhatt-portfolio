import { useEffect, useRef, useState } from 'react';

type UseInViewOptions = {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
};

// An IntersectionObserver only reports a *change* in intersection between two
// sampled frames. An element that travels from below the viewport to above it
// within a single frame — a scrollbar drag, a flick that drops a frame while
// images decode, any programmatic jump — is never reported at all: both
// samples read "not intersecting", no threshold is crossed, and a `once`
// reveal keyed on the observer stays masked for the rest of the page's life.
//
// So everything still waiting also gets a rect check on one shared scroll
// handler. Anything that has ended up entirely above the viewport was scrolled
// past rather than missed, and is revealed on the spot — off-screen, so
// nothing is seen to jump. The sweep only does work after a scroll jump larger
// than half the viewport, which is the smallest move that can skip an element,
// so ordinary scrolling costs one comparison per frame.
const waiting = new Set<() => void>();
let sweepFrame = 0;
let lastSweepY = 0;

const sweep = () => {
  sweepFrame = 0;
  const y = window.scrollY;
  const jumped = Math.abs(y - lastSweepY) > window.innerHeight / 2;
  lastSweepY = y;
  if (!jumped) return;
  // Copied: a check that fires removes itself from the set.
  [...waiting].forEach((check) => check());
};

const onScroll = () => {
  if (sweepFrame) return;
  sweepFrame = requestAnimationFrame(sweep);
};

const watch = (check: () => void) => {
  if (waiting.size === 0) {
    lastSweepY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  waiting.add(check);
};

const unwatch = (check: () => void) => {
  if (!waiting.delete(check) || waiting.size > 0) return;
  window.removeEventListener('scroll', onScroll);
  if (sweepFrame) {
    cancelAnimationFrame(sweepFrame);
    sweepFrame = 0;
  }
};

// Lightweight IntersectionObserver hook for scroll-triggered reveals.
// Defaults are tuned so elements reveal slightly before they fully enter view.
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
) {
  const { rootMargin = '0px 0px -10% 0px', threshold = 0.12, once = true } = options;
  const ref = useRef<T | null>(null);
  // Without IntersectionObserver there is nothing to wait for, so start
  // revealed. Deciding this in the initialiser rather than in the effect keeps
  // the effect from calling setState during mount, which cascades renders.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    let check: (() => void) | null = null;

    const settle = () => {
      setInView(true);
      observer.unobserve(node);
      if (check) unwatch(check);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (once) settle();
            else setInView(true);
          } else if (!once) {
            setInView(false);
          } else if (
            entry.rootBounds &&
            entry.boundingClientRect.bottom <= entry.rootBounds.top
          ) {
            // The first observation of an element the page already sits below —
            // mounting a view at a restored scroll position, for one. There is
            // no reveal left to watch for, so land it.
            settle();
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(node);

    if (once) {
      check = () => {
        if (node.getBoundingClientRect().bottom > 0) return;
        settle();
      };
      watch(check);
    }

    return () => {
      observer.disconnect();
      if (check) unwatch(check);
    };
  }, [rootMargin, threshold, once]);

  return { ref, inView };
}
