import { Home, Briefcase, User, Mail } from 'lucide-react';
import type { MobilePage } from '../types';

const TABS: { page: MobilePage; label: string; Icon: typeof Home }[] = [
  { page: 'home', label: 'Home', Icon: Home },
  { page: 'work', label: 'Work', Icon: Briefcase },
  { page: 'about', label: 'About', Icon: User },
  { page: 'contact', label: 'Contact', Icon: Mail },
];

type Props = {
  /** Null while a case study is open — no tab owns that view. */
  activePage: MobilePage | null;
  onNavigate: (page: MobilePage) => void;
  /** Slid out of view while the reader scrolls down. */
  hidden?: boolean;
};

/**
 * Bottom tab bar for the paged mobile layout. Hidden at `lg`, where the site
 * reverts to one scrolling page with the header's anchor nav.
 *
 * The gallery is a sub-page of Work rather than a fifth tab, so it reports Work
 * as active — see how App maps it before passing `activePage`.
 */
export default function MobileTabBar({ activePage, onNavigate, hidden = false }: Props) {
  return (
    <nav
      aria-label="Primary"
      // Only the transform moves. The layout padding elsewhere stays pinned to
      // --tabbar-h, so hiding the bar never reflows the page.
      className={`tabbar glass-menu lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-white/10 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-transform duration-[250ms] ease-out ${
        hidden ? 'translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ page, label, Icon }) => {
          const isActive = activePage === page;
          return (
            <li key={page}>
              <button
                type="button"
                onClick={() => onNavigate(page)}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex h-14 w-full flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                  isActive ? 'text-[#01F5D1]' : 'text-slate-400 active:text-[#9EF7EA]'
                }`}
              >
                {/* Colour carries the active state on its own — no pill or other
                    shape behind the icon. */}
                <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                <span className={`text-[0.65rem] leading-none tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
