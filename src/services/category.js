import api from './api'

// Obtener todas las categorías
export const getAll = () => {
  return api.get('/categories')
}

// Crear una nueva categoría
export const create = (payload) => {
  return api.post('/categories', payload)
}

// Actualizar una categoría existente
export const update = (id, payload) => {
  return api.put(`/categories/${id}`, payload)
}

// Eliminar una categoría (anulación definitiva en tu controlador)
export const destroy = (id) => {
  return api.delete(`/categories/${id}`)
}

// Obtener una sola categoría por ID
export const getById = (id) => {
  return api.get(`/categories/${id}`)
}
