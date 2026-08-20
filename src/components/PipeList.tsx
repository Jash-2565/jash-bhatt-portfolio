type Props = {
  items: string[];
  /**
   * 'row' fills left-to-right then down; 'column' fills top-to-bottom then over
   * to the next column. Grid is row-major only, so the column-major variant
   * uses CSS multi-column instead.
   */
  flow?: 'row' | 'column';
  /** Colour class applied to the items; the separators stay neutral. */
  className?: string;
};

/**
 * Two-column list with a separator leading each item.
 *
 * Putting the pipe in front is what makes it both adjacent and aligned: every
 * item starts at its column's left edge, so the leading pipes stack into two
 * straight vertical lines while still sitting directly against their own text.
 *
 * Single column below `sm` — two columns leave roughly 140px for text on a
 * 375px screen, which wrapped even short entries like "Product Design".
 */
export default function PipeList({ items, flow = 'row', className = '' }: Props) {
  // break-inside-avoid stops an item splitting across the column boundary;
  // flex keeps a wrapped item indented under its own text rather than running
  // back under the separator.
  const item = (label: string) => (
    <div key={label} className="flex gap-2 break-inside-avoid pb-1.5">
      <span aria-hidden="true" className="text-slate-600">|</span>
      <span>{label}</span>
    </div>
  );

  const layout =
    flow === 'column'
      ? 'columns-1 sm:columns-2 gap-x-6'
      : 'grid grid-cols-1 sm:grid-cols-2 gap-x-6';

  return <div className={`${layout} ${className}`}>{items.map(item)}</div>;
}
