import type { MouseEvent } from 'react';
import { ArrowRight, Image as PhotoIcon } from 'lucide-react';
import ResponsiveImage from '../ResponsiveImage';
import Reveal from '../Reveal';
import TiltCard from '../TiltCard';
import { featuredProjects } from '../../config/projects';
import { ui } from '../../config/ui';
import { onInPageLink } from '../../utils/inPageLink';
import type { Project } from '../../types';

  // Per-card inner-image parallax on the work cards. CSS reads the custom
  // properties; written straight to the DOM to avoid re-renders.
  const handleCardMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    el.style.setProperty('--mx', `${(x / rect.width - 0.5) * -14}px`);
    el.style.setProperty('--my', `${(y / rect.height - 0.5) * -14}px`);
  };

  const handleCardMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--mx', '0px');
    event.currentTarget.style.setProperty('--my', '0px');
  };

interface WorkSectionProps {
  handleProjectClick: (project: Project) => void;
}

const WorkSection = ({ handleProjectClick }: WorkSectionProps) => (
  <section id="work" data-nav="work" aria-labelledby="work-heading" className={`${ui.section} ${ui.shell} ${ui.scrollMt}`}>
    {/* Capped at the paragraph's width so the wipe spans the text
        rather than finishing a third of the way across. Below md the
        mask is overridden, here and on the bar, so the header is
        simply there: it sits in view on arrival. */}
    <Reveal className="mb-10 sm:mb-14 md:mb-16 max-w-2xl max-md:![mask-image:none] max-md:![-webkit-mask-image:none]">
      <p className={`${ui.eyebrow} section-index mb-3`}>Work</p>
      <h2 id="work-heading" className={`${ui.h2} font-display text-ink mb-3 md:mb-4`}>Selected Projects</h2>
      <p className="text-ink-body max-w-2xl mb-5 md:mb-6">Each one taken from a question to a working build: what I designed, why, and what I built to prove it.</p>
      <Reveal variant="grow-width" className="max-md:![mask-image:none] max-md:![-webkit-mask-image:none]">
        <div className="h-1 w-24 bg-gradient-to-r from-accent to-accent-deep rounded-sm"></div>
      </Reveal>
    </Reveal>

    <div className="space-y-8 sm:space-y-12 md:space-y-24">
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
          // Starts as the card's top edge enters the screen, not
          // before it like the default: pre-triggered, the rise was
          // over before anyone saw it. Anything on screen is already
          // fading in, so a fast skim still never meets an empty
          // screen. No stagger: the cards are a screen apart.
          <Reveal key={project.id} variant="lift" rootMargin="0px" duration={800}>
          <a
            href={`#${project.slug}`}
            id={`project-${project.id}`}
            // No cyan press border: the tile's own scale-down is enough
            // press feedback, and on desktop the border was otherwise
            // transparent, so tapping made a green outline appear from
            // nowhere. focus-visible stays — that ring is the keyboard
            // indicator and does not fire on pointer clicks.
            className="group block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ground)] rounded-2xl overflow-hidden md:overflow-visible md:rounded-none"
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
                        <PhotoIcon className="w-16 h-16 text-ink-body mx-auto mb-4" />
                        <p className="text-ink-muted font-medium">Click to view {project.title}</p>
                      </div>
                    </div>
                  )}

                </div>
                </TiltCard>
              </div>

              {/* Text Column (5 cols) */}
              <div className={`md:col-span-5 px-5 pt-4 pb-5 md:p-0 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                {/* Wraps rather than forcing one line — categories run as
                    long as "Experimental Prototyping". */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 md:gap-x-4 mb-3 md:mb-5">
                  <span className="ghost-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span className="meta-trace w-4 md:w-12" aria-hidden="true" />
                  <span className="text-ink-muted text-[0.6875rem] md:text-xs font-mono uppercase tracking-[0.08em] md:tracking-[0.2em]">{project.category}</span>
                  {project.content.sections.some((section) => section.demoId) && (
                    <span className="inline-flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-sm bg-accent/10 text-accent-br text-[0.6875rem] font-semibold uppercase tracking-[0.1em] whitespace-nowrap">
                      <span className="pulse-dot" aria-hidden="true" />
                      Try it live
                    </span>
                  )}
                </div>

                <h3 className={`text-2xl md:text-4xl font-bold text-ink mb-2 md:mb-4 transition-colors group-hover:text-accent`}>
                  {project.title}
                </h3>
                <p className="text-ink-body text-[0.95rem] md:text-lg leading-relaxed mb-4 md:mb-6 line-clamp-3 md:line-clamp-none">
                  {project.description}
                </p>

                {/* The module's datasheet: what I did and when. Above md
                    only — on a phone the card is already a full screen. */}
                <dl className="hidden md:grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1.5 mb-6 pt-4 border-t border-[var(--rule)] text-sm">
                  <dt className="label pt-0.5 text-ink-muted">Role</dt>
                  <dd className="text-ink-body">{project.content.role}</dd>
                  <dt className="label pt-0.5 text-ink-muted">When</dt>
                  <dd className="text-ink-body">{project.timeline}</dd>
                </dl>

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
);

export default WorkSection;
