import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify/lib/framework.mjs'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

const vuetify = createVuetify({
  ssr: true,
  icons: {
    defaultSet: 'mdi',
  },
})
