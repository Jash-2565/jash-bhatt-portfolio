import type { ProjectHeroTheme } from '../types';
import { projects } from '../data/projects';

export const PROJECT_ORDER_PRIORITY: Record<string, number> = {
  'hr-genie': 0,
  revela: 1,
  classflow: 2,
  'rahi-design-system-v2': 3,
  wepick: 4,
  // Playable in-browser demos — surfaced above the remaining case studies so
  // the interactive work is found rather than buried at the end.
  'python-codes': 5,
};

// Earlier coursework kept on the site but demoted out of the main case-study
// list, so the flagship work sets the perceived level of the portfolio.
export const ARCHIVED_PROJECT_SLUGS = new Set(['dino-spread', 'tinkering']);

export const DEFAULT_PROJECT_HERO_THEME: ProjectHeroTheme = {
  heroBgClass: 'bg-transparent',
  heroTextClass: 'text-slate-100',
  heroMutedTextClass: 'text-slate-400',
  heroBodyTextClass: 'text-slate-300',
};

export const PROJECT_HERO_THEMES: Record<string, ProjectHeroTheme> = {
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

// Archived work always sorts after everything else, so next-project navigation
// runs through the flagship case studies before reaching the coursework.
const archiveRank = (slug: string) => (ARCHIVED_PROJECT_SLUGS.has(slug) ? 1 : 0);

export const orderedProjects = [...projects].sort((a, b) => {
  const archiveDelta = archiveRank(a.slug) - archiveRank(b.slug);
  if (archiveDelta !== 0) return archiveDelta;
  const rankA = PROJECT_ORDER_PRIORITY[a.slug] ?? Number.MAX_SAFE_INTEGER;
  const rankB = PROJECT_ORDER_PRIORITY[b.slug] ?? Number.MAX_SAFE_INTEGER;
  if (rankA !== rankB) return rankA - rankB;
  return a.id - b.id;
});

/** Flagship case studies — the main "Selected Projects" list. */
export const featuredProjects = orderedProjects.filter(
  (project) => !ARCHIVED_PROJECT_SLUGS.has(project.slug)
);

/** Earlier coursework, shown compactly below the flagship work. */
export const archivedProjects = orderedProjects.filter((project) =>
  ARCHIVED_PROJECT_SLUGS.has(project.slug)
);
