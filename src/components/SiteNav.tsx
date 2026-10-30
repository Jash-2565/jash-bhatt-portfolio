import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import MenuIcon from './MenuIcon';
import { ui } from '../config/ui';
import { PUBLIC_URL } from '../utils/getBaseUrl';
import { isScrollLocked, lockBodyScroll } from '../utils/lockBodyScroll';
import { sectionForAnchor } from '../utils/routes';
import type { MobilePage, View } from '../types';

interface SiteNavProps {
  navRef: RefObject<HTMLElement | null>;
  /** The item to mark: see `activeNavItem` in useSiteNavigation. */
  activeNavItem: string;
  currentView: View;
  mobilePage: MobilePage;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  scrollToSection: (sectionId: string) => void;
}

/** The fixed nav bar, and below `lg` the hamburger menu it opens. */
const SiteNav = ({
  navRef,
  activeNavItem,
  currentView,
  mobilePage,
  isMenuOpen,
  setIsMenuOpen,
  scrollToSection,
}: SiteNavProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const navButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const [underline, setUnderline] = useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false });

  const toggleMenu = () => {
    if (!isMenuOpen) {
      // The page behind sinks away from the nav as the menu opens (`.page-push`
      // in index.css). It scales about the top of the screen, which on a
      // scrolled page is this far down the content — read now, before the
      // scroll lock drops scrollY to 0.
      document.documentElement.style.setProperty('--menu-push-y', `${window.scrollY}px`);
    }
    setIsMenuOpen(!isMenuOpen);
  };

  // Nav surface condenses once content scrolls underneath it. Kept separate from
  // the section-spy handler above, which bails out on manual scroll and on the
  // project view — the nav should thicken in both cases.
  useEffect(() => {
    const onScroll = () => {
      // The menu's scroll lock drops scrollY to 0; taken at face value the
      // nav's ground faded out under the opening menu.
      if (isScrollLocked()) return;
      setIsScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active-nav underline — recalc when active section, view, or resize changes
  useEffect(() => {
    const recalc = () => {
      if (!navItemsRef.current) {
        setUnderline((prev) => ({ ...prev, visible: false }));
        return;
      }
      const activeBtn = navButtonRefs.current[activeNavItem];
      if (!activeBtn) {
        setUnderline((prev) => ({ ...prev, visible: false }));
        return;
      }
      const parentRect = navItemsRef.current.getBoundingClientRect();
      const rect = activeBtn.getBoundingClientRect();
      setUnderline({
        left: rect.left - parentRect.left,
        width: rect.width,
        visible: true,
      });
    };
    recalc();
    // Again once the web fonts land: measured in the fallback face, the
    // underline sat ~6px off its item on any page loaded straight into a
    // marked item, such as a case study.
    let live = true;
    document.fonts?.ready.then(() => { if (live) recalc(); });
    window.addEventListener('resize', recalc);
    return () => {
      live = false;
      window.removeEventListener('resize', recalc);
    };
  }, [activeNavItem]);

  // Close mobile menu on outside click or Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const insideNav = navRef.current?.contains(target);
      const insidePanel = menuPanelRef.current?.contains(target);
      if (!insideNav && !insidePanel) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, navRef, setIsMenuOpen]);

  // While the mobile menu is open, freeze the page behind it and move focus into
  // the panel — otherwise the page scrolls under the overlay on touch and
  // keyboard focus stays stranded on the content below.
  useEffect(() => {
    if (!isMenuOpen) return;

    const releaseScroll = lockBodyScroll();
    const opener = menuButtonRef.current;
    // Captured now rather than read in cleanup, so teardown never depends on
    // the ref still being set.
    const panel = menuPanelRef.current;
    panel?.querySelector<HTMLElement>('button, a')?.focus();

    // Focus trap. Without it, Tab past the last item walks straight out of an
    // open modal menu and into the page it is covering.
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>('button, a[href]');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleTab);

    return () => {
      releaseScroll();
      document.removeEventListener('keydown', handleTab);
      // Only pull focus back to the opener if it's still inside the panel —
      // otherwise this would steal focus from wherever the user has moved on.
      if (panel?.contains(document.activeElement)) opener?.focus();
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* `top-0` is load-bearing. Without it the bar sat at its static position,
          which is the top of the body — and the scroll lock pins the body at
          `top: -scrollY`, so on a scrolled page opening the menu carried the
          whole nav, close button included, off the top of the screen. */}
      <nav ref={navRef} data-scrolled={isScrolled} className="nav-bar fixed top-0 inset-x-0 z-50">
        <div className={ui.shell}>
          <div className="flex justify-between items-center h-[var(--nav-h)]">
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              // Not "back to top": on a case study this leaves the page
              // entirely and goes to the home view.
              aria-label="Jash Bhatt — home"
              className="flex-shrink-0 -ml-2 px-2 flex items-center justify-center min-h-11 min-w-11 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="text-[1.85rem] md:text-[2.1rem] font-mark tracking-tight text-accent">JB</span>
            </button>

            {/* Desktop Menu — `lg`, matching where the paged mobile layout
                ends; below it the hamburger menu takes over. */}
            <div className="hidden lg:flex items-center gap-4">
              <div ref={navItemsRef} className="relative flex flex-nowrap items-center gap-8 whitespace-nowrap">
                {['Home', 'Work', 'About', 'Contact'].map((item) => (
                  <button
                    key={item}
                    ref={(el) => { navButtonRefs.current[item.toLowerCase()] = el; }}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`flex items-center min-h-11 px-1 rounded-sm text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      activeNavItem === item.toLowerCase()
                        ? 'text-accent'
                        : 'text-ink-body hover:text-accent-br'
                    }`}
                  >
                    {item}
                  </button>
                ))}
                <span
                  className="nav-underline"
                  style={{
                    transform: `translateX(${underline.left}px)`,
                    width: `${underline.width}px`,
                    opacity: underline.visible ? 1 : 0,
                  }}
                  aria-hidden="true"
                />
              </div>
              <a
                href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                target="_blank"
                rel="noreferrer"
                className="group ml-2 inline-flex items-center gap-1.5 min-h-11 px-4 press rounded-sm border border-accent text-accent text-sm font-semibold hover:bg-accent hover:text-ink-inverse whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {/* Spaced with `gap`, not a literal space: the arrow glyph has
                    almost no left side bearing, so a single space reads tight.
                    The text sits on its own line so JSX drops the whitespace
                    and the gap is the only thing separating them. */}
                Résumé
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                <span className="sr-only">(PDF, opens in a new tab)</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                ref={menuButtonRef}
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className={`-mr-1 flex items-center justify-center rounded-xl active:bg-white/10 transition-colors ${ui.tapTarget}`}
              >
                <MenuIcon open={isMenuOpen} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — dim scrim plus a drawer that unrolls from under the
          nav while the page behind sinks back (motion in index.css, "Mobile
          menu"). Both stay mounted and run on transitions rather than
          keyframes: a tap mid-animation reverses from wherever they are,
          where keyframes restarted from the first frame and flashed. The
          scrim gives the menu an obvious tap-anywhere-to-dismiss target. */}
      <div
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
        data-open={isMenuOpen}
        className="menu-scrim lg:hidden fixed inset-0 top-[var(--nav-h)] z-40 bg-black/60"
      />
      <div
        id="mobile-menu"
        ref={menuPanelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        data-open={isMenuOpen}
        // Hidden with `visibility` once the close finishes, which also takes
        // it out of the tab order and the accessibility tree.
        className="menu-drawer lg:hidden panel-solid border-t border-white/10 fixed inset-x-0 top-[var(--nav-h)] z-50 pb-safe"
      >
        <div className="px-3 pt-3 pb-2 space-y-1">
          {['Home', 'Work', 'About', 'Contact'].map((item) => {
            const page = item.toLowerCase();
            // A case study and Explorations sit under Work, so Work stays
            // marked there.
            const isCurrent = currentView === 'home'
              ? sectionForAnchor(mobilePage) === page
              : page === 'work';
            return (
              <button
                key={item}
                onClick={() => scrollToSection(page)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`menu-drawer-item flex w-full items-center justify-between min-h-12 px-4 text-lg font-medium rounded-xl border-l-2 ${
                  isCurrent
                    ? 'text-accent border-accent bg-accent/10'
                    : 'text-ink border-transparent active:bg-white/10'
                }`}
              >
                {item}
                {isCurrent && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                )}
              </button>
            );
          })}
          <a
            href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
            target="_blank"
            rel="noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="menu-drawer-item flex w-full items-center gap-2 min-h-12 px-4 mt-2 pt-4 border-t border-white/10 text-lg font-medium text-accent rounded-xl active:bg-white/10"
          >
            Résumé (PDF)
            <span aria-hidden="true">↗</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default SiteNav;
