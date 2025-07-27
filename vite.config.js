import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 // 10 MB erlauben
      },
      manifest: {
        name: 'WedReel',
        short_name: 'WedReel',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ff4081',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      }
    })
  ],
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true
  }
})
