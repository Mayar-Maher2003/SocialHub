import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // Rollup ids use OS-native separators on Windows; normalise so the
          // matches below work on both Windows and the Linux CI/Vercel build.
          const path = id.split('\\').join('/')
          if (/\/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(path))
            return 'react-vendor'
          if (/\/node_modules\/(@heroui|@react-aria|@react-stately|@react-types|framer-motion|motion-dom|motion-utils)\//.test(path))
            return 'ui-vendor'
          return 'vendor'
        },
      },
    },
  },
})
