// src/stores/backendStatusStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { checkBackendHealth } from '@/services/healthCheck.js'

export const useBackendStatusStore = defineStore('backendStatus', () => {
  const isActive = ref(true)
  const message = ref('Verificando...')
  const lastChecked = ref(null)
  let checkInterval = null

  // Verificar estado del backend
  const checkStatus = async () => {
    try {
      const health = await checkBackendHealth()
      isActive.value = health.isActive
      message.value = health.message
      lastChecked.value = new Date()
      return health
    } catch (error) {
      isActive.value = false
      message.value = 'Error al verificar backend'
      return { isActive: false, message: 'Error al verificar backend' }
    }
  }

  // Iniciar verificación periódica (cada 30 segundos)
  const startPeriodicCheck = (interval = 30000) => {
    // Primera verificación inmediata
    checkStatus()
    
    // Luego verificar periódicamente
    checkInterval = setInterval(() => {
      checkStatus()
    }, interval)
  }

  // Detener verificación periódica
  const stopPeriodicCheck = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  return {
    isActive,
    message,
    lastChecked,
    checkStatus,
    startPeriodicCheck,
    stopPeriodicCheck
  }
})
