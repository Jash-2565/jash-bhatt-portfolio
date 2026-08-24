import { useEffect, useRef } from 'react';
import { usePointerFine } from '../hooks/usePointerFine';
import {
  ANIMATIONS,
  CELL_H,
  CELL_W,
  framePosition,
  spriteStyle,
  type AnimationName,
} from '../config/lewis';

type Props = {
  animation: AnimationName;
  scale?: number;
  className?: string;
  /** Announced to screen readers; the sprite is decorative without one. */
  label?: string;
};

/**
 * One row of the Lewis spritesheet, looping forever regardless of its `repeats`
 * count — the strip in Explorations is a display case, not a behaviour. The pet
 * itself runs its own loop in LewisPet, where repeats decide when he settles.
 */
export default function LewisSprite({ animation, scale = 0.4, className = '', label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Reduced-motion visitors get frame 0 and nothing else. The point of the
  // strip is the character, and a still pose still makes that point.
  const animate = usePointerFine();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const spec = ANIMATIONS[animation];
    node.style.backgroundPosition = framePosition(spec.row, 0, scale);
    if (!animate) return;

    let raf = 0;
    let frame = 0;
    let clock = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      clock += dt;
      while (clock >= spec.frameDuration) {
        clock -= spec.frameDuration;
        frame = (frame + 1) % spec.frames;
        node.style.backgroundPosition = framePosition(spec.row, frame, scale);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animation, scale, animate]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...spriteStyle(scale), width: CELL_W * scale, height: CELL_H * scale }}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    />
  );
}
