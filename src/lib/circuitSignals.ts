// The live layer over the circuit ground: lights the routing around the cursor
// and sends signals along it. Pure canvas drawing with no React, driven by
// CircuitGround, which owns the board's size and scale.
//
// Only the bands on screen are ever touched, so the cost per frame is a few
// dozen polylines however long the page is. The loop stops whenever there is
// nothing moving: no signals in flight, no flashes fading, and a still pointer.

import { BAND, band } from './circuitBoard';
import type { Line } from './circuitBoard';
import { QUIET_FEATHER, measureQuiet } from './quietZones';
import type { Zone } from './quietZones';

type Trace = {
  pts: Line;
  /** Cumulative length at each point, so a distance along the trace maps
      straight to a segment. */
  cum: number[];
  len: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  vertical: boolean;
};

type Signal = {
  trace: Trace;
  /** Distance travelled along the trace, from the end it entered at. */
  at: number;
  /** +1 runs from the first point to the last, -1 the other way. */
  dir: 1 | -1;
  speed: number; // board units per second
  tail: number;
  hops: number;
};

type Flash = { x: number; y: number; born: number };

const GLOW_RADIUS = 190; // css px around the pointer
// Text stays on a still ground (see lib/quietZones). Everything the live layer
// draws is cut out around it with a soft edge, so a signal fades before it
// reaches a line of copy and the cursor light never sits under what is read.
const QUIET_REFRESH_MS = 400;
const FLASH_MS = 650;
const MAX_SIGNALS = 7;
const MAX_HOPS = 6;

function measure(pts: Line): Trace {
  const cum = [0];
  let len = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i], y = pts[i + 1];
    if (i > 0) {
      len += Math.hypot(x - pts[i - 2], y - pts[i - 1]);
      cum.push(len);
    }
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return { pts, cum, len, minX, maxX, minY, maxY, vertical: maxY - minY > maxX - minX };
}

/** The point `d` along a trace (clamped to its ends). */
function pointAt(t: Trace, d: number): [number, number] {
  const c = Math.max(0, Math.min(t.len, d));
  let i = 1;
  while (i < t.cum.length - 1 && t.cum[i] < c) i++;
  const seg = t.cum[i] - t.cum[i - 1] || 1;
  const f = (c - t.cum[i - 1]) / seg;
  const p = (i - 1) * 2;
  return [t.pts[p] + (t.pts[p + 2] - t.pts[p]) * f, t.pts[p + 1] + (t.pts[p + 3] - t.pts[p + 1]) * f];
}

/** Trace the stretch between distances a < b as a path on `ctx`. */
function pathBetween(ctx: CanvasRenderingContext2D, t: Trace, a: number, b: number, s: number, oy: number) {
  const [sx, sy] = pointAt(t, a);
  ctx.moveTo(sx * s, sy * s - oy);
  for (let i = 1; i < t.cum.length; i++) {
    if (t.cum[i] <= a) continue;
    if (t.cum[i] >= b) break;
    ctx.lineTo(t.pts[i * 2] * s, t.pts[i * 2 + 1] * s - oy);
  }
  const [ex, ey] = pointAt(t, b);
  ctx.lineTo(ex * s, ey * s - oy);
}

const key = (x: number, y: number) => `${x},${y}`;

export type SignalField = {
  setScale(scale: number, groundTop: number): void;
  resize(): void;
  pointer(x: number | null, y?: number): void;
  scrolled(direction: 1 | -1): void;
  /** A burst of signals from the routing on screen — the page powering up. */
  boot(): void;
  destroy(): void;
};

export function createSignalField(
  canvas: HTMLCanvasElement,
  opts: { ambient: boolean; motion: boolean },
): SignalField {
  const ctx = canvas.getContext('2d');
  const traces = new Map<number, Trace[]>();
  // Endpoint index, so a signal reaching the end of one trace can carry on
  // into whatever meets it there — the vertical lanes line up band to band,
  // which is what lets a signal run a long way down the page.
  const ends = new Map<string, Trace[]>();
  const signals: Signal[] = [];
  const flashes: Flash[] = [];
  let scale = 1;
  let groundTop = 0;
  let w = 0, h = 0, dpr = 1;
  let px: number | null = null, py = 0;
  let raf = 0;
  let running = false;
  let destroyed = false;
  let ambientTimer = 0;
  let lastScrollSpawn = 0;
  // Quiet zones in page coordinates, re-measured at most every
  // QUIET_REFRESH_MS while drawing — often enough to follow reveals and view
  // changes, rarely enough that the layout reads cost nothing.
  let quiet: Zone[] = [];
  let quietAt = -Infinity;
  // Not every engine has a canvas filter; without one the cut is hard-edged.
  const canFeather = ctx !== null && 'filter' in ctx;
  let accent = '1 245 209';
  let accentBright = '158 247 234';

  const rootStyle = getComputedStyle(document.documentElement);
  accent = rootStyle.getPropertyValue('--accent-rgb').trim() || accent;
  accentBright = rootStyle.getPropertyValue('--accent-bright-rgb').trim() || accentBright;

  const bandTraces = (i: number) => {
    let list = traces.get(i);
    if (!list) {
      list = band(i).lines.map(measure);
      traces.set(i, list);
      for (const t of list) {
        const n = t.pts.length;
        for (const k of [key(t.pts[0], t.pts[1]), key(t.pts[n - 2], t.pts[n - 1])]) {
          const at = ends.get(k);
          if (at) at.push(t);
          else ends.set(k, [t]);
        }
      }
    }
    return list;
  };

  /** Board-space band range covering the viewport (one band of margin, so a
      signal can enter from just off screen). */
  const offsetY = () => window.scrollY - groundTop;
  const visibleBands = () => {
    const top = offsetY() / scale;
    const first = Math.max(0, Math.floor(top / BAND) - 1);
    const last = Math.floor((top + h / scale) / BAND) + 1;
    return [first, last] as const;
  };

  const visibleTraces = (pred?: (t: Trace) => boolean) => {
    const [first, last] = visibleBands();
    const top = offsetY() / scale;
    const bottom = top + h / scale;
    const right = w / scale;
    const out: Trace[] = [];
    for (let i = first; i <= last; i++) {
      for (const t of bandTraces(i)) {
        if (t.maxY < top || t.minY > bottom || t.minX > right) continue;
        if (!pred || pred(t)) out.push(t);
      }
    }
    return out;
  };

  const spawn = (opts2: { vertical?: boolean; dir?: 1 | -1; fast?: boolean } = {}) => {
    if (!opts.motion || signals.length >= MAX_SIGNALS) return;
    const pool = visibleTraces((t) => t.len > 96 && (opts2.vertical === undefined || t.vertical === opts2.vertical));
    if (!pool.length) return;
    const trace = pool[Math.floor(Math.random() * pool.length)];
    // A vertical trace's points run top to bottom, so +1 is "down the page".
    const dir: 1 | -1 = opts2.dir ?? (Math.random() < 0.5 ? 1 : -1);
    signals.push({
      trace,
      at: 0,
      dir,
      speed: opts2.fast ? 620 + Math.random() * 240 : 260 + Math.random() * 200,
      tail: opts2.fast ? 150 : 96,
      hops: 0,
    });
    start();
  };

  const scheduleAmbient = () => {
    if (!opts.ambient || !opts.motion || destroyed) return;
    ambientTimer = window.setTimeout(() => {
      if (!document.hidden) spawn();
      scheduleAmbient();
    }, 900 + Math.random() * 1400);
  };

  // Page coordinates: measured from the document's origin, which sits
  // scrollY above the viewport's.
  const refreshQuiet = (now: number) => {
    quietAt = now;
    quiet = measureQuiet(0, -window.scrollY);
  };

  /** Cut everything drawn so far out from around the text on screen. */
  const hushText = () => {
    if (!ctx || !quiet.length) return;
    const sy = window.scrollY;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    if (canFeather) ctx.filter = `blur(${QUIET_FEATHER}px)`;
    ctx.beginPath();
    for (const q of quiet) {
      const y = q.y - sy;
      if (y > h || y + q.h < 0) continue;
      ctx.rect(q.x, y, q.w, q.h);
    }
    ctx.fill();
    ctx.restore();
  };

  const draw = (now: number, dt: number) => {
    if (!ctx) return;
    if (now - quietAt > QUIET_REFRESH_MS) refreshQuiet(now);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const oy = offsetY();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. The routing around the pointer, lit by distance. The gradient is the
    //    stroke itself, so nothing outside the radius needs masking.
    if (px !== null) {
      const g = ctx.createRadialGradient(px, py, 0, px, py, GLOW_RADIUS);
      g.addColorStop(0, `rgb(${accentBright} / 0.75)`);
      g.addColorStop(0.45, `rgb(${accent} / 0.32)`);
      g.addColorStop(1, `rgb(${accent} / 0)`);
      ctx.strokeStyle = g;
      ctx.fillStyle = g;
      ctx.lineWidth = 1.4 * Math.max(1, scale);
      const bx0 = (px - GLOW_RADIUS) / scale, bx1 = (px + GLOW_RADIUS) / scale;
      const by0 = (py - GLOW_RADIUS + oy) / scale, by1 = (py + GLOW_RADIUS + oy) / scale;
      ctx.beginPath();
      const near = visibleTraces((t) => t.maxX >= bx0 && t.minX <= bx1 && t.maxY >= by0 && t.minY <= by1);
      for (const t of near) pathBetween(ctx, t, 0, t.len, scale, oy);
      ctx.stroke();
      ctx.beginPath();
      for (const t of near) {
        const n = t.pts.length;
        for (const [x, y] of [[t.pts[0], t.pts[1]], [t.pts[n - 2], t.pts[n - 1]]]) {
          ctx.moveTo(x * scale + 3 * scale, y * scale - oy);
          ctx.arc(x * scale, y * scale - oy, 3 * scale, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    }

    // 2. Signals: a bright head with a fading tail.
    for (let i = signals.length - 1; i >= 0; i--) {
      const sig = signals[i];
      sig.at += (sig.speed * dt) / 1000;
      const t = sig.trace;
      const along = (d: number) => (sig.dir === 1 ? d : t.len - d);
      if (sig.at >= t.len) {
        const [ex, ey] = pointAt(t, along(t.len));
        flashes.push({ x: ex, y: ey, born: now });
        const next = (ends.get(key(ex, ey)) ?? []).filter((n) => n !== t);
        if (next.length && sig.hops < MAX_HOPS && Math.random() < 0.85) {
          const n = next[Math.floor(Math.random() * next.length)];
          sig.trace = n;
          sig.dir = n.pts[0] === ex && n.pts[1] === ey ? 1 : -1;
          sig.at = 0;
          sig.hops++;
        } else {
          signals.splice(i, 1);
          continue;
        }
      }
      const tr = sig.trace;
      const head = sig.at;
      const tail = Math.max(0, head - sig.tail);
      const a = sig.dir === 1 ? tail : tr.len - head;
      const b = sig.dir === 1 ? head : tr.len - tail;
      const [hx, hy] = pointAt(tr, sig.dir === 1 ? head : tr.len - head);
      const [tx, ty] = pointAt(tr, sig.dir === 1 ? tail : tr.len - tail);
      const grad = ctx.createLinearGradient(tx * scale, ty * scale - oy, hx * scale, hy * scale - oy);
      grad.addColorStop(0, `rgb(${accent} / 0)`);
      grad.addColorStop(1, `rgb(${accentBright} / 0.9)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6 * Math.max(1, scale);
      ctx.beginPath();
      pathBetween(ctx, tr, a, b, scale, oy);
      ctx.stroke();
      const hg = ctx.createRadialGradient(hx * scale, hy * scale - oy, 0, hx * scale, hy * scale - oy, 7 * scale);
      hg.addColorStop(0, `rgb(${accentBright} / 0.95)`);
      hg.addColorStop(1, `rgb(${accent} / 0)`);
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(hx * scale, hy * scale - oy, 7 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. A pad flashes where a signal lands.
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      const k = (now - f.born) / FLASH_MS;
      if (k >= 1) {
        flashes.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgb(${accentBright} / ${0.7 * (1 - k)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(f.x * scale, f.y * scale - oy, (3 + k * 9) * scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    hushText();
  };

  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min(now - last, 64);
    last = now;
    draw(now, dt);
    if (signals.length || flashes.length) {
      raf = requestAnimationFrame(tick);
    } else {
      running = false;
    }
  };
  const start = () => {
    if (running || destroyed) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    start();
  };

  const onVisibility = () => {
    if (!document.hidden) start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  scheduleAmbient();

  return {
    setScale(s, top) {
      scale = s;
      groundTop = top;
      start();
    },
    resize,
    pointer(x, y = 0) {
      px = x;
      py = y;
      start();
    },
    scrolled(direction) {
      // Repaint the glow against the moved board, and now and then send a
      // signal down (or up) a lane in the direction of travel.
      start();
      const now = performance.now();
      if (now - lastScrollSpawn > 320) {
        lastScrollSpawn = now;
        spawn({ vertical: true, dir: direction, fast: true });
      }
    },
    boot() {
      for (let i = 0; i < 5; i++) {
        window.setTimeout(() => spawn({ fast: i % 2 === 0 }), 250 + i * 180);
      }
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(ambientTimer);
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
