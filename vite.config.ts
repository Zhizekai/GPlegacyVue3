import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  // envPrefix:"APP_",//APP_  为自定义开头名这个开头指的是替换VITE开头的前缀，这他妈的不说清楚
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/v1/web"),
      },
      "/amap_api": {
        target: "https://restapi.amap.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/amap_api/, ""),
      },
    },
  },
})
