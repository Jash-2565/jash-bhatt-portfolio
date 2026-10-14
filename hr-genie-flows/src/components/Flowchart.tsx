import type { ApiBadge as Badge, EndTone, FlowEdge, FlowNode, Workflow } from "../engine/types";
import {
  along,
  edgeView,
  nodeView,
  progress,
  toPath,
  type Timeline,
} from "../engine/timeline";
import { useReduced } from "../engine/useClock";
import { TONE } from "./tone";

const ACCENT = "#01f5d1";
const IDLE_STROKE = "#2a3949";
const IDLE_EDGE = "#2a3949";

interface Props {
  workflow: Workflow;
  tl: Timeline;
  t: number;
}

export function Flowchart({ workflow, tl, t, label }: Props & { label: string }) {
  const { w, h } = workflow.viewBox;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" role="img" aria-label={label}>
      <defs>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="dotGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {workflow.edges.map((e) => (
        <Edge key={e.id} edge={e} tl={tl} t={t} />
      ))}
      {[workflow.apiBadge ?? []].flat().map((b) => (
        <ApiBadge key={b.anchor} badge={b} workflow={workflow} tl={tl} t={t} />
      ))}
      {workflow.nodes.map((n) => (
        <Node key={n.id} node={n} tl={tl} t={t} />
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------------- edges */

function Edge({ edge, tl, t }: { edge: FlowEdge; tl: Timeline; t: number }) {
  const reduced = useReduced();
  const v = edgeView(tl, t, edge);
  const drawn = reduced ? (v.drawn > 0 ? 1 : 0) : v.drawn;
  const { at, partial } = along(edge.points, drawn);
  const done = drawn >= 1;
  const [ex, ey] = edge.points[edge.points.length - 1];
  const [px, py] = edge.points[edge.points.length - 2];
  const angle = (Math.atan2(ey - py, ex - px) * 180) / Math.PI;

  const label = edge.label && labelPos(edge);

  return (
    <g opacity={v.opacity}>
      <path d={toPath(edge.points)} fill="none" stroke={IDLE_EDGE} strokeWidth={2} strokeLinejoin="round" />
      {drawn > 0 && (
        <path
          d={toPath(partial)}
          fill="none"
          stroke={ACCENT}
          strokeOpacity={done ? 0.75 : 1}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}
      <path
        d="M -7 -4.5 L 0 0 L -7 4.5 Z"
        fill={done ? ACCENT : IDLE_EDGE}
        fillOpacity={done ? 0.85 : 1}
        transform={`translate(${ex} ${ey}) rotate(${angle})`}
      />
      {v.traveling && !reduced && (
        <g>
          <circle cx={at[0]} cy={at[1]} r={9} fill={ACCENT} opacity={0.6} filter="url(#dotGlow)" />
          <circle cx={at[0]} cy={at[1]} r={5} fill="#eafffb" />
        </g>
      )}
      {label && (
        <text
          x={label.x}
          y={label.y}
          textAnchor={label.anchor}
          fontSize={12}
          fontWeight={500}
          fill={done ? ACCENT : "#7d8b9a"}
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

/** Labels sit beside vertical runs and above horizontal ones. */
function labelPos(edge: FlowEdge) {
  const { at } = along(edge.points, edge.labelAt ?? 0.5);
  const seg = edge.points.findIndex((p, i) => {
    const q = edge.points[i + 1];
    if (!q) return false;
    const [minY, maxY] = [Math.min(p[1], q[1]), Math.max(p[1], q[1])];
    const [minX, maxX] = [Math.min(p[0], q[0]), Math.max(p[0], q[0])];
    return at[0] >= minX - 0.5 && at[0] <= maxX + 0.5 && at[1] >= minY - 0.5 && at[1] <= maxY + 0.5;
  });
  const p = edge.points[Math.max(0, seg)];
  const q = edge.points[Math.max(0, seg) + 1] ?? p;
  const vertical = Math.abs(q[0] - p[0]) < Math.abs(q[1] - p[1]);
  return vertical
    ? { x: at[0] + 10, y: at[1] + 4, anchor: "start" as const }
    : { x: at[0], y: at[1] - 8, anchor: "middle" as const };
}

/* ---------------------------------------------------------------- nodes */

function Node({ node, tl, t }: { node: FlowNode; tl: Timeline; t: number }) {
  const reduced = useReduced();
  const terminal = node.kind === "end";
  const v = nodeView(tl, t, node.id, terminal);
  const tone = node.tone ? TONE[node.tone] : null;
  const left = node.x - node.w / 2;
  const top = node.y - node.h / 2;
  const since = t - v.since;

  const active = v.status === "active";
  const ended = v.status === "ended";
  const done = v.status === "done";

  // A short decaying shake when a reject / redirect / error lands.
  let dx = 0;
  if (ended && node.tone !== "success" && !reduced && since < 520) {
    dx = Math.sin(since / 26) * 7 * (1 - since / 520);
  }

  const color = ended && tone ? tone.hex : ACCENT;
  const stroke = active || ended ? color : done ? `${ACCENT}80` : IDLE_STROKE;
  const fill = ended && tone ? tone.fill : active ? "#0f2a2c" : done ? "#0f1c22" : "#0d141c";
  const pulse = reduced ? 0.5 : (since % 1500) / 1500;
  const isSide = node.kind !== "step";
  const branchWarn = node.kind === "branch" && (active || done);

  return (
    <g opacity={v.opacity} transform={`translate(${dx} 0)`}>
      {(active || ended) && (
        <>
          <rect
            x={left}
            y={top}
            width={node.w}
            height={node.h}
            rx={14}
            fill={color}
            opacity={active ? 0.22 + 0.12 * Math.sin(pulse * Math.PI * 2) : 0.3}
            filter="url(#glow)"
          />
          {!reduced && (active || since < 1500) && (
            <rect
              x={left - pulse * 12}
              y={top - pulse * 12}
              width={node.w + pulse * 24}
              height={node.h + pulse * 24}
              rx={14 + pulse * 12}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              opacity={(1 - pulse) * 0.6}
            />
          )}
        </>
      )}
      <rect
        x={left}
        y={top}
        width={node.w}
        height={node.h}
        rx={14}
        fill={fill}
        stroke={branchWarn ? TONE.redirect.hex : stroke}
        strokeWidth={active || ended ? 2 : 1.5}
        strokeDasharray={isSide && v.status === "idle" ? "5 4" : undefined}
      />

      {isSide ? (
        <SideContent node={node} lit={active || ended || done} />
      ) : (
        <StepContent
          node={node}
          done={done}
          lit={active}
          note={v.note}
          noteColor={v.noteTone ? TONE[v.noteTone === "bad" ? "reject" : "redirect"].hex : ACCENT}
          noteIn={progress(t, v.since, 400)}
        />
      )}
    </g>
  );
}

function StepContent({
  node,
  done,
  lit,
  note,
  noteColor,
  noteIn,
}: {
  node: FlowNode;
  done: boolean;
  lit: boolean;
  note?: string;
  noteColor: string;
  noteIn: number;
}) {
  const left = node.x - node.w / 2;
  const cx = left + 26;
  const textX = left + 50;
  return (
    <>
      <circle
        cx={cx}
        cy={node.y - 14}
        r={13}
        fill={done ? ACCENT : lit ? "#0f2a2c" : "#161f28"}
        stroke={done || lit ? ACCENT : IDLE_STROKE}
        strokeWidth={1.5}
      />
      {done ? (
        <path
          d={`M ${cx - 5.5} ${node.y - 14} l 3.8 3.8 l 7 -7.5`}
          fill="none"
          stroke="#04201c"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <text x={cx} y={node.y - 9.5} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={lit ? ACCENT : "#8796a5"}>
          {node.step}
        </text>
      )}
      {node.decision && (
        <rect
          x={node.x + node.w / 2 - 20}
          y={node.y - node.h / 2 + 12}
          width={8}
          height={8}
          transform={`rotate(45 ${node.x + node.w / 2 - 16} ${node.y - node.h / 2 + 16})`}
          fill="none"
          stroke={lit || done ? ACCENT : "#5b6b7b"}
          strokeWidth={1.4}
        />
      )}
      <text x={textX} y={node.y - 9} fontSize={16.5} fontWeight={600} fill={lit || done ? "#f1f5f9" : "#c3ccd6"}>
        {node.title}
      </text>
      <text x={textX} y={node.y + 11} fontSize={12} fill="#7d8b9a">
        {node.subtitle}
      </text>
      {note && (
        <text x={textX} y={node.y + 30} fontSize={12} fontWeight={600} fill={noteColor} opacity={noteIn}>
          {note}
        </text>
      )}
    </>
  );
}

const ICON: Record<EndTone | "branch", string> = {
  success: "M -4.5 0 l 3 3 l 6 -6.5",
  reject: "M -4 -4 L 4 4 M 4 -4 L -4 4",
  error: "M 0 -5 L 0 1.5 M 0 4.6 L 0 4.8",
  redirect: "M -4.5 3.5 L -4.5 -1 Q -4.5 -3 -2.5 -3 L 4.5 -3 M 1.5 -6 L 4.5 -3 L 1.5 0",
  branch: "M 0 -5 L 0 1.5 M 0 4.6 L 0 4.8",
};

function SideContent({ node, lit }: { node: FlowNode; lit: boolean }) {
  const tone = node.tone ? TONE[node.tone] : TONE.redirect;
  const left = node.x - node.w / 2;
  const cx = left + 22;
  const color = lit ? tone.hex : "#6b7a89";
  return (
    <>
      <circle cx={cx} cy={node.y} r={11} fill={lit ? tone.fill : "#161f28"} stroke={color} strokeWidth={1.4} />
      <path
        d={ICON[node.tone ?? "branch"]}
        transform={`translate(${cx} ${node.y})`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x={left + 42} y={node.y - 3} fontSize={14} fontWeight={600} fill={lit ? "#f1f5f9" : "#b4bfca"}>
        {node.title}
      </text>
      <text x={left + 42} y={node.y + 14} fontSize={11} fill="#7d8b9a">
        {node.subtitle}
      </text>
    </>
  );
}

/* ------------------------------------------------------------ api badge */

function ApiBadge({ badge: b, workflow, tl, t }: Props & { badge: Badge }) {
  const reduced = useReduced();
  const anchor = workflow.nodes.find((n) => n.id === b.anchor)!;
  const call = tl.events.find((e) => e.event.kind === "api" && tl.beats[e.beat].beat.node === b.anchor);
  const calling = call && t >= call.start && t < call.start + call.dur;
  const finished = call && t >= call.start + call.dur;
  const ok = call?.event.kind === "api" && call.event.ok;
  const fade = tl.nodeFadeAt.get(anchor.id);
  const opacity = fade !== undefined ? 1 - 0.82 * progress(t, fade, 600) : 1;

  const color = calling ? ACCENT : finished ? (ok ? TONE.success.hex : TONE.error.hex) : "#5b6b7b";
  const phase = call ? ((t - call.start) % 900) / 900 : 0;
  const top = b.y - b.h / 2;
  // Beside the anchor when the badge sits level with it, otherwise below.
  const beside = Math.abs(b.y - anchor.y) < anchor.h / 2;
  const link = beside
    ? { x1: anchor.x + anchor.w / 2, y1: b.y, x2: b.x - b.w / 2, y2: b.y }
    : { x1: b.x, y1: anchor.y + anchor.h / 2, x2: b.x, y2: top };

  return (
    <g opacity={opacity}>
      <line
        {...link}
        stroke={calling ? ACCENT : IDLE_EDGE}
        strokeWidth={2}
        strokeDasharray="4 4"
        strokeDashoffset={calling && !reduced ? -phase * 16 : 0}
      />
      {calling && !reduced && (
        <rect
          x={b.x - b.w / 2 - phase * 10}
          y={top - phase * 10}
          width={b.w + phase * 20}
          height={b.h + phase * 20}
          rx={b.h / 2 + phase * 10}
          fill="none"
          stroke={ACCENT}
          strokeWidth={1.5}
          opacity={1 - phase}
        />
      )}
      <rect
        x={b.x - b.w / 2}
        y={top}
        width={b.w}
        height={b.h}
        rx={b.h / 2}
        fill={calling ? "#0f2a2c" : "#0d141c"}
        stroke={color}
        strokeWidth={1.5}
      />
      <circle
        cx={b.x - b.w / 2 + 20}
        cy={b.y}
        r={4.5}
        fill={color}
        opacity={calling && !reduced ? 0.5 + 0.5 * Math.sin(phase * Math.PI * 2) : 1}
      />
      <text x={b.x + 8} y={b.y + 4.5} textAnchor="middle" fontSize={13} fontWeight={600} fill={calling || finished ? "#f1f5f9" : "#9aa7b4"}>
        {b.label}
      </text>
    </g>
  );
}
