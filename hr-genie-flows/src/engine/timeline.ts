import type { Beat, ChatEvent, FlowEdge, Scenario, Workflow } from "./types";

// A scenario compiles to absolute times once. Everything on screen is then a
// pure function of the playhead `t`, which is what makes seeking, stepping
// and frame-by-frame export exact.

export const TRAVEL_MS = 800;
const BEAT_HOLD_MS = 450;
export const FADE_MS = 600;
export const TYPING_DOTS_MS = 550;

/** How long each event occupies the timeline at 1× speed. */
export function eventDuration(e: ChatEvent): number {
  switch (e.kind) {
    case "agent":
      return TYPING_DOTS_MS + e.text.length * 17 + 650;
    case "user":
      return 250 + e.text.length * 30 + 450;
    case "system":
      return 950;
    case "file":
      return 1100 + e.files.length * 450;
    case "ocr":
      return 500 + e.fields.length * 360 + 900;
    case "cap":
      return 3900;
    case "summary":
      return 500 + e.rows.length * 170 + e.documents.length * 200 + 2200;
    case "api":
      return 2300;
    case "end":
      return (e.tone === "success" ? 3200 : 2600) + (e.actions ? 800 : 0);
    case "balance":
      return 400 + e.items.length * 250 + 1300;
    case "choice":
      return 500 + e.options.length * 120 + (e.selected ? 1300 : 600);
    case "info":
      return 600 + e.lines.join(" ").length * 22;
    case "dates":
      return 2600;
    case "checks":
      return 400 + e.items.length * 550 + 900;
  }
}

export interface TimedEvent {
  key: string;
  event: ChatEvent;
  beat: number;
  start: number;
  dur: number;
}

export interface TimedBeat {
  beat: Beat;
  index: number;
  start: number;
  /** When the travelling dot reaches the node. */
  arrive: number;
  end: number;
}

export interface Timeline {
  scenario: Scenario;
  beats: TimedBeat[];
  events: TimedEvent[];
  total: number;
  /** Nodes and edges off this scenario's path, and when they fade out. */
  nodeFadeAt: Map<string, number>;
  edgeFadeAt: Map<string, number>;
  pathEdges: Set<string>;
}

export function compile(workflow: Workflow, scenario: Scenario): Timeline {
  validate(workflow, scenario);
  const beats: TimedBeat[] = [];
  const events: TimedEvent[] = [];
  let t = 0;

  scenario.beats.forEach((beat, index) => {
    const start = t;
    const arrive = start + (beat.via ? TRAVEL_MS : 0);
    t = arrive;
    beat.events.forEach((event, i) => {
      const dur = eventDuration(event);
      events.push({ key: `${index}.${i}`, event, beat: index, start: t, dur });
      t += dur;
    });
    t += BEAT_HOLD_MS;
    beats.push({ beat, index, start, arrive, end: t });
  });

  // A node off the path fades once whatever leads to it is decided: a visited
  // predecessor finishing its beat, or an already-faded predecessor. Repeat
  // until nothing changes so the fade runs all the way downstream.
  const settledAt = new Map<string, number>();
  for (const b of beats) settledAt.set(b.beat.node, b.end);
  const visited = new Set(scenario.beats.map((b) => b.node));
  const pathEdges = new Set(scenario.beats.flatMap((b) => (b.via ? [b.via] : [])));

  const nodeFadeAt = new Map<string, number>();
  const edgeFadeAt = new Map<string, number>();
  const decidedAt = (id: string) => settledAt.get(id) ?? nodeFadeAt.get(id);

  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of workflow.edges) {
      if (pathEdges.has(edge.id)) continue;
      const from = decidedAt(edge.from);
      if (from === undefined) continue;
      if (edgeFadeAt.get(edge.id) !== from) {
        edgeFadeAt.set(edge.id, from);
        changed = true;
      }
      if (!visited.has(edge.to)) {
        const prev = nodeFadeAt.get(edge.to);
        if (prev === undefined || from < prev) {
          nodeFadeAt.set(edge.to, from);
          changed = true;
        }
      }
    }
  }

  return { scenario, beats, events, total: t, nodeFadeAt, edgeFadeAt, pathEdges };
}

/** Each beat must travel a real edge from the previous beat's node. */
function validate(workflow: Workflow, scenario: Scenario) {
  scenario.beats.forEach((beat, i) => {
    const where = `Scenario "${scenario.id}", beat ${i} (${beat.node})`;
    if (!workflow.nodes.some((n) => n.id === beat.node)) throw new Error(`${where}: unknown node`);
    if (i === 0) return;
    const edge = workflow.edges.find((e) => e.id === beat.via);
    if (!edge) throw new Error(`${where}: needs \`via\`, an edge from "${scenario.beats[i - 1].node}"`);
    if (edge.from !== scenario.beats[i - 1].node || edge.to !== beat.node) {
      throw new Error(`${where}: edge "${edge.id}" runs ${edge.from} → ${edge.to}, not ${scenario.beats[i - 1].node} → ${beat.node}`);
    }
  });
}

/* ---------------------------------------------------------- state at t */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const progress = (t: number, start: number, dur: number) =>
  dur <= 0 ? (t >= start ? 1 : 0) : clamp01((t - start) / dur);
export const easeInOut = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
export const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

/** Index of the beat the playhead is in. */
export function beatAt(tl: Timeline, t: number): number {
  let i = 0;
  while (i < tl.beats.length - 1 && t >= tl.beats[i + 1].start) i++;
  return i;
}

export type NodeStatus = "idle" | "active" | "done" | "ended";

export interface NodeView {
  status: NodeStatus;
  /** 1 = normal, down to ~0.15 when faded off-path. */
  opacity: number;
  /** When the node became active/ended, for pulse and shake timing. */
  since: number;
  note?: string;
  noteTone?: "bad" | "warn";
}

export function nodeView(tl: Timeline, t: number, id: string, terminal: boolean): NodeView {
  const tb = tl.beats.find((b) => b.beat.node === id);
  const fadeAt = tl.nodeFadeAt.get(id);
  const opacity = fadeAt === undefined ? 1 : 1 - 0.82 * easeOut(progress(t, fadeAt, FADE_MS));
  if (!tb || t < tb.arrive) return { status: "idle", opacity, since: 0 };
  const last = tb.index === tl.beats.length - 1;
  // The last beat stays active through its hold, unless the playhead has run
  // off the end of a flow that finishes on a step rather than a terminal.
  const status: NodeStatus = terminal ? "ended" : t >= tb.end && (!last || t >= tl.total) ? "done" : "active";
  return { status, opacity, since: tb.arrive, note: tb.beat.note, noteTone: tb.beat.noteTone };
}

export interface EdgeView {
  /** 0..1 how much of the edge is drawn as travelled. */
  drawn: number;
  /** True while the dot is on this edge. */
  traveling: boolean;
  opacity: number;
}

export function edgeView(tl: Timeline, t: number, edge: FlowEdge): EdgeView {
  const tb = tl.beats.find((b) => b.beat.via === edge.id);
  const fadeAt = tl.edgeFadeAt.get(edge.id);
  const opacity = fadeAt === undefined ? 1 : 1 - 0.85 * easeOut(progress(t, fadeAt, FADE_MS));
  if (!tb) return { drawn: 0, traveling: false, opacity };
  const p = progress(t, tb.start, TRAVEL_MS);
  return { drawn: easeInOut(p), traveling: p > 0 && p < 1, opacity };
}

/* ---------------------------------------------------------- polylines */

type Pt = [number, number];

export function polylineLength(points: Pt[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return len;
}

/** Point at fraction `f` along the polyline, plus the partial polyline up to it. */
export function along(points: Pt[], f: number): { at: Pt; partial: Pt[] } {
  const target = polylineLength(points) * clamp01(f);
  let acc = 0;
  const partial: Pt[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const seg = Math.hypot(bx - ax, by - ay);
    if (acc + seg >= target) {
      const r = seg === 0 ? 0 : (target - acc) / seg;
      const at: Pt = [ax + (bx - ax) * r, ay + (by - ay) * r];
      partial.push(at);
      return { at, partial };
    }
    acc += seg;
    partial.push(points[i]);
  }
  return { at: points[points.length - 1], partial };
}

export const toPath = (points: Pt[]) =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
