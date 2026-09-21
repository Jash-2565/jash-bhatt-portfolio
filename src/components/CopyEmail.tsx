import { useState } from 'react';
import { Mail, Check, Copy, ArrowUpRight } from 'lucide-react';

type CopyEmailProps = {
  email: string;
};

// Contact card for the email address: the card itself opens a compose window,
// with a copy button beside it.
//
// It used to be copy-only, which put an app switch and a paste between a
// recruiter and a message at the highest-intent moment on the site. The old
// comment here also claimed a mailto fallback the component never had — the
// actual fallback is execCommand, which is for the clipboard, not for mail.
export default function CopyEmail({ email }: CopyEmailProps) {
  const [copied, setCopied] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

  const confirm = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const legacyCopy = () => {
    const el = document.createElement('textarea');
    el.value = email;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(el);
    }
  };

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
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

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        legacyCopy();
      }
    } catch {
      legacyCopy();
    }
    confirm();
  };

  return (
    // Tighter below `lg` so the contact page fits a phone screen without
    // scrolling; desktop keeps the roomier padding.
    <div className="surface surface-marks relative flex items-center gap-3 p-4 lg:p-5 w-full h-full rounded-2xl card-glow group overflow-hidden">
      {ripple && (
        <span
          key={ripple.key}
          className="copy-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          onAnimationEnd={() => setRipple(null)}
        />
      )}
      <div aria-hidden="true" className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-accent/50 to-transparent rounded-sm" />

      {/* The card is the compose link, so the primary action is the easy one
          to hit; the copy button sits beside it for anyone with no mail client
          wired up. */}
      <a
        href={`mailto:${email}`}
        className="flex min-w-0 flex-1 items-center gap-4 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span aria-hidden="true" className="shrink-0 p-2.5 lg:p-3 bg-accent-deep/25 text-accent-br rounded-sm transition-all duration-300 group-hover:bg-accent group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-6">
          <Mail size={22} />
        </span>
        <span className="text-left min-w-0">
          <span className="block text-sm text-slate-400 font-medium">Email me</span>
          <span className="block text-slate-100 font-semibold text-sm truncate group-hover:text-accent transition-colors">
            {copied ? 'Copied to clipboard' : email}
          </span>
        </span>
        <ArrowUpRight aria-hidden="true" size={18} className="ml-auto shrink-0 text-slate-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent transition-all duration-300" />
      </a>

      {/* The check stays visible once copied — it is a confirmation, not a
          hover hint. */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Email address copied to clipboard' : `Copy email address ${email}`}
        className="relative shrink-0 grid h-11 w-11 place-items-center rounded-sm border border-white/10 text-slate-400 transition-colors hover:text-accent hover:border-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {copied ? <Check size={18} className="text-accent" /> : <Copy size={18} />}
      </button>
    </div>
  );
}
