import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
// The desktop pet is ~0.5MB of sprite sheet for a flourish. Splitting it out
// keeps that off the critical path; it mounts once the page is idle.
const LewisPet = lazy(() => import('./components/LewisPet'));
import BackToTop from './components/BackToTop';
import CursorGlow from './components/CursorGlow';
import CircuitGround from './components/CircuitGround';
import SiteNav from './components/SiteNav';
import SiteFooter from './components/SiteFooter';
import Lightbox from './components/Lightbox';
import ExplorationsView from './components/ExplorationsView';
import HeroSection from './components/home/HeroSection';
import MobileHomeSections from './components/home/MobileHomeSections';
import WorkSection from './components/home/WorkSection';
import ArchiveSection from './components/home/ArchiveSection';
import ExplorationsEntry from './components/home/ExplorationsEntry';
import AboutSection from './components/home/AboutSection';
import ContactSection from './components/home/ContactSection';
import { useIsMobile } from './hooks/useIsMobile';
import { useSiteNavigation } from './hooks/useSiteNavigation';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { orderedProjects } from './config/projects';
import { PUBLIC_URL } from './utils/getBaseUrl';
import { analyticsLocation } from './utils/analyticsRoute';
import type { LightboxImage } from './types';

// --- Main Component ---
const App = () => {
  const isMobile = useIsMobile();
  const navRef = useRef<HTMLElement | null>(null);
  const {
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
    handleProjectClick,
    handleBackToHome,
    handleNextProject,
  } = useSiteNavigation(isMobile, navRef);
  useDocumentMeta(currentView, selectedProject, mobilePage);

  const [selectedImage, setSelectedImage] = useState<LightboxImage | null>(null);
  const closeLightbox = useCallback(() => setSelectedImage(null), []);
  // The desktop pet is code-split; this gates its mount until the page is idle
  // so its sprite sheet never competes with the hero for bandwidth.
  const [showPet, setShowPet] = useState(false);

  /**
   * Mount the desktop pet once the page has settled. `requestIdleCallback`
   * rather than a timer so it never lands in the middle of the first paint.
   */
  useEffect(() => {
    if (isMobile) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (!w.requestIdleCallback) {
      const t = window.setTimeout(() => setShowPet(true), 1200);
      return () => clearTimeout(t);
    }
    const handle = w.requestIdleCallback(() => setShowPet(true), { timeout: 3000 });
    return () => w.cancelIdleCallback?.(handle);
  }, [isMobile]);

  return (
    /* Flex column with `mt-auto` on the footer: on a page short enough to fit
       the screen — Contact — the footer sits at the bottom instead of floating
       with a band of dead background beneath it. Every other child here is
       fixed-position, so only the content wrapper and the footer are in flow.
       `relative` anchors the circuit ground, which spans the full page height. */
    <div className="relative min-h-[100svh] flex flex-col bg-[var(--ground)] text-ink selection:bg-accent selection:text-ink-inverse transition-colors duration-300">
      <Analytics {...analyticsLocation(analyticsRoute)} />
      {/* Same `/work/[slug]` grouping as Analytics, so vitals for the case studies
          pool into one row rather than eleven thin ones. */}
      <SpeedInsights route={analyticsLocation(analyticsRoute).route} />
      {/* First focusable thing in the document. It used to sit after the
          back-to-top button and the pet's dismiss button, so the first two Tab
          stops were an invisible control and a decoration — which is precisely
          what a skip link exists to prevent. */}
      <a
        href={`${PUBLIC_URL}#main`}
        onClick={(event) => {
          // Move focus, not just the scroll position. Anchoring to a plain
          // <section> scrolled the page and left focus in the nav, so the next
          // Tab went straight back to where it started.
          event.preventDefault();
          const main = document.getElementById('main');
          if (!main) return;
          main.focus();
          main.scrollIntoView({ block: 'start' });
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:bg-white focus:text-ink-inverse focus:px-4 focus:py-2 focus:rounded-sm focus:shadow-lg"
      >
        Skip to content
      </a>
      {/* Circuit-trace ground: one board the height of the page, scrolling
          with it. Sits behind everything; all page content is lifted above it
          with `relative z-10`. Desktop only: on the mobile layout the signals
          read as flicker with no visible board behind them, so the ground is
          the plain --ground colour there. */}
      {!isMobile && <CircuitGround />}
      <CursorGlow />
      {/* Every width: the mobile nav is a hamburger menu, so nothing else takes
          a long page back to the top. */}
      <BackToTop />
      {/* The desktop pet, on the desktop layout only — he needs room to walk.
          In the side margins in the hero (crossing between them through a
          portal), in the left margin while the work and About are being read
          (and on every case study), roaming in Contact.
          Code-split and mounted on idle: his sprite sheet is ~0.5MB and used to
          land in the middle of the first paint. */}
      {!isMobile && showPet && (
        <Suspense fallback={null}>
          <LewisPet
            zone={
              currentView !== 'home' || activeSection === 'work' || activeSection === 'about'
                ? 'margin'
                : activeSection === 'contact'
                  ? 'roam'
                  : 'home'
            }
          />
        </Suspense>
      )}
      {selectedImage && <Lightbox image={selectedImage} onClose={closeLightbox} />}

      {/* Navigation */}
      <SiteNav
        navRef={navRef}
        activeNavItem={activeNavItem}
        currentView={currentView}
        mobilePage={mobilePage}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        scrollToSection={scrollToSection}
      />

      {/* CONDITIONAL RENDERING: HOME OR PROJECT VIEW.
          `tabIndex={-1}` so the skip link above can move focus here — the old
          target was a plain <section>, which scrolls but cannot be focused. */}
      <main id="main" tabIndex={-1} className="contents focus:outline-none">
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
            <HeroSection isMobile={isMobile} scrollToSection={scrollToSection} />
          )}

          {isMobile && mobilePage === 'home' && (
            <MobileHomeSections handleProjectClick={handleProjectClick} scrollToSection={scrollToSection} />
          )}

          {/* Work Section */}
          {showsPage('work') && <WorkSection handleProjectClick={handleProjectClick} />}

          {/* Everything outside the five flagship case studies — demos, older
              app work, and coursework — in a section of its own so Work reads
              as the strongest projects and nothing else. Short bottom padding
              at every breakpoint — `lg:pb-8` too, or ui.section's lg:py-24
              wins: the Explorations card that follows reads as the end of
              this list, and the full section padding left a 96px hole. */}
          {showsPage('work') && <ArchiveSection handleProjectClick={handleProjectClick} />}

          {/* Entry point to the Explorations page. Shown at every width now
              that the galleries are a view of their own rather than part of
              this scroll. */}
          {showsPage('work') && <ExplorationsEntry openExplorations={openExplorations} />}

          {/* About Section */}
          {showsPage('about') && <AboutSection />}

          {showsPage('contact') && <ContactSection />}
        </div>
      ) : currentView === 'explorations' ? (
        <ExplorationsView
          isTransitioning={isTransitioning}
          scrollToSection={scrollToSection}
          onImageClick={setSelectedImage}
        />
      ) : (
        /* PROJECT DETAIL VIEW */
        <Suspense fallback={<div className="min-h-screen" />}>
          {/* Keyed by project so moving between case studies mounts a fresh
              tree. Without it React reuses the same nodes for the next
              project's content — including every <Reveal>, which has already
              run, unobserved itself and dropped its mask. The sections that
              sat in those positions then arrive fully drawn, with no reveal
              at all, while the ones further down (with no counterpart in the
              previous project) still animate. Remounting also resets the
              section-progress highlight and tears down any demo canvas the
              previous case study had running. */}
          <ProjectDetail
            key={selectedProject?.id ?? 'none'}
            project={selectedProject}
            nextProject={
              selectedProject
                ? orderedProjects[orderedProjects.findIndex((p) => p.id === selectedProject.id) + 1] ?? null
                : null
            }
            onBack={handleBackToHome}
            onNext={handleNextProject}
            isTransitioning={isTransitioning}
            onImageClick={setSelectedImage}
          />
        </Suspense>
      )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default App;
