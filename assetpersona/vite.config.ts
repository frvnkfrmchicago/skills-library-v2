import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { appScannerPlugin } from './vite-plugin-app-scanner'

// https://vite.dev/config/
export default defineConfig(({ command }): UserConfig => {
  const isBuild = command === 'build'
  const config: UserConfig = {
    plugins: [
      react(),
      appScannerPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Asset Persona',
          short_name: 'AssetPersona',
          description: 'Agentic learning platform and portfolio system',
          theme_color: '#09090b',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallback: '/index.html',
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB limit to cover large images
          runtimeCaching: [
            {
              urlPattern: /^\/community\/classroom/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'classroom-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 86400 * 7 // 1 week
                }
              }
            },
            {
              urlPattern: /^\/community\/portfolio/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'portfolio-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 86400 * 7
                }
              }
            },
            {
              urlPattern: /^\/guides/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'guides-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 86400 * 30 // 30 days
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
              if (id.includes('react-router')) return 'vendor-router'
              if (id.includes('@phosphor-icons') || id.includes('lucide-react')) return 'vendor-icons'
              if (id.includes('@supabase')) return 'vendor-supabase'
              if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('unified') || id.includes('mdast') || id.includes('hast') || id.includes('micromark')) return 'vendor-markdown'
              if (id.includes('react-helmet')) return 'vendor-helmet'
              // GSAP + ScrollTrigger ship together but only land on routes
              // that actually scroll-animate. Splitting keeps admin /
              // community routes from paying GSAP cost.
              if (id.includes('/gsap/') || id.includes('@gsap/react')) return 'vendor-gsap'
              if (id.includes('framer-motion')) return 'vendor-framer'
              // Puck CMS is large and only loads inside the admin studio
              // route. Force it into its own chunk so it never lands in
              // the initial bundle.
              if (id.includes('@measured/puck')) return 'vendor-puck'
            }
          },
        },
      },
    },
  }
  if (isBuild) {
    // Strip console + debugger from production bundles (Wave 4 polish).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config.esbuild = { drop: ['console', 'debugger'] } as any
  }
  return config
})
