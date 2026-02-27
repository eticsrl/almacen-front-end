import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchMedicos } from '@/services/afiliacion/listarMedicos'

export const useMedicoStore = defineStore('medico', () => {
  const medicos = ref([])   // objetos normalizados
  const loading = ref(false)
  const error   = ref(null)

  const buildLabel = (r) => {
    const esp  = r.subespecialidad || r.especialidad || ''
    const site = r.lugar_atencion ? ` — ${r.lugar_atencion}` : ''
    // si el backend ya trae label lo respetamos
    return (r.label || `${r.nombre_completo || ''} — ${esp}${site}`).trim()
  }

  const getMedicos = async (entidadId) => {
    loading.value = true; error.value = null
    try {
      const res = await fetchMedicos(entidadId)
      const raw = Array.isArray(res?.data?.medicos) ? res.data.medicos
                : Array.isArray(res?.data)          ? res.data
                : Array.isArray(res)                ? res
                : []

      // Normaliza pensando en medesp_id como value del select
      const mapped = raw.map(r => {
        const medespId = Number(r.medesp_id ?? r.id)          // id de médico-especialidad
        return {
          value: medespId,                     // para el <el-select>
          label: buildLabel(r),                // texto visible
          medico_id: Number(r.medico_id ?? 0),
          medesp_id: medespId,
          especialidad_id: Number(r.subesp_id ?? r.especialidad_id ?? 0),
          nombre_completo: r.nombre_completo || '',
          especialidad: r.subespecialidad || r.especialidad || '',
          lugar_atencion: r.lugar_atencion || '',
          telefono: r.telefono || '',
        }
      })

      // dedup por value (por si backend devuelve duplicados)
      const uniq = new Map()
      for (const it of mapped) if (!uniq.has(it.value)) uniq.set(it.value, it)
      medicos.value = [...uniq.values()]
    } catch (e) {
      error.value = e
      medicos.value = []
    } finally {
      loading.value = false
    }
  }

  // Conveniencia: lista directa para el select
  const medicoOptions = computed(() => medicos.value.map(m => ({
    value: m.value,
    label: m.label,
  })))

  return { medicos, medicoOptions, loading, error, getMedicos }
})
