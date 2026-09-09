import { useEffect, useRef, useState } from 'react';

type UseInViewOptions = {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return { ref, inView };
}
