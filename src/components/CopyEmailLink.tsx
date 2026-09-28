import { Check, Copy } from 'lucide-react';
import { useCopyText } from '../hooks/useCopyText';

type CopyEmailLinkProps = {
  email: string;
  className?: string;
};

// The footer's "Email" item: copies the address rather than opening a mail
// client, like the contact card (see CopyEmail). A teal check confirms the
// copy; the label stays "Email", since swapping it for "Copied" widened the
// item and nudged the links beside it.
//
// The glyph follows the footer's hover-reveal pattern, but is a copy icon, not
// the ↗ its neighbours use — this one doesn't leave the page.
export default function CopyEmailLink({ email, className = '' }: CopyEmailLinkProps) {
  const { copied, copy } = useCopyText(email);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy email address ${email}`}
      className={`group ${className}`}
    >
      Email
      <span
        aria-hidden="true"
        className={`ml-1 inline-block transition-all duration-200 ${
          copied
            ? 'text-accent'
            : '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:-translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0'
        }`}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </span>
      <span role="status" className="sr-only">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>
    </button>
  );
}
