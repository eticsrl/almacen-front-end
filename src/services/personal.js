import api from './api'

// Obtener todos los medicamentos
export const getAll = () => {
  return api.get('/personal')
}

// Crear un nuevo medicamento
export const create = (payload) => {
  return api.post('/personal', payload)
}

// Actualizar un medicamento existente
export const update = (id, payload) => {
  return api.put(`/personal/${id}`, payload)
}

// Eliminar (anular) un medicamento
export const destroy = (id) => {
  return api.delete(`/personal/${id}`)
}

// Obtener un solo medicamento por ID (opcional, por si lo necesitas)
export const getById = (id) => {
  return api.get(`/personal/${id}`)
}
