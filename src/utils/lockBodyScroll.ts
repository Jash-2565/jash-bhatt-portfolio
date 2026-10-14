/**
 * Freeze the page behind an overlay, and give back a function that restores it.
 *
 * `body { overflow: hidden }` alone is the pattern that does not work on iOS
 * Safari: the page keeps scrolling under the overlay on touch, and dismissing
 * it leaves the reader somewhere else entirely. Pinning the body with
 * `position: fixed` at a negative offset is what actually holds, and restoring
 * the offset on release is what stops the page jumping to the top afterwards.
 */
export const lockBodyScroll = () => {
  const { body } = document;
  const scrollY = window.scrollY;
  const previous = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
  };

  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `${-scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';

  return () => {
    body.style.overflow = previous.overflow;
    body.style.position = previous.position;
    body.style.top = previous.top;
    body.style.left = previous.left;
    body.style.right = previous.right;
    body.style.width = previous.width;
    // `position: fixed` detaches the document from its scroll offset, so it has
    // to be put back by hand. 'instant' — a smooth scroll here would animate
    // the page back into place after the overlay has already gone.
    window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
  };
};
