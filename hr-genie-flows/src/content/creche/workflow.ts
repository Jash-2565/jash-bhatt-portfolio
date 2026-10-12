import type { FlowEdge, FlowNode, Workflow } from "../../engine/types";
import { COL_A, COL_B, LANE_A, LANE_B, ROWS, SIDE, VIEWBOX, bRight, bridge, down, fan, side, step, toLane } from "../layout";

const nodes: FlowNode[] = [
  step("trigger", 1, "Trigger", "“I want to claim creche”"),
  step("type", 2, "Creche type check", "Empanelled or not?", true),
  step("upload", 3, "Invoice upload", "Agent asks for the invoice"),
  step("ocr", 4, "OCR extraction", "Reads the invoice fields"),
  step("date", 5, "Invoice date check", "Within the last 2 months?", true),
  step("city", 6, "City-based cap", "Tier 1 ₹15,000 · Tier 2 ₹10,000", true),
  step("age", 7, "Child age check", "From the birth certificate", true),
  step("summary", 8, "Final summary", "Shown before submission"),
  step("confirm", 9, "User confirmation", "Employee approves the claim"),
  step("submit", 10, "Submission", "CHROMA API via MCP", true),

  side({ id: "end-admin", kind: "end", tone: "redirect", title: "Contact admin", subtitle: "Company-empanelled", x: LANE_A, y: ROWS[1] }),
  side({ id: "end-stale", kind: "end", tone: "reject", title: "Auto-rejected", subtitle: "Invoice > 2 months old", x: LANE_A, y: ROWS[4] }),
  side({ id: "end-infant", kind: "end", tone: "reject", title: "Auto-rejected", subtitle: "Child under 6 months", x: LANE_B, y: 140 }),
  side({ id: "end-over10", kind: "end", tone: "reject", title: "Auto-rejected", subtitle: "Child 10 years or older", x: LANE_B, y: 215 }),
  side({ id: "daycare", kind: "branch", step: 7, title: "Daycare claim", subtitle: "6–10 yrs · user confirms", x: LANE_B, y: 290 }),
  side({ id: "end-success", kind: "end", tone: "success", title: "Request ID issued", subtitle: "Claim submitted", x: LANE_B, y: 610 }),
  side({ id: "end-fail", kind: "end", tone: "error", title: "Not submitted", subtitle: "Backend error", x: LANE_B, y: 700 }),
];

const edges: FlowEdge[] = [
  down("e-trigger-type", "trigger", "type", COL_A, 0),
  down("e-type-upload", "type", "upload", COL_A, 1, "Non-empanelled"),
  toLane("e-type-admin", "type", "end-admin", "A", ROWS[1]),
  down("e-upload-ocr", "upload", "ocr", COL_A, 2),
  down("e-ocr-date", "ocr", "date", COL_A, 3),
  toLane("e-date-stale", "date", "end-stale", "A", ROWS[4]),
  bridge("e-date-city", "date", "city", "Within 2 months"),
  down("e-city-age", "city", "age", COL_B, 0),
  down("e-age-summary", "age", "summary", COL_B, 1, "6 mo – 6 yrs"),
  fan("e-age-infant", "age", "end-infant", 200, 140),
  toLane("e-age-over10", "age", "end-over10", "B", 215),
  fan("e-age-daycare", "age", "daycare", 230, 290),
  { id: "e-daycare-summary", from: "daycare", to: "summary", points: [[LANE_B, 290 + SIDE.h / 2], [LANE_B, ROWS[2]], [bRight, ROWS[2]]] },
  down("e-summary-confirm", "summary", "confirm", COL_B, 2),
  down("e-confirm-submit", "confirm", "submit", COL_B, 3, "Confirmed"),
  fan("e-submit-success", "submit", "end-success", 635, 610),
  fan("e-submit-fail", "submit", "end-fail", 665, 700),
];

export const workflow: Workflow = {
  viewBox: VIEWBOX,
  nodes,
  edges,
  steps: [
    "Trigger",
    "Creche type",
    "Upload",
    "OCR",
    "Invoice date",
    "City cap",
    "Child age",
    "Summary",
    "Confirm",
    "Submit",
  ],
  apiBadge: { x: COL_B, y: 752, w: 210, h: 34, label: "MCP → CHROMA API", anchor: "submit" },
};
