import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { BAND, WIDTH, board } from '../lib/circuitBoard';
import { createSignalField } from '../lib/circuitSignals';
import type { SignalField } from '../lib/circuitSignals';
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

// Phones draw the same board 1.25× larger, as the tile used to be, so it
// reads as routing rather than as noise. Above 1440px it scales with the rest
// of the layout (see utils/uiScale), so the traces keep their weight beside
// the content instead of thinning out on a monitor.
const PHONE = '(max-width: 767px)';

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

  const drawnHeight = bands * BAND;
  return (
    <div ref={ref} className="circuit-ground" aria-hidden="true">
      <canvas ref={canvasRef} className="circuit-live" />
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
