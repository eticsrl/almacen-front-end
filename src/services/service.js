import api from './api'
// Obtener todos los servicios
export const getAllServices = () => {
  return api.get('/services')
}
// Crear un nuevo servicio
export const createService = (payload) => {
  return api.post('/services', payload)
}
// Actualizar un servicio existente
export const updateService = (id, payload) => {
  return api.put(`/services/${id}`, payload)
}

// Eliminar (anular) un servicio
export const destroyService = (id) => {
  return api.delete(`/services/${id}`)
}
// Obtener un solo servicio por ID
export const getByIdService = (id) => {
  return api.get(`/services/${id}`)
}