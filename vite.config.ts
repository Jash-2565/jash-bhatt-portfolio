import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * onnxruntime-web references its .wasm binaries with `new URL(..., import.meta.url)`,
 * so Vite resolves them and copies a ~23MB duplicate into dist/assets. Nothing
 * ever requests that copy: YoloV8Demo sets `ort.env.wasm.wasmPaths` to
 * `/onnxruntime/`, which is served from public/. A network trace of the running
 * demo confirms only /onnxruntime/ort-wasm-simd-threaded.jsep.{mjs,wasm} is
 * fetched. Dropping the emitted duplicate takes ~23MB off every deploy without
 * changing a byte of what the browser loads.
 */
const dropBundledOrtWasm = (): Plugin => ({
  name: 'drop-bundled-ort-wasm',
  apply: 'build',
  generateBundle(_options, bundle) {
    for (const [file, chunk] of Object.entries(bundle)) {
      if (chunk.type === 'asset' && /ort-wasm.*\.wasm$/.test(file)) {
        delete bundle[file]
      }
    }
  },
})

/**
 * Stamp every image and video manifest entry with `c`, a hash of the files it
 * describes, so versionedUrl() can put `?v=<hash>` on the URL.
 *
 * /images is served with a 30-day cache, and replacing a file under the same
 * name left returning visitors on the old copy until theirs expired — the
 * Revela thumbnail was the case that surfaced it. With the hash in the URL, a
 * changed file is a new URL and is fetched at once; an unchanged one keeps its
 * URL and stays cached.
 *
 * It is computed here, at build time, from the files actually being deployed,
 * so it can never go stale the way a committed hash would when someone swaps
 * an image without re-running the optimise script. An image's hash covers its
 * width variants too, and a clip's covers its mp4, webm and poster.
 */
const stampAssetVersions = (): Plugin => {
  const publicDir = fileURLToPath(new URL('./public', import.meta.url))
  const hashFiles = (files: string[]) => {
    const hash = createHash('sha1')
    let found = false
    for (const file of files) {
      const full = path.join(publicDir, file)
      if (!existsSync(full)) continue
      hash.update(readFileSync(full))
      found = true
    }
    return found ? hash.digest('hex').slice(0, 8) : undefined
  }

  const stamp: Record<string, (key: string, entry: Record<string, unknown>) => string[]> = {
    'imageManifest.json': (key, entry) => [
      key,
      ...((entry.v as number[] | undefined) ?? []).map((w) =>
        key.replace(/\.(webp|png|jpe?g)$/i, `-${w}.webp`)
      ),
    ],
    'videoManifest.json': (key) => [`${key}.mp4`, `${key}.webm`, `${key}.poster.jpg`],
  }

  return {
    name: 'stamp-asset-versions',
    // Before vite:json, so this still receives the raw JSON text.
    enforce: 'pre',
    transform(code, id) {
      const filesFor = stamp[path.basename(id.split('?')[0])]
      if (!filesFor || !id.includes('/src/data/')) return
      const manifest = JSON.parse(code) as Record<string, Record<string, unknown>>
      for (const [key, entry] of Object.entries(manifest)) {
        const c = hashFiles(filesFor(key, entry))
        if (c) entry.c = c
      }
      return { code: JSON.stringify(manifest), map: null }
    },
  }
}

export default defineConfig(() => ({
  base: '/',
  plugins: [stampAssetVersions(), react(), dropBundledOrtWasm()],
  server: {
    host: '127.0.0.1',
    port: 5177,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        // Matched by path, not by package entry: the object form only pins the
        // bare `react-dom` entry, and the app imports `react-dom/client`, so
        // react-dom and scheduler were landing in the app chunk and getting
        // re-downloaded on every content edit.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'vendor-react'
          if (id.includes('lucide-react')) return 'vendor-lucide'
          if (id.includes('onnxruntime-web')) return 'vendor-onnx'
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}))
