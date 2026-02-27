
import api from '@/services/api'

/**
 * Reingresos por receta (devueltos de egresos)
 * @param {Object} params
 *  - inicio: 'YYYY-MM-DD'
 *  - fin: 'YYYY-MM-DD'
 *  - numero_reingreso?: number
 *  - numero_egreso?: number
 *  - receta_id?: number
 *  - tipo_receta_id?: number[] | string (p.ej. '34,64')
 *  - paciente?: string
 *  - medico?: string
 *  - entity_id?: number
 */
export async function getReingresosPorReceta(params = {}) {
  // Limpieza ligera de params
  const clean = { ...params }
  if (Array.isArray(clean.tipo_receta_id) && !clean.tipo_receta_id.length) {
    delete clean.tipo_receta_id
  }
  if (!clean.paciente) delete clean.paciente
  if (!clean.medico) delete clean.medico
  if (!clean.numero_egreso) delete clean.numero_egreso
  if (!clean.numero_reingreso) delete clean.numero_reingreso
  if (!clean.receta_id) delete clean.receta_id
  if (!clean.entity_id) delete clean.entity_id

  const { data } = await api.get('/reportes/reingresos-por-receta', {
    params: clean,
    // Si quieres que los arrays se envíen como ?tipo_receta_id=34&tipo_receta_id=64,
    // axios ya lo hace por defecto. Si prefieres coma-separado:
    // paramsSerializer: p => {
    //   const q = new URLSearchParams()
    //   Object.entries(p).forEach(([k, v]) => {
    //     if (Array.isArray(v)) q.set(k, v.join(','))
    //     else if (v != null) q.set(k, v)
    //   })
    //   return q.toString()
    // }
  })
  return data
}

/**
 * (Opcional) Ingresos por fecha (tu método porFecha para otros reportes de ingreso)
 */
export async function getIngresosPorFecha(params = {}) {
  const { data } = await api.get('/v1/reportes/ingresos-por-fecha', { params })
  return data
}
