import { PUBLIC_URL } from '../utils/getBaseUrl';

/**
 * The Lewis spritesheet's geometry and animation table.
 *
 * These values are lifted from the macOS app's own animation table, so anything
 * drawn from them — the pet that walks along the page, the strip in
 * Explorations — runs the same artwork at the same cadence as the app itself.
 */

export const ATLAS_COLS = 8;
export const CELL_W = 192;
export const CELL_H = 208;

export const ATLAS_URL = `${PUBLIC_URL}/images/Lewis Pet/lewis-spritesheet.webp`;

export type Animation = {
  row: number;
  frames: number;
  /** Seconds per frame. */
  frameDuration: number;
  /** Loops before the animation is considered finished. 0 means it never ends
      on its own. */
  repeats: number;
};

export const ANIMATIONS = {
  idle: { row: 0, frames: 6, frameDuration: 0.18, repeats: 0 },
  runningRight: { row: 1, frames: 8, frameDuration: 0.1, repeats: 0 },
  runningLeft: { row: 2, frames: 8, frameDuration: 0.1, repeats: 0 },
  waving: { row: 3, frames: 4, frameDuration: 0.16, repeats: 3 },
  jumping: { row: 4, frames: 5, frameDuration: 0.14, repeats: 2 },
  failed: { row: 5, frames: 8, frameDuration: 0.18, repeats: 1 },
  waiting: { row: 6, frames: 6, frameDuration: 0.22, repeats: 2 },
  review: { row: 8, frames: 6, frameDuration: 0.16, repeats: 3 },
} satisfies Record<string, Animation>;

export type AnimationName = keyof typeof ANIMATIONS;

/** The Explorations card fires this to bring the pet back after a dismissal. */
export const SUMMON_EVENT = 'lewis:summon';

/** Background shorthand shared by every sprite surface. `pixelated` matters:
    the art is drawn at 192px and shown at around 80px, and bilinear scaling
    turns the linework to mush. */
export const spriteStyle = (scale: number) => ({
  backgroundImage: `url("${ATLAS_URL}")`,
  backgroundSize: `${ATLAS_COLS * CELL_W * scale}px auto`,
  backgroundRepeat: 'no-repeat' as const,
  imageRendering: 'pixelated' as const,
});

/** Where to park the background for a given cell. */
export const framePosition = (row: number, frame: number, scale: number) =>
  `${-(frame % ATLAS_COLS) * CELL_W * scale}px ${-row * CELL_H * scale}px`;
