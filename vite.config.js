import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html'), admin: resolve(__dirname, 'admin/index.html') },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg', 'images/*.png', 'images/*.webp'],
      manifest: {
        name: 'Taxlead Business Solutions',
        short_name: 'Taxlead',
        description:
          'Business incorporation, tax planning, accounting, payroll, statutory compliance and virtual CFO services — Kochi, India.',
        theme_color: '#0a2540',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'en-IN',
        categories: ['business', 'finance', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,ico,png,svg,webp,woff2}'],
        globIgnores: ['**/admin*', 'admin/**'],
        // Pages are fetched fresh (client logos and admin scripts are injected at the edge);
        // the cached copy is only used when the visitor is offline.
        navigateFallback: null,
        // The company profile PDF is cached on first view instead of precached.
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/admin'),
            handler: 'NetworkFirst',
            options: { cacheName: 'pages', networkTimeoutSeconds: 4, expiration: { maxEntries: 5 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/logo/'),
            handler: 'CacheFirst',
            options: { cacheName: 'client-logos', expiration: { maxEntries: 200 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.pdf'),
            handler: 'CacheFirst',
            options: { cacheName: 'documents', expiration: { maxEntries: 5 } },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20 } },
          },
        ],
      },
    }),
  ],
})
