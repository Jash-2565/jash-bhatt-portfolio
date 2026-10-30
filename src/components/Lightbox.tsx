import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';
import { ui } from '../config/ui';
import { mediaAspect } from '../utils/mediaAspect';
import { lockBodyScroll } from '../utils/lockBodyScroll';
import type { LightboxImage } from '../types';

/**
 * Keys a covering layer has to swallow.
 *
 * The case-study view binds ArrowRight to "next project" on `window`, and
 * `window` is last in the bubble path — so anything listening on `document` in
 * the capture phase wins. These are the keys that would otherwise move the page
 * underneath an open overlay.
 */
const NAVIGATION_KEYS = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', ' ',
]);

interface LightboxProps {
  image: LightboxImage;
  /** Must be stable: the scroll lock is taken and released with it. */
  onClose: () => void;
}

/**
 * The full-screen image viewer every case study and gallery opens into. The
 * image sits in its own scroll container with `touch-action: pinch-zoom` so
 * dense diagrams (the HR Genie SVGs are authored at 1600px wide) can actually
 * be inspected on a phone.
 */
const Lightbox = ({ image, onClose }: LightboxProps) => {
  const lightboxCloseRef = useRef<HTMLButtonElement | null>(null);
  const isWhiteBgLightboxImage = image.src.includes('Circuit-Design.webp');
  const lightboxAspect = mediaAspect(image.src);

  // Plays the closing animation, then asks the parent to unmount. The scroll
  // lock is released by that unmount, so the page can't move under the image
  // while it fades.
  const [closing, setClosing] = useState(false);
  const requestClose = useCallback(() => setClosing(true), []);
  useEffect(() => {
    if (!closing) return;
    // animationend is the normal route; this covers a backgrounded tab or a
    // stylesheet that removes the animation, either of which would otherwise
    // leave an invisible full-screen layer swallowing every tap.
    const timer = window.setTimeout(onClose, 260);
    return () => clearTimeout(timer);
  }, [closing, onClose]);

  // Lightbox escape, focus, and scroll lock
  useEffect(() => {
    const releaseScroll = lockBodyScroll();
    lightboxCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // The lightbox is the topmost layer, so it consumes Escape outright.
        // The case-study view keeps its own Escape → back shortcut on `window`;
        // without this, one press closed the image *and* left the case study.
        // Now Escape dismisses the topmost thing and a second press goes back.
        event.stopPropagation();
        requestClose();
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        lightboxCloseRef.current?.focus();
        return;
      }

      // Everything else the layers underneath treat as navigation is swallowed
      // here. The case-study view binds ArrowRight to "next project" on
      // `window`; with the lightbox open that changed the page behind it while
      // the dialog carried on showing an image from the project you had just
      // left.
      if (NAVIGATION_KEYS.has(event.key)) {
        event.stopPropagation();
      }
    };

    // Capture phase: the shortcuts underneath listen on `window`, which is last
    // in the bubble path. Intercepting on the way down means this layer wins
    // regardless of where those listeners are attached.
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      releaseScroll();
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [image, requestClose]);

  return (
    <div
      className="lightbox fixed inset-0 z-[60] flex items-center justify-center scrim"
      data-closing={closing}
      onClick={requestClose}
      onAnimationEnd={(event) => {
        if (closing && event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt ? `Image preview: ${image.alt}` : 'Image preview'}
    >
      <button
        className={`chip absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 flex items-center justify-center text-white rounded-sm shadow-lg ${ui.tapTarget}`}
        onClick={requestClose}
        ref={lightboxCloseRef}
        aria-label="Close image preview"
      >
        <X size={24} />
      </button>
      <div
        className="h-full w-full overflow-auto overscroll-contain flex items-center justify-center p-4 [touch-action:pinch-zoom]"
        onClick={requestClose}
      >
        <figure className="m-0 flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
          {/* Every image and clip opens as large as the screen allows, at
              its own proportions. They used to show at their own pixel
              size, capped at 80% of the height, so a 480px GIF opened at
              480px and had to be pinched up. The frame is sized from the
              media's aspect ratio: the width that fills the screen, or the
              width that fills the height left after the caption,
              whichever is smaller. */}
          <div
            className={`lightbox-frame relative overflow-hidden rounded-lg shadow-2xl ${isWhiteBgLightboxImage ? 'bg-white p-2' : 'bg-[var(--surface-1)]'}`}
            style={{
              aspectRatio: lightboxAspect,
              width: `min(calc(100vw - 2rem), calc((100dvh - 9rem) * ${lightboxAspect}))`,
            }}
          >
            <ResponsiveImage
              src={image.src}
              // The caption, not "Full size view". This is the site's
              // primary image-viewing surface; announcing the same four
              // words for every diagram in every case study told a
              // screen-reader user nothing at all.
              alt={image.alt}
              className="block w-full h-full object-contain"
              loading="eager"
              sizes="100vw"
            />
          </div>
          {(image.caption ?? image.alt) && (
            <figcaption className="max-w-2xl px-4 text-center text-sm text-ink-body">
              {image.caption ?? image.alt}
            </figcaption>
          )}
        </figure>
      </div>
      <p className="md:hidden absolute bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 text-center text-xs text-ink-muted pointer-events-none">
        Pinch to zoom · tap outside to close
      </p>
    </div>
  );
};

export default Lightbox;
