import 'front-common/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaDebounce } from '@pinia/plugin-debounce'
import debounce from 'lodash.debounce'
import { loadVuetify } from 'front-common'
import App from './App.vue'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(PiniaDebounce(debounce))
app.use(pinia)

const vuetify = loadVuetify()
app.use(vuetify)

app.mount('#app')
