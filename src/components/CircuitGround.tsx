import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { BAND, WIDTH, board } from '../lib/circuitBoard';
import { createSignalField } from '../lib/circuitSignals';
import type { SignalField } from '../lib/circuitSignals';
import { QUIET_FEATHER, measureQuiet } from '../lib/quietZones';
import { getUiScale, subscribeUiScale } from '../utils/uiScale';

// Static circuit-trace ground, generated once for the full height of the page
// and scrolled with it. It replaces a fixed 512px tile that sat still behind
// the content, so every screen of scroll showed the same patch of routing.
//
// The routing itself comes from lib/circuitBoard, which the static 404 page
// shares. This component sizes the board to the page and draws it.
//
// Over it sits the live layer (lib/circuitSignals): a fixed canvas the size of
// the window that lights the routing around the cursor and sends signals along
// it — idly on a mouse, and down the lanes in the direction of travel as the
// page scrolls, on every device. Under reduced motion only the cursor light
// remains, since that moves only when the reader does.
//
// Both layers stay clear of text (lib/quietZones). The live layer cuts its own
// drawing each frame; the static board is masked by an image of the page's
// text boxes, drawn small and stretched up, so the upscale itself softens the
// edge. It is redrawn only when the layout may have moved.

// Phones draw the same board 1.25× larger, as the tile used to be, so it
// reads as routing rather than as noise. Above 1440px it scales with the rest
// of the layout (see utils/uiScale), so the traces keep their weight beside
// the content instead of thinning out on a monitor.
const PHONE = '(max-width: 767px)';
// The text mask is drawn at an eighth of the page's size: a 1440×10,000 page
// is a 180×1250 image.
const MASK_SCALE = 1 / 8;

export default function CircuitGround() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [isPhone, setIsPhone] = useState(false);
  const uiScale = useSyncExternalStore(subscribeUiScale, getUiScale, () => 1);
  const scale = isPhone ? 1.25 : uiScale;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(el);
    const phone = window.matchMedia(PHONE);
    const sync = () => setIsPhone(phone.matches);
    sync();
    phone.addEventListener('change', sync);
    return () => {
      observer.disconnect();
      phone.removeEventListener('change', sync);
    };
  }, []);

  // Only whole bands change the drawing, so resizes inside a band are free.
  const bands = Math.ceil(height / scale / BAND);
  const { traces, pads } = useMemo(() => board(bands), [bands]);

  // The live layer, created once. Scale changes are pushed in below.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<SignalField | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const field = createSignalField(canvas, { ambient: fine, motion });
    fieldRef.current = field;

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      field.scrolled(y >= lastY ? 1 : -1);
      lastY = y;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') field.pointer(e.clientX, e.clientY);
    };
    const onLeave = () => field.pointer(null);
    const onResize = () => field.resize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    window.addEventListener('resize', onResize);
    // Power-up: a few signals leave from the routing on screen once the
    // first paint has settled.
    const boot = window.setTimeout(() => field.boot(), 500);
    return () => {
      clearTimeout(boot);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('resize', onResize);
      field.destroy();
      fieldRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !fieldRef.current) return;
    fieldRef.current.setScale(scale, el.getBoundingClientRect().top + window.scrollY);
  }, [scale, height]);

  // The static board's text mask. Redrawn on anything that can move text: a
  // resize, a change of view, a reveal finishing after a scroll. Each trigger
  // paints twice — soon, and again once entrance animations have settled.
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const ground = ref.current;
    if (!ground) return;
    const mask = document.createElement('canvas');
    const ctx = mask.getContext('2d');
    if (!ctx) return;
    let url = '';
    let soon = 0;
    let settled = 0;
    let disposed = false;

    const paint = () => {
      const svg = svgRef.current;
      if (!svg || disposed) return;
      const box = ground.getBoundingClientRect();
      const zones = measureQuiet(box.left, box.top);
      mask.width = Math.max(1, Math.ceil(box.width * MASK_SCALE));
      mask.height = Math.max(1, Math.ceil(box.height * MASK_SCALE));
      ctx.setTransform(MASK_SCALE, 0, 0, MASK_SCALE, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'none';
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, box.width, box.height);
      ctx.globalCompositeOperation = 'destination-out';
      if ('filter' in ctx) ctx.filter = `blur(${QUIET_FEATHER * MASK_SCALE}px)`;
      ctx.beginPath();
      for (const z of zones) ctx.rect(z.x, z.y, z.w, z.h);
      ctx.fill();
      mask.toBlob((blob) => {
        if (!blob || disposed) return;
        const next = URL.createObjectURL(blob);
        const value = `url(${next})`;
        // Sized to the page, not the SVG: the board is drawn wider and taller
        // than the page and clipped, and the mask has to line up with the text.
        const size = `${box.width}px ${box.height}px`;
        for (const [k, v] of [['maskImage', value], ['webkitMaskImage', value], ['maskSize', size], ['webkitMaskSize', size]] as const) {
          svg.style[k] = v;
        }
        svg.style.maskRepeat = 'no-repeat';
        svg.style.webkitMaskRepeat = 'no-repeat';
        if (url) URL.revokeObjectURL(url);
        url = next;
      });
    };

    const schedule = () => {
      clearTimeout(soon);
      clearTimeout(settled);
      soon = window.setTimeout(paint, 200);
      settled = window.setTimeout(paint, 1100);
    };

    schedule();
    void document.fonts?.ready.then(schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(ground);
    const main = document.getElementById('main');
    const mutations = new MutationObserver(schedule);
    if (main) mutations.observe(main, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      disposed = true;
      clearTimeout(soon);
      clearTimeout(settled);
      resize.disconnect();
      mutations.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  const drawnHeight = bands * BAND;
  return (
    <div ref={ref} className="circuit-ground" aria-hidden="true">
      <canvas ref={canvasRef} className="circuit-live" />
      {bands > 0 && (
        <svg
          ref={svgRef}
          width={WIDTH * scale}
          height={drawnHeight * scale}
          viewBox={`0 0 ${WIDTH} ${drawnHeight}`}
          fill="none"
        >
          <path
            d={traces}
            stroke="currentColor"
            strokeOpacity={0.12}
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
