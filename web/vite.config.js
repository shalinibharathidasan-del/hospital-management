import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    // Forward /api calls to the Express server during development
    proxy: { '/api': 'http://localhost:5003' },
  },
})
