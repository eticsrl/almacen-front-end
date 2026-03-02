// src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import userService from '@/services/user.js'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const loading = ref(false)

  // Login: obtiene el token y usuario
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await userService.login(credentials)
      token.value = response.data.token
      user.value = response.data.user
     
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      
      

      console.log('cargando perfil de usuario:', user.value)
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  //  Fetch del usuario desde backend si hay token (incluye permisos y roles)
  const fetchUser = async () => {
    try {
      const response = await userService.getProfile()
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(user.value))
      console.log('Perfil del usuario cargado con permisos y roles:', user.value)
    } catch (error) {
      console.error('Error cargando perfil de usuario:', error)
    }
  }

  // Logout
  const logout = async () => {
    try {
      await userService.logout()
    } catch (e) {
     
    } finally {
      user.value = null
      token.value = ''
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push({ name: 'Login' })
    }
  }

  // Register: crea nuevo usuario
  const register = async (userData) => {
    loading.value = true
    try {
      const response = await userService.register(userData)
      token.value = response.data.token
      user.value = response.data.user
     
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      
      console.log('Usuario registrado exitosamente:', user.value)
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    login,
    logout,
    register,
    fetchUser
  }
})