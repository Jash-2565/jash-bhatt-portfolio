/**
 * While set, every <Reveal> that mounts starts already landed instead of
 * hidden. The card-expand transition (CardExpand.tsx) sets it while it mounts
 * the Work page under its overlay on the way back from a case study: the page
 * then shrinks into a card it has just measured, and a card still mid-reveal
 * underneath — or its neighbours wiping in around it — would show as a jump
 * when the overlay hands over.
 */
let skip = false;

export const setRevealSkip = (on: boolean) => {
  skip = on;
};

export const shouldSkipReveal = () => skip;
