import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as institucionService from '@/services/sissu/institucion';

export const useInstitucionStore = defineStore('institucion', () => {
  const instituciones = ref([])
  const loading = ref(false)
  const error = ref(null)
 

  const fetchInstituciones = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await institucionService.getAll(params)
     
      instituciones.value = response.data.instituciones
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }
 
  return {
    instituciones,
    loading,
    error,
    fetchInstituciones,
  }
})
