import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project site base:
// https://karimovkarimj85-hue.github.io/oprosnik-/
export default defineConfig({
  base: '/oprosnik-/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});

