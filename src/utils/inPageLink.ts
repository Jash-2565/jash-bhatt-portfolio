import type { MouseEvent } from 'react';

/** Cards are real links so they can be opened in a new tab or copied. A plain
    click still runs the in-page transition; a modified click is left to the
    browser, which loads the path and lands on the same view via
    parseLocation. */
export const onInPageLink = (event: MouseEvent<HTMLAnchorElement>, open: () => void) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  open();
};
