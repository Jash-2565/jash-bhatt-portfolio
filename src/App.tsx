import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  Menu, X, Mail, Linkedin, ArrowRight,
  ChevronDown, Image as PhotoIcon, Download, Briefcase, Award,
} from 'lucide-react';
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
import ResponsiveImage from './components/ResponsiveImage';
import ImageWithFallback from './components/ImageWithFallback';
import Reveal from './components/Reveal';
import { projects } from './data/projects';
import { orderedProjects } from './config/projects';
import { ui, personalitySignals, currentlyExploring, operatorStats, galleryItems, aiItems, gallerySnippetItems } from './config/ui';
import { PUBLIC_URL } from './utils/getBaseUrl';
import type { Project } from './types';

// --- Main Component ---
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [currentView, setCurrentView] = useState<'home' | 'project'>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isManualScroll = useRef(false);
  const navRef = useRef<HTMLElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const navButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lightboxCloseRef = useRef<HTMLButtonElement | null>(null);
  const [underline, setUnderline] = useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false });
  const isWhiteBgLightboxImage = selectedImage?.includes('Circuit-Design.webp');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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

  // Scroll spy
  useEffect(() => {
    if (currentView !== 'home') return;

    const handleScroll = () => {
      if (isManualScroll.current) return;

      const sections = ['home', 'work', 'about', 'contact'];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
        setActiveSection('contact');
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

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
      if (navRef.current && !navRef.current.contains(target)) {
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
    <div className="min-h-screen bg-[#02060f] text-slate-100 selection:bg-[#01F5D1] selection:text-slate-950 overflow-x-hidden transition-colors duration-300">
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-full focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            className="absolute top-4 right-4 z-10 text-white hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 p-2 rounded-full border border-white/20 shadow-lg"
            onClick={() => setSelectedImage(null)}
            ref={lightboxCloseRef}
            aria-label="Close image preview"
          >
            <X size={32} />
          </button>
          <ResponsiveImage
            src={selectedImage}
            alt="Full size view"
            className={`w-full h-full max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl ${isWhiteBgLightboxImage ? 'bg-white p-2' : ''}`}
            loading="eager"
            deferGifOnConstrainedNetwork={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Navigation */}
      <nav ref={navRef} className="fixed w-full bg-slate-950/70 backdrop-blur-md z-50 border-b border-slate-800 shadow-sm transition-all duration-300">
        <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-[4.5rem]">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('home')}>
              <h1 className="text-[2.1rem] font-display tracking-tight text-[#01F5D1]">JB</h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div ref={navItemsRef} className="relative flex flex-nowrap items-center gap-8 whitespace-nowrap">
                {['Home', 'Work', 'About', 'Contact'].map((item) => (
                  <button
                    key={item}
                    ref={(el) => { navButtonRefs.current[item.toLowerCase()] = el; }}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`text-base font-medium transition-colors duration-200 ${
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
                className="group ml-2 px-4 py-1.5 rounded-full border border-[#01F5D1] text-[#01F5D1] text-sm font-medium hover:bg-[#01F5D1] hover:text-slate-950 hover:shadow-[0_0_20px_-4px_rgba(1,245,209,0.6)] transition-all duration-300 whitespace-nowrap"
              >
                Resume <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleMenu} className="text-slate-300 hover:text-[#9EF7EA] p-2">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-950 border-t border-slate-800 absolute w-full shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['Home', 'Work', 'About', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`block w-full text-left px-3 py-2 text-lg font-medium rounded-md transition-colors ${
                    activeSection === item.toLowerCase() && currentView === 'home'
                      ? 'text-[#01F5D1] bg-slate-900'
                      : 'text-slate-300 hover:text-[#9EF7EA] hover:bg-slate-900'
                  }`}
                >
                  {item}
                </button>
              ))}
              <a
                href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-left px-3 py-2 text-lg font-medium text-[#01F5D1] hover:bg-slate-900 rounded-md"
              >
                Resume ↗
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* CONDITIONAL RENDERING: HOME OR PROJECT VIEW */}
      {currentView === 'home' ? (
        <div className={`bg-[#02060f] transition-all duration-300 ease-in-out transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {/* Hero Section */}
          <section
            id="home"
            className={`relative min-h-[calc(100vh-4.5rem)] md:min-h-[calc(100vh-5rem)] pt-[5.5rem] pb-8 md:pt-28 md:pb-10 scroll-mt-28 overflow-hidden ${
              !isTransitioning && activeSection === 'home'
                ? 'bg-gradient-to-b from-[#031018] via-[#062126] to-[#02060f]'
                : 'bg-[#02060f]'
            }`}
          >
            {!isTransitioning && activeSection === 'home' && (
              <>
                <div className="absolute -top-24 -right-8 w-64 h-64 rounded-full bg-[#01F5D1]/25 blur-3xl animate-drift"></div>
                <div className="absolute top-20 -left-12 w-52 h-52 rounded-full bg-[#00A19B]/30 blur-3xl animate-drift"></div>
                <div className="absolute inset-0 pointer-events-none circuit-overlay"></div>
              </>
            )}
            <div className="px-4 sm:px-8 lg:px-12 max-w-[84rem] mx-auto relative">
              <div className="grid lg:grid-cols-12 gap-10 items-stretch">
                <div className="lg:col-span-8 lg:h-full lg:flex lg:flex-col">
                  <h1 className="text-[3.1rem] md:text-[4.2rem] font-display text-slate-100 mb-5 leading-[1.05] animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                    I design <span className="accent-shimmer font-semibold">intuitive tech products</span> that blend hardware, software, and human behavior.
                  </h1>
                  <p className="text-[1.18rem] md:text-[1.34rem] text-slate-300 mb-6 leading-relaxed max-w-3xl animate-fade-in-up" style={{ animationDelay: '140ms' }}>
                    I am <span className="accent-shimmer font-semibold">Jash Bhatt</span>, a third-year Design student at FLAME University focused on technology-led design.
                  </p>

                  <div className="lg:hidden w-full rounded-3xl border border-slate-700 bg-slate-900/85 p-4 shadow-lg mb-6">
                    <div className="rounded-2xl overflow-hidden aspect-[4/5]">
                      <ResponsiveImage
                        src={`${PUBLIC_URL}/images/Jash-portrait.webp`}
                        alt="Portrait of Jash Bhatt"
                        className="w-full h-full object-cover"
                        loading="eager"
                        fetchPriority="high"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mt-4 px-1">Product Design Student · FLAME University</p>
                    <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 text-[#01F5D1] p-4 font-mono text-[11px]">
                      <p><span className="text-slate-500">{'>'}</span> status: <span className="text-[#9EF7EA]">available_for_internship</span></p>
                      <p><span className="text-slate-500">{'>'}</span> focus: <span className="text-[#9EF7EA]">phygital · ui/ux · circuits</span></p>
                      <p><span className="text-slate-500">{'>'}</span> stack: <span className="text-[#9EF7EA]">figma + react + arduino</span></p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1.5 mb-6 lg:hidden text-[#9EF7EA] animate-fade-in-up" style={{ animationDelay: '260ms' }}>
                    {personalitySignals.map((signal, index) => (
                      <span key={`mobile-${signal}`} className="text-base font-semibold leading-relaxed">
                        {signal}
                        {index < personalitySignals.length - 1 && (
                          <span className="mx-2 text-[#64d7c6] font-normal">|</span>
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col items-start gap-3 mb-8 lg:hidden animate-fade-in-up" style={{ animationDelay: '320ms' }}>
                    {operatorStats.map((stat) => (
                      <span key={`mobile-stat-${stat.label}`} className="min-h-[44px] px-4 py-2 text-sm font-semibold rounded-full border border-slate-600 bg-slate-900/85 text-slate-200 inline-flex items-center">
                        {stat.label}: {stat.value}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 lg:hidden animate-fade-in-up" style={{ animationDelay: '380ms' }}>
                    <button
                      onClick={() => scrollToSection('work')}
                      className={`group ${ui.btnBase} ${ui.btnPrimary}`}
                    >
                      View My Work <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={() => scrollToSection('contact')}
                      className={`${ui.btnBase} ${ui.btnSecondary}`}
                    >
                      Get in Touch
                    </button>
                    <a
                      href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className={`${ui.btnBase} ${ui.btnSecondary}`}
                    >
                      <Download size={18} /> Download Resume
                    </a>
                  </div>

                  <div className="hidden lg:flex flex-nowrap items-center mb-8 text-[#9EF7EA] whitespace-nowrap animate-fade-in-up" style={{ animationDelay: '260ms' }}>
                    {personalitySignals.map((signal, index) => (
                      <span key={signal} className="text-base font-semibold leading-relaxed shrink-0">
                        {signal}
                        {index < personalitySignals.length - 1 && (
                          <span className="mx-2.5 text-[#64d7c6] font-normal">|</span>
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="hidden lg:flex flex-col sm:flex-row gap-4 mt-auto animate-fade-in-up" style={{ animationDelay: '380ms' }}>
                    <button
                      onClick={() => scrollToSection('work')}
                      className={`group ${ui.btnBase} ${ui.btnPrimary}`}
                    >
                      View My Work <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={() => scrollToSection('contact')}
                      className={`${ui.btnBase} ${ui.btnSecondary}`}
                    >
                      Get in Touch
                    </button>
                    <a
                      href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className={`${ui.btnBase} ${ui.btnSecondary}`}
                    >
                      <Download size={18} /> Resume
                    </a>
                  </div>
                </div>

                <div className="hidden lg:block lg:col-span-4 lg:h-full animate-fade-in-up" style={{ animationDelay: '220ms' }}>
                  <div className="max-w-[324px] h-full lg:ml-auto rounded-3xl border border-slate-700 bg-slate-900/85 p-4 shadow-lg flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(1,245,209,0.35)] hover:border-[#01F5D1]/50">
                    <div className="rounded-2xl overflow-hidden aspect-[4/5]">
                      <ResponsiveImage
                        src={`${PUBLIC_URL}/images/Jash-portrait.webp`}
                        alt="Portrait of Jash Bhatt"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mt-4 px-1">Product Design Student · FLAME University</p>
                    <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 text-[#01F5D1] p-4 font-mono text-[11px]">
                      <p><span className="text-slate-500">{'>'}</span> status: <span className="text-[#9EF7EA]">available_for_internship</span></p>
                      <p><span className="text-slate-500">{'>'}</span> focus: <span className="text-[#9EF7EA]">phygital · ui/ux · circuits</span></p>
                      <p><span className="text-slate-500">{'>'}</span> stack: <span className="text-[#9EF7EA]">figma + react + arduino</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 md:mt-12 w-full">
                {operatorStats.map((stat, i) => (
                  <Reveal key={stat.label} delay={i * 90} duration={600}>
                    <div className="bg-slate-900/85 border border-slate-700 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#01F5D1]/60 hover:shadow-[0_18px_45px_-20px_rgba(1,245,209,0.4)]">
                      <div className="text-[1.95rem] md:text-[2.2rem] font-bold text-slate-100">{stat.value}</div>
                      <div className="text-sm text-slate-300 mt-1">{stat.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-7 flex justify-center animate-nudge text-slate-400">
                <ChevronDown size={32} />
              </div>
            </div>
          </section>

          {/* Work Section */}
          <section id="work" className="py-24 px-4 sm:px-8 lg:px-12 max-w-[84rem] mx-auto scroll-mt-28 bg-[#02060f]">
            <Reveal className="mb-16">
              <h2 className="text-3xl md:text-4xl font-display text-slate-100 mb-4">Selected Projects</h2>
              <p className="text-slate-300 max-w-2xl mb-6">From circuit-led builds to AI-enabled interfaces — each project reflects how I think through design, engineering, and behavior together.</p>
              <Reveal variant="grow-width" delay={180} duration={700}>
                <div className="h-1 w-24 bg-gradient-to-r from-[#01F5D1] to-[#00A19B] rounded-full"></div>
              </Reveal>
            </Reveal>

            <div className="space-y-32">
              {orderedProjects.map((project, index) => {
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
                    className="group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01F5D1] focus-visible:ring-offset-4 rounded-2xl"
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
                    <div className="grid md:grid-cols-12 gap-8 items-center">

                      {/* Image Column (7 cols) */}
                      <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                        <div className={`relative overflow-hidden rounded-2xl ${project.color} aspect-[4/3] shadow-sm card-glow`}>
                          {!projectThumbnail.includes('placeholder') ? (
                            <ResponsiveImage
                              src={projectThumbnail}
                              alt={project.title}
                              className={`block w-full h-full transition-transform duration-700 ${project.slug === 'python-codes' ? 'object-contain p-6' : 'object-cover object-center group-hover:scale-[1.06]'}`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-8 text-center">
                              <div>
                                <PhotoIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">Click to view {project.title}</p>
                              </div>
                            </div>
                          )}

                          {/* Sheen sweep on hover */}
                          <div className="sheen-layer"></div>

                          {/* Overlay — desktop hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 hidden md:flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 bg-slate-950/90 border border-slate-700 px-6 py-3 rounded-full font-medium text-[#9EF7EA] shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                              View Project
                            </span>
                          </div>

                        </div>
                      </div>

                      {/* Text Column (5 cols) */}
                      <div className={`md:col-span-5 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-slate-600 text-xs font-mono font-medium">{String(index + 1).padStart(2, '0')}</span>
                          <span className="text-slate-500 text-sm font-medium">{project.category}</span>
                        </div>

                        <h3 className={`text-3xl md:text-4xl font-bold text-slate-100 mb-4 transition-colors ${project.hoverColor}`}>
                          {project.title}
                        </h3>
                        <p className="text-slate-300 text-lg leading-relaxed mb-6">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                          {project.tags.map((tag, i) => (
                            <span key={i} className={ui.chipBase}>{tag}</span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleProjectClick(project);
                          }}
                          className={`font-semibold flex items-center gap-2 hover:gap-3 transition-all ${project.accentColor}`}
                          aria-label={`Read full case study for ${project.title}`}
                        >
                          Read Full Case Study <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                  </Reveal>
                );
              })}
            </div>

            {/* Creative Explorations Divider */}
            <Reveal className="mt-32 mb-16 flex items-center gap-6">
              <div className="h-px flex-1 bg-slate-800"></div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">Beyond case studies</p>
                <h2 className="text-2xl font-display text-slate-300">Creative Explorations</h2>
              </div>
              <div className="h-px flex-1 bg-slate-800"></div>
            </Reveal>

            {/* Additional Work Grid */}
            <div className="grid grid-cols-1 gap-12">

              {/* Photoshop Section */}
              <Reveal delay={60} className={`${ui.cardBase} ${ui.cardHover} p-8`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <ResponsiveImage
                      src={`${PUBLIC_URL}/images/Photoshop and Animation/photoshop.png`}
                      alt="Photoshop icon"
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Photoshop & Animation</h3>
                </div>
                <p className="text-slate-300 mb-6">Explorations in visual design, motion graphics, and digital art created during my academic coursework.</p>
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
                  {galleryItems.map((item, i) => (
                    <div
                      key={i}
                      className={`w-full rounded-xl overflow-hidden bg-slate-800 border border-slate-700 transition-all group md:aspect-square hover:-translate-y-1 ${item.type === 'video' ? 'hover:border-slate-600 hover:shadow-md' : 'cursor-pointer hover:border-[#01F5D1] hover:shadow-md'}`}
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
                        <ImageWithFallback
                          src={item.src}
                          alt={item.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          deferGifOnConstrainedNetwork
                        />
                      ) : (
                        <PhotoIcon className="text-slate-300 w-full h-full p-4" />
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Brand Animation Section */}
              <Reveal delay={120} className={`${ui.cardBase} ${ui.cardHover} p-8`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <ResponsiveImage
                      src={`${PUBLIC_URL}/images/Photoshop and Animation/after-effects.png`}
                      alt="After Effects icon"
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Nothing Brand Animation</h3>
                </div>
                <p className="text-slate-300 mb-6">A brand motion piece for Nothing (phone company), focused on clean geometry and sound-led pacing.</p>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
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
              <Reveal delay={180} className={`${ui.cardBase} ${ui.cardHover} p-8`}>
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
                <p className="text-slate-300 mb-6">Exploring automotive form language and aerodynamics through generative AI and prompt engineering.</p>
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
                  {aiItems.map((item, i) => (
                    <div
                      key={i}
                      className="w-full rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-slate-700 hover:border-[#01F5D1] hover:shadow-md transition-all group md:aspect-square hover:-translate-y-1"
                      onClick={() => item.src && setSelectedImage(item.src)}
                    >
                      {item.src ? (
                        <ImageWithFallback
                          src={item.src}
                          alt={item.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          deferGifOnConstrainedNetwork
                        />
                      ) : (
                        <PhotoIcon className="text-slate-300 w-full h-full p-4" />
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Gallery Snippet Section */}
              <Reveal delay={240} className={`${ui.cardBase} ${ui.cardHover} p-8`}>
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
                <p className="text-slate-300 mb-6">For over 10 years, I've pursued nature photography as a personal hobby. I am skilled with both professional DSLRs and mobile cameras, using them to develop a higher appreciation for the natural world.</p>
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:grid-rows-2 md:gap-6 md:auto-rows-fr">
                  {gallerySnippetItems.map((item, i) => {
                    const positionClass = i === 0
                      ? 'md:col-start-1 md:row-start-1'
                      : i === 1
                        ? 'md:col-start-1 md:row-start-2'
                        : i === 2
                          ? 'md:col-start-2 md:row-span-2 md:h-full'
                          : 'md:col-start-3 md:row-span-2 md:h-full';
                    const shapeClass = i < 2
                      ? 'w-full md:aspect-[4/3]'
                      : 'w-full md:aspect-auto md:h-full';

                    return (
                      <div
                        key={`gallery-snippet-${i}`}
                        className={`${shapeClass} rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-slate-700 hover:border-slate-500 hover:shadow-md transition-all group ${positionClass} hover:-translate-y-1`}
                        onClick={() => item.src && setSelectedImage(item.src)}
                      >
                        {item.src ? (
                          <ImageWithFallback
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            deferGifOnConstrainedNetwork
                          />
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
          <section id="about" className="py-24 scroll-mt-28 bg-[#02060f]">
            <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="grid md:grid-cols-2 gap-16">
                <Reveal>
                  <h2 className="text-3xl md:text-4xl font-display text-slate-100 mb-8">About Me</h2>
                  <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                    <p>
                      I love technology in all forms. I prefer direct communication, clear expectations, and products that behave exactly as intended.
                    </p>
                    <p>
                      I work across UI, hardware, and interaction design, with a strong focus on circuit design and electronics. My goal is simple: build phygital products that are refined, useful, and technically solid.
                    </p>
                  </div>

                  <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-[#00A19B]/60 bg-[#00A19B]/20 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#01F5D1] hover:shadow-[0_14px_36px_-18px_rgba(1,245,209,0.45)]">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#01F5D1] mb-2">Design × Engineering</p>
                      <p className="text-sm text-slate-200 font-medium">I bridge UI, hardware, and behavior in one product view.</p>
                    </div>
                    <div className="rounded-2xl border border-[#C8CCCE]/40 bg-[#C8CCCE]/10 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8CCCE] hover:shadow-[0_14px_36px_-18px_rgba(200,204,206,0.35)]">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#C8CCCE] mb-2">Research-First</p>
                      <p className="text-sm text-slate-200 font-medium">Every design decision is grounded in user insight before it ships.</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-[0_14px_36px_-18px_rgba(52,211,153,0.4)]">
                      <p className="text-xs uppercase tracking-[0.18em] text-emerald-300 mb-2">End-to-End</p>
                      <p className="text-sm text-slate-200 font-medium">I own execution from Figma through code to physical prototype.</p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 transition-colors duration-300 hover:border-[#01F5D1]/50">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 mb-3">Design Principles</p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-300"></span><span className="[text-wrap:pretty]">Technology shifts fast — I keep my process tool-agnostic and outcome-focused.</span></li>
                      <li className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-300"></span><span className="[text-wrap:pretty]">Clarity over cleverness: if an interaction needs explaining, it needs redesigning.</span></li>
                      <li className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-300"></span><span className="[text-wrap:pretty]">I iterate on working prototypes, not just screens — real constraints shape better design.</span></li>
                    </ul>
                  </div>
                </Reveal>

                <Reveal delay={140}>
                  <h3 className="text-3xl font-display font-semibold tracking-tight text-slate-100 mb-9">Expertise</h3>
                  <div className="mb-8">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 mb-3">Currently exploring</p>
                    <div className="flex flex-wrap gap-2">
                      {currentlyExploring.map((item) => (
                        <span key={item} className="px-3 py-1.5 text-sm font-medium rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-200">
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
                          <span key={tool} className="px-3 py-1.5 text-sm font-medium text-emerald-300 bg-emerald-950/30 border border-emerald-800 rounded-full">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-12">
                    <div className="border-l-2 border-[#00A19B] pl-4">
                      <div className="text-xl font-semibold tracking-tight text-slate-100 mb-4">Education</div>
                      <div className="space-y-6">
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
          <section id="contact" className="py-24 scroll-mt-28 bg-[#02060f]">
            <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="grid md:grid-cols-2 gap-16">
                <Reveal>
                  <h2 className="text-3xl md:text-4xl font-display text-slate-100 mb-6">Let's Build Something</h2>
                  <p className="text-xl text-slate-300">
                    I am actively looking for internship opportunities in UI/UX, product design, and phygital interaction — where I can contribute from research through to implementation.
                  </p>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <Reveal delay={80} asChild>
                    <a href="mailto:jash.bhatt@flame.edu.in" className="relative flex items-center gap-4 p-5 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-sm card-glow group overflow-hidden">
                      <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-[#01F5D1]/50 to-transparent rounded-full" />
                      <div className="shrink-0 p-3 bg-[#00A19B]/25 text-[#9EF7EA] rounded-full transition-all duration-300 group-hover:bg-[#01F5D1] group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-6">
                        <Mail size={22} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-slate-400 font-medium">Email Me</p>
                        <p className="text-slate-100 font-semibold text-sm whitespace-nowrap group-hover:text-[#01F5D1] transition-colors">jash.bhatt@flame.edu.in</p>
                      </div>
                    </a>
                  </Reveal>

                  <Reveal delay={160} asChild>
                    <a href="https://linkedin.com/in/jash-bhatt" target="_blank" rel="noreferrer" className="relative flex items-center gap-4 p-5 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-sm card-glow group overflow-hidden">
                      <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-[#01F5D1]/50 to-transparent rounded-full" />
                      <div className="shrink-0 p-3 bg-[#00A19B]/25 text-[#9EF7EA] rounded-full transition-all duration-300 group-hover:bg-[#01F5D1] group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-6">
                        <Linkedin size={22} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-slate-400 font-medium">LinkedIn</p>
                        <p className="text-slate-100 font-semibold text-sm whitespace-nowrap group-hover:text-[#01F5D1] transition-colors">/in/jash-bhatt</p>
                      </div>
                    </a>
                  </Reveal>

                  <Reveal delay={240} asChild>
                    <a href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`} target="_blank" rel="noreferrer" className="relative flex items-center gap-4 p-5 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-sm card-glow group overflow-hidden">
                      <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-[#01F5D1]/50 to-transparent rounded-full" />
                      <div className="shrink-0 p-3 bg-[#00A19B]/25 text-[#9EF7EA] rounded-full transition-all duration-300 group-hover:bg-[#01F5D1] group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-6">
                        <Download size={22} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-slate-400 font-medium">Resume</p>
                        <p className="text-slate-100 font-semibold text-sm whitespace-nowrap group-hover:text-[#01F5D1] transition-colors">Download PDF</p>
                      </div>
                    </a>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* PROJECT DETAIL VIEW */
        <Suspense fallback={<div className="min-h-screen bg-[#02060f]" />}>
          <ProjectDetail
            project={selectedProject}
            onBack={handleBackToHome}
            onNext={handleNextProject}
            isTransitioning={isTransitioning}
            onImageClick={setSelectedImage}
          />
        </Suspense>
      )}

      {/* Footer */}
      <footer className="bg-[#02060f] border-t border-slate-800 py-12 text-center">
        <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col items-center gap-3">
          <span className="text-[1.6rem] font-display tracking-tight text-[#01F5D1]/60">JB</span>
          <p className="text-slate-500 text-sm">© 2026 Jash Bhatt — Designed & built from scratch.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
