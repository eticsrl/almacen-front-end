import api from '@/services/api'

export const getAll = (params = {}) => api.get('/discharges', { params })
export const getById = (id) => api.get(`/discharges/${id}`)
export const create = (payload) => {
  console.log('📤 [Service] Creando discharge con:', payload)
  return api.post('/discharges', payload)
}
export const update = (id, payload) => api.put(`/discharges/${id}`, payload)
export const destroy = (id) => api.delete(`/discharges/${id}`)
export const getRecetasDispensadas = (params = {}) =>
  api.get(`/discharges/recetas-dispensadas`, { params })
export const getEgresosPorReceta = (params = {}) =>
  api.get('/discharges/egresosReceta', { params })
