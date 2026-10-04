// Encode the rendered short cut for the Revela case study's Demo section.
// Uses the site's ffmpeg-static rather than Remotion's bundled ffmpeg, whose
// VP9 output failed to decode in Chrome. Run `npm run manifest:videos` in the
// site afterwards if the dimensions change.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const ffmpeg = createRequire(new URL('../package.json', import.meta.url))('ffmpeg-static');
const src = 'out/revela-short.mp4';
const out = '../public/images/Revela/revela-demo';
const scale = ['-vf', 'scale=1280:-2'];
const run = (args) => execFileSync(ffmpeg, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });

run(['-i', src, '-an', ...scale, '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow', '-movflags', '+faststart', `${out}.mp4`]);
run(['-i', src, '-an', ...scale, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', `${out}.webm`]);
// 6.5s lands mid-walk with the wand glowing green — the clearest single frame.
run(['-ss', '6.5', '-i', src, ...scale, '-frames:v', '1', '-q:v', '3', `${out}.poster.jpg`]);
