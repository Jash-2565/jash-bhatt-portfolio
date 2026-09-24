import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Floating back-to-top button — fades in after the user scrolls past the hero.
// Shown at every width. It steps aside once the footer scrolls into view: on a
// phone the centred footer line runs under the button's corner.
const FOOTER_CLEARANCE = 80;

/** Mirrors `ui.shell` (max-w-[84rem], lg:px-12), as LewisPet does: the right
    edge of the content column. */
const SHELL_MAX_W = 1344;
const SHELL_PAD = 48;
/** The button's left edge: 20px in from the viewport edge, 48px wide. */
const BUTTON_INSET = 20 + 48;

/** True when the button fits in the gutter beside the content column. Below
    that — phones, tablets, narrow laptop windows — it sits on top of body copy. */
const fitsInGutter = () =>
  window.innerWidth - BUTTON_INSET >=
  (window.innerWidth + Math.min(window.innerWidth, SHELL_MAX_W)) / 2 - SHELL_PAD;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // NaN so the first call (on mount, for a page restored mid-scroll) always
    // evaluates, and counts as not scrolling up.
    let lastY = NaN;
    const onScroll = () => {
      const { scrollHeight } = document.documentElement;
      const y = window.scrollY;
      const atFooter = window.innerHeight + y > scrollHeight - FOOTER_CLEARANCE;
      // Where it would cover text, it only appears on the way back up — the
      // moment someone wants it — and gets out of the way while they read down.
      // It was sitting on case-study copy and the "Tap to zoom" chips on phones.
      const scrollingUp = y < lastY;
      if (y !== lastY) {
        setVisible(
          y > 700 && !atFooter && (fitsInGutter() || scrollingUp)
        );
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      // Out of the tab order while invisible. It renders before everything
      // else in the tree, so left focusable it was the *first* thing a
      // keyboard user reached on the page — an invisible button, ahead of the
      // skip link.
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      className={`surface surface-hover fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 flex h-12 w-12 items-center justify-center rounded-sm text-accent transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
