import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { getMedicamentosPorPaciente } from '@/services/patientRxReport'

export const usePatientRxReportStore = defineStore('patientRxReport', () => {
  const data = ref([])    // [{ receta_id, paciente, medico, egresos:[{...}] }, ...]
  const meta = ref({ generado_en:null, totales:{ items:0, cantidad:0, valor:0 } })
  const loading = ref(false)
  const error = ref(null)

  const filters = ref({
    paciente: '',
    rango: [],       // [desde, hasta]
    entity_id: null,
  })

  const hasData = computed(() => Array.isArray(data.value) && data.value.length)

  const fetchReport = async (params = {}) => {
    loading.value = true; error.value = null
    try {
      const { data:res } = await getMedicamentosPorPaciente({ ...filters.value, ...params })
      data.value = res?.data ?? []
      meta.value = res?.meta ?? meta.value
      if (meta.value?.desde && meta.value?.hasta) {
        filters.value.rango = [new Date(meta.value.desde), new Date(meta.value.hasta)]
      }
      return data.value
    } catch (e) {
      error.value = e; throw e
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = []
    meta.value = { generado_en:null, totales:{ items:0, cantidad:0, valor:0 } }
    error.value = null
    loading.value = false
    filters.value = { paciente:'', rango:[], entity_id:null }
  }

  const totalItems    = computed(() => meta.value?.totales?.items    ?? 0)
  const totalCantidad = computed(() => meta.value?.totales?.cantidad ?? 0)
  const totalValor    = computed(() => meta.value?.totales?.valor    ?? 0)

  return { data, meta, loading, error, filters, hasData, fetchReport, reset, totalItems, totalCantidad, totalValor }
})
