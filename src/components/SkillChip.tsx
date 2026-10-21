type SkillChipProps = {
  /** Reference designator, as printed beside a part on a board: U1, U2… */
  designator: string;
  title: string;
  items: string[];
};

/**
 * A skill group drawn as an IC package: a body with a pin-1 notch, and each
 * skill as a numbered pin leaving its edge. Items fill row by row, so on two
 * columns the odd pins leave the left side and the even ones the right, as
 * on a DIP. Single column below `sm`, all pins on the left — two columns
 * leave roughly 140px for text on a 375px screen.
 */
export default function SkillChip({ designator, title, items }: SkillChipProps) {
  return (
    <div className="ic-chip">
      <div className="flex items-baseline gap-3 mb-4 md:mb-5">
        <span className="label text-ink-muted">{designator}</span>
        <h3 className="text-xl font-semibold tracking-tight text-ink">{title}</h3>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
        {items.map((item, index) => (
          <li key={item} className="ic-pin text-sm font-medium text-accent-br">
            <span className="label text-ink-muted w-5 shrink-0" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
