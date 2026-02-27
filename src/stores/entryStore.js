import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as service from '@/services/entry'

export const useEntryStore = defineStore('entry', () => {
  const entries = ref([])
  const detailsWithStock = ref([])
  const reentryDetails = ref([])
  const loading = ref(false)
  const errors = ref(null)


  const lotsByMedicineCache = ref({})

  async function fetchEntries(filters = {}) {
    loading.value = true
    try {
      const res = await service.getAll(filters)
      entries.value = res.data.data
      console.log('[entry service keys]', Object.keys(service))
    } catch (e) { console.error(e) }
    loading.value = false
  }

  async function fetchEntry(id) {
    loading.value = true
    try {
      const res = await service.getById(id)
      return res.data.data
    } catch (e) { console.error(e) }
    loading.value = false
  }

  async function create(payload) {
    errors.value = null
    try {
      const res = await service.createEntry(payload)
      entries.value.unshift(res.data.data)
      return res.data.data
    } catch (e) {
      if (e.response?.status === 422) {
        errors.value = e.response.data.errors
        console.log('error', errors.value)
      }
      throw e
    }
  }

  async function update(id, payload) {
    errors.value = null
    console.log(payload)
    try {
      const res = await service.updateEntry(id, payload)
      entries.value = entries.value.map(e => e.id === id ? res.data.entry : e)
      return res.data.entry
    } catch (e) {
      if (e.response?.status === 422) errors.value = e.response.data.errors
      throw e
    }
  }

  async function remove(id) {
    await service.deleteEntry(id)
    entries.value = entries.value.filter(e => e.id !== id)
  }

  async function activate(id) {
    //console.log("El ID recibido es:", id)
    //debugger
    const res = await service.activateEntry(id)
    
    entries.value = entries.value.map(e => e.id === id ? res.data.data : e)
    return res.data.data
  }

  async function fetchStockDetails() {
    const res = await service.getDetailsWithStock()
    detailsWithStock.value = res.data
  }

  async function fetchDetailsForReentry() {
    const res = await service.getEntryDetailsForReentry()
    //console.log('Reentry details fetched from rakso:', res.data)
    //console.log('📦 Respuesta COMPLETA del servicio (res):', res)
    reentryDetails.value = res.data
    console.log('📝 reentryDetails almacenados en el store:', reentryDetails.value)
  }

  async function createReturn(payload) {
    errors.value = null
    loading.value = true
    try {
      const res = await service.createReturn(payload) // POST /entries/returns
      const entry = res.data.data

      // Agregar el reingreso a la lista
      entries.value.unshift(entry)

      // Invalidar caché de lotes de los meds involucrados (para que stock se vea actualizado)
      const details = entry.entry_details || entry.entryDetails || []
      const meds = new Set(details.map(d => d.medicamento_id))
      meds.forEach(id => delete lotsByMedicineCache.value[String(id)])

      return entry
    } catch (e) {
      if (e.response?.status === 422) errors.value = e.response.data.errors
      throw e
    } finally {
      loading.value = false
    }
  }
 
  async function fetchLotsByMedicine(medicineId, { force = false } = {}) {
    const key = String(medicineId)
  
    if (!force && lotsByMedicineCache.value[key]) {
      return lotsByMedicineCache.value[key]
    }
  
    const res = await service.getLotsByMedicine(medicineId)
    const data = res?.data
  
    // Validación defensiva del shape
    if (!data || typeof data !== 'object' || !Array.isArray(data.familias)) {
      console.warn('[fetchLotsByMedicine] shape inesperado:', data)
      const empty = { summary: null, familias: [], lotes: [] }
      lotsByMedicineCache.value[key] = empty
      return empty
    }
  
    // Aplana los detalles reales de todas las familias (para los inputs de entrega)
    const lotes = data.familias.flatMap(f => Array.isArray(f.detalles) ? f.detalles : [])
  
    const normalized = {
      summary: data.summary || null, // { medicine_id, liname, nombre, presentacion, stock_total_global }
      familias: data.familias,       // familias (padre + reingresos) con stock_total, etc.
      lotes,                         // lista plana de entry_details reales
    }
  
    lotsByMedicineCache.value[key] = normalized
    return normalized
  }
  
  function clearLotsCache(medicineId) {
    if (medicineId) {
      delete lotsByMedicineCache.value[String(medicineId)]
    } else {
      lotsByMedicineCache.value = {}
    }
  }

  return {
    entries, detailsWithStock, reentryDetails, loading, errors,
    lotsByMedicineCache,                
    fetchEntries, fetchEntry,
    create, update, remove, activate,
    fetchStockDetails, fetchDetailsForReentry,
    fetchLotsByMedicine, clearLotsCache,
    createReturn
  }
  console.log('[entry service keys]', Object.keys(service))
})
