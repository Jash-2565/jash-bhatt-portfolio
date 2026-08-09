import { cloneElement, isValidElement } from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useInView } from '../hooks/useInView';

type RevealVariant = 'fade-up' | 'fade' | 'slide-left' | 'slide-right' | 'grow-width';

type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number; // ms
  duration?: number; // ms
  as?: 'div' | 'span' | 'section' | 'li';
  className?: string;
  style?: CSSProperties;
  threshold?: number;
  asChild?: boolean; // apply styles to the single child element (no wrapper div)
};

const hiddenTransform: Record<RevealVariant, string> = {
  'fade-up': 'translate3d(0, 18px, 0)',
  fade: 'none',
  'slide-left': 'translate3d(-24px, 0, 0)',
  'slide-right': 'translate3d(24px, 0, 0)',
  'grow-width': 'scaleX(0)',
};

// Wrap content in a scroll-triggered reveal. Respects prefers-reduced-motion via the
// `.reveal-reduced` body selector set in index.css (collapses to a short fade).
export default function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 650,
  as = 'div',
  className = '',
  style,
  threshold,
  asChild = false,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold });

  const revealStyle: CSSProperties = {
    opacity: inView ? 1 : 0,
    transform: inView ? 'none' : hiddenTransform[variant],
    transformOrigin: variant === 'grow-width' ? 'left center' : undefined,
    transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    // Reveals are one-shot (`useInView` unobserves after firing), so holding a
    // compositor layer afterwards just burns memory — and there are dozens of
    // these on a page. Release the hint once the element has arrived.
    willChange: inView ? 'auto' : 'opacity, transform',
    ...style,
  };

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; style?: CSSProperties; ref?: unknown }>;
    const mergedClassName = [child.props.className, className].filter(Boolean).join(' ');
    return cloneElement(child, {
      ref,
      className: mergedClassName,
      style: { ...revealStyle, ...(child.props.style ?? {}) },
    });
  }

  const Tag = as as 'div';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={revealStyle}
    >
      {children}
    </Tag>
  );
}
