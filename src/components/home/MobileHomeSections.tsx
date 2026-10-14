import { Linkedin, ArrowRight, Image as PhotoIcon } from 'lucide-react';
import ResponsiveImage from '../ResponsiveImage';
import Reveal from '../Reveal';
import CopyEmail from '../CopyEmail';
import ContactLinkCard from '../ContactLinkCard';
import { featuredProjects, CONTAINED_THUMBNAIL_BACKDROPS } from '../../config/projects';
import { ui, operatorStats, CONTACT_EMAIL, LINKEDIN_URL, LINKEDIN_HANDLE } from '../../config/ui';
import { PUBLIC_URL } from '../../utils/getBaseUrl';
import { onInPageLink } from '../../utils/inPageLink';
import type { Project } from '../../types';

interface MobileHomeSectionsProps {
  handleProjectClick: (project: Project) => void;
  scrollToSection: (sectionId: string) => void;
}

/** What the paged mobile Home adds below the hero. Rendered only there. */
const MobileHomeSections = ({ handleProjectClick, scrollToSection }: MobileHomeSectionsProps) => (
  <>
    {/* Portrait and the at-a-glance facts. These used to sit inside the
        hero; moving them one swipe down is what lets the hero fit a
        single screen, and the card keeps its full size here. */}

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
              <dt className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">{stat.label}</dt>
              <dd className="text-[0.95rem] font-semibold text-ink mt-0.5">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>

    {/* Featured work preview — paged mobile Home only. Keeps Home from
        being a dead end that shows no work, without dragging the whole
        6,300px Work section back onto it. The contact strip below it
        carries the `pb-14 sm:pb-20` that ends every page above the footer. */}

    <section aria-labelledby="home-featured-heading" className={`${ui.shell} pt-14 sm:pt-16 pb-12 sm:pb-16`}>
      <Reveal variant="rise-soft" className="mb-6">
        <h2 id="home-featured-heading" className="text-2xl font-display text-ink">Selected Projects</h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-4">
        {featuredProjects.slice(0, 3).map((project, index) => {
          const thumbnail = project.content.thumbnailImage ?? project.content.heroImage;
          const containedBackdrop = CONTAINED_THUMBNAIL_BACKDROPS[project.slug];
          return (
            <Reveal variant="rise" key={`preview-${project.id}`} delay={index * 80}>
              <a
                href={`#${project.slug}`}
                onClick={(event) => onInPageLink(event, () => handleProjectClick(project))}
                aria-label={`Open case study for ${project.title}`}
                className={`group w-full text-left flex items-center gap-4 p-4 ${ui.cardBase} ${ui.cardHover} focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
              >
                <div className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden ${containedBackdrop ?? 'bg-[var(--surface-1)]'}`}>
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
                      <PhotoIcon size={20} className="text-ink-faint" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.6875rem] font-mono uppercase tracking-[0.14em] text-ink-muted">{project.category}</p>
                  <h3 className="mt-1 text-base font-bold text-ink group-active:text-accent transition-colors">{project.title}</h3>
                </div>
                <ArrowRight size={18} className="shrink-0 text-ink-faint" />
              </a>
            </Reveal>
          );
        })}
      </div>

      <Reveal variant="rise-soft" delay={260}>
        <button
          onClick={() => scrollToSection('work')}
          className={`${ui.btnBase} ${ui.btnSecondary} mt-5 w-full text-[0.95rem]`}
        >
          See all projects <ArrowRight size={16} />
        </button>
      </Reveal>
    </section>

    {/* Contact strip — paged mobile Home only. Contact is its own page
        here, so without this the bottom of Home was a dead end for anyone
        who scrolled through looking for a way to get in touch. */}

    <section className={`${ui.shell} pb-14 sm:pb-20`} aria-labelledby="home-contact-heading">
      <Reveal variant="rise-soft" className="mb-5">
        <h2 id="home-contact-heading" className="text-2xl font-display text-ink">Let's Build Something</h2>
        <p className="mt-2 text-[0.95rem] text-ink-body">Hiring a product designer who can also build? Email is the quickest way to reach&nbsp;me.</p>
      </Reveal>
      <Reveal variant="rise" delay={80} className="grid grid-cols-1 gap-3">
        <CopyEmail email={CONTACT_EMAIL} />
        <ContactLinkCard href={LINKEDIN_URL} icon={<Linkedin size={22} />} label="LinkedIn" value={LINKEDIN_HANDLE} />
      </Reveal>
    </section>
  </>
);

export default MobileHomeSections;
