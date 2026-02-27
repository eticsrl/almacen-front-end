import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getIngresosPorFecha,
  getIngresosPorFechaDetalle,
  getIngresosPorFechaPorDia,
  getIngresosPorFechaPorMedicamento,
  getIngresosPorFechaPorDocumento,
  getIngresosPorFechaPorProveedor,
  getIngresosPorFechaPorTipo,
} from '@/services/entryReports.js'

export const useEntryReportStore = defineStore('entryReport', () => {
  const rows = ref([])
  const meta = ref({
    desde: null,
    hasta: null,
    entity_id: null,
    group: 'detalle',
    tipo_documento_id: null,
    totales: { cantidad: 0, valor: 0 },
    generado_en: null,
  })
  const loading = ref(false)
  const error = ref(null)

  const filters = ref({
    rango: [],
    entity_id: null,
    group: 'detalle',         // detalle|dia|medicamento|documento|proveedor|tipo
    tipo_documento_id: [],    // array de IDs (cat=1)
  })

  const totales = computed(() => meta.value?.totales ?? { cantidad: 0, valor: 0 })
  const totalCantidad = computed(() => Number(totales.value.cantidad || 0))
  const totalValor = computed(() => Number(totales.value.valor || 0))
  const hasData = computed(() => Array.isArray(rows.value) && rows.value.length > 0)

  const _assignResponse = (res, forcedGroup) => {
    rows.value = Array.isArray(res?.data?.data) ? res.data.data : []
    meta.value = res?.data?.meta ?? meta.value
    meta.value.group = forcedGroup || meta.value.group || filters.value.group || 'detalle'
    filters.value.group = meta.value.group
  }

  const fetchReport = async (params = {}) => {
    loading.value = true; error.value = null
    try {
      const res = await getIngresosPorFecha({ ...filters.value, ...params })
      _assignResponse(res, params.group)
      return rows.value
    } catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }

  const fetchDetalle = async (params = {}) => {
    loading.value = true; error.value = null
    try { const res = await getIngresosPorFechaDetalle({ ...filters.value, ...params }); _assignResponse(res, 'detalle'); return rows.value }
    catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }
  const fetchPorDia = async (params = {}) => {
    loading.value = true; error.value = null
    try { const res = await getIngresosPorFechaPorDia({ ...filters.value, ...params }); _assignResponse(res, 'dia'); return rows.value }
    catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }
  const fetchPorMedicamento = async (params = {}) => {
    loading.value = true; error.value = null
    try { const res = await getIngresosPorFechaPorMedicamento({ ...filters.value, ...params }); _assignResponse(res, 'medicamento'); return rows.value }
    catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }
  const fetchPorDocumento = async (params = {}) => {
    loading.value = true; error.value = null
    try { const res = await getIngresosPorFechaPorDocumento({ ...filters.value, ...params }); _assignResponse(res, 'documento'); return rows.value }
    catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }
  const fetchPorProveedor = async (params = {}) => {
    loading.value = true; error.value = null
    try { const res = await getIngresosPorFechaPorProveedor({ ...filters.value, ...params }); _assignResponse(res, 'proveedor'); return rows.value }
    catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }
  const fetchPorTipo = async (params = {}) => {
    loading.value = true; error.value = null
    try { const res = await getIngresosPorFechaPorTipo({ ...filters.value, ...params }); _assignResponse(res, 'tipo'); return rows.value }
    catch (e) { error.value = e; throw e }
    finally { loading.value = false }
  }

  const setRango = (r) => { filters.value.rango = r || [] }
  const setEntity = (id) => { filters.value.entity_id = id ?? null }
  const setGroup = (g) => { filters.value.group = g || 'detalle' }
  const setTiposDocumento = (ids) => { filters.value.tipo_documento_id = Array.isArray(ids) ? ids : (ids ? [ids] : []) }

  const reset = () => {
    rows.value = []
    meta.value = { desde:null, hasta:null, entity_id:null, group:'detalle', tipo_documento_id:null, totales:{cantidad:0,valor:0}, generado_en:null }
    filters.value = { rango:[], entity_id:null, group:'detalle', tipo_documento_id:[] }
    error.value = null
  }

  return {
    rows, meta, filters, loading, error,
    totales, totalCantidad, totalValor, hasData,
    fetchReport, fetchDetalle, fetchPorDia, fetchPorMedicamento, fetchPorDocumento, fetchPorProveedor, fetchPorTipo,
    setRango, setEntity, setGroup, setTiposDocumento, reset,
  }
})
