import { useCallback, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { flows } from "./content/flows";
import { beatAt, compile } from "./engine/timeline";
import { ReducedMotion, useClock, usePrefersReducedMotion } from "./engine/useClock";
import { ChatPanel } from "./components/ChatPanel";
import { Controls } from "./components/Controls";
import { Flowchart } from "./components/Flowchart";
import { ProgressBar } from "./components/ProgressBar";

// The stage is a fixed 1920×1080 canvas scaled to fit, so a screen recording
// or the export script gets the same frame at any window size.
const STAGE_W = 1920;
const STAGE_H = 1080;

const params = new URLSearchParams(location.search);
const EXPORT = params.has("export");

// Which agent: ?flow=leave, or data-flow on <html> for the per-agent pages
// the site embeds (creche.html, leave.html). Defaults to the first.
const flowId = params.get("flow") ?? document.documentElement.dataset.flow;
const flow = flows.find((f) => f.id === flowId) ?? flows[0];
const { workflow, scenarios } = flow;
document.title = `${flow.title} Flow`;

declare global {
  interface Window {
    __agentFlow?: {
      duration: number;
      seek: (ms: number) => void;
      scenarios: string[];
      beats: { node: string; start: number; arrive: number; end: number }[];
    };
  }
}

export default function App() {
  const reduced = usePrefersReducedMotion();
  const [scenarioId, setScenarioId] = useState(() => {
    const id = params.get("scenario");
    return scenarios.some((s) => s.id === id) ? id! : scenarios[0].id;
  });
  const scenario = scenarios.find((s) => s.id === scenarioId)!;
  const tl = useMemo(() => compile(workflow, scenario), [scenario]);
  const { t, playing, setPlaying, speed, setSpeed, seek, toggle } = useClock(tl.total, !EXPORT);
  const scale = useStageScale();

  const chooseScenario = useCallback(
    (id: string) => {
      setScenarioId(id);
      seek(0);
      setPlaying(!EXPORT);
      const url = new URL(location.href);
      url.searchParams.set("scenario", id);
      history.replaceState(null, "", url);
    },
    [seek, setPlaying],
  );

  // While playing, steps jump to the start of a beat so it plays out. While
  // paused, they land just before a beat ends, with everything revealed.
  const forward = useCallback(() => {
    const next = playing ? tl.beats.find((b) => b.start > t + 1)?.start : tl.beats.find((b) => b.end - 1 > t + 1)?.end;
    seek(next !== undefined ? (playing ? next : next - 1) : tl.total);
  }, [playing, t, tl, seek]);

  const back = useCallback(() => {
    if (playing) {
      const i = beatAt(tl, t);
      const cur = tl.beats[i];
      seek(t - cur.start > 700 || i === 0 ? cur.start : tl.beats[i - 1].start);
    } else {
      const prev = [...tl.beats].reverse().find((b) => b.end - 1 < t - 1);
      seek(prev ? prev.end - 1 : 0);
    }
  }, [playing, t, tl, seek]);

  const restart = useCallback(() => {
    seek(0);
    setPlaying(true);
  }, [seek, setPlaying]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement) return;
      if (e.key === " ") {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowRight") forward();
      else if (e.key === "ArrowLeft") back();
      else if (e.key === "r" || e.key === "R") restart();
      else if (/^[1-9]$/.test(e.key) && scenarios[+e.key - 1]) chooseScenario(scenarios[+e.key - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, forward, back, restart, chooseScenario]);

  // Hook for scripts/export.mjs: set the playhead and render synchronously.
  useEffect(() => {
    window.__agentFlow = {
      duration: tl.total,
      seek: (ms) => flushSync(() => seek(ms)),
      scenarios: scenarios.map((s) => s.id),
      beats: tl.beats.map((b) => ({ node: b.beat.node, start: b.start, arrive: b.arrive, end: b.end })),
    };
  }, [tl, seek]);

  return (
    <ReducedMotion.Provider value={reduced}>
      <div className="fixed inset-0 overflow-hidden bg-canvas">
        <div
          className="absolute left-1/2 top-1/2 flex flex-col bg-canvas px-10 pb-8 pt-7"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `translate(-50%, -50%) scale(${scale})`,
            backgroundImage: "radial-gradient(circle at 30% 0%, rgba(1,245,209,0.06), transparent 55%)",
          }}
        >
          <header className="flex h-[64px] items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">HR Genie · Agent workflow</div>
              <h1 className="mt-1 text-[28px] font-bold leading-none text-slate-50">
                {flow.title}
                <span className="ml-4 text-[18px] font-medium text-slate-400">
                  {scenario.label} <span className="text-slate-600">—</span> {scenario.blurb}
                </span>
              </h1>
            </div>
            {!EXPORT && (
              <Controls
                scenarios={scenarios}
                scenarioId={scenarioId}
                onScenario={chooseScenario}
                playing={playing}
                onToggle={toggle}
                onRestart={restart}
                onBack={back}
                onForward={forward}
                speed={speed}
                onSpeed={setSpeed}
              />
            )}
          </header>

          <main className="mt-6 flex min-h-0 flex-1 gap-6">
            <section className="relative w-[60%] rounded-2xl border border-line bg-panel/60 p-4">
              <Legend />
              <Flowchart workflow={workflow} tl={tl} t={t} label={`${flow.title} workflow`} />
            </section>
            <section className="w-[40%] min-w-0">
              <ChatPanel tl={tl} t={t} title={flow.topic} />
            </section>
          </main>

          <footer className="mt-6">
            <ProgressBar workflow={workflow} tl={tl} t={t} onSeek={seek} />
          </footer>
        </div>
      </div>
    </ReducedMotion.Provider>
  );
}

function Legend() {
  return (
    <div className="absolute bottom-4 left-5 flex items-center gap-5 text-[12.5px] text-slate-400">
      <span className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-[4px] border-2 border-accent shadow-[0_0_8px_#01f5d1]" /> Active
      </span>
      <span className="flex items-center gap-2">
        <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-accent text-[9px] font-black text-[#04201c]">✓</span> Done
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3 w-3 rotate-45 border-[1.5px] border-slate-500" /> Decision
      </span>
      <span className="flex items-center gap-2 opacity-50">
        <span className="h-3 w-3 rounded-[4px] border border-dashed border-slate-500" /> Not taken
      </span>
    </div>
  );
}

function useStageScale() {
  const get = () => Math.min(innerWidth / STAGE_W, innerHeight / STAGE_H);
  const [scale, setScale] = useState(get);
  useEffect(() => {
    const onResize = () => setScale(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return scale;
}
