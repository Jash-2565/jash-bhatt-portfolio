import type { GalleryItem } from '../types';
import { PUBLIC_URL } from '../utils/getBaseUrl';

export const ui = {
  btnBase: 'inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-medium transition-all duration-300',
  btnPrimary: 'bg-[#01F5D1] text-black hover:bg-[#00D8B8] hover:shadow-[0_0_32px_-4px_rgba(1,245,209,0.55)] hover:-translate-y-0.5',
  btnSecondary: 'glass glass-hover text-slate-100 hover:text-[#9EF7EA]',
  cardBase: 'glass rounded-2xl',
  cardHover: 'glass-hover',
  chipBase: 'glass-chip px-3 py-1.5 text-sm font-medium text-slate-200 rounded-full hover:text-[#9EF7EA]',
  chipAccent: 'glass-chip px-3 py-1.5 text-sm font-medium text-[#9EF7EA] rounded-full !border-[#01F5D1]/40',

  // --- Shared layout rhythm -------------------------------------------------
  // Defined once so mobile spacing stays consistent across the home page and
  // the case studies, instead of every section inventing its own values.
  gutter: 'px-5 sm:px-8 lg:px-12',
  shell: 'max-w-[84rem] mx-auto px-5 sm:px-8 lg:px-12',
  section: 'py-14 sm:py-20 lg:py-24',
  scrollMt: 'scroll-mt-20 md:scroll-mt-28',
  /** Mobile ceiling is lower than the type scale would suggest: the paged hero
      has to fit one screen minus the header and the bottom tab bar. */
  h1: 'text-[clamp(1.6rem,6.4vw,2.6rem)] md:text-[4.2rem] leading-[1.12] md:leading-[1.05] [text-wrap:balance]',
  h2: 'text-[1.75rem] sm:text-3xl md:text-4xl',
  /** 44px minimum touch target, per WCAG 2.2 target-size guidance. */
  tapTarget: 'min-h-11 min-w-11',
} as const;

export const personalitySignals = [
  'Phygital Product Designer',
  'UI/UX & Interaction Design',
  'Circuit & Hardware',
  'AI-Assisted Design',
];

export const currentlyExploring = [
  'Robust phygital products',
  'AI-assisted design workflows',
  'Embedded interaction systems',
];

export const operatorStats = [
  { label: 'Currently', value: 'B.Des · FLAME University' },
  { label: 'Last Internship', value: 'Agentic AI · Bajaj Finance' },
  { label: 'Status', value: 'Available for remote work' },
];

export const galleryItems: GalleryItem[] = [
  { type: 'image', src: `${PUBLIC_URL}/images/Photoshop and Animation/la la land.webp`, alt: 'La La Land Art' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photoshop and Animation/Mrs jordan.webp`, alt: 'Mrs Jordan Art' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photoshop and Animation/Geometric-Design.gif`, alt: 'Geometric Design GIF' },
];

export const aiItems: GalleryItem[] = [
  { type: 'image', src: `${PUBLIC_URL}/images/Lamborghini Jetski/aquatoro-blue.webp`, alt: 'Lamborghini Jetski Concept 1' },
  { type: 'image', src: `${PUBLIC_URL}/images/Lamborghini Jetski/aquatoro-black.webp`, alt: 'Lamborghini Jetski Concept 2' },
  { type: 'image', src: `${PUBLIC_URL}/images/Lamborghini Jetski/jetski final.gif`, alt: 'Lamborghini Jetski Concept 3' },
];

export const gallerySnippetItems: GalleryItem[] = [
  { type: 'image', src: `${PUBLIC_URL}/images/Photography/flowers.webp`, alt: 'White flowers close-up' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photography/fire-sunset.webp`, alt: 'City skyline at sunset' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photography/sunrise-bird.webp`, alt: 'Sunrise over valley with bird' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photography/sunroof-water.webp`, alt: 'Water texture on glass' },
];
