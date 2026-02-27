// src/services/api.js
import axios from 'axios'
import router from '../router/index'

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API, // URL base de la API
    timeout: 5000, // tiempo de espera de la solicitud // Cambia esto a la URL de tu API
    // ⬇️ AÑADE ESTA SECCIÓN DE HEADERS ⬇️
    headers: {
        // Indica a Laravel que ESPERAMOS una respuesta JSON.
        // Esto fuerza a que devuelva un 401 en lugar de intentar redirigir.
        'Accept': 'application/json', 
        
        // Indica que enviaremos los datos en formato JSON.
        'Content-Type': 'application/json' 
    }
    // ⬆️ FIN DE LA SECCIÓN A AÑADIR ⬆️
})
// ¡ESTO ES CRÍTICO PARA SANCTUM EN SPAS!
api.defaults.withCredentials = true;

// token en cada solicitud 
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    // ✅ ¡CORRECCIÓN! Usar comillas invertidas (backticks) `
    config.headers.Authorization = `Bearer ${token}` 
  }
  return config
})
// Interceptor de respuesta para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')

      // Solo redirigir si NO está ya en /login
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)


export default api
