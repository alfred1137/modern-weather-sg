import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

export default defineConfig({
  plugins: [react()],
  // Single source of truth for the app version: package.json "version".
  // The footer in App.tsx reads __APP_VERSION__ (injected at build/dev time),
  // so version bumps never touch source files.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // Using a relative base path makes the build portable between root-served
  // previews and subfolder deployments like GitHub Pages.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
