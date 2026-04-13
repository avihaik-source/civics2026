import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' 
import tailwindcss from '@tailwindcss/vite'
import devServer from '@hono/vite-dev-server'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    devServer({
      entry: 'src/server/index.ts',
      exclude: [
        /^(?!\/api).*/
      ],
      injectClientScript: false,
    })
  ],
  build: {
    outDir: 'dist',
    // כאן היה ה-terser שגרם לשגיאה. החלפנו ל-esbuild המובנה.
      minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'vendor-react'
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
  }
})