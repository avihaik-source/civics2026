import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ── Build output ───────────────────────────────────────────
  build: {
    outDir: 'dist',
    
    // Terser: aggressive minification (removes ~40-60% of file size)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,        // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,                 // Two passes = better compression
        unsafe_math: false,        // Keep math safe for score calculations
      },
      mangle: {
        toplevel: false,           // Don't mangle top-level (global functions in HTML)
      },
      format: {
        comments: false,           // Strip all comments
      },
    },

    // ── Code splitting ──────────────────────────────────────
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        // Lazy-load heavy data files separately
        manualChunks(id) {
          if (id.includes('questions-data'))  return 'chunk-questions'
          if (id.includes('scaffolding'))     return 'chunk-scaffolding'
          if (id.includes('features'))        return 'chunk-features'
          if (id.includes('data.js'))         return 'chunk-data'
          // הוראה ל-Vite לארוז את ספריות ה-UI של React בנפרד כדי שהאתר יטען מהר
          if (id.includes('node_modules/react')) return 'vendor-react' 
        },
        // Content hash in filenames → perfect cache busting
        entryFileNames:   'assets/[name]-[hash].js',
        chunkFileNames:   'assets/[name]-[hash].js',
        assetFileNames:   'assets/[name]-[hash].[ext]',
      },
    },

    // ── Reporting ───────────────────────────────────────────
    reportCompressedSize: true,
    chunkSizeWarningLimit: 400,    // Warn if any chunk > 400KB
    
    // ── Source maps (disabled in prod for smaller files) ────
    sourcemap: false,
  },

  // ── Dev server ─────────────────────────────────────────────
  server: {
    host: true,
    port: 5173,
    open: false,
    // Proxy API calls to local Wrangler during dev
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },

  // ── Preview server (after build) ───────────────────────────
  preview: {
    port: 4173,
    host: true,
  },
})