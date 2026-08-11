import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

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

export default defineConfig(() => ({
  base: '/',
  plugins: [react(), dropBundledOrtWasm()],
  server: {
    host: '127.0.0.1',
    port: 5177,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-lucide': ['lucide-react'],
          'vendor-onnx': ['onnxruntime-web'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}))
