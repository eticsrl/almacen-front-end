// src/stores/kardexReportsStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { getKardexMovimientos } from '@/services/kardexReports'

export const useKardexReportsStore = defineStore('kardexReports', () => {
 
  const rows = ref([]) // movimientos del kárdex
  const meta = ref({
    desde: null,
    hasta: null,
    entity_id: null,
    saldo_inicial: { cantidad: 0, valor: 0 },
  })
  const loading = ref(false)
  const error = ref(null)

  // filtros que usará la vista
  const filters = ref({
    medicamento_id: null, // requerido por el backend
    rango: [],            // [Date, Date]
    entity_id: null,      // opcional
  })

  // --- getters ---
  const hasData = computed(() => Array.isArray(rows.value) && rows.value.length > 0)

  // Totales del periodo (se calculan del arreglo "rows")
  const totalIngCant = computed(() =>
    rows.value.reduce((acc, r) => acc + (r.mov === 'INGRESO' ? Number(r.qty || 0) : 0), 0)
  )
  const totalIngVal = computed(() =>
    rows.value.reduce((acc, r) => acc + (r.mov === 'INGRESO' ? Number(r.val || 0) : 0), 0)
  )
  const totalEgrCant = computed(() =>
    rows.value.reduce((acc, r) => acc + (r.mov === 'EGRESO' ? Number(r.qty || 0) : 0), 0)
  )
  const totalEgrVal = computed(() =>
    rows.value.reduce((acc, r) => acc + (r.mov === 'EGRESO' ? Number(r.val || 0) : 0), 0)
  )

  // Saldos
  const saldoInicialCant = computed(() => Number(meta.value?.saldo_inicial?.cantidad || 0))
  const saldoInicialVal  = computed(() => Number(meta.value?.saldo_inicial?.valor || 0))
  const saldoFinalCant   = computed(() =>
    hasData.value ? Number(rows.value[rows.value.length - 1].saldo_cantidad || 0) : saldoInicialCant.value
  )
  const saldoFinalVal    = computed(() =>
    hasData.value ? Number(rows.value[rows.value.length - 1].saldo_valor || 0) : saldoInicialVal.value
  )

  // --- actions ---
  const fetchMovimientos = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      // el service ya normaliza (rango -> desde/hasta) y exige medicamento_id
      const res = await getKardexMovimientos({ ...filters.value, ...params })
      rows.value = Array.isArray(res?.data) ? res.data : []
      meta.value = res?.meta ?? meta.value

      // Sincroniza filtros desde la meta devuelta por backend
      if (meta.value.desde && meta.value.hasta) {
        filters.value.rango = [
          dayjs(meta.value.desde).toDate(),
          dayjs(meta.value.hasta).toDate(),
        ]
      }
      if (meta.value.entity_id != null) {
        filters.value.entity_id = meta.value.entity_id
      }

      // Mantiene/actualiza el medicamento si vino en params
      if (params.medicamento_id != null) {
        filters.value.medicamento_id = Number(params.medicamento_id)
      }

      return rows.value
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

 
  const setMedicamento = (id) => { filters.value.medicamento_id = id != null ? Number(id) : null }
  const setRango       = (r)  => { filters.value.rango = r || [] }
  const setEntity      = (id) => { filters.value.entity_id = id ?? null }
  const reset          = () => {
    rows.value = []
    error.value = null
    loading.value = false
    meta.value = { desde: null, hasta: null, entity_id: null, saldo_inicial: { cantidad: 0, valor: 0 } }
    filters.value = { medicamento_id: null, rango: [], entity_id: null }
  }

  return {
  
    rows, meta, filters, loading, error,

    hasData,
    totalIngCant, totalIngVal,
    totalEgrCant, totalEgrVal,
    saldoInicialCant, saldoInicialVal,
    saldoFinalCant,  saldoFinalVal,

    fetchMovimientos, setMedicamento, setRango, setEntity, reset,
  }
})
