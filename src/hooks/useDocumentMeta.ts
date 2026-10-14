import { useEffect } from 'react';
import { SITE_ORIGIN } from '../utils/routes';
import type { Project, MobilePage, View } from '../types';

/**
 * Per-view document metadata.
 *
 * Scrapers are served a prerendered <head> per route (scripts/prerender.mjs),
 * so this is not what produces link previews. It keeps the live document
 * honest for tab titles, browser history, bookmarks, and anything reading the
 * DOM after hydration — including the canonical and og:url, which used to
 * point at the site root from every case study.
 */
export function useDocumentMeta(
  currentView: View,
  selectedProject: Project | null,
  mobilePage: MobilePage
) {
  useEffect(() => {
    const setMeta = (selector: string, value: string) => {
      document.head.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value);
    };
    const setLink = (selector: string, href: string) => {
      document.head.querySelector<HTMLLinkElement>(selector)?.setAttribute('href', href);
    };

    const apply = (
      title: string,
      description: string,
      path: string,
      // The same card scripts/prerender.mjs bakes into every route. There are
      // no per-project images; /og/<slug>.png was never generated and 404'd.
      image = `${SITE_ORIGIN}/og-image.jpg`,
      imageAlt = 'Jash Bhatt — product designer, with a portrait of Jash.'
    ) => {
      const url = `${SITE_ORIGIN}${path === '/' ? '/' : path}`;
      document.title = title;
      setMeta('meta[name="description"]', description);
      setMeta('meta[property="og:title"]', title);
      setMeta('meta[property="og:description"]', description);
      setMeta('meta[property="og:url"]', url);
      setMeta('meta[property="og:image"]', image);
      setMeta('meta[property="og:image:alt"]', imageAlt);
      setMeta('meta[name="twitter:title"]', title);
      setMeta('meta[name="twitter:description"]', description);
      setMeta('meta[name="twitter:image"]', image);
      setLink('link[rel="canonical"]', url);
    };

    if (currentView === 'project' && selectedProject) {
      apply(
        `${selectedProject.title} — ${selectedProject.category} | Jash Bhatt`,
        selectedProject.description,
        `/work/${selectedProject.slug}`,
        undefined,
        `${selectedProject.title} — ${selectedProject.category}`
      );
      return;
    }

    if (currentView === 'explorations') {
      apply(
        'Creative Explorations | Jash Bhatt',
        'Photography, brand motion, generative experiments, and image-making alongside the case studies.',
        '/explorations'
      );
      return;
    }

    apply(
      'Jash Bhatt | Product Designer',
      'Conversational AI agents at Bajaj Finance, a B2B marketplace for corporate mobility, and a Spotify data story — case studies from a B.Des student at FLAME University.',
      mobilePage === 'home' ? '/' : `/${mobilePage}`
    );
    // Matches scripts/prerender.mjs: the share card carries the pitch, so the
    // link-preview text only names the site.
    setMeta('meta[property="og:description"]', 'Jash Bhatt Portfolio');
    setMeta('meta[name="twitter:description"]', 'Jash Bhatt Portfolio');
  }, [currentView, selectedProject, mobilePage]);
}
