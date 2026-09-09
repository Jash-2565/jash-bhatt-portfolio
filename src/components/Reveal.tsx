import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../hooks/useInView';

type RevealVariant = 'wipe-right' | 'wipe-left' | 'wipe-down' | 'fade' | 'grow-width';

type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number; // ms
  duration?: number; // ms
  as?: 'div' | 'span' | 'section' | 'li';
  className?: string;
  style?: CSSProperties;
  threshold?: number;
};

// Each wipe is a solid mask anchored to one edge, grown from nothing to full
// size. The anchor decides which way the drawing edge travels.
//
// This is deliberately NOT clip-path. An element hidden with
// `clip-path: inset(0 100% 0 0)` reports intersectionRatio 0 to
// IntersectionObserver even when it is squarely in the viewport — so a reveal
// keyed on the observer can never fire, and the content stays hidden for good.
// A mask paints nothing in exactly the same way but leaves the observer's
// geometry untouched, which is what makes it safe here.
const wipes: Record<Exclude<RevealVariant, 'fade'>, { position: string; from: string }> = {
  'wipe-right': { position: 'left center', from: '0% 100%' },
  'wipe-left': { position: 'right center', from: '0% 100%' },
  'wipe-down': { position: 'center top', from: '100% 0%' },
  'grow-width': { position: 'left center', from: '0% 100%' },
};

const SOLID = 'linear-gradient(#000, #000)';

// Wrap content in a scroll-triggered reveal: the element is drawn in by a
// travelling edge, like a plotter laying it down. There is no opacity ramp, so
// text never sits at partial alpha halfway through a scroll.
//
// The mask is dropped entirely once the wipe finishes rather than left at full
// size, so nothing downstream — hover lifts, the 3D tilt on project media, a
// `position: sticky` child — is painting inside a mask for the rest of its life.
//
// Reduced motion is handled globally by the `transition-duration: 0.001ms`
// rule in index.css, which lands the element drawn rather than hidden.
export default function Reveal({
  children,
  variant = 'wipe-right',
  delay = 0,
  duration = 520,
  as = 'div',
  className = '',
  style,
  threshold,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold });
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!inView || settled) return;
    // A small margin past the transition so the mask is never dropped mid-wipe.
    const t = window.setTimeout(() => setSettled(true), delay + duration + 80);
    return () => window.clearTimeout(t);
  }, [inView, settled, delay, duration]);

  const isFade = variant === 'fade';
  const ease = 'cubic-bezier(0.65, 0, 0.35, 1)';
  const wipe = isFade ? null : wipes[variant];

  // Once settled the mask properties are omitted entirely, leaving the element
  // painting normally for the rest of its life.
  const maskStyle: CSSProperties =
    wipe && !settled
      ? {
          maskImage: SOLID,
          WebkitMaskImage: SOLID,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: wipe.position,
          WebkitMaskPosition: wipe.position,
          maskSize: inView ? '100% 100%' : wipe.from,
          WebkitMaskSize: inView ? '100% 100%' : wipe.from,
        }
      : {};

  const revealStyle: CSSProperties = {
    ...maskStyle,
    opacity: isFade && !inView ? 0 : 1,
    transition: `mask-size ${duration}ms ${ease} ${delay}ms, -webkit-mask-size ${duration}ms ${ease} ${delay}ms, opacity ${duration}ms ${ease} ${delay}ms`,
    ...style,
  };

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
