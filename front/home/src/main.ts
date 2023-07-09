import 'front-common/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { loadVuetify } from 'front-common'

import App from './App.vue'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

app.use(createPinia())

const vuetify = loadVuetify()
app.use(vuetify)

app.mount('#app')
