import api from './api'

// Obtener todos los service_personals
export const getAll = () => {
  return api.get('/service-personals')
}

// Crear un nuevo service_personal
export const create = (payload) => {
  return api.post('/service-personals', payload)
}

// Actualizar un service_personal existente
export const update = (id, payload) => {
  return api.put(`/service-personals/${id}`, payload)
}

// Eliminar (anular) un service_personal
export const destroy = (id) => {
  return api.delete(`/service-personals/${id}`)
}

// Obtener un solo service_personal por ID (opcional)
export const getById = (id) => {
  return api.get(`/service-personals/${id}`)
}
