import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this repo from /jash-bhatt-portfolio/, so only that
// build (identified by the GITHUB_ACTIONS env var the workflow runs under)
// needs the prefix. Vercel (jashbhatt.com) serves from the domain root, so
// its build — and local dev — must stay at /.
export default defineConfig(() => ({
  base: process.env.GITHUB_ACTIONS ? '/jash-bhatt-portfolio/' : '/',
  plugins: [react()],
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
