import type { ChatEvent } from "../engine/types";
import { clamp01, easeInOut, easeOut, progress } from "../engine/timeline";
import { useReduced } from "../engine/useClock";
import { TONE } from "./tone";

type Of<K extends ChatEvent["kind"]> = Extract<ChatEvent, { kind: K }>;

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-[90%] rounded-2xl border border-line bg-raised/70 p-4 ${className}`}>{children}</div>
  );
}

function Check({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

/* ---------------------------------------------------------------- files */

export function FileCard({ files, fetched, local }: { files: Of<"file">["files"]; fetched?: boolean; local: number }) {
  const reduced = useReduced();
  return (
    <div className="flex w-[78%] flex-col gap-2">
      {files.map((f, i) => {
        const start = 300 + i * 450;
        const p = reduced ? (local >= start ? 1 : 0) : easeInOut(progress(local, start, 900));
        if (local < i * 450) return null;
        return (
          <div key={f.name} className="flex items-center gap-3 rounded-xl border border-accent/30 bg-[#0f2226] px-3.5 py-3">
            <div className="grid h-10 w-9 shrink-0 place-items-center rounded-md bg-bad/15 text-[10px] font-bold text-bad ring-1 ring-bad/30">
              PDF
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-medium text-slate-100">{f.name}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${p * 100}%` }} />
                </div>
                <span className="w-[124px] shrink-0 whitespace-nowrap text-right text-[12px] text-slate-400">
                  {p < 1 ? `${fetched ? "Fetching" : "Uploading"} ${Math.round(p * 100)}%` : f.size}
                </span>
              </div>
            </div>
            <div className={`text-ok transition-none ${p < 1 ? "opacity-0" : ""}`}>
              <Check className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ OCR */

export function OcrCard({ event, local }: { event: Of<"ocr">; local: number }) {
  const reduced = useReduced();
  const scanEnd = 500 + event.fields.length * 360;
  const scanning = local < scanEnd;
  const sweep = (local % 1100) / 1100;
  return (
    <Card className="relative overflow-hidden">
      {scanning && !reduced && (
        <div
          className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-accent/15 to-transparent"
          style={{ left: `${lerp(-20, 110, sweep)}%` }}
        />
      )}
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-slate-400">
        <ScanIcon />
        {event.title}
        <span className={`ml-auto normal-case tracking-normal ${scanning ? "text-accent" : "text-ok"}`}>
          {scanning ? "Reading…" : `${event.fields.length} fields`}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {event.fields.map((f, i) => {
          const at = 500 + i * 360;
          const p = reduced ? (local >= at ? 1 : 0) : easeOut(progress(local, at, 300));
          const flash = reduced ? 0 : 1 - progress(local, at + 150, 700);
          const wide = i === event.fields.length - 1;
          return (
            <div
              key={f.label}
              className={`rounded-lg px-2.5 py-1.5 ${wide ? "col-span-2" : ""}`}
              style={{ background: `rgba(1,245,209,${0.12 * flash * (p > 0 ? 1 : 0)})` }}
            >
              <div className="text-[11.5px] uppercase tracking-wide text-slate-500">{f.label}</div>
              {p > 0 ? (
                <div
                  className="text-[15px] font-medium text-slate-100"
                  style={{ opacity: p, transform: `translateX(${(1 - p) * -8}px)` }}
                >
                  {f.value}
                  {f.detail && <span className="ml-2 text-[12.5px] font-normal text-slate-400">{f.detail}</span>}
                </div>
              ) : (
                <div className="flex h-[22.5px] items-center">
                  <span className="h-3 w-28 rounded bg-line" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <path d="M2 5V3a1 1 0 0 1 1-1h2M11 2h2a1 1 0 0 1 1 1v2M14 11v2a1 1 0 0 1-1 1h-2M5 14H3a1 1 0 0 1-1-1v-2M4.5 8h7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ cap */

export function CapCard({ event, local }: { event: Of<"cap">; local: number }) {
  const reduced = useReduced();
  const { claimed, cap } = event;
  const over = claimed > cap;
  const max = Math.max(claimed, cap) * 1.1;
  const at = (ms: number, dur: number) => (reduced ? (local >= ms ? 1 : 0) : easeOut(progress(local, ms, dur)));

  const fill = reduced ? 1 : easeInOut(progress(local, 300, 1200));
  const marker = at(1100, 350);
  const redden = at(1700, 450);
  const slide = at(2300, 700);
  const result = at(2800, 400);

  const capPct = (cap / max) * 100;
  const claimedPct = (claimed / max) * 100 * fill;
  const basePct = Math.min(claimedPct, capPct);
  const excessPct = Math.max(0, claimedPct - capPct);
  const reimbursed = over ? cap : claimed;

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <div className="text-[13px] font-semibold uppercase tracking-wide text-slate-400">City-based cap</div>
        <div className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[12.5px] font-medium text-accent">
          {event.city} · {event.tier} · {rupees(cap)}/month
        </div>
      </div>

      <div className="relative mt-9 h-7">
        <div className="absolute inset-0 rounded-md bg-line/70" />
        <div
          className="absolute inset-y-0 left-0 rounded-l-md"
          style={{
            width: `${basePct}%`,
            background: !over && redden > 0 ? `rgba(74,222,128,${lerp(1, 0.9, redden)})` : "#01f5d1",
            borderTopRightRadius: excessPct > 0 ? 0 : 6,
            borderBottomRightRadius: excessPct > 0 ? 0 : 6,
          }}
        />
        {excessPct > 0 && (
          <div
            className="absolute inset-y-0 rounded-r-md"
            style={{
              left: `${capPct}%`,
              width: `${excessPct}%`,
              background: redden > 0 ? `rgb(${lerp(1, 248, redden)},${lerp(245, 113, redden)},${lerp(209, 113, redden)})` : "#01f5d1",
              transform: `translateX(${slide * 60}px)`,
              opacity: 1 - slide,
            }}
          />
        )}
        {/* the cap line */}
        <div
          className="absolute -top-7 bottom-[-6px] flex flex-col items-center"
          style={{ left: `${capPct}%`, opacity: marker, transform: `translate(-50%, ${(1 - marker) * -8}px)` }}
        >
          <span className="whitespace-nowrap text-[12px] font-semibold text-slate-200">Cap {rupees(cap)}</span>
          <span className="mt-1 w-0.5 flex-1 bg-slate-100" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[13px]">
        <Stat label="Claimed" value={rupees(claimed * fill)} />
        <Stat
          label={over ? "Over cap" : "Headroom"}
          value={over ? `−${rupees(claimed - cap)}` : rupees(cap - claimed)}
          tone={over ? "text-bad" : "text-slate-300"}
          opacity={redden}
        />
        <Stat label="Reimbursable" value={rupees(reimbursed)} tone={over ? "text-accent" : "text-ok"} opacity={result} big />
      </div>
      {event.footnote && <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] leading-snug text-slate-500">{event.footnote}</p>}
    </Card>
  );
}

function Stat({
  label,
  value,
  tone = "text-slate-100",
  opacity = 1,
  big,
}: {
  label: string;
  value: string;
  tone?: string;
  opacity?: number;
  big?: boolean;
}) {
  return (
    <div style={{ opacity }}>
      <div className="text-[11.5px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`${big ? "text-[19px]" : "text-[16px]"} font-semibold tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}

/* -------------------------------------------------------------- summary */

export function SummaryCard({ event, local }: { event: Of<"summary">; local: number }) {
  const reduced = useReduced();
  const rowAt = (i: number) => 300 + i * 170;
  const docAt = (i: number) => rowAt(event.rows.length) + 150 + i * 200;
  const seen = (ms: number) => (reduced ? (local >= ms ? 1 : 0) : easeOut(progress(local, ms, 260)));
  return (
    <Card className="w-[94%]">
      <div className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-slate-400">{event.title}</div>
      <table className="w-full text-[14px]">
        <tbody>
          {event.rows.map((r, i) => {
            const p = seen(rowAt(i));
            return (
              <tr key={r.label} className="border-b border-line/70 last:border-0" style={{ opacity: p }}>
                <td className="w-[38%] py-1.5 pr-3 align-top text-slate-400">{r.label}</td>
                <td className="py-1.5 align-top">
                  <span className={r.accent ? "font-semibold text-accent" : "font-medium text-slate-100"}>{r.value}</span>
                  {r.detail && <div className={`text-[12.5px] ${r.warn ? "text-bad" : "text-slate-500"}`}>{r.detail}</div>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {event.documents.length > 0 && <div className="mt-2.5 flex flex-wrap gap-2">
        {event.documents.map((d, i) => {
          const p = seen(docAt(i));
          return (
            <span
              key={d}
              className="flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2.5 py-1 text-[12.5px] font-medium text-ok"
              style={{ opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}
            >
              <Check className="h-3.5 w-3.5" />
              {d}
            </span>
          );
        })}
      </div>}
    </Card>
  );
}

/* ------------------------------------------------------------------ api */

export function ApiCard({ event, local, p }: { event: Of<"api">; local: number; p: number }) {
  const reduced = useReduced();
  const done = p >= 0.78;
  const color = done ? (event.ok ? "text-ok border-ok/35 bg-ok/10" : "text-bad border-bad/40 bg-bad/10") : "text-accent border-accent/40 bg-accent/10";
  const pulse = reduced ? 1 : 0.4 + 0.6 * Math.abs(Math.sin(local / 220));
  return (
    <div className="flex justify-center" style={{ opacity: reduced ? 1 : clamp01(local / 250) }}>
      <div className={`flex items-center gap-3 rounded-full border px-4 py-2 text-[13px] font-medium ${color}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-current" style={{ opacity: done ? 1 : pulse }} />
        <span>{event.label}</span>
        <span className="font-mono text-[12px] opacity-75">{event.endpoint}</span>
        <span className="opacity-90">
          {done ? (event.ok ? event.okText ?? "· 201 Created" : event.failText ?? "· 502 Bad Gateway") : `· Sending${".".repeat(1 + (Math.floor(local / 300) % 3))}`}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ end */

export function EndCard({ event, local }: { event: Of<"end">; local: number }) {
  const reduced = useReduced();
  const tone = TONE[event.tone];
  const success = event.tone === "success";
  const shake = !success && !reduced && local < 520 ? Math.sin(local / 26) * 8 * (1 - local / 520) : 0;

  return (
    <div
      className="relative w-[90%] rounded-2xl border-2 p-4"
      style={{ borderColor: tone.hex, background: tone.fill, transform: `translateX(${shake}px)`, boxShadow: `0 0 32px ${tone.hex}33` }}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: `${tone.hex}26`, color: tone.hex }}>
          {success ? <Check className="h-5 w-5" /> : <span className="text-[20px] font-bold leading-none">{event.tone === "redirect" ? "↪" : "!"}</span>}
        </div>
        <div>
          <div className="text-[17px] font-semibold" style={{ color: tone.hex }}>{event.title}</div>
          <div className="text-[14px] text-slate-300">{event.detail}</div>
        </div>
      </div>
      {event.requestId && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-black/25 px-4 py-2.5">
          <span className="text-[12px] uppercase tracking-wide text-slate-400">Request ID</span>
          <span className="font-mono text-[20px] font-semibold tracking-wider text-slate-50">
            <CountIn id={event.requestId} local={local - 250} reduced={reduced} />
          </span>
        </div>
      )}
      {event.status && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] font-medium">
          {event.status.map((s, i) => {
            const p = reduced ? 1 : easeOut(progress(local, 1300 + i * 350, 300));
            const last = i === event.status!.length - 1;
            return (
              <span key={s} className="flex items-center gap-2" style={{ opacity: p }}>
                {i > 0 && <span className="text-slate-500">→</span>}
                <span
                  className={`rounded-full border px-2.5 py-1 ${last ? "border-warn/40 bg-warn/10 text-warn" : "border-ok/35 bg-ok/10 text-ok"}`}
                >
                  {last ? "⏳ " : ""}
                  {s}
                </span>
              </span>
            );
          })}
        </div>
      )}
      {event.actions && (
        <div className="mt-3 flex flex-wrap gap-2">
          {event.actions.map((a, i) => {
            const p = reduced ? 1 : easeOut(progress(local, 700 + i * 180, 280));
            return (
              <span
                key={a}
                className="rounded-lg border border-slate-500/50 bg-black/20 px-3 py-1.5 text-[13.5px] font-medium text-slate-100"
                style={{ opacity: p, transform: `translateY(${(1 - p) * 6}px)` }}
              >
                {a}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Digits roll and settle left to right. */
function CountIn({ id, local, reduced }: { id: string; local: number; reduced: boolean }) {
  if (reduced) return <>{id}</>;
  const digits = [...id].map((c, i) => ({ c, i })).filter(({ c }) => /\d/.test(c));
  const settleEvery = 1100 / digits.length;
  const tick = Math.floor(Math.max(0, local) / 45);
  return (
    <>
      {[...id].map((c, i) => {
        const k = digits.findIndex((d) => d.i === i);
        if (k < 0) return <span key={i}>{c}</span>;
        const settled = local >= k * settleEvery + 150;
        const rolling = (tick * 7 + i * 3) % 10;
        return (
          <span key={i} className={settled ? "" : "text-accent"}>
            {settled ? c : local < 0 ? "0" : String(rolling)}
          </span>
        );
      })}
    </>
  );
}

/* -------------------------------------------------------------- balance */

export function BalanceCard({ event, local }: { event: Of<"balance">; local: number }) {
  const reduced = useReduced();
  return (
    <Card>
      <div className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-400">{event.title}</div>
      <div className="grid grid-cols-4 gap-2.5">
        {event.items.map((it, i) => {
          const at = 300 + i * 250;
          const p = reduced ? (local >= at ? 1 : 0) : easeOut(progress(local, at, 650));
          return (
            <div
              key={it.label}
              className="rounded-xl border border-line bg-panel px-3 py-2.5"
              style={{ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 6}px)` }}
            >
              <div className="text-[13px] font-semibold text-accent">{it.label}</div>
              <div className="text-[24px] font-bold tabular-nums leading-tight text-slate-50">
                {it.value === null ? <span className="text-[18px] text-slate-500">N/A</span> : (it.value * p).toFixed(1)}
              </div>
              {it.detail && <div className="text-[11.5px] text-slate-500">{it.detail}</div>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------- choice */

export function ChoiceCard({ event, local }: { event: Of<"choice">; local: number }) {
  const reduced = useReduced();
  const pickAt = 500 + event.options.length * 120 + 350;
  const picked = local >= pickAt;
  return (
    <Card className="w-[70%]">
      <div className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-slate-400">{event.title}</div>
      <div className="flex flex-col gap-1.5">
        {event.options.map((o, i) => {
          const p = reduced ? 1 : easeOut(progress(local, 300 + i * 120, 250));
          const on = picked && o === event.selected;
          const dim = picked && o !== event.selected;
          const press = !reduced && on ? 1 - 0.03 * Math.sin(Math.PI * progress(local, pickAt, 220)) : 1;
          return (
            <div
              key={o}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[14.5px] font-medium ${
                on ? "border-accent bg-accent/15 text-accent" : "border-line bg-panel text-slate-200"
              }`}
              style={{ opacity: p * (dim ? 0.45 : 1), transform: `scale(${press})` }}
            >
              {o}
              {on && <Check className="h-4 w-4" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------------- info */

export function InfoCard({ event }: { event: Of<"info"> }) {
  return (
    <div className="w-[86%] rounded-2xl border border-accent/30 bg-accent/[0.06] px-4 py-3">
      <div className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-accent">
        <span className="grid h-4 w-4 place-items-center rounded-full border border-accent text-[10px] normal-case">i</span>
        {event.title}
      </div>
      <ul className="space-y-1 text-[14.5px] leading-snug text-slate-200">
        {event.lines.map((l) => (
          <li key={l} className="flex gap-2">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- dates */

const parse = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const short = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }).replace(" ", "-");

export function DatesCard({ event, local }: { event: Of<"dates">; local: number }) {
  const reduced = useReduced();
  const start = parse(event.start);
  const end = parse(event.end);
  const oneMonth = start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
  // The range fills in day by day, and the count follows it.
  const fill = reduced ? 1 : easeInOut(progress(local, 400, 1300));
  const shown = Math.max(1, Math.round(event.days * fill));
  const count = (
    <div className="text-right">
      <div className="text-[30px] font-bold tabular-nums leading-none text-accent">{local < 400 ? 0 : shown}</div>
      <div className="text-[12px] uppercase tracking-wide text-slate-500">days</div>
    </div>
  );

  if (!oneMonth) {
    return (
      <Card>
        <div className="flex items-center gap-4">
          {[start, end].map((d, i) => (
            <div key={i} className="flex items-center gap-4">
              {i > 0 && <span className="text-[20px] text-slate-500">→</span>}
              <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5" style={{ opacity: i === 0 || fill > 0.6 ? 1 : 0.3 }}>
                <div className="text-[11.5px] uppercase tracking-wide text-slate-400">{i ? "End" : "Start"}</div>
                <div className="text-[19px] font-semibold text-slate-50">{short(d)}</div>
              </div>
            </div>
          ))}
          <div className="ml-auto">{count}</div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent" style={{ width: `${fill * 100}%` }} />
        </div>
        {event.caption && <div className="mt-2.5 text-[13px] font-medium text-accent">{event.caption}</div>}
      </Card>
    );
  }

  const y = start.getUTCFullYear();
  const m = start.getUTCMonth();
  const first = new Date(Date.UTC(y, m, 1));
  const lead = (first.getUTCDay() + 6) % 7; // weeks start Monday
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const s = start.getUTCDate();
  const e = end.getUTCDate();
  const lit = s + Math.floor((e - s + 1) * fill) - 1;
  const ex = event.existing && { s: parse(event.existing.start).getUTCDate(), e: parse(event.existing.end).getUTCDate() };
  const month = first.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <Card className="w-[80%]">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-wide text-slate-400">{month}</div>
          <div className="mt-1 text-[15px] font-semibold text-slate-100">
            {short(start)} <span className="text-slate-500">→</span> {short(end)}
          </div>
        </div>
        {count}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[12.5px]">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="pb-0.5 text-[11px] font-semibold text-slate-500">{d}</div>
        ))}
        {Array.from({ length: lead }, (_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const inRange = local >= 400 && d >= s && d <= lit;
          const taken = ex && d >= ex.s && d <= ex.e;
          const clash = inRange && taken;
          const weekend = (lead + i) % 7 >= 5;
          return (
            <div
              key={d}
              className={`rounded-md py-1 tabular-nums ${
                clash
                  ? "bg-bad font-semibold text-[#2c1316]"
                  : inRange
                    ? "bg-accent font-semibold text-[#04201c]"
                    : taken
                      ? "border border-dashed border-bad/60 bg-bad/10 text-bad"
                      : weekend
                        ? "text-slate-600"
                        : "text-slate-300"
              }`}
            >
              {d}
            </div>
          );
        })}
      </div>
      {event.existing && (
        <div className="mt-2 flex items-center gap-2 text-[12px] text-bad">
          <span className="h-3 w-3 rounded-[3px] border border-dashed border-bad/60 bg-bad/10" />
          {event.existing.label} · {short(parse(event.existing.start))} to {short(parse(event.existing.end))}
        </div>
      )}
      {event.caption && <div className="mt-2 text-[13px] font-medium text-accent">{event.caption}</div>}
    </Card>
  );
}

/* --------------------------------------------------------------- checks */

const CHECK_TONE = { ok: "text-ok", bad: "text-bad", warn: "text-warn" } as const;

export function ChecksCard({ event, local }: { event: Of<"checks">; local: number }) {
  const reduced = useReduced();
  return (
    <Card>
      <div className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-slate-400">{event.title}</div>
      <div className="flex flex-col gap-1.5">
        {event.items.map((it, i) => {
          const at = 400 + i * 550;
          const resolved = local >= at + 380;
          const visible = local >= at;
          const p = reduced ? 1 : easeOut(progress(local, at, 220));
          if (!visible) return null;
          return (
            <div
              key={it.label}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-1.5 ${resolved && it.state === "bad" ? "bg-bad/10" : ""}`}
              style={{ opacity: p }}
            >
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${resolved ? `${CHECK_TONE[it.state]} border-current` : "border-line text-slate-500"}`}>
                {!resolved ? (
                  <span
                    className="h-3 w-3 rounded-full border-2 border-accent border-t-transparent"
                    style={{ transform: `rotate(${reduced ? 0 : local * 0.6}deg)` }}
                  />
                ) : it.state === "ok" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-[13px] font-bold leading-none">{it.state === "bad" ? "✕" : "!"}</span>
                )}
              </span>
              <span className="flex-1 text-[14.5px] text-slate-100">{it.label}</span>
              {it.detail && (
                <span className={`text-[13px] ${resolved ? CHECK_TONE[it.state] : "text-slate-500"}`}>{it.detail}</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
