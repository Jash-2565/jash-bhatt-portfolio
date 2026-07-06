import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Floating back-to-top button — fades in after the user scrolls past the hero.
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full border border-slate-700 bg-slate-900/90 text-[#01F5D1] shadow-lg backdrop-blur transition-all duration-300 hover:border-[#01F5D1] hover:shadow-[0_0_24px_-6px_rgba(1,245,209,0.5)] hover:-translate-y-1 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}
