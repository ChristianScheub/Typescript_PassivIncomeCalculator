import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './src/types/index'),
      '@service': path.resolve(__dirname, './src/service'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
