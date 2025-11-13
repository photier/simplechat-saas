import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_URL || '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    // Speed up build in production
    minify: 'esbuild', // Much faster than terser
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        // Optimize chunk splitting for faster builds
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'recharts'],
          'i18n-vendor': ['react-i18next', 'i18next'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5176,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    strictPort: false,
    allowedHosts: 'all',
  },
});
