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
  heroBgClass: 'bg-transparent',
  heroTextClass: 'text-slate-100',
  heroMutedTextClass: 'text-slate-400',
  heroBodyTextClass: 'text-slate-300',
};

export const PROJECT_HERO_THEMES: Record<string, ProjectHeroTheme> = {
  etsconnect: {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-[#8B5CF6]',
    heroMutedTextClass: 'text-[#CFC2FF]',
    heroBodyTextClass: 'text-[#EAE3FF]',
  },
  'hr-genie': {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-[#3B82F6]',
    heroMutedTextClass: 'text-[#AFC9F5]',
    heroBodyTextClass: 'text-[#DCE7FF]',
  },
  classflow: {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-[#4239C4]',
    heroMutedTextClass: 'text-[#D3D0FF]',
    heroBodyTextClass: 'text-[#ECEAFF]',
  },
  wepick: {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-sky-600',
    heroMutedTextClass: 'text-sky-200',
    heroBodyTextClass: 'text-sky-100',
  },
  'rahi-design-system-v2': {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-[#16A197]',
    heroMutedTextClass: 'text-[#A9E2DA]',
    heroBodyTextClass: 'text-[#D7F4F0]',
  },
  revela: {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-[#DC2626]',
    heroMutedTextClass: 'text-rose-200',
    heroBodyTextClass: 'text-rose-100',
  },
  'dino-spread': {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-rose-900',
    heroMutedTextClass: 'text-rose-300',
    heroBodyTextClass: 'text-rose-100',
  },
  solarlink: {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-[#E3FC03]',
    heroMutedTextClass: 'text-[#C9DE8D]',
    heroBodyTextClass: 'text-[#EAF7C6]',
  },
  'soundtrack-seven-years': {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-[#3EC873]',
    heroMutedTextClass: 'text-[#A6E0BC]',
    heroBodyTextClass: 'text-[#DCF4E5]',
  },
  'python-codes': {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-[#FFD343]',
    heroMutedTextClass: 'text-[#FFF2B3]',
    heroBodyTextClass: 'text-[#FFF2B3]',
  },
  tinkering: {
    heroBgClass: 'bg-transparent',
    heroTextClass: 'text-rose-600',
    heroMutedTextClass: 'text-rose-200',
    heroBodyTextClass: 'text-rose-100',
  },
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
