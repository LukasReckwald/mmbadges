import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
  server: {
    // In development the badges come from `npm run dev` (wrangler on port 8787)
    proxy: { '/brand': 'http://localhost:8787', '/status': 'http://localhost:8787' },
  },
});
