import api from './api'

// Obtener todos los medicamentos
export const getAll = () => {
  return api.get('/medicines')
}

// Crear un nuevo medicamento
export const create = (payload) => {
  return api.post('/medicines', payload)
}

// Actualizar un medicamento existente
export const update = (id, payload) => {
  return api.put(`/medicines/${id}`, payload)
}

// Eliminar (anular) un medicamento
export const destroy = (id) => {
  return api.delete(`/medicines/${id}`)
}

// Obtener un solo medicamento por ID (opcional, por si lo necesitas)
export const getById = (id) => {
  return api.get(`/medicines/${id}`)
}
