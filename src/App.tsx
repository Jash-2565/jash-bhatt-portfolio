import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  Menu, X, Linkedin, ArrowRight, ArrowUpRight,
  ChevronDown, Image as PhotoIcon, Download, Briefcase, Award,
} from 'lucide-react';
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
import ResponsiveImage from './components/ResponsiveImage';
import ImageWithFallback from './components/ImageWithFallback';
import Reveal from './components/Reveal';
import Typewriter from './components/Typewriter';
import TiltCard from './components/TiltCard';
import Marquee from './components/Marquee';
import BackToTop from './components/BackToTop';
import Magnetic from './components/Magnetic';
import CursorGlow from './components/CursorGlow';
import CopyEmail from './components/CopyEmail';
import HeroParticles from './components/HeroParticles';
import { projects } from './data/projects';
import { orderedProjects, featuredProjects, archivedProjects } from './config/projects';
import { ui, personalitySignals, currentlyExploring, operatorStats, galleryItems, aiItems, gallerySnippetItems } from './config/ui';
import { PUBLIC_URL } from './utils/getBaseUrl';
import type { Project } from './types';

const marqueeItems = [
  'Product Design', 'UI/UX', 'Circuit Design', 'Interaction Design', 'Figma',
  'React', 'Arduino', 'Generative AI', 'Prototyping', 'Motion Design', 'Photography',
];

// --- Main Component ---
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldRenderMenu, setShouldRenderMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [currentView, setCurrentView] = useState<'home' | 'project'>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Mobile-only accordion for the About "signal" cards. On desktop (md+) all
  // three are always shown, so this state is a no-op there.
  const [openFeature, setOpenFeature] = useState<number | null>(null);

  const isManualScroll = useRef(false);
  const navRef = useRef<HTMLElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const navButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lightboxCloseRef = useRef<HTMLButtonElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const heroSpotlightRef = useRef<HTMLDivElement | null>(null);
  const [underline, setUnderline] = useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false });

  // Mouse-tracking spotlight in the hero — written directly to the DOM to avoid re-renders.
  const handleHeroMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const el = heroSpotlightRef.current;
    if (!el) return;
    const rect = event.currentTarget.getBoundingClientRect();
    el.style.background = `radial-gradient(640px circle at ${event.clientX - rect.left}px ${event.clientY - rect.top}px, rgba(1, 245, 209, 0.08), transparent 45%)`;
  };

  // Per-card cursor spotlight + inner-image parallax on the work cards. CSS reads
  // the custom properties; written straight to the DOM to avoid re-renders.
  const handleCardMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    el.style.setProperty('--sx', `${x}px`);
    el.style.setProperty('--sy', `${y}px`);
    el.style.setProperty('--mx', `${(x / rect.width - 0.5) * -14}px`);
    el.style.setProperty('--my', `${(y / rect.height - 0.5) * -14}px`);
  };

  const handleCardMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--mx', '0px');
    event.currentTarget.style.setProperty('--my', '0px');
  };
  const isWhiteBgLightboxImage = selectedImage?.includes('Circuit-Design.webp');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Keep the mobile menu mounted while its closing animation plays.
  useEffect(() => {
    if (isMenuOpen) setShouldRenderMenu(true);
  }, [isMenuOpen]);

  // --- Navigation & Transition Handlers ---
  const scrollToElementWithOffset = (
    element: HTMLElement,
    align: 'center' | 'start',
    options?: { behavior?: ScrollBehavior; startOffsetAdjustment?: number }
  ) => {
    if (align === 'center') {
      element.scrollIntoView({ behavior: options?.behavior ?? 'auto', block: 'center', inline: 'nearest' });
      return;
    }

    const navHeight = navRef.current?.offsetHeight ?? 0;
    const extraOffset = 16 + (options?.startOffsetAdjustment ?? 0);
    const top = element.getBoundingClientRect().top + window.scrollY - navHeight - extraOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: options?.behavior ?? 'auto' });
  };

  const updateHistory = (
    state: { view: 'home' | 'project'; section?: string; projectId?: number },
    hash: string,
    replace = false
  ) => {
    const baseUrl = window.location.pathname + window.location.search;
    const url = hash ? `${baseUrl}#${hash}` : baseUrl;
    if (replace) {
      window.history.replaceState(state, '', url);
      return;
    }
    window.history.pushState(state, '', url);
  };

  const parseHash = () => {
    const hash = window.location.hash.replace('#', '');
    const projectIdBySlug = new Map(projects.map((project) => [project.slug, project.id]));
    if (hash.startsWith('project-')) {
      const projectId = Number(hash.replace('project-', ''));
      if (!Number.isNaN(projectId)) {
        return { view: 'project' as const, projectId };
      }
    }

    if (projectIdBySlug.has(hash)) {
      return { view: 'project' as const, projectId: projectIdBySlug.get(hash)! };
    }

    if (['home', 'work', 'about', 'contact'].includes(hash)) {
      return { view: 'home' as const, section: hash };
    }

    return { view: 'home' as const, section: 'home' };
  };

  const scrollToSection = (
    sectionId: string,
    options?: { updateHistory?: boolean }
  ) => {
    isManualScroll.current = true;
    const targetProjectId = selectedProject?.id ?? null;
    const getProjectScrollAlignment = () =>
      window.innerWidth < 768 ? 'start' : 'center';

    if (currentView !== 'home') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView('home');
        setSelectedProject(null);
        setTimeout(() => {
          const targetId =
            sectionId === 'work' && targetProjectId !== null
              ? `project-${targetProjectId}`
              : sectionId;
          const element = document.getElementById(targetId);
          if (element) {
            const block = targetId === 'work' ? 'start' : getProjectScrollAlignment();
            scrollToElementWithOffset(element, block);
          }
          setIsTransitioning(false);
          setTimeout(() => { isManualScroll.current = false; }, 300);
        }, 50);
      }, 300);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        if (sectionId === 'work' || sectionId === 'about') {
          scrollToElementWithOffset(element, 'start', {
            behavior: 'smooth',
            startOffsetAdjustment: -64,
          });
        } else {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      setIsMenuOpen(false);
      setActiveSection(sectionId);
      setTimeout(() => { isManualScroll.current = false; }, 1000);
    }

    setIsMenuOpen(false);
    setActiveSection(sectionId);
    if (options?.updateHistory !== false) {
      updateHistory({ view: 'home', section: sectionId }, sectionId);
    }
  };

  const openProject = (
    project: Project,
    options?: { updateHistory?: boolean }
  ) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedProject(project);
      setCurrentView('project');
      window.scrollTo(0, 0);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 180);
    if (options?.updateHistory !== false) {
      updateHistory({ view: 'project', projectId: project.id }, project.slug);
    }
  };

  const handleProjectClick = (project: Project) => {
    openProject(project);
  };

  const handleBackToHome = (options?: { updateHistory?: boolean; sectionId?: string }) => {
    const sectionId = options?.sectionId ?? 'work';
    const targetProjectId = sectionId === 'work' ? (selectedProject?.id ?? null) : null;
    const getProjectScrollAlignment = () =>
      window.innerWidth < 768 ? 'start' : 'center';
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('home');
      setSelectedProject(null);
      setActiveSection(sectionId);
      setTimeout(() => {
        const targetId =
          targetProjectId !== null ? `project-${targetProjectId}` : sectionId;
        const element = document.getElementById(targetId);
        if (element) {
          const block = sectionId === 'work' ? getProjectScrollAlignment() : 'start';
          scrollToElementWithOffset(element, block);
        }
        setIsTransitioning(false);
      }, 50);
    }, 300);
    if (options?.updateHistory !== false) {
      updateHistory({ view: 'home', section: sectionId }, sectionId);
    }
  };

  const handleNextProject = () => {
    if (selectedProject) {
      const currentIndex = orderedProjects.findIndex(p => p.id === selectedProject.id);
      const nextIndex = (currentIndex + 1) % orderedProjects.length;
      openProject(orderedProjects[nextIndex]);
    }
  };

  // Initial load: honor URL hash without pushing history
  useEffect(() => {
    const initialState = parseHash();
    if (initialState.view === 'project') {
      const project = projects.find(p => p.id === initialState.projectId);
      if (project) {
        openProject(project, { updateHistory: false });
        return;
      }
      updateHistory({ view: 'home', section: 'home' }, 'home', true);
      return;
    }
    scrollToSection(initialState.section ?? 'home', { updateHistory: false });
    updateHistory({ view: 'home', section: initialState.section ?? 'home' }, initialState.section ?? 'home', true);
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const nextState = parseHash();
      if (nextState.view === 'project') {
        const project = projects.find(p => p.id === nextState.projectId);
        if (project) {
          openProject(project, { updateHistory: false });
        }
        return;
      }

      if (currentView !== 'home') {
        handleBackToHome({ updateHistory: false, sectionId: nextState.section ?? 'home' });
        return;
      }

      scrollToSection(nextState.section ?? 'home', { updateHistory: false });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, selectedProject]);

  // Per-view document title and description. Social scrapers read the static
  // tags in index.html, but this keeps tab titles, browser history, and
  // bookmarks meaningful when navigating between case studies.
  useEffect(() => {
    const setMeta = (selector: string, value: string) => {
      document.head.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value);
    };

    if (currentView === 'project' && selectedProject) {
      const title = `${selectedProject.title} — ${selectedProject.category} | Jash Bhatt`;
      document.title = title;
      setMeta('meta[name="description"]', selectedProject.description);
      setMeta('meta[property="og:title"]', title);
      setMeta('meta[property="og:description"]', selectedProject.description);
      return;
    }

    const defaultTitle = 'Jash Bhatt | Product Designer & Design Engineer';
    const defaultDescription =
      'I design and build tech products that blend hardware, software, and human behavior.';
    document.title = defaultTitle;
    setMeta('meta[name="description"]', defaultDescription);
    setMeta('meta[property="og:title"]', defaultTitle);
    setMeta('meta[property="og:description"]', defaultDescription);
  }, [currentView, selectedProject]);

  // Scroll spy. Uses IntersectionObserver rather than a scroll handler: the old
  // version read offsetTop/offsetHeight for four sections on every scroll event
  // from a non-passive listener, which forces layout on the main thread mid-swipe
  // — the most expensive thing on the page during a touch scroll.
  useEffect(() => {
    if (currentView !== 'home') return;

    const sections = ['home', 'work', 'about', 'contact'];
    const elements = sections
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // Ratios live outside the callback so a section leaving view can hand the
    // active state to whichever section is now most visible.
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        if (isManualScroll.current) return;

        let bestId = '';
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestId) setActiveSection(bestId);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));

    // The contact section is short enough that it may never win on ratio, so
    // hitting the bottom of the page still pins it explicitly.
    const handleBottom = () => {
      if (isManualScroll.current) return;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        setActiveSection('contact');
      }
    };
    window.addEventListener('scroll', handleBottom, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleBottom);
    };
  }, [currentView]);

  // Nav glass condenses once content scrolls underneath it. Kept separate from
  // the section-spy handler above, which bails out on manual scroll and on the
  // project view — the nav should thicken in both cases.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active-nav underline — recalc when active section, view, or resize changes
  useEffect(() => {
    const recalc = () => {
      if (currentView !== 'home' || !navItemsRef.current) {
        setUnderline((prev) => ({ ...prev, visible: false }));
        return;
      }
      const activeBtn = navButtonRefs.current[activeSection];
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
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [activeSection, currentView]);

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
  }, [isMenuOpen]);

  // While the mobile menu is open, freeze the page behind it and move focus
  // into the panel — otherwise the page scrolls under the overlay on touch and
  // keyboard focus stays stranded on the content below.
  // Depends on shouldRenderMenu as well as isMenuOpen: the panel is mounted by
  // the effect above, one render after the menu is flagged open, so keying only
  // on isMenuOpen would run this while the panel ref is still null.
  useEffect(() => {
    if (!isMenuOpen || !shouldRenderMenu) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const opener = menuButtonRef.current;
    // Captured now rather than read in cleanup: the panel is mounted for this
    // effect's whole lifetime, and the ref may already be null by teardown.
    const panel = menuPanelRef.current;
    panel?.querySelector<HTMLElement>('button, a')?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      // Only pull focus back to the hamburger if it's still inside the panel —
      // otherwise this would steal focus from wherever the user has moved on.
      if (panel?.contains(document.activeElement)) opener?.focus();
    };
  }, [isMenuOpen, shouldRenderMenu]);

  // Lightbox escape, focus, and scroll lock
  useEffect(() => {
    if (!selectedImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lightboxCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        lightboxCloseRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <div className="min-h-screen bg-[#02060f] text-slate-100 selection:bg-[#01F5D1] selection:text-slate-950 transition-colors duration-300">
      {/* Ambient colour field the glass panes refract. Sits behind everything;
          all page content is lifted above it with `relative z-10`. */}
      <div className="ambient-field" aria-hidden="true">
        <span className="ambient-orb ambient-orb--cyan" />
        <span className="ambient-orb ambient-orb--teal" />
        <span className="ambient-orb ambient-orb--deep" />
      </div>
      <CursorGlow />
      <BackToTop />
      <div className="grain-overlay" aria-hidden="true" />
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-full focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Lightbox Modal. The image sits in its own scroll container with
          `touch-action: pinch-zoom` so dense diagrams (the HR Genie SVGs are
          authored at 1600px wide) can actually be inspected on a phone. */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center glass-scrim animate-fade-in"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            className={`glass-chip absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 flex items-center justify-center text-white rounded-full shadow-lg ${ui.tapTarget}`}
            onClick={() => setSelectedImage(null)}
            ref={lightboxCloseRef}
            aria-label="Close image preview"
          >
            <X size={24} />
          </button>
          <div
            className="h-full w-full overflow-auto overscroll-contain flex items-center justify-center p-4 [touch-action:pinch-zoom]"
            onClick={() => setSelectedImage(null)}
          >
            <ResponsiveImage
              src={selectedImage}
              alt="Full size view"
              className={`max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl ${isWhiteBgLightboxImage ? 'bg-white p-2' : ''}`}
              loading="eager"
              deferGifOnConstrainedNetwork={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="md:hidden absolute bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 text-center text-xs text-slate-400 pointer-events-none">
            Pinch to zoom · tap outside to close
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav ref={navRef} data-scrolled={isScrolled} className="glass-nav fixed w-full z-50">
        <div className={ui.shell}>
          <div className="flex justify-between items-center h-[var(--nav-h)]">
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              aria-label="Back to top of page"
              className="flex-shrink-0 -ml-2 px-2 flex items-center justify-center min-h-11 min-w-11 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01F5D1]"
            >
              <span className="text-[1.85rem] md:text-[2.1rem] font-display tracking-tight text-[#01F5D1]">JB</span>
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div ref={navItemsRef} className="relative flex flex-nowrap items-center gap-8 whitespace-nowrap">
                {['Home', 'Work', 'About', 'Contact'].map((item) => (
                  <button
                    key={item}
                    ref={(el) => { navButtonRefs.current[item.toLowerCase()] = el; }}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`flex items-center min-h-11 text-base font-medium transition-colors duration-200 ${
                      activeSection === item.toLowerCase() && currentView === 'home'
                        ? 'text-[#01F5D1]'
                        : 'text-slate-300 hover:text-[#9EF7EA]'
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
                className="group ml-2 inline-flex items-center min-h-11 px-4 rounded-full border border-[#01F5D1] text-[#01F5D1] text-sm font-medium hover:bg-[#01F5D1] hover:text-slate-950 hover:shadow-[0_0_20px_-4px_rgba(1,245,209,0.6)] transition-all duration-300 whitespace-nowrap"
              >
                Resume <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                ref={menuButtonRef}
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className={`-mr-1 flex items-center justify-center rounded-xl text-slate-300 active:bg-white/10 active:text-[#9EF7EA] transition-colors ${ui.tapTarget}`}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — dim scrim plus the sliding panel. The scrim gives the
          menu an obvious tap-anywhere-to-dismiss target, which a bare dropdown
          never had on touch. */}
      {shouldRenderMenu && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
            className={`md:hidden fixed inset-0 top-[var(--nav-h)] z-40 bg-black/50 transition-opacity duration-300 ${
              isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            id="mobile-menu"
            ref={menuPanelRef}
            onAnimationEnd={() => { if (!isMenuOpen) setShouldRenderMenu(false); }}
            className={`md:hidden glass-menu border-t border-white/10 fixed inset-x-0 top-[var(--nav-h)] z-50 pb-safe ${
              isMenuOpen ? 'animate-menu-open' : 'animate-menu-close'
            }`}
          >
            <div className="px-3 pt-3 pb-2 space-y-1">
              {['Home', 'Work', 'About', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`flex w-full items-center justify-between min-h-12 px-4 text-lg font-medium rounded-xl transition-colors ${
                    activeSection === item.toLowerCase() && currentView === 'home'
                      ? 'text-[#01F5D1] bg-[#01F5D1]/10 border border-[#01F5D1]/30'
                      : 'text-slate-200 border border-transparent active:bg-white/10'
                  }`}
                >
                  {item}
                  {activeSection === item.toLowerCase() && currentView === 'home' && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#01F5D1]" aria-hidden="true" />
                  )}
                </button>
              ))}
              <a
                href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center gap-2 min-h-12 px-4 mt-1 text-lg font-medium text-[#01F5D1] rounded-xl border border-[#01F5D1]/30 active:bg-[#01F5D1]/10"
              >
                <Download size={18} /> Resume
              </a>
            </div>
          </div>
        </>
      )}


      {/* CONDITIONAL RENDERING: HOME OR PROJECT VIEW */}
      {currentView === 'home' ? (
        <div className={`relative z-10 transition-all duration-300 ease-in-out transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {/* Hero Section */}
          <section
            id="home"
            onMouseMove={handleHeroMouseMove}
            className={`relative min-h-[calc(100svh-var(--nav-h))] md:min-h-[calc(100vh-5rem)] pt-[calc(var(--nav-h)+1.25rem)] pb-10 md:pt-24 md:pb-10 ${ui.scrollMt} overflow-hidden ${
              !isTransitioning && activeSection === 'home'
                ? 'bg-gradient-to-b from-[#031018]/90 via-[#062126]/70 to-transparent'
                : 'bg-transparent'
            }`}
          >
            {!isTransitioning && activeSection === 'home' && (
              <>
                <div className="absolute -top-24 -right-8 w-64 h-64 rounded-full bg-[#01F5D1]/25 blur-3xl animate-drift"></div>
                <div className="absolute top-20 -left-12 w-52 h-52 rounded-full bg-[#00A19B]/30 blur-3xl animate-drift"></div>
                <HeroParticles />
                <div ref={heroSpotlightRef} className="absolute inset-0 pointer-events-none" aria-hidden="true"></div>
              </>
            )}
            <div className={`${ui.shell} relative`}>
              <div className="grid lg:grid-cols-12 gap-10 items-stretch">
                <div className="lg:col-span-8 lg:h-full lg:flex lg:flex-col">
                  <div className="mb-5 md:mb-6 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                    <span className="glass-chip inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full !border-[#01F5D1]/40 !bg-[#01F5D1]/10 text-[#9EF7EA] text-sm font-medium">
                      <span className="pulse-dot" aria-hidden="true" />
                      Open to remote internships
                    </span>
                  </div>
                  <h1 className={`${ui.h1} font-display text-slate-100 mb-4 md:mb-5 animate-fade-in-up`} style={{ animationDelay: '60ms' }}>
                    I design and build <span className="accent-shimmer font-semibold">tech products</span> that blend hardware, software, and human behavior.
                  </h1>
                  <p className="text-[1.05rem] md:text-[1.34rem] text-slate-300 mb-6 md:mb-6 leading-relaxed max-w-3xl animate-fade-in-up" style={{ animationDelay: '140ms' }}>
                    I'm <span className="accent-shimmer font-semibold">Jash Bhatt</span>, a product designer and design engineer studying B.Des at FLAME University.
                  </p>

                  {/* Mobile CTAs sit directly under the intro so the primary
                      action is reachable without scrolling past the portrait.
                      Two-up grid instead of three stacked full-width buttons. */}
                  <div className="grid grid-cols-2 gap-3 mb-6 lg:hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <button
                      onClick={() => scrollToSection('work')}
                      className={`group ${ui.btnBase} ${ui.btnPrimary} !px-4 text-[0.95rem]`}
                    >
                      View Work <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <a
                      href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className={`${ui.btnBase} ${ui.btnSecondary} !px-4 text-[0.95rem]`}
                    >
                      <Download size={16} /> Resume
                    </a>
                    <button
                      onClick={() => scrollToSection('contact')}
                      className={`col-span-2 ${ui.btnBase} ${ui.btnSecondary} text-[0.95rem]`}
                    >
                      Get in Touch
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2.5 mb-6 lg:hidden min-h-[32px] font-mono animate-fade-in-up" style={{ animationDelay: '260ms' }}>
                    <span className="text-[#01F5D1] text-lg" aria-hidden="true">{'>'}</span>
                    <Typewriter
                      phrases={personalitySignals}
                      className="text-base font-semibold text-[#9EF7EA]"
                    />
                  </div>

                  <div className="glass lg:hidden w-full rounded-3xl p-4 mb-6">
                    <div className="rounded-2xl overflow-hidden aspect-[4/3] xs:aspect-square">
                      <ResponsiveImage
                        src={`${PUBLIC_URL}/images/Jash-portrait.webp`}
                        alt="Portrait of Jash Bhatt"
                        className="w-full h-full object-cover object-bottom"
                        loading="eager"
                        fetchPriority="high"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mt-3 px-1">Product Design Student · FLAME University</p>
                    <div className="glass !bg-slate-950/75 mt-3 rounded-xl text-[#01F5D1] p-4 font-mono text-[11px]">
                      <p><span className="text-slate-500">{'>'}</span> status: <span className="text-[#9EF7EA]">available_for_internship</span></p>
                      <p><span className="text-slate-500">{'>'}</span> focus: <span className="text-[#9EF7EA]">phygital · ui/ux · circuits</span></p>
                      <p><span className="text-slate-500">{'>'}</span> stack: <span className="text-[#9EF7EA]">figma + react + arduino</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 lg:hidden animate-fade-in-up" style={{ animationDelay: '320ms' }}>
                    {operatorStats.map((stat) => (
                      <span key={`mobile-stat-${stat.label}`} className="glass-chip w-full min-h-[44px] px-4 py-2 text-sm font-semibold rounded-full text-slate-200 flex items-center justify-center text-center">
                        {stat.label}: {stat.value}
                      </span>
                    ))}
                  </div>

                  <div className="hidden lg:flex items-baseline gap-2.5 mb-8 min-h-[36px] font-mono whitespace-nowrap animate-fade-in-up" style={{ animationDelay: '260ms' }}>
                    <span className="text-[#01F5D1] text-xl" aria-hidden="true">{'>'}</span>
                    <Typewriter
                      phrases={personalitySignals}
                      className="text-lg font-semibold text-[#9EF7EA]"
                    />
                  </div>

                  <div className="hidden lg:flex flex-col sm:flex-row gap-4 mt-auto animate-fade-in-up" style={{ animationDelay: '380ms' }}>
                    <Magnetic
                      as="button"
                      strength={28}
                      onClick={() => scrollToSection('work')}
                      className={`group ${ui.btnBase} ${ui.btnPrimary}`}
                    >
                      View My Work <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Magnetic>
                    <Magnetic
                      as="button"
                      strength={28}
                      onClick={() => scrollToSection('contact')}
                      className={`${ui.btnBase} ${ui.btnSecondary}`}
                    >
                      Get in Touch
                    </Magnetic>
                    <Magnetic
                      as="a"
                      strength={28}
                      href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className={`${ui.btnBase} ${ui.btnSecondary}`}
                    >
                      <Download size={18} /> Resume
                    </Magnetic>
                  </div>
                </div>

                <div className="hidden lg:block lg:col-span-4 lg:h-full animate-fade-in-up" style={{ animationDelay: '220ms' }}>
                  <div className="glass glass-hover max-w-[324px] h-full lg:ml-auto rounded-3xl p-4 flex flex-col">
                    <div className="rounded-2xl overflow-hidden flex-1 min-h-[18rem]">
                      <ResponsiveImage
                        src={`${PUBLIC_URL}/images/Jash-portrait.webp`}
                        alt="Portrait of Jash Bhatt"
                        className="w-full h-full object-cover object-top"
                        loading="eager"
                        fetchPriority="high"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mt-4 px-1">Product Design Student · FLAME University</p>
                    <div className="glass !bg-slate-950/75 mt-4 rounded-xl text-[#01F5D1] p-4 font-mono text-[11px]">
                      <p><span className="text-slate-500">{'>'}</span> status: <span className="text-[#9EF7EA]">available_for_internship</span></p>
                      <p><span className="text-slate-500">{'>'}</span> focus: <span className="text-[#9EF7EA]">phygital · ui/ux · circuits</span></p>
                      <p><span className="text-slate-500">{'>'}</span> stack: <span className="text-[#9EF7EA]">figma + react + arduino</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 md:mt-12 w-full">
                {operatorStats.map((stat, i) => (
                  <Reveal key={stat.label} delay={i * 90} duration={600} className="h-full">
                    <div className="glass glass-hover rounded-2xl p-6 h-full">
                      <div className="text-[1.95rem] md:text-[2.2rem] font-bold text-slate-100">{stat.value}</div>
                      <div className="text-sm text-slate-300 mt-1">{stat.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-5 md:mt-7 flex justify-center animate-nudge text-slate-400">
                <ChevronDown size={32} />
              </div>
            </div>
          </section>

          {/* Discipline Marquee */}
          <Marquee items={marqueeItems} />

          {/* Work Section */}
          <section id="work" className={`${ui.section} ${ui.shell} ${ui.scrollMt}`}>
            <Reveal className="mb-10 sm:mb-14 md:mb-16">
              <h2 className={`${ui.h2} font-display text-slate-100 mb-3 md:mb-4`}>Selected Projects</h2>
              <p className="text-slate-300 max-w-2xl mb-5 md:mb-6">From circuit-led builds to AI-enabled interfaces — each project reflects how I think through design, engineering, and behavior together.</p>
              <Reveal variant="grow-width" delay={180} duration={700}>
                <div className="h-1 w-24 bg-gradient-to-r from-[#01F5D1] to-[#00A19B] rounded-full"></div>
              </Reveal>
            </Reveal>

            <div className="space-y-8 sm:space-y-12 md:space-y-32">
              {featuredProjects.map((project, index) => {
                const projectThumbnail =
                  project.content.thumbnailImage ?? project.content.heroImage;

                return (
                  <Reveal
                    key={project.id}
                    variant={index % 2 === 1 ? 'slide-right' : 'slide-left'}
                    delay={Math.min(index * 60, 240)}
                    duration={700}
                  >
                  <div
                    id={`project-${project.id}`}
                    className="group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01F5D1] focus-visible:ring-offset-4 rounded-2xl overflow-hidden glass glass-mobile-only active:border-[#01F5D1]/50 md:overflow-visible md:rounded-none"
                    role="button"
                    tabIndex={0}
                    aria-label={`Open case study for ${project.title}`}
                    onClick={() => handleProjectClick(project)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleProjectClick(project);
                      }
                    }}
                  >
                    <div className="grid md:grid-cols-12 gap-0 md:gap-8 items-center">

                      {/* Image Column (7 cols) */}
                      <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                        <TiltCard>
                        <div
                          className={`card-media relative overflow-hidden rounded-none md:rounded-2xl ${project.color} aspect-[16/10] md:aspect-[4/3] shadow-sm card-glow`}
                          onMouseMove={handleCardMouseMove}
                          onMouseLeave={handleCardMouseLeave}
                        >
                          {!projectThumbnail.includes('placeholder') ? (
                            project.slug === 'python-codes' ? (
                              <ResponsiveImage
                                src={projectThumbnail}
                                alt={project.title}
                                className="block w-full h-full object-contain p-6"
                                loading="lazy"
                              />
                            ) : (
                              <div className="card-parallax">
                                <ResponsiveImage
                                  src={projectThumbnail}
                                  alt={project.title}
                                  className="block w-full h-full object-cover object-center"
                                  loading="lazy"
                                />
                              </div>
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-8 text-center">
                              <div>
                                <PhotoIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">Click to view {project.title}</p>
                              </div>
                            </div>
                          )}

                          {/* Cursor spotlight */}
                          <div className="card-spotlight" aria-hidden="true"></div>

                          {/* Sheen sweep on hover */}
                          <div className="sheen-layer"></div>

                          {/* Overlay — desktop hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 hidden md:flex items-center justify-center">
                            <span className="glass-chip opacity-0 group-hover:opacity-100 px-6 py-3 rounded-full font-medium text-[#9EF7EA] shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                              View Project
                            </span>
                          </div>

                        </div>
                        </TiltCard>
                      </div>

                      {/* Text Column (5 cols) */}
                      <div className={`md:col-span-5 px-5 pt-4 pb-5 md:p-0 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                        {/* Wraps rather than forcing one line — categories run as
                            long as "UI Design Internship / Design Systems". */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 md:gap-x-4 mb-3 md:mb-5">
                          <span className="ghost-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                          <span className="h-px w-4 md:w-10 shrink-0 bg-gradient-to-r from-[#01F5D1]/50 to-transparent" />
                          <span className="text-slate-400 text-[0.6rem] md:text-xs font-mono uppercase tracking-[0.08em] md:tracking-[0.2em]">{project.category}</span>
                          {project.content.sections.some((section) => section.demoId) && (
                            <span className="inline-flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full border border-[#01F5D1]/45 bg-[#01F5D1]/10 text-[#9EF7EA] text-[0.6rem] md:text-[0.65rem] font-semibold uppercase tracking-[0.1em] whitespace-nowrap">
                              <span className="pulse-dot" aria-hidden="true" />
                              Try it live
                            </span>
                          )}
                        </div>

                        <h3 className={`text-2xl md:text-4xl font-bold text-slate-100 mb-2 md:mb-4 transition-colors ${project.hoverColor}`}>
                          {project.title}
                        </h3>
                        <p className="text-slate-300 text-[0.95rem] md:text-lg leading-relaxed mb-4 md:mb-6 line-clamp-3 md:line-clamp-none">
                          {project.description}
                        </p>

                        {/* On touch this replaces the desktop hover overlay, so it
                            needs to read as a real button and clear 44px. */}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleProjectClick(project);
                          }}
                          className={`glass-chip md:!bg-transparent md:!border-0 md:!shadow-none md:!p-0 inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-full font-semibold text-sm md:text-base hover:gap-3 transition-all ${project.accentColor}`}
                          aria-label={`Read full case study for ${project.title}`}
                        >
                          Read Full Case Study <ArrowRight size={16} className="md:w-[18px] md:h-[18px] transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                  </Reveal>
                );
              })}
            </div>

            {/* Coursework & Experiments — earlier work, kept but demoted */}
            {archivedProjects.length > 0 && (
              <div className="mt-16 sm:mt-20 md:mt-32">
                <Reveal className="mb-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">Earlier work</p>
                  <h2 className="text-2xl font-display text-slate-300">Coursework &amp; Experiments</h2>
                </Reveal>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {archivedProjects.map((project, index) => {
                    const thumbnail = project.content.thumbnailImage ?? project.content.heroImage;
                    return (
                      <Reveal key={project.id} delay={index * 80}>
                        <button
                          type="button"
                          id={`project-${project.id}`}
                          onClick={() => handleProjectClick(project)}
                          aria-label={`Open case study for ${project.title}`}
                          className={`group w-full text-left flex items-center gap-4 p-4 ${ui.cardBase} ${ui.cardHover} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01F5D1]`}
                        >
                          <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                            {!thumbnail.includes('placeholder') ? (
                              <ResponsiveImage
                                src={thumbnail}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                                sizes="80px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PhotoIcon size={20} className="text-slate-600" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[0.6rem] font-mono uppercase tracking-[0.18em] text-slate-500">{project.category}</p>
                            <h3 className="mt-1 text-base font-bold text-slate-100 group-hover:text-[#01F5D1] transition-colors">{project.title}</h3>
                          </div>
                          <ArrowRight size={18} className="shrink-0 text-slate-600 group-hover:text-[#01F5D1] group-hover:translate-x-1 transition-all duration-300" />
                        </button>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Creative Explorations Divider */}
            <Reveal className="mt-16 sm:mt-20 md:mt-32 mb-10 sm:mb-14 md:mb-16 flex items-center gap-4 sm:gap-6">
              <div className="h-px flex-1 bg-white/10"></div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">Beyond case studies</p>
                <h2 className="text-2xl font-display text-slate-300">Creative Explorations</h2>
              </div>
              <div className="h-px flex-1 bg-white/10"></div>
            </Reveal>

            {/* Additional Work Grid */}
            <div className="grid grid-cols-1 gap-8 sm:gap-10 md:gap-12">

              {/* Photoshop Section */}
              <Reveal delay={60} className={`${ui.cardBase} ${ui.cardHover} p-5 md:p-8`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="glass-chip w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                    <ResponsiveImage
                      src={`${PUBLIC_URL}/images/Photoshop and Animation/photoshop.png`}
                      alt="Photoshop icon"
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Photoshop & Animation</h3>
                </div>
                <p className="text-slate-300 text-sm md:text-base mb-5 md:mb-6">Explorations in visual design, motion graphics, and digital art created during my academic coursework.</p>
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {galleryItems.map((item, i) => (
                    <div
                      key={i}
                      className={`relative w-full rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-all group aspect-square hover:-translate-y-1 ${item.type === 'video' ? 'hover:border-white/25 hover:shadow-md' : 'cursor-pointer hover:border-[#01F5D1] hover:shadow-md'}`}
                      onClick={() => item.type === 'image' && item.src && setSelectedImage(item.src)}
                    >
                      {item.type === 'video' && item.src ? (
                        <video
                          className="w-full h-full object-cover"
                          controls
                          playsInline
                          preload="metadata"
                          aria-label={item.alt}
                        >
                          <source src={item.src} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : item.src ? (
                        <>
                          <ImageWithFallback
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="(min-width: 1024px) 340px, 45vw"
                            deferGifOnConstrainedNetwork
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-slate-100 transition-all duration-300 pointer-events-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                            {item.alt}
                          </div>
                        </>
                      ) : (
                        <PhotoIcon className="text-slate-300 w-full h-full p-4" />
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Brand Animation Section */}
              <Reveal delay={120} className={`${ui.cardBase} ${ui.cardHover} p-5 md:p-8`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="glass-chip w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                    <ResponsiveImage
                      src={`${PUBLIC_URL}/images/Photoshop and Animation/after-effects.png`}
                      alt="After Effects icon"
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Nothing Brand Animation</h3>
                </div>
                <p className="text-slate-300 text-sm md:text-base mb-1.5">A brand motion piece for Nothing (phone company), focused on clean geometry and sound-led pacing.</p>
                <p className="text-slate-500 text-xs md:text-sm mb-5 md:mb-6">Built alongside Yash Khanna</p>
                <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <video
                    className="w-full h-auto"
                    controls
                    playsInline
                    preload="metadata"
                    aria-label="Nothing brand animation video"
                  >
                    <source src={`${PUBLIC_URL}/images/Photoshop and Animation/nothing-animation.mp4`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </Reveal>

              {/* AI Generations Section */}
              <Reveal delay={180} className={`${ui.cardBase} ${ui.cardHover} p-5 md:p-8`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <ResponsiveImage
                      src={`${PUBLIC_URL}/images/Lamborghini.webp`}
                      alt="Lamborghini logo"
                      className="w-7 h-7 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Lamborghini Jetski AI</h3>
                </div>
                <p className="text-slate-300 text-sm md:text-base mb-5 md:mb-6">Exploring automotive form language and aerodynamics through generative AI and prompt engineering.</p>
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {aiItems.map((item, i) => (
                    <div
                      key={i}
                      className="relative w-full rounded-xl overflow-hidden bg-white/5 cursor-pointer border border-white/10 hover:border-[#01F5D1] hover:shadow-md transition-all group aspect-square hover:-translate-y-1"
                      onClick={() => item.src && setSelectedImage(item.src)}
                    >
                      {item.src ? (
                        <>
                          <ImageWithFallback
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="(min-width: 1024px) 340px, 45vw"
                            deferGifOnConstrainedNetwork
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-slate-100 transition-all duration-300 pointer-events-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                            {item.alt}
                          </div>
                        </>
                      ) : (
                        <PhotoIcon className="text-slate-300 w-full h-full p-4" />
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Gallery Snippet Section */}
              <Reveal delay={240} className={`${ui.cardBase} ${ui.cardHover} p-5 md:p-8`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <ResponsiveImage
                      src={`${PUBLIC_URL}/images/Photography/camera.png`}
                      alt="Camera icon"
                      className="w-full h-full object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Photography Gallery</h3>
                </div>
                <p className="text-slate-300 text-sm md:text-base mb-5 md:mb-6">For over 10 years, I've pursued nature photography as a personal hobby. I am skilled with both professional DSLRs and mobile cameras, using them to develop a higher appreciation for the natural world.</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:grid-rows-2 md:gap-6 md:auto-rows-fr">
                  {gallerySnippetItems.map((item, i) => {
                    const positionClass = i === 0
                      ? 'md:col-start-1 md:row-start-1'
                      : i === 1
                        ? 'md:col-start-1 md:row-start-2'
                        : i === 2
                          ? 'md:col-start-2 md:row-span-2 md:h-full'
                          : 'md:col-start-3 md:row-span-2 md:h-full';
                    const shapeClass = i < 2
                      ? 'w-full aspect-square md:aspect-[4/3]'
                      : 'w-full aspect-square md:aspect-auto md:h-full';

                    return (
                      <div
                        key={`gallery-snippet-${i}`}
                        className={`relative ${shapeClass} rounded-xl overflow-hidden bg-white/5 cursor-pointer border border-white/10 hover:border-white/30 hover:shadow-md transition-all group ${positionClass} hover:-translate-y-1`}
                        onClick={() => item.src && setSelectedImage(item.src)}
                      >
                        {item.src ? (
                          <>
                            <ImageWithFallback
                              src={item.src}
                              alt={item.alt}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              sizes="(min-width: 768px) 340px, 60vw"
                              deferGifOnConstrainedNetwork
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-slate-100 transition-all duration-300 pointer-events-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                              {item.alt}
                            </div>
                          </>
                        ) : (
                          <PhotoIcon className="text-slate-300 w-full h-full p-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className={`${ui.section} ${ui.scrollMt}`}>
            <div className={ui.shell}>
              <div className="grid md:grid-cols-2 gap-10 md:gap-16">
                <Reveal>
                  <h2 className={`${ui.h2} font-display text-slate-100 mb-5 md:mb-8`}>About Me</h2>
                  <div className="space-y-4 md:space-y-6 text-base md:text-lg text-slate-300 leading-relaxed">
                    <p>
                      I love technology in all forms. I prefer direct communication, clear expectations, and products that behave exactly as intended.
                    </p>
                    <p>
                      I work across UI, hardware, and interaction design, with a strong focus on circuit design and electronics. My goal is simple: build phygital products that are refined, useful, and technically solid.
                    </p>
                  </div>

                  <div className="mt-6 md:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        label: 'Design × Engineering',
                        body: 'I bridge UI, hardware, and behavior in one product view.',
                        card: '!border-[#00A19B]/60 !bg-[#00A19B]/20 hover:!border-[#01F5D1] hover:shadow-[0_14px_36px_-18px_rgba(1,245,209,0.45)]',
                        label_color: 'text-[#01F5D1]',
                      },
                      {
                        label: 'Research-First',
                        body: 'Every design decision is grounded in user insight before it ships.',
                        card: '!border-[#C8CCCE]/40 !bg-[#C8CCCE]/10 hover:!border-[#C8CCCE] hover:shadow-[0_14px_36px_-18px_rgba(200,204,206,0.35)]',
                        label_color: 'text-[#C8CCCE]',
                      },
                      {
                        label: 'End-to-End',
                        body: 'I own execution from Figma through code to physical prototype.',
                        card: '!border-emerald-500/40 !bg-emerald-500/10 hover:!border-emerald-400 hover:shadow-[0_14px_36px_-18px_rgba(52,211,153,0.4)]',
                        label_color: 'text-emerald-300',
                      },
                    ].map((feature, i) => {
                      const isOpen = openFeature === i;
                      return (
                        <div
                          key={feature.label}
                          className={`glass rounded-2xl ${feature.card} transition-all duration-300 hover:-translate-y-0.5`}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFeature(isOpen ? null : i)}
                            aria-expanded={isOpen}
                            className="w-full flex items-center justify-between gap-3 min-h-12 px-4 pt-4 pb-2.5 text-left md:min-h-0 md:cursor-default"
                          >
                            <span className={`text-xs uppercase tracking-[0.18em] ${feature.label_color}`}>{feature.label}</span>
                            <ChevronDown
                              size={16}
                              aria-hidden="true"
                              className={`shrink-0 md:hidden ${feature.label_color} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                          <p className={`px-4 pb-4 text-sm text-slate-200 font-medium ${isOpen ? 'block' : 'hidden'} md:block`}>{feature.body}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="glass mt-6 md:mt-8 rounded-2xl p-5 transition-colors duration-300 hover:border-[#01F5D1]/50">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 mb-3">Design Principles</p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-300"></span><span className="[text-wrap:pretty]">Technology shifts fast — I keep my process tool-agnostic and outcome-focused.</span></li>
                      <li className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-300"></span><span className="[text-wrap:pretty]">Clarity over cleverness: if an interaction needs explaining, it needs redesigning.</span></li>
                      <li className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-300"></span><span className="[text-wrap:pretty]">I iterate on working prototypes, not just screens — real constraints shape better design.</span></li>
                    </ul>
                  </div>
                </Reveal>

                <Reveal delay={140}>
                  <h3 className={`${ui.h2} font-display font-semibold tracking-tight text-slate-100 mb-5 md:mb-9`}>Expertise</h3>
                  <div className="mb-6 md:mb-8">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 mb-3">Currently exploring</p>
                    <div className="flex flex-wrap gap-2">
                      {currentlyExploring.map((item) => (
                        <span key={item} className="glass-chip px-3 py-1.5 text-sm font-medium rounded-full text-slate-200">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Briefcase size={20} className="text-[#01F5D1]" />
                        <h4 className="text-xl font-semibold tracking-tight text-slate-100">Design</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Product Design', 'UI/UX Design', 'Industrial Design', 'Design Systems', 'Generative AI in Design', 'Agentic AI Workflows', 'Circuit Design'].map((skill) => (
                          <span key={skill} className={ui.chipAccent}>{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Award size={20} className="text-emerald-300" />
                        <h4 className="text-xl font-semibold tracking-tight text-emerald-300">Tools & Tech</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Figma', 'Python', 'React.js', 'Arduino IDE', 'n8n', 'Adobe Suite', 'Fusion 360'].map((tool) => (
                          <span key={tool} className="glass-chip px-3 py-1.5 text-sm font-medium text-emerald-300 !border-emerald-400/35 rounded-full">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 md:mt-12">
                    <div className="border-l-2 border-[#00A19B] pl-4">
                      <div className="text-xl font-semibold tracking-tight text-slate-100 mb-4">Education</div>
                      <div className="space-y-4 md:space-y-6">
                        <div>
                          <h4 className="text-lg font-bold text-slate-100">Bachelor of Design (B.Des)</h4>
                          <p className="text-slate-300 font-medium">FLAME University</p>
                          <p className="text-sm text-[#00A19B] font-medium mt-1">2023 – 2027</p>
                        </div>
                        <div className="opacity-80">
                          <h4 className="text-base font-medium text-slate-300">Cambridge International Education</h4>
                          <p className="text-sm text-slate-500">VIBGYOR High School, NIBM, Pune</p>
                          <p className="text-xs text-slate-400 mt-0.5">2018 – 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className={`${ui.section} ${ui.scrollMt}`}>
            <div className={ui.shell}>
              <div className="grid md:grid-cols-2 gap-10 md:gap-16">
                <Reveal>
                  <h2 className={`${ui.h2} font-display text-slate-100 mb-5 md:mb-6`}>Let's Build <span className="accent-shimmer">Something</span></h2>
                  <p className="text-lg md:text-xl text-slate-300 mb-5 md:mb-6">
                    I am actively looking for internship opportunities in UI/UX, product design, and phygital interaction — where I can contribute from research through to implementation.
                  </p>
                  <span className="glass-chip inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full !border-[#01F5D1]/40 !bg-[#01F5D1]/10 text-[#9EF7EA] text-sm font-medium">
                    <span className="pulse-dot" aria-hidden="true" />
                    Currently available — Remote
                  </span>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <Reveal delay={80} className="h-full">
                    <Magnetic className="h-full">
                      <CopyEmail email="jash.bhatt@flame.edu.in" />
                    </Magnetic>
                  </Reveal>

                  <Reveal delay={160} className="h-full">
                    <Magnetic className="h-full">
                      <a href="https://linkedin.com/in/jash-bhatt" target="_blank" rel="noreferrer" className="glass relative flex items-center gap-4 p-5 w-full h-full rounded-2xl card-glow group overflow-hidden">
                        <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-[#01F5D1]/50 to-transparent rounded-full" />
                        <div className="shrink-0 p-3 bg-[#00A19B]/25 text-[#9EF7EA] rounded-full transition-all duration-300 group-hover:bg-[#01F5D1] group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-6">
                          <Linkedin size={22} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-slate-400 font-medium">LinkedIn</p>
                          <p className="text-slate-100 font-semibold text-sm group-hover:text-[#01F5D1] transition-colors">/in/jash-bhatt</p>
                        </div>
                        <ArrowUpRight size={18} className="ml-auto text-slate-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#01F5D1] transition-all duration-300" />
                      </a>
                    </Magnetic>
                  </Reveal>

                  <Reveal delay={240} className="h-full">
                    <Magnetic className="h-full">
                      <a href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`} target="_blank" rel="noreferrer" className="glass relative flex items-center gap-4 p-5 w-full h-full rounded-2xl card-glow group overflow-hidden">
                        <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-[#01F5D1]/50 to-transparent rounded-full" />
                        <div className="shrink-0 p-3 bg-[#00A19B]/25 text-[#9EF7EA] rounded-full transition-all duration-300 group-hover:bg-[#01F5D1] group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-6">
                          <Download size={22} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-slate-400 font-medium">Resume</p>
                          <p className="text-slate-100 font-semibold text-sm group-hover:text-[#01F5D1] transition-colors">Download PDF</p>
                        </div>
                        <ArrowUpRight size={18} className="ml-auto text-slate-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#01F5D1] transition-all duration-300" />
                      </a>
                    </Magnetic>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* PROJECT DETAIL VIEW */
        <Suspense fallback={<div className="min-h-screen" />}>
          <ProjectDetail
            project={selectedProject}
            nextProject={
              selectedProject
                ? orderedProjects[
                    (orderedProjects.findIndex((p) => p.id === selectedProject.id) + 1) %
                      orderedProjects.length
                  ]
                : null
            }
            onBack={handleBackToHome}
            onNext={handleNextProject}
            isTransitioning={isTransitioning}
            onImageClick={setSelectedImage}
          />
        </Suspense>
      )}

      {/* Footer */}
      <footer className="relative z-10 glass-scrim border-t border-white/10 pt-10 pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+2rem))] text-center">
        <div className={`${ui.shell} flex flex-col items-center gap-3`}>
          <span className="text-[1.6rem] font-display tracking-tight text-[#01F5D1]/60">JB</span>
          <p className="text-slate-500 text-sm">© 2026 Jash Bhatt — Designed & built from scratch.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
