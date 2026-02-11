import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth'],
          vendor: ['react', 'react-dom'],
          xlsx: ['xlsx'],
          icons: ['lucide-react'],
        },
      },
    },
    // esbuild 사용 (기본값, terser보다 빠름)
    minify: 'esbuild',
    // 청크 크기 경고 제한 증가
    chunkSizeWarningLimit: 1000,
  },
  // 개발 서버 최적화
  server: {
    host: true,
    port: 5173,
  },
})
