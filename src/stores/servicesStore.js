import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as service from '@/services/service'

export const useServicesStore = defineStore('services', () => {
  const services = ref([])
  const loading = ref(false)
  const errors = ref(null)
  //funciones para manejar los servicios
  async function fetchServices(filters = {}) {
    try {
      loading.value = true
      const response = await service.getAllServices()
      services.value = response.data
      console.log('servicios: ', Object.keys(service))
      console.log('Probando services ->servicios: ', services)
    } catch (error) {
      errors.value = error.message
    } finally {
      loading.value = false
    }
  }
  return {
    services,
    loading,
    errors,
    fetchServices
  }
})