// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia'; // Asumo que 'store' es tu instancia de Pinia
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore.js';
import api from '@/services/api'; // Importa tu instancia de API

// 1. Configuración de Axios Global y de la API
// **********************************************

// Configura la URL base y withCredentials para el Axios global (esto ayuda a /sanctum/csrf-cookie)
axios.defaults.baseURL = import.meta.env.VITE_APP_BASE_API_ROOT;
axios.defaults.withCredentials = true;

// 2. Inicialización de Pinia y Tiendas
// ************************************
const pinia = createPinia();
const app = createApp(App);

// Usamos Pinia desde el principio
app.use(pinia); 
app.use(router);
app.use(ElementPlus);

// 3. Flujo de Inicialización (CSRF, Autenticación, Montaje)
// *********************************************************

// Obtener la Cookie CSRF de Sanctum
axios.get('/sanctum/csrf-cookie')
    .then(() => {
        // La cookie está configurada. Ahora procedemos con la autenticación.
        console.log('Cookie CSRF obtenida con éxito. Verificando usuario...');
        
        const userStore = useUserStore();
        const token = localStorage.getItem('token');

        // Intenta cargar el usuario si hay un token
        if (token && !userStore.user) {
            // Usa tu instancia de API para la llamada al fetch (ya tiene el Bearer Token)
            return userStore.fetchUser(); 
        }

        return Promise.resolve(); // Si no hay token, continúa al montaje
    })
    .then(() => {
        // 4. Montaje de la aplicación (solo se ejecuta aquí)
        console.log('Inicialización completa. Montando aplicación...');
        app.mount('#app');
    })
    .catch(error => {
        // Si la cookie CSRF falla o el fetchUser falla (ej. 401),
        // montamos la app de todos modos, pero podemos redirigir al login.
        console.error("Fallo en la inicialización (CSRF o Autenticación):", error);
        
        // Si aún no está montada, montarla para evitar errores de Vue
        if (!app._container) {
            app.mount('#app');
        }
    });

// Se eliminó la doble llamada a app.mount('#app') y la lógica duplicada.