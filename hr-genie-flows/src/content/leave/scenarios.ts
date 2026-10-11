import type { Beat, ChatEvent, Scenario } from "../../engine/types";

// FTC Bot, Apply Leave. Each scenario follows a flow from the BRD: the
// positive flows in §5.4–5.7, the CL cap alternate flow in §5.8, validation
// rules 6 and 7 from §5.3, and the FTCE check and Chroma outage from §9.
// Dates, balances, request IDs and messages are the BRD's own examples.

type LeaveType = "PL" | "SL" | "CL" | "LWP" | "Maternity";

const TYPE_LABEL: Record<LeaveType, string> = {
  PL: "Privileged Leave (PL)",
  SL: "Sick Leave (SL)",
  CL: "Casual Leave (CL)",
  LWP: "Leave Without Pay (LWP)",
  Maternity: "Maternity Leave",
};

// Type-specific guidelines the bot shows on selection (§5.2 req 5, §5.4–5.7).
const GUIDELINES: Record<LeaveType, string[]> = {
  PL: ["Mandatory vacation: 7 days to be availed in blocks of min 3 or 4 days"],
  SL: ["Medical certificate required for >3 consecutive days"],
  CL: ["CL max 3 consecutive days", "Maximum 3 CL days allowed per month"],
  LWP: ["Requires RM approval email attachment", "Only once PL, SL and CL are exhausted"],
  Maternity: ["26 weeks max.", "30-day prior intimation to HRP is required.", "Doctor's certificate mandatory."],
};

type Balance = { PL: number; SL: number; CL: number };
const FULL: Balance = { PL: 12.0, SL: 6.0, CL: 4.5 };

type Check = Extract<ChatEvent, { kind: "checks" }>["items"][number];

interface Leave {
  type: LeaveType;
  /** ISO dates for the calendar, plus the BRD's short form for text. */
  start: string;
  end: string;
  from: string;
  to: string;
  days: number;
  balance: Balance;
  checks: Check[];
  reason: string;
  /** Documents the rules require, with the bot's ask. */
  docs?: { ask: string; files: { name: string; size: string }[]; chip: string };
  summary: { label: string; value: string; detail?: string; accent?: boolean }[];
  requestId: string;
  status: string[];
  /** The bot's success message, verbatim from the BRD. */
  done: string;
}

const fmt = (n: number) => n.toFixed(1);

/* ------------------------------------------------------------ the beats */

const auth = (ftc = true): Beat => ({
  node: "auth",
  note: ftc ? "Fixed Term Contract" : "Permanent employee",
  noteTone: ftc ? undefined : "bad",
  events: [
    { kind: "user", text: "Apply leave" },
    { kind: "system", text: "Topic invoked · Apply Leave", tone: "accent" },
    ftc
      ? { kind: "system", text: "Authenticated · Fixed Term Contract Employee", tone: "ok" }
      : { kind: "system", text: "Not found in the Chroma FTC instance · permanent employee", tone: "bad" },
  ],
});

const balance = (b: Balance): Beat => ({
  node: "balance",
  via: "e-auth-balance",
  note: `PL ${fmt(b.PL)} · SL ${fmt(b.SL)} · CL ${fmt(b.CL)}`,
  events: [
    { kind: "system", text: "Fetching real-time balance · Chroma FTC" },
    {
      kind: "balance",
      title: "Your leave balance",
      items: [
        { label: "PL", value: b.PL, detail: "Privileged" },
        { label: "SL", value: b.SL, detail: "Sick" },
        { label: "CL", value: b.CL, detail: "Casual" },
        { label: "LWP", value: null, detail: "Without pay" },
      ],
    },
  ],
});

const leaveType = (t: LeaveType): Beat => ({
  node: "type",
  via: "e-balance-type",
  note: TYPE_LABEL[t],
  events: [
    { kind: "agent", text: "Which type of leave would you like to apply for?" },
    { kind: "choice", title: "Leave type", options: Object.values(TYPE_LABEL), selected: TYPE_LABEL[t] },
    { kind: "info", title: `${t === "Maternity" ? "Maternity" : t} guidelines`, lines: GUIDELINES[t] },
  ],
});

const dates = (l: Leave, existing?: { start: string; end: string; label: string }): Beat => ({
  node: "dates",
  via: "e-type-dates",
  note: `${l.from} → ${l.to} · ${l.days} days`,
  events:
    l.type === "Maternity"
      ? [
          { kind: "agent", text: "Select your expected delivery date. I'll fill in the leave dates from it." },
          { kind: "user", text: "Expected delivery: 15-Aug" },
          { kind: "dates", start: l.start, end: l.end, days: l.days, caption: "Auto-populated · 26 weeks" },
        ]
      : [
          { kind: "agent", text: "Select your start date and end date." },
          { kind: "dates", start: l.start, end: l.end, days: l.days, existing },
        ],
});

const validate = (l: Leave, pass: boolean): Beat => ({
  node: "validate",
  via: "e-dates-validate",
  note: pass ? `${l.checks.length} checks passed` : `✗ ${l.checks.find((c) => c.state === "bad")?.label}`,
  noteTone: pass ? undefined : "bad",
  events: [{ kind: "checks", title: "Validating against Chroma FTC", items: l.checks }],
});

const docs = (l: Leave): Beat => ({
  node: "docs",
  via: "e-validate-docs",
  note: l.docs ? `${l.docs.files.length} file${l.docs.files.length > 1 ? "s" : ""} uploaded` : "Not required",
  events: l.docs
    ? [
        { kind: "agent", text: l.docs.ask },
        { kind: "file", files: l.docs.files },
        { kind: "system", text: "File validated ✓ · PDF/JPG/PNG, max 5 MB", tone: "ok" },
      ]
    : [{ kind: "system", text: `No supporting documents needed for ${l.type}` }],
});

const reason = (l: Leave): Beat => ({
  node: "reason",
  via: "e-docs-reason",
  note: `“${l.reason}”`,
  events: [
    { kind: "agent", text: "Please enter a reason for your leave." },
    { kind: "user", text: l.reason },
  ],
});

const summary = (l: Leave): Beat => ({
  node: "summary",
  via: "e-reason-summary",
  events: [
    { kind: "agent", text: "Here's your leave request. Please review it before you submit." },
    {
      kind: "summary",
      title: "Leave summary",
      rows: [
        { label: "Leave type", value: TYPE_LABEL[l.type] },
        { label: "Dates", value: `${l.from} to ${l.to}` },
        { label: "Duration", value: `${l.days} days` },
        ...l.summary,
        { label: "Reason", value: l.reason },
      ],
      documents: l.docs ? [l.docs.chip] : [],
    },
  ],
});

const confirm = (): Beat => ({
  node: "confirm",
  via: "e-summary-confirm",
  note: "Submitted by FTCE",
  events: [{ kind: "user", text: "Submit" }],
});

const push = (ok: boolean): Beat => ({
  node: "push",
  via: "e-confirm-push",
  events: [
    {
      kind: "api",
      label: "MCP → CHROMA FTC",
      endpoint: "create leave request",
      ok,
      okText: "· Request created",
      failText: "· FTC system unavailable",
    },
  ],
});

const success = (l: Leave): Beat => ({
  node: "end-success",
  via: "e-push-success",
  events: [
    {
      kind: "end",
      tone: "success",
      title: l.type === "Maternity" ? "Maternity Leave Applied!" : "Leave Applied!",
      detail: `${l.type === "Maternity" ? "" : `${l.type} `}${l.days} days (${l.from} to ${l.to})`,
      requestId: l.requestId,
      status: l.status,
    },
    { kind: "agent", text: l.done },
  ],
});

const blocked = (detail: string, actions?: string[], lead?: string): Beat => ({
  node: "end-blocked",
  via: "e-validate-blocked",
  events: [
    ...(lead ? [{ kind: "agent", text: lead } as ChatEvent] : []),
    { kind: "end", tone: "reject", title: "Leave request blocked", detail, actions },
  ],
});

/** Steps 1–5 for a request that reaches validation. */
const throughValidation = (l: Leave, pass: boolean, existing?: { start: string; end: string; label: string }): Beat[] => [
  auth(),
  balance(l.balance),
  leaveType(l.type),
  dates(l, existing),
  validate(l, pass),
];

/** Steps 6–10. */
const toChroma = (l: Leave, ok: boolean): Beat[] => [docs(l), reason(l), summary(l), confirm(), push(ok)];

/* ------------------------------------------------------------ the leaves */

// §5.4
const pl: Leave = {
  type: "PL",
  start: "2026-06-15",
  end: "2026-06-18",
  from: "15-Jun",
  to: "18-Jun",
  days: 4,
  balance: FULL,
  checks: [
    { label: "Entitlement", detail: "PL 12.0 ≥ 4.0", state: "ok" },
    { label: "No overlap with approved leave", state: "ok" },
    { label: "Future date", state: "ok" },
    { label: "Holiday calendar checked", state: "ok" },
  ],
  reason: "Family function",
  summary: [{ label: "Balance after", value: "8.0 days", detail: "PL 12.0 → 8.0", accent: true }],
  requestId: "LEV2026001234",
  status: ["Submitted", "Pending RM Approval"],
  done: "✅ Leave Applied! LEV2026001234, PL 4 days (15-Jun to 18-Jun).",
};

// §5.5
const sl: Leave = {
  type: "SL",
  start: "2026-06-10",
  end: "2026-06-15",
  from: "10-Jun",
  to: "15-Jun",
  days: 6,
  balance: FULL,
  checks: [
    { label: "Entitlement", detail: "SL 6.0 ≥ 6.0", state: "ok" },
    { label: "More than 3 consecutive days", detail: "Medical certificate mandatory", state: "warn" },
    { label: "No overlap with approved leave", state: "ok" },
  ],
  reason: "Viral fever - admitted",
  docs: {
    ask: "Medical certificate mandatory for 6 days SL. Please upload.",
    files: [{ name: "doctors-certificate.pdf", size: "PDF · 1 MB" }],
    chip: "Medical Cert: Uploaded",
  },
  summary: [{ label: "Balance after", value: "0.0 days", detail: "SL 6.0 → 0.0", accent: true }],
  requestId: "LEV2026001235",
  status: ["Submitted", "Pending RM Approval"],
  done: "✅ Leave Applied! LEV2026001235, SL 6 days (10-Jun to 15-Jun). Medical certificate attached. Pending RM approval.",
};

// §5.6
const lwp: Leave = {
  type: "LWP",
  start: "2026-06-20",
  end: "2026-06-22",
  from: "20-Jun",
  to: "22-Jun",
  days: 3,
  balance: { PL: 0, SL: 0, CL: 0 },
  checks: [
    { label: "PL, SL and CL exhausted", detail: "PL 0 · SL 0 · CL 0", state: "ok" },
    { label: "No overlap with approved leave", state: "ok" },
    { label: "RM approval email", detail: "Required for LWP", state: "warn" },
  ],
  reason: "Personal emergency",
  docs: {
    ask: "LWP needs your RM's approval. Please upload the RM approval email.",
    files: [{ name: "rm-approval-email.pdf", size: "PDF · 220 KB" }],
    chip: "RM Approval: Attached",
  },
  summary: [],
  requestId: "LEV2026001236",
  status: ["Submitted", "Pending RM Approval"],
  done: "✅ Leave Applied! LEV2026001236, LWP 3 days (20-Jun to 22-Jun). Pending RM approval.",
};

// §5.7
const maternity: Leave = {
  type: "Maternity",
  start: "2026-08-01",
  end: "2027-01-31",
  from: "01-Aug",
  to: "31-Jan",
  days: 182,
  balance: FULL,
  checks: [
    { label: "Eligible", detail: "Female FTCE", state: "ok" },
    { label: "Within 26 weeks", detail: "182 days", state: "ok" },
    { label: "Doctor's certificate", detail: "Mandatory for maternity leave", state: "warn" },
    { label: "No overlap with approved leave", state: "ok" },
  ],
  reason: "Maternity - first child",
  docs: {
    ask: "Please upload your doctor's certificate and proof of the expected delivery date.",
    files: [
      { name: "doctors-certificate.pdf", size: "PDF · 640 KB" },
      { name: "expected-delivery-proof.pdf", size: "PDF · 410 KB" },
    ],
    chip: "Documents: 2 attached",
  },
  summary: [],
  requestId: "LEV2026001237",
  status: ["Submitted", "Pending RM Approval", "Pending HRP HR Approval"],
  done: "✅ Maternity Leave Applied! LEV2026001237, 182 days (01-Aug to 31-Jan). Pending RM and HRP HR approval.",
};

/* ------------------------------------------------------------ scenarios */

export const scenarios: Scenario[] = [
  {
    id: "pl",
    label: "Privileged Leave",
    blurb: "PL 4 days, 15–18 Jun · balance 12.0 → 8.0 · LEV2026001234",
    beats: [...throughValidation(pl, true), ...toChroma(pl, true), success(pl)],
  },
  {
    id: "sl",
    label: "Sick Leave over 3 days",
    blurb: "SL 6 days needs a medical certificate · LEV2026001235",
    beats: [...throughValidation(sl, true), ...toChroma(sl, true), success(sl)],
  },
  {
    id: "lwp",
    label: "Leave Without Pay",
    blurb: "All balances exhausted · RM approval email attached · LEV2026001236",
    beats: [...throughValidation(lwp, true), ...toChroma(lwp, true), success(lwp)],
  },
  {
    id: "maternity",
    label: "Maternity Leave",
    blurb: "26 weeks auto-populated from the delivery date · LEV2026001237",
    beats: [...throughValidation(maternity, true), ...toChroma(maternity, true), success(maternity)],
  },
  {
    id: "cl-cap",
    label: "CL over monthly cap",
    blurb: "2 CL days already taken in June · the request is blocked with options",
    beats: (() => {
      const cl: Leave = {
        ...pl,
        type: "CL",
        start: "2026-06-10",
        end: "2026-06-12",
        from: "10-Jun",
        to: "12-Jun",
        days: 3,
        balance: { ...FULL, CL: 2.5 },
        checks: [
          { label: "Within 3 consecutive CL days", detail: "3 days requested", state: "ok" },
          { label: "Monthly CL cap", detail: "2 days already availed in Jun", state: "bad" },
        ],
      };
      return [
        ...throughValidation(cl, false),
        blocked(
          "❌ Maximum 3 CL days allowed per month. You have already availed 2 days this month. This request exceeds by 2 days.",
          ["Reduce to 1 day", "Use PL instead", "Cancel"],
        ),
      ];
    })(),
  },
  {
    id: "lwp-balance",
    label: "LWP with balance left",
    blurb: "LWP is blocked while PL, SL or CL balance remains",
    beats: (() => {
      const l: Leave = {
        ...lwp,
        balance: FULL,
        checks: [{ label: "PL, SL and CL exhausted", detail: "PL 12.0 · SL 6.0 · CL 4.5 available", state: "bad" }],
      };
      return [
        ...throughValidation(l, false),
        blocked(
          "You have PL, SL and CL balance available. You cannot apply LWP if you have balance in PL/SL/CL.",
          undefined,
          "Leave is used in priority order: PL → CL → SL → LWP.",
        ),
      ];
    })(),
  },
  {
    id: "overlap",
    label: "Overlapping dates",
    blurb: "The dates clash with an approved leave",
    beats: (() => {
      const l: Leave = {
        ...pl,
        start: "2026-06-17",
        end: "2026-06-19",
        from: "17-Jun",
        to: "19-Jun",
        days: 3,
        balance: { ...FULL, PL: 8.0 },
        checks: [
          { label: "Entitlement", detail: "PL 8.0 ≥ 3.0", state: "ok" },
          { label: "Future date", state: "ok" },
          { label: "No overlap with approved leave", detail: "LEV2026001234 · 15-Jun to 18-Jun", state: "bad" },
        ],
      };
      return [
        ...throughValidation(l, false, { start: "2026-06-15", end: "2026-06-18", label: "Approved PL" }),
        blocked("You already have approved leave from 15-Jun to 18-Jun. Please select non-overlapping dates."),
      ];
    })(),
  },
  {
    id: "chroma-down",
    label: "Chroma FTC down",
    blurb: "Submission fails because the FTC system is unavailable",
    beats: [
      ...throughValidation(pl, true),
      ...toChroma(pl, false),
      {
        node: "end-fail",
        via: "e-push-fail",
        events: [
          {
            kind: "end",
            tone: "error",
            title: "Leave not submitted",
            detail: "FTC system temporarily unavailable. Please try later or contact HRP HR Team.",
          },
        ],
      },
    ],
  },
  {
    id: "not-ftc",
    label: "Not an FTC employee",
    blurb: "Permanent employee flows are blocked on the FTC bot",
    beats: [
      auth(false),
      {
        node: "end-not-ftc",
        via: "e-auth-not-ftc",
        events: [
          {
            kind: "end",
            tone: "reject",
            title: "Blocked",
            detail: "The FTC Bot serves Fixed Term Contract Employees only. Permanent employee flows are blocked.",
          },
        ],
      },
    ],
  },
];
