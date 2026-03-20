import { useState } from 'react';
import { Image } from 'lucide-react';
import type { ResponsiveImageProps } from '../types';

const ImageWithFallback = ({
  src,
  alt = '',
  className,
  deferGifOnConstrainedNetwork: _deferGifOnConstrainedNetwork,
  ...imgProps
}: ResponsiveImageProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-300">
        <Image size={24} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setHasError(true)}
      {...imgProps}
    />
  );
};

export default ImageWithFallback;
