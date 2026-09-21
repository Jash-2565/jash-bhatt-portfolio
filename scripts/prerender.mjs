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

function render(template, { title, description, urlPath, image, imageAlt }) {
  const url = `${ORIGIN}${urlPath}`;
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(title)}</title>`);
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/i,
    `$1${escapeAttr(url)}$2`
  );
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'property', 'og:image:alt', imageAlt);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);
  html = setMeta(html, 'name', 'twitter:image', image);

  return html;
}

async function main() {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const projects = await loadProjects();

  const home = {
    title: 'Jash Bhatt | Product Designer & Agentic AI Designer',
    description:
      'I design and build intelligent products that combine AI, software, and human-centered interaction.',
    imageAlt:
      'Jash Bhatt — product designer and agentic AI designer. Product Design, UI/UX, Agentic AI, Circuits.',
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
