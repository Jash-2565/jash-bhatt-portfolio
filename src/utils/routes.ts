import { projects } from '../data/projects';
import { PUBLIC_URL } from './getBaseUrl';
import type { MobilePage } from '../types';

/**
 * Real URL paths, not hashes.
 *
 * The site used to route entirely on `location.hash`. That worked for people,
 * but not for anything that reads a page without running its JavaScript — and
 * that is every link-preview scraper there is. A scraper fetching
 * `jashbhatt.com/#hr-genie` is served the one static `index.html`, never runs
 * the effect that rewrites the title and description, and shows the generic
 * card. All eleven case studies previewed identically.
 *
 * With real paths, `scripts/prerender.mjs` can emit one HTML file per route
 * with its own <title>, description, canonical and og:image baked in. Old hash
 * links are still honoured — `legacyHashRoute` maps them onto the new paths and
 * the app rewrites the URL in place on arrival, so nothing anyone has already
 * shared breaks.
 */

export const SITE_ORIGIN = 'https://jashbhatt.com';

export type Route =
  | { view: 'home'; section: MobilePage }
  | { view: 'explorations' }
  | { view: 'project'; slug: string };

/** The four scroll sections / mobile pages that have a top-level path. */
const SECTION_PATHS: Record<string, MobilePage> = {
  '': 'home',
  work: 'work',
  about: 'about',
  contact: 'contact',
};

const slugSet = new Set(projects.map((p) => p.slug));
const slugById = new Map(projects.map((p) => [p.id, p.slug]));

/** Strip the deployment base and any trailing slash: `/sub/work/x/` -> `work/x`. */
const normalisePath = (pathname: string) => {
  let path = pathname;
  if (PUBLIC_URL && path.startsWith(PUBLIC_URL)) path = path.slice(PUBLIC_URL.length);
  return path.replace(/^\/+/, '').replace(/\/+$/, '');
};

/** Build a URL for a route, including the deployment base. */
export const routeToPath = (route: Route): string => {
  if (route.view === 'explorations') return `${PUBLIC_URL}/explorations`;
  if (route.view === 'project') return `${PUBLIC_URL}/work/${route.slug}`;
  return route.section === 'home' ? `${PUBLIC_URL}/` : `${PUBLIC_URL}/${route.section}`;
};

/**
 * Map a legacy `#hash` onto a route, or null if the hash means nothing to us.
 * Covers every form that has ever been linkable: `#<slug>`, `#project-<id>`,
 * `#gallery` (the old name for Explorations), and the four section anchors.
 */
export const legacyHashRoute = (rawHash: string): Route | null => {
  const hash = rawHash.replace(/^#/, '');
  if (!hash) return null;

  if (slugSet.has(hash)) return { view: 'project', slug: hash };

  if (hash.startsWith('project-')) {
    const id = Number(hash.replace('project-', ''));
    const slug = Number.isNaN(id) ? undefined : slugById.get(id);
    if (slug) return { view: 'project', slug };
    return { view: 'home', section: 'home' };
  }

  if (hash === 'explorations' || hash === 'gallery') return { view: 'explorations' };

  const section = SECTION_PATHS[hash];
  if (section) return { view: 'home', section };

  return null;
};

/**
 * Resolve the current URL to a route. Reads the path first; falls back to a
 * legacy hash so an old bookmark still lands in the right place. Anything
 * unrecognised resolves to Home rather than erroring.
 */
export const parseLocation = (
  pathname = window.location.pathname,
  hash = window.location.hash
): Route => {
  const path = normalisePath(pathname);

  if (path === 'explorations' || path === 'gallery') return { view: 'explorations' };

  if (path.startsWith('work/')) {
    const slug = decodeURIComponent(path.slice('work/'.length));
    if (slugSet.has(slug)) return { view: 'project', slug };
    return { view: 'home', section: 'work' };
  }

  const section = SECTION_PATHS[path];
  if (section) {
    // `/` with a legacy hash on it is someone arriving on an old shared link.
    if (path === '') {
      const legacy = legacyHashRoute(hash);
      if (legacy) return legacy;
    }
    return { view: 'home', section };
  }

  const legacy = legacyHashRoute(hash);
  if (legacy) return legacy;

  return { view: 'home', section: 'home' };
};

/** True when the URL carries a legacy hash we should quietly rewrite away. */
export const hasLegacyHash = (hash = window.location.hash) =>
  legacyHashRoute(hash) !== null;
