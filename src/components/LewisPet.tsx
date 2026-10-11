import { useEffect, useRef, useState } from 'react';
import { usePointerFine } from '../hooks/usePointerFine';
import { getUiScale } from '../utils/uiScale';
import {
  ANIMATIONS,
  CELL_H,
  CELL_W,
  SUMMON_EVENT,
  framePosition,
  spriteStyle,
  type AnimationName,
} from '../config/lewis';

/**
 * Lewis, the desktop pet, ported from the macOS app to the page.
 *
 * The Swift build gives him a window that walks along the edge of the screen,
 * idles between errands, and reacts when you bother him. This is the same
 * behaviour loop against the same atlas, with the viewport standing in for the
 * desktop. Mouse-only and off under reduced motion, like every other flourish
 * on this site.
 */

/** The app's own default scale. Small enough that he reads as an inhabitant
    of the page rather than an illustration placed on it. */
const DISPLAY_SCALE = 0.4;
/** Smallest he shrinks to when squeezing into a narrow margin. */
const MIN_SCALE = 0.16;

/** Walking pace, px/sec. Tuned so a stride lands about where the run cycle
    suggests it should — faster and he moonwalks. Long trips (crossing the
    page to reach the margin) run faster, or they'd take a quarter-minute. */
const WALK_SPEED = 92;
const TRAVEL_SPEED = 240;
const TRAVEL_DISTANCE = 300;
/** Keeps him off the very edge of the viewport, where he'd clip. */
const EDGE_MARGIN = 16;
/** Breathing room between him and the content column in the margin. */
const MARGIN_GAP = 6;
/** The back-to-top button occupies the bottom-right corner — 48px wide, 20px
    in from the edge, at the 16px root — and sits at the same z-index as the
    pet, who is tall enough to cover it completely. Ending his walkable strip
    short of it keeps him from parking on a control, rather than relying on
    him wandering off. The button is sized in rem, so this scales with it. */
const backToTopKeepout = () => (20 + 48) * getUiScale() + 12;

/** How long he stands around before finding something to do, in seconds. The
    app calls this its 'normal' activity level; the range reads well here too.
    In Contact he's restless. */
const IDLE: Record<'normal' | 'restless', [number, number]> = { normal: [3, 8], restless: [1, 2.5] };

const STORAGE_KEY = 'lewis-pet-dismissed';

/** Mirrors `ui.shell` (max-w-[84rem], lg:px-12): the left edge of the content
    column, centred in the viewport. Left of it is the margin he keeps to while
    the work is being read. Both are rem, so they grow with the layout above
    1440px. The left margin rather than the right: the right one holds the
    back-to-top button. */
const contentLeftEdge = () => {
  const rem = 16 * getUiScale();
  return (window.innerWidth - Math.min(window.innerWidth, 84 * rem)) / 2 + 3 * rem;
};

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Where he's allowed to be, set by the section being read:
 * - `free`   — the hero. He's out on the page to say hello.
 * - `margin` — Work, About, and the case studies. He walks into the left
 *              margin and stays there, shrinking to fit it, so he never stands
 *              on the work.
 * - `roam`   — Contact. He wanders the whole width, restlessly.
 */
export type LewisZone = 'free' | 'margin' | 'roam';

export default function LewisPet({ zone }: { zone: LewisZone }) {
  const petRef = useRef<HTMLDivElement>(null);
  // Read by the loop every frame, so a change of section re-bounds him in
  // place — he walks to the new zone — instead of restarting the effect and
  // snapping him back to the dock.
  const zoneRef = useRef(zone);
  useEffect(() => {
    zoneRef.current = zone;
  }, [zone]);
  const enabled = usePointerFine();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  });
  /** Written by the pointer handlers, drained by the loop. A ref rather than
      state: greeting him must not re-render the page, and the loop owns the
      timing of when the interruption actually takes effect. */
  const requestRef = useRef<AnimationName | null>(null);

  useEffect(() => {
    const summon = () => {
      window.localStorage.removeItem(STORAGE_KEY);
      setDismissed(false);
    };
    window.addEventListener(SUMMON_EVENT, summon);
    return () => window.removeEventListener(SUMMON_EVENT, summon);
  }, []);

  useEffect(() => {
    if (!enabled || dismissed) return;
    const node = petRef.current;
    if (!node) return;

    let raf = 0;
    /** Current size, eased toward the zone's size so he shrinks as he walks
        into a narrow margin rather than popping. */
    let scale = DISPLAY_SCALE;
    const petW = () => CELL_W * scale;

    const targetScale = () => {
      if (zoneRef.current !== 'margin') return DISPLAY_SCALE;
      const room = contentLeftEdge() - 2 * MARGIN_GAP;
      return Math.max(MIN_SCALE, Math.min(DISPLAY_SCALE, room / CELL_W));
    };

    const minX = () => (zoneRef.current === 'margin' ? MARGIN_GAP : EDGE_MARGIN);
    const maxX = () =>
      zoneRef.current === 'margin'
        ? Math.max(MARGIN_GAP, contentLeftEdge() - MARGIN_GAP - CELL_W * targetScale())
        : Math.max(EDGE_MARGIN, window.innerWidth - petW() - backToTopKeepout());

    // He starts docked to the right, the app's default side — at the edge of
    // the walkable strip, which already stops short of the back-to-top button.
    let x = Math.max(EDGE_MARGIN, window.innerWidth - petW() - backToTopKeepout());

    let animation: AnimationName = 'idle';
    let frameIndex = 0;
    let frameClock = 0;
    let loops = 0;
    /** Where he's headed, or null when he's staying put. */
    let walkTarget: number | null = null;
    let walkSpeed = WALK_SPEED;
    const idleRange = (): [number, number] => (zoneRef.current === 'roam' ? IDLE.restless : IDLE.normal);
    /** Seconds of idling left before he picks something to do. */
    let idleCountdown = randomBetween(...IDLE.normal);
    let currentZone = zoneRef.current;

    /** How far to raise him so he stands on the footer's top edge instead of
        over the credit line. Zero until the footer scrolls into view. */
    let lift = 0;
    const measureLift = () => {
      const footer = document.querySelector('footer');
      lift = footer ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top) : 0;
    };
    measureLift();
    window.addEventListener('scroll', measureLift, { passive: true });
    window.addEventListener('resize', measureLift);

    // What was last written to the DOM, so a pet standing still writes nothing.
    let drawnX = NaN;
    let drawnLift = NaN;
    let drawnRow = NaN;
    let drawnFrame = NaN;
    let drawnScale = NaN;

    /** Too little room to take a step: he stays put and only emotes. */
    const canWalk = () => maxX() - minX() >= petW() / 2;

    const play = (next: AnimationName) => {
      animation = next;
      frameIndex = 0;
      frameClock = 0;
      loops = 0;
    };

    const rest = () => {
      walkTarget = null;
      play('idle');
      idleCountdown = randomBetween(...idleRange());
    };

    const walkTo = (target: number) => {
      const clamped = Math.max(minX(), Math.min(maxX(), target));
      walkTarget = clamped;
      walkSpeed = Math.abs(clamped - x) > TRAVEL_DISTANCE ? TRAVEL_SPEED : WALK_SPEED;
      play(clamped < x ? 'runningLeft' : 'runningRight');
    };

    /** Idle long enough and he entertains himself. Walking is weighted highest
        — a pet that only ever emotes in place looks stuck — and in Contact
        it's nearly all he does. */
    const decide = () => {
      const roll = Math.random();
      const walkChance = zoneRef.current === 'roam' ? 0.85 : 0.55;
      if (roll < walkChance) {
        if (canWalk()) walkTo(randomBetween(minX(), maxX()));
        else rest();
      }
      else if (roll < walkChance + 0.15) play('waving');
      else if (roll < walkChance + 0.27) play('jumping');
      else if (roll < walkChance + 0.38) play('waiting');
      else play('review');
    };

    let last = performance.now();

    const tick = (now: number) => {
      // Clamped so a tab returning from the background doesn't resume with one
      // enormous step that teleports him across the viewport.
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // A change of section: walk to the new zone, or set off in Contact.
      if (zoneRef.current !== currentZone) {
        currentZone = zoneRef.current;
        if (currentZone === 'roam') walkTo(randomBetween(minX(), maxX()));
        else if (x < minX() || x > maxX()) walkTo(x < minX() ? minX() : maxX());
        else rest();
      }

      // A hover or a click interrupts whatever he was doing.
      const requested = requestRef.current;
      if (requested) {
        requestRef.current = null;
        walkTarget = null;
        play(requested);
      }

      const spec = ANIMATIONS[animation];

      frameClock += dt;
      while (frameClock >= spec.frameDuration) {
        frameClock -= spec.frameDuration;
        frameIndex += 1;
        if (frameIndex >= spec.frames) {
          frameIndex = 0;
          loops += 1;
        }
      }

      if (walkTarget !== null) {
        const step = walkSpeed * dt;
        const gap = walkTarget - x;
        if (Math.abs(gap) <= step) {
          x = walkTarget;
          rest();
        } else {
          x += Math.sign(gap) * step;
        }
      } else if (spec.repeats > 0 && loops >= spec.repeats) {
        // A one-shot that has played itself out.
        rest();
      } else if (animation === 'idle') {
        idleCountdown -= dt;
        if (idleCountdown <= 0) decide();
      }

      // Ease toward the zone's size. In the margin he shrinks as he arrives;
      // leaving it, he grows back as he walks out.
      const goal = targetScale();
      scale += (goal - scale) * Math.min(1, dt * 4);
      if (Math.abs(goal - scale) < 0.002) scale = goal;

      // Corrected here rather than on a resize listener: the window can narrow
      // mid-stride, and the next frame puts him back in bounds regardless.
      if (walkTarget === null && animation === 'idle') {
        if (x > maxX()) walkTo(maxX());
        else if (x < minX()) walkTo(minX());
      }

      if (scale !== drawnScale) {
        drawnScale = scale;
        drawnRow = NaN; // the frame offset depends on the scale too
        node.style.width = `${CELL_W * scale}px`;
        node.style.height = `${CELL_H * scale}px`;
        node.style.backgroundSize = spriteStyle(scale).backgroundSize;
      }

      if (x !== drawnX || lift !== drawnLift) {
        drawnX = x;
        drawnLift = lift;
        node.style.transform = `translate3d(${x}px, ${-lift}px, 0)`;
      }

      if (spec.row !== drawnRow || frameIndex !== drawnFrame) {
        drawnRow = spec.row;
        drawnFrame = frameIndex;
        node.style.backgroundPosition = framePosition(spec.row, frameIndex, scale);
      }

      raf = requestAnimationFrame(tick);
    };

    // Pausing on a hidden tab keeps a pet nobody is looking at off the CPU.
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    last = performance.now();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('scroll', measureLift);
      window.removeEventListener('resize', measureLift);
    };
  }, [enabled, dismissed]);

  if (!enabled || dismissed) return null;

  return (
    // The wrapper is the moving frame; only the sprite and the dismiss button
    // take pointer events, so his transparent corners don't eat clicks on the
    // page behind him.
    <div
      ref={petRef}
      className="fixed bottom-0 left-0 z-40 pointer-events-none"
      style={{ ...spriteStyle(DISPLAY_SCALE), width: CELL_W * DISPLAY_SCALE, height: CELL_H * DISPLAY_SCALE }}
      onMouseEnter={() => {
        requestRef.current = 'waving';
      }}
      onClick={() => {
        requestRef.current = 'jumping';
      }}
    >
      {/* The label sits here rather than on the wrapper: `role="img"` makes its
          subtree presentational, which would hide the dismiss button below from
          assistive tech. */}
      <div
        className="absolute inset-0 pointer-events-auto cursor-pointer"
        role="img"
        aria-label="Lewis, a pixel-art pet walking along the page"
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          window.localStorage.setItem(STORAGE_KEY, 'true');
          setDismissed(true);
        }}
        aria-label="Send Lewis away"
        // Out of the sequential tab order: the pet is decoration, and this
        // button rendered early enough in the tree to be the second thing a
        // keyboard user reached on every page — ahead of the skip link. Still
        // reachable with a pointer, and still focusable programmatically.
        tabIndex={-1}
        // A 44x44 hit area around a 28px glyph, which is the target size this
        // codebase sets as its own standard in `ui.tapTarget`.
        // Visible at rest, so sending him away never depends on finding a
        // control that only appears on hover.
        className="absolute -top-[0.55rem] -right-[0.55rem] pointer-events-auto grid h-11 w-11 place-items-center opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
      >
        <span
          aria-hidden="true"
          className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-sm leading-none text-ink-body ring-1 ring-white/20 hover:text-white"
        >
          ×
        </span>
      </button>
    </div>
  );
}
