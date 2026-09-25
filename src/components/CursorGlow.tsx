import { useEffect, useRef } from 'react';
import { usePointerFine } from '../hooks/usePointerFine';

/** Half-life for locking onto a target, so the ring's jump from a circle to a
    button's outline reads as a snap rather than a teleport. While free, the
    ring has no lag at all: it sits exactly on the pointer. */
const LOCK_HALF_LIFE_MS = 30;
/** Diameter of the ring while it isn't locked onto anything. */
const IDLE_SIZE = 32;
/** Breathing room between a locked target's edge and the ring. */
const LOCK_PAD = 6;
/** Corner radius the ring takes when locked on a target with square corners. */
const MIN_LOCK_RADIUS = 6;
/** What the brackets lock onto. Zoomable case-study media are `role="button"`. */
const TARGETS = 'a, button, [role="button"], input, textarea, video';

/**
 * Ring + dot cursor with target lock: a glowing dot pinned to the exact
 * pointer, and a ring around it that morphs from a circle into a rounded
 * outline snapped around whatever clickable thing is under it.
 */
export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const enabled = usePointerFine();

  useEffect(() => {
    if (!enabled) return;

    // Hide the native OS cursor so only the custom cursor shows.
    document.documentElement.classList.add('hide-native-cursor');

    let raf = 0;
    let running = false;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    const box = {
      x: pointerX - IDLE_SIZE / 2,
      y: pointerY - IDLE_SIZE / 2,
      w: IDLE_SIZE,
      h: IDLE_SIZE,
      r: IDLE_SIZE / 2,
    };
    /** The locked target's own corner radius plus the padding, so the ring
        runs parallel to its outline. Read once per lock, not every frame. */
    let lockRadius = MIN_LOCK_RADIUS;
    let target: Element | null = null;
    let visible = false;
    let drawnPointX = NaN;
    let drawnPointY = NaN;
    const drawn = { x: NaN, y: NaN, w: NaN, h: NaN, r: NaN };

    const setVisible = (on: boolean) => {
      if (visible === on) return;
      visible = on;
      const v = on ? '1' : '0';
      if (dotRef.current) dotRef.current.style.opacity = v;
      if (ringRef.current) ringRef.current.style.opacity = v;
    };

    const resolveTarget = (node: Element | null) => {
      const next = node?.closest(TARGETS) ?? null;
      if (next && next !== target) {
        const own = parseFloat(getComputedStyle(next).borderTopLeftRadius) || 0;
        lockRadius = Math.max(own + LOCK_PAD, MIN_LOCK_RADIUS);
      }
      target = next;
      const locked = target ? 'true' : 'false';
      if (ringRef.current) ringRef.current.dataset.locked = locked;
      if (dotRef.current) dotRef.current.dataset.locked = locked;
    };

    const onMove = (e: MouseEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      resolveTarget(e.target instanceof Element ? e.target : null);
      setVisible(true);
      start();
    };

    // Scrolling moves the page under a still pointer without firing mousemove,
    // so re-read what's underneath or the ring stays locked on an element that
    // has scrolled away.
    const onScroll = () => {
      if (!visible) return;
      resolveTarget(document.elementFromPoint(pointerX, pointerY));
      start();
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    let last = performance.now();

    // Frame-rate independent easing toward a value with the given half-life.
    const approach = (from: number, to: number, dt: number, halfLife: number) => {
      const next = from + (to - from) * (1 - Math.pow(2, -dt / halfLife));
      return Math.abs(to - next) < 0.05 ? to : next;
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;

      // Measured every frame while locked: magnetic buttons drift toward the
      // pointer and cards lift on hover, and the ring should hold on.
      let tx: number, ty: number, tw: number, th: number, tr: number;
      if (target && target.isConnected) {
        const r = target.getBoundingClientRect();
        tx = r.left - LOCK_PAD;
        ty = r.top - LOCK_PAD;
        tw = r.width + LOCK_PAD * 2;
        th = r.height + LOCK_PAD * 2;
        tr = Math.min(lockRadius, tw / 2, th / 2);
        box.x = approach(box.x, tx, dt, LOCK_HALF_LIFE_MS);
        box.y = approach(box.y, ty, dt, LOCK_HALF_LIFE_MS);
        box.w = approach(box.w, tw, dt, LOCK_HALF_LIFE_MS);
        box.h = approach(box.h, th, dt, LOCK_HALF_LIFE_MS);
        box.r = approach(box.r, tr, dt, LOCK_HALF_LIFE_MS);
      } else {
        // Free: no trail. The ring is a circle pinned to the pointer the frame
        // it moves.
        tx = pointerX - IDLE_SIZE / 2;
        ty = pointerY - IDLE_SIZE / 2;
        tw = th = IDLE_SIZE;
        tr = IDLE_SIZE / 2;
        Object.assign(box, { x: tx, y: ty, w: tw, h: th, r: tr });
      }

      if (pointerX !== drawnPointX || pointerY !== drawnPointY) {
        drawnPointX = pointerX;
        drawnPointY = pointerY;
        if (dotRef.current) {
          dotRef.current.style.transform = `translate(${pointerX}px, ${pointerY}px)`;
        }
      }

      if (
        box.x !== drawn.x || box.y !== drawn.y || box.w !== drawn.w ||
        box.h !== drawn.h || box.r !== drawn.r
      ) {
        Object.assign(drawn, box);
        const el = ringRef.current;
        if (el) {
          el.style.transform = `translate(${box.x}px, ${box.y}px)`;
          el.style.width = `${box.w}px`;
          el.style.height = `${box.h}px`;
          el.style.borderRadius = `${box.r}px`;
        }
      }

      // Idle once everything has arrived. A locked target keeps the loop alive
      // so the ring can follow it if it moves.
      const settled =
        box.x === tx && box.y === ty && box.w === tw && box.h === th && box.r === tr;
      if (settled && !target) {
        running = false;
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    window.addEventListener('blur', onLeave);
    start();
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('blur', onLeave);
      running = false;
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('hide-native-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} className="cursor-ring" data-locked="false" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" data-locked="false" aria-hidden="true" />
    </>
  );
}
