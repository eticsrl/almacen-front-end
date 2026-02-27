// src/services/user.js
import api from './api'

export default {
  login(credentials) {
    return api.post('/auth/login', credentials)
  },

  logout() {
    return api.post('/auth/logout')
  },


  getProfile () {
    return api.get('/user/profile')
  }
  
}



// src/services/authService.js
/*import api from '@/services/api.js'

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

export const login = async (userData) => {
  const response = await api.post('/auth/login', userData)
  return response.data
}

export const logout = async () => {
  const response = await api.post('/auth/logout')
  return response.data
}

export const getUserInfo = async () => {
  try {
    const response = await api.get('/auth/user')
    return response.data
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error)
    throw error
  }
}*/
