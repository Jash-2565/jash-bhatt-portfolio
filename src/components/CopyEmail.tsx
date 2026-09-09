import { useState } from 'react';
import { Mail, Check, Copy } from 'lucide-react';

type CopyEmailProps = {
  email: string;
};

// Contact card that copies the email to the clipboard on click and shows a
// transient "Copied" confirmation. Falls back to a mailto: link when the
// Clipboard API is unavailable.
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
    // Spawn a ripple from the click point for tactile confirmation.
    const rect = event.currentTarget.getBoundingClientRect();
    setRipple({ x: event.clientX - rect.left, y: event.clientY - rect.top, key: Date.now() });

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
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Email copied to clipboard' : `Copy email address ${email}`}
      // Tighter below `lg` so the contact page fits a phone screen without
      // scrolling; desktop keeps the roomier padding.
      className="surface surface-marks relative flex items-center gap-4 p-4 lg:p-5 w-full h-full text-left rounded-2xl card-glow group overflow-hidden"
    >
      {ripple && (
        <span
          key={ripple.key}
          className="copy-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          onAnimationEnd={() => setRipple(null)}
        />
      )}
      <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-accent/50 to-transparent rounded-sm" />
      <div className="shrink-0 p-2.5 lg:p-3 bg-accent-deep/25 text-accent-br rounded-sm transition-all duration-300 group-hover:bg-accent group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-6">
        <Mail size={22} />
      </div>
      <div className="text-left min-w-0">
        <p className="text-sm text-slate-400 font-medium">Email Me</p>
        <p className="text-slate-100 font-semibold text-sm whitespace-nowrap group-hover:text-accent transition-colors">
          {copied ? 'Copied to clipboard!' : email}
        </p>
      </div>
      {/* Trailing affordance, matching the arrow on the LinkedIn and Resume
          cards. The check stays visible once copied — it is a confirmation,
          not a hover hint. */}
      {copied ? (
        <Check size={18} className="ml-auto shrink-0 text-accent transition-all duration-300" />
      ) : (
        <Copy size={18} className="ml-auto shrink-0 text-slate-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent transition-all duration-300" />
      )}
    </button>
  );
}
