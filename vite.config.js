import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// base: './' -> generates relative paths in the build.
// This way the site works the same at https://user.github.io/any-repo-name/
// without touching anything here, no matter what you name the repository.
export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/favicon-32.png',
        'icons/apple-touch-icon.png'
      ],
      manifest: {
        name: 'foodLendar',
        short_name: 'foodLendar',
        description: 'Weekly meal menu, always at hand, even offline.',
        theme_color: '#76904A',
        background_color: '#EFECE6',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Including json so the menu data gets cached too, and can still
        // be read while offline.
        globPatterns: ['**/*.{js,css,html,svg,png,json}']
      }
    })
  ]
})
