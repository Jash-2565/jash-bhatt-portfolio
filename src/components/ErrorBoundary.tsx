import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { CONTACT_EMAIL, LINKEDIN_URL } from '../config/ui';
import { PUBLIC_URL } from '../utils/getBaseUrl';

/**
 * Catches a render error and shows the one thing the page still has to do.
 *
 * Without this, React 19 unmounts the entire tree when any component throws —
 * so a single bad render anywhere on the site leaves a recruiter looking at a
 * blank `<div id="root">` with no name, no explanation and no way to get in
 * touch. The fallback is deliberately static markup: no state, no effects, and
 * nothing that could throw a second time.
 */
type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Nothing is wired up to receive this, but leaving it on the console means
    // a failure is diagnosable from a bug report rather than invisible.
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[100svh] flex items-center bg-[var(--ground)] px-5 py-16 text-slate-100">
        <div className="mx-auto max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
            Something broke
          </p>
          <h1 className="mt-3 text-3xl font-display sm:text-4xl">Jash Bhatt</h1>
          <p className="mt-2 text-lg text-slate-300">
            Product designer and agentic AI designer.
          </p>
          <p className="mt-6 text-slate-400">
            This page hit an error it couldn&rsquo;t recover from. Reloading usually
            fixes it — and if it doesn&rsquo;t, the work is still reachable below.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-12 items-center rounded-sm bg-accent px-6 font-mono text-sm uppercase tracking-[0.08em] text-black transition-colors hover:bg-accent-br focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ground)]"
            >
              Reload
            </button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-12 items-center rounded-sm border border-white/15 px-6 font-mono text-sm uppercase tracking-[0.08em] text-slate-100 transition-colors hover:text-accent"
            >
              Email me
            </a>
          </div>
          <p className="mt-8 text-sm text-slate-400">
            <a href={LINKEDIN_URL} className="underline underline-offset-4 hover:text-accent">
              linkedin.com/in/jash-bhatt
            </a>
            {' · '}
            <a
              href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
              className="underline underline-offset-4 hover:text-accent"
            >
              Résumé (PDF)
            </a>
          </p>
        </div>
      </div>
    );
  }
}
