import { ArrowLeft } from 'lucide-react';
import Reveal from './Reveal';
import CreativeExplorations from './CreativeExplorations';
import { ui } from '../config/ui';
import type { LightboxImage } from '../types';

interface ExplorationsViewProps {
  isTransitioning: boolean;
  scrollToSection: (sectionId: string) => void;
  onImageClick: (image: LightboxImage) => void;
}

/** Explorations — a full page at every width, like a case study. */
const ExplorationsView = ({ isTransitioning, scrollToSection, onImageClick }: ExplorationsViewProps) => (
  <div
    data-leaving={isTransitioning}
    className="page-fade relative z-10"
  >
    <section
      id="explorations"
      aria-labelledby="explorations-heading"
      className={`${ui.section} pt-[calc(var(--nav-h)+1.5rem)] ${ui.shell}`}
    >
      <Reveal className="mb-10 sm:mb-14">
        <button
          onClick={() => scrollToSection('work')}
          className="inline-flex items-center gap-1.5 -ml-1 mb-2 min-h-11 pr-3 pl-1 text-sm font-medium text-ink-muted hover:text-accent active:text-accent transition-colors"
        >
          <ArrowLeft size={16} /> Work
        </button>
        <p className={`${ui.eyebrow} mb-2`}>Beyond case studies</p>
        <h1 id="explorations-heading" className={`${ui.h2} font-display text-ink mb-3`}>Creative Explorations</h1>
        <p className="text-ink-body max-w-2xl">
          Photography, brand motion, generative experiments, and image-making — the work that keeps the visual muscles moving alongside the case studies.
        </p>
        <Reveal variant="grow-width" delay={180}>
          <div className="mt-5 h-1 w-24 rounded-sm bg-gradient-to-r from-accent to-accent-deep"></div>
        </Reveal>
      </Reveal>
      <CreativeExplorations onImageClick={onImageClick} showDivider={false} />

      {/* An exit at the end. The only way back used to be the small
          "← Work" button at the very top, four thousand pixels up. */}
      <nav aria-label="Explorations" className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => scrollToSection('work')}
          className={`group -ml-3 flex items-center gap-2 min-h-11 px-3 rounded-sm text-base font-medium text-ink-body hover:text-accent active:bg-white/10 transition-colors ${ui.focusRing}`}
        >
          <ArrowLeft size={18} aria-hidden="true" className="group-hover:-translate-x-1 transition-transform" />
          Back to Work
        </button>
      </nav>
    </section>
  </div>
);

export default ExplorationsView;
