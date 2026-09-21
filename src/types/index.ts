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
  /** `grid` only: one image per row instead of two. For dense UI screenshots
      whose detail is unreadable at half column width. */
  gridWide?: boolean;
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
  /** Background utility for the case study's section rules and bullet dots.
      Declared rather than derived: this used to be pulled out of `badge` with
      `.replace('text','bg').split(' ')[0]`, which quietly changed meaning if
      anyone reordered that class list — and which is why two projects ended up
      with 25%-alpha bullets while the rest had solid ones. */
  sectionAccent: string;
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
  heroTextClass: string;
  heroMutedTextClass: string;
  heroBodyTextClass: string;
}

/** What the lightbox needs to show and announce an image. */
export interface LightboxImage {
  src: string;
  /** Used as the image's alt text and shown as its caption. */
  alt: string;
}

export type ResponsiveImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** True when a visible caption already describes this media. The image is
      then marked decorative (`alt=""`) so a screen reader reads the caption
      once rather than hearing the same sentence twice. */
  captioned?: boolean;
};
