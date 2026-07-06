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

  const handleCopy = async () => {
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
      className="relative flex items-center gap-4 p-5 w-full text-left bg-slate-900/80 border border-slate-700 rounded-2xl shadow-sm card-glow group overflow-hidden"
    >
      <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-[#01F5D1]/50 to-transparent rounded-full" />
      <div className="shrink-0 p-3 bg-[#00A19B]/25 text-[#9EF7EA] rounded-full transition-all duration-300 group-hover:bg-[#01F5D1] group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-6">
        <Mail size={22} />
      </div>
      <div className="text-left min-w-0">
        <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
          Email Me
          {copied ? (
            <Check size={13} className="text-[#01F5D1]" />
          ) : (
            <Copy size={13} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </p>
        <p className="text-slate-100 font-semibold text-sm whitespace-nowrap group-hover:text-[#01F5D1] transition-colors">
          {copied ? 'Copied to clipboard!' : email}
        </p>
      </div>
    </button>
  );
}
