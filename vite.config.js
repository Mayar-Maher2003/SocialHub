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
          if (/[\/]node_modules[\/](react|react-dom|scheduler|react-router|react-router-dom)[\/]/.test(id))
            return 'react-vendor'
          if (/[\/]node_modules[\/](@heroui|@react-aria|@react-stately|@react-types|framer-motion|motion-dom|motion-utils)[\/]/.test(id))
            return 'ui-vendor'
          return 'vendor'
        },
      },
    },
  },
})
