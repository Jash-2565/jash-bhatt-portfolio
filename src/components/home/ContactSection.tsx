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
  <section id="contact" data-nav="contact" aria-labelledby="contact-heading" className={`${ui.section} pb-6 lg:pb-28 ${ui.scrollMt}`}>
    <div className={ui.shell}>
      <div className="grid md:grid-cols-2 gap-6 md:gap-16">
        <Reveal variant="rise-soft">
          <h2 id="contact-heading" className={`${ui.h2} font-display text-ink mb-3 lg:mb-6`}>Let's Build <span className="accent-shimmer">Something</span></h2>
          <p className="text-base lg:text-xl text-ink-body mb-4 lg:mb-6">
            Hiring a product designer who can also build? Email is the quickest way to reach&nbsp;me.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 w-full max-w-[26rem]">
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
