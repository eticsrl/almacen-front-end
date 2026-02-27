
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as service from '@/services/discharge.js'

export const useDischargeStore = defineStore('discharge', () => {
  const discharges = ref([])
  const recetasDispensadas = ref([]) 
  const egresosReceta = ref([])
  const loading = ref(false)
  const loadingRecetas = ref(false)
  const error = ref(null)
  const formErrors = ref(null)  

  const fetchDischarges = async (params = {}) => {
    loading.value = true
    try {
      const res = await service.getAll(params)
      discharges.value = res.data.data // según La Resource
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  const fetchRecetasDispensadas = async (params = {}) => {
    loadingRecetas.value = true
    error.value = null
    try {
      const res = await service.getRecetasDispensadas(params)
      // este endpoint no usa Resource (por lo que mostraste), es JSON plano
      recetasDispensadas.value = res.data ?? []
      return recetasDispensadas.value
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loadingRecetas.value = false
    }
  }
  
  // Atajo: traer solo los egresos de una receta puntual (útil para abrir el modal de devolución)
  const fetchEgresosDeReceta = async (recetaId) => {
    const data = await fetchRecetasDispensadas({ receta_id: recetaId })
    // Devuelve el registro de esa receta (o null si no existe)
    return Array.isArray(data) ? data.find(r => Number(r.receta_id) === Number(recetaId)) : null
  }
  const fetchEgresosPorReceta = async (params = {}) => {
    loadingRecetas.value = true
    error.value = null
    try{
      const res = await service.getEgresosPorReceta(params)
      egresosReceta.value =  Array.isArray(res.data) ? res.data : []
      return egresosReceta.value
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loadingRecetas.value = false
    }
  }
  const fetchOne = async (id) => {
    const res = await service.getById(id)
    return res.data.data
  }

  const createDischarge = async (payload) => {
    const loading = ref(false)
    const errors  = ref(null)
    try {
      console.log('🔵 [Store] Enviando al backend:', payload)
      const res = await service.create(payload)
      console.log('🟢 [Store] Respuesta del backend:', res.data.data)
      console.log('🔍 [Store] personal_id en respuesta:', res.data.data.personal_id)
      discharges.value.unshift(res.data.data)
      return res.data.data
    } catch(e){
      console.error('🔴 [Store] Error:', e.response?.data || e)
      if (e.response?.status === 422) errors.value = e.response.data.errors
      throw e
    }finally {
      loading.value = false
    }
 
  }

  const updateDischarge = async (id, payload) => {
    const res = await service.update(id, payload)
    const index = discharges.value.findIndex(d => d.id === id)
    if (index !== -1) discharges.value[index] = res.data.data
    return res.data.data
  }

  const deleteDischarge = async (id) => {
    await service.destroy(id)
    discharges.value = discharges.value.filter(d => d.id !== id)
  }

  return { 
    discharges,
    recetasDispensadas,
    egresosReceta,
    loading,
    loadingRecetas,
    error,
    formErrors,
    // actions
    fetchDischarges,
    fetchRecetasDispensadas,
    fetchEgresosDeReceta,
    fetchEgresosPorReceta,
    fetchOne,
    createDischarge,
    updateDischarge,
    deleteDischarge}
})
