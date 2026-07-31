import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this repo from /jash-bhatt-portfolio/, so production
// assets must be prefixed with it. Dev stays at / so localhost URLs are clean.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/jash-bhatt-portfolio/' : '/',
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
