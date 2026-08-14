type Props = {
  /** Morphs the bars into an X. */
  open: boolean;
};

/**
 * Menu glyph: three bars of unequal length with a cyan top rule, so it reads as
 * a code listing rather than a generic hamburger while keeping the familiar
 * shape that makes it recognisable as navigation.
 *
 * All three bars are positioned on the same axis (`top`) rather than one from
 * each edge — animating between `top` and `bottom` would jump instead of
 * sliding, since only one of the two can be the active property at a time.
 * In a 20px box with 2px bars, 9px is the centre line.
 */
export default function MenuIcon({ open }: Props) {
  const bar = 'menu-glyph-bar absolute left-0 h-[2px] rounded-full transition-all duration-300 ease-out';

  return (
    <span className="relative block h-5 w-6" aria-hidden="true">
      {/* Top — full width, accent. Becomes one stroke of the X. */}
      <span
        className={`${bar} w-6 bg-[#01F5D1] ${open ? 'top-[9px] rotate-45' : 'top-[3px] rotate-0'}`}
      />
      {/* Middle — shortest bar. Fades so the X reads as two clean strokes. */}
      <span
        className={`${bar} top-[9px] bg-slate-300 ${open ? 'w-6 opacity-0' : 'w-[15px] opacity-100'}`}
      />
      {/* Bottom — mid length, giving the ragged right edge. */}
      <span
        className={`${bar} bg-slate-300 ${open ? 'top-[9px] w-6 -rotate-45' : 'top-[15px] w-[20px] rotate-0'}`}
      />
    </span>
  );
}
