import { ArrowRight } from 'lucide-react';
import ResponsiveImage from '../ResponsiveImage';
import Magnetic from '../Magnetic';
import { ui, operatorStats } from '../../config/ui';
import { PUBLIC_URL } from '../../utils/getBaseUrl';
import { scaledSlot } from '../../utils/imageSources';

interface HeroSectionProps {
  isMobile: boolean;
  scrollToSection: (sectionId: string) => void;
}

const HeroSection = ({ isMobile, scrollToSection }: HeroSectionProps) => (
  <section
    id="home"
    data-nav="home"
    aria-label="Introduction"
    // No min-height below `lg`. Once the redundant CTAs came out, forcing
    // a full screen left ~290px of void above the fold; letting the hero
    // hug its content instead brings the portrait card up into view,
    // which is a better scroll affordance than empty space.
    // Content starts 1rem below the fixed nav. The other pages reach the
    // same line via their section's own `py-14`, so the offsets are
    // written differently but resolve identically — see the page
    // container below.
    // Transparent on purpose: the backdrop is the page-wide ambient
    // field, which is fixed and therefore identical at every scroll
    // position. A section-scoped backdrop here would put a visible
    // colour edge in the page at the point the hero ends.
    className={`relative lg:min-h-[calc(100vh-5rem)] pt-[calc(var(--nav-h)+1rem)] pb-4 lg:pt-24 lg:pb-10 ${ui.scrollMt} overflow-hidden bg-transparent`}
  >
    {/* No backdrop of its own. The hero's floating node network used to
        sit here; the live circuit ground now does that job page-wide, and
        two competing networks on one screen read as noise. */}
    <div className={`${ui.shell} relative`}>
      <div className="grid lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-8 lg:h-full lg:flex lg:flex-col">
          <div className="mb-4 md:mb-6 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            {/* The site's one statement of availability. A chip here
                and another in Contact both used to claim it, vaguely
                and a year early. No pulse dot: it signalled
                "available now". */}
            {/* "Aug" below sm: spelled out, the chip wraps to two lines at 375px. */}
            <span className="chip inline-flex items-center px-4 py-1.5 rounded-sm text-ink text-sm font-medium">
              Graduating 2027 · Full-time from&nbsp;<span className="sm:hidden">Aug</span><span className="hidden sm:inline">August</span>&nbsp;2027
            </span>
          </div>
          <h1 className={`${ui.h1} font-display text-ink mb-3.5 md:mb-5 animate-fade-in-up`} style={{ animationDelay: '60ms' }}>
            I design and build <span className="accent-shimmer font-semibold">intelligent products</span> that combine AI, software, and human-centred interaction.
          </h1>
          {/* One title. The line under it used to cycle through five
              identities, from Product Designer to Circuit & Hardware. */}
          <p className="text-[1.05rem] md:text-[1.34rem] text-ink-body mb-5 lg:mb-8 leading-relaxed max-w-3xl animate-fade-in-up" style={{ animationDelay: '140ms' }}>
            I'm <span className="font-semibold text-ink">Jash Bhatt</span>, a product designer in my final year at FLAME&nbsp;University.
          </p>

          <div className="hidden lg:flex flex-col sm:flex-row gap-4 mt-auto animate-fade-in-up" style={{ animationDelay: '380ms' }}>
            <Magnetic
              as="button"
              strength={28}
              onClick={() => scrollToSection('work')}
              className={`group ${ui.btnBase} ${ui.btnPrimary} ${ui.focusRing}`}
            >
              View My Work <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Magnetic>
            <Magnetic
              as="button"
              strength={28}
              onClick={() => scrollToSection('contact')}
              className={`${ui.btnBase} ${ui.btnSecondary} ${ui.focusRing}`}
            >
              Get in Touch
            </Magnetic>
          </div>
        </div>

        {/* Desktop only — and mounted only there. It used to render at
            every width inside a `hidden lg:block` wrapper, so a phone
            parsed a second portrait it would never show and handed it
            `fetchPriority="high"`. */}
        {!isMobile && (
          <div className="hidden lg:block lg:col-span-4 lg:h-full animate-fade-in-up" style={{ animationDelay: '220ms' }}>
            <div className="surface surface-marks surface-hover max-w-[20.25rem] h-full lg:ml-auto rounded-3xl p-4 flex flex-col">
              <div className="portrait-scan relative rounded-2xl overflow-hidden flex-1 min-h-[18rem]">
                <ResponsiveImage
                  src={`${PUBLIC_URL}/images/Jash-portrait.webp`}
                  alt="Portrait of Jash Bhatt"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                  fetchPriority="high"
                  // The slot is 292px. Without this it inherited the
                  // 1050px default and pulled the full-size original.
                  sizes={`${scaledSlot(292)}, 292px`}
                />
              </div>
              {/* A figure caption, as on a drawing: who, and where. Pune's
                  coordinates rather than a status — the availability chip
                  is the one place that speaks to timing. */}
              <div className="label flex items-center justify-between gap-3 pt-3 text-ink-muted" aria-hidden="true">
                <span>Fig. 01 — Jash</span>
                <span className="text-accent/80">18.52°N 73.86°E</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 md:mt-12 w-full">
        {/* The hero's fade-up, continuing its stagger after the buttons
            (380ms). On a wrapper, not the card: fadeInUp fills `both`,
            so its final transform would stay on the card and override
            .surface-hover's 2px lift. */}
        {operatorStats.map((stat, index) => (
          <div key={stat.label} className="animate-fade-in-up" style={{ animationDelay: `${440 + index * 60}ms` }}>
          <div className="surface surface-marks surface-hover rounded-2xl p-6 h-full">
              {/* These values are phrases, not numbers, and at 2.2rem all
                  three wrapped with a single orphaned word on line two.
                  Sized to hold one line instead. The binding value is
                  "Agentic AI · Bajaj Finance", which caps the ramp at
                  1.75vw and the ceiling at 1.6rem, since the 84rem
                  shell stops widening the card at 357px.
                  Re-measure if any operatorStats value gets longer. */}
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-ink-muted mb-1.5">
                <span className="stat-led" aria-hidden="true" />
                {stat.label}
              </div>
              <div className="text-[clamp(1.1rem,1.75vw,1.6rem)] font-bold text-ink [text-wrap:balance]">{stat.value}</div>
          </div>
          </div>
        ))}
      </div>

    </div>

    {/* Desktop only. On mobile the portrait card below now sits partly in
        view at rest, which advertises the scroll better than an arrow.
        A probe rather than a chevron: a short trace with a signal running
        down it, into the board the work section sits on. */}
    <div className="hidden lg:flex lg:mt-7 flex-col items-center gap-2 text-ink-muted" aria-hidden="true">
      <span className="label">Scroll</span>
      <span className="scroll-probe" />
    </div>
  </section>
);

export default HeroSection;
