import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "../backend/app/frontend",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["assets/images/favicon.svg"],
      manifest: {
        name: "TİD Coach",
        short_name: "TİD Coach",
        description:
          "Türk İşaret Dili çevirmeni ve çalışma aracı / Turkish Sign Language translator and practice tool",
        lang: "tr",
        start_url: "/",
        display: "standalone",
        theme_color: "#0d9488",
        background_color: "#09090b",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // The app shell only. The hand tracking files are 47 MB together, so
        // they are fetched the first time the Translator is opened instead of
        // being forced on everyone at install time.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        globIgnores: ["**/wasm/**", "**/models/**", "**/videos/**"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/wasm/"),
            handler: "CacheFirst",
            options: {
              cacheName: "mediapipe-wasm",
              expiration: { maxEntries: 12 },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true,
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/models/"),
            handler: "CacheFirst",
            options: {
              cacheName: "mediapipe-models",
              expiration: { maxEntries: 5 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/videos/"),
            handler: "CacheFirst",
            options: {
              cacheName: "sign-videos",
              expiration: { maxEntries: 250 },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true,
            },
          },
        ],
      },
    }),
  ],
})
