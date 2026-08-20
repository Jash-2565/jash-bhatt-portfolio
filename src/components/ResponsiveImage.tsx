import type { ResponsiveImageProps } from '../types';
import AutoVideo from './AutoVideo';
import { getImageSources, DEFAULT_SIZES } from '../utils/imageSources';

/**
 * The site's standard <img>. Now actually responsive: it looks the source up in
 * the generated image manifest and, where width variants exist, hands the
 * browser a srcset so a phone fetches a ~480px file instead of the full-size
 * original. Intrinsic width/height are set from the same manifest so the layout
 * reserves space and images don't shove content around as they load.
 *
 * Sources with no manifest entry (SVGs, icons, anything small) render exactly
 * as before.
 */
const ResponsiveImage = ({
  src,
  alt = '',
  loading = 'lazy',
  className,
  sizes,
  ...imgProps
}: ResponsiveImageProps) => {
  // GIFs are shipped as encoded video (see scripts/gif-to-video.sh) — render an
  // autoplaying looping <video> instead of the multi-MB animated GIF.
  if (typeof src === 'string' && /\.gif$/i.test(src)) {
    return <AutoVideo src={src} alt={alt} className={className} />;
  }

  const sources = getImageSources(src);

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      {...(sources?.srcSet ? { srcSet: sources.srcSet, sizes: sizes ?? DEFAULT_SIZES } : {})}
      {...(sources ? { width: sources.width, height: sources.height } : {})}
      {...imgProps}
    />
  );
};

export default ResponsiveImage;
