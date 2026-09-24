import { useEffect, useRef, useState } from 'react';
import { usePointerFine } from '../hooks/usePointerFine';
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
const PET_W = CELL_W * DISPLAY_SCALE;
const PET_H = CELL_H * DISPLAY_SCALE;

/** Walking pace, px/sec. Tuned so a stride lands about where the run cycle
    suggests it should — faster and he moonwalks. */
const WALK_SPEED = 92;
/** Keeps him off the very edge of the viewport, where he'd clip. */
const EDGE_MARGIN = 16;
/** The back-to-top button occupies the bottom-right corner — 48px wide, 20px
    in from the edge — and sits at the same z-index as the pet, who is tall
    enough to cover it completely. Ending his walkable strip short of it keeps
    him from parking on a control, rather than relying on him wandering off. */
const BACK_TO_TOP_KEEPOUT = 20 + 48 + 12;

/** How long he stands around before finding something to do, in seconds. The
    app calls this its 'normal' activity level; the range reads well here too. */
const IDLE_DELAY_MIN = 3;
const IDLE_DELAY_MAX = 8;

const STORAGE_KEY = 'lewis-pet-dismissed';

/** Mirrors `ui.shell` (max-w-[84rem], lg:px-12): the right edge of the content
    column, centred in the viewport. Past it is gutter he can walk in without
    covering text. */
const SHELL_MAX_W = 1344;
const SHELL_PAD = 48;
const contentRightEdge = () =>
  (window.innerWidth + Math.min(window.innerWidth, SHELL_MAX_W)) / 2 - SHELL_PAD;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

type LewisPetProps = {
  /** Keep to the gutter right of the content column. For reading pages, where
      walking the full width would carry him across body copy. */
  gutterOnly?: boolean;
};

export default function LewisPet({ gutterOnly = false }: LewisPetProps) {
  const petRef = useRef<HTMLDivElement>(null);
  // Read by the loop every frame, so switching pages re-bounds him in place
  // instead of restarting the effect and snapping him back to the dock.
  const gutterOnlyRef = useRef(gutterOnly);
  useEffect(() => {
    gutterOnlyRef.current = gutterOnly;
  }, [gutterOnly]);
  const enabled = usePointerFine();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [hovered, setHovered] = useState(false);
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
    // He starts docked to the right, the app's default side — at the edge of
    // the walkable strip, which already stops short of the back-to-top button.
    let x = Math.max(EDGE_MARGIN, window.innerWidth - PET_W - BACK_TO_TOP_KEEPOUT);

    let animation: AnimationName = 'idle';
    let frameIndex = 0;
    let frameClock = 0;
    let loops = 0;
    /** Where he's headed, or null when he's staying put. */
    let walkTarget: number | null = null;
    /** Seconds of idling left before he picks something to do. */
    let idleCountdown = randomBetween(IDLE_DELAY_MIN, IDLE_DELAY_MAX);

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

    const maxX = () =>
      Math.max(EDGE_MARGIN, window.innerWidth - PET_W - BACK_TO_TOP_KEEPOUT);
    /** In gutter mode, the gutter's left edge — or maxX when the gutter is too
        narrow to hold him, which parks him beside the back-to-top button. */
    const minX = () => {
      if (!gutterOnlyRef.current) return EDGE_MARGIN;
      return Math.min(maxX(), contentRightEdge() + EDGE_MARGIN);
    };
    /** Too little room to take a step: he stays put and only emotes. */
    const canWalk = () => maxX() - minX() >= PET_W;

    const play = (next: AnimationName) => {
      animation = next;
      frameIndex = 0;
      frameClock = 0;
      loops = 0;
    };

    const rest = () => {
      walkTarget = null;
      play('idle');
      idleCountdown = randomBetween(IDLE_DELAY_MIN, IDLE_DELAY_MAX);
    };

    const walkTo = (target: number) => {
      const clamped = Math.max(minX(), Math.min(maxX(), target));
      walkTarget = clamped;
      play(clamped < x ? 'runningLeft' : 'runningRight');
    };

    /** Idle long enough and he entertains himself. Walking is weighted highest:
        a pet that only ever emotes in place looks stuck. */
    const decide = () => {
      const roll = Math.random();
      if (roll < 0.55) {
        if (canWalk()) walkTo(randomBetween(minX(), maxX()));
        else rest();
      }
      else if (roll < 0.7) play('waving');
      else if (roll < 0.82) play('jumping');
      else if (roll < 0.93) play('waiting');
      else play('review');
    };

    let last = performance.now();

    const tick = (now: number) => {
      // Clamped so a tab returning from the background doesn't resume with one
      // enormous step that teleports him across the viewport.
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

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
        const step = WALK_SPEED * dt;
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

      // Corrected here rather than on a resize listener: the window can narrow
      // mid-stride, and the next frame puts him back in bounds regardless.
      // The same goes for entering gutter mode: he walks himself back out of
      // the content column rather than jumping.
      const limit = maxX();
      if (x > limit) x = limit;
      if (walkTarget === null && animation === 'idle' && x < minX()) walkTo(minX());

      if (x !== drawnX || lift !== drawnLift) {
        drawnX = x;
        drawnLift = lift;
        node.style.transform = `translate3d(${x}px, ${-lift}px, 0)`;
      }

      if (spec.row !== drawnRow || frameIndex !== drawnFrame) {
        drawnRow = spec.row;
        drawnFrame = frameIndex;
        node.style.backgroundPosition = framePosition(spec.row, frameIndex, DISPLAY_SCALE);
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
      style={{ ...spriteStyle(DISPLAY_SCALE), width: PET_W, height: PET_H }}
      onMouseEnter={() => {
        setHovered(true);
        requestRef.current = 'waving';
      }}
      onMouseLeave={() => setHovered(false)}
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
        className={`absolute -top-[0.55rem] -right-[0.55rem] pointer-events-auto grid h-11 w-11 place-items-center transition-opacity focus-visible:opacity-100 focus-visible:outline-none ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span
          aria-hidden="true"
          className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-sm leading-none text-slate-300 ring-1 ring-white/20 hover:text-white"
        >
          ×
        </span>
      </button>
    </div>
  );
}
