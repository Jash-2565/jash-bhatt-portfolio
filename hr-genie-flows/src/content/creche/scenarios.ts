import type { Beat, ChatEvent, Scenario } from "../../engine/types";

// Every scenario walks the same steps with different inputs, so the shared
// beats are small builders over a claim profile. A scenario is the profile
// plus where it leaves the happy path.

const TODAY = "22 May 2026";
const TIER_1 = ["Mumbai", "Pune", "Delhi", "Bangalore", "Chennai", "Hyderabad"];
const CAP = { "Tier 1": 15000, "Tier 2": 10000 } as const;

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

interface Claim {
  creche: string;
  city: string;
  invoiceNo: string;
  invoiceDate: string;
  child: string;
  parent: string;
  /** Age as written on the summary, e.g. "2 Years". */
  age: string;
  base: number;
  gst: number;
  file: string;
}

const tierOf = (city: string) => (TIER_1.includes(city) ? "Tier 1" : "Tier 2");
const total = (c: Claim) => c.base + c.gst;
const capOf = (c: Claim) => CAP[tierOf(c.city)];
const allowed = (c: Claim) => Math.min(total(c), capOf(c));
const firstName = (c: Claim) => c.child.split(" ")[0];

const vivaan: Claim = {
  creche: "Little Sprouts Creche",
  city: "Hyderabad",
  invoiceNo: "LSC-2026-05-12",
  invoiceDate: "10 May 2026",
  child: "Vivaan Sharma",
  parent: "Ananya Sharma",
  age: "2 Years",
  base: 18150,
  gst: 3267,
  file: "little-sprouts-invoice-may.pdf",
};

/* ------------------------------------------------------------ the beats */

const trigger = (): Beat => ({
  node: "trigger",
  events: [
    { kind: "user", text: "I want to claim creche" },
    { kind: "system", text: "Topic invoked · Creche Reimbursement", tone: "accent" },
  ],
});

const crecheType = (empanelled: boolean): Beat => ({
  node: "type",
  via: "e-trigger-type",
  note: empanelled ? "Company-empanelled" : "Non-empanelled",
  noteTone: empanelled ? "warn" : undefined,
  events: [
    {
      kind: "agent",
      text: "Happy to help with your creche reimbursement. Is your child's creche company-empanelled or non-empanelled?",
    },
    { kind: "user", text: empanelled ? "Company-empanelled" : "Non-empanelled" },
  ],
});

const upload = (c: Claim): Beat => ({
  node: "upload",
  via: "e-type-upload",
  events: [
    { kind: "agent", text: "Got it. Please upload your creche invoice." },
    { kind: "file", files: [{ name: c.file, size: "1 page · 412 KB" }] },
  ],
});

const ocr = (c: Claim): Beat => ({
  node: "ocr",
  via: "e-upload-ocr",
  note: "7 fields extracted",
  events: [
    { kind: "system", text: "Reading invoice · OCR" },
    {
      kind: "ocr",
      title: "Extracted from invoice",
      fields: [
        { label: "Creche name", value: c.creche },
        { label: "City", value: c.city },
        { label: "Invoice number", value: c.invoiceNo },
        { label: "Invoice date", value: c.invoiceDate },
        { label: "Child name", value: c.child },
        { label: "Parent name", value: c.parent },
        {
          label: "Total amount",
          value: rupees(total(c)),
          detail: `${rupees(c.base)} + 18% GST ${rupees(c.gst)}`,
        },
      ],
    },
  ],
});

const dateOk = (c: Claim): Beat => ({
  node: "date",
  via: "e-ocr-date",
  note: `${c.invoiceDate} ✓`,
  events: [
    {
      kind: "system",
      text: `Invoice dated ${c.invoiceDate} · within 2 months of ${TODAY}`,
      tone: "ok",
    },
  ],
});

const cityCap = (c: Claim): Beat => {
  const over = total(c) > capOf(c);
  return {
    node: "city",
    via: "e-date-city",
    note: `${c.city} · cap ${rupees(capOf(c))}`,
    events: [
      {
        kind: "cap",
        city: c.city,
        tier: tierOf(c.city),
        cap: capOf(c),
        claimed: total(c),
        footnote:
          "Tier 1 (Mumbai, Pune, Delhi, Bangalore, Chennai, Hyderabad) ₹15,000/mo · Tier 2 (all other cities) ₹10,000/mo. e.g. ₹12,000 in Pune → ₹12,000 · ₹14,000 in Jaipur → ₹10,000",
      },
      {
        kind: "agent",
        text: over
          ? `${c.city} is a ${tierOf(c.city)} city, so the monthly cap is ${rupees(capOf(c))}. Your invoice is ${rupees(total(c))}, so ${rupees(capOf(c))} can be reimbursed.`
          : `${c.city} is a ${tierOf(c.city)} city with a ${rupees(capOf(c))} monthly cap. Your ${rupees(total(c))} is within it, so the full amount can be reimbursed.`,
      },
    ],
  };
};

const ageDocs = (c: Claim): ChatEvent[] => [
  {
    kind: "agent",
    text: "Next, please upload your child's birth certificate and the creche registration certificate.",
  },
  {
    kind: "file",
    files: [
      { name: `birth-certificate-${firstName(c).toLowerCase()}.pdf`, size: "1 page · 286 KB" },
      { name: "creche-registration.pdf", size: "2 pages · 534 KB" },
    ],
  },
];

/** Step 7: collect the certificates and read the child's age. */
const ageCheck = (c: Claim, verdict: string, tone: "ok" | "warn" | "bad"): Beat => ({
  node: "age",
  via: "e-city-age",
  note: `${c.age.toLowerCase()}${tone === "bad" ? " ✗" : tone === "warn" ? " · daycare" : " · creche"}`,
  noteTone: tone === "ok" ? undefined : tone,
  events: [
    ...ageDocs(c),
    { kind: "system", text: `Child's age ${c.age.toLowerCase()} · ${verdict}`, tone },
  ],
});

const ageOk = (c: Claim) => ageCheck(c, "standard creche claim", "ok");

const summary = (c: Claim, via = "e-age-summary", claimType?: string): Beat => {
  const over = total(c) - allowed(c);
  return {
    node: "summary",
    via,
    events: [
      { kind: "agent", text: "Here's your claim summary. Please review it before I submit." },
      {
        kind: "summary",
        title: "Claim summary",
        rows: [
          { label: "Creche type", value: "Non-empanelled" },
          ...(claimType ? [{ label: "Claim type", value: claimType }] : []),
          { label: "Creche name", value: c.creche },
          { label: "City cap", value: c.city, detail: `${tierOf(c.city)} cap ${rupees(capOf(c))}` },
          { label: "Invoice no. & date", value: `${c.invoiceNo} | ${c.invoiceDate}` },
          { label: "Child", value: `${c.child} | ${c.age}` },
          { label: "Claimed amount", value: rupees(total(c)) },
          {
            label: "Allowed amount",
            value: rupees(allowed(c)),
            accent: true,
            ...(over > 0
              ? { detail: `${rupees(over)} over cap will not be reimbursed`, warn: true }
              : { detail: "Full amount reimbursed" }),
          },
        ],
        documents: ["Invoice", "Creche Registration Certificate", "Birth Certificate"],
      },
    ],
  };
};

const confirm = (): Beat => ({
  node: "confirm",
  via: "e-summary-confirm",
  note: "Approved by employee",
  events: [
    { kind: "agent", text: "Shall I submit this claim?" },
    { kind: "user", text: "Yes, submit it" },
  ],
});

const submit = (ok: boolean): Beat => ({
  node: "submit",
  via: "e-confirm-submit",
  events: [
    { kind: "api", label: "MCP → CHROMA API", endpoint: "POST /claims/creche", ok },
  ],
});

const success = (c: Claim, requestId: string): Beat => ({
  node: "end-success",
  via: "e-submit-success",
  events: [
    {
      kind: "end",
      tone: "success",
      title: "Claim submitted",
      detail: `${rupees(allowed(c))} will be reimbursed with your next payroll.`,
      requestId,
    },
    { kind: "agent", text: `All done. Keep Request ID ${requestId} to track your claim.` },
  ],
});

const failure = (): Beat => ({
  node: "end-fail",
  via: "e-submit-fail",
  events: [
    {
      kind: "end",
      tone: "error",
      title: "Claim not submitted",
      detail: "Due to an error on the backend, your claim was not submitted",
    },
    { kind: "agent", text: "Something went wrong on our side, so your claim hasn't been submitted. Please try again later." },
  ],
});

/** Steps 1–6, which every scenario that gets past the invoice shares. */
const throughCity = (c: Claim): Beat[] => [
  trigger(),
  crecheType(false),
  upload(c),
  ocr(c),
  dateOk(c),
  cityCap(c),
];

/** Steps 8–10 into submission. */
const toSubmit = (c: Claim, ok: boolean, via?: string, claimType?: string): Beat[] => [
  summary(c, via, claimType),
  confirm(),
  submit(ok),
];

const ageReject = (c: Claim, verdict: string, node: string, via: string, why: string): Beat[] => [
  ageCheck(c, verdict, "bad"),
  {
    node,
    via,
    events: [{ kind: "end", tone: "reject", title: "Claim auto-rejected", detail: why }],
  },
];

/* ------------------------------------------------------------ scenarios */

const pune: Claim = {
  ...vivaan,
  creche: "Tiny Steps Creche",
  city: "Pune",
  invoiceNo: "TSC-0526-118",
  invoiceDate: "14 May 2026",
  child: "Myra Kulkarni",
  parent: "Rohan Kulkarni",
  age: "4 Years",
  base: 10170,
  gst: 1830,
  file: "tiny-steps-invoice-may.pdf",
};

const jaipur: Claim = {
  ...vivaan,
  creche: "Rainbow Kids Creche",
  city: "Jaipur",
  invoiceNo: "RKC/26/0419",
  invoiceDate: "5 May 2026",
  child: "Ishaan Rathore",
  parent: "Kavya Rathore",
  age: "3 Years",
  base: 11864,
  gst: 2136,
  file: "rainbow-kids-invoice.pdf",
};

export const scenarios: Scenario[] = [
  {
    id: "happy",
    label: "Happy path",
    blurb: "Hyderabad · ₹21,417 capped to ₹15,000 · submitted with a Request ID",
    beats: [
      ...throughCity(vivaan),
      ageOk(vivaan),
      ...toSubmit(vivaan, true),
      success(vivaan, "CR-2026-048213"),
    ],
  },
  {
    id: "empanelled",
    label: "Empanelled creche",
    blurb: "Company-empanelled creches: the employee is told to contact administration",
    beats: [
      trigger(),
      crecheType(true),
      {
        node: "end-admin",
        via: "e-type-admin",
        events: [
          {
            kind: "agent",
            text: "Empanelled creche claims are handled by the administration team. Please contact them directly.",
          },
          {
            kind: "end",
            tone: "redirect",
            title: "Contact administration",
            detail: "Company-empanelled creches are handled by administration",
          },
        ],
      },
    ],
  },
  {
    id: "stale",
    label: "Invoice too old",
    blurb: "An invoice older than 2 months is auto-rejected",
    beats: [
      trigger(),
      crecheType(false),
      upload(vivaan),
      ocr({ ...vivaan, invoiceNo: "LSC-2026-02-09", invoiceDate: "12 Feb 2026" }),
      {
        node: "date",
        via: "e-ocr-date",
        note: "12 Feb 2026 ✗",
        noteTone: "bad",
        events: [
          { kind: "system", text: `Invoice dated 12 Feb 2026 · more than 2 months before ${TODAY}`, tone: "bad" },
        ],
      },
      {
        node: "end-stale",
        via: "e-date-stale",
        events: [
          {
            kind: "end",
            tone: "reject",
            title: "Claim auto-rejected",
            detail: "Invoices older than 2 months can't be reimbursed",
          },
        ],
      },
    ],
  },
  {
    id: "infant",
    label: "Child under 6 months",
    blurb: "Creche claims start at 6 months of age",
    beats: [
      ...throughCity({ ...vivaan, base: 11017, gst: 1983 }),
      ...ageReject(
        { ...vivaan, age: "4 Months" },
        "under 6 months",
        "end-infant",
        "e-age-infant",
        "Creche reimbursement starts once the child is 6 months old",
      ),
    ],
  },
  {
    id: "daycare",
    label: "Child 6–9 years",
    blurb: "Flagged as a daycare claim and confirmed by the employee",
    beats: (() => {
      const c: Claim = {
        ...vivaan,
        creche: "Bright Minds Daycare",
        city: "Chennai",
        invoiceNo: "BMD-2605-077",
        invoiceDate: "8 May 2026",
        child: "Aarav Iyer",
        parent: "Meera Iyer",
        age: "7 Years",
        base: 8305,
        gst: 1495,
        file: "bright-minds-invoice.pdf",
      };
      return [
        ...throughCity(c),
        ageCheck(c, "flagged as daycare claim", "warn"),
        {
          node: "daycare",
          via: "e-age-daycare",
          events: [
            {
              kind: "agent",
              text: "Aarav is 7, so this will be filed as a daycare claim rather than creche. Do you want to continue?",
            },
            { kind: "user", text: "Yes, file it as daycare" },
          ],
        },
        ...toSubmit(c, true, "e-daycare-summary", "Daycare (6–9 years)"),
        success(c, "CR-2026-048377"),
      ];
    })(),
  },
  {
    id: "over10",
    label: "Child 10+ years",
    blurb: "Children aged 10 and above aren't eligible",
    beats: [
      ...throughCity(vivaan),
      ...ageReject(
        { ...vivaan, age: "11 Years" },
        "10 years or older",
        "end-over10",
        "e-age-over10",
        "Children aged 10 and above aren't eligible for creche or daycare claims",
      ),
    ],
  },
  {
    id: "backend-fail",
    label: "Backend failure",
    blurb: "The CHROMA API call fails, so nothing is submitted",
    beats: [...throughCity(vivaan), ageOk(vivaan), ...toSubmit(vivaan, false), failure()],
  },
  {
    id: "under-cap",
    label: "Under-cap claim",
    blurb: "Pune · ₹12,000 is within the Tier 1 cap and reimbursed in full",
    beats: [...throughCity(pune), ageOk(pune), ...toSubmit(pune, true), success(pune, "CR-2026-048290")],
  },
  {
    id: "tier-2",
    label: "Tier 2 over cap",
    blurb: "Jaipur · ₹14,000 is capped to the Tier 2 limit of ₹10,000",
    beats: [...throughCity(jaipur), ageOk(jaipur), ...toSubmit(jaipur, true), success(jaipur, "CR-2026-048301")],
  },
];
