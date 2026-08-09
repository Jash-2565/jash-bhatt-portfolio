import { useRef } from 'react';
import type { ReactNode } from 'react';
import { usePointerFine } from '../hooks/usePointerFine';

type MagneticProps = {
  children: ReactNode;
  className?: string;
  strength?: number; // px of pull toward the cursor
  as?: 'div' | 'button' | 'a';
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
};

// Wraps content so it drifts toward the cursor on hover and springs back on
// leave. Pointer-only; touch and reduced-motion users get a static wrapper with
// no mouse handlers, so a tap can't leave the element translated off-centre.
export default function Magnetic({
  children,
  className = '',
  strength = 16,
  as = 'div',
  onClick,
  href,
  target,
  rel,
  ariaLabel,
}: MagneticProps) {
  const ref = useRef<HTMLElement>(null);
  const pointerFine = usePointerFine();

  const handleMove = (event: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${(x / rect.width) * strength}px, ${(y / rect.height) * strength}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  const shared = pointerFine
    ? {
        ref: ref as React.Ref<never>,
        className: `magnetic-btn ${className}`,
        onMouseMove: handleMove,
        onMouseLeave: reset,
      }
    : { className };

  if (as === 'a') {
    return (
      <a {...shared} href={href} target={target} rel={rel} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  if (as === 'button') {
    return (
      <button {...shared} type="button" onClick={onClick} aria-label={ariaLabel}>
        {children}
      </button>
    );
  }

  return <div {...shared}>{children}</div>;
}
