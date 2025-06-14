import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/jisho-api': {
        target: 'https://jisho.org',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/jisho-api/, '/api/v1'),
        secure: false,
      }
    }
  }
})
