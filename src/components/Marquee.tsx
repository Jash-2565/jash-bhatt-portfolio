type MarqueeProps = {
  items: string[];
};

// Infinite horizontal scroll of discipline keywords. Decorative — hidden from
// screen readers, pauses on hover, collapses to nothing under reduced motion.
export default function Marquee({ items }: MarqueeProps) {
  const row = [...items, ...items];
  return (
    <div className="marquee-wrap border-y border-slate-800/80 py-5" aria-hidden="true">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span
            key={i}
            className="flex items-center shrink-0 font-display text-sm md:text-base uppercase tracking-[0.22em] text-slate-500"
          >
            <span className="marquee-item-text transition-colors duration-300">{item}</span>
            <span className="mx-6 md:mx-8 h-1.5 w-1.5 rounded-full bg-[#01F5D1]/50 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
