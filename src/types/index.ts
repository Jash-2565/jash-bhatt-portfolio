import type { ImgHTMLAttributes } from 'react';

export interface Section {
  title: string;
  content: string;
  listItems?: string[];
  images?: { src: string; caption: string; fullWidth?: boolean; borderless?: boolean; whiteBg?: boolean; containerClass?: string; bgClass?: string }[];
  cta?: { text: string; url: string };
  embedUrl?: string;
  embedWide?: boolean;
  imageLayout?: 'row' | 'stack' | 'mixed' | 'grid' | 'techSplit' | 'storyboard';
  imageHeight?: string;
  imageCrop?: boolean;
  codeBlock?: string;
  demoId?: 'arkanoid' | 'yolov8' | 'movie-recs';
}

export interface ProjectContent {
  heroImage: string;
  thumbnailImage?: string;
  role: string;
  team?: string[];
  sections: Section[];
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  category: string;
  timeline: string;
  description: string;
  tags: string[];
  color: string;
  accentColor: string;
  hoverColor: string;
  badge: string;
  content: ProjectContent;
}

/** Views the paged mobile layout can show. */
export type MobilePage = 'home' | 'work' | 'about' | 'contact';

/** Top-level views. Explorations and case studies replace the home page
    entirely rather than sitting inside its scroll. */
export type View = 'home' | 'project' | 'explorations';

export interface GalleryItem {
  type: 'image' | 'video' | 'placeholder';
  src?: string;
  alt?: string;
}

export interface ProjectHeroTheme {
  heroBgClass: string;
  heroTextClass: string;
  heroMutedTextClass: string;
  heroBodyTextClass: string;
}

export interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  deferGifOnConstrainedNetwork?: boolean;
}
