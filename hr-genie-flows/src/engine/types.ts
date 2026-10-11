// The schema the engine plays. Content lives in src/content; nothing in
// src/engine knows what a creche is.

/* ---------------------------------------------------------------- workflow */

export type NodeKind =
  | "step" // one of the numbered main steps
  | "branch" // a side path that rejoins the flow (e.g. daycare confirmation)
  | "end"; // a terminal

export type EndTone = "success" | "reject" | "redirect" | "error";

export interface FlowNode {
  id: string;
  kind: NodeKind;
  title: string;
  subtitle?: string;
  /** Main step number (1-based); also the progress-bar segment it belongs to. */
  step?: number;
  /** Decisions get a small diamond marker. */
  decision?: boolean;
  tone?: EndTone;
  /** Centre position and size in flowchart viewBox units. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  /** Orthogonal polyline, start to end, in viewBox units. */
  points: [number, number][];
  label?: string;
  /** Where the label sits, as a fraction along the path. */
  labelAt?: number;
}

export interface Workflow {
  viewBox: { w: number; h: number };
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** Labels for the bottom progress bar, one per main step. */
  steps: string[];
  /** Badge for the backend call, pulsing while an `api` event plays. */
  apiBadge?: { x: number; y: number; w: number; h: number; label: string; anchor: string };
  /** Overrides for the outcome pill, e.g. { reject: "Blocked" }. */
  outcomeLabels?: Partial<Record<EndTone, string>>;
}

/* ------------------------------------------------------------------- chat */

export interface Field {
  label: string;
  value: string;
  /** Smaller second line under the value, e.g. a tax breakdown. */
  detail?: string;
}

export interface SummaryRow {
  label: string;
  value: string;
  /** Second line, rendered muted (or red when `warn`). */
  detail?: string;
  warn?: boolean;
  accent?: boolean;
}

export type ChatEvent =
  | { kind: "agent"; text: string }
  | { kind: "user"; text: string }
  /** A centred status chip, e.g. "Topic invoked". */
  | { kind: "system"; text: string; tone?: "accent" | "ok" | "bad" | "warn" }
  | { kind: "file"; files: { name: string; size: string }[] }
  | { kind: "ocr"; title: string; fields: Field[] }
  | {
      kind: "cap";
      city: string;
      tier: string;
      cap: number;
      claimed: number;
      /** Footnote shown under the bar, e.g. the worked examples. */
      footnote?: string;
    }
  | { kind: "summary"; title: string; rows: SummaryRow[]; documents: string[] }
  /** The MCP call to the backend. Drives the pulsing badge. */
  | {
      kind: "api";
      label: string;
      endpoint: string;
      ok: boolean;
      /** Result text after the call; defaults to an HTTP-style status. */
      okText?: string;
      failText?: string;
    }
  | {
      kind: "end";
      tone: EndTone;
      title: string;
      detail: string;
      requestId?: string;
      /** Status trail under the ID, e.g. ["Submitted", "Pending RM Approval"]. */
      status?: string[];
      /** Buttons offered with the result, e.g. ["Reduce to 1 day", "Cancel"]. */
      actions?: string[];
    }
  /** Balance tiles that count up, e.g. leave balances. `value: null` shows "N/A". */
  | { kind: "balance"; title: string; items: { label: string; value: number | null; detail?: string }[] }
  /** A picker the agent offers; `selected` is highlighted as the user's pick. */
  | { kind: "choice"; title: string; options: string[]; selected?: string }
  /** Guidelines or rules the agent shows before asking for input. */
  | { kind: "info"; title: string; lines: string[] }
  /** A date range. Within one month it draws a calendar; otherwise two date tiles. */
  | {
      kind: "dates";
      start: string;
      end: string;
      days: number;
      caption?: string;
      /** An already-approved leave to draw on the calendar, e.g. for an overlap. */
      existing?: { start: string; end: string; label: string };
    }
  /** A validation checklist; items resolve one at a time. */
  | { kind: "checks"; title: string; items: { label: string; detail?: string; state: "ok" | "bad" | "warn" }[] };

export type ChatEventKind = ChatEvent["kind"];

/* -------------------------------------------------------------- scenarios */

export interface Beat {
  /** The node this beat lands on. */
  node: string;
  /** The edge travelled to get here (omitted for the first beat). */
  via?: string;
  /** Short line written onto the node once it's reached, e.g. "Hyderabad · ₹15,000". */
  note?: string;
  /** Colour for the note; accent by default. */
  noteTone?: "bad" | "warn";
  events: ChatEvent[];
}

/** One agent: its flowchart and the scenarios that play through it. */
export interface Flow {
  id: string;
  /** Shown as the page title, e.g. "Creche Reimbursement". */
  title: string;
  /** Shown under the agent's name in the chat header. */
  topic: string;
  workflow: Workflow;
  scenarios: Scenario[];
}

export interface Scenario {
  id: string;
  label: string;
  /** One line under the title, describing what this scenario shows. */
  blurb: string;
  beats: Beat[];
}
