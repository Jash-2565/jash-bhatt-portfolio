import type { GalleryItem } from '../types';
import { PUBLIC_URL } from '../utils/getBaseUrl';

export const ui = {
  btnBase: 'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium transition-all duration-300',
  btnPrimary: 'bg-[#01F5D1] text-black hover:bg-[#00D8B8] hover:shadow-[0_0_32px_-4px_rgba(1,245,209,0.55)] hover:-translate-y-0.5',
  btnSecondary: 'bg-slate-900/70 text-slate-100 border border-slate-700 hover:border-[#01F5D1] hover:text-[#01F5D1] hover:-translate-y-0.5',
  cardBase: 'border border-slate-800 rounded-2xl bg-slate-900/70 backdrop-blur-sm transition-all duration-300',
  cardHover: 'hover:-translate-y-1 hover:shadow-[0_22px_55px_-20px_rgba(1,245,209,0.35)] hover:border-[#01F5D1]/60',
  chipBase: 'px-3 py-1.5 text-sm font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-full transition-colors duration-200 hover:border-[#01F5D1]/70 hover:text-[#9EF7EA]',
  chipAccent: 'px-3 py-1.5 text-sm font-medium text-[#01F5D1] bg-[#00A19B]/15 border border-[#00A19B]/50 rounded-full',
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
  { label: 'Last Internship', value: 'RAHI Platform Technologies' },
  { label: 'Status', value: 'Available — Summer 2026' },
];

export const galleryItems: GalleryItem[] = [
  { type: 'image', src: `${PUBLIC_URL}/images/Photoshop and Animation/la la land.jpg`, alt: 'La La Land Art' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photoshop and Animation/Mrs jordan.jpg`, alt: 'Mrs Jordan Art' },
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
