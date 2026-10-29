import { ArrowRight } from 'lucide-react';
import Reveal from '../Reveal';
import ResponsiveImage from '../ResponsiveImage';
import { ui, gallerySnippetItems } from '../../config/ui';
import { onInPageLink } from '../../utils/inPageLink';

interface ExplorationsEntryProps {
  openExplorations: () => void;
}

/**
 * Entry point to the Explorations page, shown with a few of the photographs
 * it holds: a small stack that fans open while the card is hovered, so the
 * link shows what is behind it instead of describing it.
 */
const ExplorationsEntry = ({ openExplorations }: ExplorationsEntryProps) => (
  <section data-nav="work" aria-label="Beyond case studies" className={`${ui.shell} pb-14 sm:pb-20`}>
    <Reveal variant="rise">
      <a
        href="#explorations"
        onClick={(event) => onInPageLink(event, () => openExplorations())}
        className={`${ui.cardBase} ${ui.cardHover} press group flex w-full items-center gap-6 p-5 sm:p-7 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-2xl md:text-[2rem] leading-[1.05] text-ink group-hover:text-accent group-active:text-accent transition-colors">Creative explorations</h3>
          <p className="mt-2 text-sm md:text-base text-ink-body">Photoshop, brand motion, AI generations, and photography.</p>
        </div>
        {/* Decorative: the photographs are described on the page they lead to. */}
        <div className="photo-fan hidden md:block" aria-hidden="true">
          {gallerySnippetItems.map((item, index) => (
            <span key={item.src} className="photo-fan-card" style={{ '--i': index } as React.CSSProperties}>
              <ResponsiveImage src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" sizes="96px" />
            </span>
          ))}
        </div>
        <ArrowRight size={22} className="shrink-0 text-ink-muted group-hover:text-accent group-hover:translate-x-1 transition-[color,transform] duration-200 ease-out" />
      </a>
    </Reveal>
  </section>
);

export default ExplorationsEntry;
