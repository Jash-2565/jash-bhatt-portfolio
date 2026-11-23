interface LiveEmbedProps {
  /** A self-contained page under public/ (built from its own project). */
  src: string;
  title: string;
  caption: string;
}

/**
 * An interactive page of ours, shown inline at every width. From md up it is
 * framed at 16:9 and lays itself out on a fixed 1920×1080 stage that scales
 * to fit. Below md the frame is portrait (460×700), which the page reads as
 * its cue to switch to a stacked phone layout that stays legible.
 */
const LiveEmbed = ({ src, title, caption }: LiveEmbedProps) => (
  <figure className="mt-10 m-0 flex flex-col gap-3">
    <div className="w-full rounded-2xl overflow-hidden bg-[var(--surface-1)] shadow-lg aspect-[460/700] md:aspect-video">
      <iframe src={src} title={title} className="w-full h-full" loading="lazy" style={{ border: 'none' }} />
    </div>
    <figcaption className="text-sm text-ink-muted text-center">{caption}</figcaption>
  </figure>
);

export default LiveEmbed;
