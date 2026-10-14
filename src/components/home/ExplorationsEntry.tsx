import { ArrowRight } from 'lucide-react';
import Reveal from '../Reveal';
import { ui } from '../../config/ui';
import { onInPageLink } from '../../utils/inPageLink';

interface ExplorationsEntryProps {
  openExplorations: () => void;
}

const ExplorationsEntry = ({ openExplorations }: ExplorationsEntryProps) => (
  <section data-nav="work" aria-label="Beyond case studies" className={`${ui.shell} pb-14 sm:pb-20`}>
    <Reveal variant="rise">
      <a
        href="#explorations"
        onClick={(event) => onInPageLink(event, () => openExplorations())}
        className={`${ui.cardBase} ${ui.cardHover} group flex w-full items-center gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
      >
        <div className="min-w-0 flex-1">
          <p className={ui.eyebrow}>Beyond case studies</p>
          <h3 className="mt-1.5 text-lg font-bold text-ink group-hover:text-accent group-active:text-accent transition-colors">Creative Explorations</h3>
          <p className="mt-1.5 text-sm text-ink-muted">Photoshop, brand motion, AI generations, and photography.</p>
        </div>
        <ArrowRight size={20} className="shrink-0 text-ink-faint group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
      </a>
    </Reveal>
  </section>
);

export default ExplorationsEntry;
