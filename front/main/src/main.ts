import 'front-common/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { loadVuetify } from 'front-common'

import App from './App.vue'
import router from './router'
import 'vuetify/styles'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const vuetify = loadVuetify()
app.use(vuetify)

app.mount('#app')
