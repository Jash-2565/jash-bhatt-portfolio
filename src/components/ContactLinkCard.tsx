import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

type ContactLinkCardProps = {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
  /** Present on the résumé card: without it a link labelled "Download PDF"
      merely opened the file inline in a new tab. */
  download?: string;
};

// The LinkedIn and Resume contact cards. Shared by the Contact section and the
// contact strip at the foot of the mobile Home page, so the two can't drift.
// Styling mirrors CopyEmail, which is the third card in the set.
export default function ContactLinkCard({ href, icon, label, value, download }: ContactLinkCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      download={download}
      className="surface surface-marks relative flex items-center gap-4 p-4 lg:p-5 w-full h-full rounded-2xl card-glow group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-accent/50 to-transparent rounded-sm" />
      <div aria-hidden="true" className="shrink-0 p-2.5 lg:p-3 bg-accent-deep/25 text-accent-br rounded-sm transition-all duration-300 group-hover:bg-accent group-hover:text-slate-950 group-hover:scale-110 group-hover:rotate-6">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="text-slate-100 font-semibold text-sm group-hover:text-accent transition-colors">{value}</p>
      </div>
      <ArrowUpRight aria-hidden="true" size={18} className="ml-auto text-slate-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent transition-all duration-300" />
      <span className="sr-only">{download ? '(downloads a PDF)' : '(opens in a new tab)'}</span>
    </a>
  );
}
