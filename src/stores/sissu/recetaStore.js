import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as recetaService from '@/services/sissu/receta';

export const useRecetaStore = defineStore('receta', () => {
  const recetas = ref([])
  const receta = ref(null)
  const loading = ref(false)
  const errors  = ref(null)

  const fetchRecetas = async (params = {}) => {
    loading.value = true
    try {
      const response = await recetaService.getAll(params)
      recetas.value = response.data.data
    } catch (error) {
      console.error('Error al obtener recetas:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchReceta = async (id) => {
    loading.value = true
    try {
      const response = await recetaService.getById(id)
      receta.value = response.data
      console.log('[fetchReceta] respuesta cruda:', response.data)
    } catch (error) {
      console.error('Error al obtener receta:', error)
    } finally {
      loading.value = false
    }
  }

  const storeReceta = async (data) => {
    loading.value = true
    try {
      const response = await recetaService.store(data)
      return response.data
    } catch (error) {
      console.error('Error al guardar receta:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateReceta = async (id, data) => {
    loading.value = true
    try {
      const response = await recetaService.update(id, data)
      return response.data
    } catch (error) {
      console.error('Error al actualizar receta:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteReceta = async (id) => {
    loading.value = true
    try {
      await recetaService.destroy(id)
    } catch (error) {
      console.error('Error al eliminar receta:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchRecetasFarmacia = async (params = {}) => {
    loading.value = true
    try {
      const response = await recetaService.getFarmacia(params)
      recetas.value = response.data.data
    } catch (error) {
      console.error('Error al obtener recetas para farmacia:', error)
    } finally {
      loading.value = false
    }
  }

   // NUEVO: aplicar descargo (actualiza pendientes/entregados y estado de receta)
   const aplicarDescargo = async (recetaId, movimientos) => {
    loading.value = true
    errors.value = null
    try {
      const res = await recetaService.aplicarDescargo(recetaId, movimientos)
      const updated = res.data.data
      
      // Actualiza la lista si esa receta está en pantalla
      const idx = recetas.value.findIndex(r => r.id === updated.id)
      if (idx !== -1) recetas.value[idx] = updated
      // Actualiza el detalle si lo tienes cargado
      if (receta.value?.id === recetaId) receta.value = updated
      return updated
    } catch (e) {
      if (e.response?.status === 422) errors.value = e.response.data.errors
      console.error('Error al aplicar descargo:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    recetas,
    receta,
    loading,
    errors,
    fetchRecetas,
    fetchReceta,
    storeReceta,
    updateReceta,
    deleteReceta,
    fetchRecetasFarmacia,
    aplicarDescargo, 
  }
})
