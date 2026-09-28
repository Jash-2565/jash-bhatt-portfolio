import { useEffect, useMemo, useRef, useState } from 'react';

// Static circuit-trace ground, generated once for the full height of the page
// and scrolled with it. It replaces a fixed 512px tile that sat still behind
// the content, so every screen of scroll showed the same patch of routing.
//
// The board is built in 512px bands, each from its own seed. A band's routing
// never depends on how many bands there are, so when the page grows — images
// loading, a section mounting — new board is added below and nothing above it
// reshuffles. The same seeds give the same board on every visit.
//
// Drawing language matches the old tile: 45° jogs on a 32px grid, a 1.15px
// stroke at very low alpha, and solder pads at some corners and every loose end.

const UNIT = 32;
const BAND = 512;
// Wider than any common viewport, 4K included, so the board's edge is never
// on screen: there is no falloff to hide it.
const WIDTH = 3840;
const COLS = WIDTH / UNIT;
// Vertical lanes at a fixed x, so a vertical trace crossing a band boundary
// always meets the next band at the same point. Irregular spacing, repeated
// every 1280px, so the columns don't read as a ruled grid.
const LANES = [64, 288, 416, 640, 832, 1056]
  .flatMap((x) => [x, x + 1280, x + 2560])
  .filter((x) => x < WIDTH);

// mulberry32: small, fast, and deterministic for a given seed.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Band = { traces: string; pads: string };

function pad(x: number, y: number, r: number) {
  return `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
}

function buildBand(index: number): Band {
  const rand = rng(index * 7919 + 17);
  const pick = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const top = index * BAND;
  const traces: string[] = [];
  const pads: string[] = [];
  const maybePad = (x: number, y: number) => {
    if (rand() < 0.35) pads.push(pad(x, y, rand() < 0.5 ? 2.4 : 3));
  };

  // Horizontal runs: two or three per band, each stepping up or down a grid
  // unit at 45° and usually stepping back, so it holds its row.
  const rows = pick(2, 3);
  const rowSlots = [3, 7, 11].sort(() => rand() - 0.5).slice(0, rows);
  for (const slot of rowSlots) {
    const baseY = top + (slot + pick(-1, 1)) * UNIT;
    let x = rand() < 0.6 ? 0 : pick(2, 20) * UNIT;
    if (x > 0) pads.push(pad(x, baseY, 3));
    const end = rand() < 0.5 ? WIDTH : pick(30, COLS - 10) * UNIT;
    let y = baseY;
    let d = `M${x} ${y}`;
    while (x < end) {
      x = Math.min(end, x + pick(2, 7) * UNIT);
      d += ` H${x}`;
      if (x >= end) break;
      const dy = y === baseY ? (rand() < 0.5 ? -UNIT : UNIT) : baseY - y;
      x += UNIT;
      y += dy;
      d += ` L${x} ${y}`;
      maybePad(x, y);
    }
    traces.push(d);
    if (end < WIDTH) pads.push(pad(x, y, 3));
  }

  // Vertical lanes: most run the band's full height with an out-and-back jog,
  // so they re-enter the next band on the same x. Some stop short on a pad,
  // which is where the board reads as routed rather than ruled.
  for (const laneX of LANES) {
    const roll = rand();
    if (roll < 0.25) continue;
    const dir = rand() < 0.5 ? -UNIT : UNIT;
    const jogAt = top + pick(1, 8) * UNIT;
    const jogLen = pick(2, 5) * UNIT;
    if (roll < 0.45) {
      // A stub that starts and ends inside the band, with pads at both ends.
      const start = top + pick(1, 6) * UNIT;
      const stop = start + pick(3, 8) * UNIT;
      traces.push(`M${laneX} ${start} V${stop}`);
      pads.push(pad(laneX, start, 2.6), pad(laneX, stop, 2.6));
      continue;
    }
    traces.push(
      `M${laneX} ${top} V${jogAt} L${laneX + dir} ${jogAt + UNIT} V${jogAt + UNIT + jogLen} L${laneX} ${jogAt + 2 * UNIT + jogLen} V${top + BAND}`
    );
    maybePad(laneX + dir, jogAt + UNIT);
  }

  // Short isolated links, like the stubs in the old tile.
  for (let i = pick(2, 5); i > 0; i--) {
    const x = pick(2, COLS - 4) * UNIT;
    const y = top + pick(1, 15) * UNIT;
    const len = pick(2, 3) * UNIT;
    if (rand() < 0.5) {
      traces.push(`M${x} ${y} H${x + len}`);
      pads.push(pad(x + len, y, 3));
    } else {
      traces.push(`M${x} ${y} V${y + len}`);
      pads.push(pad(x, y + len, 3));
    }
  }

  return { traces: traces.join(' '), pads: pads.join(' ') };
}

const bandCache = new Map<number, Band>();
function band(index: number) {
  let b = bandCache.get(index);
  if (!b) {
    b = buildBand(index);
    bandCache.set(index, b);
  }
  return b;
}

// Phones draw the same board 1.25× larger, as the tile used to be, so it
// reads as routing rather than as noise.
const PHONE = '(max-width: 767px)';

export default function CircuitGround() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(el);
    const phone = window.matchMedia(PHONE);
    const sync = () => setScale(phone.matches ? 1.25 : 1);
    sync();
    phone.addEventListener('change', sync);
    return () => {
      observer.disconnect();
      phone.removeEventListener('change', sync);
    };
  }, []);

  // Only whole bands change the drawing, so resizes inside a band are free.
  const bands = Math.ceil(height / scale / BAND);
  const { traces, pads } = useMemo(() => {
    const t: string[] = [];
    const p: string[] = [];
    for (let i = 0; i < bands; i++) {
      const b = band(i);
      t.push(b.traces);
      p.push(b.pads);
    }
    return { traces: t.join(' '), pads: p.join(' ') };
  }, [bands]);

  const drawnHeight = bands * BAND;
  return (
    <div ref={ref} className="circuit-ground" aria-hidden="true">
      {bands > 0 && (
        <svg
          width={WIDTH * scale}
          height={drawnHeight * scale}
          viewBox={`0 0 ${WIDTH} ${drawnHeight}`}
          fill="none"
        >
          <path
            d={traces}
            stroke="currentColor"
            strokeOpacity={0.085}
            strokeWidth={1.15}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d={pads} fill="currentColor" fillOpacity={0.3} />
        </svg>
      )}
    </div>
  );
}
