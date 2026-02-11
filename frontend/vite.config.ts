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
          // 무거운 데모 컴포넌트들을 별도 청크로 분리
          demos: [
            './src/components/landing/ChatDemo',
            './src/components/landing/ApplicationFlowDemo', 
            './src/components/landing/AIEvaluationDemo'
          ]
        },
      },
    },
    // 압축 및 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true,
      },
    },
  },
  // 개발 서버 최적화
  server: {
    host: true,
    port: 5173,
  },
  // 프리로딩 최적화
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/auth'],
    exclude: ['lucide-react'], // 아이콘은 필요할 때 로드
  },
})
