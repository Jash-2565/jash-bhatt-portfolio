import videoManifest from '../data/videoManifest.json';
import { getImageSources } from './imageSources';
import { PUBLIC_URL } from './getBaseUrl';

const videoEntries = videoManifest as Record<string, { w?: number; h?: number }>;

/** Width ÷ height of a project image or GIF clip, from the build manifests.
    Falls back to 4:3 for anything they don't list (remote files). */
export const mediaAspect = (src: string) => {
  const image = getImageSources(src);
  if (image) return image.width / image.height;
  const key = (PUBLIC_URL && src.startsWith(PUBLIC_URL) ? src.slice(PUBLIC_URL.length) : src).replace(/\.gif$/i, '');
  const video = videoEntries[key];
  return video?.w && video?.h ? video.w / video.h : 4 / 3;
};
