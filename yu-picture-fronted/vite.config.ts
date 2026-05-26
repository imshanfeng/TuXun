import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/cos': {
        target: 'https://yu-picture-1386087361.cos.ap-guangzhou.myqcloud.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cos/, ''),
      },
    },
  },
})
