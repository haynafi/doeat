import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/doeat/', // GitHub Pages base path (repo name)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
