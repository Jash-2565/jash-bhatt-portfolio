import { Image as PhotoIcon } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';
import ImageWithFallback from './ImageWithFallback';
import Reveal from './Reveal';
import { ui, galleryItems, aiItems, gallerySnippetItems } from '../config/ui';
import { PUBLIC_URL } from '../utils/getBaseUrl';
import type { GalleryItem } from '../types';

type Props = {
  onImageClick: (src: string) => void;
  /** The heading is the page title on mobile, where this is its own page, and
      a divider inside Work at `lg`. */
  showDivider?: boolean;
};

/**
 * One gallery tile. The same markup was repeated four times with only the
 * sizing changed, so the shape lives here and callers pass the frame.
 */
function Thumb({
  item,
  onImageClick,
  className = '',
  sizes,
  showCaption = true,
}: {
  item: GalleryItem;
  onImageClick: (src: string) => void;
  className?: string;
  sizes: string;
  showCaption?: boolean;
}) {
  const isVideo = item.type === 'video' && item.src;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/5 border border-white/10 transition-all group ${
        isVideo ? 'hover:border-white/25' : 'cursor-pointer hover:border-[#01F5D1]'
      } hover:-translate-y-1 ${className}`}
      onClick={() => !isVideo && item.src && onImageClick(item.src)}
    >
      {isVideo ? (
        <video className="w-full h-full object-cover" controls playsInline preload="metadata" aria-label={item.alt}>
          <source src={item.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : item.src ? (
        <>
          <ImageWithFallback
            src={item.src}
            alt={item.alt}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            sizes={sizes}
            deferGifOnConstrainedNetwork
          />
          {showCaption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-slate-100 transition-all duration-300 pointer-events-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
              {item.alt}
            </div>
          )}
        </>
      ) : (
        <PhotoIcon className="text-slate-300 w-full h-full p-4" />
      )}
    </div>
  );
}

/**
 * The "Beyond case studies" galleries. Rendered as the body of the Explorations
 * page, which is its own view at every width.
 */
export default function CreativeExplorations({ onImageClick, showDivider = true }: Props) {
  return (
    <>
      {showDivider && (
        <Reveal className="mt-16 sm:mt-20 md:mt-32 mb-10 sm:mb-14 md:mb-16 flex items-center gap-4 sm:gap-6">
          <div className="h-px flex-1 bg-white/10"></div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">Beyond case studies</p>
            <h2 className="text-2xl font-display text-slate-300">Creative Explorations</h2>
          </div>
          <div className="h-px flex-1 bg-white/10"></div>
        </Reveal>
      )}

      <div className="grid grid-cols-1 gap-8 sm:gap-10 md:gap-12">
        {/* Photography — the longest-running of these, so it leads. */}
        <Reveal delay={60} className={`${ui.cardBase} ${ui.cardHover} p-5 md:p-8`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <ResponsiveImage
                src={`${PUBLIC_URL}/images/Photography/camera.png`}
                alt="Camera icon"
                className="w-full h-full object-contain rounded-lg"
                loading="lazy"
              />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Photography Gallery</h3>
          </div>
          <p className="text-slate-300 text-sm md:text-base mb-5 md:mb-6">For over 10 years, I've pursued nature photography as a personal hobby. I am skilled with both professional DSLRs and mobile cameras, using them to develop a higher appreciation for the natural world.</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:grid-rows-2 md:gap-6 md:auto-rows-fr">
            {gallerySnippetItems.map((item, i) => {
              const positionClass = i === 0
                ? 'md:col-start-1 md:row-start-1'
                : i === 1
                  ? 'md:col-start-1 md:row-start-2'
                  : i === 2
                    ? 'md:col-start-2 md:row-span-2 md:h-full'
                    : 'md:col-start-3 md:row-span-2 md:h-full';
              const shapeClass = i < 2
                ? 'w-full aspect-square md:aspect-[4/3]'
                : 'w-full aspect-square md:aspect-auto md:h-full';

              return (
                <Thumb
                  key={`gallery-snippet-${i}`}
                  item={item}
                  onImageClick={onImageClick}
                  className={`${shapeClass} ${positionClass}`}
                  sizes="(min-width: 768px) 340px, 60vw"
                />
              );
            })}
          </div>
        </Reveal>

        {/* Brand Animation Section */}
        <Reveal delay={120} className={`${ui.cardBase} ${ui.cardHover} p-5 md:p-8`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="glass-chip w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <ResponsiveImage
                src={`${PUBLIC_URL}/images/Photoshop and Animation/after-effects.png`}
                alt="After Effects icon"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Nothing Brand Animation</h3>
          </div>
          <p className="text-slate-300 text-sm md:text-base mb-1.5">A brand motion piece for Nothing (phone company), focused on clean geometry and sound-led pacing.</p>
          <p className="text-slate-500 text-xs md:text-sm mb-5 md:mb-6">Built alongside Yash Khanna</p>
          <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <video
              className="w-full h-auto"
              controls
              playsInline
              preload="metadata"
              aria-label="Nothing brand animation video"
            >
              <source src={`${PUBLIC_URL}/images/Photoshop and Animation/nothing-animation.mp4`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </Reveal>

        {/* Photoshop Section */}
        <Reveal delay={180} className={`${ui.cardBase} ${ui.cardHover} p-5 md:p-8`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="glass-chip w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <ResponsiveImage
                src={`${PUBLIC_URL}/images/Photoshop and Animation/photoshop.png`}
                alt="Photoshop icon"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Photoshop &amp; Animation</h3>
          </div>
          <p className="text-slate-300 text-sm md:text-base mb-5 md:mb-6">Explorations in visual design, motion graphics, and digital art created during my academic coursework.</p>
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {galleryItems.map((item, i) => (
              <Thumb
                key={`photoshop-${i}`}
                item={item}
                onImageClick={onImageClick}
                className="w-full aspect-square"
                sizes="(min-width: 1024px) 340px, 45vw"
              />
            ))}
          </div>
        </Reveal>

        {/* AI Generations Section */}
        <Reveal delay={240} className={`${ui.cardBase} ${ui.cardHover} p-5 md:p-8`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <ResponsiveImage
                src={`${PUBLIC_URL}/images/Lamborghini.webp`}
                alt="Lamborghini logo"
                className="w-7 h-7 object-contain"
                loading="lazy"
              />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Lamborghini Jetski AI</h3>
          </div>
          <p className="text-slate-300 text-sm md:text-base mb-5 md:mb-6">Exploring automotive form language and aerodynamics through generative AI and prompt engineering.</p>
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {aiItems.map((item, i) => (
              <Thumb
                key={`ai-${i}`}
                item={item}
                onImageClick={onImageClick}
                className="w-full aspect-square"
                sizes="(min-width: 1024px) 340px, 45vw"
              />
            ))}
          </div>
        </Reveal>

      </div>
    </>
  );
}
