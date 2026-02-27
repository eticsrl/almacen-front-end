import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getAll,
  getById,
  create,
  update,
  destroy
} from '@/services/personal'

export const usePersonalStore = defineStore('personal', () => {
  const personal = ref([])
  const loading = ref(false)
  const currentPersonal = ref(null)
  const errors = ref(null)

  const fetchPersonal = async () => {
    loading.value = true
    try {
      const response = await getAll()
      personal.value = response.data.data
    } catch (error) {
      console.error('Error al obtener personal:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchPersonalById = async (id) => {
    loading.value = true
    try {
      const response = await getById(id)
      currentPersonal.value = response.data.data
    } catch (error) {
      console.error('Error al obtener personal:', error)
    } finally {
      loading.value = false
    }
  }

  const createPersonal = async (payload) => {
    errors.value = null
    try {
      const response = await create(payload)
      personal.value.push(response.data.data)
      return response
    } catch (error) {
      if (error.response && error.response.status === 422) {
        errors.value = error.response.data.errors
      }
      throw error
    }
  }

  const updatePersonal = async (id, payload) => {
    errors.value = null
    try {
      const response = await update(id, payload)
      const index = personal.value.findIndex(p => p.id === id)
      if (index !== -1) {
        personal.value[index] = response.data.data
      }
      return response
    } catch (error) {
      if (error.response && error.response.status === 422) {
        errors.value = error.response.data.errors
      }
      throw error
    }
  }

  const deletePersonal = async (id) => {
    try {
      await destroy(id)
      personal.value = personal.value.filter(p => p.id !== id)
    } catch (error) {
      console.error('Error al eliminar personal:', error)
      throw error
    }
  }

  return {
    personal,
    loading,
    currentPersonal,
    errors,
    fetchPersonal,
    fetchPersonalById,
    createPersonal,
    updatePersonal,
    deletePersonal
  }
})
