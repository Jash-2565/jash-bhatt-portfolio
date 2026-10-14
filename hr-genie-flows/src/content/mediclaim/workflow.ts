import type { FlowEdge, FlowNode, Workflow } from "../../engine/types";
import { MAIN, ROWS, VIEWBOX, down } from "../layout";

// Mediclaim card retrieval. Five steps, so it gets a single centred column
// instead of the shared two-column grid. The fork at step 1 is two routes
// into the same next step: whose card was asked for only changes which file
// the API fetches. There's no terminal node: the flow ends on step 5.

const X = 500;
const W = 280;
const left = X - W / 2;
const right = X + W / 2;

const step = (id: string, n: number, title: string, subtitle: string, decision = false): FlowNode => ({
  id,
  kind: "step",
  step: n,
  title,
  subtitle,
  decision,
  x: X,
  y: ROWS[n - 1],
  w: W,
  h: MAIN.h,
});

const nodes: FlowNode[] = [
  step("trigger", 1, "Trigger", "Whose Mediclaim card?", true),
  step("details", 2, "Employee details", "Email ID and employee code"),
  step("retrieve", 3, "Retrieve card", "Custom API, by employee code"),
  step("send", 4, "Send card", "Emailed to the employee"),
  step("close", 5, "Close request", "Agent confirms in chat"),
];

/** Out one side of the trigger, down, and into the same side of step 2. */
const route = (id: string, side: "left" | "right", label: string): FlowEdge => {
  const edge = side === "left" ? left : right;
  const out = side === "left" ? left - 110 : right + 110;
  return {
    id,
    from: "trigger",
    to: "details",
    points: [
      [edge, ROWS[0]],
      [out, ROWS[0]],
      [out, ROWS[1]],
      [edge, ROWS[1]],
    ],
    label,
  };
};

const edges: FlowEdge[] = [
  route("e-self", "left", "My Mediclaim"),
  route("e-parent", "right", "Parent's Mediclaim"),
  down("e-details-retrieve", "details", "retrieve", X, 1),
  down("e-retrieve-send", "retrieve", "send", X, 2, "Card found"),
  down("e-send-close", "send", "close", X, 3, "Email sent"),
];

export const workflow: Workflow = {
  viewBox: VIEWBOX,
  nodes,
  edges,
  steps: ["Trigger", "Employee details", "Retrieve card", "Send email", "Close"],
  apiBadge: [
    { x: 830, y: ROWS[2], w: 240, h: 34, label: "CUSTOM API → AZURE BLOB", anchor: "retrieve" },
    { x: 830, y: ROWS[3], w: 240, h: 34, label: "EMAIL → EMPLOYEE", anchor: "send" },
  ],
  outcomeLabels: { success: "Card emailed" },
};
