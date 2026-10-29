import type { CSSProperties } from 'react';

type Segment = { text: string; accent?: boolean };

type RiseWordsProps = {
  segments: Segment[];
  /** Delay before the first word, in ms. */
  delay?: number;
  /** Gap between consecutive words, in ms. */
  stagger?: number;
};

/**
 * A headline whose words rise into place one after another, each out of its
 * own clipped line box, the way type comes up off a press. Plain CSS
 * animation — it runs once on load, off the main thread, while the page is
 * still busy decoding images.
 *
 * Screen readers get the sentence once, from the visually hidden copy; the
 * split words are hidden from them so the sentence is not read word by word.
 * Reduced motion lands every word in place (the global rule in index.css
 * collapses animation durations).
 */
export default function RiseWords({ segments, delay = 80, stagger = 32 }: RiseWordsProps) {
  let index = 0;
  const sentence = segments.map((segment) => segment.text).join('');
  return (
    <>
      <span className="sr-only">{sentence}</span>
      <span aria-hidden="true">
        {segments.map((segment, s) => {
          const words = segment.text.split(/(\s+)/);
          return (
            <span key={s} className={segment.accent ? 'accent-shimmer' : undefined}>
              {words.map((word, w) => {
                if (word === '') return null;
                if (/^\s+$/.test(word)) return ' ';
                const style = { '--rise-delay': `${delay + index++ * stagger}ms` } as CSSProperties;
                return (
                  <span key={w} className="rise-word">
                    <span className="rise-word-inner" style={style}>
                      {word}
                    </span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </>
  );
}
