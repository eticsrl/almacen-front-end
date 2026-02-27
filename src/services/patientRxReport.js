// src/services/patientRxReport.js
import api from '@/services/api'
import dayjs from 'dayjs'

const ENDPOINT = '/reportes/pacientes/medicamentos'

function normalize(p = {}) {
  const q = { ...p }
  if (Array.isArray(q.rango)) {
    const [d, h] = q.rango
    if (d) q.desde = dayjs(d).format('YYYY-MM-DD')
    if (h) q.hasta = dayjs(h).format('YYYY-MM-DD')
    delete q.rango
  }
  if (!q.entity_id) delete q.entity_id
  return q
}

export const getMedicamentosPorPaciente = (params = {}) =>
  api.get(ENDPOINT, { params: normalize(params) })
