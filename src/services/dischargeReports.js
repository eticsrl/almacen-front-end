// src/services/dischargeReports.js
import api from '@/services/api'
import dayjs from 'dayjs'

const ENDPOINT = '/reportes/egresos-por-fecha'

// Normaliza params: acepta { desde, hasta } o { rango:[desde,hasta] }
function toCsv(val) {
    if (val == null) return undefined
    if (Array.isArray(val)) {
      const items = val
        .map(v => Number(v))
        .filter(v => Number.isFinite(v) && v > 0)
      return items.length ? items.join(',') : undefined
    }
    if (typeof val === 'number') return Number.isFinite(val) ? String(val) : undefined
    if (typeof val === 'string') return val.trim() || undefined
    return undefined
  }
function normalize(params = {}) {
    const p = { ...params }
  
    // fechas
    if (Array.isArray(p.rango)) {
      const [start, end] = p.rango
      if (start) p.desde = dayjs(start).format('YYYY-MM-DD')
      if (end)   p.hasta = dayjs(end).format('YYYY-MM-DD')
      delete p.rango
    }
  
    // agrupación
    if (!p.group) p.group = 'detalle' // detalle | dia | medicamento | documento | servicio | tipo
  
    // filtro por tipo de documento (acepta array, number o CSV y lo manda como CSV)
    const tipoCsv = toCsv(p.tipo_documento_id)
    if (tipoCsv) p.tipo_documento_id = tipoCsv
    else delete p.tipo_documento_id
  
    return p
  }
  

// Genérico (puedes pasar group en params)
export const getEgresosPorFecha = (params = {}) =>
  api.get(ENDPOINT, { params: normalize(params) })

// Atajos por tipo de agrupación
export const getEgresosPorFechaDetalle = (params = {}) =>
  getEgresosPorFecha({ ...params, group: 'detalle' })

export const getEgresosPorFechaPorDia = (params = {}) =>
  getEgresosPorFecha({ ...params, group: 'dia' })

export const getEgresosPorFechaPorMedicamento = (params = {}) =>
  getEgresosPorFecha({ ...params, group: 'medicamento' })

export const getEgresosPorFechaPorDocumento = (params = {}) =>
  getEgresosPorFecha({ ...params, group: 'documento' })

export const getEgresosPorFechaPorServicio = (params = {}) =>
  getEgresosPorFecha({ ...params, group: 'servicio' })
export const getEgresosPorFechaPorTipo = (params = {}) =>
  getEgresosPorFecha({ ...params, group: 'tipo' })
