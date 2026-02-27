// src/stores/egresosEspecialidadStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getEgresosPorEspecialidad } from '@/services/dischargeSpecialtyReport'

export const useEgresosEspecialidadStore = defineStore('repEgresosEspecialidad', () => {
  const rows = ref([])
  const meta = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // filtros de UI
  const filters = ref({
    rango: [],
    entity_id: null,
    liname: [],           // ej: ["N0105","A0101"]
    medico_id: [],        // ids
    especialidad_id: [],  // ids
  })

  const totalCantidad = computed(() => Number(meta.value?.total_cantidad || 0))
  const hasData = computed(() => rows.value.length > 0)

  const fetchReport = async (params = {}) => {
    loading.value = true; error.value = null
    try {
      const res = await getEgresosPorEspecialidad({ ...filters.value, ...params })
      rows.value = Array.isArray(res.data?.data) ? res.data.data : []
      meta.value = res.data?.meta || null
      return rows.value
    } catch (e) {
      error.value = e; throw e
    } finally {
      loading.value = false
    }
  }

  // setters cortos
  const setRango = (r) => { filters.value.rango = r || [] }
  const setEntity = (id) => { filters.value.entity_id = id ?? null }
  const setLiname = (arr) => { filters.value.liname = arr || [] }
  const setMedicos = (arr) => { filters.value.medico_id = arr || [] }
  const setEspecialidades = (arr) => { filters.value.especialidad_id = arr || [] }

  const reset = () => {
    rows.value = []
    meta.value = null
    filters.value = { rango: [], entity_id: null, liname: [], medico_id: [], especialidad_id: [] }
    error.value = null
  }

  return {
    // state
    rows, meta, loading, error, filters,
    // getters
    totalCantidad, hasData,
    // actions
    fetchReport,
    setRango, setEntity, setLiname, setMedicos, setEspecialidades, reset,
  }
})
