import api from './api'

export const getAll = () => {
  return api.get('/suppliers')
}

export const getById = (id) => {
  return api.get('/suppliers/${id}')
}

export const create = (payload) => {
  return api.post('/suppliers', payload)
}

export const update = (id, payload) => {
  return api.put('/suppliers/${id}', payload)
}

export const remove = (id) => {
  return api.delete('/suppliers/${id}')
}
