import type { ResponsiveImageProps } from '../types';

const ResponsiveImage = ({
  src,
  alt = '',
  loading = 'lazy',
  className,
  deferGifOnConstrainedNetwork: _deferGifOnConstrainedNetwork,
  ...imgProps
}: ResponsiveImageProps) => {
  return <img src={src} alt={alt} loading={loading} decoding="async" className={className} {...imgProps} />;
};

export default ResponsiveImage;
