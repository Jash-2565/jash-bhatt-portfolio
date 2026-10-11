# HR Genie agent flows

Animated walkthroughs of HR Genie agents: **Creche Reimbursement** and
**Apply Leave** (FTC Bot, BRD Module 1). A flowchart of the 10 steps sits on
the left, the live chat on the right, and a progress bar runs along the
bottom. It's built on a fixed 1920×1080 stage for screen recording.

```bash
npm install
npm run dev        # http://localhost:5190  (creche)
                   # http://localhost:5190/?flow=leave
```

**Controls:** Space plays or pauses. ← and → step through beats. R restarts.
Keys 1–9 pick a scenario. The scenario is also in the URL
(`?scenario=stale`), and `?motion=reduced` forces reduced motion.

## On the portfolio

`npm run build:site` builds into `../public/demos/hr-genie-flows/`, and the
HR Genie case study embeds `creche.html` and `leave.html` from there. Those
two pages are `index.html` with `data-flow` set, so each one is pinned to a
single agent. Rebuild and commit the output after any change here.

## How it works

```
src/
  content/flows.ts      the agents: title, workflow, scenarios
  content/layout.ts     shared two-column grid and edge helpers
  content/<agent>/workflow.ts   nodes and edges   ← what the flowchart shows
  content/<agent>/scenarios.ts  beats + events    ← what each scenario plays
  engine/types.ts       the schema
  engine/timeline.ts    compiles a scenario to absolute times; state at time t
  engine/useClock.ts    play / pause / speed / seek
  components/           Flowchart, ChatPanel, cards, ProgressBar, Controls
scripts/export.mjs      MP4 / GIF / PNG export
```

A scenario is a list of **beats**. Each beat travels one edge (`via`) to one
node and then plays its chat **events** in order:

```ts
{
  node: "date",                 // node the beat lands on
  via: "e-ocr-date",            // edge travelled to get there
  note: "12 Feb 2026 ✗",        // optional line written onto the node
  noteTone: "bad",              // optional: "bad" | "warn"
  events: [
    { kind: "system", text: "Invoice is more than 2 months old", tone: "bad" },
  ],
}
```

Event kinds: `agent`, `user`, `system`, `file`, `ocr`, `cap`, `summary`, `api`,
`end`, `balance`, `choice`, `info`, `dates` and `checks`. They're all defined in `engine/types.ts`, and their durations are in
`eventDuration()` in `engine/timeline.ts`.

`compile()` turns the beats into absolute timestamps. Everything on screen is
then a pure function of the playhead `t`: the travelling dot, the typewriter,
the cap bar, the confetti and the Request ID roll. That's why seeking,
stepping and speed changes are exact, and why the export can render frame by
frame. You don't mark branches as "not taken" yourself. Any node or edge off
the scenario's path fades out once the decision before it is made.

## Adding a scenario

1. Open `src/content/creche/scenarios.ts` (or `leave/`) and add an entry to
   `scenarios`:

   ```ts
   {
     id: "delhi-under-cap",
     label: "Delhi, under cap",
     blurb: "₹9,000 in Delhi is reimbursed in full",
     beats: [
       ...throughCity(delhiClaim),   // steps 1–6
       ageOk(delhiClaim),            // step 7
       ...toSubmit(delhiClaim, true),// steps 8–10
       success(delhiClaim, "CR-2026-048400"),
     ],
   }
   ```

   The builders (`trigger`, `crecheType`, `upload`, `ocr`, `dateOk`,
   `cityCap`, `ageCheck`, `summary`, `confirm`, `submit`, `success`,
   `failure`) take a `Claim` profile, so a new scenario is usually a profile
   plus the point where it leaves the happy path. You can also write beats by
   hand.

2. Each beat's `via` must be an edge from the previous beat's node to this
   one. `compile()` checks this and throws a readable error if it's wrong. A
   common mistake is jumping straight to a branch without a beat on the
   decision node itself.

3. That's it. The scenario shows up in the switcher. Keys 1–9 cover the first
   nine scenarios.

**New node or branch?** Add it to `nodes` and `edges` in that agent's
`workflow.ts`.

**New agent?** Add `content/<agent>/workflow.ts` and `scenarios.ts`, register
the agent in `content/flows.ts`, and copy `leave.html` with its `data-flow`
changed. Then add the new page to `rollupOptions.input` in `vite.config.ts`. Edges are orthogonal polylines in the 1000×800
viewBox, so the dot follows whatever path you draw.

## Exporting video

```bash
npm run export -- happy                    # out/creche-happy.mp4 (1920×1080, 30fps)
npm run export -- pl --flow leave          # out/leave-pl.mp4
npm run export -- all --flow leave --gif   # every leave scenario, MP4 + 960px GIF
npm run export -- happy --fps 60
npm run export -- stale --stills date+500,end   # PNG stills
```

The script starts its own Vite server, opens `?export=1` (controls hidden) in
headless Chromium, seeks to each frame's timestamp, screenshots it and pipes
the frames to ffmpeg (`ffmpeg-static`). It uses Playwright's Chromium if
`npx playwright install` has been run, and installed Google Chrome otherwise.
A still is given in ms, as `<node>+<ms>` after the dot reaches that node, or
as `end`.
