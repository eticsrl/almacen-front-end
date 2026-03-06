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

  const normalizeServicePersonal = (servicePersonal) => {
    if (!servicePersonal || typeof servicePersonal !== 'object') return null

    return {
      ...servicePersonal,
      estado: Number(servicePersonal?.estado) === 0 ? 0 : 1,
      id_service: servicePersonal?.id_service != null ? Number(servicePersonal.id_service) : null
    }
  }

  const fetchServicePersonals = async () => {
    loading.value = true
    try {
      const response = await getAll()
      console.log('[servicePersonalStore] Respuesta del API:', response)
      const rawData = response.data?.data || response.data || []
      const list = Array.isArray(rawData) ? rawData : []
      servicePersonals.value = list.map(normalizeServicePersonal).filter(Boolean)
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
      currentServicePersonal.value = normalizeServicePersonal(response.data?.data || response.data)
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
      const created = normalizeServicePersonal(response.data?.data || response.data)
      if (created) {
        servicePersonals.value.push(created)
      }
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
      const updated = normalizeServicePersonal(response.data?.data || response.data)
      const index = servicePersonals.value.findIndex(sp => Number(sp.id) === Number(id))
      if (index !== -1) {
        servicePersonals.value[index] = updated || {
          ...servicePersonals.value[index],
          ...payload,
          id: servicePersonals.value[index].id
        }
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
