import { useEffect, useRef } from 'react';
import { usePointerFine } from '../hooks/usePointerFine';

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

    const setVisible = (on: boolean) => {
      if (visible === on) return;
      visible = on;
      const v = on ? '1' : '0';
      if (glowRef.current) glowRef.current.style.opacity = v;
      if (dotRef.current) dotRef.current.style.opacity = v;
      if (ringRef.current) ringRef.current.style.opacity = v;
    };

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setVisible(true);
      // The dot tracks the exact pointer position with no lag, so there's always
      // a precise point to follow; the ring trails for feel.
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${targetX}px, ${targetY}px)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${targetX}px, ${targetY}px)`;
      }
      const interactive = (e.target as HTMLElement)?.closest(
        'a, button, [role="button"], input, textarea, video'
      );
      if (ringRef.current) {
        ringRef.current.dataset.hover = interactive ? 'true' : 'false';
      }
    };

    // Hide the cursor when it leaves the window or the tab loses focus so a stale
    // dot/ring isn't left frozen on screen.
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    // Ring eases toward the cursor for a subtle trailing feel — snappy enough to
    // stay close to the pointer.
    const tick = () => {
      ringX += (targetX - ringX) * 0.32;
      ringY += (targetY - ringY) * 0.32;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    window.addEventListener('blur', onLeave);
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
