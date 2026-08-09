import { useRef } from 'react';
import type { ReactNode } from 'react';
import { usePointerFine } from '../hooks/usePointerFine';

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  maxTilt?: number; // degrees
};

// Subtle 3D tilt that follows the cursor. Pointer-only — touch devices and
// reduced-motion users get a static card, with no handlers attached at all:
// a tap can synthesize a mousemove without a matching mouseleave, which used to
// leave the card stuck mid-tilt.
export default function TiltCard({ children, className = '', maxTilt = 5 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pointerFine = usePointerFine();

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  if (!pointerFine) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </div>
  );
}
