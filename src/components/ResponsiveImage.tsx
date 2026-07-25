import type { ResponsiveImageProps } from '../types';
import AutoVideo from './AutoVideo';

const ResponsiveImage = ({
  src,
  alt = '',
  loading = 'lazy',
  className,
  deferGifOnConstrainedNetwork: _deferGifOnConstrainedNetwork,
  ...imgProps
}: ResponsiveImageProps) => {
  // GIFs are shipped as encoded video (see scripts-gif-to-video.sh) — render an
  // autoplaying looping <video> instead of the multi-MB animated GIF.
  if (typeof src === 'string' && /\.gif$/i.test(src)) {
    return <AutoVideo src={src} alt={alt} className={className} />;
  }
  return <img src={src} alt={alt} loading={loading} decoding="async" className={className} {...imgProps} />;
};

export default ResponsiveImage;
