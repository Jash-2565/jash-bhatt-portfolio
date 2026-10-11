import type { FlowEdge, FlowNode, Workflow } from "../../engine/types";
import { COL_A, COL_B, LANE_A, LANE_B, ROWS, VIEWBOX, bridge, down, fan, side, step, toLane } from "../layout";

// FTC Bot, Module 1: Apply for Leave (BRD §5.2), with the FTCE check and
// Chroma error handling from the cross-cutting requirements (§9).

const nodes: FlowNode[] = [
  step("auth", 1, "Apply leave", "Bot authenticates the FTCE", true),
  step("balance", 2, "Leave balance", "Fetched live from Chroma FTC"),
  step("type", 3, "Leave type", "PL · SL · CL · LWP · Maternity"),
  step("dates", 4, "Leave dates", "Duration calculated in days"),
  step("validate", 5, "Validation", "Balance, caps, overlap, blocks", true),
  step("docs", 6, "Supporting documents", "Only when a rule needs one"),
  step("reason", 7, "Reason", "FTCE describes the leave"),
  step("summary", 8, "Summary card", "Type, dates, duration, balance"),
  step("confirm", 9, "Confirm & submit", "FTCE clicks Submit"),
  step("push", 10, "Push to Chroma FTC", "Leave request via MCP", true),

  side({ id: "end-not-ftc", kind: "end", tone: "reject", title: "Blocked", subtitle: "Not an FTC employee", x: LANE_A, y: ROWS[0] }),
  side({ id: "end-blocked", kind: "end", tone: "reject", title: "Blocked", subtitle: "Rule explained in chat", x: LANE_A, y: ROWS[4] }),
  side({ id: "end-success", kind: "end", tone: "success", title: "LEV ID issued", subtitle: "Pending RM approval", x: LANE_B, y: 610 }),
  side({ id: "end-fail", kind: "end", tone: "error", title: "Not submitted", subtitle: "Chroma FTC unavailable", x: LANE_B, y: 700 }),
];

const edges: FlowEdge[] = [
  down("e-auth-balance", "auth", "balance", COL_A, 0, "FTCE verified"),
  toLane("e-auth-not-ftc", "auth", "end-not-ftc", "A", ROWS[0]),
  down("e-balance-type", "balance", "type", COL_A, 1),
  down("e-type-dates", "type", "dates", COL_A, 2),
  down("e-dates-validate", "dates", "validate", COL_A, 3),
  toLane("e-validate-blocked", "validate", "end-blocked", "A", ROWS[4]),
  bridge("e-validate-docs", "validate", "docs", "All rules pass"),
  down("e-docs-reason", "docs", "reason", COL_B, 0),
  down("e-reason-summary", "reason", "summary", COL_B, 1),
  down("e-summary-confirm", "summary", "confirm", COL_B, 2),
  down("e-confirm-push", "confirm", "push", COL_B, 3, "Submitted"),
  fan("e-push-success", "push", "end-success", 635, 610),
  fan("e-push-fail", "push", "end-fail", 665, 700),
];

export const workflow: Workflow = {
  viewBox: VIEWBOX,
  nodes,
  edges,
  steps: [
    "Apply leave",
    "Balance",
    "Leave type",
    "Dates",
    "Validation",
    "Documents",
    "Reason",
    "Summary",
    "Submit",
    "Chroma FTC",
  ],
  apiBadge: { x: COL_B, y: 752, w: 210, h: 34, label: "MCP → CHROMA FTC", anchor: "push" },
  outcomeLabels: { success: "Leave applied", reject: "Blocked" },
};
