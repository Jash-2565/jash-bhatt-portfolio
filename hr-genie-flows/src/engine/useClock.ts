import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/** A playhead in ms that advances on animation frames while playing. */
export function useClock(total: number, autoplay: boolean) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState(1);
  const live = useRef({ t, playing, speed, total });
  live.current = { t, playing, speed, total };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100); // don't leap after a background tab
      last = now;
      const c = live.current;
      if (c.playing) {
        const next = Math.min(c.t + dt * c.speed, c.total);
        c.t = next;
        setT(next);
        if (next >= c.total) setPlaying(false);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const seek = useCallback((ms: number) => {
    const next = Math.max(0, Math.min(ms, live.current.total));
    live.current.t = next;
    setT(next);
  }, []);

  const toggle = useCallback(() => {
    // Pressing play at the end starts again.
    if (!live.current.playing && live.current.t >= live.current.total - 1) seek(0);
    setPlaying((p) => !p);
  }, [seek]);

  return { t, playing, setPlaying, speed, setSpeed, seek, toggle };
}

/* ------------------------------------------------------- reduced motion */

export const ReducedMotion = createContext(false);
export const useReduced = () => useContext(ReducedMotion);

export function usePrefersReducedMotion(): boolean {
  const query = "(prefers-reduced-motion: reduce)";
  const forced = new URLSearchParams(location.search).get("motion") === "reduced";
  const [reduced, setReduced] = useState(() => forced || matchMedia(query).matches);
  useEffect(() => {
    if (forced) return;
    const mq = matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [forced]);
  return reduced;
}
