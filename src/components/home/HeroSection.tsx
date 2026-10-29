import { ArrowRight } from 'lucide-react';
import ResponsiveImage from '../ResponsiveImage';
import Magnetic from '../Magnetic';
import RiseWords from '../RiseWords';
import PuneClock from '../PuneClock';
import { ui, operatorStats } from '../../config/ui';
import { PUBLIC_URL } from '../../utils/getBaseUrl';
import { scaledSlot } from '../../utils/imageSources';

interface HeroSectionProps {
  isMobile: boolean;
  scrollToSection: (sectionId: string) => void;
}

// The hero line, as segments so the accent phrase can keep its colour while
// every word rises on its own.
const headline = [
  { text: 'I design and build ' },
  { text: 'intelligent products', accent: true },
  { text: ' that combine AI, software, and human-centred interaction.' },
];

const HeroSection = ({ isMobile, scrollToSection }: HeroSectionProps) => (
  <section
    id="home"
    data-nav="home"
    aria-label="Introduction"
    // No min-height below `lg`: the hero hugs its content so the portrait
    // card below sits partly in view, which advertises the scroll.
    // Transparent on purpose: the page-wide circuit ground is the backdrop.
    className={`relative lg:min-h-[calc(100vh-5rem)] pt-[calc(var(--nav-h)+1rem)] pb-4 lg:pt-24 lg:pb-10 ${ui.scrollMt} overflow-hidden bg-transparent`}
  >
    <div className={`${ui.shell} relative`}>
      <div className="grid lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-8 lg:h-full lg:flex lg:flex-col">
          {/* The site's one statement of availability. Plain text with a
              steady LED, not a pill: it is a fact, not a control. */}
          <p className="flex items-center gap-2.5 mb-5 md:mb-7 text-sm md:text-[0.95rem] text-ink-body animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <span className="stat-led stat-led--on" aria-hidden="true" />
            {/* One flex item: bare text and spans would each take the gap. */}
            <span>
              Graduating 2027 · Full-time from&nbsp;<span className="sm:hidden">Aug</span><span className="hidden sm:inline">August</span>&nbsp;2027
            </span>
          </p>
          <h1 className={`${ui.h1} font-display text-ink mb-5 md:mb-7`}>
            <RiseWords segments={headline} />
          </h1>
          <p className="text-[1.05rem] md:text-[1.375rem] text-ink-body mb-6 lg:mb-9 leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '420ms' }}>
            I'm <span className="font-semibold text-ink">Jash Bhatt</span>, a product designer in my final year at FLAME&nbsp;University, Pune.
          </p>

          <div className="hidden lg:flex flex-col sm:flex-row gap-3 mt-auto animate-fade-in-up" style={{ animationDelay: '520ms' }}>
            <Magnetic
              as="button"
              strength={20}
              onClick={() => scrollToSection('work')}
              className={`group ${ui.btnBase} ${ui.btnPrimary} ${ui.focusRing}`}
            >
              See the work <ArrowRight size={18} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </Magnetic>
            <Magnetic
              as="button"
              strength={20}
              onClick={() => scrollToSection('contact')}
              className={`${ui.btnBase} ${ui.btnSecondary} ${ui.focusRing}`}
            >
              Get in touch
            </Magnetic>
          </div>
        </div>

        {/* Desktop only — and mounted only there, so a phone never parses a
            second portrait it would never show. */}
        {!isMobile && (
          <div className="hidden lg:block lg:col-span-4 lg:h-full animate-fade-in-up" style={{ animationDelay: '260ms' }}>
            <figure className="surface surface-marks surface-hover portrait-card max-w-[20.25rem] h-full lg:ml-auto rounded-3xl p-4 flex flex-col">
              <div className="portrait-scan relative rounded-2xl overflow-hidden flex-1 min-h-[18rem]">
                <ResponsiveImage
                  src={`${PUBLIC_URL}/images/Jash-portrait.webp`}
                  alt="Portrait of Jash Bhatt"
                  className="portrait-img w-full h-full object-cover object-top"
                  loading="eager"
                  fetchPriority="high"
                  // The slot is 292px; without this it pulled the full-size original.
                  sizes={`${scaledSlot(292)}, 292px`}
                />
              </div>
              {/* A figure caption, as on a drawing: who, where, and what time
                  it is there — useful to anyone writing from another zone. */}
              <figcaption className="label flex items-center justify-between gap-3 pt-3 text-ink-muted">
                <span>Fig. 01 — Jash</span>
                <PuneClock className="text-accent/90" />
              </figcaption>
            </figure>
          </div>
        )}
      </div>

      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 md:mt-12 w-full">
        {/* Continues the hero's stagger after the buttons. On a wrapper, not
            the card: fadeInUp fills `both`, so its final transform would
            override .surface-hover's lift. */}
        {operatorStats.map((stat, index) => (
          <div key={stat.label} className="animate-fade-in-up" style={{ animationDelay: `${600 + index * 70}ms` }}>
            <div className="surface surface-marks surface-hover rounded-2xl p-6 h-full">
              <div className="flex items-center gap-2 text-sm text-ink-muted mb-1.5">
                <span className="stat-led" aria-hidden="true" />
                {stat.label}
              </div>
              {/* Sized to hold one line: "Agentic AI · Bajaj Finance" is the
                  binding value. Re-measure if any value gets longer. */}
              <div className="font-display text-[clamp(1.15rem,1.8vw,1.65rem)] font-semibold text-ink [text-wrap:balance]">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Desktop only: a short trace with a signal running down it, into the
        board the work section sits on. */}
    <div className="hidden lg:flex lg:mt-7 flex-col items-center gap-2 text-ink-muted" aria-hidden="true">
      <span className="label">Scroll</span>
      <span className="scroll-probe" />
    </div>
  </section>
);

export default HeroSection;
