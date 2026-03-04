import api from './api'

// Obtener todos los service_personals
export const getAll = () => {
  return api.get('/servicePersonals')
}

// Crear un nuevo service_personal
export const create = (payload) => {
  return api.post('/servicePersonals', payload)
}

// Actualizar un service_personal existente
export const update = (id, payload) => {
  return api.put(`/servicePersonals/${id}`, payload)
}

// Eliminar (anular) un service_personal
export const destroy = (id) => {
  return api.delete(`/servicePersonals/${id}`)
}

// Obtener un solo service_personal por ID (opcional)
export const getById = (id) => {
  return api.get(`/servicePersonals/${id}`)
}
