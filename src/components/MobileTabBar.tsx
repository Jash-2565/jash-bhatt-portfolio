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
};

/**
 * Bottom tab bar for the paged mobile layout. Hidden at `lg`, where the site
 * reverts to one scrolling page with the header's anchor nav.
 *
 * The gallery is a sub-page of Work rather than a fifth tab, so it reports Work
 * as active — see how App maps it before passing `activePage`.
 */
export default function MobileTabBar({ activePage, onNavigate }: Props) {
  return (
    <nav
      aria-label="Primary"
      className="glass-menu lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-white/10 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
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
                {/* The pill sits behind the icon only, so the label baseline
                    stays put between active and inactive tabs. */}
                <span
                  className={`flex h-6 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
                    isActive ? 'bg-[#01F5D1]/15' : 'bg-transparent'
                  }`}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                </span>
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
