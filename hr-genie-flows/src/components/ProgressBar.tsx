import type { Workflow } from "../engine/types";
import { beatAt, progress, type Timeline } from "../engine/timeline";
import { TONE } from "./tone";

interface Props {
  workflow: Workflow;
  tl: Timeline;
  t: number;
  onSeek: (ms: number) => void;
  /** Phones: bars only, with the current step named once underneath. */
  compact?: boolean;
}

export function ProgressBar({ workflow, tl, t, onSeek, compact }: Props) {
  const current = beatAt(tl, t);
  const stepOf = (nodeId: string) => workflow.nodes.find((n) => n.id === nodeId)?.step;
  const last = tl.beats[tl.beats.length - 1];
  const endNode = workflow.nodes.find((n) => n.id === last.beat.node && n.kind === "end");
  // A flow that ends on a step rather than a terminal succeeds once it finishes.
  const tone = endNode ? endNode.tone : t >= tl.total ? "success" : undefined;
  const outcome = tone && t >= last.arrive ? TONE[tone] : null;

  const currentStep = stepOf(tl.beats[current].beat.node);
  const pill = (
    <div
      className={`shrink-0 rounded-full border text-center font-semibold ${
        compact ? "px-3 py-1 text-[13px]" : "w-[170px] px-4 py-2 text-[14px]"
      }`}
      style={
        outcome
          ? { borderColor: outcome.hex, color: outcome.hex, background: outcome.fill }
          : { borderColor: "#243140", color: "#7d8b9a" }
      }
    >
      {outcome ? (workflow.outcomeLabels?.[tone!] ?? outcome.label) : "In progress"}
    </div>
  );

  return (
    <div className={compact ? "flex flex-col gap-2.5" : "flex items-center gap-6"}>
      <div className={`grid flex-1 ${compact ? "gap-1" : "gap-2"}`} style={{ gridTemplateColumns: `repeat(${workflow.steps.length}, minmax(0, 1fr))` }}>
        {workflow.steps.map((label, i) => {
          const n = i + 1;
          const beats = tl.beats.filter((b) => stepOf(b.beat.node) === n);
          const mainNode = workflow.nodes.find((x) => x.kind === "step" && x.step === n);
          const fadeAt = mainNode ? tl.nodeFadeAt.get(mainNode.id) : undefined;
          const skipped = fadeAt !== undefined && t >= fadeAt;

          let fill = 0;
          for (const b of beats) {
            if (b.index < current) fill = 1;
            else if (b.index === current) fill = Math.max(fill, progress(t, b.start, b.end - b.start));
          }
          const active = beats.some((b) => b.index === current) && t < tl.total;
          const done = fill >= 1 || (beats.length > 0 && t >= tl.total);

          return (
            <button
              key={label}
              onClick={() => beats[0] && onSeek(beats[0].start)}
              disabled={!beats.length}
              aria-label={compact ? `Step ${n}: ${label}` : undefined}
              className={`group text-left disabled:cursor-default ${compact ? "py-2" : ""}`}
            >
              <div className={`h-1.5 overflow-hidden rounded-full ${skipped ? "bg-line/40" : "bg-line"}`}>
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(done ? 1 : fill) * 100}%`, opacity: done && !active ? 0.7 : 1 }}
                />
              </div>
              {!compact && (
              <div
                className={`mt-2 flex items-center gap-1.5 text-[13px] font-medium ${
                  active ? "text-accent" : skipped ? "text-slate-600 line-through decoration-slate-700" : done ? "text-slate-300" : "text-slate-500"
                }`}
              >
                <span className="tabular-nums opacity-70">{n}</span>
                <span className="truncate">{label}</span>
              </div>
              )}
            </button>
          );
        })}
      </div>
      {compact ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 truncate text-[14px] font-medium text-slate-300">
            {currentStep && t < tl.total ? (
              <>
                <span className="tabular-nums text-accent">{currentStep}</span>
                <span className="text-slate-600"> / {workflow.steps.length}</span>
                <span className="ml-2">{workflow.steps[currentStep - 1]}</span>
              </>
            ) : (
              <span className="text-slate-400">Walkthrough complete</span>
            )}
          </div>
          {pill}
        </div>
      ) : (
        pill
      )}
    </div>
  );
}
