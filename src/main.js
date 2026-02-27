// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './stores'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { useUserStore } from '@/stores/userStore.js' 

const app = createApp(App)
app.use(store)
app.use(router)
app.use(ElementPlus)

// Cargar usuario al iniciar la aplicación
const userStore = useUserStore()
const token = localStorage.getItem('token')

if (token && !userStore.user) {
  userStore.fetchUser().then(() => {
    console.log('Datos del usuario cargados:', userStore.user)
  }).catch(() => {
    console.log('No se pudo cargar el usuario')
  })
}

app.mount('#app')

