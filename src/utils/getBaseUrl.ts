/**
 * Deployment base path with no trailing slash — `''` when the site is served
 * from the root, `'/sub'` when it isn't. Prefixed onto every `public/` URL so
 * the same build works at either location.
 */
export const PUBLIC_URL = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');
