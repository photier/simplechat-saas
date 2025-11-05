import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true
  },
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/embed.ts'),
      name: 'SimpleChatPremium',
      fileName: 'simple-chat-premium',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        entryFileNames: 'simple-chat-premium.min.js',
        inlineDynamicImports: true,
      }
    },
    minify: 'terser'
  }
})
