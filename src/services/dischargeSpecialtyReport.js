// src/services/egresosEspecialidad.js
import api from '@/services/api'
import dayjs from 'dayjs'


function toCsv (val) {
  if (val == null) return undefined
  if (Array.isArray(val)) {
    const items = val.map(v => (typeof v === 'number' ? v : String(v).trim()))
                     .filter(v => String(v).length)
    return items.length ? items.join(',') : undefined
  }
  return String(val).trim() || undefined
}

function normalize (params = {}) {
  const p = { ...params }

  if (Array.isArray(p.rango)) {
    const [start, end] = p.rango
    if (start) p.desde = dayjs(start).format('YYYY-MM-DD')
    if (end)   p.hasta = dayjs(end).format('YYYY-MM-DD')
    delete p.rango
  }

  const linameCsv  = toCsv(p.liname)
  const medicoCsv  = toCsv(p.medico_id)
  const especCsv   = toCsv(p.especialidad_id)
  if (linameCsv)  p.liname = linameCsv; else delete p.liname
  if (medicoCsv)  p.medico_id = medicoCsv; else delete p.medico_id
  if (especCsv)   p.especialidad_id = especCsv; else delete p.especialidad_id

  return p
}

export const getEgresosPorEspecialidad = (params = {}) =>
  api.get('/reportes/egresos/medicamentos-por-especialidad', { params: normalize(params) })
