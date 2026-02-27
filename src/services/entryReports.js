import api from '@/services/api'
import dayjs from 'dayjs'

const ENDPOINT = '/reportes/ingresos-por-fecha'

function toCsv(val) {
  if (val == null) return undefined
  if (Array.isArray(val)) {
    const items = val.map(v => Number(v)).filter(v => Number.isFinite(v) && v > 0)
    return items.length ? items.join(',') : undefined
  }
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : undefined
  if (typeof val === 'string') return val.trim() || undefined
  return undefined
}

function normalize(params = {}) {
  const p = { ...params }

  if (Array.isArray(p.rango)) {
    const [start, end] = p.rango
    if (start) p.desde = dayjs(start).format('YYYY-MM-DD')
    if (end)   p.hasta = dayjs(end).format('YYYY-MM-DD')
    delete p.rango
  }

  if (!p.group) p.group = 'detalle' // detalle|dia|medicamento|documento|proveedor|tipo

  const tipoCsv = toCsv(p.tipo_documento_id)
  if (tipoCsv) p.tipo_documento_id = tipoCsv
  else delete p.tipo_documento_id

  return p
}

export const getIngresosPorFecha = (params = {}) =>
  api.get(ENDPOINT, { params: normalize(params) })

export const getIngresosPorFechaDetalle = (params = {}) =>
  getIngresosPorFecha({ ...params, group: 'detalle' })

export const getIngresosPorFechaPorDia = (params = {}) =>
  getIngresosPorFecha({ ...params, group: 'dia' })

export const getIngresosPorFechaPorMedicamento = (params = {}) =>
  getIngresosPorFecha({ ...params, group: 'medicamento' })

export const getIngresosPorFechaPorDocumento = (params = {}) =>
  getIngresosPorFecha({ ...params, group: 'documento' })

export const getIngresosPorFechaPorProveedor = (params = {}) =>
  getIngresosPorFecha({ ...params, group: 'proveedor' })

export const getIngresosPorFechaPorTipo = (params = {}) =>
  getIngresosPorFecha({ ...params, group: 'tipo' })
