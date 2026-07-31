import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => ({
  base: '/',
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
