import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages base path. The deploy workflow uploads explorer/dist as the
// Pages artifact, so the site lives at https://<user>.github.io/<repo>/
// Repo name assumed to be "fabricate". Update if you rename.
export default defineConfig({
  plugins: [react()],
  base: '/fabricate/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
