import type { EndTone } from "../engine/types";

export const TONE: Record<EndTone, { hex: string; fill: string; label: string }> = {
  success: { hex: "#4ade80", fill: "#0f2a1b", label: "Submitted" },
  reject: { hex: "#f87171", fill: "#2c1316", label: "Auto-rejected" },
  redirect: { hex: "#fbbf24", fill: "#2b220c", label: "Redirected" },
  error: { hex: "#f87171", fill: "#2c1316", label: "Not submitted" },
};
