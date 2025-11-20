import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: '峡谷尖塔',
        short_name: 'LoL Spire',
        description: 'Roguelike DBG featuring League of Legends champions',
        theme_color: '#091428',
        background_color: '#091428',
        display: 'standalone', // 关键：全屏运行，隐藏浏览器地址栏
        orientation: 'any', // 支持竖屏和横屏
        icons: [
          {
            src: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
