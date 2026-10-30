type Props = {
  /** Morphs the bars into an X. */
  open: boolean;
};

/**
 * Menu glyph: three bars of unequal length with a cyan top rule, so it reads as
 * a code listing rather than a generic hamburger while keeping the familiar
 * shape that makes it recognisable as navigation.
 *
 * Every bar is a full-width bar on the centre line, placed and shortened with
 * `transform` alone (`.menu-glyph` in index.css). It used to animate `top` and
 * `width`, which re-ran layout on every frame of the morph — while the menu
 * drawer was animating beside it.
 */
export default function MenuIcon({ open }: Props) {
  return (
    <span className="menu-glyph relative block h-5 w-6" data-open={open} aria-hidden="true">
      {/* Top — full width, accent. Becomes one stroke of the X. */}
      <span className="menu-glyph-bar menu-glyph-top bg-accent" />
      {/* Middle — shortest bar. Fades so the X reads as two clean strokes. */}
      <span className="menu-glyph-bar menu-glyph-mid bg-ink-body" />
      {/* Bottom — mid length, giving the ragged left edge. */}
      <span className="menu-glyph-bar menu-glyph-bot bg-ink-body" />
    </span>
  );
}
