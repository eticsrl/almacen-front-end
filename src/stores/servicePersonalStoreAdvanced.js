import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAll,
  getById,
  create,
  update,
  destroy
} from '@/services/servicePersonal'

export const useServicePersonalStoreAdvanced = defineStore('servicePersonalAdvanced', () => {
  const servicePersonals = ref([])
  const loading = ref(false)
  const currentServicePersonal = ref(null)
  const errors = ref(null)
  const searchQuery = ref('')
  const filters = ref({
    personal_id: null,
    fecha_inicio: null,
    fecha_fin: null
  })

  // Computed para búsqueda y filtrado
  const filteredServicePersonals = computed(() => {
    let filtered = servicePersonals.value

    // Búsqueda por descripción
    if (searchQuery.value) {
      filtered = filtered.filter(sp =>
        sp.descripcion?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        sp.personal_id?.toString().includes(searchQuery.value)
      )
    }

    // Filtro por personal_id
    if (filters.value.personal_id) {
      filtered = filtered.filter(sp => sp.personal_id === filters.value.personal_id)
    }

    // Filtro por rango de fechas
    if (filters.value.fecha_inicio) {
      filtered = filtered.filter(sp => new Date(sp.fecha_inicio) >= new Date(filters.value.fecha_inicio))
    }

    if (filters.value.fecha_fin) {
      filtered = filtered.filter(sp => new Date(sp.fecha_fin) <= new Date(filters.value.fecha_fin))
    }

    return filtered
  })

  const fetchServicePersonals = async () => {
    loading.value = true
    try {
      const response = await getAll()
      servicePersonals.value = response.data.data
    } catch (error) {
      console.error('Error al obtener servicios del personal:', error)
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

  const resetFilters = () => {
    searchQuery.value = ''
    filters.value = {
      personal_id: null,
      fecha_inicio: null,
      fecha_fin: null
    }
  }

  return {
    servicePersonals,
    filteredServicePersonals,
    loading,
    currentServicePersonal,
    errors,
    searchQuery,
    filters,
    fetchServicePersonals,
    fetchServicePersonalById,
    createServicePersonal,
    updateServicePersonal,
    deleteServicePersonal,
    resetFilters
  }
})
