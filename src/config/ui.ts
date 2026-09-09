import type { GalleryItem } from '../types';
import { PUBLIC_URL } from '../utils/getBaseUrl';

export const ui = {
  // Controls are square-cornered and mono-labelled: the radius scale in
  // tailwind.config.js tops out at 4px, so `rounded` here is 2px, not a pill.
  btnBase: 'inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3.5 sm:px-8 sm:py-4 rounded font-mono text-sm uppercase tracking-[0.08em] transition-all duration-200',
  btnPrimary: 'bg-accent text-black hover:bg-accent-br hover:-translate-y-0.5',
  // Filled rather than outlined: with .surface unoutlined a control needs the
  // raised tone to read as a control against a --surface-1 pane.
  btnSecondary: 'surface surface-hover !bg-[var(--surface-2)] text-slate-100 hover:text-accent-br',
  cardBase: 'surface surface-marks rounded-sm',
  cardHover: 'surface-hover',
  chipBase: 'chip label px-2.5 py-1.5 text-slate-200 rounded-sm hover:text-accent-br',
  chipAccent: 'chip label px-2.5 py-1.5 text-accent-br rounded-sm !bg-accent/10',

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
  // The two role titles lead; the skill areas follow. 'Agentic AI Developer'
  // sits apart from 'AI-Assisted Design' so the two AI lines never land
  // back to back in the cycle.
  'Product Designer',
  'Agentic AI Developer',
  'UI/UX & Interaction Design',
  'Circuit & Hardware',
  'AI-Assisted Design',
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
  { type: 'image', src: `${PUBLIC_URL}/images/Photography/sunroof-water.webp`, alt: 'Water texture on surface' },
];
