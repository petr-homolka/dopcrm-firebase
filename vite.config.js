import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // src/App.js obsahuje JSX (zadáno jako .js, ne .jsx) — esbuild musí
  // tento soubor parsovat jako JSX, jinak build padá na "invalid JS syntax".
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      // Manifest odpovídá stávajícímu manifest.webmanifest v prototypu
      manifest: {
        name: 'Doprovázení CRM',
        short_name: 'Doprovázení',
        description: 'CRM pro doprovázení pěstounských rodin',
        theme_color: '#FFDB4D',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      // Service worker — Workbox
      workbox: {
        // App shell + statické assety: cache-first
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Navigace vždy přes index.html (SPA routing)
        navigateFallback: 'index.html',

        // Firestore/Auth API volání nechceme cachovat
        navigateFallbackDenylist: [/^\/api\//],

        // Runtime cache pro Google Fonts (pokud se přidají)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      // Dev: service worker aktivní i v development módu (výchozí = false)
      devOptions: {
        enabled: false, // zapnout jen když ladíte offline chování: true
        type: 'module',
      },
    }),
  ],

  // Aliasy pro čistší importy
  resolve: {
    alias: {
      '@': '/src',
      '@core': '/src/core',
      '@services': '/src/services',
      '@modules': '/src/modules',
      '@shared': '/src/shared',
      '@hooks': '/src/hooks',
      '@components': '/src/components',
    },
  },

  // Dev server
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    // Proxy pro lokální AI testovací endpoint (viz CLAUDE.md § Dev)
    proxy: {
      '/ai-proxy': {
        target: 'http://localhost:8765',
        changeOrigin: true,
      },
    },
  },

  // Build optimalizace
  build: {
    outDir: 'dist',
    sourcemap: true,

    rollupOptions: {
      output: {
        // Manuální chunky — oddělení vendor knihoven pro lepší cache
        manualChunks: {
          'firebase-core':  ['firebase/app', 'firebase/auth'],
          'firebase-store': ['firebase/firestore', 'firebase/storage'],
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },

  // Vite načítá .env.local automaticky — žádná extra konfigurace nepotřeba
  // Proměnné musí mít prefix VITE_ aby byly dostupné v klientském kódu
});
