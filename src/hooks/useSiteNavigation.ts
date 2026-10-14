import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { projects } from '../data/projects';
import { orderedProjects } from '../config/projects';
import { parseLocation, routeToPath, hasLegacyHash, isMobilePage, sectionForAnchor } from '../utils/routes';
import type { Route } from '../utils/routes';
import type { Project, MobilePage, View } from '../types';
import { useScrollSpy } from './useScrollSpy';

// A case study opened from a card scrolls back to that card. Centring it is
// right on a wide screen; on a phone the card is nearly the full viewport, so
// centring buries its title under the fixed nav — start-align it instead.
const getProjectScrollAlignment = () => (window.innerWidth < 768 ? 'start' : 'center');

/**
 * The entry URL, resolved once, before the first render.
 *
 * This used to happen in a mount effect, which meant the first paint was always
 * the home page: opening a shared `/work/etsconnect` link rendered the whole
 * hero at full opacity for ~150ms, blanked for ~70ms while the case-study chunk
 * loaded, and only then showed the project. It also kicked off a download of
 * every home-page thumbnail plus the portrait — ~700KB fetched and immediately
 * thrown away. Reading the URL here instead means the correct view is the first
 * thing that ever renders.
 */
const INITIAL_ROUTE: Route = parseLocation();
const INITIAL_PROJECT: Project | null =
  INITIAL_ROUTE.view === 'project'
    ? projects.find((p) => p.slug === INITIAL_ROUTE.slug) ?? null
    : null;
const INITIAL_VIEW: View =
  INITIAL_ROUTE.view === 'project' && !INITIAL_PROJECT ? 'home' : INITIAL_ROUTE.view;

/**
 * Which view is showing, which section is marked, and every way of moving
 * between them — kept in step with the URL, browser history and analytics.
 * The site's only router.
 *
 * `navRef` is the fixed nav bar: start-aligned scrolls clear its height.
 */
export function useSiteNavigation(isMobile: boolean, navRef: RefObject<HTMLElement | null>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(() =>
    INITIAL_ROUTE.view === 'home' ? INITIAL_ROUTE.section : 'work'
  );
  // Below `lg` the four sections are separate pages instead of one scroll, so
  // this — not scroll position — decides what renders. Ignored at `lg` and up.
  const [mobilePage, setMobilePage] = useState<MobilePage>(() =>
    INITIAL_ROUTE.view === 'home' ? INITIAL_ROUTE.section : 'work'
  );
  const [currentView, setCurrentView] = useState<View>(INITIAL_VIEW);
  const [selectedProject, setSelectedProject] = useState<Project | null>(INITIAL_PROJECT);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Analytics page views. Seeded from the entry route rather than left
  // undefined: <Analytics> reads `route` on its first render to decide whether
  // to disable its own pushState tracking, and a late value would leave both
  // running.
  const [analyticsRoute, setAnalyticsRoute] = useState<Route>(INITIAL_ROUTE);

  const isManualScroll = useRef(false);

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

  /**
   * Single funnel for every navigation. Writes a real path — `/work/hr-genie`,
   * `/about` — rather than a hash, so each view has a URL a scraper can be
   * served a prerendered <head> for. pushState/replaceState fire no event, so
   * this is also where the analytics view is reported.
   */
  const updateHistory = (route: Route, replace = false) => {
    const url = `${routeToPath(route)}${window.location.search}`;
    setAnalyticsRoute(route);
    if (replace) {
      window.history.replaceState(route, '', url);
      return;
    }
    window.history.pushState(route, '', url);
  };

  /** Route for a section of the home page. */
  const homeRoute = (section: string): Route => ({
    view: 'home',
    section: isMobilePage(section) ? section : 'home',
  });



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
      updateHistory({ view: 'explorations' });
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
        updateHistory({ view: 'home', section: page });
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
      updateHistory(homeRoute(anchorId));
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
      updateHistory({ view: 'project', slug: project.slug });
    }
  };

  const handleProjectClick = (project: Project) => {
    openProject(project);
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
        updateHistory({ view: 'home', section: page });
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
      updateHistory(homeRoute(sectionId));
    }
  };

  /**
   * At `lg` every section renders into one scrolling page. Below it only the
   * current page mounts, which is what removes the ~10,000px of scroll.
   */
  const showsPage = (page: MobilePage) => !isMobile || mobilePage === page;

  /** The nav item to mark. On the home pages it follows the scroll; a case
      study and Explorations both sit under Work, so Work stays marked there.
      Only the marking — each item still does what it did when clicked. */
  const activeNavItem = currentView === 'home' ? activeSection : 'work';

  const handleNextProject = () => {
    if (selectedProject) {
      const currentIndex = orderedProjects.findIndex(p => p.id === selectedProject.id);
      // No wrap-around: the last case study ends the sequence rather than
      // looping back to the first.
      const next = orderedProjects[currentIndex + 1];
      if (next) openProject(next);
    }
  };

  /**
   * Initial load. The view itself is already correct — it came out of
   * `parseLocation()` in the state initialisers above, so the first paint is
   * the right page. All that is left is to normalise the URL (an old `#slug`
   * link is rewritten to its path, in place, so Back doesn't bounce through it)
   * and, on desktop, to scroll to the requested section.
   */
  useEffect(() => {
    const route: Route = INITIAL_ROUTE.view === 'project' && !INITIAL_PROJECT
      ? { view: 'home', section: 'home' }
      : INITIAL_ROUTE;

    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    const wantedPath = routeToPath(route) || '/';
    if (hasLegacyHash() || currentPath !== wantedPath.replace(/\/+$/, '') ) {
      updateHistory(route, true);
    }

    if (route.view !== 'home') return;
    if (isMobile) {
      // The paged layout already mounts the right page; nothing to scroll to.
      return;
    }
    if (route.section !== 'home') {
      const element = document.getElementById(route.section);
      if (element) scrollToElementWithOffset(element, 'start', { startOffsetAdjustment: -64 });
    }
  // Mount-only by design: this reads the entry URL once. Re-running it when
  // the navigation helpers change would re-navigate mid-session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handleRouteChange = () => {
      // These branches all navigate with `updateHistory: false`, so they skip
      // the funnel that normally reports the view.
      const nextRoute = parseLocation();
      setAnalyticsRoute(nextRoute);

      // Someone followed an old `#slug` link — from outside the site, or from
      // a stale bookmark. Resolve it, then quietly rewrite the address bar to
      // the canonical path so the hash doesn't linger and Back doesn't have to
      // walk through it.
      if (hasLegacyHash()) {
        window.history.replaceState(
          nextRoute,
          '',
          `${routeToPath(nextRoute)}${window.location.search}`
        );
      }
      if (nextRoute.view === 'explorations') {
        openExplorations({ updateHistory: false });
        return;
      }
      if (nextRoute.view === 'project') {
        const project = projects.find(p => p.slug === nextRoute.slug);
        if (project) {
          openProject(project, { updateHistory: false });
        }
        return;
      }

      if (currentView !== 'home') {
        handleBackToHome({ updateHistory: false, sectionId: nextRoute.section });
        return;
      }

      scrollToSection(nextRoute.section, { updateHistory: false });
    };

    window.addEventListener('popstate', handleRouteChange);
    // A plain fragment navigation — someone editing the address bar, or an old
    // `#slug` link followed from inside the site — fires hashchange and, in
    // some browsers, no popstate at all. Listening to both means the view can
    // never drift out of sync with the URL.
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
    // isMobile matters: both handlers below branch on it, so a stale value
    // would scroll the paged layout instead of switching pages.
  // The handlers are stable for this purpose and re-subscribing on every
  // render would tear down and rebuild the popstate listener constantly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, selectedProject, isMobile]);

  useScrollSpy(currentView === 'home' && !isMobile, isManualScroll, setActiveSection);

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

  return {
    currentView,
    selectedProject,
    mobilePage,
    activeSection,
    activeNavItem,
    isTransitioning,
    analyticsRoute,
    isMenuOpen,
    setIsMenuOpen,
    showsPage,
    scrollToSection,
    openExplorations,
    openProject,
    handleProjectClick,
    handleBackToHome,
    handleNextProject,
  };
}
