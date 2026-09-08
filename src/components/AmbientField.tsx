import { useEffect, useRef } from 'react';

// The circuit tile's size. Shifting by scrollY modulo this makes the pattern
// scroll with the page while the transform stays under one tile — no giant
// translate values, and the traces never run out however far you scroll.
// Must match `background-size` on .ambient-grid__rules, or the wrap will jump.
const CELL = 512;

/**
 * The ambient field the glass panes refract, in three layers:
 *
 *   wash   — fixed. Ambient light, drifting on its own slow cycle. Stays put
 *            because lighting that slid with the page would read as a moving
 *            light source rather than a lit room.
 *   grid   — blueprint rules. Tracks scroll 1:1, so the background travels
 *            with the content instead of sitting pinned behind it.
 *   vignette — fixed, above the grid, keeping the corners deep.
 *
 * The mask lives on the wrapper and the transform on the inner element: if the
 * masked element moved, its fade would slide off with it.
 */
export default function AmbientField() {
  const rulesRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = rulesRef.current;
    if (!el) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      // Negative: the page moves up as scrollY grows, so the grid must too.
      el.style.setProperty('--grid-shift', `${-(window.scrollY % CELL)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="ambient-field" aria-hidden="true">
      <span className="ambient-grid">
        <span className="ambient-grid__rules" ref={rulesRef} />
      </span>
    </div>
  );
}
