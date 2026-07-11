import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { designQueuePlugin } from './vite-design-queue-plugin';
import { designAiPlugin } from './vite-design-ai-plugin';
import { commandCenterPlugin } from './vite-command-center-plugin';
import { appScannerPlugin } from './vite-app-scanner-plugin';

export default defineConfig({
  plugins: [react(), tailwindcss(), designQueuePlugin(), designAiPlugin(), commandCenterPlugin(), appScannerPlugin()],
  base: './',
  root: '.',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
