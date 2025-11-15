import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/embed.ts'),
      name: 'SimpleChat',
      fileName: 'simple-chat',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        entryFileNames: 'simple-chat.min.js',
        inlineDynamicImports: true,
      }
    },
    minify: 'terser'
  }
})
