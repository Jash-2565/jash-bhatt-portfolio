import { useState } from 'react';
import { Mail, Check, Copy } from 'lucide-react';
import { useCopyText } from '../hooks/useCopyText';

type CopyEmailProps = {
  email: string;
};

// Contact card for the email address. The whole card copies the address.
//
// It opened a compose window for a while, with a copy button beside it. But a
// mailto link does nothing useful for anyone without a desktop mail client set
// up — a web-mail user got an app picker or nothing at all — so copying is the
// one action that works for everyone.
export default function CopyEmail({ email }: CopyEmailProps) {
  const { copied, copy } = useCopyText(email);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Spawn a ripple from the press point for tactile confirmation. Enter and
    // Space report clientX/clientY as 0, which put the ripple in the corner
    // for every keyboard user — fall back to the centre there.
    const rect = event.currentTarget.getBoundingClientRect();
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    setRipple({
      x: fromKeyboard ? rect.width / 2 : event.clientX - rect.left,
      y: fromKeyboard ? rect.height / 2 : event.clientY - rect.top,
      key: Date.now(),
    });
    copy();
  };

  return (
    // Tighter below `lg` so the contact page fits a phone screen without
    // scrolling; desktop keeps the roomier padding.
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy email address ${email}`}
      className="surface surface-marks relative flex items-center gap-4 p-4 lg:p-5 w-full h-full rounded-2xl card-glow group overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {ripple && (
        <span
          key={ripple.key}
          className="copy-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          onAnimationEnd={() => setRipple(null)}
        />
      )}
      <span aria-hidden="true" className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-accent/50 to-transparent rounded-sm" />

      <span aria-hidden="true" className="shrink-0 p-2.5 lg:p-3 bg-accent-deep/25 text-accent-br rounded-sm transition-all duration-300 group-hover:bg-accent group-hover:text-ink-inverse group-hover:scale-110 group-hover:rotate-6">
        <Mail size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink-muted font-medium">Email me</span>
        <span className="block text-ink font-semibold text-sm truncate group-hover:text-accent transition-colors">
          {copied ? 'Copied to clipboard' : email}
        </span>
      </span>
      {/* Copy glyph where the ↗ used to be — it says what a press does. The
          check stays visible once copied; it is a confirmation, not a hover
          hint. */}
      <span aria-hidden="true" className="shrink-0 grid h-11 w-11 place-items-center rounded-sm border border-white/10 text-ink-muted transition-colors group-hover:text-accent group-hover:border-accent/40">
        {copied ? <Check size={18} className="text-accent" /> : <Copy size={18} />}
      </span>
      <span role="status" className="sr-only">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>
    </button>
  );
}
