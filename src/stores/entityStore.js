import { defineStore } from 'pinia'
import { ref } from 'vue'
import entityService from '@/services/entity'

export const useEntityStore = defineStore('entity', () => {
  const entities = ref([])
  const total = ref(0)
  const loading = ref(false)

  const fetchEntities = async (params = {}) => {
    loading.value = true
    try {
      const response = await entityService.getAll(params)
      console.log('Fetched entities:', response.data)
      entities.value = response.data.data
      total.value = response.data.meta?.total || entities.value.length
    } catch (err) {
      console.error('Error fetching entities:', err)
    } finally {
      loading.value = false
    }
  }

  const createEntity = async (payload) => {
    try {
      const response = await entityService.create(payload)
      entities.value.unshift(response.data.data || response.data)
      return response.data.data
    } catch (err) {
      console.error('Error creating entity:', err)
      throw err
    }
  }

  const updateEntity = async (id, payload) => {
    try {
      const response = await entityService.update(id, payload)
      const updated = response.data.data || response.data
      const index = entities.value.findIndex(e => e.id === id)
      if (index !== -1) entities.value[index] = updated
      return updated
    } catch (err) {
      console.error('Error updating entity:', err)
      throw err
    }
  }

  const deleteEntity = async (id) => {
    try {
      await entityService.remove(id)
      entities.value = entities.value.filter(e => e.id !== id)
    } catch (err) {
      console.error('Error deleting entity:', err)
      throw err
    }
  }

  return {
    entities,
    total,
    loading,
    fetchEntities,
    createEntity,
    updateEntity,
    deleteEntity
  }
})
