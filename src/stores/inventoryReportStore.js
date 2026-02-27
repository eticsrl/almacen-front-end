// src/stores/inventoryReportStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { getInventarioResumen } from '@/services/inventoryReport'

export const useInventoryReportStore = defineStore('inventoryReport', () => {
 
  const rows = ref([]) // renglones del resumen
  const meta = ref({
    desde: null,
    hasta: null,
    entity_id: null,
    generado_en: null,
    totales: {
      saldo_ini_cantidad: 0, saldo_ini_valor: 0,
      ingresos_cantidad: 0,  ingresos_valor: 0,
      egresos_cantidad: 0,   egresos_valor: 0,
      saldo_fin_cantidad: 0, saldo_fin_valor: 0,
    },
  })
  const loading = ref(false)
  const error = ref(null)

  // filtros usados por la vista (rango de fechas y entidad)
  const filters = ref({
    rango: [],       // [Date, Date]
    entity_id: null, // opcional
  })

 
  const totales = computed(() => meta.value?.totales ?? {
    saldo_ini_cantidad: 0, saldo_ini_valor: 0,
    ingresos_cantidad: 0,  ingresos_valor: 0,
    egresos_cantidad: 0,   egresos_valor: 0,
    saldo_fin_cantidad: 0, saldo_fin_valor: 0,
  })

  const totalSaldoIniCant = computed(() => Number(totales.value.saldo_ini_cantidad || 0))
  const totalSaldoIniVal  = computed(() => Number(totales.value.saldo_ini_valor || 0))
  const totalIngCant      = computed(() => Number(totales.value.ingresos_cantidad || 0))
  const totalIngVal       = computed(() => Number(totales.value.ingresos_valor || 0))
  const totalEgrCant      = computed(() => Number(totales.value.egresos_cantidad || 0))
  const totalEgrVal       = computed(() => Number(totales.value.egresos_valor || 0))
  const totalSaldoFinCant = computed(() => Number(totales.value.saldo_fin_cantidad || 0))
  const totalSaldoFinVal  = computed(() => Number(totales.value.saldo_fin_valor || 0))

  const hasData = computed(() => Array.isArray(rows.value) && rows.value.length > 0)


  const fetchResumen = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      // mezcla filtros actuales con params puntuales de la llamada
      const res = await getInventarioResumen({ ...filters.value, ...params })
      rows.value = Array.isArray(res?.data?.data) ? res.data.data : []
      meta.value = res?.data?.meta ?? meta.value

      // sincroniza filtros desde meta (útil si backend ajusta fechas)
      if (meta.value.desde && meta.value.hasta) {
        filters.value.rango = [
          dayjs(meta.value.desde).toDate(),
          dayjs(meta.value.hasta).toDate(),
        ]
      }
      if (meta.value.entity_id != null) {
        filters.value.entity_id = meta.value.entity_id
      }

      return rows.value
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  
  const setRango  = (r)  => { filters.value.rango = r || [] }
  const setEntity = (id) => { filters.value.entity_id = id ?? null }
  const reset = () => {
    rows.value = []
    error.value = null
    loading.value = false
    meta.value = {
      desde: null, hasta: null, entity_id: null, generado_en: null,
      totales: {
        saldo_ini_cantidad: 0, saldo_ini_valor: 0,
        ingresos_cantidad: 0,  ingresos_valor: 0,
        egresos_cantidad: 0,   egresos_valor: 0,
        saldo_fin_cantidad: 0, saldo_fin_valor: 0,
      },
    }
    filters.value = { rango: [], entity_id: null }
  }

  return {
  
    rows, meta, filters, loading, error,
   
    totales,
    totalSaldoIniCant, totalSaldoIniVal,
    totalIngCant, totalIngVal,
    totalEgrCant, totalEgrVal,
    totalSaldoFinCant, totalSaldoFinVal,
    hasData,
   
    fetchResumen, setRango, setEntity, reset,
  }
})
