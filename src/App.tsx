import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import {
  X, Linkedin, ArrowRight, ArrowLeft,
  ChevronDown, Image as PhotoIcon, Download, Briefcase, Award,
} from 'lucide-react';
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
import ResponsiveImage from './components/ResponsiveImage';
import Reveal from './components/Reveal';
import RotatingText from './components/RotatingText';
import PipeList from './components/PipeList';
import TiltCard from './components/TiltCard';
import Marquee from './components/Marquee';
import BackToTop from './components/BackToTop';
import Magnetic from './components/Magnetic';
import CursorGlow from './components/CursorGlow';
import LewisPet from './components/LewisPet';
import CopyEmail from './components/CopyEmail';
import ContactLinkCard from './components/ContactLinkCard';
import HeroParticles from './components/HeroParticles';
import MenuIcon from './components/MenuIcon';
import CreativeExplorations from './components/CreativeExplorations';
import { useIsMobile } from './hooks/useIsMobile';
import { projects } from './data/projects';
import { orderedProjects, featuredProjects, secondaryProjects, CONTAINED_THUMBNAIL_BACKDROPS } from './config/projects';
import { ui, personalitySignals, operatorStats } from './config/ui';
import { PUBLIC_URL } from './utils/getBaseUrl';
import { analyticsLocation } from './utils/analyticsRoute';
import type { Project, MobilePage, View } from './types';

const MOBILE_PAGES: MobilePage[] = ['home', 'work', 'about', 'contact'];
const isMobilePage = (value: string): value is MobilePage =>
  (MOBILE_PAGES as string[]).includes(value);

// A case study opened from a card scrolls back to that card. Centring it is
// right on a wide screen; on a phone the card is nearly the full viewport, so
// centring buries its title under the fixed nav — start-align it instead.
const getProjectScrollAlignment = () => (window.innerWidth < 768 ? 'start' : 'center');

const marqueeItems = [
  'Product Design', 'UI/UX', 'Circuit Design', 'Interaction Design', 'Figma',
  'React', 'Arduino', 'Generative AI', 'Prototyping', 'Motion Design', 'Photography',
];

// --- Main Component ---
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Keeps the panel mounted while its closing animation plays.
  const [shouldRenderMenu, setShouldRenderMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  // Below `lg` the four sections are separate pages instead of one scroll, so
  // this — not scroll position — decides what renders. Ignored at `lg` and up.
  const [mobilePage, setMobilePage] = useState<MobilePage>('home');
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Analytics page views. Seeded from the hash rather than left undefined:
  // <Analytics> reads `route` on its first render to decide whether to disable
  // its own pushState tracking, and a late value would leave both running.
  const [analyticsHash, setAnalyticsHash] = useState(() => window.location.hash);
  // Mobile-only accordion for the About "signal" cards. On desktop (md+) all
  // three are always shown, so this state is a no-op there.
  const isMobile = useIsMobile();

  const isManualScroll = useRef(false);
  const navRef = useRef<HTMLElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const navButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lightboxCloseRef = useRef<HTMLButtonElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const [underline, setUnderline] = useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false });

  // Per-card inner-image parallax on the work cards. CSS reads the custom
  // properties; written straight to the DOM to avoid re-renders.
  const handleCardMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    el.style.setProperty('--mx', `${(x / rect.width - 0.5) * -14}px`);
    el.style.setProperty('--my', `${(y / rect.height - 0.5) * -14}px`);
  };

  const handleCardMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--mx', '0px');
    event.currentTarget.style.setProperty('--my', '0px');
  };
  const isWhiteBgLightboxImage = selectedImage?.includes('Circuit-Design.webp');

  // Mounting happens here rather than in an effect keyed on isMenuOpen: both
  // flags land in the same commit, so the panel exists on the first render that
  // plays the open animation. Closing leaves it mounted until animationend.
  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }
    setShouldRenderMenu(true);
    setIsMenuOpen(true);
  };

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
    state: { view: View; section?: string; projectId?: number },
    hash: string,
    replace = false
  ) => {
    const baseUrl = window.location.pathname + window.location.search;
    const url = hash ? `${baseUrl}#${hash}` : baseUrl;
    // pushState/replaceState fire no event, and the pathname never changes here,
    // so Vercel's own tracker sees every section as the same page. This is the
    // one funnel all navigation passes through — report the view from it.
    setAnalyticsHash(hash);
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

    // `gallery` is the legacy hash for this page — still honoured so old links
    // and bookmarks keep working.
    if (hash === 'explorations' || hash === 'gallery') {
      return { view: 'explorations' as const };
    }

    if (isMobilePage(hash)) {
      return { view: 'home' as const, section: hash };
    }

    return { view: 'home' as const, section: 'home' };
  };

  /** Explorations is its own view, so Work stays the marked nav item while there. */
  const sectionForAnchor = (section: string) => (section === 'explorations' ? 'work' : section);

  /**
   * Explorations replaces the home page at every width — same transition the
   * case studies use, so the two full-page views behave identically.
   */
  const openExplorations = (options?: { updateHistory?: boolean }) => {
    setIsMenuOpen(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedProject(null);
      setCurrentView('explorations');
      setActiveSection('work');
      window.scrollTo(0, 0);
      setTimeout(() => { setIsTransitioning(false); }, 50);
    }, 180);
    if (options?.updateHistory !== false) {
      updateHistory({ view: 'explorations' }, 'explorations');
    }
  };

  const scrollToSection = (
    sectionId: string,
    options?: { updateHistory?: boolean }
  ) => {
    // Paged mobile layout: navigating swaps which page is mounted and resets
    // scroll to the top. There is no anchor to scroll to, so none of the
    // offset/alignment logic below applies.
    if (isMobile) {
      const page: MobilePage = isMobilePage(sectionId) ? sectionId : 'home';
      const leavingProject = currentView !== 'home';
      setIsMenuOpen(false);
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView('home');
        setSelectedProject(null);
        setMobilePage(page);
        setActiveSection(sectionForAnchor(page));
        window.scrollTo(0, 0);
        setTimeout(() => { setIsTransitioning(false); }, 50);
      }, leavingProject ? 300 : 160);
      if (options?.updateHistory !== false) {
        updateHistory({ view: 'home', section: page }, page);
      }
      return;
    }

    isManualScroll.current = true;
    // `gallery` has no anchor of its own here; it resolves to Work.
    const anchorId = sectionForAnchor(sectionId);
    const targetProjectId = selectedProject?.id ?? null;

    if (currentView !== 'home') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView('home');
        setSelectedProject(null);
        setTimeout(() => {
          const targetId =
            anchorId === 'work' && targetProjectId !== null
              ? `project-${targetProjectId}`
              : anchorId;
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
      const element = document.getElementById(anchorId);
      if (element) {
        if (anchorId === 'work' || anchorId === 'about') {
          scrollToElementWithOffset(element, 'start', {
            behavior: 'smooth',
            startOffsetAdjustment: -64,
          });
        } else {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      setActiveSection(anchorId);
      setTimeout(() => { isManualScroll.current = false; }, 1000);
    }

    setIsMenuOpen(false);
    setActiveSection(anchorId);
    if (options?.updateHistory !== false) {
      updateHistory({ view: 'home', section: anchorId }, anchorId);
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

  /** Cards are real links so they can be opened in a new tab or copied. A plain
      click still runs the in-page transition; a modified click is left to the
      browser, which loads the hash and lands on the same view via parseHash. */
  const onInPageLink = (event: React.MouseEvent<HTMLAnchorElement>, open: () => void) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    open();
  };

  const handleBackToHome = (options?: { updateHistory?: boolean; sectionId?: string }) => {
    const sectionId = options?.sectionId ?? 'work';

    // Paged mobile layout: return to the Work page rather than scrolling back
    // to the card the case study was opened from.
    if (isMobile) {
      const page: MobilePage = isMobilePage(sectionId) ? sectionId : 'work';
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView('home');
        setSelectedProject(null);
        setMobilePage(page);
        setActiveSection(sectionForAnchor(page));
        window.scrollTo(0, 0);
        setTimeout(() => { setIsTransitioning(false); }, 50);
      }, 300);
      if (options?.updateHistory !== false) {
        updateHistory({ view: 'home', section: page }, page);
      }
      return;
    }

    const targetProjectId = sectionId === 'work' ? (selectedProject?.id ?? null) : null;
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

  /**
   * At `lg` every section renders into one scrolling page. Below it only the
   * current page mounts, which is what removes the ~10,000px of scroll.
   */
  const showsPage = (page: MobilePage) => !isMobile || mobilePage === page;

  /** Explorations is a sub-page of Work, so the nav keeps Work marked there. */
  const isHomeNavContext = currentView === 'home' || currentView === 'explorations';

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
    if (initialState.view === 'explorations') {
      openExplorations({ updateHistory: false });
      updateHistory({ view: 'explorations' }, 'explorations', true);
      return;
    }
    if (initialState.view === 'project') {
      const project = projects.find(p => p.id === initialState.projectId);
      if (project) {
        openProject(project, { updateHistory: false });
        return;
      }
      updateHistory({ view: 'home', section: 'home' }, 'home', true);
      return;
    }
    const section = initialState.section ?? 'home';
    if (isMobile) {
      // Set the page directly rather than routing through scrollToSection —
      // that would play the page-change fade on first paint.
      const page: MobilePage = isMobilePage(section) ? section : 'home';
      setMobilePage(page);
      setActiveSection(sectionForAnchor(page));
    } else {
      scrollToSection(section, { updateHistory: false });
    }
    updateHistory({ view: 'home', section }, section, true);
  // Mount-only by design: this reads the entry URL once. Re-running it when
  // the navigation helpers change would re-navigate mid-session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      // These branches all navigate with `updateHistory: false`, so they skip
      // the funnel that normally reports the view.
      setAnalyticsHash(window.location.hash);
      const nextState = parseHash();
      if (nextState.view === 'explorations') {
        openExplorations({ updateHistory: false });
        return;
      }
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
    // isMobile matters: both handlers below branch on it, so a stale value
    // would scroll the paged layout instead of switching pages.
  // The handlers are stable for this purpose and re-subscribing on every
  // render would tear down and rebuild the popstate listener constantly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, selectedProject, isMobile]);

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

    if (currentView === 'explorations') {
      const title = 'Explorations | Jash Bhatt';
      document.title = title;
      setMeta('meta[property="og:title"]', title);
      return;
    }

    const defaultTitle = 'Jash Bhatt | Product Designer & Agentic AI Designer';
    const defaultDescription =
      'I design and build intelligent products that combine AI, software, and human-centered interaction.';
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
    // Paged mobile layout mounts one section at a time, so there is nothing to
    // spy on — `mobilePage` is the source of truth for the active tab there.
    if (isMobile) return;

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
  }, [currentView, isMobile]);

  // Crossing the `lg` breakpoint swaps navigation models entirely. Carry the
  // reader's place across it, so rotating a tablet doesn't dump them at the top
  // of an unrelated section.
  const wasMobile = useRef(isMobile);
  useEffect(() => {
    if (wasMobile.current === isMobile) return;
    wasMobile.current = isMobile;
    if (currentView !== 'home') return;

    if (isMobile) {
      setMobilePage(isMobilePage(activeSection) ? activeSection : 'home');
      window.scrollTo(0, 0);
      return;
    }

    // Now scroll-based. The whole page has just mounted, and the sections above
    // the target keep growing as their images decode — a single scroll computed
    // at swap time landed ~570px short. Re-align a few times while that
    // settles, and stop the moment the reader takes over.
    const anchor = sectionForAnchor(mobilePage);
    setActiveSection(anchor);

    let cancelled = false;
    const stop = () => { cancelled = true; };
    const events: (keyof WindowEventMap)[] = ['wheel', 'touchstart', 'keydown'];
    events.forEach((event) => window.addEventListener(event, stop, { passive: true }));

    const timers = [0, 80, 200, 400, 700].map((delay) =>
      window.setTimeout(() => {
        if (cancelled) return;
        const element = document.getElementById(anchor);
        if (element) scrollToElementWithOffset(element, 'start');
      }, delay)
    );

    return () => {
      timers.forEach(clearTimeout);
      events.forEach((event) => window.removeEventListener(event, stop));
    };
  // Only isMobile belongs here. The effect reacts to a layout swap, and it
  // reads activeSection/currentView/mobilePage as a snapshot at swap time —
  // adding them would re-run it on every scroll and fight the reader.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Nav surface condenses once content scrolls underneath it. Kept separate from
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
      if (!isHomeNavContext || !navItemsRef.current) {
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
  }, [activeSection, currentView, isHomeNavContext]);

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

  // While the mobile menu is open, freeze the page behind it and move focus into
  // the panel — otherwise the page scrolls under the overlay on touch and
  // keyboard focus stays stranded on the content below. Guarded on
  // shouldRenderMenu too, so it can never run against a null panel ref.
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
      // Only pull focus back to the opener if it's still inside the panel —
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
    /* Flex column with `mt-auto` on the footer: on a page short enough to fit
       the screen — Contact — the footer sits at the bottom instead of floating
       with a band of dead background beneath it. Every other child here is
       fixed-position, so only the content wrapper and the footer are in flow. */
    <div className="min-h-[100svh] flex flex-col bg-[var(--ground)] text-slate-100 selection:bg-accent selection:text-slate-950 transition-colors duration-300">
      <Analytics {...analyticsLocation(analyticsHash)} />
      {/* Static circuit-trace substrate. No wash, no drift, no scroll tracking —
          it is structure, not atmosphere. Sits behind everything; all page
          content is lifted above it with `relative z-10`. */}
      <div className="schematic-ground" aria-hidden="true" />
      <CursorGlow />
      {/* Every width: the mobile nav is a hamburger menu, so nothing else takes
          a long page back to the top. */}
      <BackToTop />
      {/* The desktop pet, on the desktop layout only — he needs room to walk.
          Off the home page he keeps to the gutter beside the content column. */}
      {!isMobile && <LewisPet gutterOnly={currentView !== 'home'} />}
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-sm focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Lightbox Modal. The image sits in its own scroll container with
          `touch-action: pinch-zoom` so dense diagrams (the HR Genie SVGs are
          authored at 1600px wide) can actually be inspected on a phone. */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center scrim animate-fade-in"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            className={`chip absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 flex items-center justify-center text-white rounded-sm shadow-lg ${ui.tapTarget}`}
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
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="md:hidden absolute bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 text-center text-xs text-slate-400 pointer-events-none">
            Pinch to zoom · tap outside to close
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav ref={navRef} data-scrolled={isScrolled} className="nav-bar fixed w-full z-50">
        <div className={ui.shell}>
          <div className="flex justify-between items-center h-[var(--nav-h)]">
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              aria-label="Back to top of page"
              className="flex-shrink-0 -ml-2 px-2 flex items-center justify-center min-h-11 min-w-11 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="text-[1.85rem] md:text-[2.1rem] font-display tracking-tight text-accent">JB</span>
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
                    className={`flex items-center min-h-11 text-base font-medium transition-colors duration-200 ${
                      // Explorations sits under Work, so Work stays marked there.
                      activeSection === item.toLowerCase() && isHomeNavContext
                        ? 'text-accent'
                        : 'text-slate-300 hover:text-accent-br'
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
                className="group ml-2 inline-flex items-center gap-1.5 min-h-11 px-4 rounded-sm border border-accent text-accent font-mono text-xs uppercase tracking-[0.08em] hover:bg-accent hover:text-slate-950 transition-all duration-200 whitespace-nowrap"
              >
                {/* Spaced with `gap`, not a literal space: the arrow glyph has
                    almost no left side bearing, so a single space reads tight.
                    The text sits on its own line so JSX drops the whitespace
                    and the gap is the only thing separating them. */}
                Resume
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
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

      {/* Mobile Menu — dim scrim plus the sliding panel. The scrim gives the
          menu an obvious tap-anywhere-to-dismiss target, which a bare dropdown
          never had on touch. */}
      {shouldRenderMenu && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
            className={`lg:hidden fixed inset-0 top-[var(--nav-h)] z-40 bg-black/50 transition-opacity duration-300 ${
              isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            id="mobile-menu"
            ref={menuPanelRef}
            onAnimationEnd={() => { if (!isMenuOpen) setShouldRenderMenu(false); }}
            className={`lg:hidden panel-solid border-t border-white/10 fixed inset-x-0 top-[var(--nav-h)] z-50 pb-safe ${
              isMenuOpen ? 'animate-menu-open' : 'animate-menu-close'
            }`}
          >
            <div className="px-3 pt-3 pb-2 space-y-1">
              {['Home', 'Work', 'About', 'Contact'].map((item) => {
                const page = item.toLowerCase();
                // Explorations is reached from Work, so Work stays marked there.
                const isCurrent = currentView === 'explorations'
                  ? page === 'work'
                  : currentView === 'home' && sectionForAnchor(mobilePage) === page;
                return (
                  <button
                    key={item}
                    onClick={() => scrollToSection(page)}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`flex w-full items-center justify-between min-h-12 px-4 text-lg font-medium rounded-xl border-l-2 transition-colors ${
                      isCurrent
                        ? 'text-accent border-accent bg-accent/10'
                        : 'text-slate-200 border-transparent active:bg-white/10'
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
                className="flex w-full items-center gap-2 min-h-12 px-4 mt-2 pt-4 border-t border-white/10 text-lg font-medium text-accent rounded-xl active:bg-white/10"
              >
                <Download size={18} /> Resume
              </a>
            </div>
          </div>
        </>
      )}

      {/* CONDITIONAL RENDERING: HOME OR PROJECT VIEW */}
      {currentView === 'home' ? (
        /* Every page but Home opens with its section flush against the top of
           the document, where the fixed nav overlays it — the section's own
           padding was hiding entirely behind the header and leaving the title
           jammed against it. The subtraction cancels the section's own top
           padding so the total lands on `nav-h + 1rem`, the same line the hero's
           status pill starts on — and it has to step at `sm` because
           `ui.section` is `py-14 sm:py-20`. Home is exempt: the hero carries
           its own offset. */
        <div
          className={`relative z-10 transition-all duration-300 ease-in-out transform ${
            isMobile && mobilePage !== 'home'
              ? 'pt-[calc(var(--nav-h)-2.5rem)] sm:pt-[calc(var(--nav-h)-4rem)]'
              : ''
          } ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
        >
          {/* Hero Section */}
          {showsPage('home') && (
          <section
            id="home"
            // No min-height below `lg`. Once the redundant CTAs came out, forcing
            // a full screen left ~290px of void above the fold; letting the hero
            // hug its content instead brings the portrait card up into view,
            // which is a better scroll affordance than empty space.
            // Content starts 1rem below the fixed nav. The other pages reach the
            // same line via their section's own `py-14`, so the offsets are
            // written differently but resolve identically — see the page
            // container below.
            // Transparent on purpose: the backdrop is the page-wide ambient
            // field, which is fixed and therefore identical at every scroll
            // position. A section-scoped backdrop here would put a visible
            // colour edge in the page at the point the hero ends.
            className={`relative lg:min-h-[calc(100vh-5rem)] pt-[calc(var(--nav-h)+1rem)] pb-4 lg:pt-24 lg:pb-10 ${ui.scrollMt} overflow-hidden bg-transparent`}
          >
            {!isTransitioning && activeSection === 'home' && <HeroParticles />}
            <div className={`${ui.shell} relative`}>
              <div className="grid lg:grid-cols-12 gap-10 items-stretch">
                <div className="lg:col-span-8 lg:h-full lg:flex lg:flex-col">
                  <div className="mb-4 md:mb-6 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                    <span className="chip inline-flex items-center gap-2.5 px-4 py-1.5 rounded-sm text-slate-200 text-sm font-medium">
                      <span className="pulse-dot" aria-hidden="true" />
                      Open to Work
                    </span>
                  </div>
                  <h1 className={`${ui.h1} font-display text-slate-100 mb-3.5 md:mb-5 animate-fade-in-up`} style={{ animationDelay: '60ms' }}>
                    I design and build <span className="accent-shimmer font-semibold">intelligent products</span> that combine AI, software, and human-centered interaction.
                  </h1>
                  <p className="text-[1.05rem] md:text-[1.34rem] text-slate-300 mb-4 md:mb-6 leading-relaxed max-w-3xl animate-fade-in-up" style={{ animationDelay: '140ms' }}>
                    {/* Two different good breaks at two widths, so the rules differ.
                        Everywhere: "agentic AI" and "FLAME University." never split.
                        At md+ the line fits in two, so the trailing clause is held
                        whole and the break lands on the comma; below md it needs
                        three lines, where locking the clause left a short ragged
                        middle line, so it wraps freely there instead. */}
                    I'm <span className="font-semibold text-slate-100">Jash Bhatt</span> — product designer and agentic&nbsp;AI designer,{' '}
                    <span className="md:whitespace-nowrap">studying at FLAME&nbsp;University.</span>
                  </p>

                  {/* The accent rule replaces the old `>` prompt: it keeps the
                      line anchored to the left margin without the console idiom. */}
                  <div className="flex items-center mb-5 lg:hidden min-h-[32px] border-l-2 border-accent pl-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <RotatingText
                      phrases={personalitySignals}
                      className="text-base font-semibold text-slate-200"
                    />
                  </div>

                  <div className="hidden lg:flex items-center mb-8 min-h-[36px] whitespace-nowrap border-l-2 border-accent pl-3.5 animate-fade-in-up" style={{ animationDelay: '260ms' }}>
                    <RotatingText
                      phrases={personalitySignals}
                      className="text-lg font-semibold text-slate-200"
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
                  <div className="surface surface-marks surface-hover max-w-[324px] h-full lg:ml-auto rounded-3xl p-4 flex flex-col">
                    <div className="rounded-2xl overflow-hidden flex-1 min-h-[18rem]">
                      <ResponsiveImage
                        src={`${PUBLIC_URL}/images/Jash-portrait.webp`}
                        alt="Portrait of Jash Bhatt"
                        className="w-full h-full object-cover object-top"
                        loading="eager"
                        fetchPriority="high"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 md:mt-12 w-full">
                {operatorStats.map((stat, i) => (
                  <Reveal key={stat.label} delay={i * 90} duration={600} className="h-full">
                    <div className="surface surface-marks surface-hover rounded-2xl p-6 h-full">
                      {/* These values are phrases, not numbers, and at 2.2rem all
                          three wrapped with a single orphaned word on line two.
                          Sized to hold one line instead. The binding value is
                          "Agentic AI · Bajaj Finance", which caps the ramp at
                          1.75vw and the ceiling at 1.6rem, since the 84rem
                          shell stops widening the card at 357px.
                          Re-measure if any operatorStats value gets longer. */}
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-400 mb-1.5">{stat.label}</div>
                      <div className="text-[clamp(1.1rem,1.75vw,1.6rem)] font-bold text-slate-100 [text-wrap:balance]">{stat.value}</div>
                    </div>
                  </Reveal>
                ))}
              </div>

            </div>

            {/* Desktop only. On mobile the portrait card below now sits partly in
                view at rest, which advertises the scroll better than an arrow. */}
            <div className="hidden lg:flex lg:mt-7 justify-center animate-nudge text-slate-400">
              <ChevronDown size={32} />
            </div>
          </section>
          )}

          {/* Portrait and the at-a-glance facts. These used to sit inside the
              hero; moving them one swipe down is what lets the hero fit a
              single screen, and the card keeps its full size here. */}
          {isMobile && mobilePage === 'home' && (
            <section className={`${ui.shell} pb-4`} aria-label="About Jash at a glance">
              {/* 19rem wide with a 4:5 crop — the 3:4 card at full width ran
                  558px. object-top keeps the head anchored so the tighter box
                  crops from the bottom rather than the face. */}
              <Reveal className="surface surface-marks w-full max-w-[19rem] mx-auto rounded-3xl p-4 mb-6">
                <div className="rounded-2xl overflow-hidden aspect-[4/5]">
                  <ResponsiveImage
                    src={`${PUBLIC_URL}/images/Jash-portrait.webp`}
                    alt="Portrait of Jash Bhatt"
                    className="w-full h-full object-cover object-top"
                    // Below the fold now that the hero is one screen, so it no
                    // longer competes with the headline for the first paint.
                    loading="lazy"
                    sizes="304px"
                  />
                </div>
              </Reveal>

              {/* Read-only facts, so no chip/pill styling — that would read as
                  tappable. Label above value, as on the desktop stat cards. */}
              <Reveal delay={80}>
                <dl className="border-y border-white/10 divide-y divide-white/10">
                  {operatorStats.map((stat) => (
                    <div key={`mobile-stat-${stat.label}`} className="py-2.5">
                      <dt className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-400">{stat.label}</dt>
                      <dd className="text-[0.95rem] font-semibold text-slate-100 mt-0.5">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </section>
          )}

          {/* Discipline Marquee */}
          {showsPage('home') && <Marquee items={marqueeItems} />}

          {/* Featured work preview — paged mobile Home only. Keeps Home from
              being a dead end that shows no work, without dragging the whole
              6,300px Work section back onto it. The contact strip below it
              carries the `pb-14 sm:pb-20` that ends every page above the footer. */}
          {isMobile && mobilePage === 'home' && (
            <section className={`${ui.shell} pt-14 sm:pt-16 pb-12 sm:pb-16`}>
              <Reveal className="mb-6">
                <h2 className="text-2xl font-display text-slate-100">Selected Projects</h2>
              </Reveal>

              <div className="grid grid-cols-1 gap-4">
                {featuredProjects.slice(0, 3).map((project, index) => {
                  const thumbnail = project.content.thumbnailImage ?? project.content.heroImage;
                  const containedBackdrop = CONTAINED_THUMBNAIL_BACKDROPS[project.slug];
                  return (
                    <Reveal key={`preview-${project.id}`} delay={index * 80}>
                      <a
                        href={`#${project.slug}`}
                        onClick={(event) => onInPageLink(event, () => handleProjectClick(project))}
                        aria-label={`Open case study for ${project.title}`}
                        className={`group w-full text-left flex items-center gap-4 p-4 ${ui.cardBase} ${ui.cardHover} focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
                      >
                        <div className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden ${containedBackdrop ?? 'bg-white/5'}`}>
                          {!thumbnail.includes('placeholder') ? (
                            <ResponsiveImage
                              src={thumbnail}
                              alt={project.title}
                              className={`w-full h-full ${containedBackdrop ? 'object-contain' : 'object-cover'}`}
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
                          <p className="text-[0.6875rem] font-mono uppercase tracking-[0.14em] text-slate-400">{project.category}</p>
                          <h3 className="mt-1 text-base font-bold text-slate-100 group-active:text-accent transition-colors">{project.title}</h3>
                        </div>
                        <ArrowRight size={18} className="shrink-0 text-slate-600" />
                      </a>
                    </Reveal>
                  );
                })}
              </div>

              <Reveal delay={260}>
                <button
                  onClick={() => scrollToSection('work')}
                  className={`${ui.btnBase} ${ui.btnSecondary} mt-5 w-full text-[0.95rem]`}
                >
                  See all projects <ArrowRight size={16} />
                </button>
              </Reveal>
            </section>
          )}

          {/* Contact strip — paged mobile Home only. Contact is its own page
              here, so without this the bottom of Home was a dead end for anyone
              who scrolled through looking for a way to get in touch. */}
          {isMobile && mobilePage === 'home' && (
            <section className={`${ui.shell} pb-14 sm:pb-20`} aria-labelledby="home-contact-heading">
              <Reveal className="mb-5">
                <h2 id="home-contact-heading" className="text-2xl font-display text-slate-100">Let's Build Something</h2>
                <p className="mt-2 text-[0.95rem] text-slate-300">Open to roles in agentic&nbsp;AI, product design, and UI/UX.</p>
              </Reveal>
              <Reveal delay={80} className="grid grid-cols-1 gap-3">
                <CopyEmail email="jashbhatt.contact@gmail.com" />
                <ContactLinkCard href="https://linkedin.com/in/jash-bhatt" icon={<Linkedin size={22} />} label="LinkedIn" value="/in/jash-bhatt" />
                <ContactLinkCard href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`} icon={<Download size={22} />} label="Resume" value="Download PDF" />
              </Reveal>
            </section>
          )}

          {/* Work Section */}
          {showsPage('work') && (
          <section id="work" className={`${ui.section} ${ui.shell} ${ui.scrollMt}`}>
            <Reveal className="mb-10 sm:mb-14 md:mb-16">
              <h2 className={`${ui.h2} font-display text-slate-100 mb-3 md:mb-4`}>Selected Projects</h2>
              <p className="text-slate-300 max-w-2xl mb-5 md:mb-6">From circuit-led builds to AI-enabled interfaces — each project reflects how I think through design, engineering, and behavior together.</p>
              <Reveal variant="grow-width" delay={180} duration={700}>
                <div className="h-1 w-24 bg-gradient-to-r from-accent to-accent-deep rounded-sm"></div>
              </Reveal>
            </Reveal>

            <div className="space-y-8 sm:space-y-12 md:space-y-32">
              {featuredProjects.map((project, index) => {
                const projectThumbnail =
                  project.content.thumbnailImage ?? project.content.heroImage;
                const isPlaceholder = projectThumbnail.includes('placeholder');
                // Square artwork that a 4:3 cover crop would cut into: shown
                // whole against the tile's own backdrop instead. python-codes is
                // a logo that needs breathing room; the Spotify chart bleeds to
                // its own edges, and its background matches the backdrop, so it
                // sits flush.
                const fitsInside =
                  project.slug === 'python-codes' || project.slug === 'soundtrack-seven-years';
                const insidePadding = project.slug === 'python-codes' ? 'p-6' : '';
                // project.color is a letterbox backdrop, only ever meant to show
                // where the artwork does not fill the tile. Behind a cover image
                // it is invisible except at the rounded corners, where the
                // composited image leaves an anti-aliased sliver and a light
                // colour rasterises as a hairline outlining the image. It also
                // flashes near-white on a dark page while the image loads.
                const needsBackdrop = isPlaceholder || fitsInside;

                return (
                  <Reveal
                    key={project.id}
                    // Alternating draw direction, so the grid reads as being
                    // ruled in rather than as one uniform sweep.
                    variant={index % 2 === 1 ? 'wipe-left' : 'wipe-right'}
                    delay={Math.min(index * 60, 240)}
                    duration={700}
                  >
                  <a
                    href={`#${project.slug}`}
                    id={`project-${project.id}`}
                    // No cyan press border: the tile's own scale-down is enough
                    // press feedback, and on desktop the border was otherwise
                    // transparent, so tapping made a green outline appear from
                    // nowhere. focus-visible stays — that ring is the keyboard
                    // indicator and does not fire on pointer clicks.
                    className="group block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 rounded-2xl overflow-hidden md:overflow-visible md:rounded-none"
                    aria-label={`Open case study for ${project.title}`}
                    onClick={(event) => onInPageLink(event, () => handleProjectClick(project))}
                  >
                    <div className="grid md:grid-cols-12 gap-0 md:gap-8 items-center">

                      {/* Image Column (7 cols) */}
                      <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                        <TiltCard>
                        <div
                          // Radius lives on the tile rather than on the card's
                          // overflow clip: WebKit does not clip a composited
                          // descendant (the parallax layer) to an ancestor's
                          // border-radius, so the tile has to round itself.
                          className={`card-media relative overflow-hidden rounded-2xl ${needsBackdrop ? project.color : ''} aspect-[16/10] md:aspect-[4/3] shadow-sm card-glow`}
                          onMouseMove={handleCardMouseMove}
                          onMouseLeave={handleCardMouseLeave}
                        >
                          {!projectThumbnail.includes('placeholder') ? (
                            fitsInside ? (
                              <ResponsiveImage
                                src={projectThumbnail}
                                alt={project.title}
                                className={`block w-full h-full object-contain ${insidePadding}`}
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

                        </div>
                        </TiltCard>
                      </div>

                      {/* Text Column (5 cols) */}
                      <div className={`md:col-span-5 px-5 pt-4 pb-5 md:p-0 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                        {/* Wraps rather than forcing one line — categories run as
                            long as "UI Design Internship / Design Systems". */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 md:gap-x-4 mb-3 md:mb-5">
                          <span className="ghost-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                          <span className="h-px w-4 md:w-10 shrink-0 bg-gradient-to-r from-accent/50 to-transparent" />
                          <span className="text-slate-400 text-[0.6875rem] md:text-xs font-mono uppercase tracking-[0.08em] md:tracking-[0.2em]">{project.category}</span>
                          {project.content.sections.some((section) => section.demoId) && (
                            <span className="inline-flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-sm bg-accent/10 text-accent-br text-[0.6875rem] font-semibold uppercase tracking-[0.1em] whitespace-nowrap">
                              <span className="pulse-dot" aria-hidden="true" />
                              Try it live
                            </span>
                          )}
                        </div>

                        <h3 className={`text-2xl md:text-4xl font-bold text-slate-100 mb-2 md:mb-4 transition-colors group-hover:text-accent`}>
                          {project.title}
                        </h3>
                        <p className="text-slate-300 text-[0.95rem] md:text-lg leading-relaxed mb-4 md:mb-6 line-clamp-3 md:line-clamp-none">
                          {project.description}
                        </p>

                        {/* A span, not a control: the whole card is the link, and
                            a button can't nest inside an anchor. It keeps the
                            44px line box so it still reads as the tap target.
                            Site accent rather than the project's brand colour —
                            the thumbnail already carries the brand. */}
                        <span
                          aria-hidden="true"
                          className="inline-flex items-center gap-2 min-h-11 font-semibold text-sm md:text-base text-accent group-hover:gap-3 transition-all"
                        >
                          Read Full Case Study <ArrowRight size={16} className="md:w-[18px] md:h-[18px] transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </a>
                  </Reveal>
                );
              })}
            </div>

          </section>
          )}

          {/* Everything outside the five flagship case studies — demos, older
              app work, and coursework — in a section of its own so Work reads
              as the strongest projects and nothing else. Mounts on the Work
              page below `lg`. */}
          {showsPage('work') && secondaryProjects.length > 0 && (
            <section id="archive" className={`${ui.section} pt-0 ${ui.shell} ${ui.scrollMt}`}>
              <Reveal className="mb-8">
                <p className={`${ui.eyebrow} mb-1`}>Also worth a look</p>
                <h2 className={`${ui.h2} font-display text-slate-100`}>More work</h2>
                <Reveal variant="grow-width" delay={180} duration={700}>
                  <div className="mt-3 h-1 w-24 rounded-sm bg-gradient-to-r from-accent to-accent-deep"></div>
                </Reveal>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {secondaryProjects.map((project, index) => {
                  const thumbnail = project.content.thumbnailImage ?? project.content.heroImage;
                  const containedBackdrop = CONTAINED_THUMBNAIL_BACKDROPS[project.slug];
                  return (
                    <Reveal key={project.id} delay={index * 80}>
                      <a
                        href={`#${project.slug}`}
                        id={`project-${project.id}`}
                        onClick={(event) => onInPageLink(event, () => handleProjectClick(project))}
                        aria-label={`Open case study for ${project.title}`}
                        className={`group w-full text-left flex items-center gap-4 p-4 ${ui.cardBase} ${ui.cardHover} focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
                      >
                        <div className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden ${containedBackdrop ?? 'bg-white/5'}`}>
                          {!thumbnail.includes('placeholder') ? (
                            <ResponsiveImage
                              src={thumbnail}
                              alt={project.title}
                              className={`w-full h-full transition-transform duration-500 group-hover:scale-110 ${containedBackdrop ? 'object-contain' : 'object-cover'}`}
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
                          <p className="text-[0.6875rem] font-mono uppercase tracking-[0.14em] text-slate-400">{project.category}</p>
                          <h3 className="mt-1 text-base font-bold text-slate-100 group-hover:text-accent transition-colors">{project.title}</h3>
                        </div>
                        {project.content.sections.some((section) => section.demoId) && (
                          <span className="inline-flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-sm bg-accent/10 text-accent-br text-[0.6875rem] font-semibold uppercase tracking-[0.1em] whitespace-nowrap">
                            <span className="pulse-dot" aria-hidden="true" />
                            Try it live
                          </span>
                        )}
                        <ArrowRight size={18} className="shrink-0 text-slate-600 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
                      </a>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          )}

          {/* Entry point to the Explorations page. Shown at every width now
              that the galleries are a view of their own rather than part of
              this scroll. */}
          {showsPage('work') && (
            <section className={`${ui.shell} pb-14 sm:pb-20`}>
              <Reveal>
                <a
                  href="#explorations"
                  onClick={(event) => onInPageLink(event, () => openExplorations())}
                  className={`${ui.cardBase} ${ui.cardHover} group flex w-full items-center gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={ui.eyebrow}>Beyond case studies</p>
                    <h3 className="mt-1.5 text-lg font-bold text-slate-100 group-hover:text-accent group-active:text-accent transition-colors">Creative Explorations</h3>
                    <p className="mt-1.5 text-sm text-slate-400">Photoshop, brand motion, AI generations, and photography.</p>
                  </div>
                  <ArrowRight size={20} className="shrink-0 text-accent" />
                </a>
              </Reveal>
            </section>
          )}

          {/* About Section */}
          {showsPage('about') && (
          <section id="about" className={`${ui.section} ${ui.scrollMt}`}>
            <div className={ui.shell}>
              <div className="grid md:grid-cols-2 gap-10 md:gap-16">
                <Reveal>
                  <h2 className={`${ui.h2} font-display text-slate-100 mb-5 md:mb-8`}>About Me</h2>
                  <div className="space-y-4 md:space-y-6 text-base md:text-lg text-slate-300 leading-relaxed">
                    <p>
                      I design products that span software and hardware — conversational AI agents inside Bajaj Finance's Agentic AI unit, design-system components at RAHI, and interfaces running on circuits I soldered myself.
                    </p>
                    <p>
                      What ties it together is a preference for building the thing rather than describing it. I'd rather test a rough prototype than argue about a mockup, and I care most that a product behaves exactly the way someone expects it to.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={140}>
                  <h2 className={`${ui.h2} font-display font-semibold tracking-tight text-slate-100 mb-5 md:mb-9`}>Expertise</h2>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Briefcase size={20} className="text-accent" />
                        <h4 className="text-xl font-semibold tracking-tight text-slate-100">Design</h4>
                      </div>
                      <PipeList
                        items={['Agentic AI Workflows', 'Product Design', 'Circuit Design', 'Generative AI in Design', 'UI/UX Design', 'Design Systems', 'Industrial Design']}
                        flow="column"
                        className="text-sm font-medium text-accent-br"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Award size={20} className="text-accent" />
                        <h4 className="text-xl font-semibold tracking-tight text-slate-100">Tools & Tech</h4>
                      </div>
                      <PipeList
                        items={['Figma', 'Python', 'React.js', 'n8n', 'Microsoft Copilot Studio', 'Arduino IDE', 'Fusion 360', 'Adobe Suite']}
                        className="text-sm font-medium text-accent-br"
                      />
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Experience and Education are a matched pair, so they get their
                  own full-width row below the two-column grid rather than being
                  split across it — that way they start on the same baseline and
                  their rules line up. They stack in this order on a phone. */}
              <Reveal delay={200}>
                <div className="mt-10 md:mt-16 grid md:grid-cols-2 gap-8 md:gap-16">
                  <div className="border-l-2 border-accent-deep pl-4">
                    <div className="text-xl font-semibold tracking-tight text-slate-100 mb-4">Experience</div>
                    <div className="space-y-4 md:space-y-6">
                      <div>
                        <h4 className="text-lg font-bold text-slate-100">Design &amp; Development Intern</h4>
                        <p className="text-slate-300 font-medium">Bajaj Finance · Agentic AI Unit</p>
                        <p className="text-sm text-accent-deep font-medium mt-1">Summer 2026</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-100">UI Design Intern</h4>
                        <p className="text-slate-300 font-medium">RAHI Platform Technologies</p>
                        <p className="text-sm text-accent-deep font-medium mt-1">Summer 2025</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-2 border-accent-deep pl-4">
                    <div className="text-xl font-semibold tracking-tight text-slate-100 mb-4">Education</div>
                    <div className="space-y-4 md:space-y-6">
                      <div>
                        <h4 className="text-lg font-bold text-slate-100">Bachelor of Design (B.Des)</h4>
                        <p className="text-slate-300 font-medium">FLAME University</p>
                        <p className="text-sm text-accent-deep font-medium mt-1">2023 – 2027</p>
                      </div>
                      <div className="opacity-80">
                        <h4 className="text-base font-medium text-slate-300">Cambridge International Education</h4>
                        <p className="text-sm text-slate-400">VIBGYOR High School, NIBM, Pune</p>
                        <p className="text-xs text-slate-400 mt-0.5">2018 – 2023</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
          )}

          {/* Contact Section. This is the one page short enough to fit a phone
              screen without scrolling, so its mobile spacing is tuned to keep it
              that way — desktop keeps the original rhythm via the `lg:` values. */}
          {showsPage('contact') && (
          <section id="contact" className={`${ui.section} pb-6 lg:pb-24 ${ui.scrollMt}`}>
            <div className={ui.shell}>
              <div className="grid md:grid-cols-2 gap-6 md:gap-16">
                <Reveal>
                  <h2 className={`${ui.h2} font-display text-slate-100 mb-3 lg:mb-6`}>Let's Build <span className="accent-shimmer">Something</span></h2>
                  <p className="text-base lg:text-xl text-slate-300 mb-4 lg:mb-6">
                    I am actively looking for opportunities in agentic&nbsp;AI, product design, and UI/UX — where I can contribute from research through to implementation.
                  </p>
                  <span className="chip inline-flex items-center gap-2.5 px-4 py-1.5 rounded-sm !bg-accent/10 text-accent-br text-sm font-medium">
                    <span className="pulse-dot" aria-hidden="true" />
                    Currently available
                  </span>
                </Reveal>

                <div className="grid grid-cols-1 gap-4 w-full max-w-[26rem]">
                  <Reveal delay={80} className="h-full">
                    <Magnetic className="h-full">
                      <CopyEmail email="jashbhatt.contact@gmail.com" />
                    </Magnetic>
                  </Reveal>

                  <Reveal delay={160} className="h-full">
                    <Magnetic className="h-full">
                      <ContactLinkCard href="https://linkedin.com/in/jash-bhatt" icon={<Linkedin size={22} />} label="LinkedIn" value="/in/jash-bhatt" />
                    </Magnetic>
                  </Reveal>

                  <Reveal delay={240} className="h-full">
                    <Magnetic className="h-full">
                      <ContactLinkCard href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`} icon={<Download size={22} />} label="Resume" value="Download PDF" />
                    </Magnetic>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>
          )}
        </div>
      ) : currentView === 'explorations' ? (
        /* EXPLORATIONS VIEW — a full page at every width, like a case study. */
        <div
          className={`relative z-10 transition-all duration-300 ease-in-out transform ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          <section
            id="explorations"
            className={`${ui.section} pt-[calc(var(--nav-h)+1.5rem)] ${ui.shell}`}
          >
            <Reveal className="mb-10 sm:mb-14">
              <button
                onClick={() => scrollToSection('work')}
                className="inline-flex items-center gap-1.5 -ml-1 mb-2 min-h-11 pr-3 pl-1 text-sm font-medium text-slate-400 hover:text-accent active:text-accent transition-colors"
              >
                <ArrowLeft size={16} /> Work
              </button>
              <p className={`${ui.eyebrow} mb-2`}>Beyond case studies</p>
              <h1 className={`${ui.h2} font-display text-slate-100 mb-3`}>Creative Explorations</h1>
              <p className="text-slate-300 max-w-2xl">
                Photography, brand motion, generative experiments, and image-making — the work that keeps the visual muscles moving alongside the case studies.
              </p>
              <Reveal variant="grow-width" delay={180} duration={700}>
                <div className="mt-5 h-1 w-24 rounded-sm bg-gradient-to-r from-accent to-accent-deep"></div>
              </Reveal>
            </Reveal>
            <CreativeExplorations onImageClick={setSelectedImage} showDivider={false} />
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

      {/* Footer. Mobile padding is deliberately much tighter than desktop:
          171px of chrome for 90px of content was a third of a short page. */}
      {/* One compact footer at every width — no wordmark (the header already
          carries it) and a single line of type. It was 151px of chrome for one
          credit line on desktop. */}
      <footer className="relative z-10 mt-auto scrim border-t border-white/10 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
        <div className={ui.shell}>
          <p className="text-slate-400 text-xs">© 2026 Jash Bhatt — Designed &amp; built from scratch.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
