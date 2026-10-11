import type { ReactNode } from "react";
import type { Scenario } from "../engine/types";

interface Props {
  scenarios: Scenario[];
  scenarioId: string;
  onScenario: (id: string) => void;
  playing: boolean;
  onToggle: () => void;
  onRestart: () => void;
  onBack: () => void;
  onForward: () => void;
  speed: number;
  onSpeed: (s: number) => void;
}

const SPEEDS = [0.5, 1, 2];

export function Controls(p: Props) {
  return (
    <div className="flex items-center gap-3">
      <label className="relative">
        <span className="sr-only">Scenario</span>
        <select
          value={p.scenarioId}
          onChange={(e) => p.onScenario(e.target.value)}
          className="h-11 appearance-none rounded-xl border border-line bg-raised pl-4 pr-10 text-[15px] font-medium text-slate-100 outline-none focus-visible:border-accent"
        >
          {p.scenarios.map((s, i) => (
            <option key={s.id} value={s.id}>
              {i + 1}. {s.label}
            </option>
          ))}
        </select>
        <svg viewBox="0 0 16 16" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 6l4 4 4-4" />
        </svg>
      </label>

      <div className="flex items-center gap-1 rounded-xl border border-line bg-raised p-1">
        <Btn label="Restart (R)" onClick={p.onRestart}>
          <path d="M3 8a5 5 0 1 0 1.5-3.5M3 2.5V5h2.5" />
        </Btn>
        <Btn label="Step back (←)" onClick={p.onBack}>
          <path d="M10 4L6 8l4 4" />
        </Btn>
        <Btn label={p.playing ? "Pause (Space)" : "Play (Space)"} onClick={p.onToggle} primary>
          {p.playing ? <path d="M5.5 3.5v9M10.5 3.5v9" /> : <path d="M5 3.2v9.6L12.5 8z" fill="currentColor" />}
        </Btn>
        <Btn label="Step forward (→)" onClick={p.onForward}>
          <path d="M6 4l4 4-4 4" />
        </Btn>
      </div>

      <div className="flex items-center rounded-xl border border-line bg-raised p-1" role="group" aria-label="Speed">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => p.onSpeed(s)}
            aria-pressed={p.speed === s}
            className={`h-9 w-12 rounded-lg text-[14px] font-semibold tabular-nums ${
              p.speed === s ? "bg-accent text-[#04201c]" : "text-slate-400 hover:text-slate-100"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}

function Btn({ label, onClick, primary, children }: { label: string; onClick: () => void; primary?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid h-9 w-10 place-items-center rounded-lg ${
        primary ? "bg-accent text-[#04201c]" : "text-slate-300 hover:bg-line hover:text-slate-50"
      }`}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}
