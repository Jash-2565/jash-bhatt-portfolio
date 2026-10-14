import { Briefcase, Award } from 'lucide-react';
import Reveal from '../Reveal';
import PipeList from '../PipeList';
import { ui } from '../../config/ui';

const AboutSection = () => (
  <section id="about" data-nav="about" aria-labelledby="about-heading" className={`${ui.section} ${ui.scrollMt}`}>
    <div className={ui.shell}>
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        <Reveal variant="rise-soft">
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
          <h2 className={`${ui.h2} font-display font-semibold tracking-tight text-ink mb-5 md:mb-9`}>Skills</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Briefcase size={20} className="text-accent" aria-hidden="true" />
                <h3 className="text-xl font-semibold tracking-tight text-ink">Design</h3>
              </div>
              <PipeList
                items={['Agentic AI Workflows', 'Product Design', 'Circuit Design', 'Generative AI in Design', 'UI/UX Design', 'Design System', 'Industrial Design']}
                flow="column"
                className="text-sm font-medium text-accent-br"
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Award size={20} className="text-accent" aria-hidden="true" />
                <h3 className="text-xl font-semibold tracking-tight text-ink">Tools &amp; Tech</h3>
              </div>
              <PipeList
                items={['Figma', 'Python', 'React.js', 'n8n', 'Microsoft Copilot Studio', 'Arduino IDE', 'Fusion 360', 'Adobe Suite']}
                className="text-sm font-medium text-accent-br"
              />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Experience and Education are a matched pair, so they get their
          own full-width row below the two-column grid rather than being
          split across it — that way they start on the same baseline and
          their rules line up. They stack in this order on a phone. */}
      <Reveal variant="rise-soft" delay={200}>
        <div className="mt-10 md:mt-16 grid md:grid-cols-2 gap-8 md:gap-16">
          <div className="border-l-2 border-accent-deep pl-4">
            <h3 className="text-xl font-semibold tracking-tight text-ink mb-4">Experience</h3>
            <div className="space-y-4 md:space-y-6">
              <div>
                <h4 className="text-lg font-bold text-ink">AI Agent Development Intern</h4>
                <p className="text-ink-body font-medium">Bajaj Finance · Agentic AI Unit</p>
                <p className="text-sm text-accent-deep font-medium mt-1">May – July 2026</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-ink">UI/UX Intern</h4>
                <p className="text-ink-body font-medium">RAHI Platform Technologies</p>
                <p className="text-sm text-accent-deep font-medium mt-1">July – August 2025</p>
              </div>
            </div>
          </div>

          <div className="border-l-2 border-accent-deep pl-4">
            <h3 className="text-xl font-semibold tracking-tight text-ink mb-4">Education</h3>
            <div className="space-y-4 md:space-y-6">
              <div>
                <h4 className="text-lg font-bold text-ink">Bachelor of Design (B.Des)</h4>
                <p className="text-ink-body">Minor in Marketing</p>
                <p className="text-ink-body font-medium">FLAME University</p>
                <p className="text-sm text-accent-deep font-medium mt-1">August 2023 – May 2027</p>
              </div>
              <div className="opacity-80">
                <h4 className="text-base font-medium text-ink-body">Cambridge International Education</h4>
                <p className="text-sm text-ink-muted">VIBGYOR High School, NIBM, Pune</p>
                <p className="text-xs text-ink-muted mt-0.5">June 2018 – March 2023</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default AboutSection;
