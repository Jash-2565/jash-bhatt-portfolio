import { useSyncExternalStore } from 'react';

/**
 * Matches Tailwind's `lg` breakpoint. Below it the site is paged — Home, Work,
 * About and Contact are separate views reached from the bottom tab bar. At `lg`
 * and above it stays the single scrolling page with anchor navigation.
 *
 * A media query rather than a resize handler: this fires only when the
 * breakpoint is actually crossed, not on every pixel of a drag or an iOS
 * URL-bar collapse.
 */
const MOBILE_QUERY = '(max-width: 1023.98px)';

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

export function useIsMobile() {
  // useSyncExternalStore rather than useState + useEffect: it reads the query
  // during render, so there is no frame where the layout is built from a stale
  // breakpoint.
  return useSyncExternalStore(subscribe, getSnapshot);
}
