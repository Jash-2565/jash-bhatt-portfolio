/**
 * How far the layout is scaled from the 16px root it was drawn at.
 *
 * index.css grows the root font size with the window above 1440px, and
 * everything in rem follows. A few things are measured in px instead — icon
 * sizes, Lewis's walkable strip, the circuit ground — and read this ratio to
 * keep up. It is also published as the `--ui-scale` CSS variable, which the
 * `.lucide` rule uses to zoom icons.
 */
let scale = 1;
const listeners = new Set<() => void>();

const measure = () => {
  const next = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
  if (next === scale) return;
  scale = next;
  document.documentElement.style.setProperty('--ui-scale', String(scale));
  listeners.forEach((listener) => listener());
};

/** The current scale. Cheap enough to read every frame. */
export const getUiScale = () => scale;

/** For useSyncExternalStore: call `listener` whenever the scale changes. */
export const subscribeUiScale = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Start tracking. Called once, before the first render. */
export const trackUiScale = () => {
  if (typeof window === 'undefined') return;
  scale = 0; // force the first measure to publish, even at exactly 1
  measure();
  window.addEventListener('resize', measure);
};
