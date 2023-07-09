import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'index.ts'),
        name: 'FrontCommonComponents',
        fileName: 'front-common-components'
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue'
          }
        }
      }
    },
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
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
