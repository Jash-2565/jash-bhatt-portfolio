import { Linkedin } from 'lucide-react';
import Reveal from '../Reveal';
import Magnetic from '../Magnetic';
import CopyEmail from '../CopyEmail';
import ContactLinkCard from '../ContactLinkCard';
import { ui, CONTACT_EMAIL, LINKEDIN_URL, LINKEDIN_HANDLE } from '../../config/ui';

/**
 * Contact. This is the one page short enough to fit a phone screen without
 * scrolling, so its mobile spacing is tuned to keep it that way — desktop
 * keeps the original rhythm via the `lg:` values.
 */
const ContactSection = () => (
  <section id="contact" data-nav="contact" aria-labelledby="contact-heading" className={`${ui.section} pb-6 lg:pb-32 ${ui.scrollMt}`}>
    <div className={ui.shell}>
      <div className="grid md:grid-cols-[1.15fr_1fr] gap-6 md:gap-16 md:items-center">
        <Reveal variant="rise-soft">
          <p className={`${ui.eyebrow} section-index mb-3 lg:mb-5`}>Contact</p>
          {/* The page's last word, so it is set larger than the other section
              heads — closer to the hero's scale than to theirs. */}
          <h2 id="contact-heading" className="text-[2rem] sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.05] font-display text-ink mb-3 lg:mb-6 [text-wrap:balance]">
            Let's Build <span className="accent-shimmer">Something</span>
          </h2>
          <p className="text-base lg:text-xl text-ink-body mb-4 lg:mb-0 max-w-xl">
            Hiring a product designer who can also build? Email is the quickest way to reach&nbsp;me.
          </p>
        </Reveal>

        <div className="relative grid grid-cols-1 gap-4 w-full max-w-[26rem]">
          {/* Two traces fork from the copy into the two cards, with signals
              running in along them. Drawn across the column gap, so it only
              exists where there is one. */}
          <svg
            className="contact-fork hidden md:block"
            viewBox="0 0 64 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 50 H22 L34 26 H64" pathLength="100" />
            <path d="M0 50 H22 L34 74 H64" pathLength="100" />
            <path className="contact-fork-signal" d="M0 50 H22 L34 26 H64" pathLength="100" />
            <path className="contact-fork-signal contact-fork-signal--late" d="M0 50 H22 L34 74 H64" pathLength="100" />
          </svg>
          <span className="contact-fork-pad hidden md:block" aria-hidden="true" />

          <Reveal variant="rise" delay={80} className="h-full">
            <Magnetic className="h-full">
              <CopyEmail email={CONTACT_EMAIL} />
            </Magnetic>
          </Reveal>

          <Reveal variant="rise" delay={160} className="h-full">
            <Magnetic className="h-full">
              <ContactLinkCard href={LINKEDIN_URL} icon={<Linkedin size={22} />} label="LinkedIn" value={LINKEDIN_HANDLE} />
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

export default ContactSection;
