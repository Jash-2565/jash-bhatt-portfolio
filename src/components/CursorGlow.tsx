import { useEffect, useRef } from 'react';
import { usePointerFine } from '../hooks/usePointerFine';

/**
 * How long the ring takes to close half the distance to the cursor. Lower is
 * snappier. 15ms reproduces the trail the old per-frame easing gave on a 120Hz
 * display — the feel this effect was tuned to — and now holds it everywhere.
 */
const RING_HALF_LIFE_MS = 15;

// A soft cyan glow that trails the cursor across the page, a precise dot pinned
// to the exact pointer position, and a ring that eases behind the dot and grows
// over interactive elements. Disabled on touch devices and under reduced-motion.
// Rendered above content but pointer-transparent.
export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const enabled = usePointerFine();

  useEffect(() => {
    if (!enabled) return;

    // Hide the native OS cursor so only the custom cursor shows.
    document.documentElement.classList.add('hide-native-cursor');

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let visible = false;
    // Latest element under the pointer, resolved to a hover state once per
    // frame rather than on every event — `closest()` walks the tree, and a
    // high-polling mouse fires mousemove far more often than the screen paints.
    let hoverNode: Element | null = null;
    let lastHoverNode: Element | null = null;
    // What was last written to the DOM, so a still pointer writes nothing.
    let drawnPointerX = NaN;
    let drawnPointerY = NaN;
    let drawnRingX = NaN;
    let drawnRingY = NaN;

    const setVisible = (on: boolean) => {
      if (visible === on) return;
      visible = on;
      const v = on ? '1' : '0';
      if (glowRef.current) glowRef.current.style.opacity = v;
      if (dotRef.current) dotRef.current.style.opacity = v;
      if (ringRef.current) ringRef.current.style.opacity = v;
    };

    // Record the pointer and get out. Every DOM write happens in `tick` below:
    // mousemove can fire several times between two paints, and moving the 460px
    // glow repaints a large area, so doing that work per event was burning the
    // frame budget the ring animation depends on.
    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      hoverNode = e.target instanceof Element ? e.target : null;
      setVisible(true);
    };

    // Hide the cursor when it leaves the window or the tab loses focus so a stale
    // dot/ring isn't left frozen on screen.
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    let last = performance.now();

    const tick = (now: number) => {
      // Ease the ring toward the cursor by a fixed fraction of the gap per unit
      // of TIME, not per frame. The old `gap * 0.32` closed 32% of the distance
      // each frame, so the ring's speed rode on the refresh rate: ~18ms of trail
      // on the 120Hz display it was tuned against, but ~35ms on an ordinary 60Hz
      // screen and ~70ms whenever frames dropped — a 6x spread, and the drag
      // that shows up on the live site. Halving the gap every RING_HALF_LIFE_MS
      // instead makes the trail the same at 60Hz, 120Hz, or mid-stutter.
      const dt = Math.min(now - last, 100);
      last = now;
      const ease = 1 - Math.pow(2, -dt / RING_HALF_LIFE_MS);

      // Settle exactly rather than easing forever across ever-smaller fractions.
      if (Math.abs(targetX - ringX) < 0.05 && Math.abs(targetY - ringY) < 0.05) {
        ringX = targetX;
        ringY = targetY;
      } else {
        ringX += (targetX - ringX) * ease;
        ringY += (targetY - ringY) * ease;
      }

      // The dot and glow stay pinned to the exact pointer position — writing
      // them here rather than in the event handler costs nothing visually,
      // since the browser only paints on a frame anyway.
      if (targetX !== drawnPointerX || targetY !== drawnPointerY) {
        drawnPointerX = targetX;
        drawnPointerY = targetY;
        const at = `translate(${targetX}px, ${targetY}px)`;
        if (dotRef.current) dotRef.current.style.transform = at;
        if (glowRef.current) glowRef.current.style.transform = at;
      }

      if (ringX !== drawnRingX || ringY !== drawnRingY) {
        drawnRingX = ringX;
        drawnRingY = ringY;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
        }
      }

      if (hoverNode !== lastHoverNode) {
        lastHoverNode = hoverNode;
        const interactive = hoverNode?.closest(
          'a, button, [role="button"], input, textarea, video'
        );
        if (ringRef.current) {
          ringRef.current.dataset.hover = interactive ? 'true' : 'false';
        }
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    window.addEventListener('blur', onLeave);
    last = performance.now();
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('blur', onLeave);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('hide-native-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" data-hover="false" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
