import { useLayoutEffect, useRef, type ReactNode } from "react";
import { TYPING_DOTS_MS, easeOut, progress, type TimedEvent, type Timeline } from "../engine/timeline";
import { useReduced } from "../engine/useClock";
import {
  ApiCard,
  BalanceCard,
  CapCard,
  ChecksCard,
  ChoiceCard,
  DatesCard,
  EndCard,
  FileCard,
  InfoCard,
  OcrCard,
  SummaryCard,
} from "./cards";

export function ChatPanel({ tl, t, title }: { tl: Timeline; t: number; title: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const visible = tl.events.filter((e) => t >= e.start);

  // Keep the newest message in view as content grows.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <header className="flex items-center gap-3 border-b border-line px-6 py-4">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/15 text-[15px] font-bold text-accent ring-1 ring-accent/40">
          HG
        </div>
        <div className="leading-tight">
          <div className="text-[17px] font-semibold text-slate-100">HR Genie</div>
          <div className="text-[13px] text-slate-400">{title}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[12px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-ok" /> Online
        </div>
      </header>
      <div
        ref={scroller}
        className="chat-scroll flex-1 overflow-y-auto px-6 py-5"
        style={{ maskImage: "linear-gradient(to bottom, transparent 0, black 28px)" }}
      >
        <div className="flex min-h-full flex-col justify-end gap-3">
          {visible.map((e) => (
            <Event key={`${tl.scenario.id}:${e.key}`} e={e} t={t} />
          ))}
        </div>
      </div>
      <footer className="border-t border-line px-5 py-3.5">
        <div className="rounded-full border border-line bg-raised px-5 py-2.5 text-[14px] text-slate-500">
          Type a message…
        </div>
      </footer>
    </div>
  );
}

function Event({ e, t }: { e: TimedEvent; t: number }) {
  const local = t - e.start;
  const p = progress(t, e.start, e.dur);
  const ev = e.event;
  switch (ev.kind) {
    case "agent":
      return <AgentBubble text={ev.text} local={local} />;
    case "user":
      return <UserBubble text={ev.text} local={local} />;
    case "system":
      return <SystemChip text={ev.text} tone={ev.tone} local={local} />;
    case "file":
      return (
        <Appear local={local} side={ev.fetched ? "left" : "right"}>
          <FileCard files={ev.files} fetched={ev.fetched} local={local} />
        </Appear>
      );
    case "ocr":
      return <Appear local={local}><OcrCard event={ev} local={local} /></Appear>;
    case "cap":
      return <Appear local={local}><CapCard event={ev} local={local} /></Appear>;
    case "summary":
      return <Appear local={local}><SummaryCard event={ev} local={local} /></Appear>;
    case "api":
      return <ApiCard event={ev} local={local} p={p} />;
    case "end":
      return <Appear local={local}><EndCard event={ev} local={local} /></Appear>;
    case "balance":
      return <Appear local={local}><BalanceCard event={ev} local={local} /></Appear>;
    case "choice":
      return <Appear local={local}><ChoiceCard event={ev} local={local} /></Appear>;
    case "info":
      return <Appear local={local}><InfoCard event={ev} /></Appear>;
    case "dates":
      return <Appear local={local}><DatesCard event={ev} local={local} /></Appear>;
    case "checks":
      return <Appear local={local}><ChecksCard event={ev} local={local} /></Appear>;
  }
}

/** Fade-and-rise entrance, driven by local time. */
export function Appear({
  local,
  side = "left",
  children,
}: {
  local: number;
  side?: "left" | "right";
  children: ReactNode;
}) {
  const reduced = useReduced();
  const p = reduced ? 1 : easeOut(progress(local, 0, 320));
  return (
    <div
      className={side === "right" ? "flex justify-end" : "flex justify-start"}
      style={{ opacity: reduced ? Math.min(1, local / 200) : p, transform: `translateY(${(1 - p) * 10}px)` }}
    >
      {children}
    </div>
  );
}

function AgentBubble({ text, local }: { text: string; local: number }) {
  const reduced = useReduced();
  const typingFor = reduced ? 0 : TYPING_DOTS_MS;
  const typed = local - typingFor;
  const chars = reduced ? text.length : Math.max(0, Math.floor(typed / 17));
  const shown = text.slice(0, chars);
  const typing = !reduced && chars < text.length;
  return (
    <Appear local={local}>
      <div className="max-w-[86%] rounded-2xl rounded-tl-md bg-raised px-4 py-3 text-[15.5px] leading-relaxed text-slate-100">
        {typed < 0 ? (
          <Dots local={local} />
        ) : (
          <>
            {shown}
            {typing && <span className="caret" />}
            {/* Reserve the full text's height so the list doesn't jump while typing. */}
            <span className="invisible">{text.slice(chars)}</span>
          </>
        )}
      </div>
    </Appear>
  );
}

function UserBubble({ text, local }: { text: string; local: number }) {
  const reduced = useReduced();
  const chars = reduced ? text.length : Math.max(0, Math.floor((local - 250) / 30));
  return (
    <Appear local={local} side="right">
      <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-accent px-4 py-3 text-[15.5px] font-medium leading-relaxed text-[#04201c]">
        {text.slice(0, chars)}
        <span className="invisible">{text.slice(chars) || "​"}</span>
      </div>
    </Appear>
  );
}

function Dots({ local }: { local: number }) {
  return (
    <span className="flex h-[26px] items-center gap-1.5 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400"
          style={{ opacity: 0.35 + 0.65 * Math.max(0, Math.sin(local / 140 - i * 0.9)) }}
        />
      ))}
    </span>
  );
}

const CHIP: Record<string, string> = {
  accent: "border-accent/40 text-accent bg-accent/10",
  ok: "border-ok/35 text-ok bg-ok/10",
  bad: "border-bad/40 text-bad bg-bad/10",
  warn: "border-warn/40 text-warn bg-warn/10",
  muted: "border-line text-slate-400 bg-raised",
};

function SystemChip({ text, tone, local }: { text: string; tone?: string; local: number }) {
  const reduced = useReduced();
  const p = reduced ? 1 : easeOut(progress(local, 0, 300));
  return (
    <div className="flex justify-center" style={{ opacity: p, transform: `scale(${0.94 + 0.06 * p})` }}>
      <span className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium ${CHIP[tone ?? "muted"]}`}>
        {text}
      </span>
    </div>
  );
}
