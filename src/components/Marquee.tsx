type MarqueeProps = {
  items: string[];
};

// Infinite horizontal scroll of discipline keywords, cut as a mono readout.
// Decorative — hidden from screen readers, pauses on hover, collapses to nothing
// under reduced motion.
export default function Marquee({ items }: MarqueeProps) {
  const row = [...items, ...items];
  return (
    <div className="marquee-wrap border-y border-slate-800/80 py-5" aria-hidden="true">
      <div className="marquee-mask">
        <div className="marquee-track">
          {row.map((item, i) => (
            <span
              key={i}
              className="flex items-center shrink-0 font-mono text-xs md:text-sm uppercase tracking-[0.22em] text-slate-400"
            >
              <span className="marquee-item-text transition-colors duration-300">{item}</span>
              {/* A drawn separator rather than a dot: the band reads as a
                  readout, and a slash is the mono idiom for one. */}
              <span className="mx-6 md:mx-8 text-accent/50 shrink-0" aria-hidden="true">/</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
