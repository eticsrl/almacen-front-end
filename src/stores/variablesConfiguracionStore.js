import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as variablesService from '@/services/variablesConfiguracion'

export const useVariablesConfiguracionStore = defineStore('variablesConfiguracion', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchItems = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await variablesService.getAll(params)
      // depending on backend structure
      items.value = response.data.data || response.data.variables || []
    } catch (err) {
      error.value = err
      console.error('Error al obtener variables de configuración:', err)
    } finally {
      loading.value = false
    }
  }

  const createItem = async (payload) => {
    try {
      const response = await variablesService.create(payload)
      const newRecord = response.data.data || response.data.variable || response.data
      items.value.push(newRecord)
      return newRecord
    } catch (err) {
      console.error('Error al crear variable:', err)
      throw err
    }
  }

  const updateItem = async (id, payload) => {
    try {
      const response = await variablesService.update(id, payload)
      const updated = response.data.data || response.data.variable || response.data
      const index = items.value.findIndex(i => i.id === id)
      if (index !== -1) {
        items.value[index] = updated
      }
      return updated
    } catch (err) {
      console.error('Error al actualizar variable:', err)
      throw err
    }
  }

  const deleteItem = async (id) => {
    try {
      await variablesService.remove(id)
      items.value = items.value.filter(i => i.id !== id)
    } catch (err) {
      console.error('Error al eliminar variable:', err)
      throw err
    }
  }

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  }
})