// src/services/inventoryReport.js
import api from '@/services/api'
import dayjs from 'dayjs'

// Backend: GET /api/v1/reportes/inventario/resumen
const ENDPOINT = '/reportes/inventario/resumen'

// Normaliza params: acepta { desde, hasta } o { rango:[desde,hasta] } y entity_id
function normalize(params = {}) {
  const p = { ...params }

  // Permitir rango tipo ElementPlus date-range
  if (Array.isArray(p.rango)) {
    const [start, end] = p.rango
    if (start) p.desde = dayjs(start).format('YYYY-MM-DD')
    if (end)   p.hasta = dayjs(end).format('YYYY-MM-DD')
    delete p.rango
  }

  if (p.desde) p.desde = dayjs(p.desde).format('YYYY-MM-DD')
  if (p.hasta) p.hasta = dayjs(p.hasta).format('YYYY-MM-DD')

  // entity_id opcional
  if (p.entity_id == null || p.entity_id === '') delete p.entity_id

  return p
}

/**
 * Resumen de movimiento físico valorado
 * Respuesta:
 * {
 *   meta: { desde, hasta, entity_id, generado_en, totales: {...} },
 *   data: [
 *     {
 *       medicamento_id, liname, descripcion, presentacion,
 *       saldo_ini_cantidad, saldo_ini_valor,
 *       ingresos_cantidad, ingresos_valor,
 *       egresos_cantidad, egresos_valor,
 *       saldo_fin_cantidad, saldo_fin_valor
 *     }, ...
 *   ]
 * }
 */
export const getInventarioResumen = (params = {}) =>
  api.get('/reportes/inventario/resumen', { params: normalize(params) })

// (Opcional) Si luego expones el endpoint de movimientos/kardex en rutas:
// const MOVS = '/reportes/inventario/movimientos'
// export const getInventarioMovimientos = (params = {}) =>
//   api.get(MOVS, { params: normalize(params) })
