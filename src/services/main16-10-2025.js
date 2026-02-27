// src/./
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './stores'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'; // Asegúrate de importar axios
import { useUserStore } from '@/stores/userStore.js' 
//rakso
// Configura la URL base y withCredentials antes de la llamada
axios.defaults.baseURL = import.meta.env.VITE_APP_BASE_API_ROOT; // Tu URL base: http://192.168.1.14:8000
axios.defaults.withCredentials = true;

// 1. Llamada a la ruta de Sanctum
axios.get('/sanctum/csrf-cookie')
    .then(() => {
        // 2. Continúa con la inicialización solo después de obtener la cookie
        const app = createApp(App);
        app.use(router);
        // ... otras configuraciones (Pinia, ElementPlus, etc.)
        app.mount('#app');
    })
    .catch(error => {
        console.error("Error al obtener la cookie CSRF:", error);
        // Podrías manejar un error grave aquí (ej. mostrar una pantalla de error)
    });
//fin rakso 
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

