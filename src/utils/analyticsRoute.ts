import type { Route } from './routes';

/**
 * Maps a resolved route onto the `route`/`path` pair Vercel Web Analytics
 * expects.
 *
 * `route` is the grouping key shown in the dashboard, `path` is the URL the
 * visitor actually saw. Keeping every case study under one `/work/[slug]`
 * route stops eleven one-visit rows from burying the pages that matter.
 */
export const analyticsLocation = (route: Route): { route: string; path: string } => {
  if (route.view === 'project') {
    return { route: '/work/[slug]', path: `/work/${route.slug}` };
  }

  if (route.view === 'explorations') {
    return { route: '/explorations', path: '/explorations' };
  }

  const path = route.section === 'home' ? '/' : `/${route.section}`;
  return { route: path, path };
};
