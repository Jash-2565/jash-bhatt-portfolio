# jashbhatt.com

Personal portfolio for Jash Bhatt — product designer and design engineer. A
single-page React app with case studies, a creative-explorations gallery, and
three playable in-browser demos (an Arkanoid clone, a YOLOv8 object detector
running on-device via ONNX Runtime, and a movie recommender).

Built with Vite, React 19, TypeScript and Tailwind CSS 3.

## Getting started

```bash
npm install
npm run dev
```

The dev server listens on `http://127.0.0.1:5177`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over the whole repo |
| `npm run optimize:images` | Cap oversized images, emit srcset variants, rewrite the image manifest |
| `npm run optimize:videos` | Re-encode the autoplaying clips to VP9/H.264 plus poster frames |

## Layout

```
src/
  App.tsx           Home, Work, About, Contact — one scroll at lg+, paged below it
  components/       UI components; the three demos are lazy-loaded
  config/           Curation and ordering of projects, shared Tailwind class strings
  data/             Case-study content, generated image manifest, demo source listings
  hooks/            useInView, useIsMobile, usePointerFine
  types/            Shared content and project types
  utils/            Base-URL prefix, srcset lookup, small formatters
public/
  images/           Case-study media, plus generated -480/-960/-1440 variants
  models/           YOLOv8 weights and the movie dataset
  onnxruntime/      WASM runtime served directly (not bundled — see vite.config.ts)
scripts/
  optimize-images.mjs   Image cap + srcset pass (writes src/data/imageManifest.json)
  optimize-videos.mjs   Video re-encode pass
  gif-to-video.sh       One-shot GIF → mp4/webm/poster conversion
  og-card.html          Source layout for public/og-image.png
```

## Media pipeline

Case-study media never ships as it was exported.

- **Images.** `npm run optimize:images` caps any source longer than 2400px on its
  long edge, emits 480/960/1440px WebP siblings, and records intrinsic sizes in
  `src/data/imageManifest.json`. `ResponsiveImage` reads that manifest to build a
  `srcset` and to set `width`/`height` so images don't shift the layout as they
  load. Re-run it after adding images.
- **Video.** Animated GIFs are converted to muted, looping `<video>` elements.
  Project data still references the original `.gif` path; `AutoVideo` swaps in
  the `.webm`/`.mp4`/`.poster.jpg` siblings and plays only while in view.

## Deployment

`main` deploys automatically to <https://jashbhatt.com>. Push only when a change
is ready to be live.
