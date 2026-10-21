// Where the circuit ground stays out of the way: every piece of copy on the
// page, padded. Shared by the live layer (circuitSignals), which cuts its
// signals and cursor light out around these each frame, and the static board
// (CircuitGround), which is masked by them — so text always sits on a plain,
// still ground, and both layers agree on exactly where that is.

export const QUIET_SELECTOR =
  '#root :is(h1, h2, h3, h4, h5, h6, p, li, dt, dd, blockquote, figcaption, label, th, td, .label, .ghost-number)';
/** Clearance around the text before the feathered edge begins, in css px. */
export const QUIET_PAD = 28;
/** Blur radius of that edge, in css px. */
export const QUIET_FEATHER = 14;

export type Zone = { x: number; y: number; w: number; h: number };

/** Every text box on the page, padded, relative to a point given in viewport
    coordinates — pass the top-left of whatever the zones will be drawn on. */
export function measureQuiet(originX: number, originY: number): Zone[] {
  const zones: Zone[] = [];
  for (const el of document.querySelectorAll(QUIET_SELECTOR)) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    zones.push({
      x: r.left - originX - QUIET_PAD,
      y: r.top - originY - QUIET_PAD,
      w: r.width + QUIET_PAD * 2,
      h: r.height + QUIET_PAD * 2,
    });
  }
  return zones;
}
