import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Setting base to the repository name ensures assets are loaded correctly from the subfolder
  base: '/modern-weather-sg/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});