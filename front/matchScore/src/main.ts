import 'front-common/css/main.css'

import { createApp } from 'vue'
import { loadVuetify } from 'front-common'

import App from './components/MatchScore.vue'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

const vuetify = loadVuetify()
app.use(vuetify)

app.mount('#app')
