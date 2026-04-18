import { lazy, Suspense, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Image as PhotoIcon, Copy, Check } from 'lucide-react';
const ArkanoidDemo = lazy(() => import('./ArkanoidDemo'));
const YoloV8Demo = lazy(() => import('./YoloV8Demo'));
const MovieRecsDemo = lazy(() => import('./MovieRecsDemo'));
import ResponsiveImage from './ResponsiveImage';
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
  onBack: () => void;
  onNext: () => void;
  isTransitioning: boolean;
  onImageClick: (src: string) => void;
}

const ProjectDetail = ({
  project,
  onBack,
  onNext,
  isTransitioning,
  onImageClick,
}: ProjectDetailProps) => {
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
      'h-full lg:h-[620px] rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-sm flex flex-col';
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
    <div className={`bg-slate-950 text-slate-100 min-h-screen transition-all duration-300 ease-in-out transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 pb-12 border-b border-slate-800">
          <div className="md:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Role</h3>
            <p className="font-medium text-slate-100 text-sm leading-6">{project.content.role}</p>
          </div>
          <div className="md:col-span-1">
            <div className="w-full md:w-fit md:max-w-full md:ml-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-left">Tech & Tools</h3>
              <div className="flex flex-wrap gap-2">
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
              <ResponsiveImage
                src={project.content.heroImage}
                alt={`${project.title} Hero`}
                className={isCountdownMotorControl ? 'w-full h-full object-cover object-center' : 'w-full h-auto block'}
                loading="eager"
              />
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
          <div className="space-y-24">
            {project.content.sections.map((section, idx) => (
              <div key={idx} className="grid md:grid-cols-12 gap-8 items-start group">

                {/* Left Column: Heading */}
                <div className="md:col-span-4 md:sticky md:top-24">
                  <div className={`w-8 h-1 ${project.badge.replace('text', 'bg').split(' ')[0]} mb-4 opacity-80`}></div>
                  <h2 className="text-xl font-bold text-slate-100 tracking-tight leading-tight">{section.title}</h2>
                </div>

                {/* Right Column: Content */}
                <div className="md:col-span-8">
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-32 pt-12 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={onBack}
            className="text-base font-medium text-slate-300 hover:text-[#01F5D1] transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Projects
          </button>
          <button
            onClick={onNext}
            className="group flex items-center gap-2 px-6 py-3 bg-[#01F5D1] text-slate-950 hover:bg-[#00D8B8] rounded-full font-medium transition-all hover:pr-8"
          >
            Next Project <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
