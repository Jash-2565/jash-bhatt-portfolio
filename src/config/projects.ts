import type { ProjectHeroTheme } from '../types';
import { projects } from '../data/projects';

export const PROJECT_ORDER_PRIORITY: Record<string, number> = {
  revela: 0,
  classflow: 1,
  'rahi-design-system-v2': 2,
  wepick: 3,
};

export const DEFAULT_PROJECT_HERO_THEME: ProjectHeroTheme = {
  heroBgClass: 'bg-slate-950',
  heroTextClass: 'text-slate-100',
  heroMutedTextClass: 'text-slate-400',
  heroBodyTextClass: 'text-slate-300',
  heroDotClass: 'bg-slate-300',
};

export const PROJECT_HERO_THEMES: Record<string, ProjectHeroTheme> = {
  classflow: {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-[#4239C4]',
    heroMutedTextClass: 'text-[#D3D0FF]',
    heroBodyTextClass: 'text-[#ECEAFF]',
    heroDotClass: 'bg-[#A7A1FF]',
  },
  wepick: {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-sky-600',
    heroMutedTextClass: 'text-sky-200',
    heroBodyTextClass: 'text-sky-100',
    heroDotClass: 'bg-sky-300',
  },
  'rahi-design-system-v2': {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-[#16A197]',
    heroMutedTextClass: 'text-[#A9E2DA]',
    heroBodyTextClass: 'text-[#D7F4F0]',
    heroDotClass: 'bg-[#16A197]',
  },
  revela: {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-[#DC2626]',
    heroMutedTextClass: 'text-rose-200',
    heroBodyTextClass: 'text-rose-100',
    heroDotClass: 'bg-rose-300',
  },
  'dino-spread': {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-rose-900',
    heroMutedTextClass: 'text-rose-300',
    heroBodyTextClass: 'text-rose-100',
    heroDotClass: 'bg-rose-300',
  },
  solarlink: {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-[#E3FC03]',
    heroMutedTextClass: 'text-[#C9DE8D]',
    heroBodyTextClass: 'text-[#EAF7C6]',
    heroDotClass: 'bg-[#E3FC03]',
  },
  'python-codes': {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-[#FFD343]',
    heroMutedTextClass: 'text-[#FFF2B3]',
    heroBodyTextClass: 'text-[#FFF2B3]',
    heroDotClass: 'bg-[#FFF2B3]',
  },
  tinkering: {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-rose-600',
    heroMutedTextClass: 'text-rose-200',
    heroBodyTextClass: 'text-rose-100',
    heroDotClass: 'bg-rose-300',
  },
};

export const orderedProjects = [...projects].sort((a, b) => {
  const rankA = PROJECT_ORDER_PRIORITY[a.slug] ?? Number.MAX_SAFE_INTEGER;
  const rankB = PROJECT_ORDER_PRIORITY[b.slug] ?? Number.MAX_SAFE_INTEGER;
  if (rankA !== rankB) return rankA - rankB;
  return a.id - b.id;
});
