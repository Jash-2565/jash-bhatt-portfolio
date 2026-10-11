import type { FlowEdge, FlowNode } from "../engine/types";

// Shared grid for every agent's flowchart: two columns of five main steps
// (1–5 left, 6–10 right), each with a lane of terminals beside it.
// Coordinates are centres in a 1000×800 viewBox.

export const VIEWBOX = { w: 1000, h: 800 };
export const COL_A = 150;
export const COL_B = 655;
export const LANE_A = 400;
export const LANE_B = 900;
export const ROWS = [70, 215, 360, 505, 650];

export const MAIN = { w: 250, h: 84 };
export const SIDE = { w: 170, h: 58 };

export const aRight = COL_A + MAIN.w / 2;
export const bRight = COL_B + MAIN.w / 2;
export const laneALeft = LANE_A - SIDE.w / 2;
export const laneBLeft = LANE_B - SIDE.w / 2;
/** x of the short vertical run when an edge fans out to several terminals. */
export const elbow = bRight + 17;

export const step = (
  id: string,
  n: number,
  title: string,
  subtitle: string,
  decision = false,
): FlowNode => ({
  id,
  kind: "step",
  step: n,
  title,
  subtitle,
  decision,
  x: n <= 5 ? COL_A : COL_B,
  y: ROWS[(n - 1) % 5],
  ...MAIN,
});

export const side = (node: Omit<FlowNode, "w" | "h">): FlowNode => ({ ...SIDE, ...node });

/** Straight drop from one main step to the next in the same column. */
export const down = (id: string, from: string, to: string, x: number, row: number, label?: string): FlowEdge => ({
  id,
  from,
  to,
  points: [
    [x, ROWS[row] + MAIN.h / 2],
    [x, ROWS[row + 1] - MAIN.h / 2],
  ],
  label,
});

/** Step 5 to step 6: bottom of column A, round the corner, up to the top of column B. */
export const bridge = (id: string, from: string, to: string, label?: string): FlowEdge => ({
  id,
  from,
  to,
  points: [
    [COL_A, ROWS[4] + MAIN.h / 2],
    [COL_A, 760],
    [505, 760],
    [505, ROWS[0]],
    [COL_B - MAIN.w / 2, ROWS[0]],
  ],
  label,
  labelAt: 0.02,
});

/** Straight out of a main step's right side into the terminal lane beside it. */
export const toLane = (id: string, from: string, to: string, column: "A" | "B", y: number): FlowEdge => ({
  id,
  from,
  to,
  points: [
    [column === "A" ? aRight : bRight, y],
    [column === "A" ? laneALeft : laneBLeft, y],
  ],
});

/** Out of a column-B step at `fromY`, along the elbow, into a lane-B terminal at `toY`. */
export const fan = (id: string, from: string, to: string, fromY: number, toY: number): FlowEdge => ({
  id,
  from,
  to,
  points: [
    [bRight, fromY],
    [elbow, fromY],
    [elbow, toY],
    [laneBLeft, toY],
  ],
});
