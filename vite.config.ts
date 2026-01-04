
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Using a relative base path makes the build portable between root-served 
  // previews and subfolder deployments like GitHub Pages.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
