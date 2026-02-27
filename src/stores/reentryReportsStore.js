// /src/stores/reentryReportStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { getReingresosPorReceta } from '@/services/reentryReports'

export const useReentryReportStore = defineStore('reentryReport', () => {

  const loading = ref(false)
  const error = ref(null)


  const reingresos = ref([])

  // filtros UI
  const filters = ref({
    rango: [dayjs().startOf('month').toDate(), dayjs().endOf('day').toDate()],
    tipo_receta_ids: [],        // array de ids
    numero_reingreso: null,
    numero_egreso: null,
    receta_id: null,
    paciente: '',
    medico: '',
    entity_id: null,            // setéalo al montar con el entity del usuario
  })


  const buildParams = () => {
    const [d1, d2] = filters.value.rango || []
    return {
      inicio: dayjs(d1).startOf('day').format('YYYY-MM-DD'),
      fin:    dayjs(d2).endOf('day').format('YYYY-MM-DD'),
      tipo_receta_id: filters.value.tipo_receta_ids,
      numero_reingreso: filters.value.numero_reingreso || undefined,
      numero_egreso:    filters.value.numero_egreso    || undefined,
      receta_id:        filters.value.receta_id        || undefined,
      paciente:         (filters.value.paciente || '').trim() || undefined,
      medico:           (filters.value.medico   || '').trim() || undefined,
      entity_id:        filters.value.entity_id        || undefined,
    }
  }

 
  const hasData = computed(() => (reingresos.value?.length || 0) > 0)

  // Aplanado para <el-table>: una fila por ítem con cabecera del reingreso repetida
  const rowsFlat = computed(() => {
    const out = []
    for (const r of reingresos.value || []) {
      const items = Array.isArray(r.items) ? r.items : []
      for (const it of items) {
        out.push({
          reingreso_id: r.reingreso_id,
          numero_reingreso: r.numero_reingreso,
          fecha_reingreso: r.fecha_ingreso,
          egreso_id: r.egreso_id,
          numero_egreso: r.numero_egreso,
          fecha_egreso: r.fecha_egreso,
          receta_id: r.receta_id,
          tipo_receta: r.tipo_receta,
          paciente: r.paciente,
          medico: r.medico,
          especialidad: r.especialidad,
          observaciones_reingreso: r.observaciones_reingreso,

          liname: it.liname,
          nombre: it.nombre,
          presentacion: it.presentacion,
          lote: it.lote,
          fecha_vencimiento: it.fecha_vencimiento,
          cantidad_egresada: Number(it.cantidad_egresada || 0),
          cantidad_reingresada: Number(it.cantidad_reingresada || 0),
          costo_unitario: Number(it.costo_unitario || 0),
          costo_total: Number(it.costo_total || 0),
          observaciones: it.observaciones || '',
        })
      }
    }
    return out
  })

  
  const blocks = computed(() => {
    return (reingresos.value || []).map(r => {
      const items = Array.isArray(r.items) && r.items.length
        ? r.items
        : [{ liname:'', nombre:'', presentacion:'', cantidad_reingresada:0 }]
      return {
        reingreso_id: r.reingreso_id,
        numero_reingreso: r.numero_reingreso,
        fecha_ingreso: r.fecha_ingreso,
        egreso_id: r.egreso_id,
        numero_egreso: r.numero_egreso,
        fecha_egreso: r.fecha_egreso,
        receta_id: r.receta_id,
        tipo_receta: r.tipo_receta,
        paciente: r.paciente,
        medico: r.medico,
        especialidad: r.especialidad,
        items,
        span: items.length,
      }
    })
  })

  // Totales
  const totals = computed(() => {
    let totalReingresos = reingresos.value?.length || 0
    let totalItems = 0
    let totalCantReing = 0
    let totalCantEgr = 0
    let totalValor = 0

    for (const r of reingresos.value || []) {
      const items = Array.isArray(r.items) ? r.items : []
      totalItems += items.length
      for (const it of items) {
        totalCantReing += Number(it.cantidad_reingresada || 0)
        totalCantEgr   += Number(it.cantidad_egresada   || 0)
        totalValor     += Number(it.costo_total || 0)
      }
    }
    return {
      totalReingresos,
      totalItems,
      totalCantReing,
      totalCantEgr,
      totalValor: Math.round(totalValor * 100) / 100,
    }
  })

 
  const fetchReport = async (params) => {
    loading.value = true
    error.value = null
    try {
      const payload = params || buildParams()
      const data = await getReingresosPorReceta(payload)
      reingresos.value = Array.isArray(data) ? data : []
      return reingresos.value
    } catch (e) {
      console.error('fetchReport error:', e)
      error.value = e?.response?.data?.message || e?.message || 'Error al cargar'
      reingresos.value = []
      throw e
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    reingresos.value = []
    error.value = null
    filters.value = {
      rango: [dayjs().startOf('month').toDate(), dayjs().endOf('day').toDate()],
      tipo_receta_ids: [],
      numero_reingreso: null,
      numero_egreso: null,
      receta_id: null,
      paciente: '',
      medico: '',
      entity_id: filters.value.entity_id, // conserva entidad si ya la habías seteado
    }
  }

  return {
   
    loading,
    error,
    reingresos,
    filters,
   
    hasData,
    rowsFlat,
    blocks,
    totals,
 
    fetchReport,
    reset,
  }
})
