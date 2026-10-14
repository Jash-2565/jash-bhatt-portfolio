import CopyEmailLink from './CopyEmailLink';
import { ui, CONTACT_EMAIL, LINKEDIN_URL } from '../config/ui';
import { PUBLIC_URL } from '../utils/getBaseUrl';

/**
 * One compact footer at every width — no wordmark (the header already carries
 * it) and a single line of type. It was 151px of chrome for one credit line on
 * desktop. Mobile padding is deliberately much tighter than desktop: 171px of
 * chrome for 90px of content was a third of a short page.
 */
const SiteFooter = () => (
  <footer className="relative z-10 mt-auto scrim border-t border-white/10 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
    <div className={`${ui.shell} flex flex-col items-center gap-3 sm:flex-row sm:justify-between`}>
      {/* This was one credit line. The footer is where someone who read to
          the end looks for a way to get in touch, and there wasn't one. */}
      <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs">
        {/* The ↗ appears on hover or keyboard focus, sliding in from the
            left. It keeps its space while hidden, so the links don't
            shift. Only where there is hover: on touch it stays visible, as
            the sign these lead off the page. Same pattern as the gallery
            captions in CreativeExplorations. Email copies the address
            instead of leaving, so its glyph is a copy icon. */}
        <CopyEmailLink
          email={CONTACT_EMAIL}
          className="min-h-11 min-w-11 inline-flex items-center justify-center text-ink-body hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        />
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="group min-h-11 min-w-11 inline-flex items-center justify-center text-ink-body hover:text-accent transition-colors">
          LinkedIn<span aria-hidden="true" className="ml-1 inline-block transition-all duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:-translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0">↗</span>
        </a>
        <a href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`} target="_blank" rel="noreferrer" className="group min-h-11 min-w-11 inline-flex items-center justify-center text-ink-body hover:text-accent transition-colors">
          Résumé<span aria-hidden="true" className="ml-1 inline-block transition-all duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:-translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0">↗</span>
        </a>
      </nav>
      {/* `text-balance` so the credit doesn't leave "scratch." alone on a
          second line at 320px. */}
      <p className="text-ink-muted text-xs text-center [text-wrap:balance]">
        © 2026 Jash Bhatt — designed &amp; built from scratch.
      </p>
    </div>
  </footer>
);

export default SiteFooter;
