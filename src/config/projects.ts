import type { ProjectHeroTheme } from '../types';
import { projects } from '../data/projects';

// The homepage leads with five case studies, not everything that exists. This
// set is the curation; anything absent falls through to "More work" below it.
const FEATURED_PROJECT_SLUGS = new Set([
  'hr-genie',
  'classflow',
  'revela',
  'etsconnect',
  'soundtrack-seven-years',
]);

const PROJECT_ORDER_PRIORITY: Record<string, number> = {
  'hr-genie': 0,
  classflow: 1,
  revela: 2,
  etsconnect: 3,
  'soundtrack-seven-years': 4,
  // Secondary list. The Rahi system leads it as the strongest of the remaining
  // work, then the self-directed builds, with the earliest coursework trailing.
  'rahi-design-system-v2': 5,
  'python-codes': 6,
  wepick: 7,
  solarlink: 8,
  'dino-spread': 9,
  tinkering: 10,
};

export const DEFAULT_PROJECT_HERO_THEME: ProjectHeroTheme = {
  heroTextClass: 'text-slate-100',
  heroMutedTextClass: 'text-slate-400',
  heroBodyTextClass: 'text-slate-300',
};

export const PROJECT_HERO_THEMES: Record<string, ProjectHeroTheme> = {
  etsconnect: {
    heroTextClass: 'text-[#8B5CF6]',
    heroMutedTextClass: 'text-[#CFC2FF]',
    heroBodyTextClass: 'text-[#EAE3FF]',
  },
  'hr-genie': {
    heroTextClass: 'text-[#3B82F6]',
    heroMutedTextClass: 'text-[#AFC9F5]',
    heroBodyTextClass: 'text-[#DCE7FF]',
  },
  classflow: {
    // ClassFlow's indigo, lightened. The brand value is #4239C4 — hsl(244 55%
    // 50%) — which measures 2.57:1 against the ground and so misses the 3:1
    // floor that applies to large text (WCAG 2.1 AA, 1.4.3); the hero title
    // is large, but large is not exempt. This holds the hue at 244 exactly
    // and lifts saturation 55% -> 70% so the colour keeps its chroma as it
    // gains lightness, rather than washing out to a pastel. It measures
    // 4.66:1 here, and stays above 4:1 on every other surface the site has,
    // so it survives another change of ground.
    heroTextClass: 'text-[#7067E4]',
    heroMutedTextClass: 'text-[#D3D0FF]',
    heroBodyTextClass: 'text-[#ECEAFF]',
  },
  wepick: {
    heroTextClass: 'text-sky-600',
    heroMutedTextClass: 'text-sky-200',
    heroBodyTextClass: 'text-sky-100',
  },
  'rahi-design-system-v2': {
    heroTextClass: 'text-[#16A197]',
    heroMutedTextClass: 'text-[#A9E2DA]',
    heroBodyTextClass: 'text-[#D7F4F0]',
  },
  revela: {
    heroTextClass: 'text-[#DC2626]',
    heroMutedTextClass: 'text-rose-200',
    heroBodyTextClass: 'text-rose-100',
  },
  'dino-spread': {
    heroTextClass: 'text-rose-900',
    heroMutedTextClass: 'text-rose-300',
    heroBodyTextClass: 'text-rose-100',
  },
  solarlink: {
    heroTextClass: 'text-[#E3FC03]',
    heroMutedTextClass: 'text-[#C9DE8D]',
    heroBodyTextClass: 'text-[#EAF7C6]',
  },
  'soundtrack-seven-years': {
    heroTextClass: 'text-[#3EC873]',
    heroMutedTextClass: 'text-[#A6E0BC]',
    heroBodyTextClass: 'text-[#DCF4E5]',
  },
  'python-codes': {
    heroTextClass: 'text-[#FFD343]',
    heroMutedTextClass: 'text-[#FFF2B3]',
    heroBodyTextClass: 'text-[#FFF2B3]',
  },
  tinkering: {
    heroTextClass: 'text-rose-600',
    heroMutedTextClass: 'text-rose-200',
    heroBodyTextClass: 'text-rose-100',
  },
};

/**
 * Thumbnails that are logo lockups rather than artwork. The square tiles cover-
 * crop by default, which slices the wordmark off either side of a wide logo, so
 * these are contained instead. The value is the backdrop the tile paints behind
 * the letterbox — pick one that continues the image's own ground so the tile
 * still reads as a single solid chip.
 */
export const CONTAINED_THUMBNAIL_BACKDROPS: Record<string, string> = {
  // A 16:9 lockup on white; the white bars above and below it are invisible.
  'rahi-design-system-v2': 'bg-white',
  // The Python mark is the one thumbnail with a transparent background — 37%
  // of the file is fully transparent — so the default bg-white/5 plate showed
  // through the gaps in the glyph as a lit square around it. It wants no plate
  // at all; the logo sits straight on the card.
  'python-codes': 'bg-transparent',
};

// A single ordering for the whole catalogue: featured work first, then the
// secondary list. Case-study "next project" navigation walks this array, so it
// runs through the flagship work before reaching the coursework.
const featuredRank = (slug: string) => (FEATURED_PROJECT_SLUGS.has(slug) ? 0 : 1);

export const orderedProjects = [...projects].sort((a, b) => {
  const tierDelta = featuredRank(a.slug) - featuredRank(b.slug);
  if (tierDelta !== 0) return tierDelta;
  const rankA = PROJECT_ORDER_PRIORITY[a.slug] ?? Number.MAX_SAFE_INTEGER;
  const rankB = PROJECT_ORDER_PRIORITY[b.slug] ?? Number.MAX_SAFE_INTEGER;
  if (rankA !== rankB) return rankA - rankB;
  return a.id - b.id;
});

/** The five case studies that lead the homepage. */
export const featuredProjects = orderedProjects.filter((project) =>
  FEATURED_PROJECT_SLUGS.has(project.slug)
);

/** Everything else — demos and earlier coursework, shown compactly below. */
export const secondaryProjects = orderedProjects.filter(
  (project) => !FEATURED_PROJECT_SLUGS.has(project.slug)
);
