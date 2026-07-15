import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Image as PhotoIcon, Copy, Check, Clock, Briefcase } from 'lucide-react';
const ArkanoidDemo = lazy(() => import('./ArkanoidDemo'));
const YoloV8Demo = lazy(() => import('./YoloV8Demo'));
const MovieRecsDemo = lazy(() => import('./MovieRecsDemo'));
import ResponsiveImage from './ResponsiveImage';
import Reveal from './Reveal';
import type { Project, Section } from '../types';
import { PROJECT_HERO_THEMES, DEFAULT_PROJECT_HERO_THEME } from '../config/projects';
import { ui } from '../config/ui';

const DemoLoader = () => (
  <div className="h-full lg:h-[620px] rounded-2xl border border-slate-700 bg-slate-950 flex items-center justify-center">
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
      className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#01F5D1] transition-colors"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
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
  useEffect(() => {
    const el = heroParallaxRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
  }, [slug]);

  if (!project) return null;

  const projectHeroTheme = PROJECT_HERO_THEMES[project.slug] ?? DEFAULT_PROJECT_HERO_THEME;
  const isPythonCodes = project.slug === 'python-codes';
  const isCountdownMotorControl = project.slug === 'tinkering';
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
      'h-[360px] sm:h-[440px] lg:h-[620px] rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-sm flex flex-col';
    const snippetPreClass =
      'min-h-0 flex-1 overflow-auto p-4 text-xs leading-relaxed md:text-sm font-mono whitespace-pre';

    if (demoComponent && section.codeBlock) {
      return (
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className={snippetContainerClass}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-xs uppercase tracking-widest text-slate-400">Python Snippet</span>
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
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
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
                    className={`rounded-xl overflow-hidden border border-slate-700 bg-slate-900/70 shadow-sm transition-all hover:shadow-md h-56 ${isPlaceholder ? '' : 'cursor-zoom-in'}`}
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
                        deferGifOnConstrainedNetwork
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
              className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-slate-700 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-slate-900/70')} shadow-sm`} transition-all hover:shadow-md ${heightClass} ${isPlaceholder ? '' : 'cursor-zoom-in'}`}
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
                  deferGifOnConstrainedNetwork
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
            {renderMediaCard(rectangleImage, 'h-72 md:h-[33rem]', 'tech-rect')}
          </div>
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            {squareImages.slice(0, 2).map((img, i) =>
              renderMediaCard(img, 'h-72 md:h-[15rem]', `tech-square-${i}`)
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
                      className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-slate-700 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-slate-900/70')} shadow-sm`} transition-all hover:shadow-md ${isPlaceholder ? 'w-full h-48 md:h-56' : 'cursor-zoom-in w-fit'}`}
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
                          deferGifOnConstrainedNetwork
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
                className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-slate-700 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-slate-900/70')} shadow-sm`} transition-all hover:shadow-md ${!img.src || img.src.includes('placeholder') ? 'h-56 md:h-64 w-full' : 'cursor-zoom-in'}`}
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
                    deferGifOnConstrainedNetwork
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
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {section.images.map((img, i) => {
            const isPlaceholder = !img.src || img.src.includes('placeholder');
            const useAutoHeight = section.imageHeight === 'auto';
            const gridHeightClass = useAutoHeight ? '' : (section.imageHeight || 'h-56 md:h-64');
            return (
              <div key={i} className="flex flex-col gap-3">
                <div
                  className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-slate-700 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-slate-900/70')} shadow-sm`} transition-all hover:shadow-md ${gridHeightClass} ${isPlaceholder ? '' : 'cursor-zoom-in'}`}
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
                      deferGifOnConstrainedNetwork
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
                className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-slate-700 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-slate-900/70')} shadow-sm`} transition-all hover:shadow-md ${section.imageLayout === 'row' ? (section.imageCrop ? 'w-full' : 'w-full md:w-fit') : ''} ${section.imageCrop && section.imageHeight ? section.imageHeight : ''} ${isPlaceholder ? 'w-full h-48 md:h-56' : 'cursor-zoom-in'}`}
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
                    className={
                      section.imageCrop
                        ? 'w-full h-full object-cover object-center'
                        : section.imageLayout === 'row'
                          ? `w-full h-auto md:w-auto ${section.imageHeight || 'md:h-48'} max-w-full`
                          : 'w-full h-auto'
                    }
                    loading="lazy"
                    deferGifOnConstrainedNetwork
                  />
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
    <div className={`bg-[#02060f] text-slate-100 min-h-screen transition-all duration-300 ease-in-out transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

      {/* Project Hero */}
      <div className={`w-full ${heroBgClass} pt-32 pb-24 border-b border-slate-800`}>
        <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 mb-12 transition-colors text-sm font-medium text-slate-400 hover:text-[#01F5D1]"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className={`text-xs font-bold tracking-widest uppercase ${heroMutedTextClass}`}>{project.category}</span>
          </div>

          <h1 className={`text-4xl md:text-6xl font-bold mb-8 tracking-tight ${heroTextClass}`}>{project.title}</h1>
          <p className={`text-lg md:text-xl leading-relaxed max-w-2xl font-light ${heroBodyTextClass}`}>
            {project.description}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12 py-16">

        {/* Project Meta */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-20 pb-12 border-b border-slate-800">
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
          <div className="col-span-2 md:col-span-6">
            <div className="w-full md:w-fit md:max-w-full md:ml-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-left md:text-right">Tech &amp; Tools</h3>
              <div className="flex flex-wrap gap-2 md:justify-end">
                {project.tags.map((tag, i) => (
                  <span key={i} className={ui.chipBase}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        {!isPythonCodes && (
          <div className={`w-full bg-slate-900 rounded-lg mb-24 border border-slate-700 overflow-hidden shadow-sm ${isCountdownMotorControl ? 'bg-transparent aspect-square max-w-[420px] w-full mx-auto' : ''}`}>
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
          <div className="space-y-16">
            {project.content.sections.map((section, idx) => (
              <div key={idx} className="rounded-3xl border border-emerald-800/70 bg-slate-900/80 p-8 md:p-10 shadow-sm">
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-emerald-600/70 mb-3">Python Project</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">{section.title}</h2>
                  <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-line">{section.content}</p>
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
          <div className="space-y-24" ref={sectionsWrapRef}>
            {project.content.sections.map((section, idx) => {
              const isActive = idx === activeIdx;
              return (
              <div key={idx} data-section={idx} className="grid md:grid-cols-12 gap-8 items-start group">

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
                  <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-line mb-8 font-normal">{section.content}</p>

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

                  {/* Embed (Figma etc) */}
                  {section.embedUrl && (
                    section.embedWide ? (
                      <div className="mt-10 w-full rounded-2xl overflow-hidden border border-slate-700 shadow-lg" style={{ aspectRatio: '16/9' }}>
                        <iframe
                          src={section.embedUrl}
                          className="w-full h-full"
                          allowFullScreen
                          style={{ border: 'none' }}
                          title="Design Board"
                        ></iframe>
                      </div>
                    ) : (
                      <div className="mt-12 w-full max-w-[360px] mx-auto aspect-[9/19] bg-slate-900 rounded-[2.5rem] overflow-hidden border-[8px] border-slate-800 shadow-2xl relative">
                        <iframe
                          src={section.embedUrl}
                          className="w-full h-full bg-slate-50"
                          allowFullScreen
                          style={{ border: 'none' }}
                          title="Interactive Prototype"
                        ></iframe>
                      </div>
                    )
                  )}

                  {/* CTA Button */}
                  {section.cta && (
                    <div className="mt-10">
                      <a
                        href={section.cta.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${ui.btnBase} gap-3 bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-xl hover:-translate-y-0.5`}
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
          <div className="mt-32">
            <button
              onClick={onNext}
              className="group relative w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 text-left transition-all duration-300 hover:border-[#01F5D1]/60 hover:shadow-[0_28px_70px_-30px_rgba(1,245,209,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01F5D1]"
              aria-label={`Open next project: ${nextProject.title}`}
            >
              <div className="flex items-center gap-6">
                <div className="block shrink-0 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                  {!(nextProject.content.thumbnailImage ?? nextProject.content.heroImage).includes('placeholder') ? (
                    <ResponsiveImage
                      src={nextProject.content.thumbnailImage ?? nextProject.content.heroImage}
                      alt={nextProject.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      deferGifOnConstrainedNetwork
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon size={28} className="text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#01F5D1]/90">Next Project →</span>
                  <h3 className="mt-2 text-2xl md:text-3xl font-bold text-slate-100 truncate group-hover:text-[#01F5D1] transition-colors">
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
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4">
          <button
            onClick={onBack}
            className="group text-base font-medium text-slate-300 hover:text-[#01F5D1] transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
          </button>
          <span className="hidden md:flex items-center gap-2 text-xs text-slate-600">
            <kbd className="px-2 py-1 rounded border border-slate-700 bg-slate-900 font-mono text-[10px] text-slate-400">Esc</kbd>
            back
            <span className="mx-1 text-slate-700">·</span>
            <kbd className="px-2 py-1 rounded border border-slate-700 bg-slate-900 font-mono text-[10px] text-slate-400">→</kbd>
            next
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
