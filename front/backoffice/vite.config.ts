import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify';
import federation from '@originjs/vite-plugin-federation';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  
  return {
    build: {
      minify: true,
      cssCodeSplit: true,
      target: 'esnext',
      rollupOptions: {
        output: {
          dir: 'dist',
          entryFileNames: 'assets/app-[name].js',
          assetFileNames: 'assets/app-[name].css',
          chunkFileNames: "assets/chunk-[name].js",
          manualChunks: undefined,
        }
      }
    },
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
      federation({
        name: 'front-backoffice',
        filename: 'front-backoffice.js',
        exposes: {
          './App': './src/components/BackOffice.vue'
        },
        shared: ['vue', 'vue-router', 'pinia', 'vuetify']
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    preview: {
      port: new Number(process.env.VITE_PORT).valueOf()
    },
    server: {
      port: new Number(process.env.VITE_PORT).valueOf()
    },
    define: {
      PORT: new Number(process.env.VITE_PORT).valueOf(),
      MATCHES_API_URL: JSON.stringify(process.env.VITE_MATCHES_API_URL),
      NODE_ENV: JSON.stringify(process.env.VITE_NODE_ENV),
      WEBSOCKET_API_URL: JSON.stringify(process.env.VITE_WEBSOCKET_API_URL)
    }
  }
})
