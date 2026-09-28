#!/usr/bin/env node
/**
 * Emit one HTML file per route, each with its own <head>, plus a sitemap.
 *
 * The site is a single-page app: whatever route you ask for, the server hands
 * back the same `index.html` and the JavaScript decides what to render. Link
 * scrapers do not run that JavaScript. LinkedIn, Slack, iMessage, Discord and
 * every search crawler that skips JS therefore saw the *home page's* title,
 * description and image for all eleven case studies — every share of every
 * project produced the identical generic card.
 *
 * Fixing that in the client is impossible; the meta has to be in the bytes the
 * server sends. So after `vite build` this walks the route table, clones the
 * built `index.html`, rewrites the eight tags that differ, and writes it to the
 * path that route lives at. The JS bundle is byte-identical in every copy, so
 * this costs ~14 small HTML files and nothing at runtime.
 *
 * Usage: runs automatically as part of `npm run build`.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const ORIGIN = 'https://jashbhatt.com';
const DEFAULT_IMAGE = `${ORIGIN}/og-image.jpg`;

/** Pull the project list straight out of the source of truth. */
async function loadProjects() {
  const source = await readFile(path.join(ROOT, 'src', 'data', 'projects.ts'), 'utf8');
  const grab = (re) => [...source.matchAll(re)].map((m) => m[1]);
  const slugs = grab(/^\s{4}slug:\s*"([^"]+)"/gm);
  const titles = grab(/^\s{4}title:\s*"([^"]+)"/gm);
  const categories = grab(/^\s{4}category:\s*"([^"]+)"/gm);
  const descriptions = grab(/^\s{4}description:\s*"((?:[^"\\]|\\.)*)"/gm);

  if (
    slugs.length === 0 ||
    new Set([slugs.length, titles.length, categories.length, descriptions.length]).size !== 1
  ) {
    throw new Error(
      `Could not parse projects.ts consistently ` +
        `(slugs=${slugs.length} titles=${titles.length} ` +
        `categories=${categories.length} descriptions=${descriptions.length})`
    );
  }

  return slugs.map((slug, i) => ({
    slug,
    title: titles[i],
    category: categories[i],
    description: descriptions[i].replace(/\\"/g, '"'),
  }));
}

const escapeAttr = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Swap the content of one meta tag, matched on its name/property. */
function setMeta(html, selectorAttr, selectorValue, content) {
  const re = new RegExp(
    `(<meta\\s+${selectorAttr}="${selectorValue}"\\s+content=")[^"]*(")`,
    'i'
  );
  if (!re.test(html)) {
    throw new Error(`prerender: no <meta ${selectorAttr}="${selectorValue}"> in index.html`);
  }
  return html.replace(re, `$1${escapeAttr(content)}$2`);
}

function render(template, { title, description, shareDescription = description, urlPath, image, imageAlt }) {
  const url = `${ORIGIN}${urlPath}`;
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(title)}</title>`);
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/i,
    `$1${escapeAttr(url)}$2`
  );
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', shareDescription);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'property', 'og:image:alt', imageAlt);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', shareDescription);
  html = setMeta(html, 'name', 'twitter:image', image);

  return html;
}

async function main() {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const projects = await loadProjects();

  const home = {
    title: 'Jash Bhatt | Product Designer & Agentic AI Designer',
    description:
      'Conversational AI agents at Bajaj Finance, a B2B marketplace for corporate mobility, and a Spotify data story — case studies from a B.Des student at FLAME University.',
    // The share card already carries the pitch, so the text under it in a link
    // preview just names the site. Search results keep the fuller description.
    shareDescription: 'Jash Bhatt Portfolio',
    imageAlt:
      'Jash Bhatt — product designer and agentic AI designer, with a portrait of Jash.',
  };

  const routes = [
    { out: 'index.html', urlPath: '/', ...home },
    {
      out: 'work/index.html',
      urlPath: '/work',
      title: 'Selected Work | Jash Bhatt',
      description:
        'AI agents, AI-enabled interfaces, and the circuits underneath them — eleven projects in design, engineering, and behavior.',
      imageAlt: home.imageAlt,
    },
    {
      out: 'about/index.html',
      urlPath: '/about',
      title: 'About | Jash Bhatt',
      description:
        'Product designer working across software and hardware — conversational AI agents at Bajaj Finance, design systems at RAHI, and interfaces running on circuits I soldered myself.',
      imageAlt: home.imageAlt,
    },
    {
      out: 'contact/index.html',
      urlPath: '/contact',
      title: 'Contact | Jash Bhatt',
      description:
        'Open to roles in agentic AI, product design, and UI/UX — from research through to implementation.',
      imageAlt: home.imageAlt,
    },
    {
      out: 'explorations/index.html',
      urlPath: '/explorations',
      title: 'Creative Explorations | Jash Bhatt',
      description:
        'Photography, brand motion, generative experiments, and image-making alongside the case studies.',
      imageAlt: home.imageAlt,
    },
    ...projects.map((project) => ({
      out: `work/${project.slug}/index.html`,
      urlPath: `/work/${project.slug}`,
      title: `${project.title} — ${project.category} | Jash Bhatt`,
      description: project.description,
      imageAlt: `${project.title} — ${project.category}`,
    })),
  ];

  for (const route of { [Symbol.iterator]: () => routes[Symbol.iterator]() }) {
    const html = render(template, { image: DEFAULT_IMAGE, ...route });
    const outPath = path.join(DIST, route.out);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html);
    console.log(`  ${route.urlPath.padEnd(34)} → dist/${route.out}`);
  }

  // A branded 404.
  //
  // Vercel serves `404.html` for anything that matches no file, which is the
  // right behaviour: an unknown path gets a real 404 status rather than being
  // rewritten to the home page, which is a soft 404 and which search engines
  // treat as a defect. What it must not be is Vercel's bare `NOT_FOUND` text
  // page — no branding, no name, no way back.
  //
  // Static on purpose. It carries no JS bundle, so it still renders if the app
  // itself is what's broken. It still looks like the site: the same three
  // fonts, the same circuit board behind it (drawn here from the generator the
  // page background uses), and Lewis standing by with a speech bubble — his
  // idle loop run by CSS steps(), since there is no script to drive it.
  const { board, BAND, WIDTH } = await import('../src/lib/circuitBoard.ts');
  const BOARD_BANDS = 3; // 1536px of board, taller than any phone's screen
  const { traces, pads } = board(BOARD_BANDS);
  const boardH = BOARD_BANDS * BAND;
  const circuit = `<svg viewBox="0 0 ${WIDTH} ${boardH}" fill="none" aria-hidden="true"><path d="${traces}" stroke="currentColor" stroke-opacity="0.085" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/><path d="${pads}" fill="currentColor" fill-opacity="0.3"/></svg>`;

  // Same content hash stampAssetVersions puts on the sprite in the app, so the
  // 404 shares its cached copy and picks up a redrawn sheet at once.
  const SPRITE = '/images/Lewis Pet/lewis-spritesheet.webp';
  const spriteVersion = createHash('sha1')
    .update(await readFile(path.join(ROOT, 'public', SPRITE)))
    .digest('hex')
    .slice(0, 8);
  const spriteUrl = `${encodeURI(SPRITE)}?v=${spriteVersion}`;
  // Geometry from src/config/lewis.ts: 192×208 cells, 8 to a row; row 0 is
  // the idle loop, 6 frames at 0.18s.
  const LEWIS_SCALE = 0.75;
  const cellW = 192 * LEWIS_SCALE;
  const cellH = 208 * LEWIS_SCALE;

  const notFound = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="robots" content="noindex" />
<meta name="theme-color" content="#010309" />
<link rel="icon" type="image/svg+xml" href="/Jash-portfolio-logo.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Oxanium:wght@500;600;700&family=Sora:wght@400;500;600;700&display=swap" />
<title>Page not found | Jash Bhatt</title>
<style>
  :root{--ground:#010309;--surface-1:#0d141c;--surface-2:#161f28;--accent-rgb:1 245 209;
    --accent:rgb(var(--accent-rgb));--accent-br:#9ef7ea;--ink:#f1f5f9;--ink-body:#cbd5e1;
    --ink-muted:#94a3b8;--ink-inverse:#020617;
    --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace}
  *{box-sizing:border-box}
  body{margin:0;min-height:100svh;display:flex;align-items:center;position:relative;overflow-x:clip;
    background:var(--ground);color:var(--ink);font-family:'Sora',sans-serif;line-height:1.6;
    -webkit-font-smoothing:antialiased}
  /* The page background's board, at the same strength and phone scale. */
  .circuit{position:absolute;inset:0;overflow:hidden;pointer-events:none;color:rgb(var(--accent-rgb) / .5)}
  .circuit svg{display:block;width:${WIDTH}px;height:${boardH}px}
  @media (max-width:767px){
    .circuit{color:rgb(var(--accent-rgb) / .38)}
    .circuit svg{width:${WIDTH * 1.25}px;height:${boardH * 1.25}px}
  }
  .wrap{position:relative;z-index:1;width:100%;max-width:56rem;margin:0 auto;padding:3rem 1.25rem;
    display:flex;flex-direction:column-reverse;gap:2rem}
  @media (min-width:720px){
    .wrap{flex-direction:row;align-items:center;justify-content:space-between;gap:3rem;padding:3rem 2rem}
  }
  .kicker{font:500 12px/1 var(--mono);letter-spacing:.2em;text-transform:uppercase;color:var(--ink-muted);margin:0 0 1rem}
  h1{font-family:'Oxanium',sans-serif;font-weight:600;letter-spacing:.01em;
    font-size:clamp(1.75rem,6vw,2.5rem);line-height:1.15;margin:0 0 .75rem}
  p{margin:0 0 1.75rem;color:var(--ink-body);max-width:30rem}
  .links{display:flex;flex-wrap:wrap;gap:.75rem}
  .links a{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 1.5rem;
    border-radius:2px;font:500 14px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;
    text-decoration:none;transition:background-color .2s,color .2s,transform .2s}
  @media (min-width:640px){.links a{padding:0 2rem}}
  .primary{background:var(--accent);color:var(--ink-inverse)}
  .primary:hover{background:var(--accent-br);transform:translateY(-2px)}
  .secondary{background:var(--surface-2);color:var(--ink)}
  .secondary:hover{color:var(--accent-br)}
  .links a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

  /* Lewis, standing by. The bubble sits above him, its tail pointing down at
     his head. */
  .lewis{flex-shrink:0;display:flex;flex-direction:column;align-items:flex-start}
  @media (min-width:720px){.lewis{align-items:center}}
  .bubble{position:relative;margin:0 0 14px;padding:.6rem .85rem;max-width:15rem;
    background:var(--surface-1);border:1px solid rgb(var(--accent-rgb) / .35);border-radius:2px;
    font:500 12px/1.5 var(--mono);letter-spacing:.02em;color:var(--ink)}
  .bubble::after{content:'';position:absolute;bottom:-6px;left:48px;width:10px;height:10px;
    background:var(--surface-1);border-right:1px solid rgb(var(--accent-rgb) / .35);
    border-bottom:1px solid rgb(var(--accent-rgb) / .35);transform:rotate(45deg)}
  @media (min-width:720px){.bubble::after{left:50%;margin-left:-5px}}
  .sprite{width:${cellW}px;height:${cellH}px;margin-left:8px;
    background:url("${spriteUrl}") 0 0 / ${192 * 8 * LEWIS_SCALE}px auto no-repeat;
    image-rendering:pixelated;animation:idle 1.08s steps(6) infinite}
  @media (min-width:720px){.sprite{margin-left:0}}
  @keyframes idle{to{background-position-x:-${cellW * 6}px}}
  @media (prefers-reduced-motion:reduce){.sprite{animation:none}}
</style>
</head>
<body>
  <div class="circuit">${circuit}</div>
  <main class="wrap">
    <div>
      <p class="kicker">404</p>
      <h1>That page isn't here.</h1>
      <p>The link may be out of date, or the address may have a typo in it. The work is all one click away.</p>
      <div class="links">
        <a class="primary" href="/work">See the work</a>
        <a class="secondary" href="/">Home</a>
      </div>
    </div>
    <div class="lewis" aria-hidden="true">
      <div class="bubble">Box, box! This page never made it to the grid.</div>
      <div class="sprite"></div>
    </div>
  </main>
</body>
</html>
`;
  await writeFile(path.join(DIST, '404.html'), notFound);
  console.log('  404                                → dist/404.html');

  // Sitemap, from the same route table so the two can never disagree.
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map((route) =>
      [
        '  <url>',
        `    <loc>${ORIGIN}${route.urlPath}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>monthly</changefreq>`,
        `    <priority>${route.urlPath === '/' ? '1.0' : '0.8'}</priority>`,
        '  </url>',
      ].join('\n')
    ),
    '</urlset>',
    '',
  ].join('\n');
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);

  console.log(`\n${routes.length} routes prerendered · sitemap.xml written`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
