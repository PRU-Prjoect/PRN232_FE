import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7244',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/odata': {
        target: 'https://localhost:7244',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/odata/, '/odata')
      }
    }
  },
  optimizeDeps: {
    include: ['axios']
  }
})
