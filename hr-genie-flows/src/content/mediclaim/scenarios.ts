import type { Beat, Scenario } from "../../engine/types";

// Mediclaim card retrieval. The employee asks for their own card or their
// parent's; the agent reads their details, fetches that card from Azure Blob
// Storage with a custom API, and emails it to them. The employee and file
// names are illustrative.

const employee = { name: "Aarav Mehta", code: "E10482", email: "aarav.mehta@company.com" };

interface Request {
  /** What the employee types to start the topic. */
  ask: string;
  route: "e-self" | "e-parent";
  whose: string;
  file: string;
}

const trigger = (r: Request): Beat => ({
  node: "trigger",
  note: r.whose,
  events: [
    { kind: "user", text: r.ask },
    { kind: "system", text: "Topic invoked · Mediclaim", tone: "accent" },
    { kind: "system", text: `Card requested · ${r.whose}`, tone: "ok" },
  ],
});

const details = (r: Request): Beat => ({
  node: "details",
  via: r.route,
  note: `${employee.code} · ${employee.email}`,
  events: [
    {
      kind: "ocr",
      title: "Employee details",
      fields: [
        { label: "Name", value: employee.name },
        { label: "Employee code", value: employee.code },
        { label: "Email ID", value: employee.email },
      ],
    },
  ],
});

const retrieve = (r: Request): Beat => ({
  node: "retrieve",
  via: "e-details-retrieve",
  note: r.file,
  events: [
    { kind: "api", label: "CUSTOM API → AZURE BLOB", endpoint: `${employee.code} · ${r.whose.toLowerCase()}`, ok: true, okText: "· Card found" },
    { kind: "file", fetched: true, files: [{ name: r.file, size: "PDF · 310 KB" }] },
  ],
});

const send = (): Beat => ({
  node: "send",
  via: "e-retrieve-send",
  note: `To ${employee.email}`,
  events: [{ kind: "api", label: "EMAIL", endpoint: employee.email, ok: true, okText: "· Sent" }],
});

const close = (r: Request): Beat => ({
  node: "close",
  via: "e-send-close",
  events: [{ kind: "agent", text: `Your ${r.route === "e-parent" ? "parent's " : ""}Mediclaim has been sent on your email.` }],
});

const play = (r: Request): Beat[] => [trigger(r), details(r), retrieve(r), send(), close(r)];

export const scenarios: Scenario[] = [
  {
    id: "self",
    label: "My Mediclaim",
    blurb: "The employee's own card, fetched and emailed",
    beats: play({ ask: "I want my Mediclaim", route: "e-self", whose: "Self", file: `Mediclaim_${employee.code}_Self.pdf` }),
  },
  {
    id: "parent",
    label: "Parent's Mediclaim",
    blurb: "The employee's parent's card, fetched and emailed",
    beats: play({ ask: "I want my parent's Mediclaim", route: "e-parent", whose: "Parent", file: `Mediclaim_${employee.code}_Parent.pdf` }),
  },
];
