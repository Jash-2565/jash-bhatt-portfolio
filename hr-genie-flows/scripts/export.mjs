// Render a scenario to MP4 (and optionally GIF) frame by frame.
//
//   npm run export -- happy                     → out/creche-happy.mp4
//   npm run export -- pl --flow leave           → out/leave-pl.mp4
//   npm run export -- all --flow leave --gif    → every leave scenario, MP4 + GIF
//   npm run export -- happy --fps 60
//   npm run export -- happy --stills 9000,city+1500,end   → PNGs, no video
//     (a still is ms, `<node>+<ms>` after the dot reaches that node, or `end`)
//
// The app is a pure function of its playhead, so instead of screen-recording
// in real time this seeks to each frame's timestamp and screenshots it. Every
// frame is exact, and a slow machine just takes longer rather than dropping
// frames.

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";
import { chromium } from "playwright";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const fps = Number(option("fps", 30));
const stills = option("stills", null)?.split(",");
const flow = option("flow", "creche");
const target = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--")) ?? "all";
const TAIL_MS = 1500; // hold the final frame a moment

const server = await createServer({ root, logLevel: "error", server: { port: 0 } });
await server.listen();
const base = server.resolvedUrls.local[0];

// Playwright's own Chromium if `npx playwright install` has been run,
// otherwise whatever Google Chrome is installed.
const browser = await chromium.launch().catch(() => chromium.launch({ channel: "chrome" }));
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await mkdir(outDir, { recursive: true });

async function open(id) {
  await page.goto(`${base}?export=1&flow=${flow}${id ? `&scenario=${id}` : ""}`);
  await page.waitForFunction(() => window.__agentFlow);
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => window.__agentFlow);
}

async function seek(ms) {
  await page.evaluate((t) => window.__agentFlow.seek(t), ms);
}

async function renderVideo(id) {
  const { duration } = await open(id);
  const frames = Math.ceil(((duration + TAIL_MS) / 1000) * fps);
  const mp4 = path.join(outDir, `${flow}-${id}.mp4`);
  const ffmpeg = spawn(
    ffmpegPath,
    ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
     "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", mp4],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const done = new Promise((res, rej) => ffmpeg.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));

  for (let f = 0; f < frames; f++) {
    await seek(Math.min((f * 1000) / fps, duration));
    const png = await page.screenshot({ type: "png" });
    if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
    if (f % fps === 0) process.stdout.write(`\r${id}: ${Math.round((f / frames) * 100)}%`);
  }
  ffmpeg.stdin.end();
  await done;
  console.log(`\r${id}: ${path.relative(root, mp4)}`);

  if (flag("gif")) {
    const gif = path.join(outDir, `${flow}-${id}.gif`);
    await new Promise((res, rej) => {
      const p = spawn(ffmpegPath, ["-y", "-loglevel", "error", "-i", mp4, "-vf",
        "fps=15,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4",
        gif], { stdio: "inherit" });
      p.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))));
    });
    console.log(`${id}: ${path.relative(root, gif)}`);
  }
}

async function renderStills(id) {
  const { duration, beats } = await open(id);
  for (const spec of stills) {
    const [node, offset = "0"] = spec.split("+");
    const beat = beats.find((b) => b.node === node);
    const ms = spec === "end" ? duration : beat ? beat.arrive + Number(offset) : Number(spec);
    if (Number.isNaN(ms)) continue; // a node this scenario never reaches
    await seek(ms);
    const file = path.join(outDir, `${flow}-${id}-${spec.replace("+", "_")}.png`);
    await page.screenshot({ path: file });
    console.log(path.relative(root, file));
  }
}

try {
  const ids = target === "all" ? (await open()).scenarios : [target];
  for (const id of ids) await (stills ? renderStills(id) : renderVideo(id));
} finally {
  await browser.close();
  await server.close();
}
