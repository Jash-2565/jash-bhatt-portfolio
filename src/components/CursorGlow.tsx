import { useEffect, useRef, useState } from 'react';

// A soft cyan glow that trails the cursor across the page, plus a small ring that
// grows over interactive elements. Disabled on touch devices and under
// reduced-motion. Rendered above content but pointer-transparent.
export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return (
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
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

    // Ring eases toward the cursor for a subtle trailing feel.
    const tick = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" data-hover="false" aria-hidden="true" />
    </>
  );
}
