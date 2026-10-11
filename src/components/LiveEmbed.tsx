interface LiveEmbedProps {
  /** A self-contained page under public/ (built from its own project). */
  src: string;
  title: string;
  caption: string;
}

/**
 * An interactive page of ours, framed at 16:9 and shown inline at every
 * width. It lays itself out on a fixed 1920×1080 stage that scales to fit
 * the frame, so it keeps its proportions at any column width.
 */
const LiveEmbed = ({ src, title, caption }: LiveEmbedProps) => (
  <figure className="mt-10 m-0 flex flex-col gap-3">
    <div className="w-full rounded-2xl overflow-hidden bg-[var(--surface-1)] shadow-lg" style={{ aspectRatio: '16/9' }}>
      <iframe src={src} title={title} className="w-full h-full" loading="lazy" style={{ border: 'none' }} />
    </div>
    <figcaption className="text-sm text-ink-muted text-center">{caption}</figcaption>
  </figure>
);

export default LiveEmbed;
