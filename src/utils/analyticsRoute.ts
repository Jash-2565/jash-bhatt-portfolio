import { projects } from '../data/projects';

/**
 * Maps a URL hash onto the `route`/`path` pair Vercel Web Analytics expects.
 *
 * `route` is the grouping key shown in the dashboard, `path` is the URL the
 * visitor actually saw. Keeping every case study under one `/project/[slug]`
 * route stops eleven one-visit rows from burying the pages that matter.
 */
export const analyticsLocation = (rawHash: string): { route: string; path: string } => {
  const hash = rawHash.replace(/^#/, '');

  // A bare `/` is rewritten to `#home` by the initial-load effect. Reporting
  // both as `/home` keeps that rewrite from counting as a second page view.
  if (!hash) return { route: '/home', path: '/home' };

  const bySlug = projects.find((project) => project.slug === hash);
  if (bySlug) {
    return { route: '/project/[slug]', path: `/project/${bySlug.slug}` };
  }

  // `project-<id>` is the legacy form of a case-study link. Resolve it to the
  // slug so old bookmarks group with their modern equivalent.
  if (hash.startsWith('project-')) {
    const id = Number(hash.replace('project-', ''));
    const byId = projects.find((project) => project.id === id);
    if (byId) {
      return { route: '/project/[slug]', path: `/project/${byId.slug}` };
    }
  }

  // `gallery` is the legacy hash for explorations, normalised so the two don't
  // split one page across two rows.
  if (hash === 'gallery' || hash === 'explorations') {
    return { route: '/explorations', path: '/explorations' };
  }

  return { route: `/${hash}`, path: `/${hash}` };
};
