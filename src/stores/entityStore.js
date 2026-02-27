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
      entities.value = response.data.data
      total.value = response.data.meta.total
    } finally {
      loading.value = false
    }
  }

  return {
    entities,
    total,
    loading,
    fetchEntities,
  }
})
