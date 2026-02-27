// src/main.js (Versión Final Corregida)

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia'; 
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import axios from 'axios'; 
import { useUserStore } from '@/stores/userStore.js';
// Importa tu instancia de API si la necesitas para el fetchUser
// import api from '@/services/api'; 


// 1. Configuración Global (Necesario para /sanctum/csrf-cookie)
// ***************************************************************
axios.defaults.baseURL = import.meta.env.VITE_APP_BASE_API_ROOT;
axios.defaults.withCredentials = true;

const pinia = createPinia();
const app = createApp(App);

app.use(pinia); 
app.use(router);
app.use(ElementPlus);

// 2. Flujo de Inicialización (CSRF y Autenticación)
// **************************************************

// Llamada a la ruta de Sanctum: ¡DEBE ser la primera!
axios.get('/sanctum/csrf-cookie')
    .then(() => {
        console.log('Cookie CSRF obtenida con éxito.');
        
        const userStore = useUserStore();
        const token = localStorage.getItem('token');

        // Intenta cargar el usuario (asegurando que el Bearer token se envía)
        if (token && !userStore.user) {
            // Retorna la promesa para encadenar la ejecución
            return userStore.fetchUser(); 
        }

        return Promise.resolve(); // Si no hay token, resuelve para montar la app.
    })
    .then(() => {
        // 3. Montaje Final de la aplicación (SOLO aquí)
        console.log('Inicialización completa. Montando aplicación...');
        app.mount('#app');
    })
    .catch(error => {
        console.error("Fallo CRÍTICO en la inicialización (CSRF o Autenticación 401):", error);
        
        // Manejo de emergencia: Montar la app para mostrar la interfaz (ej. login) 
        // y evitar errores fatales de Vue si falla la inicialización, 
        // pero se asume que las rutas protegidas fallarán después.
        app.mount('#app');
    });

// Se eliminó la doble llamada a app.mount('#app').