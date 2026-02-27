
import api from '@/services/api'
import dayjs from 'dayjs'


const ENDPOINT = '/reportes/inventario/resumen/movimientos'

function normalize(params = {}) {
  const p = { ...params }

  // Permite { rango: [desde, hasta] } (Element Plus) o { desde, hasta }
  if (Array.isArray(p.rango)) {
    const [d, h] = p.rango
    if (d) p.desde = dayjs(d).format('YYYY-MM-DD')
    if (h) p.hasta = dayjs(h).format('YYYY-MM-DD')
    delete p.rango
  } else {
    if (p.desde) p.desde = dayjs(p.desde).format('YYYY-MM-DD')
    if (p.hasta) p.hasta = dayjs(p.hasta).format('YYYY-MM-DD')
  }

  // Requerido por el backend
  if (p.medicamento_id == null || p.medicamento_id === '' || Number.isNaN(+p.medicamento_id)) {
    throw new Error('medicamento_id es requerido para consultar el kárdex')
  }
  p.medicamento_id = Number(p.medicamento_id)

  // entity_id es opcional
  if (p.entity_id == null || p.entity_id === '') delete p.entity_id

  return p
}

/**
 * Kárdex de un medicamento
 * Params esperados:
 *  - medicamento_id: number (requerido)
 *  - desde / hasta (YYYY-MM-DD) o rango:[Date,Date]
 *  - entity_id?: number
 *
 * Respuesta (res.data):
 * {
 *   meta: { desde, hasta, entity_id, saldo_inicial: { cantidad, valor } },
 *   data: [
 *     {
 *       fecha, mov: 'INGRESO'|'EGRESO', doc_num, doc_tipo_id, doc_tipo,
 *       obs_calc, contraparte, lote, fecha_venc,
 *       qty, unit_cost, val,                       // movimiento
 *       saldo_cantidad, saldo_valor,               // acumulados
 *       receta_id, paciente, medico, especialidad  // sólo en egreso por receta
 *     }, ...
 *   ]
 * }
 */
export async function getKardexMovimientos(params = {}) {
  const clean = normalize(params)
  const { data } = await api.get(ENDPOINT, { params: clean })
  return data
}
