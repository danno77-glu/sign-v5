import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-lib': ['pdf-lib', '@pdf-lib/fontkit'],
          'react-pdf': ['react-pdf', 'pdfjs-dist'],
        },
      },
    },
  },
});
