import { useLayoutEffect, useRef, type ReactNode } from "react";
import { TYPING_DOTS_MS, easeInOut, easeOut, progress, type TimedEvent, type Timeline } from "../engine/timeline";
import { useReduced } from "../engine/useClock";
import {
  ApiCard,
  BalanceCard,
  CapCard,
  CompactChat,
  ChecksCard,
  ChoiceCard,
  DatesCard,
  EndCard,
  FileCard,
  InfoCard,
  OcrCard,
  SummaryCard,
} from "./cards";

/**
 * `compact` (phones) drops the header and the dummy input row, runs cards
 * full width at a slightly smaller size, and scrolls so the newest message
 * shows from its top: a card taller than the space left is never cut at the
 * top, which is where its title and figures are.
 */
export function ChatPanel({ tl, t, title, compact }: { tl: Timeline; t: number; title: string; compact?: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const reduced = useReduced();
  const visible = tl.events.filter((e) => t >= e.start);

  // Keep the newest message in view as content grows. When it's taller than
  // the chat (the creche claim summary on phones), open on its top, then
  // scroll down through it at reading pace as its rows fill in.
  const newest = visible[visible.length - 1];
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    const last = list.current?.lastElementChild;
    if (!last || !newest) return;
    const box = el.getBoundingClientRect();
    const over = last.getBoundingClientRect().top - box.top - 12;
    if (over >= 0) return;
    // Rects are in screen px; scrollTop is in the stage's px.
    const k = el.offsetHeight / box.height;
    const hidden = -over * k;
    const p = reduced ? 1 : easeInOut(progress(t - newest.start, 700, Math.max(1600, hidden * 12)));
    el.scrollTop -= hidden * (1 - p);
  });

  return (
    <CompactChat.Provider value={!!compact}>
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      {!compact && (
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
      )}
      <div
        ref={scroller}
        className={`chat-scroll flex-1 overflow-y-auto ${compact ? "px-3 py-3" : "px-6 py-5"}`}
        style={{ maskImage: `linear-gradient(to bottom, transparent 0, black ${compact ? 12 : 28}px)` }}
      >
        <div ref={list} className="flex min-h-full flex-col justify-end gap-3" style={compact ? { zoom: 0.86 } : undefined}>
          {visible.map((e) => (
            <Event key={`${tl.scenario.id}:${e.key}`} e={e} t={t} />
          ))}
        </div>
      </div>
      {!compact && (
        <footer className="border-t border-line px-5 py-3.5">
          <div className="rounded-full border border-line bg-raised px-5 py-2.5 text-[14px] text-slate-500">
            Type a message…
          </div>
        </footer>
      )}
    </div>
    </CompactChat.Provider>
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
