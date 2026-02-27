// services/documentType.js
import api from './api'
export const getAll = (params) => {
  return api.get('/documentTypes', { params })
}

export const getById = (id) => {
  return api.get(`/documentTypes/${id}`)
}

export const create = (payload) => {
  return api.post('/documentTypes', payload)
}

export const update = (id, payload) => {
  return api.put(`/documentTypes/${id}`, payload)
}

export const remove = (id) => {
  return api.delete(`/documentTypes/${id}`)
}


