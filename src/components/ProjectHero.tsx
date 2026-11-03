import { ArrowLeft } from 'lucide-react';
import type { Project } from '../types';
import { PROJECT_HERO_THEMES, DEFAULT_PROJECT_HERO_THEME } from '../config/projects';
import { ui } from '../config/ui';

interface ProjectHeroProps {
  project: Project;
  onBack?: () => void;
}

/** The top of a case study: back link, category, title, summary. */
const ProjectHero = ({ project, onBack }: ProjectHeroProps) => {
  const { heroTextClass, heroMutedTextClass, heroBodyTextClass } =
    PROJECT_HERO_THEMES[project.slug] ?? DEFAULT_PROJECT_HERO_THEME;

  return (
    <div data-project-hero className="w-full pt-[calc(var(--nav-h)+2rem)] pb-12 md:pt-32 md:pb-24 border-b border-white/10">
      <div className={ui.shell}>
        <button
          type="button"
          onClick={onBack}
          tabIndex={onBack ? undefined : -1}
          className="group -ml-3 flex items-center gap-2 min-h-11 px-3 rounded-sm mb-6 md:mb-12 transition-colors text-sm font-medium text-ink-body hover:text-accent active:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to projects
        </button>

        <div className="flex flex-wrap items-center gap-3 mb-5 md:mb-8">
          <span className={`text-sm md:text-base font-medium ${heroMutedTextClass}`}>{project.category}</span>
        </div>

        <h1 className={`font-display text-[clamp(2.25rem,9vw,3rem)] md:text-[5.25rem] mb-5 md:mb-8 leading-[1.02] md:leading-[0.96] [text-wrap:balance] ${heroTextClass}`}>{project.title}</h1>
        <p className={`text-base md:text-xl leading-relaxed max-w-2xl font-light ${heroBodyTextClass}`}>
          {project.description}
        </p>
      </div>
    </div>
  );
};

export default ProjectHero;
