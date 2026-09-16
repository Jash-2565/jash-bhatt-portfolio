import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Floating back-to-top button — fades in after the user scrolls past the hero.
// Shown at every width. It steps aside once the footer scrolls into view: on a
// phone the centred footer line runs under the button's corner.
const FOOTER_CLEARANCE = 80;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const { scrollHeight } = document.documentElement;
      const atFooter = window.innerHeight + window.scrollY > scrollHeight - FOOTER_CLEARANCE;
      setVisible(window.scrollY > 700 && !atFooter);
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
      className={`surface surface-hover fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 flex h-12 w-12 items-center justify-center rounded-sm text-accent transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}
