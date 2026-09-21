# jashbhatt.com

Personal portfolio for Jash Bhatt — product designer and agentic AI designer. A
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
| `npm run build` | Typecheck, build to `dist/`, then prerender one HTML file per route |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over the whole repo |
| `npm run optimize:images` | Cap oversized images, emit srcset variants, rewrite the image manifest |
| `npm run optimize:videos` | Re-encode the autoplaying clips to VP9/H.264 plus poster frames |
| `npm run manifest:videos` | Record which encodings each clip actually has, and their dimensions |
| `npm run prerender` | The per-route `<head>` pass on its own (normally part of `build`) |

## Routing

Real paths, not hashes:

| Path | View |
| --- | --- |
| `/` `/work` `/about` `/contact` | The home page — one scroll at `lg+`, four separate pages below it |
| `/explorations` | Creative Explorations |
| `/work/<slug>` | A case study |

The routing is still entirely client-side; `src/utils/routes.ts` resolves the URL
and `App.tsx` pushes to it. What the paths buy is a `<head>` a scraper can read.
`scripts/prerender.mjs` runs after `vite build` and writes one HTML file per
route with its own title, description, canonical and OG tags, so each case study
gets its own link preview. Add a project and it appears there automatically — the
script reads `src/data/projects.ts`.

Every old `#hash` link still works. `legacyHashRoute` maps `#<slug>`,
`#project-<id>`, `#gallery` and the four section anchors onto the new paths, and
the app rewrites the address bar in place on arrival.

Anything that isn't one of those routes genuinely is a 404, so it gets one —
`prerender.mjs` also writes `dist/404.html`, which Vercel serves for unmatched
paths. Rewriting them to the home page instead would be a soft 404, which search
engines treat as a defect, and which tells a visitor with a stale link nothing.

`vercel.json` handles the rest: `cleanUrls`, `trailingSlash` and cache headers.

## Layout

```
src/
  App.tsx           Home, Work, About, Contact — one scroll at lg+, paged below it
  components/       UI components; the three demos are lazy-loaded
  config/           Curation and ordering of projects, shared Tailwind class strings
  data/             Case-study content, generated image manifest, demo source listings
  hooks/            useInView, useIsMobile, usePointerFine
  types/            Shared content and project types
  utils/            Base-URL prefix, route table, srcset lookup, small formatters
public/
  images/           Case-study media, plus generated -480/-960/-1440 variants
  models/           YOLOv8 weights and the movie dataset
  onnxruntime/      WASM runtime served directly (not bundled — see vite.config.ts)
  spotify-wrapped/  "The Soundtrack of Seven Years" — a standalone data-viz page,
                    served as-is rather than routed through the app (see below)
scripts/
  optimize-images.mjs   Image cap + srcset pass (writes src/data/imageManifest.json)
  optimize-videos.mjs   Video re-encode pass
  video-manifest.mjs    Records available encodings + dimensions (src/data/videoManifest.json)
  prerender.mjs         Per-route <head> + sitemap, run after vite build
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
  `optimize-videos.mjs` deletes a VP9 file whenever it lands heavier than its
  H.264 sibling, so most clips are mp4-only — `video-manifest.mjs` records which
  encodings exist and `AutoVideo` only emits a `<source>` for those. Re-run both
  after adding or re-encoding a clip.

## The standalone Spotify piece

`public/spotify-wrapped/index.html` is a finished artefact, not a page this app
renders. It is one self-contained file — data payload, extras, and every album
cover inlined as base64 — generated by a separate Python pipeline that lives with
the Spotify export, not in this repo. Nothing here builds it; it is copied in
whole, and re-running that pipeline against a fresh export replaces the file.

The case study links to it as `/spotify-wrapped/index.html`, naming the file
rather than the directory: a static host resolves `/spotify-wrapped/` to the
index, but Vite's dev server answers that path with the SPA shell instead.

Two edits are maintained here by hand rather than by that pipeline, so they need
re-applying if the file is regenerated: the `<html lang="en">` wrapper, and the
`.site-back` link plus the byline under the hero (the piece speaks in the second
person about Jash's own listening history, and without the byline that reads as
a template nobody filled in).

## Deployment

`main` deploys automatically to <https://jashbhatt.com>. Push only when a change
is ready to be live.
