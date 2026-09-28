import { Component } from 'react';
import type { CSSProperties, ErrorInfo, ReactNode } from 'react';
import { CONTACT_EMAIL, LINKEDIN_URL } from '../config/ui';
import { CELL_H, CELL_W, spriteStyle } from '../config/lewis';
import { BAND, WIDTH, board } from '../lib/circuitBoard';
import { PUBLIC_URL } from '../utils/getBaseUrl';

/**
 * Catches a render error and shows the one thing the page still has to do.
 *
 * Without this, React 19 unmounts the entire tree when any component throws —
 * so a single bad render anywhere on the site leaves a recruiter looking at a
 * blank `<div id="root">` with no name, no explanation and no way to get in
 * touch. The fallback is deliberately static markup: no state, no effects, and
 * nothing that could throw a second time.
 *
 * It looks like the site and like the 404 page: the circuit board behind it
 * and Lewis standing by. The board is a fixed three bands from the pure
 * generator, not CircuitGround, which measures the page; Lewis's idle loop is
 * a CSS animation (.lewis-idle), not the pet's animation loop.
 */
type Props = { children: ReactNode };
type State = { hasError: boolean };

const BOARD_BANDS = 3; // 1536px of board, taller than any phone's screen
const LEWIS_SCALE = 0.75;

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

    const { traces, pads } = board(BOARD_BANDS);
    const boardH = BOARD_BANDS * BAND;
    const cellW = CELL_W * LEWIS_SCALE;
    const sprite = {
      ...spriteStyle(LEWIS_SCALE),
      width: cellW,
      height: CELL_H * LEWIS_SCALE,
      backgroundPosition: '0 0',
      '--lewis-cell': `${cellW}px`,
    } as CSSProperties;

    return (
      <div className="relative min-h-[100svh] flex items-center overflow-x-clip bg-[var(--ground)] text-ink">
        {/* .circuit-ground gives the colour and the phone strength; the size
            is set here because this board is fixed rather than measured. */}
        <div className="circuit-ground" aria-hidden="true">
          <svg
            viewBox={`0 0 ${WIDTH} ${boardH}`}
            fill="none"
            className="w-[3840px] h-[1536px] max-md:w-[4800px] max-md:h-[1920px]"
          >
            <path
              d={traces}
              stroke="currentColor"
              strokeOpacity={0.085}
              strokeWidth={1.15}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d={pads} fill="currentColor" fillOpacity={0.3} />
          </svg>
        </div>

        <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col-reverse gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between md:gap-12 md:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
              Something broke
            </p>
            <h1 className="mt-3 text-3xl font-display sm:text-4xl">Jash Bhatt</h1>
            <p className="mt-2 text-lg text-ink-body">
              Product designer and agentic AI designer.
            </p>
            <p className="mt-6 max-w-xl text-ink-muted">
              This page hit an error it couldn&rsquo;t recover from. Reloading usually
              fixes it — and if it doesn&rsquo;t, the work is still reachable below.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex min-h-12 items-center rounded-sm bg-accent px-6 sm:px-8 font-mono text-sm uppercase tracking-[0.08em] text-ink-inverse transition-all duration-200 hover:bg-accent-br hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ground)]"
              >
                Reload
              </button>
              {/* Still a mailto, unlike the copy-to-clipboard elsewhere: this
                  screen stays free of state, and a copy needs a "copied"
                  confirmation to be any use. */}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex min-h-12 items-center rounded-sm bg-[var(--surface-2)] px-6 sm:px-8 font-mono text-sm uppercase tracking-[0.08em] text-ink transition-colors hover:text-accent-br focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Email me
              </a>
            </div>
            <p className="mt-8 text-sm text-ink-muted">
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

          {/* Lewis, standing by. The bubble's tail points down at his head. */}
          <div aria-hidden="true" className="flex shrink-0 flex-col items-start md:items-center">
            <div className="relative mb-3.5 max-w-[15rem] rounded-sm border border-accent/35 bg-[var(--surface-1)] px-3.5 py-2.5 font-mono text-xs leading-normal text-ink after:absolute after:-bottom-[6px] after:left-12 after:h-2.5 after:w-2.5 after:rotate-45 after:border-b after:border-r after:border-accent/35 after:bg-[var(--surface-1)] after:content-[''] md:after:left-1/2 md:after:-ml-[5px]">
              Red flag! Something broke — give it a reload.
            </div>
            <div className="lewis-idle ml-2 md:ml-0" style={sprite} />
          </div>
        </main>
      </div>
    );
  }
}
