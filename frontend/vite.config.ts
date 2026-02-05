import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/session': 'http://localhost:3000',
      '/user': 'http://localhost:3000',
      '/me': 'http://localhost:3000',
      '/passwords': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
    }
  }
})
