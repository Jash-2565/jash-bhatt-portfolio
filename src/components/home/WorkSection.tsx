import type { MouseEvent } from 'react';
import { ArrowRight, Image as PhotoIcon } from 'lucide-react';
import ResponsiveImage from '../ResponsiveImage';
import Reveal from '../Reveal';
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
    {/* Heading left, its one-line brief answering it on the right, on a
        shared baseline. Below md they stack. */}
    <div className="grid md:grid-cols-12 gap-4 md:gap-8 md:items-end mb-12 sm:mb-16 md:mb-24">
      <Reveal variant="rise" className="md:col-span-7">
        <h2 id="work-heading" className={`${ui.h2} font-display text-ink`}>Selected projects</h2>
      </Reveal>
      <Reveal variant="rise" delay={80} className="md:col-span-5">
        <p className="text-ink-body text-base md:text-lg leading-relaxed max-w-md md:ml-auto">Each one taken from a question to a working build: what I designed, why, and what I built to prove it.</p>
      </Reveal>
    </div>

    <div className="space-y-10 sm:space-y-14 md:space-y-28">
      {featuredProjects.map((project, index) => {
        const projectThumbnail =
          project.content.thumbnailImage ?? project.content.heroImage;
        const isPlaceholder = projectThumbnail.includes('placeholder');
        // Square artwork that a 4:3 cover crop would cut into: shown whole
        // against the tile's own backdrop instead.
        const fitsInside =
          project.slug === 'python-codes' || project.slug === 'soundtrack-seven-years';
        const insidePadding = project.slug === 'python-codes' ? 'p-6' : '';
        // project.color is a letterbox backdrop, only ever meant to show where
        // the artwork does not fill the tile. Behind a cover image it leaves a
        // hairline at the corners and flashes light while the image loads.
        const needsBackdrop = isPlaceholder || fitsInside;
        const hasDemo = project.content.sections.some((section) => section.demoId);
        const flip = index % 2 === 1;

        return (
          <a
            key={project.id}
            href={`#${project.slug}`}
            id={`project-${project.id}`}
            className="work-card group block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ground)] rounded-2xl overflow-hidden md:overflow-visible md:rounded-none"
            aria-label={`Open case study for ${project.title}`}
            onClick={(event) => onInPageLink(event, () => handleProjectClick(project))}
          >
            <div className="grid md:grid-cols-12 gap-0 md:gap-10 items-center">

              {/* Image column. The picture rises in first; the text follows
                  80ms behind it. */}
              <Reveal variant="rise" className={`md:col-span-7 ${flip ? 'md:order-2' : ''}`}>
                <div
                  // Radius lives on the tile rather than an ancestor's clip:
                  // WebKit does not clip a composited descendant (the
                  // parallax layer) to an ancestor's border-radius.
                  className={`card-media relative overflow-hidden rounded-2xl ${needsBackdrop ? project.color : 'bg-[var(--surface-1)]'} aspect-[16/10] md:aspect-[4/3]`}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                >
                  {!isPlaceholder ? (
                    fitsInside ? (
                      <ResponsiveImage
                        src={projectThumbnail}
                        alt={project.title}
                        className={`card-contain block w-full h-full object-contain ${insidePadding}`}
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
              </Reveal>

              {/* Text column */}
              <Reveal variant="rise" delay={80} className={`md:col-span-5 px-5 pt-5 pb-6 md:p-0 ${flip ? 'md:order-1' : ''}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3 md:mb-5 text-sm">
                  <span className="text-ink-muted">{project.category}</span>
                  {hasDemo && (
                    <span className="inline-flex items-center gap-2 text-accent-br font-medium whitespace-nowrap">
                      <span className="pulse-dot" aria-hidden="true" />
                      Try it live
                    </span>
                  )}
                </div>

                <h3 className="font-display text-[2rem] md:text-5xl leading-[1] text-ink mb-3 md:mb-5 transition-colors duration-200 group-hover:text-accent">
                  {project.title}
                </h3>
                <p className="text-ink-body text-[0.95rem] md:text-lg leading-relaxed mb-5 md:mb-7 line-clamp-3 md:line-clamp-none">
                  {project.description}
                </p>

                {/* What I did and when. Above md only — on a phone the card is
                    already a full screen. */}
                <dl className="hidden md:grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1.5 mb-7 pt-4 border-t border-[var(--rule)] text-sm">
                  <dt className="label pt-0.5 text-ink-muted">Role</dt>
                  <dd className="text-ink-body">{project.content.role}</dd>
                  <dt className="label pt-0.5 text-ink-muted">When</dt>
                  <dd className="text-ink-body">{project.timeline}</dd>
                </dl>

                {/* A span, not a control: the whole card is the link. */}
                <span
                  aria-hidden="true"
                  className="inline-flex items-center gap-2 min-h-11 font-semibold text-sm md:text-base text-accent"
                >
                  Read the case study <ArrowRight size={18} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Reveal>
            </div>
          </a>
        );
      })}
    </div>

  </section>
);

export default WorkSection;
