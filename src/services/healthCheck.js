// src/services/healthCheck.js
import axios from 'axios'

// Crear instancia de axios sin interceptores para el health check
const healthCheckApi = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 3000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// Verificar si el backend está activo
export const checkBackendHealth = async () => {
  try {
    // Intenta hacer una solicitud a una ruta que no requiera autenticación o use el token
    const token = localStorage.getItem('token')
    const config = {
      validateStatus: function (status) {
        return status < 500 // Considera como éxito cualquier status menor a 500
      }
    }
    
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` }
    }
    
    const response = await healthCheckApi.get('/user/profile', config)
    
    // Si obtenemos respuesta (incluso 401), significa que el backend está activo
    return {
      isActive: true,
      status: response.status,
      message: 'Backend está activo'
    }
  } catch (error) {
    return {
      isActive: false,
      status: null,
      message: 'Backend no disponible',
      error: error.message
    }
  }
}

export default {
  checkBackendHealth
}
