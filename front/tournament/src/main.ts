import 'front-common/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'

import App from './App.vue'
import { loadVuetify } from 'front-common'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

app.use(router)
app.use(createPinia())

const vuetify = loadVuetify()
app.use(vuetify)

app.mount('#app')
