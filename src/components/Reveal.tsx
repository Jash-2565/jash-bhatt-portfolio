import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../hooks/useInView';

type WipeVariant = 'wipe-right' | 'wipe-left' | 'wipe-down' | 'grow-width';
type RiseVariant = 'rise' | 'rise-soft';
type RevealVariant = WipeVariant | RiseVariant | 'fade';

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
const wipes: Record<WipeVariant, { position: string; from: string }> = {
  'wipe-right': { position: 'left center', from: '0% 100%' },
  'wipe-left': { position: 'right center', from: '0% 100%' },
  'wipe-down': { position: 'center top', from: '100% 0%' },
  'grow-width': { position: 'left center', from: '0% 100%' },
};

// Fade + rise, in px of travel. For content that reads as a block rather than
// as something being drawn — cards, prose — where a travelling edge is more
// event than the content wants.
//
// 12px is the distance the `fadeInUp` keyframe in tailwind.config.js already
// uses for the hero's on-load entrance, so these enter on a distance the page
// has established rather than a new one. `rise-soft` is half that: enough to
// register as motion, little enough that a long paragraph doesn't appear to
// slide into place.
const rises: Record<RiseVariant, number> = { rise: 12, 'rise-soft': 6 };

const isWipe = (v: RevealVariant): v is WipeVariant => v in wipes;
const isRise = (v: RevealVariant): v is RiseVariant => v in rises;

const SOLID = 'linear-gradient(#000, #000)';

// Wrap content in a scroll-triggered reveal. A wipe draws the element in with a
// travelling edge, like a plotter laying it down, with no opacity ramp — so
// text never sits at partial alpha halfway through a scroll. A rise fades and
// lifts the element as one block instead.
//
// Every inline property is dropped once the reveal lands, rather than left on
// the node, so nothing downstream — hover lifts, the 3D tilt on project media,
// a `position: sticky` child — is painting inside a mask or under a transform
// for the rest of its life.
//
// Reduced motion is handled globally by the `transition-duration: 0.001ms`
// rule in index.css, which lands the element drawn rather than hidden. That
// works because this is a transition; converting it to @keyframes would escape
// that rule and need its own entry in the `animation: none` list.
export default function Reveal({
  children,
  variant = 'wipe-right',
  delay = 0,
  duration = 780,
  as = 'div',
  className = '',
  style,
  threshold,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold });
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!inView || settled) return;
    // A small margin past the transition so nothing is dropped mid-reveal.
    const t = window.setTimeout(() => setSettled(true), delay + duration + 80);
    return () => window.clearTimeout(t);
  }, [inView, settled, delay, duration]);

  // easeOutCubic. The wipe used to run on a symmetric in-out curve, which
  // spends its first third accelerating — at this length that reads as a
  // hesitation before the edge commits. Starting at speed and settling
  // instead keeps a longer reveal feeling smooth rather than slow.
  const ease = 'cubic-bezier(0.33, 1, 0.68, 1)';

  const wipe = isWipe(variant) ? wipes[variant] : null;
  const travel = isRise(variant) ? rises[variant] : null;
  const ramps = variant === 'fade' || travel !== null;

  // Once the reveal has landed every inline animation property is dropped —
  // mask, opacity, transform, and the transition itself — leaving the node
  // under pure CSS control.
  //
  // This matters most where the Reveal *is* the card: the panes in
  // CreativeExplorations carry `.surface-hover`, which asks for a 2px
  // `translateY` lift on hover over 180ms. An inline `transform` left on that
  // node would outrank the hover rule forever, and an inline `transition` that
  // omits `transform` — which this component used to write unconditionally —
  // resets transition-property and leaves the lift with no transition at all,
  // so it snaps. Clearing both at settle fixes each.
  const animating: CSSProperties = settled
    ? {}
    : {
        ...(wipe && {
          maskImage: SOLID,
          WebkitMaskImage: SOLID,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: wipe.position,
          WebkitMaskPosition: wipe.position,
          maskSize: inView ? '100% 100%' : wipe.from,
          WebkitMaskSize: inView ? '100% 100%' : wipe.from,
        }),
        ...(ramps && { opacity: inView ? 1 : 0 }),
        ...(travel !== null && {
          transform: inView ? 'translateY(0)' : `translateY(${travel}px)`,
        }),
        // Only the properties this variant actually drives. A wipe must never
        // name `transform` here — naming it is what broke the hover lift.
        transition: [
          ...(wipe ? ['mask-size', '-webkit-mask-size'] : []),
          ...(ramps ? ['opacity'] : []),
          ...(travel !== null ? ['transform'] : []),
        ]
          .map((property) => `${property} ${duration}ms ${ease} ${delay}ms`)
          .join(', '),
      };

  // Caller style last, so an explicit transform or opacity still wins.
  const revealStyle: CSSProperties = { ...animating, ...style };

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
