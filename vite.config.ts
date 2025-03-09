import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for relative paths in WebView
  // base: "/moh_twk_health_profile_react/", // Set repo name as base path
  build: {
    outDir: 'dist', // Output directory
    assetsDir: 'assets', // Ensures organized assets
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Keep all chunks in a single file
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(new URL(import.meta.url).pathname), './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        cors: true
      }
    }
  }
})