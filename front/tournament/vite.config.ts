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
        name: 'front-tournament',
        filename: 'front-tournament.js',
        exposes: {
          './App': './src/components/TournamentPage.vue'
        },
        remotes: {
          'front-match-score': process.env.VITE_FRONT_MATCH_URL + 'dist/assets/front-match-score.js',
        },
        shared: ['vue', 'vue-router', 'pinia', 'vuetify']
      })
    ],
    preview: {
      port: new Number(process.env.VITE_PORT).valueOf()
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: new Number(process.env.VITE_PORT).valueOf(),
      host: true
    },
    define: {
      PORT: new Number(process.env.VITE_PORT).valueOf(),
      MATCHES_API_URL: JSON.stringify(process.env.VITE_MATCHES_API_URL),
      NODE_ENV: JSON.stringify(process.env.VITE_NODE_ENV),
      WEBSOCKET_API_URL: JSON.stringify(process.env.VITE_WEBSOCKET_API_URL)
    }
  }
})
