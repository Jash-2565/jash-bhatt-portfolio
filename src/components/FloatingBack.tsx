import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { isScrollLocked } from '../utils/lockBodyScroll';

/** Same clearance BackToTop keeps from the footer. */
const FOOTER_CLEARANCE = 80;

/**
 * "Back to projects", kept in reach on a case study once the one in its
 * header has scrolled away — a case study runs to several thousand pixels,
 * and the only other ways out were scrolling all the way back up or down to
 * the link at the end.
 *
 * Phones: bottom-left, under the thumb, opposite BackToTop. Desktop: top-left
 * under the nav, on the content's left edge — the bottom-left corner is where
 * Lewis walks the margin on a case study.
 *
 * Rendered by App outside `.page-push`: a transform there (the mobile menu
 * pushing the page back) would re-anchor a fixed element to the page.
 */
export default function FloatingBack({ onBack }: { onBack: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // The menu's scroll lock reads as a jump to the top; hold still.
      if (isScrollLocked()) return;
      const headerBack = document.querySelector('#main [data-project-hero] button');
      const navHeight = document.querySelector('nav.nav-bar')?.getBoundingClientRect().height ?? 0;
      const pastHeader = headerBack ? headerBack.getBoundingClientRect().bottom < navHeight : false;
      const { scrollHeight } = document.documentElement;
      const atFooter = window.innerHeight + window.scrollY > scrollHeight - FOOTER_CLEARANCE;
      setVisible(pastHeader && !atFooter);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => onBack()}
      data-visible={visible}
      // Out of the tab order and the accessibility tree while hidden, as
      // BackToTop is: the header link is the way back while it's on screen.
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      className="floating-back surface press fixed z-30 inline-flex items-center gap-2 min-h-11 px-4 rounded-sm text-sm font-medium text-ink-body hover:text-accent shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
        left-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))]
        lg:bottom-auto lg:top-[calc(var(--nav-h)+1rem)] lg:left-[max(3rem,calc((100vw-84rem)/2+3rem))]"
    >
      <ArrowLeft size={18} aria-hidden="true" />
      Back to projects
    </button>
  );
}
