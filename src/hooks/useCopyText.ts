import { useEffect, useRef, useState } from 'react';
import { lewisReact } from '../config/lewis';

// Copy a fixed string to the clipboard, with a `copied` flag that holds for
// `resetMs` so the caller can show a confirmation.
//
// Falls back to execCommand where the async Clipboard API is missing or
// refuses (older Safari, non-secure origins).
export function useCopyText(text: string, resetMs = 1800) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const legacyCopy = () => {
    const el = document.createElement('textarea');
    el.value = text;
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

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        legacyCopy();
      }
    } catch {
      legacyCopy();
    }
    setCopied(true);
    // Lewis celebrates a copied address. Only the contact email uses this
    // hook; if it ever copies something else, move this to the caller.
    lewisReact('jumping');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), resetMs);
  };

  return { copied, copy };
}
