import { useRef } from 'react';
import type { ReactNode } from 'react';

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  strength?: number; // px of pull at the edges
};

// Wraps a button/link so it drifts toward the cursor while hovered, then springs
// back on leave. Pointer-only — reduced-motion users get a static control.
export default function MagneticButton({
  children,
  className = '',
  onClick,
  as = 'button',
  href,
  target,
  rel,
  ariaLabel,
  strength = 14,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);

  const handleMove = (event: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${(x / rect.width) * strength * 2}px, ${(y / rect.height) * strength * 2}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  const shared = {
    ref: ref as React.Ref<never>,
    className: `magnetic-btn ${className}`,
    onMouseMove: handleMove,
    onMouseLeave: reset,
    onClick,
    'aria-label': ariaLabel,
  };

  if (as === 'a') {
    return (
      <a {...shared} href={href} target={target} rel={rel}>
        {children}
      </a>
    );
  }
  return (
    <button {...shared} type="button">
      {children}
    </button>
  );
}
