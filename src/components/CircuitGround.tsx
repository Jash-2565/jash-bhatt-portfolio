import { useEffect, useMemo, useRef, useState } from 'react';
import { BAND, WIDTH, board } from '../lib/circuitBoard';

// Static circuit-trace ground, generated once for the full height of the page
// and scrolled with it. It replaces a fixed 512px tile that sat still behind
// the content, so every screen of scroll showed the same patch of routing.
//
// The routing itself comes from lib/circuitBoard, which the static 404 page
// shares. This component only sizes the board to the page and draws it.

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
  const { traces, pads } = useMemo(() => board(bands), [bands]);

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
