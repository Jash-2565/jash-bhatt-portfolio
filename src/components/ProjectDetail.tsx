import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Image as PhotoIcon, Copy, Check, Clock, Briefcase, Users, ZoomIn } from 'lucide-react';
const ArkanoidDemo = lazy(() => import('./ArkanoidDemo'));
const YoloV8Demo = lazy(() => import('./YoloV8Demo'));
const MovieRecsDemo = lazy(() => import('./MovieRecsDemo'));
import ResponsiveImage from './ResponsiveImage';
import Reveal from './Reveal';
import type { Project, Section } from '../types';
import { PROJECT_HERO_THEMES, DEFAULT_PROJECT_HERO_THEME, CONTAINED_THUMBNAIL_BACKDROPS } from '../config/projects';
import { ui } from '../config/ui';
import { formatNameList } from '../utils/formatNameList';
import { usePointerFine } from '../hooks/usePointerFine';

const DemoLoader = () => (
  <div className="glass !bg-slate-950/75 h-full lg:h-[620px] rounded-2xl flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <div className="w-7 h-7 border-2 border-slate-700 border-t-[#01F5D1] rounded-full animate-spin" />
      <span className="text-[10px] tracking-widest uppercase">Loading Demo</span>
    </div>
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      aria-label={copied ? 'Code copied' : 'Copy code snippet'}
      className="flex items-center justify-center gap-1.5 min-h-11 min-w-11 -my-2 px-2 text-xs text-slate-400 hover:text-[#01F5D1] active:text-[#01F5D1] transition-colors"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'copied' : 'copy'}
    </button>
  );
};

interface ProjectDetailProps {
  project: Project | null;
  nextProject?: Project | null;
  onBack: () => void;
  onNext: () => void;
  isTransitioning: boolean;
  onImageClick: (src: string) => void;
}

const ProjectDetail = ({
  project,
  nextProject,
  onBack,
  onNext,
  isTransitioning,
  onImageClick,
}: ProjectDetailProps) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionsWrapRef = useRef<HTMLDivElement>(null);
  const heroParallaxRef = useRef<HTMLDivElement>(null);
  const pointerFine = usePointerFine();
  const slug = project?.slug;

  // Keyboard shortcuts for the case study: Esc → back, → → next project.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') onBack();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack, onNext]);

  // Highlight the section heading whose content sits near the top of the viewport.
  useEffect(() => {
    const wrap = sectionsWrapRef.current;
    if (!wrap) return;
    const els = Array.from(wrap.querySelectorAll<HTMLElement>('[data-section]'));
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-section'));
            if (!Number.isNaN(idx)) setActiveIdx(idx);
          }
        });
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [slug]);

  // Subtle parallax on the case-study hero image as it scrolls through view.
  // Pointer devices only — on a phone the shift is barely perceptible but it
  // still costs a transform repaint on every scroll frame.
  useEffect(() => {
    const el = heroParallaxRef.current;
    if (!el || !pointerFine) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const shift = Math.max(-26, Math.min(26, (rect.top - window.innerHeight / 2) * -0.05));
      el.style.transform = `translateY(${shift.toFixed(1)}px) scale(1.08)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [slug, pointerFine]);

  if (!project) return null;

  const projectHeroTheme = PROJECT_HERO_THEMES[project.slug] ?? DEFAULT_PROJECT_HERO_THEME;
  const isPythonCodes = project.slug === 'python-codes';
  const isCountdownMotorControl = project.slug === 'tinkering';
  const nextThumbnailBackdrop = nextProject
    ? CONTAINED_THUMBNAIL_BACKDROPS[nextProject.slug]
    : undefined;
  const { heroBgClass, heroTextClass, heroMutedTextClass, heroBodyTextClass } = projectHeroTheme;

  const renderDemoBlock = (section: Section) => {
    const demoInner =
      section.demoId === 'arkanoid'
        ? <ArkanoidDemo />
        : section.demoId === 'yolov8'
          ? <YoloV8Demo />
          : section.demoId === 'movie-recs'
            ? <MovieRecsDemo />
            : null;

    const demoComponent = demoInner
      ? <Suspense fallback={<DemoLoader />}>{demoInner}</Suspense>
      : null;

    const snippetContainerClass =
      'glass !bg-slate-950/75 h-[280px] sm:h-[440px] lg:h-[620px] rounded-2xl text-slate-100 flex flex-col';
    // `overscroll-contain` stops a sideways swipe inside the snippet from
    // chaining out to the page once it hits the end of the code.
    const snippetPreClass =
      'min-h-0 flex-1 overflow-auto overscroll-contain p-4 text-[11px] leading-relaxed sm:text-xs md:text-sm font-mono whitespace-pre';

    if (demoComponent && section.codeBlock) {
      return (
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className={snippetContainerClass}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-xs uppercase tracking-widest text-slate-400">
                Python Snippet
                <span className="md:hidden normal-case tracking-normal text-slate-500"> · swipe →</span>
              </span>
              <CopyButton text={section.codeBlock} />
            </div>
            <pre className={snippetPreClass}>{section.codeBlock}</pre>
          </div>
          {demoComponent}
        </div>
      );
    }

    if (demoComponent) {
      return <div className="mt-8">{demoComponent}</div>;
    }

    if (section.codeBlock) {
      return (
        <div className={`mt-8 ${snippetContainerClass}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-xs uppercase tracking-widest text-slate-400">Python Snippet</span>
            <CopyButton text={section.codeBlock} />
          </div>
          <pre className={snippetPreClass}>{section.codeBlock}</pre>
        </div>
      );
    }

    return null;
  };

  const renderImages = (section: Section) => {
    if (!section.images) return null;

    if (section.imageLayout === 'storyboard') {
      return (
        <div className="mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {section.images.map((img, i) => {
              const isPlaceholder = !img.src || img.src.includes('placeholder');
              return (
                <div key={`story-${i}`} className="min-w-0 lg:min-w-[14rem] flex flex-col gap-3">
                  <div
                    className={`rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-sm transition-all hover:shadow-md h-44 sm:h-56 ${isPlaceholder ? '' : 'cursor-zoom-in'}`}
                    onClick={() => { if (!isPlaceholder && img.src) onImageClick(img.src); }}
                  >
                    {isPlaceholder ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <PhotoIcon size={36} className="mb-3 opacity-60" />
                        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                      </div>
                    ) : (
                      <ResponsiveImage
                        src={img.src}
                        alt={img.caption}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-300">{img.caption}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (section.imageLayout === 'techSplit') {
      const [rectangleImage, ...squareImages] = section.images;
      if (!rectangleImage) return null;

      const renderMediaCard = (
        img: { src: string; caption: string; fullWidth?: boolean; borderless?: boolean; whiteBg?: boolean; bgClass?: string },
        heightClass: string,
        key: string
      ) => {
        const isPlaceholder = !img.src || img.src.includes('placeholder');
        return (
          <div key={key} className="flex flex-col gap-3">
            <div
              className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-white/10 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-white/5')} shadow-sm`} transition-all hover:shadow-md ${heightClass} ${isPlaceholder ? '' : 'cursor-zoom-in'}`}
              onClick={() => { if (!isPlaceholder && img.src) onImageClick(img.src); }}
            >
              {isPlaceholder ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <PhotoIcon size={36} className="mb-3 opacity-60" />
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                </div>
              ) : (
                <ResponsiveImage
                  src={img.src}
                  alt={img.caption}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              )}
            </div>
            <p className="text-sm text-slate-400 text-center">{img.caption}</p>
          </div>
        );
      };

      return (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7">
            {renderMediaCard(rectangleImage, 'h-56 sm:h-72 md:h-[33rem]', 'tech-rect')}
          </div>
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            {squareImages.slice(0, 2).map((img, i) =>
              renderMediaCard(img, 'h-56 sm:h-72 md:h-[15rem]', `tech-square-${i}`)
            )}
          </div>
        </div>
      );
    }

    if (section.imageLayout === 'mixed') {
      const rowImages = section.images.filter(img => !img.fullWidth);
      const fullWidthImages = section.images.filter(img => img.fullWidth);

      return (
        <div className="mt-10 flex flex-col gap-8 w-fit mx-auto md:mx-0">
          {rowImages.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
              {rowImages.map((img, i) => {
                const isPlaceholder = !img.src || img.src.includes('placeholder');
                return (
                  <div key={`row-${i}`} className="flex flex-col gap-3 items-center">
                    <div
                      className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-white/10 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-white/5')} shadow-sm`} transition-all hover:shadow-md ${isPlaceholder ? 'w-full h-40 sm:h-48 md:h-56' : 'cursor-zoom-in w-fit'}`}
                      onClick={() => { if (!isPlaceholder && img.src) onImageClick(img.src); }}
                    >
                      {isPlaceholder ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <PhotoIcon size={32} className="mb-3 opacity-60" />
                          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                        </div>
                      ) : (
                        <ResponsiveImage
                          src={img.src}
                          alt={img.caption}
                          className={`w-full h-auto md:w-auto ${section.imageHeight || 'md:h-80'}`}
                          loading="lazy"
                        />
                      )}
                    </div>
                    <p className="text-sm text-slate-400 text-center">{img.caption}</p>
                  </div>
                );
              })}
            </div>
          )}
          {fullWidthImages.map((img, i) => (
            <div key={`full-${i}`} className={`flex flex-col gap-3 ${img.containerClass || 'w-full'}`}>
              <div
                className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-white/10 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-white/5')} shadow-sm`} transition-all hover:shadow-md ${!img.src || img.src.includes('placeholder') ? 'h-44 sm:h-56 md:h-64 w-full' : 'cursor-zoom-in'}`}
                onClick={() => { if (img.src && !img.src.includes('placeholder')) onImageClick(img.src); }}
              >
                {!img.src || img.src.includes('placeholder') ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <PhotoIcon size={36} className="mb-3 opacity-60" />
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                  </div>
                ) : (
                  <ResponsiveImage
                    src={img.src}
                    alt={img.caption}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                )}
              </div>
              <p className="text-sm text-slate-400 text-center">{img.caption}</p>
            </div>
          ))}
        </div>
      );
    }

    if (section.imageLayout === 'grid') {
      return (
        <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {section.images.map((img, i) => {
            const isPlaceholder = !img.src || img.src.includes('placeholder');
            const useAutoHeight = section.imageHeight === 'auto';
            const gridHeightClass = useAutoHeight ? '' : (section.imageHeight || 'h-44 sm:h-56 md:h-64');
            return (
              <div key={i} className="flex flex-col gap-3">
                <div
                  className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-white/10 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-white/5')} shadow-sm`} transition-all hover:shadow-md ${gridHeightClass} ${isPlaceholder ? '' : 'cursor-zoom-in'}`}
                  onClick={() => { if (!isPlaceholder && img.src) onImageClick(img.src); }}
                >
                  {isPlaceholder ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <PhotoIcon size={36} className="mb-3 opacity-60" />
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                    </div>
                  ) : (
                    <ResponsiveImage
                      src={img.src}
                      alt={img.caption}
                      className={
                        section.imageCrop
                          ? 'w-full h-full object-cover object-center'
                          : useAutoHeight
                            ? 'w-full h-auto'
                            : 'w-full h-full object-contain'
                      }
                      loading="lazy"
                    />
                  )}
                </div>
                <p className="text-sm text-slate-400 text-center">{img.caption}</p>
              </div>
            );
          })}
        </div>
      );
    }

    // Default or Row layout
    return (
      <div className={`mt-10 ${section.imageLayout === 'row' ? 'flex flex-col md:flex-row gap-4 justify-start items-stretch md:items-start' : 'grid grid-cols-1 gap-12'}`}>
        {section.images.map((img, i) => {
          const isPlaceholder = !img.src || img.src.includes('placeholder');
          return (
            <div
              key={i}
              className={`flex flex-col gap-3 ${section.imageLayout === 'row' ? 'w-full md:w-auto md:flex-shrink-0' : ''} ${section.imageCrop ? 'w-fit items-center' : ''}`}
            >
              <div
                className={`relative rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-white/10 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-white/5')} shadow-sm`} transition-all hover:shadow-md ${section.imageLayout === 'row' ? (section.imageCrop ? 'w-full' : 'w-full md:w-fit') : ''} ${section.imageCrop && section.imageHeight ? section.imageHeight : ''} ${isPlaceholder ? 'w-full h-40 sm:h-48 md:h-56' : 'cursor-zoom-in'}`}
                onClick={() => { if (!isPlaceholder && img.src) onImageClick(img.src); }}
              >
                {isPlaceholder ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <PhotoIcon size={32} className="mb-3 opacity-60" />
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                  </div>
                ) : (
                  <>
                    <ResponsiveImage
                      src={img.src}
                      alt={img.caption}
                      className={
                        section.imageCrop
                          ? 'w-full h-full object-cover object-center'
                          : section.imageLayout === 'row'
                            ? `w-full h-auto md:w-auto ${section.imageHeight || 'md:h-48'} max-w-full`
                            : 'w-full h-auto'
                      }
                      loading="lazy"
                    />
                    {/* Several case-study diagrams are authored 1600px wide, so
                        their labels are unreadable inline on a phone. Advertise
                        that tapping opens the zoomable lightbox. */}
                    <span className="md:hidden absolute bottom-2 right-2 glass-chip flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-slate-200 pointer-events-none">
                      <ZoomIn size={11} /> Tap to zoom
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-slate-400 text-center">{img.caption}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`relative z-10 text-slate-100 min-h-screen transition-all duration-300 ease-in-out transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

      {/* Project Hero */}
      <div className={`w-full ${heroBgClass} pt-[calc(var(--nav-h)+2rem)] pb-12 md:pt-32 md:pb-24 border-b border-white/10`}>
        <div className={ui.shell}>
          <button
            onClick={onBack}
            className="group -ml-3 flex items-center gap-2 min-h-11 px-3 rounded-full mb-6 md:mb-12 transition-colors text-sm font-medium text-slate-300 hover:text-[#01F5D1] active:bg-white/10"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-5 md:mb-8">
            <span className={`text-xs font-bold tracking-widest uppercase ${heroMutedTextClass}`}>{project.category}</span>
          </div>

          <h1 className={`text-[clamp(1.9rem,7.5vw,2.5rem)] md:text-6xl font-bold mb-5 md:mb-8 tracking-tight leading-[1.12] md:leading-tight [text-wrap:balance] ${heroTextClass}`}>{project.title}</h1>
          <p className={`text-base md:text-xl leading-relaxed max-w-2xl font-light ${heroBodyTextClass}`}>
            {project.description}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`${ui.shell} py-10 md:py-16`}>

        {/* Project Meta */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-12 gap-6 md:gap-8 mb-12 pb-8 md:mb-20 md:pb-12 border-b border-white/10">
          <div className="md:col-span-3">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <Briefcase size={13} className="text-[#01F5D1]" /> Role
            </h3>
            <p className="font-medium text-slate-100 text-sm leading-6">{project.content.role}</p>
          </div>
          <div className="md:col-span-3">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <Clock size={13} className="text-[#01F5D1]" /> Timeline
            </h3>
            <p className="font-medium text-slate-100 text-sm leading-6">{project.timeline}</p>
          </div>
          <div className="xs:col-span-2 md:col-span-6">
            <div className="w-full md:w-fit md:max-w-full md:ml-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-left md:text-right">Tech &amp; Tools</h3>
              <div className="flex flex-wrap gap-2 md:justify-end">
                {project.tags.map((tag, i) => (
                  <span key={i} className={ui.chipBase}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
          {project.content.team && project.content.team.length > 0 && (
            <div className="xs:col-span-2 md:col-span-12">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                <Users size={13} className="text-[#01F5D1]" /> Team
              </h3>
              <p className="font-medium text-slate-100 text-sm leading-6">
                Built alongside {formatNameList(project.content.team)}
              </p>
            </div>
          )}
        </div>

        {/* Hero Image */}
        {!isPythonCodes && (
          <div className={`w-full bg-white/5 rounded-lg mb-12 md:mb-24 border border-white/10 overflow-hidden shadow-sm ${isCountdownMotorControl ? 'bg-transparent aspect-square max-w-[420px] w-full mx-auto' : ''}`}>
            {!project.content.heroImage.includes('placeholder') ? (
              <div ref={heroParallaxRef} className="w-full h-full will-change-transform">
                <ResponsiveImage
                  src={project.content.heroImage}
                  alt={`${project.title} Hero`}
                  className={isCountdownMotorControl ? 'w-full h-full object-cover object-center' : 'w-full h-auto block'}
                  loading="eager"
                />
              </div>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <PhotoIcon size={48} className="mx-auto mb-4 opacity-50" />
                  <span className="text-sm font-medium tracking-wide uppercase">Project Hero Image</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Narrative Sections */}
        {isPythonCodes ? (
          <div className="space-y-10 md:space-y-16">
            {project.content.sections.map((section, idx) => (
              <div key={idx} className="glass rounded-3xl !border-emerald-400/30 p-5 sm:p-8 md:p-10">
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-emerald-600/70 mb-3">Python Project</div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 mb-3">{section.title}</h2>
                  <p className="text-base md:text-lg text-slate-300 leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
                {section.listItems && (
                  <ul className="space-y-3 mb-4 pl-1">
                    {section.listItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-200">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-400"></span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {renderDemoBlock(section)}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-14 md:space-y-24" ref={sectionsWrapRef}>
            {project.content.sections.map((section, idx) => {
              const isActive = idx === activeIdx;
              return (
              <div key={idx} data-section={idx} className="grid md:grid-cols-12 gap-5 md:gap-8 items-start group">

                {/* Left Column: Heading */}
                <div className="md:col-span-4 md:sticky md:top-24">
                  <span className={`block font-mono text-xs tracking-[0.3em] mb-3 transition-colors duration-300 ${isActive ? 'text-[#01F5D1]' : 'text-slate-500'}`}>
                    {String(idx + 1).padStart(2, '0')} / {String(project.content.sections.length).padStart(2, '0')}
                  </span>
                  <div className={`h-1 ${project.badge.replace('text', 'bg').split(' ')[0]} mb-4 transition-all duration-300 group-hover:w-14 ${isActive ? 'w-14 opacity-100' : 'w-8 opacity-80'}`}></div>
                  <h2 className={`text-xl font-bold tracking-tight leading-tight transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-100'}`}>{section.title}</h2>
                </div>

                {/* Right Column: Content */}
                <Reveal variant="fade-up" className="md:col-span-8" threshold={0.08}>
                  <p className="text-base md:text-lg text-slate-300 leading-relaxed whitespace-pre-line mb-6 md:mb-8 font-normal">{section.content}</p>

                  {section.listItems && (
                    <ul className="space-y-3 mb-8 pl-1">
                      {section.listItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-200">
                          <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${project.badge.replace('text', 'bg').split(' ')[0]}`}></span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {renderDemoBlock(section)}
                  {renderImages(section)}

                  {/* Embed (Figma etc). Below md the iframes are replaced by a
                      link out: a FigJam board rendered ~340px wide is unreadable,
                      and a 360px phone-frame inside a 340px column is worse than
                      no frame at all. Opening it in Figma's own app/site gives a
                      far better experience — and drops a heavy third-party frame
                      from the mobile page. */}
                  {section.embedUrl && (
                    <>
                      <a
                        href={section.embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`md:hidden mt-8 ${ui.cardBase} ${ui.cardHover} flex items-center gap-4 p-5 w-full`}
                      >
                        <span className="shrink-0 p-3 bg-[#00A19B]/25 text-[#9EF7EA] rounded-full">
                          <ExternalLink size={20} />
                        </span>
                        <span className="min-w-0 text-left">
                          <span className="block text-sm text-slate-400 font-medium">
                            {section.embedWide ? 'Design board' : 'Interactive prototype'}
                          </span>
                          <span className="block text-slate-100 font-semibold text-sm">
                            Open in Figma ↗
                          </span>
                        </span>
                      </a>
                      {section.embedWide ? (
                        <div className="hidden md:block mt-10 w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg" style={{ aspectRatio: '16/9' }}>
                          <iframe
                            src={section.embedUrl}
                            className="w-full h-full"
                            allowFullScreen
                            loading="lazy"
                            style={{ border: 'none' }}
                            title="Design Board"
                          ></iframe>
                        </div>
                      ) : (
                        <div className="hidden md:block mt-12 w-full max-w-[360px] mx-auto aspect-[9/19] bg-slate-900 rounded-[2.5rem] overflow-hidden border-[8px] border-slate-800 shadow-2xl relative">
                          <iframe
                            src={section.embedUrl}
                            className="w-full h-full bg-slate-50"
                            allowFullScreen
                            loading="lazy"
                            style={{ border: 'none' }}
                            title="Interactive Prototype"
                          ></iframe>
                        </div>
                      )}
                    </>
                  )}

                  {/* CTA Button */}
                  {section.cta && (
                    <div className="mt-10">
                      <a
                        href={section.cta.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${ui.btnBase} glass glass-hover gap-3 text-white`}
                      >
                        {section.cta.text} <ExternalLink size={20} className="opacity-80" />
                      </a>
                    </div>
                  )}
                </Reveal>
              </div>
              );
            })}
          </div>
        )}

        {/* Next Project Preview */}
        {nextProject && (
          <div className="mt-16 md:mt-32">
            <button
              onClick={onNext}
              className="glass glass-hover group relative w-full overflow-hidden rounded-3xl p-4 sm:p-6 md:p-8 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01F5D1]"
              aria-label={`Open next project: ${nextProject.title}`}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className={`block shrink-0 w-16 h-16 xs:w-20 xs:h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border border-white/10 ${nextThumbnailBackdrop ?? 'bg-white/5'}`}>
                  {!(nextProject.content.thumbnailImage ?? nextProject.content.heroImage).includes('placeholder') ? (
                    <ResponsiveImage
                      src={nextProject.content.thumbnailImage ?? nextProject.content.heroImage}
                      alt={nextProject.title}
                      className={`w-full h-full transition-transform duration-500 group-hover:scale-110 ${nextThumbnailBackdrop ? 'object-contain' : 'object-cover'}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon size={28} className="text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#01F5D1]/90">Next Project →</span>
                  <h3 className="mt-2 text-xl xs:text-2xl md:text-3xl font-bold text-slate-100 truncate group-hover:text-[#01F5D1] transition-colors">
                    {nextProject.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400 truncate">{nextProject.category}</p>
                </div>
                <ArrowRight
                  size={28}
                  className="hidden md:block shrink-0 text-slate-500 group-hover:text-[#01F5D1] group-hover:translate-x-2 transition-all duration-300"
                />
              </div>
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
          <button
            onClick={onBack}
            className="group -ml-3 min-h-11 px-3 rounded-full text-base font-medium text-slate-300 hover:text-[#01F5D1] active:bg-white/10 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
          </button>
          <span className="hidden md:flex items-center gap-2 text-xs text-slate-600">
            <kbd className="glass-chip px-2 py-1 rounded font-mono text-[10px] text-slate-400">Esc</kbd>
            back
            <span className="mx-1 text-slate-700">·</span>
            <kbd className="glass-chip px-2 py-1 rounded font-mono text-[10px] text-slate-400">→</kbd>
            next
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
