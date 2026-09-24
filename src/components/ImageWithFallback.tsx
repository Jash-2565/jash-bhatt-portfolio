import { useState } from 'react';
import { Image } from 'lucide-react';
import type { ResponsiveImageProps } from '../types';
import AutoVideo from './AutoVideo';
import { getImageSources, DEFAULT_SIZES } from '../utils/imageSources';
import { versionedUrl } from '../utils/versionedUrl';

const ImageWithFallback = ({
  src,
  alt = '',
  className,
  sizes,
  captioned = false,
  ...imgProps
}: ResponsiveImageProps) => {
  const [hasError, setHasError] = useState(false);

  // GIFs are shipped as encoded video (see scripts/gif-to-video.sh).
  if (typeof src === 'string' && /\.gif$/i.test(src)) {
    return <AutoVideo src={src} alt={alt} captioned={captioned} className={className} />;
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-300">
        <Image size={24} />
      </div>
    );
  }

  const sources = getImageSources(src);

  return (
    <img
      src={versionedUrl(src)}
      alt={captioned ? '' : alt}
      {...(captioned ? { role: 'presentation' as const } : {})}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setHasError(true)}
      {...(sources?.srcSet ? { srcSet: sources.srcSet, sizes: sizes ?? DEFAULT_SIZES } : {})}
      {...(sources ? { width: sources.width, height: sources.height } : {})}
      {...imgProps}
    />
  );
};

export default ImageWithFallback;
