import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getAll,
  getById,
  create,
  update,
  destroy
} from '@/services/servicePersonal'

export const useServicePersonalStore = defineStore('servicePersonal', () => {
  const servicePersonals = ref([])
  const loading = ref(false)
  const currentServicePersonal = ref(null)
  const errors = ref(null)

  const fetchServicePersonals = async () => {
    loading.value = true
    try {
      const response = await getAll()
      console.log('[servicePersonalStore] Respuesta del API:', response)
      servicePersonals.value = response.data.data || response.data || []
      console.log('[servicePersonalStore] Personal cargados:', servicePersonals.value)
    } catch (error) {
      console.error('[servicePersonalStore] Error al obtener servicios del personal:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchServicePersonalById = async (id) => {
    loading.value = true
    try {
      const response = await getById(id)
      currentServicePersonal.value = response.data.data
    } catch (error) {
      console.error('Error al obtener servicio del personal:', error)
    } finally {
      loading.value = false
    }
  }

  const createServicePersonal = async (payload) => {
    errors.value = null
    try {
      const response = await create(payload)
      servicePersonals.value.push(response.data.data)
      return response
    } catch (error) {
      if (error.response && error.response.status === 422) {
        errors.value = error.response.data.errors
      }
      throw error
    }
  }

  const updateServicePersonal = async (id, payload) => {
    errors.value = null
    try {
      const response = await update(id, payload)
      const index = servicePersonals.value.findIndex(sp => sp.id === id)
      if (index !== -1) {
        servicePersonals.value[index] = response.data.data
      }
      return response
    } catch (error) {
      if (error.response && error.response.status === 422) {
        errors.value = error.response.data.errors
      }
      throw error
    }
  }

  const deleteServicePersonal = async (id) => {
    try {
      await destroy(id)
      servicePersonals.value = servicePersonals.value.filter(sp => sp.id !== id)
    } catch (error) {
      console.error('Error al eliminar servicio del personal:', error)
      throw error
    }
  }

  return {
    servicePersonals,
    loading,
    currentServicePersonal,
    errors,
    fetchServicePersonals,
    fetchServicePersonalById,
    createServicePersonal,
    updateServicePersonal,
    deleteServicePersonal
  }
})
