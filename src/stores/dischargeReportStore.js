// src/stores/dischargeReportStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getEgresosPorFecha,
  getEgresosPorFechaDetalle,
  getEgresosPorFechaPorDia,
  getEgresosPorFechaPorMedicamento,
  getEgresosPorFechaPorDocumento,
  getEgresosPorFechaPorServicio,
  getEgresosPorFechaPorTipo,   
} from '@/services/dischargeReports'

export const useDischargeReportStore = defineStore('dischargeReport', () => {
  // --- state ---
  const rows = ref([])
  const meta = ref({
    desde: null,
    hasta: null,
    entity_id: null,
    group: 'detalle',
    tipo_documento_id: null, // backend te devuelve qué filtro aplicó
    totales: { cantidad: 0, valor: 0 },
    generado_en: null,
  })
  const loading = ref(false)
  const error = ref(null)

  // filtros persistidos en el store (útiles para UI)
  const filters = ref({
    rango: [],              // [Date|string, Date|string]
    entity_id: null,
    group: 'detalle',       // 'detalle' | 'dia' | 'medicamento' | 'documento' | 'servicio' | 'tipo'
    tipo_documento_id: [],  // array de IDs seleccionados en la UI
  })

  // --- getters ---
  const totales = computed(() => meta.value?.totales ?? { cantidad: 0, valor: 0 })
  const totalCantidad = computed(() => Number(totales.value.cantidad || 0))
  const totalValor = computed(() => Number(totales.value.valor || 0))
  const hasData = computed(() => Array.isArray(rows.value) && rows.value.length > 0)

  // --- helpers ---
  const _assignResponse = (res, forcedGroup) => {
    rows.value = Array.isArray(res?.data?.data) ? res.data.data : []
    meta.value = res?.data?.meta ?? meta.value
    // sincroniza group
    meta.value.group = forcedGroup || meta.value.group || filters.value.group || 'detalle'
    filters.value.group = meta.value.group
  }

  // --- actions (genérico) ---
  const fetchReport = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const res = await getEgresosPorFecha({ ...filters.value, ...params })
      _assignResponse(res, params.group)
      return rows.value
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  // --- actions (atajos por agrupación) ---
  const fetchDetalle = async (params = {}) => {
    loading.value = true; error.value = null
    try {
      const res = await getEgresosPorFechaDetalle({ ...filters.value, ...params })
      _assignResponse(res, 'detalle')
      return rows.value
    } catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }

  const fetchPorDia = async (params = {}) => {
    loading.value = true; error.value = null
    try {
      const res = await getEgresosPorFechaPorDia({ ...filters.value, ...params })
      _assignResponse(res, 'dia')
      return rows.value
    } catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }

  const fetchPorMedicamento = async (params = {}) => {
    loading.value = true; error.value = null
    try {
      const res = await getEgresosPorFechaPorMedicamento({ ...filters.value, ...params })
      _assignResponse(res, 'medicamento')
      return rows.value
    } catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }

  const fetchPorDocumento = async (params = {}) => {
    loading.value = true; error.value = null
    try {
      const res = await getEgresosPorFechaPorDocumento({ ...filters.value, ...params })
      _assignResponse(res, 'documento')
      return rows.value
    } catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }

  const fetchPorServicio = async (params = {}) => {
    loading.value = true; error.value = null
    try {
      const res = await getEgresosPorFechaPorServicio({ ...filters.value, ...params })
      _assignResponse(res, 'servicio')
      return rows.value
    } catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }

  // 👇 NUEVO: agrupación por tipo de documento
  const fetchPorTipo = async (params = {}) => {
    loading.value = true; error.value = null
    try {
      const res = await getEgresosPorFechaPorTipo({ ...filters.value, ...params })
      _assignResponse(res, 'tipo')
      return rows.value
    } catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }

  // --- extras de UX ---
  const setRango = (rango) => { filters.value.rango = rango || [] }
  const setEntity = (entityId) => { filters.value.entity_id = entityId ?? null }
  const setGroup = (g) => { filters.value.group = g || 'detalle' }
  const setTiposDocumento = (ids) => {  // acepta array de IDs
    filters.value.tipo_documento_id = Array.isArray(ids) ? ids : (ids ? [ids] : [])
  }

  const reset = () => {
    rows.value = []
    meta.value = {
      desde: null, hasta: null, entity_id: null, group: 'detalle',
      tipo_documento_id: null,
      totales: { cantidad: 0, valor: 0 }, generado_en: null
    }
    filters.value = { rango: [], entity_id: null, group: 'detalle', tipo_documento_id: [] }
    error.value = null
  }

  return {
    // state
    rows, meta, filters, loading, error,
    // getters
    totales, totalCantidad, totalValor, hasData,
    // actions
    fetchReport,
    fetchDetalle,
    fetchPorDia,
    fetchPorMedicamento,
    fetchPorDocumento,
    fetchPorServicio,
    fetchPorTipo,                 
    setRango, setEntity, setGroup, setTiposDocumento, 
    reset,
  }
})

