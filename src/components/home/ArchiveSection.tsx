import { ArrowRight, Image as PhotoIcon } from 'lucide-react';
import ResponsiveImage from '../ResponsiveImage';
import Reveal from '../Reveal';
import { secondaryProjects, CONTAINED_THUMBNAIL_BACKDROPS } from '../../config/projects';
import { ui } from '../../config/ui';
import { onInPageLink } from '../../utils/inPageLink';
import type { Project } from '../../types';

interface ArchiveSectionProps {
  handleProjectClick: (project: Project) => void;
}

const ArchiveSection = ({ handleProjectClick }: ArchiveSectionProps) => {
  if (secondaryProjects.length === 0) return null;
  return (
    <section id="archive" data-nav="work" aria-labelledby="archive-heading" className={`${ui.section} pt-0 pb-6 sm:pb-8 lg:pb-8 ${ui.shell} ${ui.scrollMt}`}>
      {/* The Selected Projects wipe on a box that fits the text, so
          the whole wipe is spent on it. Unlike that header it still
          animates on phones — it is scrolled to, not on screen on
          arrival. */}
      <Reveal className="mb-8 w-fit">
        <p className={`${ui.eyebrow} mb-1`}>Also worth a look</p>
        <h2 id="archive-heading" className={`${ui.h2} font-display text-ink`}>More Work</h2>
        <Reveal variant="grow-width">
          <div className="mt-3 h-1 w-24 rounded-sm bg-gradient-to-r from-accent to-accent-deep"></div>
        </Reveal>
      </Reveal>
      {/* `auto-rows-fr` gives every row the tallest one's height, so the
          cards match without cutting any text off. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-4">
        {secondaryProjects.map((project, index) => {
          const thumbnail = project.content.thumbnailImage ?? project.content.heroImage;
          const containedBackdrop = CONTAINED_THUMBNAIL_BACKDROPS[project.slug];
          return (
            // Staggered by column, not by position: each row enters
            // as it scrolls in, and an index-based delay left the last
            // row trailing by up to 400ms. The left card and the
            // Explorations card below go at once, the right one 80ms on.
            <Reveal variant="rise" key={project.id} delay={(index % 2) * 80} className="h-full">
              <a
                href={`#${project.slug}`}
                id={`project-${project.id}`}
                onClick={(event) => onInPageLink(event, () => handleProjectClick(project))}
                aria-label={`Open case study for ${project.title}`}
                className={`group h-full w-full text-left flex items-center gap-3 sm:gap-4 p-4 ${ui.cardBase} ${ui.cardHover} focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
              >
                <div className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden ${containedBackdrop ?? 'bg-[var(--surface-1)]'}`}>
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
                      <PhotoIcon size={20} className="text-ink-faint" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 [container-type:inline-size]">
                  <p className="text-[0.6875rem] font-mono uppercase tracking-[0.14em] text-ink-muted">{project.category}</p>
                  {/* On phones the size follows the column width (cqw) so the
                      longest one-line title, "RAHI Design System v2" at 12em,
                      always fits; it stays at 1rem whenever there is room. */}
                  <h3 className="mt-1 text-base max-sm:[font-size:min(1rem,calc(100cqw/12.5))] font-bold text-ink group-hover:text-accent transition-colors">{project.title}</h3>
                  {/* Under the title rather than beside it: as its own
                      flex item it took ~120px from the text column on
                      a phone, wrapping the category and title onto
                      seven lines and doubling the card's height. */}
                  {project.content.sections.some((section) => section.demoId) && (
                    <span className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-accent/10 text-accent-br text-[0.6875rem] font-semibold uppercase tracking-[0.1em] whitespace-nowrap">
                      <span className="pulse-dot" aria-hidden="true" />
                      Try it live
                    </span>
                  )}
                </div>
                <ArrowRight size={18} className="shrink-0 text-ink-faint group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};

export default ArchiveSection;
