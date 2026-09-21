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
  /** Small caps label above a heading. Mono, like the project category labels,
      and slate-400 — slate-500 on the ground is 4.26:1, under AA for 12px. */
  eyebrow: 'font-mono text-xs uppercase tracking-[0.2em] text-slate-400',
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
      has to fit one screen minus the header and the bottom tab bar.
      Above md the size is fluid rather than a flat 4.2rem. Fixed, it took no
      account of how narrow the hero column gets between md and full desktop:
      at 1024 the column is 605px, and the headline ran to seven lines there
      while fitting in five on a 1440. The ceiling is still 4.2rem, so anything
      from ~1344px up renders exactly as before. */
  h1: 'text-[clamp(1.6rem,6.4vw,2.6rem)] md:text-[clamp(2.6rem,5vw,4.2rem)] leading-[1.12] md:leading-[1.05] [text-wrap:balance]',
  h2: 'text-[1.75rem] sm:text-3xl md:text-4xl',
  /** 44px minimum touch target, per WCAG 2.2 target-size guidance. */
  tapTarget: 'min-h-11 min-w-11',
  /** The site's focus indicator. index.css also sets a `:focus-visible`
      fallback for anything that misses this, so the two can't diverge. */
  focusRing: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ground)]',
} as const;

/**
 * Contact details, in one place. They were previously typed out at each of the
 * five call sites, which is how the mobile home strip and the contact section
 * drifted apart.
 */
export const CONTACT_EMAIL = 'jashbhatt.contact@gmail.com';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/jash-bhatt';
export const LINKEDIN_HANDLE = '/in/jash-bhatt';
/**
 * TODO(jash): set this to your GitHub profile and the links appear.
 *
 * Left null rather than guessed: a portfolio whose case studies ship React,
 * Python, ONNX and Swift had no link to any of the code, which is the first
 * thing an engineering-adjacent reviewer looks for. Everything that renders it
 * is already wired up — footer, contact card, and the per-project repo links
 * below — and all of it stays hidden until this is a real URL.
 */
export const GITHUB_URL: string | null = null;

export const personalitySignals = [
  // The two role titles lead; the skill areas follow. 'Agentic AI Design'
  // sits apart from 'AI-Assisted Design' so the two AI lines never land
  // back to back in the cycle.
  'Product Designer',
  'Agentic AI Design',
  'UI/UX & Interaction Design',
  'Circuit & Hardware',
  'AI-Assisted Design',
];

export const operatorStats = [
  { label: 'Currently', value: 'B.Des · FLAME University' },
  { label: 'Last Role', value: 'Agentic AI · Bajaj Finance' },
  // Was "Status: Available for work" — the third of four places the page said
  // the same thing, between the hero's "Open to Work" chip and two more in
  // Contact. A stat card is a poor use of the fourth-most-read line on the
  // page for a fact already established above it.
  { label: 'Focus', value: 'Agentic AI · AI UX' },
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
