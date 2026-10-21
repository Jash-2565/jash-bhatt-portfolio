import Reveal from '../Reveal';
import SkillChip from '../SkillChip';
import { ui } from '../../config/ui';

type TimelineEntry = {
  when: string;
  title: string;
  lines: string[];
  /** The most recent entry's pad is lit; earlier ones are drawn hollow. */
  lit?: boolean;
  minor?: boolean;
};

const experience: TimelineEntry[] = [
  { when: 'May – July 2026', title: 'AI Agent Development Intern', lines: ['Bajaj Finance · Agentic AI Unit'], lit: true },
  { when: 'July – August 2025', title: 'UI/UX Intern', lines: ['RAHI Platform Technologies'] },
];

const education: TimelineEntry[] = [
  { when: 'August 2023 – May 2027', title: 'Bachelor of Design (B.Des)', lines: ['Minor in Marketing', 'FLAME University'], lit: true },
  { when: 'June 2018 – March 2023', title: 'Cambridge International Education', lines: ['VIBGYOR High School, NIBM, Pune'], minor: true },
];

/** A run of entries hung on one trace, each on its own pad. */
const Timeline = ({ heading, entries }: { heading: string; entries: TimelineEntry[] }) => (
  <div>
    <h3 className="text-xl font-semibold tracking-tight text-ink mb-5">{heading}</h3>
    <ol className="timeline">
      {entries.map((entry) => (
        <li key={entry.title} className={`timeline-node ${entry.minor ? 'opacity-80' : ''}`} data-lit={entry.lit ? 'true' : undefined}>
          <p className="label text-accent mb-1.5">{entry.when}</p>
          <h4 className={entry.minor ? 'text-base font-medium text-ink-body' : 'text-lg font-bold text-ink'}>{entry.title}</h4>
          {entry.lines.map((line) => (
            <p key={line} className={entry.minor ? 'text-sm text-ink-muted' : 'text-ink-body font-medium'}>{line}</p>
          ))}
        </li>
      ))}
    </ol>
  </div>
);

const AboutSection = () => (
  <section id="about" data-nav="about" aria-labelledby="about-heading" className={`${ui.section} ${ui.scrollMt}`}>
    <div className={ui.shell}>
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        <Reveal variant="rise-soft">
          <p className={`${ui.eyebrow} section-index mb-3`}>02 · About</p>
          <h2 id="about-heading" className={`${ui.h2} font-display text-ink mb-5 md:mb-8`}>About Me</h2>
          <div className="space-y-4 md:space-y-6 text-base md:text-lg text-ink-body leading-relaxed">
            <p>
              I grew up in Pune and I'm still here, in my final year of design at FLAME University. Two things pulled me into design: taking things apart to see how they work, and caring how they look once they're put back together.
            </p>
            <p>
              Both still shape how I work. I'd rather build a rough prototype and test it than argue about a mockup, and I keep going until a product behaves exactly the way someone expects it to.
            </p>
          </div>
        </Reveal>

        <Reveal variant="rise-soft" delay={140}>
          {/* Aligned with "About Me": the eyebrow's line is held open so the
              two headings share a baseline. */}
          <p className={`${ui.eyebrow} mb-3 invisible max-md:hidden`} aria-hidden="true">&nbsp;</p>
          <h2 className={`${ui.h2} font-display font-semibold tracking-tight text-ink mb-5 md:mb-8`}>Skills</h2>
          <div className="space-y-5">
            <SkillChip
              designator="U1"
              title="Design"
              items={['Agentic AI Workflows', 'Product Design', 'Circuit Design', 'Generative AI in Design', 'UI/UX Design', 'Design System', 'Industrial Design']}
            />
            <SkillChip
              designator="U2"
              title="Tools & Tech"
              items={['Figma', 'Python', 'React.js', 'n8n', 'Microsoft Copilot Studio', 'Arduino IDE', 'Fusion 360', 'Adobe Suite']}
            />
          </div>
        </Reveal>
      </div>

      {/* Experience and Education are a matched pair, so they get their
          own full-width row below the two-column grid rather than being
          split across it — that way they start on the same baseline and
          their traces line up. They stack in this order on a phone. */}
      <Reveal variant="rise-soft" delay={200}>
        <div className="mt-12 md:mt-20 grid md:grid-cols-2 gap-10 md:gap-16">
          <Timeline heading="Experience" entries={experience} />
          <Timeline heading="Education" entries={education} />
        </div>
      </Reveal>
    </div>
  </section>
);

export default AboutSection;
