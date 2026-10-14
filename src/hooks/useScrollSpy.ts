import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Scroll spy. The nav marks whichever section crosses a line 35% of the way
 * down the screen — where the eye is reading, not wherever the most pixels
 * happen to be.
 *
 * It used to mark the section with the highest intersectionRatio, the share
 * of the section on screen. That penalises tall sections: Work runs ~6,000px,
 * so even filling the viewport it scored ~0.15, and a short About peeking in
 * at the bottom outscored it. The More work list and the Explorations card
 * were not observed at all, so reading them marked About. Sections tagged
 * `data-nav` say which item they belong to, so all three of those mark Work.
 *
 * `enabled` is false off the home view, and on the paged mobile layout, which
 * mounts one section at a time — there is nothing to spy on, and `mobilePage`
 * is the source of truth for the active tab there.
 */
export function useScrollSpy(
  enabled: boolean,
  isManualScroll: RefObject<boolean>,
  setActiveSection: (section: string) => void
) {
  useEffect(() => {
    if (!enabled) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-nav]'));
    if (elements.length === 0) return;

    // Kept outside the callback, which only reports changes: after a manual
    // scroll ends, the section already on the line is still known.
    const onLine = new Set<HTMLElement>();
    const atPageBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
    const markLine = () => {
      if (isManualScroll.current) return;
      // Contact is short enough that it may never reach the line, so the
      // bottom of the page always means Contact. Checked here as well as on
      // scroll: the observer can fire after the scroll handler and would
      // otherwise put About back.
      if (atPageBottom()) {
        setActiveSection('contact');
        return;
      }
      const current = elements.find((el) => onLine.has(el));
      if (current?.dataset.nav) setActiveSection(current.dataset.nav);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) onLine.add(el);
          else onLine.delete(el);
        });
        markLine();
      },
      // A one-percent band at 35% of the viewport height.
      { rootMargin: '-35% 0px -64% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));

    // Reaching the bottom marks Contact, and leaving it hands control back to
    // the line. The section on the line often hasn't changed on the way back
    // up (About is still there), so no observer entry fires, and Contact used
    // to stay marked all the way up through About.
    let wasAtBottom = false;
    const handleBottom = () => {
      const bottom = atPageBottom();
      if (bottom !== wasAtBottom) markLine();
      wasAtBottom = bottom;
    };
    window.addEventListener('scroll', handleBottom, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleBottom);
    };
  }, [enabled, isManualScroll, setActiveSection]);
}
